import { Segment, STAGE_LABELS } from "./types";

export function exportCSV(videoName: string, segments: Segment[]) {
  const header = "video_name,label,frame_start,frame_end,scene_number,full_nor_not,pill_color,pill_box,day,time_of_day,Notes";
  const rows = segments
    .sort((a, b) => a.frame_start - b.frame_start)
    .map(s => [
      videoName,
      s.label,
      s.frame_start,
      s.frame_end,
      s.scene_number,
      s.full_nor_not,
      s.pill_color,
      s.pill_box,
      s.day,
      s.time_of_day,
      `"${(s.notes || "").replace(/"/g, '""')}"`,
    ].join(","));

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${videoName || "export"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
