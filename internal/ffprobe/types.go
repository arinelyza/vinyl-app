package ffprobe

import (
	"fmt"
	"strconv"
)

type ProbeData struct {
	Format Format `json:"format"`
}

type Format struct {
	Filename string `json:"filename"`
	Duration string `json:"duration"`
}

// DurationSeconds returns audio duration as float64 seconds.
func (f Format) DurationSeconds() (float64, error) {
	if f.Duration == "" {
		return 0, fmt.Errorf("duration is empty")
	}
	return strconv.ParseFloat(f.Duration, 64)
}
