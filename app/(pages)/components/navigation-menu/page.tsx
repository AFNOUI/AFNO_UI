"use client";

// import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  ChevronRight, ChevronLeft, User, Plus, Menu, Home,
  Blocks, Layers, Palette, Code, Zap, Shield, Settings, BarChart,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  ListItem,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function NavigationMenuPage() {
  // const { t } = useTranslation();

  const basicCode = `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
          <ListItem href="#" title="Introduction">
            Re-usable components built using Radix UI.
          </ListItem>
          <ListItem href="#" title="Installation">
            How to install dependencies and structure your app.
          </ListItem>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Navigation Menu</SectionTitle>

      <CodePreview title="Advanced Multi-Level Navigation" code={`// Multi-level navigation with mobile support`}>
        <AdvancedHeader />
      </CodePreview>

      <CodePreview title="Full Navigation Menu" code={basicCode}>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                        href="#"
                      >
                        <Blocks className="h-6 w-6 text-primary-foreground" />
                        <div className="mb-2 mt-4 text-lg font-medium text-primary-foreground">
                          UI Components
                        </div>
                        <p className="text-sm leading-tight text-primary-foreground/80">
                          Beautifully designed components built with Radix UI and Tailwind CSS.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="#" title="Introduction" icon={<Layers className="h-4 w-4" />}>
                    Re-usable components built using Radix UI and Tailwind CSS.
                  </ListItem>
                  <ListItem href="#" title="Installation" icon={<Code className="h-4 w-4" />}>
                    How to install dependencies and structure your app.
                  </ListItem>
                  <ListItem href="#" title="Typography" icon={<Palette className="h-4 w-4" />}>
                    Styles for headings, paragraphs, lists, and more.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="#" title="Alert Dialog" icon={<Shield className="h-4 w-4" />}>
                    A modal dialog that interrupts the user with important content.
                  </ListItem>
                  <ListItem href="#" title="Hover Card" icon={<Layers className="h-4 w-4" />}>
                    For sighted users to preview content behind a link.
                  </ListItem>
                  <ListItem href="#" title="Progress" icon={<BarChart className="h-4 w-4" />}>
                    Displays an indicator showing completion progress.
                  </ListItem>
                  <ListItem href="#" title="Scroll Area" icon={<Zap className="h-4 w-4" />}>
                    Visually or semantically separates content.
                  </ListItem>
                  <ListItem href="#" title="Tabs" icon={<Settings className="h-4 w-4" />}>
                    A set of layered sections of content—known as tab panels.
                  </ListItem>
                  <ListItem href="#" title="Tooltip" icon={<Code className="h-4 w-4" />}>
                    A popup that displays information related to an element.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Documentation
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </CodePreview>

      <CodePreview title="Simple Links Navigation" code={`// Simple navigation with links`}>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Services
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Contact
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </CodePreview>

      <CodePreview title="Products Mega Menu" code={`// E-commerce style mega menu`}>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[600px] grid-cols-3">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-primary">Electronics</h4>
                    <ul className="space-y-2">
                      {["Laptops", "Phones", "Tablets", "Accessories"].map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                              {item}
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-primary">Clothing</h4>
                    <ul className="space-y-2">
                      {["Men", "Women", "Kids", "Sports"].map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                              {item}
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-primary">Home</h4>
                    <ul className="space-y-2">
                      {["Furniture", "Decor", "Kitchen", "Garden"].map((item) => (
                        <li key={item}>
                          <NavigationMenuLink asChild>
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                              {item}
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4">
                  <ListItem href="#" title="For Startups" icon={<Zap className="h-4 w-4 text-primary" />}>
                    Affordable plans designed for growing businesses.
                  </ListItem>
                  <ListItem href="#" title="For Enterprise" icon={<Shield className="h-4 w-4 text-primary" />}>
                    Enterprise-grade security and scalability.
                  </ListItem>
                  <ListItem href="#" title="For Developers" icon={<Code className="h-4 w-4 text-primary" />}>
                    APIs and tools to build custom integrations.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </CodePreview>
    </div>
  );
}


// Types
interface SubFeature {
  name: string;
  description: string;
  routingPath: string;
}

interface MenuItem {
  name: string;
  description: string;
  subFeatures?: SubFeature[];
}

// Sample Data
const rentalItems: MenuItem[] = [
  {
    name: "Rooms",
    description: "Private and shared room rentals for students and professionals",
    subFeatures: [
      { name: "Find Shared Rooms", routingPath: "#", description: "Discover available shared living spaces" },
      { name: "Find Your Room Partner", routingPath: "#", description: "Connect with compatible roommates" },
      { name: "Feature Your Room", routingPath: "#", description: "List and showcase your available room" },
    ],
  },
  {
    name: "Hostels",
    description: "Affordable hostel accommodations for students",
    subFeatures: [],
  },
  {
    name: "Apartments",
    description: "Modern furnished and unfurnished apartments",
    subFeatures: [],
  },
];

const listingItems: MenuItem[] = [
  {
    name: "Room Rental Assistance",
    description: "Expert guidance to list your room or find the perfect shared space",
    subFeatures: [
      { routingPath: "#", name: "For Room Owners", description: "Professional assistance to list and market" },
      { routingPath: "#", name: "For Tenants", description: "Personalized help finding ideal rooms" },
    ],
  },
  {
    name: "Hostel Advisory",
    description: "Comprehensive hostel listing and booking consultation services",
    subFeatures: [
      { routingPath: "#", name: "For Hostel Owners", description: "Management support for listing and operations" },
      { routingPath: "#", name: "For Guests", description: "Recommendations for budget-friendly hostels" },
    ],
  },
  {
    name: "Apartment Consulting",
    description: "Professional apartment rental advisory for owners and renters",
    subFeatures: [
      { routingPath: "#", name: "For Apartment Owners", description: "Guidance on pricing and marketing" },
      { routingPath: "#", name: "For Renters", description: "Assistance to find apartments for families" },
    ],
  },
];

// NavItemVisual Component
function NavItemVisual({
  title,
  isHeader,
  description,
  hasChildren,
}: {
  title: string;
  isHeader?: boolean;
  description?: string;
  hasChildren?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent transition-colors">
      {!isHeader && (
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Home className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium text-sm", isHeader && "text-lg")}>
            {title}
          </span>
          {description && !isHeader && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {description}
            </span>
          )}
        </div>
        {hasChildren && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

// Mobile Section Component
function MobileSection({ label, items }: { label: string; items: MenuItem[] }) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="text-sm font-medium">
        {label}
      </AccordionTrigger>
      <AccordionContent>
        {items.map((item) => {
          if (activeItem && activeItem !== item.name) return null;

          if (activeItem === item.name) {
            return (
              <div key={item.name} className="space-y-2 p-2">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setActiveItem(null)}
                    className="flex items-center gap-1 text-xs font-bold text-primary uppercase"
                  >
                    <ChevronLeft className="h-3 w-3" /> Back
                  </button>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {item.name}
                  </span>
                </div>
                {item.subFeatures?.map((sub) => (
                  <a key={sub.name} href={sub.routingPath} className="block">
                    <NavItemVisual title={sub.name} description={sub.description} />
                  </a>
                ))}
              </div>
            );
          }

          return (
            <div
              key={item.name}
              onClick={() => item.subFeatures?.length ? setActiveItem(item.name) : null}
              className="cursor-pointer"
            >
              <NavItemVisual title={item.name} description={item.description} hasChildren={!!item.subFeatures?.length} />
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}

// ListItemContent Component
function ListItemContent({
  title,
  description,
  hasChildren,
  isHeader,
}: {
  title: string;
  description?: string;
  hasChildren?: boolean;
  isHeader?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors">
      {!isHeader && (
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Home className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium text-sm", isHeader && "text-lg")}>
            {title}
          </span>
          {hasChildren && !isHeader && (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
        {description && !isHeader && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// Desktop Dropdown Component
function DesktopDropdown({ label, items }: { label: string; items: MenuItem[] }) {
  const [activeSubMenu, setActiveSubMenu] = React.useState<MenuItem | null>(null);

  return (
    <NavigationMenuItem onMouseLeave={() => setActiveSubMenu(null)}>
      <NavigationMenuTrigger>
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[500px] lg:w-[600px] p-4">
          {!activeSubMenu ? (
            <div className="space-y-3">
              <div className="text-lg font-semibold text-foreground px-3">
                {label}
              </div>
              <div className={cn(
                "grid gap-2",
                items.length > 4 ? "md:grid-cols-2" : "grid-cols-1"
              )}>
                {items.map((item) => (
                  <div key={item.name}>
                    {item.subFeatures && item.subFeatures.length > 0 ? (
                      <button
                        onClick={() => setActiveSubMenu(item)}
                        className="w-full text-left"
                      >
                        <ListItemContent title={item.name} description={item.description} hasChildren />
                      </button>
                    ) : (
                      <NavigationMenuLink asChild>
                        <a href="#" className="block">
                          <ListItemContent title={item.name} description={item.description} />
                        </a>
                      </NavigationMenuLink>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3">
                <button
                  onClick={() => setActiveSubMenu(null)}
                  className="flex items-center gap-0.5 text-xs font-bold text-primary uppercase hover:opacity-70 transition-opacity"
                >
                  <ChevronLeft className="h-3 w-3" /> Back
                </button>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm font-semibold">
                  {activeSubMenu.name}
                </span>
              </div>
              <div className="grid gap-2">
                {activeSubMenu.subFeatures?.map((sub) => (
                  <div key={sub.name}>
                    <NavigationMenuLink asChild>
                      <a href={sub.routingPath} className="block">
                        <ListItemContent title={sub.name} description={sub.description} />
                      </a>
                    </NavigationMenuLink>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

// Advanced Header Component
function AdvancedHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="border rounded-lg bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        {/* MOBILE MENU TRIGGER */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Home className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span>Property Hub</span>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="p-4">
                  <Accordion type="single" collapsible className="w-full">
                    <MobileSection label="Rentals" items={rentalItems} />
                    <MobileSection label="Services" items={listingItems} />
                  </Accordion>
                  <Separator className="my-4" />
                  <Button className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    List Your Property
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* BRAND LOGO */}
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold hidden sm:block">Property Hub</span>
        </a>

        {/* DESKTOP NAVIGATION */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <DesktopDropdown label="Rentals" items={rentalItems} />
            <DesktopDropdown label="Services" items={listingItems} />
          </NavigationMenuList>
        </NavigationMenu>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            Post Item
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
