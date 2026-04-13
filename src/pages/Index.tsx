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
import { Download, Trash2 } from "lucide-react";

export default function Index() {
  const [videoName, setVideoName] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editing, setEditing] = useState<Segment | null>(null);

  // Load from localStorage
  useEffect(() => {
    const data = loadData();
    setVideoName(data.videoName);
    setSegments(data.segments);
  }, []);

  // Auto-save
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
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground">dat-uh</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {segments.length} segment{segments.length !== 1 ? "s" : ""}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Video name */}
        <div className="mb-6 max-w-md">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Video Name</label>
          <Input
            value={videoName}
            onChange={e => setVideoName(e.target.value)}
            placeholder="Enter video filename…"
            className="font-mono"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Left: Form */}
          <div className="bg-card rounded-lg border border-border p-5 self-start lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold text-foreground mb-4">
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
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">No segments yet</p>
                <p className="text-sm max-w-xs">Enter a video name, then log segments with frame numbers. Export to CSV when done.</p>
              </div>
            ) : (
              <>
                <Timeline segments={segments} onSelect={setEditing} />
                <SegmentTable
                  segments={segments}
                  onEdit={setEditing}
                  onDelete={deleteSegment}
                  selectedId={editing?.id ?? null}
                />
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => exportCSV(videoName, segments)}
                    disabled={!videoName}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="destructive" onClick={handleClearAll}>
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
