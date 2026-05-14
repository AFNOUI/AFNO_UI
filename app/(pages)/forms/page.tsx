import { FormsVariantsSwitcher } from "@/components/forms";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";

export default function FormVariantsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageBreadcrumb items={[{ label: "Form Variants" }]} />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Form Variants</h1>
        <p className="text-muted-foreground text-sm">
          Different form layouts and patterns — switch stack and implementation mode (JSON Config or Static JSX), then pick a variant.
          Each demo uses{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">FormConfig</code> with{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">React Hook Form</code>,{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">TanStack Form</code>, or{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">useActionState</code>
          . Install per variant, e.g.{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">npx afnoui add forms/forms-contact</code>
          .
        </p>
      </div>

      <FormsVariantsSwitcher />
    </div>
  );
}
