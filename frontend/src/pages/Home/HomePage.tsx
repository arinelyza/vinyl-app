import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { ArrowDown, ArrowUp, Plus, EllipsisVertical } from "lucide-react"
import cover from "../../assets/cover.png"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useNavigate } from "react-router-dom"
import { CreateAlbumModal } from "../../components/createAlbum/CreateAlbumModal"
import EditAlbumModal from "../../components/createAlbum/EditAlbumModal"
import { CreateAlbumPayload } from "../../components/createAlbum/types"
import { ImportAlbum, DeleteAlbum } from "../../../wailsjs/go/services/ImportService";
import { GetImageFileURL } from "../../../wailsjs/go/main/App";
import { GetAllVinyls, UpdateVinyl } from "../../../wailsjs/go/services/LibraryService";
import { models } from "../../../wailsjs/go/models";

type SortingMode = "recent" | "alphabetical";

export function HomePage() {
  const [sortMode, setSortMode] = useState<SortingMode>("alphabetical");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortLoaded, setSortLoaded] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingVinyl, setEditingVinyl] = useState<models.Vinyl | null>(null);
  const [vinyls, setVinyls] = useState<models.Vinyl[]>([]);
  const [coverUrls, setCoverUrls] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const navigate = useNavigate();
  const SORT_STORAGE_KEY = "vinyl-sort-preference";

  useEffect(() => {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { mode?: SortingMode; direction?: "asc" | "desc" };
        if (parsed.mode) setSortMode(parsed.mode);
        if (parsed.direction) setSortDirection(parsed.direction);
      } catch {
       
      }
    }
    setSortLoaded(true);
  }, []);

  useEffect(() => {
    if (!sortLoaded) return;
    localStorage.setItem(
      SORT_STORAGE_KEY,
      JSON.stringify({ mode: sortMode, direction: sortDirection })
    );
  }, [sortMode, sortDirection, sortLoaded]);

  useEffect(() => {
    loadVinyls();
  }, []);

  async function loadVinyls() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await GetAllVinyls();
      setVinyls(data);
    } catch (err) {
      setError("Failed to load albums");
      console.error("Failed to load vinyls:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const sorted = [...vinyls].sort((a, b) => {
    if (sortMode === "alphabetical") {
      const result = a.title.localeCompare(b.title)
      return sortDirection === "asc" ? result : -result
    } else {
      const result = (a.playedAt || 0) - (b.playedAt || 0)
      return sortDirection === "desc" ? result : -result
    }
  });

  function handleSortClick() {
    setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
  }

  function handleEditOpenChange(open: boolean) {
    setOpenEditModal(open);
    if (!open) setEditingVinyl(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateCovers() {
      if (vinyls.length === 0) {
        setCoverUrls({});
        return;
      }

      const entries = await Promise.all(
        vinyls.map(async (v) => {
          if (!v.coverPath) {
            return [v.id, cover] as const;
          }
          try {
            const url = await GetImageFileURL(v.coverPath);
            return [v.id, url] as const;
          } catch (err) {
            console.error("Failed to load cover for vinyl", v.id, err);
            return [v.id, cover] as const;
          }
        })
      );

      if (!cancelled) {
        setCoverUrls(Object.fromEntries(entries) as Record<number, string>);
      }
    }

    hydrateCovers();
    return () => {
      cancelled = true;
    };
  }, [vinyls]);

  async function handleSaveAlbum({ title, artist, tracks, coverPath }: CreateAlbumPayload) {
    try {
      setIsLoading(true);
      setError(null);

      await ImportAlbum(tracks, title, artist || "Unknown", coverPath || "");

      setOpenModal(false);

      await loadVinyls();
    } catch (err) {
      setError("Failed to import album");
      console.error("Failed to import album:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAlbum(id: number) {
    try {
      setIsLoading(true);
      setError(null);
      await DeleteAlbum(id);
      setOpenMenuId(null);
      await loadVinyls();
    } catch (err) {
      console.error("Failed to delete album", err);
      setError("Failed to delete album");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditAlbum(payload: {
    id: number;
    title: string;
    artist: string;
    coverPath: string | null;
  }) {
    try {
      setIsLoading(true);
      setError(null);
      await UpdateVinyl(payload.id, payload.title, payload.artist, payload.coverPath || "");
      await loadVinyls();
    } catch (err) {
      console.error("Failed to update album", err);
      setError("Failed to update album");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5ef] text-[#2c241f] p-10">

      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="text-lg font-serif font-semibold tracking-tight">
          Vinyl Project
        </div>

        <Button
          className="bg-[#f3ece4] text-[#2c241f] hover:bg-[#eae2d9] rounded-full px-5 py-2 shadow-sm transition"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Album
        </Button>
      </header>

      {/* Sorting */}
      <div className="flex items-center mb-8">
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortingMode)}>
          <SelectTrigger className="w-[160px] bg-[#f3ece4] hover:bg-[#eae2d9] text-[#2c241f] border-[#e6e1db] rounded-xl px-4 py-2">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Played</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSortClick} variant="transparent" size="icon">
          {sortDirection === "asc" ? <ArrowDown /> : <ArrowUp />}
        </Button>
      </div>

      {/* Album Grid */}
      <div className="grid gap-8 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        {sorted.map((vinyl) => (
          <Card
            key={vinyl.id}
            onClick={() => navigate("/player", { state: vinyl })}
            onMouseLeave={() => setOpenMenuId(null)}
            className="bg-transparent border-0 shadow-none cursor-pointer group transition transform hover:scale-[1.04] relative"
          >
            <CardContent className="flex flex-col items-center justify-center">
              <button
                className="
                  absolute top-2 right-2
                  p-2 rounded-full
                  bg-[#f8f5ef]/80
                  backdrop-blur-sm
                  text-[#6b5e55]
                  hover:bg-[#f3ece4]
                  hover:text-[#2c241f]
                  opacity-0 group-hover:opacity-100
                  transition-all
                  z-10
                "
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId((prev) => (prev === vinyl.id ? null : vinyl.id));
                }}
              >
                <EllipsisVertical className="w-4 h-4" />
              </button>

              { /* Album Modal Menu */ }
              {openMenuId === vinyl.id && (
                <div
                  className="
                    absolute top-10 right-2
                    bg-[#f8f5ef]
                    border border-[#e6e1db]
                    rounded-lg
                    shadow-md
                    z-10
                    w-32
                    overflow-hidden
                  "
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Edit */}
                  <button
                    className="
                      w-full text-left
                      px-3 py-2
                      text-sm
                      text-[#2c241f]
                      hover:bg-[#f3ece4]
                      transition-colors
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingVinyl(vinyl);
                      setOpenEditModal(true);
                      setOpenMenuId(null);
                    }}
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    className="
                      w-full text-left
                      px-3 py-2
                      text-sm
                      text-[#8f3b2f]
                      hover:bg-[#f3e1de]
                      transition-colors
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAlbum(vinyl.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="aspect-square w-full max-w-[180px] rounded-lg overflow-hidden bg-[#f3ece4]">
                <img src={coverUrls[vinyl.id]} className="object-cover w-full h-full" />
              </div>

              <div className="text-center mt-3 text-md tracking-tight">
                {vinyl.title}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateAlbumModal open={openModal} onOpenChange={setOpenModal} onSave={handleSaveAlbum} />
      <EditAlbumModal
        open={openEditModal}
        onOpenChange={handleEditOpenChange}
        vinyl={editingVinyl}
        onSave={handleEditAlbum}
      />
    </div>
  )
}
