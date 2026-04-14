import { useCallback, useEffect, useRef, useState } from "react";
import { Segment, STAGE_LABELS } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ChevronDown, Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface Props {
  participantId: string;
  onParticipantIdChange: (value: string) => void;
  videoName: string;
  onVideoNameChange: (value: string) => void;
  resetSignal: number;
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
  full_nor_not: "",
  pill_color: "",
  pill_box: "",
  day: "",
  time_of_day: "",
  notes: "",
};

export function SegmentForm({
  participantId,
  onParticipantIdChange,
  videoName,
  onVideoNameChange,
  resetSignal,
  onAdd,
  onUpdate,
  editing,
  onCancelEdit,
  lastSegment,
}: Props) {
  const [form, setForm] = useState<Omit<Segment, "id">>(EMPTY);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const frameStartRef = useRef<HTMLInputElement>(null);
  const frameEndRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      const { id: _id, ...rest } = editing;
      setForm(rest);
      // Open optional fields if any are filled
      if (rest.full_nor_not || rest.pill_color || rest.pill_box || rest.day || rest.time_of_day || rest.notes) {
        setOptionalOpen(true);
      }
    } else if (lastSegment) {
      setForm(prev => ({
        ...prev,
        frame_start: lastSegment.frame_end,
        frame_end: prev.frame_end === prev.frame_start ? lastSegment.frame_end : prev.frame_end,
      }));
    }
  }, [editing, lastSegment]);

  useEffect(() => {
    setForm(EMPTY);
    setOptionalOpen(false);
  }, [resetSignal]);

  const set = useCallback((key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = () => {
    if (editing) {
      onUpdate({ ...form, id: editing.id });
    } else {
      onAdd(form);
      setForm(prev => ({
        ...EMPTY,
        label: prev.label,
        scene_number: prev.scene_number,
        frame_start: form.frame_end,
        frame_end: form.frame_end,
      }));
    }
    frameEndRef.current?.focus();
  };

  const handleDuplicate = () => {
    if (lastSegment) {
      const { id: _id, ...rest } = lastSegment;
      setForm({
        ...rest,
        frame_start: lastSegment.frame_end,
        frame_end: lastSegment.frame_end,
      });
      frameEndRef.current?.focus();
    }
  };

  const handleClear = () => {
    setForm({
      ...EMPTY,
      scene_number: form.scene_number,
      frame_start: lastSegment?.frame_end ?? 0,
      frame_end: lastSegment?.frame_end ?? 0,
    });
    onCancelEdit();
    if (lastSegment) {
      frameEndRef.current?.focus();
    } else {
      frameStartRef.current?.focus();
    }
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
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Participant ID</Label>
        <Input
          value={participantId}
          onChange={e => onParticipantIdChange(e.target.value)}
          placeholder="Enter participant ID..."
          className="font-mono rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Video Name</Label>
        <Input
          value={videoName}
          onChange={e => onVideoNameChange(e.target.value)}
          placeholder="Enter video filename..."
          className="font-mono rounded-xl"
        />
      </div>

      {/* Stage selector */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage</Label>
        <Select value={String(form.label)} onValueChange={v => set("label", Number(v))}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGE_LABELS.map((label, i) => (
              <SelectItem key={i} value={String(i)}>{i} - {label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frame inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frame Start</Label>
          <Input
            ref={frameStartRef}
            type="number"
            min={0}
            value={form.frame_start || ""}
            onChange={e => set("frame_start", Number(e.target.value))}
            placeholder="0"
            className="rounded-xl tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frame End</Label>
          <Input
            ref={frameEndRef}
            type="number"
            min={0}
            value={form.frame_end || ""}
            onChange={e => set("frame_end", Number(e.target.value))}
            placeholder="0"
            className={`rounded-xl tabular-nums ${hasError ? "border-destructive ring-destructive/20 ring-2" : ""}`}
          />
          {hasError && <p className="text-xs text-destructive font-medium">End &lt; Start</p>}
        </div>
      </div>

      {/* Scene number */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scene Number</Label>
        <Input
          type="number"
          min={1}
          value={form.scene_number || ""}
          onChange={e => set("scene_number", Number(e.target.value))}
          className="rounded-xl tabular-nums"
        />
        <p className="text-[11px] text-muted-foreground/70">Participant Video Number</p>
      </div>

      {/* Optional fields - collapsible */}
      <Collapsible open={optionalOpen} onOpenChange={setOptionalOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-4 w-4 transition-transform ${optionalOpen ? "rotate-0" : "-rotate-90"}`} />
            Additional Fields
            <span className="text-xs text-muted-foreground/60">(optional)</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-1">
          {/* Full or not */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full or Not</Label>
            <Select value={form.full_nor_not || undefined} onValueChange={v => set("full_nor_not", v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full">Full</SelectItem>
                <SelectItem value="Not Full">Not Full</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pill Color</Label>
              <Input value={form.pill_color} onChange={e => set("pill_color", e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pill Box</Label>
              <Input value={form.pill_box} onChange={e => set("pill_box", e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Day</Label>
              <Input value={form.day} onChange={e => set("day", e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time of Day</Label>
              <Input value={form.time_of_day} onChange={e => set("time_of_day", e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={2}
              className="resize-none rounded-xl"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSubmit} className="flex-1 rounded-xl h-10">
          {editing ? "Update Stage" : "Add Stage"}
        </Button>
        {!editing && lastSegment && (
          <Button variant="secondary" onClick={handleDuplicate} className="rounded-xl h-10">
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Duplicate
          </Button>
        )}
        <Button variant="ghost" onClick={handleClear} className="rounded-xl h-10">
          Clear
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground/60 text-center">Enter to add • Tab to navigate</p>
    </div>
  );
}
