import {
  HelpCircle, ToggleLeft, ListOrdered,
  Square, LayoutList, CheckCircle2, AlertTriangle, Zap,
  BookOpen, MousePointer2, Layers, Eye, Code2, Settings2,
  GripVertical, GitBranch, Sparkles, ArrowRight, Info, Copy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const steps = [
  {
    icon: MousePointer2,
    title: "1. Choose a Layout",
    description: "Start by clicking one of the four layout buttons at the top of the page. Each layout loads a pre-filled sample form so you can immediately see how it looks and works.",
    details: [
      "**Single Section** — All fields in one card. Ideal for simple forms (contact, feedback).",
      "**Multi-Tab** — Fields grouped into tabbed sections with navigation. Perfect for complex registration forms.",
      "**Wizard (Steps)** — One section at a time with step indicators. Great for onboarding flows.",
      "**Compact** — Minimal form with no titles. Best for login screens or inline search.",
    ],
    tip: "Each layout comes with realistic sample data. Start from a layout that matches your use case, then customize it.",
  },
  {
    icon: Layers,
    title: "2. Add Fields",
    description: "The left sidebar shows all available field types organized by category. Click any field to add it to the currently selected section.",
    details: [
      "**Basic Inputs** — Text, Email, Phone, Number, URL, Textarea, Date",
      "**Toggles & Choices** — Select, Radio, Checkbox, Switch, and their group variants",
      "**Combobox** — Searchable dropdowns (single and multi-select)",
      "**File** — File upload with customizable accepted types",
    ],
    tip: "You can also load a pre-built template (Contact, Registration, Survey, etc.) from the dropdown at the top right.",
  },
  {
    icon: Settings2,
    title: "3. Configure Fields",
    description: "Click any field in the canvas area to select it. The Properties panel on the right shows all configurable options for that field.",
    details: [
      "**Label** — The visible text label shown to users",
      "**Name (ID)** — Unique identifier used in code and submitted data (e.g., `first_name`)",
      "**Placeholder** — Hint text shown inside the field when empty",
      "**Description** — Help text displayed below the field",
      "**Required** — Makes the field mandatory; form won't submit without it",
      "**Disabled** — Grays out the field to prevent interaction",
    ],
    tip: "Each field type has its own specific settings (e.g., min/max for numbers, rows for textarea, accepted file types for uploads).",
  },
  {
    icon: GripVertical,
    title: "4. Reorder & Organize",
    description: "Drag fields up and down using the grip handle (⠿) on the left side of each field to reorder them within a section.",
    details: [
      "**Drag & Drop** — Grab the handle and move fields to rearrange their order",
      "**Duplicate** — Click the copy icon to create an identical field with all its settings",
      "**Delete** — Click the trash icon to remove a field",
      "**Sections** — Use 'Add Section' to create multiple groups. Each section can have its own column layout (1-4 columns)",
    ],
    tip: "Multi-column layouts (2-4 columns) work great for related fields like First Name / Last Name side by side.",
  },
  {
    icon: GitBranch,
    title: "5. Add Advanced Logic",
    description: "The Properties panel includes powerful advanced features for dynamic form behavior:",
    details: [
      "**Conditional Visibility** — Show/hide a field based on another field's value. Example: Show 'Company Name' only when 'Employment Status' = 'Employed'",
      "**Dependent Options** — Change dropdown options based on a parent field. Example: Country → State/Province dropdown changes based on selected country",
      "**Auto-Populate (Watch)** — Automatically fill a field based on another field's value, with optional value mapping",
      "**Date Constraints** — Link date fields so 'End Date' can't be before 'Start Date'",
    ],
    tip: "These features are available in the bottom section of the Properties panel when you select a field. Look for the toggle switches to enable them.",
  },
  {
    icon: Eye,
    title: "6. Preview & Test",
    description: "Switch to the Preview tab to see your form rendered exactly as it will appear in production. Test it by filling in data and submitting.",
    details: [
      "**Live Preview** — The form renders with full validation, conditional logic, and all configured behaviors",
      "**Submit Test** — Fill out the form and click Submit. The submitted data appears directly below the form in a formatted table",
      "**Validation** — Required fields show error messages. Email fields validate format. Custom patterns are enforced",
    ],
    tip: "Submit the form with empty required fields to verify validation works correctly. The submitted data table shows exactly what your code will receive.",
  },
  {
    icon: Code2,
    title: "7. Export Code",
    description: "The Export Code tab generates all the files you need to add this form to your React project.",
    details: [
      "**Install Commands** — Copy the npm/yarn install commands for required dependencies",
      "**Reusable Files** — `types.ts`, `ReactHookForm.tsx`, `ReactHookFormField.tsx` — install these once and use for all forms",
      "**Field Components** — Individual field components (TextField, SelectField, etc.) needed for your specific form",
      "**Generated Files** — `formConfig.ts` (your form's configuration) and `MyFormPage.tsx` (ready-to-use page component)",
    ],
    tip: "Files marked 'fixed' only need to be installed once. Files marked 'generated' are unique to this form. Each code block has a Copy button on hover.",
  },
];

const advancedFeatures = [
  {
    icon: GitBranch,
    title: "Conditional Visibility",
    description: "Show or hide fields dynamically based on another field's value. Supports operators: equals, not equals, contains, in (comma-separated list), not empty, is empty.",
    example: "Field: 'employment_status' | Operator: 'equals' | Value: 'employed' → Shows 'Company Name' field only when user selects 'Employed'",
  },
  {
    icon: ListOrdered,
    title: "Dependent Dropdowns",
    description: "Create cascading dropdowns where the child field's options change based on the parent field's selected value. Classic example: Country → State.",
    example: "Watch Field: 'country' | Options Map: { 'usa': [California, New York, Texas], 'canada': [Ontario, Quebec, BC] }",
  },
  {
    icon: Zap,
    title: "Auto-Populate (Watch)",
    description: "Automatically set a field's value based on another field. Optionally use a Value Map to transform the source value.",
    example: "Source: 'plan' | Value Map: { 'basic': '$9.99', 'pro': '$29.99', 'enterprise': '$99.99' } → Price field auto-fills when plan is selected",
  },
  {
    icon: ToggleLeft,
    title: "Date Constraints",
    description: "Link date fields so that one date can't be set before or after another. Useful for date ranges like 'Valid From' / 'Valid To'.",
    example: "Min Date Field: 'start_date' on the 'end_date' field → User can't select an end date before the start date",
  },
];

const glossary = [
  { term: "Layout", description: "The overall structure of your form — single section, multi-tab, wizard, or compact. Controls how sections are organized and navigated." },
  { term: "Section", description: "A group of related fields displayed together in a card. Sections can have their own title, description, and column count." },
  { term: "Columns", description: "How many columns a section uses on desktop (1-4). Fields are arranged in a CSS grid — 2 columns means fields sit side by side." },
  { term: "Show Reset", description: "Adds a 'Reset' button next to Submit that clears all form fields back to their default values." },
  { term: "Required", description: "When enabled, the field must be filled in before the form can be submitted. Empty required fields show validation errors." },
  { term: "Name (ID)", description: "The unique identifier for the field used in code. Must be unique across all fields. This becomes the key in the submitted data object (e.g., form_data.first_name)." },
  { term: "Placeholder", description: "Ghost text shown inside a field when it's empty. Gives users a hint about what to enter. Disappears when they start typing." },
  { term: "Description", description: "Help text shown below a field. Use it for extra instructions, format hints, or examples." },
  { term: "Disabled", description: "Grays out the field and prevents interaction. Useful for read-only data or fields that are auto-populated." },
  { term: "Pattern (Regex)", description: "A regular expression that the field value must match. Used for custom validation like phone numbers (/^\\+?[0-9-]+$/) or zip codes (/^[0-9]{5}$/)." },
  { term: "Conditional Visibility", description: "Shows or hides a field based on another field's value. Example: Show 'Other' text input only when radio selection is 'Other'." },
  { term: "Dependent Options", description: "The dropdown options change based on another field's value. Classic example: Country selection changes the State dropdown options." },
  { term: "Auto-Populate", description: "Automatically fills a field's value based on another field. Can use a value map to transform the source value into a different output." },
  { term: "Orientation", description: "For radio buttons and checkbox groups — whether options are arranged vertically (stacked) or horizontally (side by side)." },
];

const faqs = [
  {
    q: "Can I have fields span multiple columns?",
    a: "Currently each field takes one column in the grid. To make a field appear full-width in a 2-column section, place it in its own single-column section.",
  },
  {
    q: "How do I make a multi-step form (wizard)?",
    a: "Select the 'Wizard (Steps)' layout from the layout picker. Each section becomes a step with Previous/Next navigation. The ReactHookForm component handles step rendering automatically.",
  },
  {
    q: "Can I add custom validation?",
    a: "Yes! Use the 'Pattern (Regex)' field in text-type field properties to add custom regex validation. For more complex validation, edit the exported types.ts file after export.",
  },
  {
    q: "What happens when I load a template?",
    a: "Loading a template replaces all current fields and sections. Use Undo if you accidentally lose your work. Templates are great starting points you can customize.",
  },
  {
    q: "How do I create dependent/cascading dropdowns?",
    a: "Select a Select or Combobox field → scroll to 'Dependent Options' in Properties → enable it → set the Watch Field (parent dropdown) → add option groups for each parent value.",
  },
  {
    q: "Can I reuse the exported code for multiple forms?",
    a: "Yes! The 'fixed' files (types.ts, ReactHookForm.tsx, ReactHookFormField.tsx, field components) only need to be installed once. For each new form, you only need a new formConfig.ts and page component.",
  },
];

export function FormBuilderGuide() {
  return (
    <Tabs defaultValue="getting-started" className="space-y-4">
      <TabsList className="h-9">
        <TabsTrigger value="getting-started" className="text-xs gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          Getting Started
        </TabsTrigger>
        <TabsTrigger value="advanced" className="text-xs gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          Advanced Features
        </TabsTrigger>
        <TabsTrigger value="glossary" className="text-xs gap-1.5">
          <Info className="h-3.5 w-3.5" />
          Glossary & FAQ
        </TabsTrigger>
      </TabsList>

      {/* Getting Started */}
      <TabsContent value="getting-started">
        <div className="space-y-6">
          {/* Introduction */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-5 px-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">How to Use the Form Builder</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Build production-ready forms visually — no coding required. Design your form layout, add and configure fields,
                    set up validation rules and advanced logic, test everything live, and export clean, type-safe React + TypeScript code
                    ready to paste into your project.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">React + TypeScript</Badge>
                    <Badge variant="secondary" className="text-xs">Zod Validation</Badge>
                    <Badge variant="secondary" className="text-xs">React Hook Form</Badge>
                    <Badge variant="secondary" className="text-xs">Radix UI</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step-by-step Guide */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Step-by-Step Guide</CardTitle>
              <CardDescription>Follow these steps to build your first form</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-sm">{step.title}</h4>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                        {step.details && (
                          <ul className="space-y-1 ml-1">
                            {step.details.map((detail, di) => (
                              <li key={di} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-[10px]">$1</code>') }} />
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-start gap-1.5 text-xs text-primary/80 bg-primary/5 rounded-md p-2">
                          <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
                          <span><strong>Tip:</strong> {step.tip}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tips & Tricks */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tips & Tricks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  { icon: ArrowRight, text: "Use **Undo/Redo** buttons to revert any change — works for field additions, deletions, and property updates" },
                  { icon: ArrowRight, text: "Load a **Template** first, then customize it — much faster than building from scratch" },
                  { icon: Copy, text: "**Duplicate** a field to quickly create similar fields with identical settings" },
                  { icon: ArrowRight, text: "Use **Multi-Tab layout** for forms with 8+ fields to keep things organized" },
                  { icon: Copy, text: "In Export Code, hover over any code block to reveal the **Copy** button" },
                  { icon: ArrowRight, text: "Use **Description** fields to add help text that guides users on what to enter" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <item.icon className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-xs" dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Advanced Features */}
      <TabsContent value="advanced">
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4 px-5">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Advanced Form Logic</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    These features are available in the Properties panel when you select a field. Scroll down past the basic settings to find the advanced sections with toggle switches.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {advancedFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="border-border">
                <CardContent className="py-4 px-5">
                  <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                      <div className="bg-muted/50 rounded-md p-2.5 border border-border">
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Example Configuration:</p>
                        <p className="text-xs font-mono text-foreground">{feature.example}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Layout Comparison */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Layout Comparison</CardTitle>
              <CardDescription>Choose the right layout for your use case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: Square, name: "Single Section", fields: "3-6 fields", use: "Contact forms, feedback, simple data entry", nav: "None — all fields visible at once" },
                  { icon: Layers, name: "Multi-Tab", fields: "7-20+ fields", use: "Registration, company setup, complex profiles", nav: "Tab navigation with Previous/Next buttons" },
                  { icon: ArrowRight, name: "Wizard", fields: "8-15 fields", use: "Onboarding, checkout, multi-step processes", nav: "Step-by-step with progress indicators" },
                  { icon: LayoutList, name: "Compact", fields: "2-4 fields", use: "Login, search, inline forms, quick actions", nav: "None — minimal, no section titles" },
                ].map((layout, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border border-border">
                    <layout.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{layout.name}</span>
                        <Badge variant="outline" className="text-[10px]">{layout.fields}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{layout.use}</p>
                      <p className="text-[10px] text-muted-foreground"><strong className="text-foreground">Navigation:</strong> {layout.nav}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Glossary & FAQ */}
      <TabsContent value="glossary">
        <div className="space-y-6">
          {/* Glossary */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Glossary</CardTitle>
              </div>
              <CardDescription>What each setting and term means</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {glossary.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <Badge variant="outline" className="shrink-0 text-xs font-mono mt-0.5">
                      {item.term}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-sm font-medium">{faq.q}</p>
                    <p className="text-xs text-muted-foreground">{faq.a}</p>
                    {idx < faqs.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
