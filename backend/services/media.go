package services

import (
	"encoding/base64"
	"fmt"
	"mime"
	"os"
	"path/filepath"
	"strings"
)

func GetAudioFileURL(filePath string) (string, error) {
	return getFileDataURL(filePath, []string{"audio/"})
}

func GetImageFileURL(filePath string) (string, error) {
	return getFileDataURL(filePath, []string{"image/"})
}

func getFileDataURL(filePath string, allowedMimePrefixes []string) (string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}

	ext := strings.ToLower(filepath.Ext(filePath))
	mimeType := mime.TypeByExtension(ext)
	if mimeType == "" {
		return "", fmt.Errorf("unsupported file type: %s", ext)
	}

	if len(allowedMimePrefixes) > 0 {
		valid := false
		for _, prefix := range allowedMimePrefixes {
			if strings.HasPrefix(mimeType, prefix) {
				valid = true
				break
			}
		}
		if !valid {
			return "", fmt.Errorf("unsupported mime type: %s", mimeType)
		}
	}

	encoded := base64.StdEncoding.EncodeToString(data)
	return fmt.Sprintf("data:%s;base64,%s", mimeType, encoded), nil
}
