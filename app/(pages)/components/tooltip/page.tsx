import {
  TooltipBasic,
  TooltipArrows,
  TooltipPositions,
  TooltipStyled,
  TooltipRichContent,
  TooltipToolbar,
  TooltipShortcuts,
  TooltipStatusIndicators,
} from "@/components/lab/tooltip";

export default function TooltipPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <TooltipBasic />
      <TooltipArrows />
      <TooltipPositions />
      <TooltipStyled />
      <TooltipRichContent />
      <TooltipToolbar />
      <TooltipShortcuts />
      <TooltipStatusIndicators />
    </div>
  );
}
