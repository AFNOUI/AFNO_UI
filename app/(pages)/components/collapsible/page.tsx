"use client";

// import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronsUpDown, Folder, File, Settings, Plus, Minus } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function CollapsiblePage() {
  // const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    components: false,
  });

  const basicCode = `import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const [isOpen, setIsOpen] = useState(false);

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full justify-between">
      Toggle Section
      <ChevronsUpDown className="h-4 w-4" />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="p-4 border rounded-md mt-2">
      Content goes here
    </div>
  </CollapsibleContent>
</Collapsible>`;

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  // const fileTree = [
  //   {
  //     name: "src",
  //     type: "folder",
  //     children: [
  //       {
  //         name: "components",
  //         type: "folder",
  //         children: [
  //           { name: "Button.tsx", type: "file" },
  //           { name: "Card.tsx", type: "file" },
  //           { name: "Input.tsx", type: "file" },
  //         ]
  //       },
  //       { name: "App.tsx", type: "file" },
  //       { name: "main.tsx", type: "file" },
  //     ]
  //   }
  // ];

  return (
    <div className="space-y-6">
      <SectionTitle>Collapsibles</SectionTitle>

      <CodePreview title="Basic Collapsible" code={basicCode}>
        <div className="max-w-sm">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>@peduarte starred 3 repositories</span>
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                @radix-ui/primitives
              </div>
              <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                @radix-ui/colors
              </div>
              <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                @stitches/react
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CodePreview>

      <CodePreview title="File Tree Explorer" code={`// Nested collapsible file tree`}>
        <div className="max-w-xs rounded-md border p-2 bg-card">
          <Collapsible open={expandedFolders.src} onOpenChange={() => toggleFolder('src')}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full p-1 hover:bg-accent rounded text-sm">
              {expandedFolders.src ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-primary" />
              <span>src</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              <Collapsible open={expandedFolders.components} onOpenChange={() => toggleFolder('components')}>
                <CollapsibleTrigger className="flex items-center gap-1 w-full p-1 hover:bg-accent rounded text-sm">
                  {expandedFolders.components ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Folder className="h-4 w-4 text-primary" />
                  <span>components</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {["Button.tsx", "Card.tsx", "Input.tsx"].map(file => (
                    <div key={file} className="flex items-center gap-1 p-1 hover:bg-accent rounded text-sm cursor-pointer">
                      <span className="w-4" />
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span>{file}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              {["App.tsx", "main.tsx"].map(file => (
                <div key={file} className="flex items-center gap-1 p-1 hover:bg-accent rounded text-sm cursor-pointer">
                  <span className="w-4" />
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span>{file}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CodePreview>

      <CodePreview title="Settings Sections" code={`// Collapsible settings panel`}>
        <div className="max-w-md space-y-2">
          <Collapsible defaultOpen className="border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">General Settings</span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]>&]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Language</span>
                  <span className="text-sm text-muted-foreground">English</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Timezone</span>
                  <span className="text-sm text-muted-foreground">UTC-5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Date Format</span>
                  <span className="text-sm text-muted-foreground">MM/DD/YYYY</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className="border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Privacy Settings</span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]>&]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Profile Visibility</span>
                  <span className="text-sm text-muted-foreground">Public</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Show Email</span>
                  <span className="text-sm text-muted-foreground">Hidden</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CodePreview>

      <CodePreview title="FAQ Style" code={`// FAQ collapsible sections`}>
        <div className="max-w-lg space-y-2">
          {[
            { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers." },
            { q: "Can I cancel my subscription?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period." },
            { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee on all plans. Contact support if you'd like to request a refund." },
          ].map((faq, index) => (
            <Collapsible key={index} className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/50">
                <span className="font-medium">{faq.q}</span>
                <Plus className="h-4 w-4 shrink-0 ml-2 [[data-state=open]>&]:hidden" />
                <Minus className="h-4 w-4 shrink-0 ml-2 [[data-state=closed]>&]:hidden" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.a}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CodePreview>

      <CodePreview title="Animated Content" code={`// Collapsible with animation`}>
        <div className="max-w-md">
          <Card>
            <Collapsible defaultOpen>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Activity Log</CardTitle>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=closed]>&]:-rotate-90" />
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {[
                      { action: "Logged in", time: "2 minutes ago" },
                      { action: "Updated profile", time: "1 hour ago" },
                      { action: "Created new project", time: "3 hours ago" },
                      { action: "Invited team member", time: "1 day ago" },
                    ].map((log, index) => (
                      <div key={index} className="flex justify-between text-sm border-b pb-2 last:border-0">
                        <span>{log.action}</span>
                        <span className="text-muted-foreground">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </CodePreview>
    </div>
  );
}
