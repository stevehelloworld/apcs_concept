"use client";

import type { VisualizerType } from "@/lib/types";
import { AlgoRaceVisualizer } from "./AlgoRaceVisualizer";
import { ArrayGridVisualizer } from "./ArrayGridVisualizer";
import { IntervalBranchVisualizer } from "./IntervalBranchVisualizer";
import { RangeLoopVisualizer } from "./RangeLoopVisualizer";
import { RecursionStackVisualizer } from "./RecursionStackVisualizer";

export function TopicVisualizerHost({ type }: { type: VisualizerType }) {
  switch (type) {
    case "interval-branch":
      return <IntervalBranchVisualizer />;
    case "range-loop":
      return <RangeLoopVisualizer />;
    case "array-grid":
      return <ArrayGridVisualizer />;
    case "recursion-stack":
      return <RecursionStackVisualizer />;
    case "algo-race":
      return <AlgoRaceVisualizer />;
    default:
      return <IntervalBranchVisualizer />;
  }
}
