package main

import (
	"context"
	"vinyl/backend/db"
	"vinyl/backend/services"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	db.InitDB()
}

func (a *App) SelectAudioFiles() ([]string, error) {
	files, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select audio files",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Audio Files",
				Pattern:     "*.mp3;*.wav;*.flac;*.m4a;*.aac;*.ogg;*.opus;*.aiff;*.aif;*.wma;*.ape;*.caf;*.mka",
			},
		},
	})
	return files, err
}

func (a *App) SelectImageFile() (string, error) {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select cover image",
		Filters: []runtime.FileFilter{
			{DisplayName: "Images", Pattern: "*.png;*.jpg;*.jpeg;*.webp"},
		},
	})
	return file, err
}

func (a *App) GetImageFileURL(filePath string) (string, error) {
	return services.GetImageFileURL(filePath)
}

func (a *App) GetAudioFileURL(filePath string) (string, error) {
	return services.GetAudioFileURL(filePath)
}
