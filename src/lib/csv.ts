import { Segment } from "./types";

function toFileSafePart(value: string) {
  const normalized = value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
  return normalized || "unknown";
}

export function exportCSV(participantId: string, videoName: string, segments: Segment[]) {
  const header = "participant_id,video_name,label,frame_start,frame_end,scene_number,full_nor_not,pill_color,pill_box,day,time_of_day,Notes";
  const rows = segments
    .sort((a, b) => a.frame_start - b.frame_start)
    .map(s => [
      participantId,
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
  const sortedSegments = [...segments].sort((a, b) => a.frame_start - b.frame_start);
  const sceneNumber = sortedSegments[0]?.scene_number?.toString() ?? "unknown";
  a.href = url;
  a.download = `${toFileSafePart(participantId)}_${toFileSafePart(sceneNumber)}_data.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
