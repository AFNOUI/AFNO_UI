import { z } from "zod";
import { useStore } from "@tanstack/react-store";
import type { AnyFormState } from "@tanstack/react-form";
import { ChevronLeft, ChevronRight, AlertCircle, Check, AlertTriangle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTanstackForm } from "./useTanstackForm";
import type { FormConfig, FormSubmitHandler } from "../types/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { TanstackFormField } from "./TanstackFormField";
import { TanstackFormProvider } from "./TanstackFormContext";

interface TanstackFormProps {
  config: FormConfig;
  className?: string;
  onSubmit: FormSubmitHandler;
  initialValues?: Record<string, unknown>;
  schema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
}

export function TanstackForm({ config, onSubmit, className, schema, initialValues }: TanstackFormProps) {
  const {
    form, globalError, setGlobalError,
    currentStep, setCurrentStep, activeTab, setActiveTab,
    getSectionErrorCount, isSectionComplete, getOverallProgress,
    validateSection, handleTabChange, navigateToFirstError,
  } = useTanstackForm({ config, schema, onSubmit, initialValues });

  const layout = config.layout || "single";
  const totalSteps = config.sections.length;

  const values = useStore(form.store, (s) => s.values) as Record<string, unknown>;
  const ctxValue = { form, values };

  const renderSectionFields = (sectionIndex: number) => {
    const section = config.sections[sectionIndex];
    if (!section) return null;
    return (
      <div className={cn("grid gap-4", section.columns === 2 && "md:grid-cols-2", section.columns === 3 && "md:grid-cols-3", section.columns === 4 && "md:grid-cols-4")}>
        {section.fields.map((field) => (
          <div key={field.name} style={field.colSpan && field.colSpan > 1 ? { gridColumn: `span ${field.colSpan}` } : undefined}>
            <TanstackFormField config={field} />
          </div>
        ))}
      </div>
    );
  };

  const renderGlobalError = () => {
    if (!globalError) return null;
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Server Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{globalError}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setGlobalError(null)}>
            <X className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGlobalError(null);
    await form.handleSubmit();
    navigateToFirstError();  };

  const renderSubmitButton = (fullWidth = false) => (
    <form.Subscribe selector={(s: { isSubmitting: boolean }) => s.isSubmitting}>
      {(isSubmitting: boolean) => (
        <Button type="submit" disabled={isSubmitting} className={fullWidth ? "w-full" : ""}>
          {isSubmitting ? "Submitting..." : config.submitLabel || "Submit"}
        </Button>
      )}
    </form.Subscribe>
  );

  if (layout === "single") {
    return (
      <TanstackFormProvider value={ctxValue}>
        <form onSubmit={submitHandler} className={cn("space-y-6", className)}>
          {renderGlobalError()}
          {config.title && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{config.title}</h2>
              {config.description && <p className="text-muted-foreground">{config.description}</p>}
            </div>
          )}
          {config.sections.map((section, idx) => (
            <Card key={section.id}>
              {(section.title || section.description) && (
                <CardHeader>
                  {section.title && <CardTitle>{section.title}</CardTitle>}
                  {section.description && <CardDescription>{section.description}</CardDescription>}
                </CardHeader>
              )}
              <CardContent className={!section.title && !section.description ? "pt-6" : ""}>{renderSectionFields(idx)}</CardContent>
              {idx < config.sections.length - 1 && <Separator />}
            </Card>
          ))}
          <div className="flex gap-4">
            {renderSubmitButton()}
            {config.showReset && (
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                {config.resetLabel || "Reset"}
              </Button>
            )}
          </div>
        </form>
      </TanstackFormProvider>
    );
  }

  if (layout === "compact") {
    return (
      <TanstackFormProvider value={ctxValue}>
        <form onSubmit={submitHandler} className={cn("space-y-4", className)}>
          {renderGlobalError()}
          {config.sections.map((section, idx) => (
            <div key={section.id}>{renderSectionFields(idx)}</div>
          ))}
          <div className="flex gap-4">{renderSubmitButton(true)}</div>
        </form>
      </TanstackFormProvider>
    );
  }

  if (layout === "multi-tab") {
    const currentIndex = config.sections.findIndex((s) => s.id === activeTab);
    const isFirst = currentIndex <= 0;
    const isLast = currentIndex >= config.sections.length - 1;

    return (
      <TanstackFormProvider value={ctxValue}>
        <form onSubmit={submitHandler} className={cn("space-y-0", className)}>
          {renderGlobalError()}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="bg-muted/30 border border-border rounded-t-lg px-2 pt-2">
              <form.Subscribe selector={(s: AnyFormState) => s.fieldMeta}>
                {() => (
                  <TabsList className="h-auto bg-transparent p-0 gap-0 w-full justify-start flex-wrap">
                    {config.sections.map((section, idx) => {
                      const errorCount = getSectionErrorCount(idx);
                      const completed = isSectionComplete(idx);
                      const isActive = section.id === activeTab;
                      return (
                        <TabsTrigger key={section.id} value={section.id} className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium gap-2">
                          {completed && !isActive && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="h-2.5 w-2.5 text-primary-foreground" />
                            </div>
                          )}
                          {section.title || section.id}
                          {errorCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] gap-1">
                              <AlertCircle className="h-3 w-3" />{errorCount}
                            </Badge>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                )}
              </form.Subscribe>
            </div>
            <div className="border border-t-0 border-border rounded-b-lg">
              {config.sections.map((section, idx) => (
                <div key={section.id} className={cn("p-6", section.id !== activeTab && "hidden")}>
                  {(section.title || section.description) && (
                    <div className="mb-6">
                      {section.title && <h3 className="text-lg font-semibold">{section.title}</h3>}
                      {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
                    </div>
                  )}
                  {renderSectionFields(idx)}
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between p-4">
                <Button type="button" variant="secondary" onClick={() => form.reset()}>Cancel</Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" disabled={isFirst} onClick={() => { if (currentIndex > 0) setActiveTab(config.sections[currentIndex - 1].id); }}>
                    <ChevronLeft className="h-4 w-4 me-1" />Previous
                  </Button>
                  {isLast ? renderSubmitButton() : (
                    <Button type="button" onClick={async () => {
                      const valid = await validateSection(currentIndex);
                      if (valid && currentIndex < config.sections.length - 1) setActiveTab(config.sections[currentIndex + 1].id);
                    }}>
                      Next<ChevronRight className="h-4 w-4 ms-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </form>
      </TanstackFormProvider>
    );
  }

  if (layout === "wizard") {
    const progress = getOverallProgress();
    return (
      <TanstackFormProvider value={ctxValue}>
        <form onSubmit={submitHandler} className={cn("space-y-6", className)}>
          {renderGlobalError()}
          {config.title && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{config.title}</h2>
              {config.description && <p className="text-muted-foreground">{config.description}</p>}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <form.Subscribe selector={(s: AnyFormState) => s.fieldMeta}>
            {() => (
              <div className="flex items-center justify-between">
                {config.sections.map((section, idx) => {
                  const errorCount = getSectionErrorCount(idx);
                  const completed = isSectionComplete(idx);
                  return (
                    <div key={section.id} className="flex items-center gap-2 flex-1">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all shrink-0 relative",
                        completed && idx < currentStep ? "bg-primary border-primary text-primary-foreground" : idx === currentStep ? "border-primary text-primary bg-background" : idx < currentStep ? "bg-primary border-primary text-primary-foreground" : "border-muted text-muted-foreground")}>
                        {completed && idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
                        {errorCount > 0 && <Badge variant="destructive" className="absolute -top-2 -end-2 h-4 w-4 p-0 text-[9px] flex items-center justify-center">{errorCount}</Badge>}
                      </div>
                      <span className={cn("text-xs font-medium hidden sm:block truncate", idx <= currentStep ? "text-foreground" : "text-muted-foreground")}>{section.title || `Step ${idx + 1}`}</span>
                      {idx < config.sections.length - 1 && <div className={cn("flex-1 h-0.5 mx-2", idx < currentStep ? "bg-primary" : "bg-muted")} />}
                    </div>
                  );
                })}
              </div>
            )}
          </form.Subscribe>
          <Card>
            {config.sections.map((section, idx) => (
              <div key={section.id} className={cn(idx !== currentStep && "hidden")}>
                {(section.title || section.description) && (
                  <CardHeader>
                    {section.title && <CardTitle>{section.title}</CardTitle>}
                    {section.description && <CardDescription>{section.description}</CardDescription>}
                  </CardHeader>
                )}
                <CardContent className={!section.title && !section.description ? "pt-6" : ""}>{renderSectionFields(idx)}</CardContent>
              </div>
            ))}
          </Card>
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
              <ChevronLeft className="h-4 w-4 me-1" />Previous
            </Button>
            {currentStep < totalSteps - 1 ? (
              <Button type="button" onClick={async () => {
                const valid = await validateSection(currentStep);
                if (valid) setCurrentStep(Math.min(totalSteps - 1, currentStep + 1));
              }}>
                Next<ChevronRight className="h-4 w-4 ms-1" />
              </Button>
            ) : renderSubmitButton()}
          </div>
        </form>
      </TanstackFormProvider>
    );
  }

  return null;
}
