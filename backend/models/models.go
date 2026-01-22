package models

type Vinyl struct {
	ID        int64  `json:"id"`
	Title     string `json:"title"`
	Artist    string `json:"artist"`
	CoverPath string `json:"coverPath"`
	PlayedAt  int64  `json:"playedAt"`
	Discs     []Disc `json:"discs"`
}

type Disc struct {
	ID      int64   `json:"id"`
	VinylID int64   `json:"vinyl_id"`
	Number  int     `json:"number"`
	Tracks  []Track `json:"tracks"`
}

type Track struct {
	ID       int64   `json:"id"`
	DiscID   int64   `json:"disc_id"`
	Title    string  `json:"title"`
	FilePath string  `json:"file_path"`
	Duration float64 `json:"duration"`
	Order    int     `json:"order"`
}
