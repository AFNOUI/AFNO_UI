"use client";

import * as React from "react";
import { ChevronRight, ChevronLeft, User, Plus, Menu, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/navigation-menu/navigation-menu-advanced";

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
          <span className={cn("font-medium text-sm", isHeader && "text-lg")}>{title}</span>
          {description && !isHeader && (
            <span className="text-xs text-muted-foreground line-clamp-1">{description}</span>
          )}
        </div>
        {hasChildren && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}

function MobileSection({ label, items }: { label: string; items: MenuItem[] }) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);
  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="text-sm font-medium">{label}</AccordionTrigger>
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
                  <span className="text-xs font-semibold text-muted-foreground">{item.name}</span>
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
              onClick={() => (item.subFeatures?.length ? setActiveItem(item.name) : null)}
              className="cursor-pointer"
            >
              <NavItemVisual
                title={item.name}
                description={item.description}
                hasChildren={!!item.subFeatures?.length}
              />
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}

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
          <span className={cn("font-medium text-sm", isHeader && "text-lg")}>{title}</span>
          {hasChildren && !isHeader && (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
        {description && !isHeader && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

function DesktopDropdown({ label, items }: { label: string; items: MenuItem[] }) {
  const [activeSubMenu, setActiveSubMenu] = React.useState<MenuItem | null>(null);
  return (
    <NavigationMenuItem onMouseLeave={() => setActiveSubMenu(null)}>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[500px] lg:w-[600px] p-4">
          {!activeSubMenu ? (
            <div className="space-y-3">
              <div className="text-lg font-semibold text-foreground px-3">{label}</div>
              <div
                className={cn(
                  "grid gap-2",
                  items.length > 4 ? "md:grid-cols-2" : "grid-cols-1"
                )}
              >
                {items.map((item) => (
                  <div key={item.name}>
                    {item.subFeatures && item.subFeatures.length > 0 ? (
                      <button
                        onClick={() => setActiveSubMenu(item)}
                        className="w-full text-start"
                      >
                        <ListItemContent
                          title={item.name}
                          description={item.description}
                          hasChildren
                        />
                      </button>
                    ) : (
                      <NavigationMenuLink asChild>
                        <a href="#" className="block">
                          <ListItemContent
                            title={item.name}
                            description={item.description}
                          />
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
                <span className="text-sm font-semibold">{activeSubMenu.name}</span>
              </div>
              <div className="grid gap-2">
                {activeSubMenu.subFeatures?.map((sub) => (
                  <div key={sub.name}>
                    <NavigationMenuLink asChild>
                      <a href={sub.routingPath} className="block">
                        <ListItemContent
                          title={sub.name}
                          description={sub.description}
                        />
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

function AdvancedHeader() {
  return (
    <div className="border rounded-lg bg-card">
      <div className="flex items-center justify-between px-4 py-3">
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
                  <span>{data.brandName}</span>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="p-4">
                  <Accordion type="single" collapsible className="w-full">
                    <MobileSection label={data.rentalLabel} items={data.rentalItems} />
                    <MobileSection label={data.servicesLabel} items={data.listingItems} />
                  </Accordion>
                  <Separator className="my-4" />
                  <Button className="w-full" size="sm">
                    <Plus className="h-4 w-4 me-2" />
                    {data.listButtonText}
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold hidden sm:block">{data.brandName}</span>
        </a>
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <DesktopDropdown label={data.rentalLabel} items={data.rentalItems} />
            <DesktopDropdown label={data.servicesLabel} items={data.listingItems} />
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden sm:flex">
            <Plus className="h-4 w-4 me-2" />
            {data.postButtonText}
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NavigationMenuAdvanced() {
  const snippet = "const data = " + JSON.stringify(data, null, 2) + ";\n\n// Multi-level navigation with mobile support";
  return (
    <ComponentInstall
      category="navigation-menu"
      variant="navigation-menu-advanced"
      title="Advanced Multi-Level Navigation"
      code={snippet}
      fullCode={code}
    >
      <AdvancedHeader />
    </ComponentInstall>
  );
}
