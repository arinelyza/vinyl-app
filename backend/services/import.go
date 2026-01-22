package services

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"strings"
	"time"
	"vinyl/backend/db"
	"vinyl/backend/models"
	"vinyl/internal/ffprobe"
)

type ImportService struct{}

type trackMeta struct {
	Index    int
	Path     string
	Title    string
	Duration float64
	Err      error
}

func NewImportService() *ImportService {
	return &ImportService{}
}

func (s *ImportService) probeTracks(trackPaths []string) ([]trackMeta, error) {
	workerCount := 4

	jobs := make(chan int)
	results := make(chan trackMeta)

	// workers
	for w := 0; w < workerCount; w++ {
		go func() {
			for i := range jobs {
				path := trackPaths[i]
				ext := filepath.Ext(path)

				dur, err := ffprobe.GetAudioDuration(path)

				results <- trackMeta{
					Index:    i,
					Path:     path,
					Title:    strings.TrimSuffix(filepath.Base(path), ext),
					Duration: dur,
					Err:      err,
				}
			}
		}()
	}

	go func() {
		for i := range trackPaths {
			jobs <- i
		}
		close(jobs)
	}()

	metas := make([]trackMeta, len(trackPaths))
	for i := 0; i < len(trackPaths); i++ {
		res := <-results
		if res.Err != nil {
			return nil, res.Err
		}
		metas[res.Index] = res
	}

	return metas, nil
}

func (s *ImportService) ImportAlbum(trackPaths []string, title string, artist string, coverPath string) (models.Vinyl, error) {
	tx, err := db.DB.Begin()
	if err != nil {
		return models.Vinyl{}, err
	}
	defer tx.Rollback()

	now := time.Now().Unix()

	// 1) Create vinyl
	res, err := tx.Exec(`
		INSERT INTO vinyls (title, artist, cover_path, played_at)
		VALUES (?, ?, '', ?)
	`, title, artist, now)
	if err != nil {
		return models.Vinyl{}, err
	}
	vinylID, _ := res.LastInsertId()

	// 2) Save cover path (no file copying)
	if strings.TrimSpace(coverPath) != "" {
		_, err = tx.Exec(`UPDATE vinyls SET cover_path = ? WHERE id = ?`, coverPath, vinylID)
		if err != nil {
			return models.Vinyl{}, err
		}
	}

	// 3) Create disc
	res, err = tx.Exec(`INSERT INTO discs (vinyl_id, number) VALUES (?, 1)`, vinylID)
	if err != nil {
		return models.Vinyl{}, err
	}
	discID, _ := res.LastInsertId()

	// 4) Probe tracks (PARALLEL)
	metas, err := s.probeTracks(trackPaths)
	if err != nil {
		return models.Vinyl{}, err
	}

	stmt, err := tx.Prepare(`
		INSERT INTO tracks (disc_id, title, file_path, duration, ordering)
		VALUES (?, ?, ?, ?, ?)
	`)
	if err != nil {
		return models.Vinyl{}, err
	}
	defer stmt.Close()

	for _, m := range metas {
		_, err := stmt.Exec(
			discID,
			m.Title,
			m.Path,
			m.Duration,
			m.Index+1,
		)
		if err != nil {
			return models.Vinyl{}, err
		}
	}

	// 5) Commit
	if err := tx.Commit(); err != nil {
		return models.Vinyl{}, err
	}

	// 6) Fetch vinyl
	lib := NewLibraryService()
	return s.getVinylByID(lib, vinylID)
}

func (s *ImportService) getVinylByID(lib *LibraryService, vinylID int64) (models.Vinyl, error) {
	row := db.DB.QueryRow(`SELECT id, title, artist, cover_path, played_at FROM vinyls WHERE id = ?`, vinylID)

	var v models.Vinyl
	err := row.Scan(&v.ID, &v.Title, &v.Artist, &v.CoverPath, &v.PlayedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Vinyl{}, fmt.Errorf("vinyl with ID %d not found", vinylID)
		}
		return models.Vinyl{}, err
	}

	discs, err := lib.getDiscsForVinyl(v.ID)
	if err != nil {
		return models.Vinyl{}, err
	}
	v.Discs = discs

	return v, nil
}

func (s *ImportService) DeleteAlbum(vinylID int64) error {
	lib := NewLibraryService()
	if _, err := s.getVinylByID(lib, vinylID); err != nil {
		return err
	}

	db.DB.Exec(`DELETE FROM tracks WHERE disc_id IN (SELECT id FROM discs WHERE vinyl_id = ?)`, vinylID)
	db.DB.Exec(`DELETE FROM discs WHERE vinyl_id = ?`, vinylID)
	db.DB.Exec(`DELETE FROM vinyls WHERE id = ?`, vinylID)

	return nil
}

func (s *ImportService) MarkVinylPlayed(vinylID int64) error {
	_, err := db.DB.Exec(`UPDATE vinyls SET played_at = ? WHERE id = ?`, time.Now().Unix(), vinylID)
	return err
}
