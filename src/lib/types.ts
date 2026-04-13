export interface Segment {
  id: string;
  label: number;
  frame_start: number;
  frame_end: number;
  scene_number: number;
  full_nor_not: string;
  pill_color: string;
  pill_box: string;
  day: string;
  time_of_day: string;
  notes: string;
}

export const STAGE_MAP: Record<string, number> = {
  "Background": 0,
  "Opening box": 1,
  "Taking pill": 2,
  "Pill to mouth": 3,
  "Closing box": 4,
};

export const STAGE_LABELS: string[] = [
  "Background",
  "Opening box",
  "Taking pill",
  "Pill to mouth",
  "Closing box",
];

export const STAGE_COLORS: Record<number, string> = {
  0: "bg-stage-bg",
  1: "bg-stage-open",
  2: "bg-stage-pill",
  3: "bg-stage-mouth",
  4: "bg-stage-close",
};

export const STAGE_CSS_COLORS: Record<number, string> = {
  0: "var(--stage-bg)",
  1: "var(--stage-open)",
  2: "var(--stage-pill)",
  3: "var(--stage-mouth)",
  4: "var(--stage-close)",
};
