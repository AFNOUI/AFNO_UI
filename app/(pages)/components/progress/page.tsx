import {
  ProgressLinear,
  ProgressCircular,
  ProgressColoredCircular,
  ProgressRing,
  ProgressSemiCircular,
  ProgressStyled,
  ProgressStep,
  ProgressSystemIndicators,
  ProgressContextualCards,
} from "@/components/lab/progress";

export default function ProgressPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <ProgressLinear />
      <ProgressCircular />
      <ProgressColoredCircular />
      <ProgressRing />
      <ProgressSemiCircular />
      <ProgressStyled />
      <ProgressStep />
      <ProgressSystemIndicators />
      <ProgressContextualCards />
    </div>
  );
}
