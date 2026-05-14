import { BuilderNode, generateId } from "@/ui-builder/data/uiBuilderRegistry";

function n(type: string, props: Record<string, unknown>, styles: Record<string, string>, children: BuilderNode[] = []): BuilderNode {
  return { id: generateId(), type, props, styles: { base: styles }, children };
}

export interface UiTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: () => BuilderNode[];
}

export const uiTemplates: UiTemplate[] = [
  {
    id: "pricing-grid-row",
    name: "Pricing Row (Grid)",
    description: "3 pricing cards already aligned in one row using grid",
    category: "Application",
    nodes: () => [
      n("container", {}, { padding: "py-12 px-6", maxWidth: "max-w-6xl", margin: "mx-auto" }, [
        n("heading", { text: "Pricing", level: "h2" }, { fontSize: "text-3xl", fontWeight: "font-bold", textAlign: "text-center", margin: "mb-8" }),
        n("grid", { columns: "3" }, { display: "grid", gridCols: "grid-cols-3", gap: "gap-6" }, [
          n("pricing", { title: "Starter", price: "$0", period: "/month", features: "1 project\nBasic analytics\nEmail support", cta: "Get Started", highlighted: false }, { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card", height: "h-full" }),
          n("pricing", { title: "Pro", price: "$29", period: "/month", features: "Unlimited projects\nAdvanced analytics\nPriority support", cta: "Start Trial", highlighted: true }, { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card", height: "h-full" }),
          n("pricing", { title: "Enterprise", price: "$99", period: "/month", features: "Unlimited team\nSSO\nDedicated support", cta: "Contact Sales", highlighted: false }, { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card", height: "h-full" }),
        ]),
      ]),
    ],
  },
  {
    id: "cards-row-flex",
    name: "Cards Row (Flex)",
    description: "3 equal cards in one row using flex",
    category: "Application",
    nodes: () => [
      n("container", {}, { padding: "py-12 px-6", maxWidth: "max-w-6xl", margin: "mx-auto" }, [
        n("heading", { text: "Stats Overview", level: "h2" }, { fontSize: "text-3xl", fontWeight: "font-bold", textAlign: "text-center", margin: "mb-8" }),
        n("flex", {}, { display: "flex", flexWrap: "flex-nowrap", gap: "gap-6", alignItems: "items-stretch", justifyContent: "justify-start" }, [
          n("stat-card", { title: "Revenue", value: "$24K", change: "+12%", changeType: "positive", variant: "default" }, { padding: "p-6", borderRadius: "rounded-xl", width: "w-full" }),
          n("stat-card", { title: "Users", value: "1.2K", change: "+4%", changeType: "positive", variant: "highlight" }, { padding: "p-6", borderRadius: "rounded-xl", width: "w-full" }),
          n("stat-card", { title: "Churn", value: "2.1%", change: "-1.1%", changeType: "negative", variant: "outline" }, { padding: "p-6", borderRadius: "rounded-xl", width: "w-full" }),
        ]),
      ]),
    ],
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "Hero + Features + Testimonials + CTA + Footer",
    category: "Marketing",
    nodes: () => [
      n("hero", {}, { padding: "py-20 px-6", textAlign: "text-center" }, [
        n("badge", { text: "✨ New Release", variant: "secondary" }, { margin: "mb-4" }),
        n("heading", { text: "Ship Faster, Build Smarter", level: "h1" }, { fontSize: "text-5xl", fontWeight: "font-extrabold", color: "text-foreground", margin: "mb-4" }),
        n("text", { text: "The modern platform for building beautiful web applications without limits." }, { fontSize: "text-xl", color: "text-muted-foreground", maxWidth: "max-w-2xl", margin: "mx-auto mb-8" }),
        n("button", { text: "Get Started Free", variant: "default", size: "lg" }, {}),
      ]),
      n("feature-grid", {
        features: "Lightning Fast\nBuilt for performance from day one\nSecure by Default\nEnterprise-grade security\nFlexible\nAdapts to any workflow\nReliable\n99.99% uptime SLA",
      }, { display: "grid", gridCols: "grid-cols-2", gap: "gap-6", padding: "py-12 px-6", maxWidth: "max-w-4xl", margin: "mx-auto" }),
      n("section", {}, { padding: "py-12 px-6" }, [
        n("heading", { text: "What Our Users Say", level: "h2" }, { fontSize: "text-3xl", fontWeight: "font-bold", textAlign: "text-center", margin: "mb-8" }),
        n("grid", { columns: "3" }, { display: "grid", gridCols: "grid-cols-3", gap: "gap-6" }, [
          n("testimonial", { quote: "Best tool we've ever used for building pages.", author: "Sarah Chen", role: "CTO at TechCo" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("testimonial", { quote: "Saved us hundreds of hours of development time.", author: "Mike Johnson", role: "Lead Dev at StartupXYZ" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("testimonial", { quote: "The drag and drop builder is incredibly intuitive.", author: "Emily Davis", role: "Designer at AgencyPro" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
        ]),
      ]),
      n("cta", {}, { padding: "p-10", borderRadius: "rounded-2xl", background: "bg-primary/5", textAlign: "text-center", border: "border border-primary/20" }, [
        n("heading", { text: "Ready to get started?", level: "h3" }, { fontSize: "text-2xl", fontWeight: "font-bold", margin: "mb-3" }),
        n("text", { text: "Join 10,000+ teams building with our platform." }, { color: "text-muted-foreground", margin: "mb-6" }),
        n("button", { text: "Start Free Trial", variant: "default" }, {}),
      ]),
      n("footer", { brand: "Acme Inc", links: "About\nBlog\nCareers\nContact\nPrivacy\nTerms", copyright: "© 2026 Acme Inc. All rights reserved." }, { padding: "py-12 px-6", background: "bg-muted" }),
    ],
  },
  {
    id: "pricing",
    name: "Pricing Page",
    description: "Header + 3-column pricing cards + FAQ",
    category: "Marketing",
    nodes: () => [
      n("section", {}, { padding: "py-16 px-6", textAlign: "text-center" }, [
        n("badge", { text: "Pricing", variant: "outline" }, { margin: "mb-4" }),
        n("heading", { text: "Simple, Transparent Pricing", level: "h1" }, { fontSize: "text-4xl", fontWeight: "font-bold", margin: "mb-4" }),
        n("text", { text: "Choose the plan that works best for you and your team." }, { fontSize: "text-lg", color: "text-muted-foreground", maxWidth: "max-w-xl", margin: "mx-auto mb-10" }),
      ]),
      n("grid", { columns: "3" }, { display: "grid", gridCols: "grid-cols-3", gap: "gap-6", padding: "px-6", maxWidth: "max-w-5xl", margin: "mx-auto" }, [
        n("pricing", { title: "Starter", price: "$0", period: "/month", features: "1 project\n100 pages\nBasic analytics\nEmail support", cta: "Get Started", highlighted: false }, { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
        n("pricing", { title: "Pro", price: "$29", period: "/month", features: "Unlimited projects\n10 team members\nAdvanced analytics\nPriority support\nCustom domain", cta: "Start Free Trial", highlighted: true }, { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
        n("pricing", { title: "Enterprise", price: "$99", period: "/month", features: "Everything in Pro\nUnlimited team members\nSSO & SAML\nDedicated account manager\nSLA guarantee", cta: "Contact Sales", highlighted: false }, { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
      ]),
      n("faq", { title: "Frequently Asked Questions", items: "Can I switch plans?\nYes, you can upgrade or downgrade at any time.\nIs there a free trial?\nYes, all paid plans include a 14-day free trial.\nWhat payment methods do you accept?\nWe accept all major credit cards and PayPal." }, { padding: "py-12 px-6", maxWidth: "max-w-3xl", margin: "mx-auto" }),
    ],
  },
  {
    id: "blog",
    name: "Blog Post",
    description: "Header + Image + Content + Author Card",
    category: "Content",
    nodes: () => [
      n("container", {}, { padding: "p-6", maxWidth: "max-w-3xl", margin: "mx-auto" }, [
        n("badge", { text: "Tutorial", variant: "secondary" }, { margin: "mb-4" }),
        n("heading", { text: "How to Build Modern Web Applications", level: "h1" }, { fontSize: "text-4xl", fontWeight: "font-bold", margin: "mb-4" }),
        n("text", { text: "Published on March 15, 2026 · 8 min read" }, { fontSize: "text-sm", color: "text-muted-foreground", margin: "mb-8" }),
        n("image", { src: "https://placehold.co/800x400/1a1a2e/e0e0e0?text=Blog+Cover", alt: "Blog cover" }, { width: "w-full", borderRadius: "rounded-xl", margin: "mb-8" }),
        n("text", { text: "Modern web development has evolved significantly over the past few years. In this guide, we'll explore the key concepts and tools you need to know to build production-ready applications.\n\nWe'll cover everything from choosing the right framework to deploying your application to production." }, { fontSize: "text-lg", color: "text-muted-foreground", lineHeight: "leading-relaxed", margin: "mb-8" }),
        n("heading", { text: "Getting Started", level: "h2" }, { fontSize: "text-2xl", fontWeight: "font-bold", margin: "mb-4" }),
        n("text", { text: "First, let's set up our development environment. You'll need Node.js installed on your machine along with a package manager like npm or yarn." }, { color: "text-muted-foreground", lineHeight: "leading-relaxed", margin: "mb-6" }),
        n("divider", {}, { margin: "my-8" }),
        n("card", {}, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card", shadow: "shadow-sm" }, [
          n("flex", {}, { display: "flex", gap: "gap-4", alignItems: "items-center" }, [
            n("avatar", { src: "https://placehold.co/80x80/1a1a2e/e0e0e0?text=JD", fallback: "JD" }, {}),
            n("container", {}, {}, [
              n("heading", { text: "John Doe", level: "h4" }, { fontSize: "text-base", fontWeight: "font-semibold" }),
              n("text", { text: "Senior Developer & Technical Writer" }, { fontSize: "text-sm", color: "text-muted-foreground" }),
            ]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Stats + Data Table + Metric Widgets",
    category: "Application",
    nodes: () => [
      n("section", {}, { padding: "py-8 px-6" }, [
        n("heading", { text: "Dashboard", level: "h1" }, { fontSize: "text-3xl", fontWeight: "font-bold", margin: "mb-2" }),
        n("text", { text: "Welcome back! Here's your overview." }, { color: "text-muted-foreground", margin: "mb-8" }),
        n("grid", { columns: "4" }, { display: "grid", gridCols: "grid-cols-4", gap: "gap-4" }, [
          n("stat-card", { title: "Total Revenue", value: "$45,231", change: "+20.1%", changeType: "positive" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("stat-card", { title: "Subscriptions", value: "2,350", change: "+180", changeType: "positive" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("stat-card", { title: "Active Users", value: "12,234", change: "+19%", changeType: "positive" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("stat-card", { title: "Bounce Rate", value: "24.5%", change: "-4.3%", changeType: "negative" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
        ]),
        n("spacer", { height: "24" }, {}),
        n("data-table", {
          headers: "Name\nEmail\nStatus\nRole",
          rows: "John Doe\njohn@example.com\nActive\nAdmin\nJane Smith\njane@example.com\nPending\nUser\nBob Wilson\nbob@example.com\nActive\nEditor",
        }, { borderRadius: "rounded-lg", border: "border", overflow: "overflow-hidden" }),
      ]),
    ],
  },
  {
    id: "contact",
    name: "Contact Page",
    description: "Header + Contact Form + Info Cards",
    category: "Marketing",
    nodes: () => [
      n("section", {}, { padding: "py-16 px-6", textAlign: "text-center" }, [
        n("heading", { text: "Get in Touch", level: "h1" }, { fontSize: "text-4xl", fontWeight: "font-bold", margin: "mb-4" }),
        n("text", { text: "We'd love to hear from you. Send us a message and we'll respond as soon as possible." }, { fontSize: "text-lg", color: "text-muted-foreground", maxWidth: "max-w-xl", margin: "mx-auto mb-10" }),
      ]),
      n("grid", { columns: "2" }, { display: "grid", gridCols: "grid-cols-2", gap: "gap-8", padding: "px-6", maxWidth: "max-w-5xl", margin: "mx-auto" }, [
        n("card", {}, { padding: "p-8", border: "border", borderRadius: "rounded-xl", background: "bg-card", shadow: "shadow-sm" }, [
          n("heading", { text: "Send a Message", level: "h3" }, { fontSize: "text-xl", fontWeight: "font-semibold", margin: "mb-6" }),
          n("input", { label: "Full Name", placeholder: "John Doe", inputType: "text" }, { margin: "mb-4" }),
          n("input", { label: "Email", placeholder: "john@example.com", inputType: "email" }, { margin: "mb-4" }),
          n("textarea", { label: "Message", placeholder: "How can we help?", rows: 4 }, { margin: "mb-6" }),
          n("button", { text: "Send Message", variant: "default" }, {}),
        ]),
        n("container", {}, {}, [
          n("card", {}, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card", shadow: "shadow-sm", margin: "mb-4" }, [
            n("heading", { text: "📧 Email", level: "h4" }, { fontSize: "text-base", fontWeight: "font-semibold", margin: "mb-1" }),
            n("text", { text: "hello@example.com" }, { color: "text-muted-foreground", fontSize: "text-sm" }),
          ]),
          n("card", {}, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card", shadow: "shadow-sm", margin: "mb-4" }, [
            n("heading", { text: "📱 Phone", level: "h4" }, { fontSize: "text-base", fontWeight: "font-semibold", margin: "mb-1" }),
            n("text", { text: "+1 (555) 000-0000" }, { color: "text-muted-foreground", fontSize: "text-sm" }),
          ]),
          n("card", {}, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card", shadow: "shadow-sm" }, [
            n("heading", { text: "📍 Address", level: "h4" }, { fontSize: "text-base", fontWeight: "font-semibold", margin: "mb-1" }),
            n("text", { text: "123 Main St, San Francisco, CA 94105" }, { color: "text-muted-foreground", fontSize: "text-sm" }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    description: "Stats + Charts grid with bar, line, pie and area charts",
    category: "Application",
    nodes: () => [
      n("section", {}, { padding: "py-8 px-6" }, [
        n("heading", { text: "Analytics Dashboard", level: "h1" }, { fontSize: "text-3xl", fontWeight: "font-bold", margin: "mb-2" }),
        n("text", { text: "Real-time insights into your business performance." }, { color: "text-muted-foreground", margin: "mb-8" }),
        n("grid", { columns: "4" }, { display: "grid", gridCols: "grid-cols-4", gap: "gap-4" }, [
          n("stat-card", { title: "Total Revenue", value: "$45,231", change: "+20.1%", changeType: "positive" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("stat-card", { title: "Active Users", value: "2,350", change: "+180", changeType: "positive" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("stat-card", { title: "Conversion", value: "3.2%", change: "+0.8%", changeType: "positive" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("stat-card", { title: "Bounce Rate", value: "24.5%", change: "-4.3%", changeType: "negative" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
        ]),
        n("spacer", { height: "24" }, {}),
        n("grid", { columns: "2" }, { display: "grid", gridCols: "grid-cols-2", gap: "gap-6" }, [
          n("bar-chart", { data: "Jan\n120\nFeb\n200\nMar\n150\nApr\n280\nMay\n220\nJun\n310", variant: "rounded", title: "Monthly Revenue" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("line-chart", { data: "Mon\n40\nTue\n65\nWed\n50\nThu\n80\nFri\n95\nSat\n60\nSun\n75", variant: "smooth", title: "Weekly Visitors" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
        ]),
        n("spacer", { height: "16" }, {}),
        n("grid", { columns: "3" }, { display: "grid", gridCols: "grid-cols-3", gap: "gap-6" }, [
          n("pie-chart", { data: "Desktop\n55\nMobile\n30\nTablet\n15", variant: "donut", title: "Device Split" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("area-chart", { data: "Jan\n30\nFeb\n45\nMar\n38\nApr\n60\nMay\n55\nJun\n72", variant: "gradient", title: "Growth Trend" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
          n("bar-chart", { data: "Chrome\n65\nSafari\n20\nFirefox\n10\nEdge\n5", variant: "horizontal", title: "Browser Usage" }, { padding: "p-6", border: "border", borderRadius: "rounded-xl", background: "bg-card" }),
        ]),
      ]),
    ],
  },
];
