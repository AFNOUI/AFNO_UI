"use client";

// import { useTranslation } from "react-i18next";
import { Settings, Mail, HelpCircle, Plus, Copy, Bell, Heart, MessageCircle, Share2, Bookmark, Trash2 } from "lucide-react";

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function TooltipPage() {
  // const { t } = useTranslation();

  const basicCode = `<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Add to library</p>
  </TooltipContent>
</Tooltip>`;

  const arrowCode = `import { TooltipArrow } from "@/components/ui/tooltip";

// Using showArrow prop
<TooltipContent showArrow>
  <p>Tooltip with arrow</p>
</TooltipContent>

// Using TooltipArrow component for custom styling
<TooltipContent>
  <p>Custom arrow</p>
  <TooltipArrow className="fill-primary" />
</TooltipContent>`;

  const positionsCode = `// Top (default)
<TooltipContent side="top" showArrow>Top</TooltipContent>

// Bottom
<TooltipContent side="bottom" showArrow>Bottom</TooltipContent>

// Left
<TooltipContent side="left" showArrow>Left</TooltipContent>

// Right
<TooltipContent side="right" showArrow>Right</TooltipContent>`;

  const styledCode = `// Primary styled with arrow
<TooltipContent 
  className="bg-primary text-primary-foreground border-primary"
  arrowClassName="fill-primary"
  showArrow
>
  Primary tooltip
</TooltipContent>

// Destructive styled
<TooltipContent 
  className="bg-destructive text-destructive-foreground border-destructive"
  arrowClassName="fill-destructive"
  showArrow
>
  Destructive tooltip
</TooltipContent>`;

  const richContentCode = `<TooltipContent className="w-64 p-3" showArrow>
  <div className="flex items-start gap-3">
    <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
    <div>
      <p className="font-semibold">John Doe</p>
      <p className="text-xs text-muted-foreground">Software Engineer</p>
    </div>
  </div>
</TooltipContent>`;

  return (
    <div className="space-y-8">
      <SectionTitle>Tooltip</SectionTitle>

      {/* Basic Tooltips */}
      <CodePreview title="Basic Tooltips" code={basicCode}>
        <div className="flex flex-wrap gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Need help?</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>

      {/* Arrow Tooltips - Using TooltipPrimitive.Arrow */}
      <CodePreview title="Arrow Tooltips (Using TooltipPrimitive.Arrow)" code={arrowCode}>
        <div className="flex flex-wrap gap-6 justify-center py-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Default Arrow</Button>
            </TooltipTrigger>
            <TooltipContent showArrow>
              <p>Tooltip with default arrow</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Primary Arrow</Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-primary text-primary-foreground border-primary"
              showArrow
              arrowClassName="fill-primary"
            >
              <p>Primary colored arrow</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Custom Arrow</Button>
            </TooltipTrigger>
            <TooltipContent className="bg-foreground text-background border-foreground">
              <p>Custom dark tooltip</p>
              <TooltipArrow className="fill-foreground" />
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Accent Arrow</Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-accent text-accent-foreground border-accent"
              showArrow
              arrowClassName="fill-accent"
            >
              <p>Accent colored arrow</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>

      {/* Positions with Arrows */}
      <CodePreview title="Tooltip Positions with Arrows" code={positionsCode}>
        <div className="flex flex-wrap gap-4 justify-center py-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Top</Button>
            </TooltipTrigger>
            <TooltipContent side="top" showArrow>
              <p>Top tooltip</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" showArrow>
              <p>Bottom tooltip</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Left</Button>
            </TooltipTrigger>
            <TooltipContent side="left" showArrow>
              <p>Left tooltip</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Right</Button>
            </TooltipTrigger>
            <TooltipContent side="right" showArrow>
              <p>Right tooltip</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>

      {/* Styled Tooltips with Arrows */}
      <CodePreview title="Styled Tooltips with Arrows" code={styledCode}>
        <div className="flex flex-wrap gap-4 justify-center py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Default</Button>
            </TooltipTrigger>
            <TooltipContent showArrow>
              <p>Default tooltip style</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Dark Theme</Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-foreground text-background border-foreground"
              showArrow
              arrowClassName="fill-foreground"
            >
              <p>Dark tooltip</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Primary Color</Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-primary text-primary-foreground border-primary"
              showArrow
              arrowClassName="fill-primary"
            >
              <p>Primary styled</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Success</Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-[hsl(var(--progress-success))] text-primary-foreground border-[hsl(var(--progress-success))]"
              showArrow
              arrowClassName="fill-[hsl(var(--progress-success))]"
            >
              <p>✓ Action completed</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Warning</Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-[hsl(var(--progress-warning))] text-foreground border-[hsl(var(--progress-warning))]"
              showArrow
              arrowClassName="fill-[hsl(var(--progress-warning))]"
            >
              <p>⚠ Be careful</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Destructive</Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-destructive text-destructive-foreground border-destructive"
              showArrow
              arrowClassName="fill-destructive"
            >
              <p>⚠ Danger zone</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>

      {/* Rich Content Tooltips */}
      <CodePreview title="Rich Content Tooltips with Arrows" code={richContentCode}>
        <div className="flex flex-wrap gap-6 justify-center py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">User Profile</Button>
            </TooltipTrigger>
            <TooltipContent className="w-64 p-3" side="bottom" showArrow>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  JD
                </div>
                <div>
                  <p className="font-semibold text-sm">John Doe</p>
                  <p className="text-xs text-muted-foreground">Software Engineer</p>
                  <p className="text-xs mt-1">Last active 2 hours ago</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-48 p-3" side="bottom" showArrow>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Notifications</span>
                  <Badge variant="secondary" className="text-xs">3 new</Badge>
                </div>
                <p className="text-xs text-muted-foreground">You have 3 unread notifications</p>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">
                <Heart className="mr-2 h-4 w-4" /> Like
              </Button>
            </TooltipTrigger>
            <TooltipContent className="p-3" side="bottom" showArrow>
              <div className="flex -space-x-2">
                {['JD', 'AB', 'CD', '+5'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-muted border-2 border-popover flex items-center justify-center text-xs font-medium"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">8 people liked this</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>

      {/* Interactive Toolbar with Tooltips */}
      <CodePreview title="Interactive Toolbar" code={`// Icon toolbar with arrow tooltips`}>
        <div className="flex items-center gap-1 p-2 border rounded-lg bg-muted/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" showArrow>
              <p>Add new item</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" showArrow>
              <p>Copy to clipboard</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Mail className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" showArrow>
              <p>Send email</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" showArrow>
              <p>Comment</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" showArrow>
              <p>Share</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Bookmark className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" showArrow>
              <p>Bookmark</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              showArrow
              className="bg-destructive text-destructive-foreground border-destructive"
              arrowClassName="fill-destructive"
            >
              <p>Delete item</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>

      {/* Keyboard Shortcuts */}
      <CodePreview title="Keyboard Shortcuts Tooltips" code={`// Show keyboard shortcuts in tooltips`}>
        <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </TooltipTrigger>
            <TooltipContent showArrow>
              <div className="flex items-center gap-2">
                <span>Copy</span>
                <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">⌘C</kbd>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
            </TooltipTrigger>
            <TooltipContent showArrow>
              <div className="flex items-center gap-2">
                <span>Open Settings</span>
                <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">⌘,</kbd>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                <HelpCircle className="h-4 w-4 mr-2" /> Help
              </Button>
            </TooltipTrigger>
            <TooltipContent showArrow>
              <div className="flex items-center gap-2">
                <span>Help Center</span>
                <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">?</kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>

      {/* Status Indicators */}
      <CodePreview title="Status Indicator Tooltips" code={`// Status indicators with detailed tooltips`}>
        <div className="flex items-center gap-6 p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--progress-success))] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--progress-success))]"></span>
                </span>
                <span className="text-sm">Online</span>
              </div>
            </TooltipTrigger>
            <TooltipContent showArrow>
              <p className="font-medium">System Status: Operational</p>
              <p className="text-xs text-muted-foreground">All systems running normally</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="h-3 w-3 rounded-full bg-[hsl(var(--progress-warning))]"></span>
                <span className="text-sm">Degraded</span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              showArrow
              className="bg-[hsl(var(--progress-warning))] text-foreground border-[hsl(var(--progress-warning))]"
              arrowClassName="fill-[hsl(var(--progress-warning))]"
            >
              <p className="font-medium">Partial Outage</p>
              <p className="text-xs">Some services experiencing delays</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="h-3 w-3 rounded-full bg-destructive"></span>
                <span className="text-sm">Offline</span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              showArrow
              className="bg-destructive text-destructive-foreground border-destructive"
              arrowClassName="fill-destructive"
            >
              <p className="font-medium">System Offline</p>
              <p className="text-xs">Service is currently unavailable</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CodePreview>
    </div>
  );
}
