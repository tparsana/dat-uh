import { Segment } from "./types";

const STORAGE_KEY = "datuh_data";

interface StoredData {
  participantId: string;
  videoName: string;
  segments: Segment[];
}

export function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        participantId: parsed.participantId ?? "",
        videoName: parsed.videoName ?? "",
        segments: parsed.segments ?? [],
      };
    }
  } catch {}
  return { participantId: "", videoName: "", segments: [] };
}

export function saveData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
