"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
// import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

function IndeterminateCheckbox({
  checked,
  className,
  onCheckedChange,
  indeterminate = false,
  ...props
}: {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  className?: string;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors",
        (checked || indeterminate) && "bg-primary text-primary-foreground",
        className
      )}
      onClick={() => {
        if (indeterminate) {
          onCheckedChange?.(true);
        } else if (checked) {
          onCheckedChange?.(false);
        } else {
          onCheckedChange?.(true);
        }
      }}
      {...props}
    >
      {indeterminate && <Minus className="h-3 w-3" />}
      {checked && !indeterminate && <Check className="h-3 w-3" />}
    </button>
  );
}

export default function CheckboxPage() {
  // const { t } = useTranslation();

  const [checked, setChecked] = useState(false);
  const [items, setItems] = useState([
    { id: "1", label: "Design System", checked: true },
    { id: "2", label: "Components", checked: true },
    { id: "3", label: "Documentation", checked: false },
    { id: "4", label: "Testing", checked: false },
  ]);
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const allChecked = items.every(item => item.checked);
  const someChecked = items.some(item => item.checked) && !allChecked;

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") {
      setItems(items.map(item => ({ ...item, checked: true })));
    } else {
      setItems(items.map(item => ({ ...item, checked: checked })));
    }
  };

  const handleItemChange = (id: string, checked: boolean) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked } : item
    ));
  };

  const basicCode = `import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>`;

  return (
    <div className="space-y-8">
      <SectionTitle>Checkbox</SectionTitle>

      {/* Basic Checkbox */}
      <CodePreview title="Basic Checkbox" code={basicCode}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="basic" checked={checked} onCheckedChange={(c) => setChecked(c as boolean)} />
            <Label htmlFor="basic" className="cursor-pointer">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="checked" defaultChecked />
            <Label htmlFor="checked" className="cursor-pointer">Checked by default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled" disabled />
            <Label htmlFor="disabled" className="cursor-not-allowed opacity-50">Disabled checkbox</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-checked" disabled defaultChecked />
            <Label htmlFor="disabled-checked" className="cursor-not-allowed opacity-50">Disabled checked</Label>
          </div>
        </div>
      </CodePreview>

      {/* Indeterminate Checkbox */}
      <CodePreview title="Indeterminate State (Select All)" code={`// Indeterminate checkbox for parent selection`}>
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center space-x-2 pb-2 border-b border-border">
            <IndeterminateCheckbox
              checked={allChecked}
              indeterminate={someChecked}
              onCheckedChange={handleSelectAll}
            />
            <Label className="font-medium cursor-pointer">Select All Tasks</Label>
          </div>
          <div className="space-y-3 pl-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => handleItemChange(item.id, checked as boolean)}
                />
                <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </CodePreview>

      {/* Checkbox with Description */}
      <CodePreview title="With Description" code={`// Checkbox with helper text`}>
        <div className="space-y-4 max-w-md">
          <div className="flex items-start space-x-3">
            <Checkbox id="desc-1" className="mt-1" />
            <div>
              <Label htmlFor="desc-1" className="cursor-pointer font-medium">Email notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email notifications when someone mentions you.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox id="desc-2" className="mt-1" defaultChecked />
            <div>
              <Label htmlFor="desc-2" className="cursor-pointer font-medium">Push notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications on your mobile device.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox id="desc-3" className="mt-1" />
            <div>
              <Label htmlFor="desc-3" className="cursor-pointer font-medium">SMS notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates via SMS.</p>
            </div>
          </div>
        </div>
      </CodePreview>

      {/* Card Style Checkbox */}
      <CodePreview title="Card Style Selection" code={`// Checkbox as selectable cards`}>
        <div className="grid gap-4 md:grid-cols-3 max-w-2xl">
          {[
            { id: "free", name: "Free", price: "$0", features: "Basic features" },
            { id: "pro", name: "Pro", price: "$29", features: "All features" },
            { id: "enterprise", name: "Enterprise", price: "$99", features: "Custom solutions" },
          ].map((plan) => (
            <label
              key={plan.id}
              className={cn(
                "relative flex flex-col p-4 border border-border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                selectedPlan === plan.id && "border-primary bg-primary/5 ring-2 ring-primary/20"
              )}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                onChange={() => setSelectedPlan(plan.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{plan.name}</span>
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  selectedPlan === plan.id ? "border-primary bg-primary" : "border-muted-foreground"
                )}>
                  {selectedPlan === plan.id && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </div>
              <span className="text-2xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.features}</span>
            </label>
          ))}
        </div>
      </CodePreview>

      {/* Checkbox Group */}
      <CodePreview title="Checkbox Group (Multi-select)" code={`// Multiple checkbox selection`}>
        <div className="space-y-4 max-w-md">
          <Label className="text-base font-medium">Select your interests</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Technology", "Design", "Business", "Marketing",
              "Development", "Analytics", "Product", "AI/ML"
            ].map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox id={`interest-${interest}`} />
                <Label htmlFor={`interest-${interest}`} className="cursor-pointer text-sm">{interest}</Label>
              </div>
            ))}
          </div>
        </div>
      </CodePreview>

      {/* Inline Checkbox */}
      <CodePreview title="Inline Checkboxes" code={`// Horizontal checkbox layout`}>
        <div className="space-y-4">
          <Label className="text-base font-medium">Select features</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="inline-1" defaultChecked />
              <Label htmlFor="inline-1" className="cursor-pointer text-sm">Dark Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inline-2" defaultChecked />
              <Label htmlFor="inline-2" className="cursor-pointer text-sm">Animations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inline-3" />
              <Label htmlFor="inline-3" className="cursor-pointer text-sm">Sounds</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inline-4" />
              <Label htmlFor="inline-4" className="cursor-pointer text-sm">Haptic Feedback</Label>
            </div>
          </div>
        </div>
      </CodePreview>

      {/* Form Agreement */}
      <CodePreview title="Form Agreement" code={`// Terms and conditions checkboxes`}>
        <div className="space-y-4 max-w-md p-4 border border-border rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-agree"
              checked={terms}
              onCheckedChange={(c) => setTerms(c as boolean)}
              className="mt-1"
            />
            <div>
              <Label htmlFor="terms-agree" className="cursor-pointer">
                I agree to the <a href="#" className="text-primary underline hover:no-underline">Terms of Service</a> and{" "}
                <a href="#" className="text-primary underline hover:no-underline">Privacy Policy</a>
              </Label>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing-agree"
              checked={marketing}
              onCheckedChange={(c) => setMarketing(c as boolean)}
              className="mt-1"
            />
            <div>
              <Label htmlFor="marketing-agree" className="cursor-pointer text-sm text-muted-foreground">
                Send me promotional emails about new features and updates (optional)
              </Label>
            </div>
          </div>
          <Button disabled={!terms} className="w-full">
            Create Account
          </Button>
        </div>
      </CodePreview>

      {/* Task List Style */}
      <CodePreview title="Task List Style" code={`// Interactive task list`}>
        <div className="space-y-2 max-w-sm">
          {[
            { id: "task-1", label: "Review pull request", done: true },
            { id: "task-2", label: "Update documentation", done: true },
            { id: "task-3", label: "Write unit tests", done: false },
            { id: "task-4", label: "Deploy to production", done: false },
          ].map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center space-x-3 p-3 border border-border rounded-lg transition-colors hover:bg-muted/50",
                task.done && "bg-muted/30"
              )}
            >
              <Checkbox id={task.id} defaultChecked={task.done} />
              <Label
                htmlFor={task.id}
                className={cn(
                  "cursor-pointer flex-1",
                  task.done && "line-through text-muted-foreground"
                )}
              >
                {task.label}
              </Label>
            </div>
          ))}
        </div>
      </CodePreview>

      {/* Colored Checkboxes */}
      <CodePreview title="Colored Variants" code={`// Custom colored checkboxes`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="color-primary" defaultChecked className="data-[state=checked]:bg-primary" />
            <Label htmlFor="color-primary" className="cursor-pointer">Primary</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="color-success" defaultChecked className="border-[hsl(var(--progress-success))] data-[state=checked]:bg-[hsl(var(--progress-success))] data-[state=checked]:text-white" />
            <Label htmlFor="color-success" className="cursor-pointer">Success</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="color-warning" defaultChecked className="border-[hsl(var(--progress-warning))] data-[state=checked]:bg-[hsl(var(--progress-warning))] data-[state=checked]:text-foreground" />
            <Label htmlFor="color-warning" className="cursor-pointer">Warning</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="color-error" defaultChecked className="border-destructive data-[state=checked]:bg-destructive" />
            <Label htmlFor="color-error" className="cursor-pointer">Error</Label>
          </div>
        </div>
      </CodePreview>
    </div>
  );
}
