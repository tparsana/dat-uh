import { Segment } from "./types";

const STORAGE_KEY = "datuh_data";

interface StoredData {
  videoName: string;
  segments: Segment[];
}

export function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { videoName: "", segments: [] };
}

export function saveData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
