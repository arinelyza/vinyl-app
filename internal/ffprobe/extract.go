package ffprobe

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

func ExtractFFProbe() (string, error) {
	var src string
	var outName string

	switch runtime.GOOS {
	case "darwin":
		src = "darwin/ffprobe"
		outName = "ffprobe"
	case "windows":
		src = "windows/ffprobe.exe"
		outName = "ffprobe.exe"
	default:
		return "", fmt.Errorf("ffprobe not supported on this platform yet")
	}

	data, err := ffprobeFS.ReadFile(src)
	if err != nil {
		return "", err
	}

	dir, err := os.MkdirTemp("", "ffprobe")
	if err != nil {
		return "", err
	}

	out := filepath.Join(dir, outName)

	if err := os.WriteFile(out, data, 0755); err != nil {
		return "", err
	}

	if runtime.GOOS != "windows" {
		_ = os.Chmod(out, 0755)
	}

	return out, nil
}
