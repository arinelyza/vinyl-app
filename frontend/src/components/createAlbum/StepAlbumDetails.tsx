import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { GetImageFileURL, SelectImageFile } from "../../../wailsjs/go/main/App";

type Props = {
  cover: string | null;
  setCover: (file: string | null) => void;
  title: string;
  setTitle: (s: string) => void;
  artist: string;
  setArtist: (s: string) => void;
  requireTitle?: boolean;
};

export default function StepAlbumDetails({
  cover,
  setCover,
  title,
  setTitle,
  artist,
  setArtist,
  requireTitle = true,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadPreview() {
      if (!cover) {
        setPreview(null);
        return;
      }
      try {
        const url = await GetImageFileURL(cover);
        if (!cancelled) setPreview(url);
      } catch (err) {
        console.error("Failed to preview cover", err);
        if (!cancelled) setPreview(null);
      }
    }
    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [cover]);

  async function handleSelectCover() {
    const selected = await SelectImageFile();
    if (selected) {
      setCover(selected);
    }
  }

  return (
    <div className="space-y-6">

      {/* COVER ART UPLOAD */}
      <div>
        <Label className="font-medium">Cover Art</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Optional – default cover will be used if you skip this.
        </p>

        <div className="flex items-center space-x-6 mt-3">
          {/* Preview Box */}
          <div className="w-32 h-32 bg-[#f3ece4] rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Cover Art Preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="opacity-40 text-sm">No cover</div>
            )}
          </div>

          {/* Upload / Remove Buttons */}
          <div className="flex flex-col space-y-2">
            <Button className="
              w-fit
            bg-[#f3ece4]
            text-[#2c241f]
            hover:bg-[#eae2d9]
              border border-[#e6e1db]
              px-4 py-2
              shadow-none
              transition" 
              variant="outline" 
              onClick={handleSelectCover}
            >
              Select Cover Image
            </Button>

            {cover && (
              <Button
                variant="outline"
                className="
                  w-fit
                  bg-transparent
                text-[#8f3b2f]
                hover:bg-[#f3e1de]
                hover:text-[#8f3b2f]
                  border-none
                  shadow-none
                  px-4 py-2
                  transition
                "
                onClick={() => setCover(null)}
              >
                Remove Cover
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ALBUM TITLE */}
      <div>
        <Label>Album Title{requireTitle ? " *" : ""}</Label>
        <Input
          className="bg-[#f3ece4]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. In Rainbows"
        />
      </div>

      {/* ARTIST NAME */}
      <div>
        <Label>Artist</Label>
        <Input
          className="bg-[#f3ece4]"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="e.g. Radiohead"
        />
      </div>
    </div>
  );
}
