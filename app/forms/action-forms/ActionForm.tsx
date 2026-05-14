import { z } from "zod";
import { ChevronLeft, ChevronRight, AlertCircle, Check, AlertTriangle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActionForm } from "./useActionForm";
import type { FormConfig, FormSubmitHandler } from "../types/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ActionFormField } from "./ActionFormField";
import { ActionFormProvider } from "./ActionFormContext";

interface ActionFormProps {
  config: FormConfig;
  className?: string;
  onSubmit: FormSubmitHandler;
  initialValues?: Record<string, unknown>;
  schema: z.ZodType<Record<string, unknown>, Record<string, unknown>>;
}

export function ActionForm({ config, onSubmit, className, schema, initialValues }: ActionFormProps) {
  const {
    values, errors, isPending, setValue, setValues, watch, handleSubmit, reset,
    globalError, setGlobalError, currentStep, setCurrentStep,
    activeTab, setActiveTab, getSectionErrorCount, isSectionComplete,
    getOverallProgress, validateSection, handleTabChange,
  } = useActionForm({ config, schema, onSubmit, initialValues });

  const layout = config.layout || "single";
  const totalSteps = config.sections.length;
  const ctxValue = { values, errors, setValue, setValues, watch };

  const renderSectionFields = (sectionIndex: number) => {
    const section = config.sections[sectionIndex];
    if (!section) return null;
    return (
      <div className={cn("grid gap-4", section.columns === 2 && "md:grid-cols-2", section.columns === 3 && "md:grid-cols-3", section.columns === 4 && "md:grid-cols-4")}>
        {section.fields.map((field) => (
          <div key={field.name} style={field.colSpan && field.colSpan > 1 ? { gridColumn: `span ${field.colSpan}` } : undefined}>
            <ActionFormField config={field} />
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
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setGlobalError(null)}><X className="h-3 w-3" /></Button>
        </AlertDescription>
      </Alert>
    );
  };

  const submitBtn = (fullWidth = false) => (
    <Button type="submit" disabled={isPending} className={fullWidth ? "w-full" : ""}>
      {isPending ? "Submitting..." : config.submitLabel || "Submit"}
    </Button>
  );

  if (layout === "single") {
    return (
      <ActionFormProvider value={ctxValue}>
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
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
            {submitBtn()}
            {config.showReset && <Button type="button" variant="outline" onClick={reset}>{config.resetLabel || "Reset"}</Button>}
          </div>
        </form>
      </ActionFormProvider>
    );
  }

  if (layout === "compact") {
    return (
      <ActionFormProvider value={ctxValue}>
        <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
          {renderGlobalError()}
          {config.sections.map((section, idx) => <div key={section.id}>{renderSectionFields(idx)}</div>)}
          <div className="flex gap-4">{submitBtn(true)}</div>
        </form>
      </ActionFormProvider>
    );
  }

  if (layout === "multi-tab") {
    const currentIndex = config.sections.findIndex((s) => s.id === activeTab);
    const isFirst = currentIndex <= 0;
    const isLast = currentIndex >= config.sections.length - 1;
    return (
      <ActionFormProvider value={ctxValue}>
        <form onSubmit={handleSubmit} className={cn("space-y-0", className)}>
          {renderGlobalError()}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="bg-muted/30 border border-border rounded-t-lg px-2 pt-2">
              <TabsList className="h-auto bg-transparent p-0 gap-0 w-full justify-start flex-wrap">
                {config.sections.map((section, idx) => {
                  const errorCount = getSectionErrorCount(idx);
                  const completed = isSectionComplete(idx);
                  const isActive = section.id === activeTab;
                  return (
                    <TabsTrigger key={section.id} value={section.id} className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium gap-2">
                      {completed && !isActive && <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shrink-0"><Check className="h-2.5 w-2.5 text-primary-foreground" /></div>}
                      {section.title || section.id}
                      {errorCount > 0 && <Badge variant="destructive" className="h-5 px-1.5 text-[10px] gap-1"><AlertCircle className="h-3 w-3" />{errorCount}</Badge>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            <div className="border border-t-0 border-border rounded-b-lg">
              {config.sections.map((section, idx) => (
                <TabsContent key={section.id} value={section.id} className="mt-0 p-6">
                  {(section.title || section.description) && (
                    <div className="mb-6">
                      {section.title && <h3 className="text-lg font-semibold">{section.title}</h3>}
                      {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
                    </div>
                  )}
                  {renderSectionFields(idx)}
                </TabsContent>
              ))}
              <Separator />
              <div className="flex items-center justify-between p-4">
                <Button type="button" variant="secondary" onClick={reset}>Cancel</Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" disabled={isFirst} onClick={() => { if (currentIndex > 0) setActiveTab(config.sections[currentIndex - 1].id); }}>
                    <ChevronLeft className="h-4 w-4 me-1" />Previous
                  </Button>
                  {isLast ? submitBtn() : (
                    <Button type="button" onClick={async () => {
                      const valid = await validateSection(currentIndex);
                      if (valid && currentIndex < config.sections.length - 1) setActiveTab(config.sections[currentIndex + 1].id);
                    }}>Next<ChevronRight className="h-4 w-4 ms-1" /></Button>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </form>
      </ActionFormProvider>
    );
  }

  if (layout === "wizard") {
    const currentSection = config.sections[currentStep];
    const progress = getOverallProgress();
    return (
      <ActionFormProvider value={ctxValue}>
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
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
          <Card>
            {(currentSection?.title || currentSection?.description) && (
              <CardHeader>
                {currentSection.title && <CardTitle>{currentSection.title}</CardTitle>}
                {currentSection.description && <CardDescription>{currentSection.description}</CardDescription>}
              </CardHeader>
            )}
            <CardContent className={!currentSection?.title && !currentSection?.description ? "pt-6" : ""}>{renderSectionFields(currentStep)}</CardContent>
          </Card>
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
              <ChevronLeft className="h-4 w-4 me-1" />Previous
            </Button>
            {currentStep < totalSteps - 1 ? (
              <Button type="button" onClick={async () => {
                const valid = await validateSection(currentStep);
                if (valid) setCurrentStep(Math.min(totalSteps - 1, currentStep + 1));
              }}>Next<ChevronRight className="h-4 w-4 ms-1" /></Button>
            ) : submitBtn()}
          </div>
        </form>
      </ActionFormProvider>
    );
  }

  return null;
}
