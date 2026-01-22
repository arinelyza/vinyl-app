import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import StepUploadTracks from "./StepUploadTracks";
import StepAlbumDetails from "./StepAlbumDetails";
import { CreateAlbumPayload } from "./types";
import { Spinner } from "../ui/spinner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateAlbumPayload) => void | Promise<void>;
};

export function CreateAlbumModal({ open, onOpenChange, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [tracks, setTracks] = useState<string[]>([]);
  const [cover, setCover] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleNext() {
    if (step === 1 && tracks.length === 0) {
      return;
    }
    setStep(2);
  }

  function handleBack() {
    setStep(1);
  }

  async function handleSave() {
    if (!title.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave({ title, artist, coverPath: cover, tracks });
      setIsSaving(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save album", err);
    }
  }

  function resetForm() {
    setStep(1);
    setTracks([]);
    setCover(null);
    setTitle("");
    setArtist("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f8f5ef] text-[#2c241f] w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            {step === 1 ? "Album Folder" : "Album Details"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <StepUploadTracks tracks={tracks} setTracks={setTracks} />
        )}

        {step === 2 && (
          <StepAlbumDetails
            cover={cover}
            setCover={setCover}
            title={title}
            setTitle={setTitle}
            artist={artist}
            setArtist={setArtist}
          />
        )}

        <div className="flex justify-between mt-6">
          {step === 2 && (
            <Button className="
              bg-transparent
            text-[#6b5e55]
            hover:text-[#2c241f]
            hover:bg-[#f3ece4]
            active:bg-[#eae2d9]
              border-none
              shadow-none
              rounded-md
              transition-colors" 
              onClick={handleBack}
            >
              ← Back
            </Button>
          )}

          {step === 1 && (
            <Button
              onClick={handleNext}
              className="ml-auto bg-[#2c241f] hover:bg-[#3a302a] text-[#f8f5ef]"
              disabled={tracks.length === 0}
            >
              Next →
            </Button>
          )}

          {step === 2 && (
            (
              <Button
                onClick={handleSave}
                className="ml-auto bg-[#2c241f] hover:bg-[#3a302a] text-[#f8f5ef]"
                disabled={isSaving || title.trim().length === 0}
              >
                {isSaving ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Vinyl"
                )}
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
