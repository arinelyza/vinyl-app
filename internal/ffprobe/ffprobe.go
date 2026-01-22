package ffprobe

import (
	"context"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

func ProbeDuration(ctx context.Context, path string) (float64, error) {
	ffprobePath, err := ExtractFFProbe()
	if err != nil {
		return 0, fmt.Errorf("extract ffprobe: %w", err)
	}

	cmd := exec.CommandContext(
		ctx,
		ffprobePath,
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
		path,
	)

	out, err := cmd.Output()
	if err != nil {
		return 0, fmt.Errorf("ffprobe failed: %w", err)
	}

	durationStr := strings.TrimSpace(string(out))
	if durationStr == "" {
		return 0, fmt.Errorf("ffprobe returned empty duration")
	}

	duration, err := strconv.ParseFloat(durationStr, 64)
	if err != nil {
		return 0, fmt.Errorf("parse duration %q: %w", durationStr, err)
	}

	return duration, nil
}

func GetAudioDuration(path string) (float64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return ProbeDuration(ctx, path)
}
