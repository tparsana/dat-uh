import { useCallback, useEffect, useMemo, useState } from "react";
import { Segment } from "@/lib/types";
import { loadData, saveData, clearData } from "@/lib/storage";
import { exportCSV } from "@/lib/csv";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SegmentForm } from "@/components/SegmentForm";
import { SegmentTable } from "@/components/SegmentTable";
import { Timeline } from "@/components/Timeline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Film } from "lucide-react";

export default function Index() {
  const [videoName, setVideoName] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editing, setEditing] = useState<Segment | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    const data = loadData();
    setVideoName(data.videoName);
    setSegments(data.segments);
  }, []);

  useEffect(() => {
    saveData({ videoName, segments });
  }, [videoName, segments]);

  const addSegment = useCallback((seg: Omit<Segment, "id">) => {
    setSegments(prev => [...prev, { ...seg, id: crypto.randomUUID() }]);
  }, []);

  const updateSegment = useCallback((seg: Segment) => {
    setSegments(prev => prev.map(s => s.id === seg.id ? seg : s));
    setEditing(null);
  }, []);

  const deleteSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
    if (editing?.id === id) setEditing(null);
  }, [editing]);

  const handleClearAll = () => {
    setVideoName("");
    setSegments([]);
    setEditing(null);
    setResetSignal(prev => prev + 1);
    clearData();
  };

  const lastSegment = useMemo(() => {
    if (segments.length === 0) return null;

    return [...segments].sort((a, b) => {
      if (a.frame_end !== b.frame_end) return a.frame_end - b.frame_end;
      return a.frame_start - b.frame_start;
    })[segments.length - 1];
  }, [segments]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">dat-uh</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {segments.length} stage entr{segments.length !== 1 ? "ies" : "y"}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Left: Form + Actions */}
          <div className="space-y-4 self-start lg:sticky lg:top-20">
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
              <h2 className="text-base font-bold text-foreground mb-5">
                {editing ? "Edit Stage" : "New Stage"}
              </h2>
              <SegmentForm
                videoName={videoName}
                onVideoNameChange={setVideoName}
                resetSignal={resetSignal}
                onAdd={addSegment}
                onUpdate={updateSegment}
                editing={editing}
                onCancelEdit={() => setEditing(null)}
                lastSegment={lastSegment}
              />
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => exportCSV(videoName, segments)}
                  disabled={!videoName || segments.length === 0}
                  className="rounded-xl w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={!videoName && segments.length === 0}
                      className="rounded-xl w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Fields
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all fields?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the video name and all stage entries from the current session. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAll}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Right: Timeline + Table */}
          <div className="space-y-5 min-w-0">
            {segments.length === 0 ? (
              <div className="rounded-2xl bg-card border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Film className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">No stages yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">Enter a video name, then log stage changes with frame numbers. Export to CSV when done.</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                  <Timeline segments={segments} onSelect={setEditing} />
                </div>
                <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                  <SegmentTable
                    segments={segments}
                    onEdit={setEditing}
                    onDelete={deleteSegment}
                    selectedId={editing?.id ?? null}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <p className="pt-8 text-center text-[10px] text-muted-foreground/20">
          Created Curiosly by{" "}
          <a
            href="https://www.tanishparsana.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-muted-foreground/35"
          >
            Tanish Parsana
          </a>
          .
        </p>
      </main>
    </div>
  );
}
