import {
  SeparatorBasic,
  SeparatorHorizontal,
  SeparatorVertical,
  SeparatorNavigation,
  SeparatorWithLabel,
  SeparatorProfileCard,
  SeparatorFormSection,
  SeparatorFooter,
} from "@/components/lab/separator";

export default function SeparatorPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <SeparatorBasic />
      <SeparatorHorizontal />
      <SeparatorVertical />
      <SeparatorNavigation />
      <SeparatorWithLabel />
      <SeparatorProfileCard />
      <SeparatorFormSection />
      <SeparatorFooter />
    </div>
  );
}
