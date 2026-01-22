import { useCallback } from "react";
import { createPortal } from "react-dom";
import { Label } from "../ui/label";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { SelectAudioFiles } from "../../../wailsjs/go/main/App";

type Props = {
  tracks: string[];
  setTracks: (paths: string[]) => void;
};

export default function StepUploadTracks({ tracks, setTracks }: Props) {
  const getFileName = (path: string) => path.split(/[\\/]/).pop() ?? path;

  async function handleSelectTracks() {
    const result = await SelectAudioFiles();
    if (result && Array.isArray(result)) {
      setTracks([...tracks, ...result]);
    }
  }

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const updated = Array.from(tracks);
      const [moved] = updated.splice(result.source.index, 1);
      updated.splice(result.destination.index, 0, moved);

      setTracks(updated);
    },
    [tracks, setTracks]
  );

  const dropzoneClass =
    "border border-dashed rounded-xl p-10 text-center cursor-pointer bg-[#f3ece4] hover:bg-[#eee6dd] transition";

  return (
    <div className="space-y-6">

      {/* UPLOAD AREA */}
      <div>
        <Label className="font-medium">Audio Files *</Label>

        <div
          className={dropzoneClass}
          onClick={handleSelectTracks}
        >
          <div className="text-[#2c241f] font-serif">🎵 Click to choose audio files</div>
        </div>
      </div>

      {/* TRACK LIST */}
      {tracks.length > 0 && (
        <div className="space-y-3">
          <div className="font-medium text-sm">Tracks ({tracks.length}):</div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="trackList">
              {(provided) => (
                <div
                  className="space-y-2"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {tracks.map((track, index) => (
                    <Draggable
                      key={track + index}
                      draggableId={track + index}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        const content = (
                          <div
                            className={`flex items-center justify-between bg-[#f3ece4] p-3 rounded-lg shadow-sm ${
                              snapshot.isDragging ? "shadow-md scale-[1.02]" : ""
                            } transition`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              zIndex: snapshot.isDragging ? 1000 : "auto",
                            }}
                          >
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-[#2c241f] mr-3"
                            >
                              ☰
                            </div>

                            {/* Track Name */}
                            <div className="flex-1 text-sm truncate text-[#2c241f]">
                              {getFileName(track)}
                            </div>

                            {/* Remove */}
                            <button
                              className="text-red-500 text-sm ml-3"
                              onClick={() =>
                                setTracks(tracks.filter((_, i) => i !== index))
                              }
                            >
                              ×
                            </button>
                          </div>
                        );

                        if (snapshot.isDragging && typeof document !== "undefined") {
                          return createPortal(content, document.body);
                        }
                        return content;
                      }}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}
