package services

import (
	"vinyl/backend/db"
	"vinyl/backend/models"
)

type LibraryService struct{}

func NewLibraryService() *LibraryService {
	return &LibraryService{}
}

func (s *LibraryService) GetAllVinyls() ([]models.Vinyl, error) {
	rows, err := db.DB.Query(`SELECT id, title, artist, cover_path, played_at FROM vinyls`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	vinyls := []models.Vinyl{}

	for rows.Next() {
		var v models.Vinyl
		err := rows.Scan(&v.ID, &v.Title, &v.Artist, &v.CoverPath, &v.PlayedAt)
		if err != nil {
			return nil, err
		}

		discs, err := s.getDiscsForVinyl(v.ID)
		if err != nil {
			return nil, err
		}
		v.Discs = discs

		vinyls = append(vinyls, v)
	}

	return vinyls, nil
}

func (s *LibraryService) UpdateVinyl(vinylID int64, title string, artist string, coverPath string) error {
	_, err := db.DB.Exec(
		`UPDATE vinyls SET title = ?, artist = ?, cover_path = ? WHERE id = ?`,
		title,
		artist,
		coverPath,
		vinylID,
	)
	return err
}

func (s *LibraryService) getDiscsForVinyl(vinylID int64) ([]models.Disc, error) {
	rows, err := db.DB.Query(`SELECT id, number FROM discs WHERE vinyl_id = ?`, vinylID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	discs := []models.Disc{}

	for rows.Next() {
		var d models.Disc
		err := rows.Scan(&d.ID, &d.Number)
		if err != nil {
			return nil, err
		}

		tracks, err := s.getTracksForDisc(d.ID)
		if err != nil {
			return nil, err
		}
		d.Tracks = tracks

		discs = append(discs, d)
	}

	return discs, nil
}

func (s *LibraryService) getTracksForDisc(discID int64) ([]models.Track, error) {
	rows, err := db.DB.Query(`
        SELECT id, title, file_path, duration, ordering
        FROM tracks
        WHERE disc_id = ?
        ORDER BY ordering ASC
    `, discID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tracks := []models.Track{}

	for rows.Next() {
		var t models.Track
		err := rows.Scan(&t.ID, &t.Title, &t.FilePath, &t.Duration, &t.Order)
		if err != nil {
			return nil, err
		}
		tracks = append(tracks, t)
	}

	return tracks, nil
}
