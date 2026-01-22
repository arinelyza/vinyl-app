import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import StepAlbumDetails from "./StepAlbumDetails";
import { models } from "../../../wailsjs/go/models";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vinyl: models.Vinyl | null;
  onSave: (payload: {
    id: number;
    title: string;
    artist: string;
    coverPath: string | null;
  }) => void | Promise<void>;
};

export default function EditAlbumModal({
  open,
  onOpenChange,
  vinyl,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!vinyl) {
      setTitle("");
      setArtist("");
      setCover(null);
      return;
    }

    setTitle(vinyl.title || "");
    setArtist(vinyl.artist || "");
    setCover(vinyl.coverPath || null);
  }, [vinyl, open]);

  async function handleSave() {
    if (!vinyl) return;

    try {
      setIsSaving(true);
      await onSave({
        id: vinyl.id,
        title,
        artist,
        coverPath: cover,
      });
      setIsSaving(false);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update album", err);
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f8f5ef] text-[#2c241f] w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Edit Album</DialogTitle>
        </DialogHeader>

        <StepAlbumDetails
          cover={cover}
          setCover={setCover}
          title={title}
          setTitle={setTitle}
          artist={artist}
          setArtist={setArtist}
          requireTitle={false}
        />

        <div className="flex justify-between mt-6">
          <Button
            className="
              bg-transparent
              text-[#6b5e55]
              hover:text-[#2c241f]
              hover:bg-[#f3ece4]
              active:bg-[#eae2d9]
              border-none
              shadow-none
              rounded-md
              transition-colors"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            className="ml-auto bg-[#2c241f] hover:bg-[#3a302a] text-[#f8f5ef]"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
