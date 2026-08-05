import {
  Info,
  List,
  Menu,
  Globe,
  Minus,
  Layers,
  Search,
  Square,
  Command,
  Loader2,
  FileText,
  CircleDot,
  ListFilter,
  Maximize2,
  PanelLeft,
  PanelTop,
  AlertCircle,
  ChevronDown,
  CreditCard,
  CheckSquare,
  Navigation,
  ScrollText,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  MousePointer2,
  PanelLeftClose,
  PanelRightOpen,
  SlidersHorizontal,
  TextCursorInput,
  GalleryHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";

export type ComponentPage = {
  id: string;
  name: string;
  path: string;
  icon: ReactNode;
  /** One-line summary, shown on the `/components` index cards. */
  desc: string;
};

/**
 * Every component that has a real page under `/components/*` — the single
 * source of truth for the sidebar AND the `/components` index.
 *
 * Deliberately NOT derived from `public/registry/index.json`: the registry also
 * contains internals (`utils`, `chart-primitives`, `charts-*`, `toaster`, …)
 * that are installable but have no preview page, and a few registry names
 * differ from their route (`tabs` → `/components/tab`). Listing the registry
 * here is what produced 404s. Add an entry when you add a page.
 */
export const COMPONENT_PAGES: ComponentPage[] = [
  { id: "accordion", name: "Accordion", icon: <List size={16} />, path: "/components/accordion", desc: "Vertically stacked, collapsible sections for progressive disclosure." },
  { id: "alert", name: "Alert", icon: <AlertCircle size={16} />, path: "/components/alert", desc: "Inline callouts for status, warnings, and errors." },
  { id: "alert-dialog", name: "Alert Dialog", icon: <AlertTriangle size={16} />, path: "/components/alert-dialog", desc: "Modal confirmation that interrupts and requires a decision." },
  { id: "async-fields", name: "Async Fields", icon: <Globe size={16} />, path: "/components/async-fields", desc: "Form inputs that load their options from an API." },
  { id: "badge", name: "Badge", icon: <Square size={16} />, path: "/components/badge", desc: "Compact labels for status, counts, and categories." },
  { id: "breadcrumb", name: "Breadcrumb", icon: <Navigation size={16} />, path: "/components/breadcrumb", desc: "Hierarchical trail showing where the user is." },
  { id: "button", name: "Button", icon: <MousePointer2 size={16} />, path: "/components/button", desc: "Every variant, size, and state, including loading and icon-only." },
  { id: "card", name: "Card", icon: <CreditCard size={16} />, path: "/components/card", desc: "Surface container with header, content, and footer slots." },
  { id: "carousel", name: "Carousel", icon: <GalleryHorizontal size={16} />, path: "/components/carousel", desc: "Swipeable slides with autoplay and fade options." },
  { id: "checkbox", name: "Checkbox", icon: <CheckSquare size={16} />, path: "/components/checkbox", desc: "Single and grouped checkboxes with indeterminate state." },
  { id: "collapsible", name: "Collapsible", icon: <PanelLeftClose size={16} />, path: "/components/collapsible", desc: "Show and hide a region with animated height." },
  { id: "combobox", name: "Combobox", icon: <ListFilter size={16} />, path: "/components/combobox", desc: "Searchable select with filtering and multi-select." },
  { id: "command", name: "Command", icon: <Command size={16} />, path: "/components/command", desc: "Command palette with keyboard-driven search and groups." },
  { id: "composite-input", name: "Composite Input", icon: <Search size={16} />, path: "/components/composite-input", desc: "Inputs combined with prefixes, suffixes, and addons." },
  { id: "dialog", name: "Dialog", icon: <Layers size={16} />, path: "/components/dialog", desc: "Accessible modal with focus trapping and scroll lock." },
  { id: "dropdown", name: "Dropdown", icon: <ChevronDown size={16} />, path: "/components/dropdown", desc: "Menus with items, sub-menus, checkboxes, and radio groups." },
  { id: "form", name: "Form", icon: <FileText size={16} />, path: "/components/form", desc: "Field, label, description, and error primitives for any stack." },
  { id: "infinite-fields", name: "Infinite Fields", icon: <Loader2 size={16} />, path: "/components/infinite-fields", desc: "Paginated fields that fetch more options as you scroll." },
  { id: "input", name: "Input", icon: <TextCursorInput size={16} />, path: "/components/input", desc: "Text, number, password, and file inputs with states." },
  { id: "menubar", name: "Menubar", icon: <Menu size={16} />, path: "/components/menubar", desc: "Desktop-style horizontal menu bar with nested menus." },
  { id: "navigation-menu", name: "Navigation Menu", icon: <PanelLeft size={16} />, path: "/components/navigation-menu", desc: "Site navigation with rich dropdown panels." },
  { id: "popover", name: "Popover", icon: <Maximize2 size={16} />, path: "/components/popover", desc: "Floating panel anchored to a trigger." },
  { id: "progress", name: "Progress", icon: <Loader2 size={16} />, path: "/components/progress", desc: "Linear and circular progress, determinate or not." },
  { id: "radio", name: "Radio Group", icon: <CircleDot size={16} />, path: "/components/radio", desc: "Mutually exclusive options as classic radios or cards." },
  { id: "scroll-area", name: "Scroll Area", icon: <ScrollText size={16} />, path: "/components/scroll-area", desc: "Styled, cross-browser consistent scroll containers." },
  { id: "select", name: "Select", icon: <ChevronDown size={16} />, path: "/components/select", desc: "Native-feeling select with groups and custom items." },
  { id: "separator", name: "Separator", icon: <Minus size={16} />, path: "/components/separator", desc: "Horizontal and vertical dividers, with optional labels." },
  { id: "sheet", name: "Sheet", icon: <PanelRightOpen size={16} />, path: "/components/sheet", desc: "Drawer that slides in from any edge." },
  { id: "slider", name: "Slider", icon: <SlidersHorizontal size={16} />, path: "/components/slider", desc: "Single value and range sliders with steps and marks." },
  { id: "switch", name: "Switch", icon: <ToggleLeft size={16} />, path: "/components/switch", desc: "Instant on/off toggle for settings." },
  { id: "tabs", name: "Tabs", icon: <PanelTop size={16} />, path: "/components/tab", desc: "Tabbed panels with underline, pill, and boxed styles." },
  { id: "toggle", name: "Toggle", icon: <ToggleRight size={16} />, path: "/components/toggle", desc: "Two-state buttons and toggle groups for toolbars." },
  { id: "tooltip", name: "Tooltip", icon: <Info size={16} />, path: "/components/tooltip", desc: "Hover and focus hints with arrows and placement control." },
];
