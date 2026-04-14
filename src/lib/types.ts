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
  "background": 0,
  "open pillcase": 1,
  "pickup pill": 2,
  "release pill": 3,
  "close pillcase": 4,
};

export const STAGE_LABELS: string[] = [
  "background",
  "open pillcase",
  "pickup pill",
  "release pill",
  "close pillcase",
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
