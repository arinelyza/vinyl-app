package db

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB() {
	var err error

	dbPath, err := resolveDBPath()
	if err != nil {
		log.Fatal("Can't resolve DB path:", err)
	}

	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal("Can't open the DB:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("DB conection error:", err)
	}

	createTables()
}

func resolveDBPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	appDir := filepath.Join(configDir, "vinyl")
	if err := os.MkdirAll(appDir, 0o755); err != nil {
		return "", err
	}

	return filepath.Join(appDir, "vinyl.db"), nil
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS vinyls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            artist TEXT,
            cover_path TEXT DEFAULT '',
            played_at INTEGER DEFAULT 0
        );`,
		`CREATE TABLE IF NOT EXISTS discs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vinyl_id INTEGER,
            number INTEGER
        );`,
		`CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            disc_id INTEGER,
            title TEXT,
            file_path TEXT,
            duration REAL,
            ordering INTEGER
        );`,
	}

	for _, q := range queries {
		_, err := DB.Exec(q)
		if err != nil {
			log.Fatal("Migration error:", err)
		}
	}
}
