import {
  NavigationMenuAdvanced,
  NavigationMenuFull,
  NavigationMenuSimple,
  NavigationMenuMega,
} from "@/components/lab/navigation-menu";

const components = [
  NavigationMenuAdvanced,
  NavigationMenuFull,
  NavigationMenuSimple,
  NavigationMenuMega,
];

export default function NavigationMenuPage() {
  return (
    <div className="space-y-8">
      {components.map((Component, i) => (
        <div
          key={i}
          className="relative"
          style={{ zIndex: components.length - i }}
        >
          <Component />
        </div>
      ))}
    </div>
  );
}
