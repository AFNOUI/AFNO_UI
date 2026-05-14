import {
  PopoverBasic,
  PopoverPositions,
  PopoverDatePicker,
  PopoverForm,
  PopoverSettings,
  PopoverShare,
  PopoverSlider,
} from "@/components/lab/popover";

const components = [
  PopoverBasic,
  PopoverPositions,
  PopoverDatePicker,
  PopoverForm,
  PopoverSettings,
  PopoverShare,
  PopoverSlider,
];

export default function PopoverPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      {components.map((Component, i) => (
        <div key={i} className="relative" style={{ zIndex: components.length - i }}>
          <Component />
        </div>
      ))}
    </div>
  );
}
