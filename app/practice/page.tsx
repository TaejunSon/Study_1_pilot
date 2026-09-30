"use client";
import { TrialScreen } from "@/components/study/TrialScreen";

/** The practice trial is always order 0 and runs the full A -> recommendation -> C -> D flow once. */
export default function PracticePage() {
  return <TrialScreen stage="practice" order={0} />;
}
