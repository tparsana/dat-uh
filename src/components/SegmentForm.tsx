import { useCallback, useEffect, useRef, useState } from "react";
import { Segment, STAGE_LABELS, STAGE_MAP } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props {
  onAdd: (segment: Omit<Segment, "id">) => void;
  onUpdate: (segment: Segment) => void;
  editing: Segment | null;
  onCancelEdit: () => void;
  lastSegment: Segment | null;
}

const EMPTY: Omit<Segment, "id"> = {
  label: 0,
  frame_start: 0,
  frame_end: 0,
  scene_number: 1,
  full_nor_not: "Full",
  pill_color: "",
  pill_box: "",
  day: "",
  time_of_day: "",
  notes: "",
};

export function SegmentForm({ onAdd, onUpdate, editing, onCancelEdit, lastSegment }: Props) {
  const [form, setForm] = useState<Omit<Segment, "id">>(EMPTY);
  const [usePrev, setUsePrev] = useState(true);
  const [autoIncScene, setAutoIncScene] = useState(false);
  const frameStartRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      const { id, ...rest } = editing;
      setForm(rest);
    }
  }, [editing]);

  const set = useCallback((key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = () => {
    if (editing) {
      onUpdate({ ...form, id: editing.id });
    } else {
      onAdd(form);
      // Prepare next entry
      if (usePrev && lastSegment) {
        setForm(prev => ({
          ...prev,
          frame_start: 0,
          frame_end: 0,
          notes: "",
          scene_number: autoIncScene ? prev.scene_number + 1 : prev.scene_number,
        }));
      } else {
        setForm(prev => ({
          ...EMPTY,
          label: prev.label,
          scene_number: autoIncScene ? prev.scene_number + 1 : EMPTY.scene_number,
        }));
      }
    }
    frameStartRef.current?.focus();
  };

  const handleDuplicate = () => {
    if (lastSegment) {
      const { id, ...rest } = lastSegment;
      setForm({
        ...rest,
        scene_number: autoIncScene ? rest.scene_number + 1 : rest.scene_number,
      });
    }
  };

  const handleClear = () => {
    setForm(EMPTY);
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasError = form.frame_end > 0 && form.frame_end < form.frame_start;

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      {/* Stage selector */}
      <div className="space-y-1.5">
        <Label>Stage</Label>
        <Select value={String(form.label)} onValueChange={v => set("label", Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGE_LABELS.map((label, i) => (
              <SelectItem key={i} value={String(i)}>{label} ({i})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frame inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Frame Start</Label>
          <Input
            ref={frameStartRef}
            type="number"
            min={0}
            value={form.frame_start || ""}
            onChange={e => set("frame_start", Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Frame End</Label>
          <Input
            type="number"
            min={0}
            value={form.frame_end || ""}
            onChange={e => set("frame_end", Number(e.target.value))}
            placeholder="0"
            className={hasError ? "border-destructive" : ""}
          />
          {hasError && <p className="text-xs text-destructive">End &lt; Start</p>}
        </div>
      </div>

      {/* Scene number */}
      <div className="space-y-1.5">
        <Label>Scene Number</Label>
        <Input
          type="number"
          min={1}
          value={form.scene_number || ""}
          onChange={e => set("scene_number", Number(e.target.value))}
        />
      </div>

      {/* Full or not */}
      <div className="space-y-1.5">
        <Label>Full or Not</Label>
        <Select value={form.full_nor_not} onValueChange={v => set("full_nor_not", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full">Full</SelectItem>
            <SelectItem value="Not Full">Not Full</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Pill Color</Label>
          <Input value={form.pill_color} onChange={e => set("pill_color", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Pill Box</Label>
          <Input value={form.pill_box} onChange={e => set("pill_box", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Day</Label>
          <Input value={form.day} onChange={e => set("day", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Time of Day</Label>
          <Input value={form.time_of_day} onChange={e => set("time_of_day", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Speed toggles */}
      <div className="flex flex-wrap gap-4 py-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Switch checked={usePrev} onCheckedChange={setUsePrev} />
          Use previous values
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Switch checked={autoIncScene} onCheckedChange={setAutoIncScene} />
          Auto-increment scene
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSubmit} className="flex-1">
          {editing ? "Update Segment" : "Add Segment"}
        </Button>
        {!editing && lastSegment && (
          <Button variant="secondary" onClick={handleDuplicate}>
            Duplicate Last
          </Button>
        )}
        <Button variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">Press Enter to add • Tab to navigate</p>
    </div>
  );
}
