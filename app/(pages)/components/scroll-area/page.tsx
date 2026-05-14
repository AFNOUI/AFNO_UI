import {
  ScrollAreaChat,
  ScrollAreaBoth,
  ScrollAreaBasic,
  ScrollAreaCodeBlock,
  ScrollAreaHorizontal,
  ScrollAreaNotifications,
} from "@/components/lab/scroll-area";

export default function ScrollAreaPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-4xl">
      <ScrollAreaBasic />
      <ScrollAreaNotifications />
      <ScrollAreaHorizontal />
      <ScrollAreaCodeBlock />
      <ScrollAreaChat />
      <ScrollAreaBoth />
    </div>
  );
}
