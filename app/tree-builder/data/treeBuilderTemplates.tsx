/**
 * Five built-in tree variants — these power both the gallery preview and
 * the source-code export so consumers can drop one in directly.
 */
import type { TreeCanvasConfig, TreeNode, NodeRenderer } from "@/trees/types";
import { Badge } from "@/components/ui/badge";
import { Play, GitMerge, CheckCircle2, AlertTriangle, Mail, Webhook } from "lucide-react";

export type TreeComplexity = "basic" | "intermediate" | "advanced" | "expert";

export interface TreeRendererSources {
  /** Import lines emitted at the top of the generated renderers.tsx file. */
  imports?: string;
  /** Body of the single reusable renderer — a NodeRenderer expression. */
  reusable?: string;
  /** Map of nodeId → NodeRenderer expression (per-node overrides). */
  perNode?: Record<string, string>;
}

export interface TreeTemplate {
  title: string;
  description: string;
  complexity: TreeComplexity;
  config: TreeCanvasConfig;
  tree: TreeNode;
  /**
   * Source strings used by the code generator to emit a real `renderers.tsx`
   * file alongside `config.ts` / `data.ts`. Functions can't be JSON-serialised
   * so the generator reads these strings to reproduce them verbatim.
   */
  rendererSources?: TreeRendererSources;
}

const fulfilmentTree: TreeNode = {
  id: "order-pool", label: "Order Pool",
  meta: { badge: "ORDER POOL", locked: true },
  children: [
    {
      id: "fulfillment", label: "Fulfillment",
      meta: { badge: "FULFILLMENT", locked: true },
      children: [
        {
          id: "pick", label: "Pick",
          meta: { badge: "PICK", color: "hsl(var(--primary))" },
          children: [
            {
              id: "task-release", label: "Task Release",
              meta: { badge: "TASK RELEASE" },
              children: [
                { id: "full-pull", label: "Full Pallet Pull",
                  meta: { badge: "PICK", description: "AI Recommended" } },
                { id: "lpn-build", label: "Case → LPN Build",
                  meta: { badge: "PACK" },
                  children: [{
                    id: "consolidation", label: "Order Consolidation",
                    meta: { badge: "CONSOLIDATION" },
                    children: [{
                      id: "audit", label: "Order Audit",
                      meta: { badge: "AUDIT" },
                      children: [{
                        id: "vas", label: "Pallet Wrap",
                        meta: { badge: "VAS" },
                        children: [{
                          id: "label", label: "Print Labels",
                          meta: { badge: "LABEL" },
                          children: [{
                            id: "stage", label: "Stage by Carrier",
                            meta: { badge: "STAGE" },
                            children: [{
                              id: "ship", label: "Load LTL Shipment",
                              meta: { badge: "SHIP" },
                            }],
                          }],
                        }],
                      }],
                    }],
                  }],
                },
                { id: "sort-pack", label: "Sort & Pack", meta: { badge: "PACK" } },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const orgTree: TreeNode = {
  id: "ceo", label: "Chief Executive",
  meta: { badge: "CEO" },
  children: [
    { id: "cto", label: "CTO",
      meta: { badge: "Engineering" },
      children: [
        { id: "platform", label: "Platform Lead" },
        { id: "frontend", label: "Frontend Lead" },
        { id: "infra", label: "Infrastructure Lead" },
      ],
    },
    { id: "cpo", label: "CPO",
      meta: { badge: "Product" },
      children: [
        { id: "design", label: "Design Director" },
        { id: "research", label: "Research Lead" },
      ],
    },
    { id: "cmo", label: "CMO",
      meta: { badge: "Marketing" },
      children: [
        { id: "growth", label: "Growth" },
        { id: "brand", label: "Brand" },
      ],
    },
  ],
};

const mindmapTree: TreeNode = {
  id: "product-launch", label: "Product Launch",
  children: [
    { id: "research", label: "Research",
      children: [
        { id: "users", label: "User Interviews" },
        { id: "comp", label: "Competitive Audit" },
      ],
    },
    { id: "design", label: "Design",
      children: [
        { id: "ux", label: "UX Flows" },
        { id: "ui", label: "UI System" },
      ],
    },
    { id: "engineering", label: "Engineering",
      children: [
        { id: "api", label: "API" },
        { id: "client", label: "Client" },
      ],
    },
    { id: "gtm", label: "Go-To-Market",
      children: [
        { id: "press", label: "Press Kit" },
        { id: "launch", label: "Launch Campaign" },
      ],
    },
  ],
};

const radialTree: TreeNode = {
  id: "topic", label: "Climate Action",
  children: [
    { id: "energy", label: "Renewable Energy",
      children: [
        { id: "solar", label: "Solar" },
        { id: "wind", label: "Wind" },
      ],
    },
    { id: "transport", label: "Transport",
      children: [
        { id: "ev", label: "EV Adoption" },
        { id: "rail", label: "High-Speed Rail" },
      ],
    },
    { id: "land", label: "Land Use",
      children: [
        { id: "forest", label: "Reforestation" },
        { id: "soil", label: "Regenerative Soil" },
      ],
    },
    { id: "policy", label: "Policy",
      children: [
        { id: "carbon", label: "Carbon Pricing" },
        { id: "tax", label: "Tax Reform" },
      ],
    },
  ],
};

const decisionTree: TreeNode = {
  id: "incoming", label: "Incoming Request",
  meta: { shape: "diamond" },
  children: [
    { id: "valid", label: "Validate Schema",
      meta: { shape: "diamond" },
      children: [
        { id: "auth", label: "Auth?",
          meta: { shape: "diamond" },
          children: [
            { id: "rate", label: "Rate Limit?",
              meta: { shape: "diamond" },
              children: [
                { id: "process", label: "Process & Persist",
                  meta: { color: "hsl(160 84% 39%)" } },
                { id: "throttle", label: "429 Throttled",
                  meta: { color: "hsl(38 92% 50%)" } },
              ],
            },
            { id: "deny", label: "401 Unauthorized",
              meta: { color: "hsl(0 84% 60%)" } },
          ],
        },
        { id: "invalid", label: "400 Bad Request",
          meta: { color: "hsl(0 84% 60%)" } },
      ],
    },
  ],
};

/* ----------------------------- new trees ------------------------------ */

const fileTree: TreeNode = {
  id: "src", label: "src/",
  children: [
    { id: "components", label: "components/",
      children: [
        { id: "Button", label: "Button.tsx" },
        { id: "Card", label: "Card.tsx" },
        { id: "Modal", label: "Modal.tsx" },
      ],
    },
    { id: "hooks", label: "hooks/",
      children: [
        { id: "useAuth", label: "useAuth.ts" },
        { id: "useFetch", label: "useFetch.ts" },
      ],
    },
    { id: "pages", label: "pages/",
      children: [
        { id: "Home", label: "Home.tsx" },
        { id: "About", label: "About.tsx" },
      ],
    },
    { id: "App", label: "App.tsx" },
    { id: "main", label: "main.tsx" },
  ],
};

const sitemap: TreeNode = {
  id: "home", label: "Home",
  children: [
    { id: "products", label: "Products",
      children: [
        { id: "p-software", label: "Software" },
        { id: "p-hardware", label: "Hardware" },
        { id: "p-services", label: "Services" },
      ],
    },
    { id: "about", label: "About",
      children: [
        { id: "team", label: "Team" },
        { id: "careers", label: "Careers" },
      ],
    },
    { id: "blog", label: "Blog" },
    { id: "contact", label: "Contact" },
  ],
};

const ciPipeline: TreeNode = {
  id: "trigger", label: "Trigger",
  meta: { badge: "GIT PUSH", locked: true, color: "hsl(217 91% 60%)" },
  children: [{
    id: "ci", label: "Continuous Integration",
    meta: { badge: "CI" },
    children: [
      { id: "lint",  label: "Lint",       meta: { badge: "STATIC" } },
      { id: "unit",  label: "Unit Tests", meta: { badge: "TEST" } },
      { id: "build", label: "Build",      meta: { badge: "BUNDLE" },
        children: [{
          id: "deploy", label: "Deploy",
          meta: { badge: "CD" },
          children: [
            { id: "preview", label: "Preview Env", meta: { color: "hsl(38 92% 50%)" } },
            { id: "prod",    label: "Production",  meta: { color: "hsl(160 84% 39%)" } },
          ],
        }],
      },
    ],
  }],
};

/* ------------------------------ catalog -------------------------------- */

/* ────────────────────────────────────────────────────────────────────────
 * Workflow / pipeline flow data (merged from the former flowBuilderTemplates)
 * ──────────────────────────────────────────────────────────────────────── */
/* Reusable renderer (Case 1) for the Flow demo. */
const reusableFlowRenderer: NodeRenderer = ({ node, isRoot, childCount }) => (
  <div className="min-w-[160px] rounded-lg border-2 border-primary/40 bg-card px-3 py-2 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-sm font-semibold">{node.label}</span>
      {isRoot && <Badge className="h-4 px-1 text-[9px]">START</Badge>}
    </div>
    {node.meta?.description && (
      <div className="mt-1 truncate text-[10px] text-muted-foreground">{node.meta.description}</div>
    )}
    {childCount > 0 && (
      <div className="mt-1 text-[10px] text-primary">→ {childCount} branch{childCount === 1 ? "" : "es"}</div>
    )}
  </div>
);


const onboardingFlow: TreeNode = {
  id: "signup", label: "Sign Up",
  meta: { badge: "ENTRY", color: "hsl(217 91% 60%)" },
  children: [{
    id: "verify", label: "Verify Email",
    meta: { badge: "AUTH" },
    children: [
      { id: "profile", label: "Complete Profile",
        meta: { badge: "ONBOARD" },
        children: [
          { id: "tour", label: "Product Tour", meta: { badge: "EDUCATE" },
            children: [{ id: "active", label: "Active User", meta: { badge: "DONE", color: "hsl(160 84% 39%)" } }] },
          { id: "skip", label: "Skip Tour", meta: { badge: "EDUCATE" },
            children: [{ id: "active2", label: "Active User", meta: { badge: "DONE", color: "hsl(160 84% 39%)" } }] },
        ],
      },
      { id: "resend", label: "Resend Email", meta: { badge: "AUTH", color: "hsl(38 92% 50%)" } },
    ],
  }],
};

const supportFlow: TreeNode = {
  id: "ticket", label: "New Ticket",
  meta: { shape: "diamond", color: "hsl(217 91% 60%)" },
  children: [
    { id: "triage", label: "Triage",
      meta: { shape: "diamond" },
      children: [
        { id: "p1", label: "P1 — Critical",
          meta: { color: "hsl(0 84% 60%)" },
          children: [{ id: "page-on-call", label: "Page On-Call" }],
        },
        { id: "p2", label: "P2 — Standard",
          children: [
            { id: "assign", label: "Assign Agent" },
            { id: "respond", label: "Respond < 4h" },
          ],
        },
        { id: "spam", label: "Spam / Closed",
          meta: { color: "hsl(0 0% 50%)" },
        },
      ],
    },
  ],
};

const dataPipeline: TreeNode = {
  id: "ingest", label: "Ingest",
  meta: { badge: "SOURCE", locked: true, color: "hsl(217 91% 60%)" },
  children: [
    { id: "validate", label: "Validate",
      meta: { badge: "QA" },
      children: [
        { id: "transform", label: "Transform",
          meta: { badge: "ETL" },
          children: [
            { id: "warehouse", label: "Warehouse", meta: { badge: "STORE", color: "hsl(160 84% 39%)" } },
            { id: "lake", label: "Data Lake", meta: { badge: "STORE" } },
          ],
        },
        { id: "quarantine", label: "Quarantine", meta: { badge: "ERROR", color: "hsl(0 84% 60%)" } },
      ],
    },
  ],
};

const approvalFlow: TreeNode = {
  id: "request", label: "Submit Request",
  children: [{
    id: "review", label: "Manager Review",
    meta: { shape: "diamond" },
    children: [
      { id: "exec", label: "Exec Review",
        meta: { shape: "diamond" },
        children: [
          { id: "approved", label: "Approved", meta: { color: "hsl(160 84% 39%)" } },
          { id: "rejected2", label: "Rejected", meta: { color: "hsl(0 84% 60%)" } },
        ],
      },
      { id: "rejected", label: "Rejected", meta: { color: "hsl(0 84% 60%)" } },
    ],
  }],
};

/* ---- Credit Risk decision tree — showcases edgeLabel + maxChildren + actions ---- */
const creditRisk: TreeNode = {
  id: "income", label: "Income",
  meta: { badge: "INPUT", color: "hsl(160 84% 39%)", shape: "rounded",
    description: "Applicant gross annual income" },
  children: [
    { id: "hi", label: "Credit History",
      meta: { edgeLabel: "More than $50K", shape: "rounded", maxChildren: 3,
        action: { kind: "panel", title: "High income — review checklist",
          body: "Verify 24 months of payroll, ID, and any outstanding obligations. Auto-approve if score ≥ 720." } },
      children: [
        { id: "hi-good", label: "Low Risk",
          meta: { edgeLabel: "Good", color: "hsl(160 84% 39%)",
            action: { kind: "route", href: "/table-builder", label: "Open approved-applicants table" } } },
        { id: "hi-bad", label: "Moderate Risk",
          meta: { edgeLabel: "Bad", color: "hsl(38 92% 50%)",
            action: { kind: "dialog", title: "Manual review required",
              body: "This applicant fell into the moderate band. Route to a senior underwriter." } } },
        { id: "hi-unk", label: "Moderate Risk",
          meta: { edgeLabel: "Unknown", color: "hsl(38 92% 50%)",
            action: { kind: "drawer", title: "Pull credit bureau",
              body: "No credit file. Request a soft pull from Experian / Equifax before deciding." } } },
      ],
    },
    { id: "mid", label: "Credit History",
      meta: { edgeLabel: "$20–50K", shape: "rounded", maxChildren: 3,
        action: { kind: "none" } },
      children: [
        { id: "mid-good", label: "Low Risk",
          meta: { edgeLabel: "Good", color: "hsl(160 84% 39%)" } },
        { id: "mid-bad", label: "High Risk",
          meta: { edgeLabel: "Bad", color: "hsl(0 84% 60%)" } },
        { id: "mid-unk", label: "High Risk",
          meta: { edgeLabel: "Unknown", color: "hsl(0 84% 60%)" } },
      ],
    },
    { id: "lo", label: "High Risk",
      meta: { edgeLabel: "Less than $20K", color: "hsl(0 84% 60%)", maxChildren: 0,
        action: { kind: "dialog", title: "Auto-decline",
          body: "Income threshold not met. Send the rejection notice and log the decision." } } },
  ],
};


/* ---- Course → students (per-node dataset for sort/filter/search demo) ---- */

const STUDENT_NAMES = [
  "Aanya Shah", "Aarav Patel", "Aditi Rao", "Bilal Khan", "Catherine Wu",
  "Daniel Park", "Elena Rossi", "Farah Ahmed", "George Müller", "Hana Kim",
  "Ivan Petrov", "Jenna Cole", "Karan Gupta", "Lara Novak", "Marco Silva",
  "Nadia Haddad", "Oscar Lee", "Priya Iyer", "Quinn Reilly", "Riya Mehta",
];
function studentRows(seed: number) {
  return STUDENT_NAMES.map((name, i) => ({
    name,
    id: `S-${seed}${String(i).padStart(2, "0")}`,
    score: ((seed * 7 + i * 11) % 41) + 55, // 55–95
    grade: (() => {
      const s = ((seed * 7 + i * 11) % 41) + 55;
      return s >= 90 ? "A+" : s >= 80 ? "A" : s >= 70 ? "B" : "C";
    })(),
    attendance: 70 + ((seed * 3 + i * 5) % 30), // 70–99
  }));
}
const studentColumns = [
  { key: "name",       label: "Name",       type: "text" as const },
  { key: "id",         label: "ID",         type: "text" as const },
  { key: "score",      label: "Score",      type: "number" as const },
  { key: "grade",      label: "Grade",      type: "badge" as const },
  { key: "attendance", label: "Attend %",   type: "number" as const },
];
const enrollmentTree: TreeNode = {
  id: "school", label: "Spring '26 Enrolment",
  meta: { badge: "TERM", tags: ["root"] },
  children: [
    { id: "cs",  label: "Computer Science",
      meta: { badge: "DEPT", tags: ["dept", "stem"], sortKey: 3,
        dataset: { title: "CS roster", columns: studentColumns, rows: studentRows(1) } },
      children: [
        { id: "cs101", label: "CS101 — Intro",
          meta: { badge: "COURSE", tags: ["course", "stem", "freshman"], sortKey: 101,
            action: { kind: "table-dialog", title: "CS101 roster" },
            dataset: { title: "CS101 enrolled students", columns: studentColumns, rows: studentRows(2) } } },
        { id: "cs220", label: "CS220 — Algorithms",
          meta: { badge: "COURSE", tags: ["course", "stem", "sophomore"], sortKey: 220,
            action: { kind: "table-dialog", title: "CS220 roster" },
            dataset: { title: "CS220 enrolled students", columns: studentColumns, rows: studentRows(3) } } },
        { id: "cs330", label: "CS330 — Systems",
          meta: { badge: "COURSE", tags: ["course", "stem", "junior"], sortKey: 330,
            action: { kind: "table-dialog", title: "CS330 roster" },
            dataset: { title: "CS330 enrolled students", columns: studentColumns, rows: studentRows(4) } } },
      ],
    },
    { id: "math", label: "Mathematics",
      meta: { badge: "DEPT", tags: ["dept", "stem"], sortKey: 2,
        dataset: { title: "Math roster", columns: studentColumns, rows: studentRows(5) } },
      children: [
        { id: "ma120", label: "MA120 — Calculus",
          meta: { badge: "COURSE", tags: ["course", "stem", "freshman"], sortKey: 120,
            action: { kind: "table-dialog", title: "MA120 roster" },
            dataset: { columns: studentColumns, rows: studentRows(6) } } },
        { id: "ma240", label: "MA240 — Linear Algebra",
          meta: { badge: "COURSE", tags: ["course", "stem", "sophomore"], sortKey: 240,
            action: { kind: "table-dialog", title: "MA240 roster" },
            dataset: { columns: studentColumns, rows: studentRows(7) } } },
      ],
    },
    { id: "lit", label: "Literature",
      meta: { badge: "DEPT", tags: ["dept", "humanities"], sortKey: 1,
        dataset: { columns: studentColumns, rows: studentRows(8) } },
      children: [
        { id: "lt110", label: "LT110 — Poetry",
          meta: { badge: "COURSE", tags: ["course", "humanities", "freshman"], sortKey: 110,
            action: { kind: "table-dialog", title: "LT110 roster" },
            dataset: { columns: studentColumns, rows: studentRows(9) } } },
        { id: "lt210", label: "LT210 — Modern Novel",
          meta: { badge: "COURSE", tags: ["course", "humanities", "sophomore"], sortKey: 210,
            action: { kind: "table-dialog", title: "LT210 roster" },
            dataset: { columns: studentColumns, rows: studentRows(10) } } },
      ],
    },
  ],
};

/* ---- AfnoUI architecture map ---- */
const afnoArchitecture: TreeNode = {
  id: "afno", label: "Afno UI",
  meta: { badge: "APP", color: "hsl(217 91% 60%)", tags: ["root"] },
  children: [
    { id: "routing", label: "App Router (react-router-dom)",
      meta: { badge: "ROUTING", tags: ["infra"] },
      children: [
        { id: "layout", label: "AppLayout + Sidebar", meta: { tags: ["layout"] } },
        { id: "pages", label: "Pages",
          meta: { tags: ["pages"] },
          children: [
            { id: "p-form-builder",  label: "/form-builder",  meta: { tags: ["builder"] } },
            { id: "p-table-builder", label: "/table-builder", meta: { tags: ["builder"] } },
            { id: "p-kanban-builder",label: "/kanban-builder",meta: { tags: ["builder"] } },
            { id: "p-chart-dnd",     label: "/chart-dnd",     meta: { tags: ["builder"] } },
            { id: "p-tree-builder",  label: "/tree-builder",  meta: { tags: ["builder"] } },
            { id: "p-trees",         label: "/trees",         meta: { tags: ["variants"] } },
            { id: "p-forms",         label: "/forms",         meta: { tags: ["variants"] } },
            { id: "p-tables",        label: "/tables",        meta: { tags: ["variants"] } },
            { id: "p-kanban",        label: "/kanban",        meta: { tags: ["variants"] } },
          ],
        },
      ],
    },
    { id: "libs", label: "Shared libs",
      meta: { badge: "LIB", tags: ["infra"] },
      children: [
        { id: "lib-dnd",   label: "src/lib/dnd",   meta: { tags: ["lib"], description: "Pointer-based DnD primitive" } },
        { id: "lib-graph", label: "src/lib/graph", meta: { tags: ["lib"], description: "Toolbar + filter + dataset table" } },
        { id: "lib-sieve", label: "src/lib/sieve", meta: { tags: ["lib"], description: "SQL DSL + IR" } },
      ],
    },
    { id: "engines", label: "Renderer engines",
      meta: { badge: "ENGINE", tags: ["infra"] },
      children: [
        { id: "e-tree",   label: "TreeCanvas",   meta: { tags: ["engine"] } },
        { id: "e-kanban", label: "KanbanBoard",  meta: { tags: ["engine"] } },
        { id: "e-chart",  label: "GenericChart", meta: { tags: ["engine"] } },
        { id: "e-form",   label: "GenericForm",  meta: { tags: ["engine"] } },
        { id: "e-table",  label: "useTablePreview", meta: { tags: ["engine"] } },
      ],
    },
    { id: "primitives", label: "afnoui primitives",
      meta: { badge: "UI", tags: ["infra"] },
    },
  ],
};

/* ============================================================ */
/*  Phase 2 — new categorized variants                            */
/* ============================================================ */

/* ---- Click-action variants ---- */

const productCatalog: TreeNode = {
  id: "store", label: "Storefront",
  meta: { badge: "ROOT", color: "hsl(217 91% 60%)" },
  children: [
    { id: "apparel", label: "Apparel",
      meta: { badge: "CATEGORY",
        action: { kind: "dialog", title: "Apparel — featured",
          body: "Top 5 SKUs this week. Drop in a product table or carousel here." } },
      children: [
        { id: "tees", label: "T-Shirts",
          meta: { action: { kind: "dialog", title: "T-Shirts",
            body: "12 SKUs across 4 fits." } } },
        { id: "hoodies", label: "Hoodies",
          meta: { action: { kind: "dialog", title: "Hoodies",
            body: "8 SKUs, heavyweight cotton blend." } } },
      ] },
    { id: "shoes", label: "Footwear",
      meta: { badge: "CATEGORY",
        action: { kind: "dialog", title: "Footwear",
          body: "Sneakers, boots, sandals." } } },
    { id: "accessories", label: "Accessories",
      meta: { badge: "CATEGORY",
        action: { kind: "dialog", title: "Accessories",
          body: "Bags, hats, socks." } } },
  ],
};

const runbook: TreeNode = {
  id: "incident", label: "Incident Declared",
  meta: { badge: "P1", color: "hsl(0 84% 60%)" },
  children: [
    { id: "detect", label: "1. Detect & confirm",
      meta: { action: { kind: "panel", title: "Detect & confirm",
        body: "Check Datadog SLO dashboards. Confirm alert isn't a false positive by correlating two independent signals." } },
      children: [
        { id: "page", label: "2. Page on-call",
          meta: { action: { kind: "panel", title: "Page on-call",
            body: "Use PagerDuty. Escalate to L2 after 5 min if no ack." } },
          children: [
            { id: "mitigate", label: "3. Mitigate",
              meta: { action: { kind: "panel", title: "Mitigate",
                body: "Revert latest deploy, drain affected pods, or flip feature flag — whichever is cheapest to undo." } },
              children: [
                { id: "postmortem", label: "4. Postmortem",
                  meta: { color: "hsl(160 84% 39%)",
                    action: { kind: "panel", title: "Postmortem",
                      body: "Write within 48h. Blameless. Include timeline, contributing factors, and 3 action items." } } },
              ] },
          ] },
      ] },
  ],
};

const siteMap: TreeNode = {
  id: "site", label: "Afno UI",
  meta: { badge: "SITE", color: "hsl(217 91% 60%)" },
  children: [
    { id: "builders", label: "Builders",
      meta: { badge: "SECTION" },
      children: [
        { id: "sm-form",   label: "Form Builder",   meta: { action: { kind: "route", href: "/form-builder",   label: "Open Form Builder" } } },
        { id: "sm-table",  label: "Table Builder",  meta: { action: { kind: "route", href: "/table-builder",  label: "Open Table Builder" } } },
        { id: "sm-kanban", label: "Kanban Builder", meta: { action: { kind: "route", href: "/kanban-builder", label: "Open Kanban Builder" } } },
        { id: "sm-chart",  label: "Chart DnD",      meta: { action: { kind: "route", href: "/chart-dnd",      label: "Open Chart DnD" } } },
        { id: "sm-tree",   label: "Tree Builder",   meta: { action: { kind: "route", href: "/tree-builder",   label: "Open Tree Builder" } } },
      ] },
    { id: "variants", label: "Variant galleries",
      meta: { badge: "SECTION" },
      children: [
        { id: "sm-forms",  label: "Forms",  meta: { action: { kind: "route", href: "/forms",  label: "Open Forms" } } },
        { id: "sm-tables", label: "Tables", meta: { action: { kind: "route", href: "/tables", label: "Open Tables" } } },
        { id: "sm-kan",    label: "Kanban", meta: { action: { kind: "route", href: "/kanban", label: "Open Kanban" } } },
        { id: "sm-treev",  label: "Trees",  meta: { action: { kind: "route", href: "/trees",  label: "Open Tree gallery" } } },
      ] },
  ],
};

/* ---- Embedded table-preview variants ---- */

const ordersTree: TreeNode = {
  id: "orders", label: "Orders",
  meta: { badge: "ROOT", color: "hsl(217 91% 60%)" },
  children: [
    { id: "new", label: "New",
      meta: { color: "hsl(217 91% 60%)",
        dataset: { title: "New orders", columns: studentColumns, rows: studentRows(11) },
        action: { kind: "table-dialog", title: "New orders" } } },
    { id: "processing", label: "Processing",
      meta: { color: "hsl(38 92% 50%)",
        dataset: { title: "Processing", columns: studentColumns, rows: studentRows(12) },
        action: { kind: "table-dialog", title: "Processing orders" } } },
    { id: "shipped", label: "Shipped",
      meta: { color: "hsl(160 84% 39%)",
        dataset: { title: "Shipped", columns: studentColumns, rows: studentRows(13) },
        action: { kind: "table-dialog", title: "Shipped orders" } } },
    { id: "cancelled", label: "Cancelled",
      meta: { color: "hsl(0 84% 60%)",
        dataset: { title: "Cancelled", columns: studentColumns, rows: studentRows(14) },
        action: { kind: "table-dialog", title: "Cancelled orders" } } },
  ],
};

const cohortTree: TreeNode = {
  id: "cohort-root", label: "Q1 2026 cohorts",
  meta: { badge: "ROOT" },
  children: [
    { id: "cohort-a", label: "Cohort A — power users",
      meta: { dataset: { title: "Cohort A", columns: studentColumns, rows: studentRows(15) },
        action: { kind: "table-panel", title: "Cohort A — power users" } } },
    { id: "cohort-b", label: "Cohort B — at risk",
      meta: { color: "hsl(38 92% 50%)",
        dataset: { title: "Cohort B", columns: studentColumns, rows: studentRows(16) },
        action: { kind: "table-panel", title: "Cohort B — at risk" } } },
    { id: "cohort-c", label: "Cohort C — churned",
      meta: { color: "hsl(0 84% 60%)",
        dataset: { title: "Cohort C", columns: studentColumns, rows: studentRows(17) },
        action: { kind: "table-panel", title: "Cohort C — churned" } } },
  ],
};

/* ---- Static (no DnD, no table) variants ---- */

const staticOrgChart: TreeNode = {
  id: "ceo", label: "Asha Mehta — CEO",
  meta: { badge: "C-LEVEL", color: "hsl(217 91% 60%)" },
  children: [
    { id: "cto", label: "Ravi Patel — CTO", meta: { badge: "VP" },
      children: [
        { id: "eng-platform", label: "Platform Eng",  meta: { badge: "TEAM" } },
        { id: "eng-product",  label: "Product Eng",   meta: { badge: "TEAM" } },
        { id: "eng-data",     label: "Data Eng",      meta: { badge: "TEAM" } },
      ] },
    { id: "cpo", label: "Sara Kim — CPO", meta: { badge: "VP" },
      children: [
        { id: "design",  label: "Design",  meta: { badge: "TEAM" } },
        { id: "product", label: "PM",      meta: { badge: "TEAM" } },
      ] },
    { id: "cfo", label: "Lin Wei — CFO", meta: { badge: "VP" },
      children: [
        { id: "finance", label: "Finance", meta: { badge: "TEAM" } },
        { id: "legal",   label: "Legal",   meta: { badge: "TEAM" } },
      ] },
  ],
};

const staticMindmap: TreeNode = {
  id: "idea", label: "Product Strategy 2026",
  meta: { badge: "ROOT", color: "hsl(217 91% 60%)" },
  children: [
    { id: "growth", label: "Growth",
      children: [
        { id: "g-seo", label: "SEO content engine" },
        { id: "g-ref", label: "Referral program" },
        { id: "g-com", label: "Community-led GTM" },
      ] },
    { id: "retention", label: "Retention",
      children: [
        { id: "r-onb", label: "Activation onboarding" },
        { id: "r-edu", label: "Education series" },
      ] },
    { id: "monetize", label: "Monetization",
      children: [
        { id: "m-tier", label: "Usage-based tier" },
        { id: "m-ent",  label: "Enterprise SSO" },
      ] },
  ],
};

/* ---- Edge-label variants ---- */

const loanDecisionTree: TreeNode = {
  id: "loan", label: "Loan application",
  meta: { badge: "ROOT", color: "hsl(217 91% 60%)" },
  children: [
    { id: "credit", label: "Credit score",
      meta: { edgeLabel: "Score ≥ 700" },
      children: [
        { id: "c-good", label: "Approve", meta: { edgeLabel: "Good", color: "hsl(160 84% 39%)" } },
        { id: "c-bad",  label: "Review",  meta: { edgeLabel: "Bad",  color: "hsl(38 92% 50%)" } },
        { id: "c-unk",  label: "Pull bureau", meta: { edgeLabel: "Unknown" } },
      ] },
    { id: "credit2", label: "Manual review",
      meta: { edgeLabel: "Score 600–699" },
      children: [
        { id: "m-good", label: "Approve w/ limit", meta: { edgeLabel: "Good", color: "hsl(160 84% 39%)" } },
        { id: "m-bad",  label: "Decline",          meta: { edgeLabel: "Bad",  color: "hsl(0 84% 60%)" } },
        { id: "m-unk",  label: "Decline",          meta: { edgeLabel: "Unknown", color: "hsl(0 84% 60%)" } },
      ] },
    { id: "credit3", label: "Auto-decline",
      meta: { edgeLabel: "Score < 600", color: "hsl(0 84% 60%)" } },
  ],
};

const surveyFlow: TreeNode = {
  id: "q1", label: "Did you use the product this week?",
  meta: { badge: "Q1", color: "hsl(217 91% 60%)" },
  children: [
    { id: "q1-yes", label: "How satisfied are you?",
      meta: { edgeLabel: "Yes" },
      children: [
        { id: "csat-high", label: "Promoter",  meta: { edgeLabel: "9–10", color: "hsl(160 84% 39%)" } },
        { id: "csat-mid",  label: "Passive",   meta: { edgeLabel: "7–8",  color: "hsl(38 92% 50%)" } },
        { id: "csat-low",  label: "Detractor", meta: { edgeLabel: "0–6",  color: "hsl(0 84% 60%)" } },
      ] },
    { id: "q1-no", label: "Why not?",
      meta: { edgeLabel: "No" },
      children: [
        { id: "why-time", label: "No time",     meta: { edgeLabel: "Maybe" } },
        { id: "why-bug",  label: "Hit a bug",   meta: { edgeLabel: "No",   color: "hsl(0 84% 60%)" } },
      ] },
  ],
};

/* ---- AfnoUI feature catalog ---- */
const afnoFeatures: TreeNode = {
  id: "cap", label: "Afno UI Capabilities",
  meta: { badge: "CATALOG", color: "hsl(217 91% 60%)" },
  children: [
    { id: "f-form", label: "Form Builder",
      meta: { badge: "BUILDER", tags: ["builder"] },
      children: [
        { id: "ff-fields",     label: "20+ field types", meta: { tags: ["feature"] } },
        { id: "ff-validation", label: "Zod validation",  meta: { tags: ["feature"] } },
        { id: "ff-layouts",    label: "Layout picker",   meta: { tags: ["feature"] } },
        { id: "ff-export",     label: "Code export",     meta: { tags: ["feature"] } },
      ],
    },
    { id: "f-table", label: "Data Table Builder",
      meta: { badge: "BUILDER", tags: ["builder"] },
      children: [
        { id: "ft-sort",     label: "Sort & filter",     meta: { tags: ["feature"] } },
        { id: "ft-groups",   label: "Column groups",     meta: { tags: ["feature"] } },
        { id: "ft-cellJs",   label: "Cell JS runner",    meta: { tags: ["feature"] } },
        { id: "ft-api",      label: "API config",        meta: { tags: ["feature"] } },
      ],
    },
    { id: "f-kanban", label: "Kanban Builder",
      meta: { badge: "BUILDER", tags: ["builder"] },
      children: [
        { id: "fk-dnd",      label: "Custom DnD",        meta: { tags: ["feature"] } },
        { id: "fk-swimlane", label: "Swimlanes",         meta: { tags: ["feature"] } },
        { id: "fk-infinite", label: "Infinite scroll",   meta: { tags: ["feature"] } },
      ],
    },
    { id: "f-tree", label: "Tree & Flow",
      meta: { badge: "BUILDER", tags: ["builder"] },
      children: [
        { id: "ft-layouts5", label: "5 layouts",          meta: { tags: ["feature"] } },
        { id: "ft-dnd",      label: "Reparent DnD",       meta: { tags: ["feature"] } },
        { id: "ft-readonly", label: "Read-only mode",     meta: { tags: ["feature"] } },
        { id: "ft-filter",   label: "Search/sort/filter", meta: { tags: ["feature"] } },
        { id: "ft-data",     label: "Per-node datasets",  meta: { tags: ["feature"] } },
      ],
    },
    { id: "f-chart", label: "Chart DnD",
      meta: { badge: "BUILDER", tags: ["builder"] },
      children: [
        { id: "fc-stack", label: "Stacked variants",    meta: { tags: ["feature"] } },
        { id: "fc-grouped", label: "Grouped variants",  meta: { tags: ["feature"] } },
        { id: "fc-import",  label: "JSON import/export", meta: { tags: ["feature"] } },
      ],
    },
  ],
};

export const treeTemplates: Record<string, TreeTemplate> = {
  fulfilment: {
    title: "Fulfilment Pipeline",
    description: "Branching workflow with stage labels — like the warehouse fulfilment screenshot.",
    complexity: "expert",
    config: {
      title: "Fulfilment Pipeline",
      subtitle: "End-to-end LTL flow",
      layout: "horizontal",
      editable: true,
      showLevelLabels: true,
      panZoom: true,
      connector: "curved",
      background: "dots",
      siblingGap: 20,
      levelGap: 70,
      minHeight: 480,
    },
    tree: fulfilmentTree,
  },
  ciPipeline: {
    title: "CI/CD Pipeline (Drag to reorder)",
    description: "Reorderable workflow — drag any stage onto another to make it a child, before or after.",
    complexity: "expert",
    config: {
      title: "Release Pipeline",
      layout: "horizontal",
      editable: true,
      draggable: true,
      showLevelLabels: true,
      panZoom: true,
      connector: "curved",
      background: "dots",
      siblingGap: 18,
      levelGap: 80,
      minHeight: 460,
    },
    tree: ciPipeline,
  },
  fileTree: {
    title: "Sortable File Tree",
    description: "Vertical file explorer — drag files between folders, reorder siblings, rename inline.",
    complexity: "advanced",
    config: {
      title: "Project Files",
      layout: "vertical",
      editable: true,
      draggable: true,
      connector: "stepped",
      nodeShape: "rounded",
      panZoom: true,
      background: "grid",
      siblingGap: 12,
      levelGap: 56,
      minHeight: 520,
    },
    tree: fileTree,
  },
  org: {
    title: "Organisation Chart",
    description: "Top-down org chart with stepped connectors and breathing room.",
    complexity: "intermediate",
    config: {
      title: "Acme Inc. — Leadership",
      layout: "org",
      editable: true,
      draggable: true,
      connector: "stepped",
      nodeShape: "rounded",
      panZoom: true,
      background: "grid",
      minHeight: 520,
    },
    tree: orgTree,
  },
  sitemap: {
    title: "Static Sitemap (Read-only)",
    description: "Display-only tree — no add / edit / delete affordances. Perfect for documentation.",
    complexity: "basic",
    config: {
      title: "Marketing Site Map",
      layout: "horizontal",
      readOnly: true,
      connector: "curved",
      nodeShape: "pill",
      panZoom: true,
      background: "dots",
      siblingGap: 14,
      levelGap: 70,
      minHeight: 420,
    },
    tree: sitemap,
  },
  staticOrg: {
    title: "Static Org Chart (Read-only)",
    description: "Frozen org chart — great for printable directories or KPI dashboards.",
    complexity: "basic",
    config: {
      title: "Leadership Snapshot",
      layout: "org",
      readOnly: true,
      connector: "stepped",
      nodeShape: "rounded",
      panZoom: true,
      background: "none",
      minHeight: 460,
    },
    tree: orgTree,
  },
  mindmap: {
    title: "Mind Map",
    description: "Centre-out mind map with branches alternating left and right.",
    complexity: "advanced",
    config: {
      title: "Product Launch",
      layout: "mindmap",
      editable: true,
      draggable: true,
      connector: "curved",
      nodeShape: "pill",
      panZoom: true,
      background: "dots",
      siblingGap: 16,
      levelGap: 80,
      minHeight: 520,
    },
    tree: mindmapTree,
  },
  radial: {
    title: "Radial Tree",
    description: "Root in the centre, descendants spread on concentric rings.",
    complexity: "advanced",
    config: {
      title: "Climate Action",
      layout: "radial",
      editable: true,
      connector: "curved",
      nodeShape: "circle",
      panZoom: true,
      background: "none",
      siblingGap: 18,
      levelGap: 90,
      minHeight: 600,
    },
    tree: radialTree,
  },
  decision: {
    title: "Decision Tree",
    description: "Vertical flow with diamond decision nodes — perfect for branching logic.",
    complexity: "advanced",
    config: {
      title: "Request Pipeline",
      layout: "vertical",
      editable: true,
      connector: "stepped",
      nodeShape: "diamond",
      panZoom: true,
      background: "grid",
      siblingGap: 32,
      levelGap: 80,
      minHeight: 520,
    },
    tree: decisionTree,
  },


  /* ── Workflow / pipeline flows (merged from the former flowBuilderTemplates) ── */
  creditRisk: {
    title: "Credit Risk (edge labels + node actions)",
    description: "Income → credit history → outcome. Showcases edge labels, child limits, sibling-only DnD, and every onNodeAction mode.",
    complexity: "advanced",
    config: {
      title: "Credit Risk Decision Tree",
      layout: "horizontal",
      editable: true,
      draggable: true,
     
      showPositionControls: true,
      connector: "curved",
      panZoom: true,
      background: "dots",
      siblingGap: 28,
      levelGap: 110,
      minHeight: 480,
    },
    tree: creditRisk,
  },

  /**
   * Fixed-template nodes — admin defines a strict structural template via
   * `nodeBlueprints` + per-node `meta.allowedChildren`. End users can only
   * add children of allowed blueprint types; clicking + opens a typed picker.
   *
   * Existing nodes are locked (no rename / delete) so the skeleton stays
   * intact, but users may still add new child instances within the rules.
   */
  fixedTemplate: {
    title: "Fixed Template Nodes (blueprint-driven)",
    description: "Admin defines node types + allowed children; end users add instances within those rules via a typed picker.",
    complexity: "expert",
    config: {
      title: "Automation Template",
      subtitle: "Trigger → Filter → Action — add only what the template allows",
      layout: "horizontal",
      editable: true,
      draggable: false,
      connector: "stepped",
      panZoom: true,
      background: "blueprint",
      siblingGap: 24,
      levelGap: 100,
      minHeight: 420,
      // Strict global gates — only "add" is enabled, everything else off.
      allowAdd: true,
      allowEdit: false,
      allowDelete: false,
      allowDrag: false,
      // Blueprint registry — referenced by `meta.allowedChildren` on each node.
      nodeBlueprints: {
        filter: {
          label: "Filter step",
          description: "Conditional branch — pass/fail logic.",
          meta: {
            badge: "FILTER",
            color: "hsl(38 92% 50%)",
            allowedChildren: ["action", "filter"],
            maxChildren: 3,
          },
        },
        action: {
          label: "Action",
          description: "Side effect (email / webhook / DB write).",
          meta: {
            badge: "ACTION",
            color: "hsl(160 84% 39%)",
            // Leaf type — no children allowed.
            maxChildren: 0,
          },
        },
        notify: {
          label: "Notify",
          description: "Push notification or email.",
          meta: {
            badge: "NOTIFY",
            color: "hsl(217 91% 60%)",
            maxChildren: 0,
          },
        },
      },
    },
    tree: {
      id: "trigger",
      label: "On new record",
      meta: {
        badge: "TRIGGER",
        blueprintId: "trigger",
        color: "hsl(280 80% 60%)",
        locked: true,
        allowedChildren: ["filter", "action"],
        maxChildren: 4,
      },
      children: [
        {
          id: "f1",
          label: "Is premium customer?",
          meta: {
            badge: "FILTER",
            blueprintId: "filter",
            color: "hsl(38 92% 50%)",
            locked: true,
            allowedChildren: ["action", "notify"],
            maxChildren: 3,
          },
          children: [
            {
              id: "a1",
              label: "Send welcome email",
              meta: {
                badge: "ACTION",
                blueprintId: "action",
                color: "hsl(160 84% 39%)",
                locked: true,
                maxChildren: 0,
              },
            },
          ],
        },
        {
          id: "f2",
          label: "Has billing address?",
          meta: {
            badge: "FILTER",
            blueprintId: "filter",
            color: "hsl(38 92% 50%)",
            locked: true,
            allowedChildren: ["action"],
            maxChildren: 2,
          },
        },
      ],
    },
  },

  enrolment: {
    title: "Course Enrolment (sortable + per-node data)",
    description: "Departments → courses with student rosters on every node. Click a node to open the sortable / filterable data table.",
    complexity: "expert",
    config: {
      title: "Spring '26 Enrolment",
      layout: "horizontal",
      editable: true,
      draggable: true,
      showLevelLabels: true,
      panZoom: true,
      connector: "curved",
      background: "dots",
      siblingGap: 18,
      levelGap: 90,
      minHeight: 540,
    },
    tree: enrollmentTree,
  },
  onboarding: {
    title: "User Onboarding Flow",
    description: "Drag any step to reorder the funnel. Two terminal branches share the same outcome.",
    complexity: "advanced",
    config: {
      title: "Onboarding",
      layout: "horizontal",
      editable: true,
      draggable: true,
      showLevelLabels: true,
      panZoom: true,
      connector: "curved",
      background: "dots",
      siblingGap: 18,
      levelGap: 80,
      minHeight: 480,
    } satisfies TreeCanvasConfig,
    tree: onboardingFlow,
  },
  support: {
    title: "Support Triage (Decision Flow)",
    description: "Vertical decision flow with diamond gates and severity-coloured outcomes.",
    complexity: "expert",
    config: {
      title: "Support Triage",
      layout: "vertical",
      editable: true,
      draggable: true,
      connector: "stepped",
      nodeShape: "diamond",
      panZoom: true,
      background: "grid",
      siblingGap: 28,
      levelGap: 80,
      minHeight: 540,
    },
    tree: supportFlow,
  },
  data: {
    title: "Data Pipeline (Read-only)",
    description: "Locked, display-only pipeline diagram — perfect for runbooks and architecture docs.",
    complexity: "intermediate",
    config: {
      title: "ETL Overview",
      layout: "horizontal",
      readOnly: true,
      showLevelLabels: true,
      connector: "curved",
      panZoom: true,
      background: "dots",
      siblingGap: 16,
      levelGap: 80,
      minHeight: 440,
    },
    tree: dataPipeline,
  },
  approval: {
    title: "Approval Workflow",
    description: "Two-tier approval with diamond gates — drag rejects across tiers to remix the policy.",
    complexity: "advanced",
    config: {
      title: "Approval Workflow",
      layout: "vertical",
      editable: true,
      draggable: true,
      connector: "stepped",
      nodeShape: "rounded",
      panZoom: true,
      background: "grid",
      siblingGap: 30,
      levelGap: 78,
      minHeight: 500,
    },
    tree: approvalFlow,
  },
  afnoArchitecture: {
    title: "AfnoUI — Architecture Map (Read-only)",
    description: "Routes → pages → builders → shared libs → primitives. The full AfnoUI codebase rendered as a flow.",
    complexity: "expert",
    config: {
      title: "AfnoUI Architecture",
      layout: "horizontal",
      readOnly: true,
      connector: "curved",
      nodeShape: "rounded",
      panZoom: true,
      background: "dots",
      siblingGap: 14,
      levelGap: 80,
      minHeight: 640,
    },
    tree: afnoArchitecture,
  },
  afnoFeatures: {
    title: "AfnoUI — Feature Catalog (Read-only)",
    description: "Every builder grouped with its capabilities as child nodes — useful for product overview decks.",
    complexity: "intermediate",
    config: {
      title: "AfnoUI Capabilities",
      layout: "vertical",
      readOnly: true,
      connector: "stepped",
      nodeShape: "rounded",
      panZoom: true,
      background: "grid",
      siblingGap: 22,
      levelGap: 70,
      minHeight: 560,
    },
    tree: afnoFeatures,
  },

  /* ============ Phase 2 — Click-action variants ============ */
  dialogProductCatalog: {
    title: "Click → Dialog (product catalog)",
    description: "Clicking any category opens a afnoui Dialog. Drop in your own catalog table or carousel.",
    complexity: "intermediate",
    config: {
      title: "Product Catalog",
      layout: "horizontal", editable: true, draggable: true,
      showPositionControls: true, connector: "curved", panZoom: true, background: "dots",
      siblingGap: 22, levelGap: 100, minHeight: 460,
    },
    tree: productCatalog,
  },
  panelRunbook: {
    title: "Click → Inline panel (incident runbook)",
    description: "Each step opens a panel below the canvas with detailed instructions. Great for runbooks.",
    complexity: "intermediate",
    config: {
      title: "Incident Runbook",
      layout: "vertical", editable: true, draggable: true,
      connector: "stepped", panZoom: true, background: "grid",
      siblingGap: 28, levelGap: 80, minHeight: 500,
    },
    tree: runbook,
  },
  routeSiteMap: {
    title: "Click → Route (site map)",
    description: "Every leaf is a real route — click navigates to the actual page in this app.",
    complexity: "basic",
    config: {
      title: "Afno UI Site Map",
      layout: "horizontal", readOnly: true, connector: "curved", panZoom: true, background: "dots",
      siblingGap: 14, levelGap: 90, minHeight: 520,
    },
    tree: siteMap,
  },

  /* ============ Phase 2 — Embedded TablePreview ============ */
  tableDialogOrders: {
    title: "Click → Table in dialog (orders)",
    description: "Each status node opens a sortable / filterable data table in a dialog.",
    complexity: "advanced",
    config: {
      title: "Orders by status",
      layout: "horizontal", editable: true, draggable: true,
      connector: "curved", panZoom: true, background: "dots",
      siblingGap: 22, levelGap: 100, minHeight: 420,
    },
    tree: ordersTree,
  },
  tablePanelCohort: {
    title: "Click → Table panel (cohorts)",
    description: "Click a cohort to expand the table panel below the flow. Same data toolbar as Table Builder.",
    complexity: "advanced",
    config: {
      title: "Q1 cohorts",
      layout: "vertical", editable: true, draggable: true,
      connector: "stepped", panZoom: true, background: "grid",
      siblingGap: 26, levelGap: 76, minHeight: 460,
    },
    tree: cohortTree,
  },

  /* ============ Phase 2 — Static (no DnD, no table) ============ */
  staticOrgChart: {
    title: "Static org chart (no DnD)",
    description: "Read-only org chart — perfect for slide decks and onboarding docs.",
    complexity: "basic",
    config: {
      title: "Org Chart",
      layout: "vertical", readOnly: true, connector: "stepped", nodeShape: "rounded",
      panZoom: true, background: "grid", siblingGap: 24, levelGap: 80, minHeight: 480,
    },
    tree: staticOrgChart,
  },
  staticMindmap: {
    title: "Static mindmap (radial, no editing)",
    description: "Read-only mindmap — click-to-focus only. Ideal for brainstorm exports.",
    complexity: "basic",
    config: {
      title: "Product Strategy 2026",
      layout: "mindmap", readOnly: true, connector: "curved",
      panZoom: true, background: "dots", siblingGap: 24, levelGap: 130, minHeight: 540,
    },
    tree: staticMindmap,
  },

  /* ============ Phase 2 — Edge-label variants ============ */
  edgeDecisionTree: {
    title: "Edge-labelled decision tree (loans)",
    description: "Every connector carries the decision criterion. Good / Bad / Unknown branches.",
    complexity: "advanced",
    config: {
      title: "Loan decision tree",
      layout: "horizontal", editable: true, draggable: true,
      showPositionControls: true, connector: "curved", panZoom: true, background: "dots",
      siblingGap: 24, levelGap: 120, minHeight: 480,
    },
    tree: loanDecisionTree,
  },
  edgeSurveyFlow: {
    title: "Edge-labelled survey flow",
    description: "Branching survey with Yes / No / Maybe edges. Showcases mid-tree branching with labels.",
    complexity: "intermediate",
    config: {
      title: "NPS survey flow",
      layout: "vertical", editable: true, draggable: true,
      connector: "stepped", panZoom: true, background: "grid",
      siblingGap: 24, levelGap: 90, minHeight: 480,
    },
    tree: surveyFlow,
  },

  /* ============================================================
   * Renderer demos — three cases of the JSON-configured renderer
   *   1. config.renderNode  (single reusable for every node)
   *   2. meta.render        (per-node override)
   *   3. neither            (built-in fallback)
   * ============================================================ */
  rendererReusable: {
    title: "Renderer demo — single reusable",
    description: "`config.renderNode` is set once and every node renders through the same component (tanstack DataTable column-cell style).",
    complexity: "intermediate",
    config: {
      title: "Reusable node renderer",
      layout: "horizontal",
      editable: true, draggable: true,
      connector: "curved", panZoom: true, background: "dots",
      siblingGap: 22, levelGap: 110, minHeight: 420,
      renderNode: reusableFlowRenderer,
    },
    tree: {
      id: "trigger", label: "Webhook received",
      meta: { description: "POST /events" },
      children: [
        { id: "validate", label: "Validate payload", meta: { description: "Zod schema" },
          children: [
            { id: "enrich", label: "Enrich with user", meta: { description: "users.find" },
              children: [
                { id: "notify", label: "Notify Slack", meta: { description: "#alerts" } },
                { id: "store", label: "Persist event", meta: { description: "events table" } },
              ] },
            { id: "dlq", label: "Dead-letter", meta: { description: "DLQ topic" } },
          ] },
      ],
    },
    rendererSources: {
      imports: `import type { NodeRenderer } from "@/components/tree/types";
import { Badge } from "@/components/ui/badge";`,
      reusable: `({ node, isRoot, childCount }) => (
  <div className="min-w-[160px] rounded-lg border-2 border-primary/40 bg-card px-3 py-2 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-sm font-semibold">{node.label}</span>
      {isRoot && <Badge className="h-4 px-1 text-[9px]">START</Badge>}
    </div>
    {node.meta?.description && (
      <div className="mt-1 truncate text-[10px] text-muted-foreground">{node.meta.description}</div>
    )}
    {childCount > 0 && (
      <div className="mt-1 text-[10px] text-primary">→ {childCount} branch{childCount === 1 ? "" : "es"}</div>
    )}
  </div>
)`,
    } satisfies TreeRendererSources,
  },

  rendererPerNode: {
    title: "Renderer demo — per-node overrides",
    description: "Each node declares its own `meta.render`. Trigger / branch / outcome nodes all look different.",
    complexity: "advanced",
    config: {
      title: "Per-node renderers",
      layout: "horizontal",
      editable: true, draggable: true,
      connector: "curved", panZoom: true, background: "dots",
      siblingGap: 26, levelGap: 120, minHeight: 460,
    },
    tree: {
      id: "start", label: "Order placed",
      meta: {
        render: ({ node }) => (
          <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-white shadow-md">
            <Play className="h-3.5 w-3.5" />
            <span className="text-sm font-semibold">{node.label}</span>
          </div>
        ),
      },
      children: [
        {
          id: "decide", label: "Stock available?",
          meta: {
            render: ({ node }) => (
              <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-amber-500 bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                <GitMerge className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold">{node.label}</span>
              </div>
            ),
          },
          children: [
            {
              id: "ship", label: "Ship order",
              meta: {
                render: ({ node }) => (
                  <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">{node.label}</span>
                    <Badge variant="outline" className="h-4 px-1 text-[10px]">SLA 24h</Badge>
                  </div>
                ),
              },
              children: [
                {
                  id: "email", label: "Send email",
                  meta: {
                    render: ({ node }) => (
                      <div className="flex items-center gap-2 rounded-md bg-blue-500/10 px-3 py-2 text-blue-700 dark:text-blue-300">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-sm">{node.label}</span>
                      </div>
                    ),
                  },
                },
                {
                  id: "wh", label: "Webhook out",
                  meta: {
                    render: ({ node }) => (
                      <div className="flex items-center gap-2 rounded-md bg-purple-500/10 px-3 py-2 text-purple-700 dark:text-purple-300">
                        <Webhook className="h-3.5 w-3.5" />
                        <span className="text-sm">{node.label}</span>
                      </div>
                    ),
                  },
                },
              ],
            },
            {
              id: "back", label: "Backorder",
              meta: {
                render: ({ node }) => (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-semibold">{node.label}</span>
                  </div>
                ),
              },
            },
          ],
        },
      ],
    },
    rendererSources: {
      imports: `import type { NodeRenderer } from "@/components/tree/types";
import { Badge } from "@/components/ui/badge";
import { Play, GitMerge, CheckCircle2, AlertTriangle, Mail, Webhook } from "lucide-react";`,
      perNode: {
        start: `({ node }) => (
  <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-white shadow-md">
    <Play className="h-3.5 w-3.5" />
    <span className="text-sm font-semibold">{node.label}</span>
  </div>
)`,
        decide: `({ node }) => (
  <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-amber-500 bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
    <GitMerge className="h-4 w-4 text-amber-600" />
    <span className="text-sm font-semibold">{node.label}</span>
  </div>
)`,
        ship: `({ node }) => (
  <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 shadow-sm">
    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    <span className="text-sm">{node.label}</span>
    <Badge variant="outline" className="h-4 px-1 text-[10px]">SLA 24h</Badge>
  </div>
)`,
        email: `({ node }) => (
  <div className="flex items-center gap-2 rounded-md bg-blue-500/10 px-3 py-2 text-blue-700 dark:text-blue-300">
    <Mail className="h-3.5 w-3.5" />
    <span className="text-sm">{node.label}</span>
  </div>
)`,
        wh: `({ node }) => (
  <div className="flex items-center gap-2 rounded-md bg-purple-500/10 px-3 py-2 text-purple-700 dark:text-purple-300">
    <Webhook className="h-3.5 w-3.5" />
    <span className="text-sm">{node.label}</span>
  </div>
)`,
        back: `({ node }) => (
  <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
    <AlertTriangle className="h-4 w-4" />
    <span className="text-sm font-semibold">{node.label}</span>
  </div>
)`,
      },
    } satisfies TreeRendererSources,
  },

  rendererFallback: {
    title: "Renderer demo — built-in fallback",
    description: "Neither `config.renderNode` nor `meta.render` is set — every node falls back to the built-in default body.",
    complexity: "basic",
    config: {
      title: "Fallback renderer",
      layout: "horizontal",
      editable: true, draggable: true,
      connector: "curved", panZoom: true, background: "dots",
      siblingGap: 18, levelGap: 90, minHeight: 380,
    },
    tree: {
      id: "lead", label: "New lead",
      meta: { description: "From form submission" },
      children: [
        { id: "score", label: "Lead score", meta: { description: "0–100" },
          children: [
            { id: "hot", label: "Hot lead", meta: { description: "Route to sales" } },
            { id: "warm", label: "Warm lead", meta: { description: "Drip campaign" } },
            { id: "cold", label: "Cold lead", meta: { description: "Newsletter only" } },
          ] },
      ],
    },
  },
};

export const defaultTreeKey = "fulfilment";
