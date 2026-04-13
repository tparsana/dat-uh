import { Segment, STAGE_LABELS } from "@/lib/types";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  segments: Segment[];
  onEdit: (segment: Segment) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}

export function SegmentTable({ segments, onEdit, onDelete, selectedId }: Props) {
  const sorted = [...segments].sort((a, b) => a.frame_start - b.frame_start);

  const overlaps = new Set<string>();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].frame_start < sorted[i].frame_end) {
        overlaps.add(sorted[i].id);
        overlaps.add(sorted[j].id);
      } else break;
    }
  }

  if (sorted.length === 0) return null;

  // Check if any optional columns have data
  const hasOptional = sorted.some(s => 
    s.full_nor_not !== "Full" || s.pill_color || s.pill_box || s.day || s.time_of_day || s.notes
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Label</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">End</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scene</th>
            {hasOptional && (
              <>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Box</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Day</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</th>
              </>
            )}
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(seg => {
            const hasError = seg.frame_end < seg.frame_start;
            const isOverlap = overlaps.has(seg.id);
            const isSelected = seg.id === selectedId;
            return (
              <tr
                key={seg.id}
                className={`border-b border-border/50 transition-colors cursor-pointer
                  ${isSelected ? "bg-primary/8" : "hover:bg-muted/40"}
                  ${hasError ? "bg-destructive/8" : ""}
                  ${isOverlap ? "bg-warning/8" : ""}
                `}
                onClick={() => onEdit(seg)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full bg-stage-${['bg','open','pill','mouth','close'][seg.label]}`} 
                      style={{ backgroundColor: `hsl(var(--stage-${['bg','open','pill','mouth','close'][seg.label]}))` }} />
                    <span className="font-medium">{STAGE_LABELS[seg.label]}</span>
                    <span className="text-muted-foreground">({seg.label})</span>
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums font-medium">{seg.frame_start}</td>
                <td className="px-4 py-3 tabular-nums font-medium">{seg.frame_end}</td>
                <td className="px-4 py-3">{seg.scene_number}</td>
                {hasOptional && (
                  <>
                    <td className="px-4 py-3 text-muted-foreground">{seg.full_nor_not}</td>
                    <td className="px-4 py-3 text-muted-foreground">{seg.pill_color}</td>
                    <td className="px-4 py-3 text-muted-foreground">{seg.pill_box}</td>
                    <td className="px-4 py-3 text-muted-foreground">{seg.day}</td>
                    <td className="px-4 py-3 text-muted-foreground">{seg.time_of_day}</td>
                    <td className="px-4 py-3 max-w-[120px] truncate text-muted-foreground">{seg.notes}</td>
                  </>
                )}
                <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit(seg)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => onDelete(seg.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
