"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetTitle,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import ExportPanel from "@/components/lab/ExportPanel";
import VariableEditor from "@/components/lab/VariableEditor";
import LanguageSelector from "@/components/lab/LanguageSelector";

import TabPage from "@/(pages)/components/tab/page";
import CardPage from "@/(pages)/components/card/page";
import FormPage from "@/(pages)/components/form/page";
import SheetPage from "@/(pages)/components/sheet/page";
import AlertPage from "@/(pages)/components/alert/page";
import BadgePage from "@/(pages)/components/badge/page";
import InputPage from "@/(pages)/components/input/page";
import RadioPage from "@/(pages)/components/radio/page";
import ButtonPage from "@/(pages)/components/button/page";
import SelectPage from "@/(pages)/components/select/page";
import SwitchPage from "@/(pages)/components/switch/page";
import SliderPage from "@/(pages)/components/slider/page";
import TogglePage from "@/(pages)/components/toggle/page";
import DialogPage from "@/(pages)/components/dialog/page";
import TooltipPage from "@/(pages)/components/tooltip/page";
import MenubarPage from "@/(pages)/components/menubar/page";
import CommandPage from "@/(pages)/components/command/page";
import PopoverPage from "@/(pages)/components/popover/page";
import DropdownPage from "@/(pages)/components/dropdown/page";
import CheckboxPage from "@/(pages)/components/checkbox/page";
import ProgressPage from "@/(pages)/components/progress/page";
import ComboboxPage from "@/(pages)/components/combobox/page";
import CarouselPage from "@/(pages)/components/carousel/page";
import AccordionPage from "@/(pages)/components/accordion/page";
import SeparatorPage from "@/(pages)/components/separator/page";
import BreadcrumbPage from "@/(pages)/components/breadcrumb/page";
import ScrollAreaPage from "@/(pages)/components/scroll-area/page";
import CollapsiblePage from "@/(pages)/components/collapsible/page";
import AlertDialogPage from "@/(pages)/components/alert-dialog/page";
import NavigationMenuPage from "@/(pages)/components/navigation-menu/page";
import CompositeInputPage from "@/(pages)/components/composite-inout/page";

export default function Index() {
  const [editorOpen, setEditorOpen] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
        <div>
          <h1 className="text-sm font-semibold">All Components</h1>

          <p className="text-xs text-muted-foreground hidden sm:block">
            Edit CSS variables and see changes in real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector />

          <ExportPanel />

          <Button
            size="sm"
            variant="ghost"
            className="hidden md:flex gap-2"
            onClick={() => setEditorOpen(!editorOpen)}
          >
            {editorOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            <span className="hidden lg:inline">{editorOpen ? "Hide" : "Show"} Editor</span>
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="p-4 flex-1 overflow-hidden bg-muted/12">
          <AccordionPage />
          <Separator className="my-12" />

          <AlertPage />
          <Separator className="my-12" />

          <AlertDialogPage />
          <Separator className="my-12" />

          <BadgePage />
          <Separator className="my-12" />

          <BreadcrumbPage />
          <Separator className="my-12" />

          <ButtonPage />
          <Separator className="my-12" />

          <CardPage />
          <Separator className="my-12" />

          <CarouselPage />
          <Separator className="my-12" />

          <CheckboxPage />
          <Separator className="my-12" />

          <CollapsiblePage />
          <Separator className="my-12" />

          <ComboboxPage />
          <Separator className="my-12" />

          <CommandPage />
          <Separator className="my-12" />

          <CompositeInputPage />
          <Separator className="my-12" />

          <DialogPage />
          <Separator className="my-12" />

          <DropdownPage />
          <Separator className="my-12" />

          <FormPage />
          <Separator className="my-12" />

          <InputPage />
          <Separator className="my-12" />

          <MenubarPage />
          <Separator className="my-12" />

          <NavigationMenuPage />
          <Separator className="my-12" />

          <PopoverPage />
          <Separator className="my-12" />

          <ProgressPage />
          <Separator className="my-12" />

          <RadioPage />
          <Separator className="my-12" />

          <ScrollAreaPage />
          <Separator className="my-12" />

          <SelectPage />
          <Separator className="my-12" />

          <SeparatorPage />
          <Separator className="my-12" />

          <SheetPage />
          <Separator className="my-12" />

          <SliderPage />
          <Separator className="my-12" />

          <SwitchPage />
          <Separator className="my-12" />

          <TabPage />
          <Separator className="my-12" />

          <TogglePage />
          <Separator className="my-12" />

          <TooltipPage />
          <Separator className="my-12" />
        </div>

        {/* Variable Editor - Desktop */}
        <div
          className={cn(
            "hidden md:block w-80 min-w-[312px] shrink-0 transition-all duration-300",
            editorOpen ? "translate-x-0" : "translate-x-full w-0 min-w-0"
          )}
        >
          {editorOpen && <VariableEditor />}
        </div>
      </div>

      {/* Mobile Editor Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          >
            <PanelRightOpen size={12} />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[312px] p-0">
          <SheetTitle className="sr-only">Theme Editor</SheetTitle>

          <VariableEditor />
        </SheetContent>
      </Sheet>
    </div>
  );
}
