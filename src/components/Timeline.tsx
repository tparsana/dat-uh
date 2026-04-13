import { Segment, STAGE_LABELS } from "@/lib/types";
import { useMemo, useState } from "react";

const COLORS: Record<number, string> = {
  0: "hsl(var(--stage-bg))",
  1: "hsl(var(--stage-open))",
  2: "hsl(var(--stage-pill))",
  3: "hsl(var(--stage-mouth))",
  4: "hsl(var(--stage-close))",
};

interface Props {
  segments: Segment[];
  onSelect: (segment: Segment) => void;
}

export function Timeline({ segments, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { minFrame, maxFrame } = useMemo(() => {
    if (segments.length === 0) return { minFrame: 0, maxFrame: 100 };
    const starts = segments.map(s => s.frame_start);
    const ends = segments.map(s => s.frame_end);
    return {
      minFrame: Math.min(...starts),
      maxFrame: Math.max(...ends),
    };
  }, [segments]);

  const range = maxFrame - minFrame || 1;

  if (segments.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
      <div className="relative h-16 bg-muted rounded-lg overflow-hidden border border-border">
        {segments.map(seg => {
          const left = ((seg.frame_start - minFrame) / range) * 100;
          const width = ((seg.frame_end - seg.frame_start) / range) * 100;
          const isHovered = hoveredId === seg.id;
          return (
            <div
              key={seg.id}
              className="absolute top-2 h-12 rounded cursor-pointer transition-opacity"
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 0.5)}%`,
                backgroundColor: COLORS[seg.label],
                opacity: isHovered ? 1 : 0.8,
              }}
              onMouseEnter={() => setHoveredId(seg.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(seg)}
              title={`${STAGE_LABELS[seg.label]} (${seg.frame_start}–${seg.frame_end})`}
            />
          );
        })}
        {/* Frame labels */}
        <span className="absolute bottom-0 left-1 text-[10px] text-muted-foreground">{minFrame}</span>
        <span className="absolute bottom-0 right-1 text-[10px] text-muted-foreground">{maxFrame}</span>
      </div>
      {hoveredId && (() => {
        const seg = segments.find(s => s.id === hoveredId);
        if (!seg) return null;
        return (
          <p className="text-xs text-muted-foreground">
            {STAGE_LABELS[seg.label]} • Frames {seg.frame_start}–{seg.frame_end} • Scene {seg.scene_number}
          </p>
        );
      })()}
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {STAGE_LABELS.map((label, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
