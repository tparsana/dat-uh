import { useCallback, useEffect, useState } from "react";
import { Segment } from "@/lib/types";
import { loadData, saveData, clearData } from "@/lib/storage";
import { exportCSV } from "@/lib/csv";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SegmentForm } from "@/components/SegmentForm";
import { SegmentTable } from "@/components/SegmentTable";
import { Timeline } from "@/components/Timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2, Film } from "lucide-react";

export default function Index() {
  const [videoName, setVideoName] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editing, setEditing] = useState<Segment | null>(null);

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
    if (confirm("Clear all segments? This cannot be undone.")) {
      setSegments([]);
      setEditing(null);
      clearData();
    }
  };

  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Film className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">dat-uh</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {segments.length} segment{segments.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Video name card */}
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <label className="text-sm font-semibold text-foreground mb-2 block">Video Name</label>
          <Input
            value={videoName}
            onChange={e => setVideoName(e.target.value)}
            placeholder="Enter video filename…"
            className="font-mono max-w-md rounded-xl"
          />
        </div>

        {/* Stats cards */}
        {segments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Segments", value: segments.length, color: "bg-primary/10 text-primary" },
              { label: "Frame Range", value: `${Math.min(...segments.map(s => s.frame_start))}–${Math.max(...segments.map(s => s.frame_end))}`, color: "bg-stage-open/20 text-foreground" },
              { label: "Scenes", value: new Set(segments.map(s => s.scene_number)).size, color: "bg-stage-pill/20 text-foreground" },
              { label: "Stages Used", value: new Set(segments.map(s => s.label)).size, color: "bg-stage-mouth/20 text-foreground" },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl border border-border p-4 shadow-sm bg-card`}>
                <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-xl font-bold tabular-nums ${stat.color.split(' ')[1] || 'text-foreground'}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Left: Form */}
          <div className="rounded-2xl bg-card border border-border p-6 shadow-sm self-start lg:sticky lg:top-20">
            <h2 className="text-base font-bold text-foreground mb-5">
              {editing ? "Edit Segment" : "New Segment"}
            </h2>
            <SegmentForm
              onAdd={addSegment}
              onUpdate={updateSegment}
              editing={editing}
              onCancelEdit={() => setEditing(null)}
              lastSegment={lastSegment}
            />
          </div>

          {/* Right: Timeline + Table */}
          <div className="space-y-5 min-w-0">
            {segments.length === 0 ? (
              <div className="rounded-2xl bg-card border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Film className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">No segments yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">Enter a video name, then log segments with frame numbers. Export to CSV when done.</p>
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
                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => exportCSV(videoName, segments)}
                    disabled={!videoName}
                    className="rounded-xl px-5"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="destructive" onClick={handleClearAll} className="rounded-xl px-5">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
