import { Code2, FormInput } from "lucide-react";

import { Button } from "@/components/ui/button";

import { FormsVariantsSwitcher } from "@/components/forms";

import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";

export default function FormVariantsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-[1600px] space-y-6">
        <PageBreadcrumb items={[{ label: "Form Variants" }]} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FormInput className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Form Variants</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Different form layouts and patterns — switch stack and
                implementation mode, then pick a variant.{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  FormConfig
                </code>{" "}
                with{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  React Hook Form
                </code>
                ,{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  TanStack Form
                </code>
                , or{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  useActionState
                </code>
                .
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-9" asChild>
            <a href="/form-builder">
              <Code2 className="h-3.5 w-3.5" /> Build your own
            </a>
          </Button>
        </div>

        <FormsVariantsSwitcher />
      </div>
    </div>
  );
}
