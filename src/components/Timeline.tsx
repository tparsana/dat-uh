import { Segment, STAGE_LABELS } from "@/lib/types";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  segments: Segment[];
  onSelect: (segment: Segment) => void;
}

interface ChartPoint {
  frame: number;
  stage: number;
  stagePlot: number;
  stageLabel: string;
  segmentId: string;
  segmentStart: number;
  segmentEnd: number;
  sceneNumber: number;
}

const STAGE_SECTION_COLORS: Record<number, string> = {
  0: "hsl(var(--stage-bg))",
  1: "hsl(var(--stage-open))",
  2: "hsl(var(--stage-pill))",
  3: "hsl(var(--stage-mouth))",
  4: "hsl(var(--stage-close))",
};

const chartConfig = {
  stagePlot: {
    label: "Stage",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

function toChartPoint(frame: number, segment: Segment): ChartPoint {
  return {
    frame,
    stage: segment.label,
    stagePlot: segment.label + 1,
    stageLabel: STAGE_LABELS[segment.label] ?? `Stage ${segment.label}`,
    segmentId: segment.id,
    segmentStart: segment.frame_start,
    segmentEnd: segment.frame_end,
    sceneNumber: segment.scene_number,
  };
}

export function Timeline({ segments, onSelect }: Props) {
  const sorted = useMemo(
    () =>
      [...segments].sort((a, b) => {
        if (a.frame_start !== b.frame_start) return a.frame_start - b.frame_start;
        if (a.frame_end !== b.frame_end) return a.frame_end - b.frame_end;
        return a.label - b.label;
      }),
    [segments],
  );

  const chartData = useMemo(() => {
    const points: ChartPoint[] = [];

    sorted.forEach((segment, index) => {
      if (index === 0) {
        points.push(toChartPoint(segment.frame_start, segment));
      }

      points.push(toChartPoint(segment.frame_end, segment));

      const next = sorted[index + 1];
      if (next) {
        points.push(toChartPoint(next.frame_start, next));
      }
    });

    return points.filter((point, index, array) => {
      const previous = array[index - 1];
      return !previous || previous.frame !== point.frame || previous.stage !== point.stage || previous.segmentId !== point.segmentId;
    });
  }, [sorted]);

  const { minFrame, maxFrame, yTicks, xDomain } = useMemo(() => {
    if (sorted.length === 0) {
      return { minFrame: 0, maxFrame: 100, yTicks: [1], xDomain: [0, 100] as [number, number] };
    }

    const min = Math.min(...sorted.map(segment => segment.frame_start));
    const max = Math.max(...sorted.map(segment => segment.frame_end));

    return {
      minFrame: min,
      maxFrame: max,
      yTicks: Array.from({ length: STAGE_LABELS.length }, (_, index) => index + 1),
      xDomain: min === max ? [min - 1, max + 1] as [number, number] : [min, max] as [number, number],
    };
  }, [sorted]);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Stage Graph</h3>
        <span className="text-xs text-muted-foreground">Step area timeline</span>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 12, right: 16, bottom: 8, left: 4 }}
          onClick={(state) => {
            const point = state?.activePayload?.[0]?.payload as ChartPoint | undefined;
            if (!point) return;

            const segment = sorted.find(item => item.id === point.segmentId);
            if (segment) onSelect(segment);
          }}
        >
          <CartesianGrid vertical={false} />
          {sorted.map((segment) => {
            const stagePlot = segment.label + 1;
            const x2 = segment.frame_end === segment.frame_start ? segment.frame_end + 1 : segment.frame_end;

            return (
              <ReferenceArea
                key={segment.id}
                x1={segment.frame_start}
                x2={x2}
                y1={stagePlot - 0.34}
                y2={stagePlot + 0.34}
                ifOverflow="extendDomain"
                fill={STAGE_SECTION_COLORS[segment.label]}
                fillOpacity={0.82}
                stroke={STAGE_SECTION_COLORS[segment.label]}
                strokeOpacity={0.95}
                strokeWidth={1.5}
              />
            );
          })}
          <XAxis
            type="number"
            dataKey="frame"
            domain={xDomain}
            tickCount={6}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => Math.round(value).toString()}
          />
          <YAxis
            type="number"
            domain={[0.5, STAGE_LABELS.length + 0.5]}
            ticks={yTicks}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={32}
            tickFormatter={(value) => String(value - 1)}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  const point = payload?.[0]?.payload as ChartPoint | undefined;
                  if (!point) return `Frame ${value}`;
                  return `Frames ${point.segmentStart}-${point.segmentEnd}`;
                }}
                formatter={(_, __, item) => {
                  const point = item.payload as ChartPoint;

                  return (
                    <div className="flex min-w-[170px] items-center justify-between gap-3">
                      <div className="grid gap-0.5">
                        <span className="text-muted-foreground">Stage {point.stage}</span>
                        <span className="text-foreground">{point.stageLabel}</span>
                      </div>
                      <span className="font-mono text-foreground">Scene {point.sceneNumber}</span>
                    </div>
                  );
                }}
              />
            }
          />
          <Area
            type="stepAfter"
            dataKey="stagePlot"
            stroke="var(--color-stagePlot)"
            fill="transparent"
            strokeWidth={2.5}
            fillOpacity={0}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground tabular-nums">
        <span>{minFrame}</span>
        <span>Frames</span>
        <span>{maxFrame}</span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {STAGE_LABELS.map((label, stage) => (
          <span key={stage} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STAGE_SECTION_COLORS[stage] }}
            />
            <span className="font-medium text-foreground">{stage}</span>
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
