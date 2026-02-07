"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
    ChevronRight, ChevronDown, Menu, Home,
    LayoutDashboard, FormInput, Sparkles, Sun, Moon,
    MousePointer2, CreditCard, List, AlertCircle, Square,
    AlertTriangle, PanelLeft, Image as ImageIcon, FileText,
    CheckSquare, CircleDot, GalleryHorizontal, Layers, Info,
    TextCursorInput, ToggleLeft, SlidersHorizontal, PanelTop,
    Command, ListFilter, Navigation, PanelLeftClose, Maximize2,
    Loader2, ScrollText, Minus, PanelRightOpen, ToggleRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const NAV_SECTIONS = [
    {
        title: "Pages",
        items: [
            { id: "home", name: "UI Lab", icon: <Home size={16} />, path: "/" },
            { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/dashboard" },
            { id: "forms", name: "Form Variants", icon: <FormInput size={16} />, path: "/forms" },
            { id: "form-builder", name: "Form Builder", icon: <FileText size={16} />, path: "/form-builder" },
            { id: "galleries", name: "Galleries", icon: <ImageIcon size={16} />, path: "/galleries" },
        ],
    },
    {
        title: "Components",
        items: [
            { id: "accordion", name: "Accordion", icon: <List size={16} />, path: "/components/accordion" },
            { id: "alert", name: "Alert", icon: <AlertCircle size={16} />, path: "/components/alert" },
            { id: "alert-dialog", name: "Alert Dialog", icon: <AlertTriangle size={16} />, path: "/components/alert-dialog" },
            { id: "badge", name: "Badge", icon: <Square size={16} />, path: "/components/badge" },
            { id: "breadcrumb", name: "Breadcrumb", icon: <Navigation size={16} />, path: "/components/breadcrumb" },
            { id: "button", name: "Button", icon: <MousePointer2 size={16} />, path: "/components/button" },
            { id: "card", name: "Card", icon: <CreditCard size={16} />, path: "/components/card" },
            { id: "carousel", name: "Carousel", icon: <GalleryHorizontal size={16} />, path: "/components/carousel" },
            { id: "checkbox", name: "Checkbox", icon: <CheckSquare size={16} />, path: "/components/checkbox" },
            { id: "collapsible", name: "Collapsible", icon: <PanelLeftClose size={16} />, path: "/components/collapsible" },
            { id: "combobox", name: "Combobox", icon: <ListFilter size={16} />, path: "/components/combobox" },
            { id: "command", name: "Command", icon: <Command size={16} />, path: "/components/command" },
            { id: "dialog", name: "Dialog", icon: <Layers size={16} />, path: "/components/dialog" },
            { id: "dropdown", name: "Dropdown", icon: <ChevronDown size={16} />, path: "/components/dropdown" },
            { id: "input", name: "Input", icon: <TextCursorInput size={16} />, path: "/components/input" },
            { id: "menubar", name: "Menubar", icon: <Menu size={16} />, path: "/components/menubar" },
            { id: "navigation-menu", name: "Navigation Menu", icon: <PanelLeft size={16} />, path: "/components/navigation-menu" },
            { id: "popover", name: "Popover", icon: <Maximize2 size={16} />, path: "/components/popover" },
            { id: "progress", name: "Progress", icon: <Loader2 size={16} />, path: "/components/progress" },
            { id: "radio", name: "Radio Group", icon: <CircleDot size={16} />, path: "/components/radio" },
            { id: "scroll-area", name: "Scroll Area", icon: <ScrollText size={16} />, path: "/components/scroll-area" },
            { id: "select", name: "Select", icon: <ChevronDown size={16} />, path: "/components/select" },
            { id: "separator", name: "Separator", icon: <Minus size={16} />, path: "/components/separator" },
            { id: "sheet", name: "Sheet", icon: <PanelRightOpen size={16} />, path: "/components/sheet" },
            { id: "slider", name: "Slider", icon: <SlidersHorizontal size={16} />, path: "/components/slider" },
            { id: "switch", name: "Switch", icon: <ToggleLeft size={16} />, path: "/components/switch" },
            { id: "tabs", name: "Tabs", icon: <PanelTop size={16} />, path: "/components/tab" },
            { id: "toggle", name: "Toggle", icon: <ToggleRight size={16} />, path: "/components/toggle" },
            { id: "tooltip", name: "Tooltip", icon: <Info size={16} />, path: "/components/tooltip" },
        ],
    },
];

function SidebarContent() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [openSections, setOpenSections] = useState<string[]>(["Pages", "Components"]);

    const toggleSection = (title: string) => {
        setOpenSections((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight">UI Lab</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        Component System
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1">
                <nav className="space-y-4 pr-3">
                    {NAV_SECTIONS.map((section) => (
                        <Collapsible
                            key={section.title}
                            open={openSections.includes(section.title)}
                            onOpenChange={() => toggleSection(section.title)}
                        >
                            <CollapsibleTrigger className="flex items-center gap-1 px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-full">
                                {openSections.includes(section.title) ? (
                                    <ChevronDown size={12} />
                                ) : (
                                    <ChevronRight size={12} />
                                )}
                                {section.title}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.path}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <span className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </nav>
            </ScrollArea>

            {/* Theme Toggle */}
            <div className="pt-4 mt-4 border-t border-border">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all"
                >
                    <div className="flex items-center gap-3">
                        {theme === "dark" ? (
                            <Sun size={16} className="text-amber-500" />
                        ) : (
                            <Moon size={16} className="text-primary" />
                        )}
                        <span className="text-xs font-medium">
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen flex w-full bg-background">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 min-w-[256px] flex-col p-4 shrink-0 border-r border-border bg-card">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="w-72 p-4">
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile Header */}
                    <header className="lg:hidden flex items-center h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="p-2"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={18} />
                        </Button>
                        <span className="ml-3 font-semibold">UI Lab</span>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AppLayoutInner>{children}</AppLayoutInner>
        </ThemeProvider>
    );
}
