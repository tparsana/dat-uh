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

  // Check for overlaps
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

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Label</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Start</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">End</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Scene</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Full</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Color</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Box</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Day</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Time</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Notes</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Actions</th>
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
                className={`border-b border-border transition-colors
                  ${isSelected ? "bg-primary/10" : "hover:bg-muted/30"}
                  ${hasError ? "bg-destructive/10" : ""}
                  ${isOverlap ? "bg-warning/10" : ""}
                `}
              >
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  {STAGE_LABELS[seg.label]} ({seg.label})
                </td>
                <td className="px-3 py-2 tabular-nums">{seg.frame_start}</td>
                <td className="px-3 py-2 tabular-nums">{seg.frame_end}</td>
                <td className="px-3 py-2">{seg.scene_number}</td>
                <td className="px-3 py-2">{seg.full_nor_not}</td>
                <td className="px-3 py-2">{seg.pill_color}</td>
                <td className="px-3 py-2">{seg.pill_box}</td>
                <td className="px-3 py-2">{seg.day}</td>
                <td className="px-3 py-2">{seg.time_of_day}</td>
                <td className="px-3 py-2 max-w-[120px] truncate">{seg.notes}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(seg)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(seg.id)}>
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
