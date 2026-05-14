import { fieldTypes, catLabels } from "@/form-builder/config/constants";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FieldPaletteProps {
  onAddField: (type: string) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Add Fields</CardTitle>
        <CardDescription className="text-xs">Click to add to form</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[520px]">
          <div className="space-y-3 p-2">
            {["basic", "selection", "combobox", "select", "async", "infinite", "file", "layout"].map((cat) => {
              const catFields = fieldTypes.filter((f) => f.category === cat);
              return (
                <div key={cat}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                    {catLabels[cat]}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {catFields.map((field) => {
                      const Icon = field.icon;
                      return (
                        <Tooltip key={field.type}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onAddField(field.type)}
                              className="flex flex-col items-center gap-1 p-2 rounded-md border border-border hover:border-primary hover:bg-accent/50 transition-all text-center group"
                            >
                              <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-[10px] font-medium leading-tight">{field.label}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[280px]">
                            <p className="text-xs font-semibold mb-1">{field.label}</p>
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
