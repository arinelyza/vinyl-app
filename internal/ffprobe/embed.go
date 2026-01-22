// internal/ffprobe/embed.go
package ffprobe

import "embed"

//go:embed darwin/ffprobe
//go:embed windows/ffprobe.exe
var ffprobeFS embed.FS
