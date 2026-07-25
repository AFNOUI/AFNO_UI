# AfnoUI — SEO & AI-search launch checklist

Everything **in code** is done (metadata, sitemap, robots, JSON-LD, `llms.txt`,
`SiteNavigationElement`, per-page titles). What remains is **off-page** work you
do once `afnoui.com` is live. This is the difference between "eligible to rank"
(code) and "actually ranks #1 with sitelinks + AI citations" (authority + time).

---

## 0. What "point DNS / deploy so the URLs are reachable" means

Google and AI crawlers can only read pages that are **publicly live on the real
domain**. Right now the app builds locally, but until it's deployed:

- `https://afnoui.com/` → your homepage
- `https://afnoui.com/registry/index.json` → the registry the CLI fetches
- `https://afnoui.com/sitemap.xml`, `/robots.txt`, `/llms.txt` → the SEO files

…don't exist on the internet, so nothing can be indexed or cited.

**To make them reachable:**

1. **Deploy the Next.js app** (Vercel is easiest for Next 15 — `vercel` / connect
   the GitHub repo; or any Node host). This gives you a live URL.
2. **Point the domain**: in your domain registrar's DNS, add the records the host
   tells you to — for Vercel that's an `A` record `@ → 76.76.21.21` and a `CNAME`
   `www → cname.vercel-dns.com` (the dashboard shows exact values). Then add
   `afnoui.com` as a domain in the host's project settings.
3. **Verify HTTPS works** and open each URL above in a browser. When
   `https://afnoui.com/sitemap.xml` loads, you're ready for Search Console.

> The CLI already defaults to `https://afnoui.com/registry` in production, so once
> the site is deployed with the `public/registry` files, `npx afnoui add` works
> for everyone.

---

## 1. Site verification (paste your codes)

Each meta tag renders **only when its env var is set**. Add these to your host's
environment variables (Vercel → Project → Settings → Environment Variables), then
redeploy:

| Env var | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console → add property → "HTML tag" method → copy the `content="…"` value |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster Tools → add site → "Meta tag" → copy the `content="…"` value |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | (optional) Yandex Webmaster |

You paste **only the code**, not the whole tag. Example:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=Abc123xyz...
NEXT_PUBLIC_BING_SITE_VERIFICATION=1A2B3C...
```

(Alternatively, or for DNS verification, you can verify by adding a TXT record —
either method works.)

---

## 2. Google Search Console (the #1 priority)

1. Go to <https://search.google.com/search-console> → **Add property** →
   **Domain** property `afnoui.com` (verify via DNS TXT — covers http/https/www).
2. **Sitemaps** → submit `sitemap.xml`.
3. **URL Inspection** → paste `https://afnoui.com/`, click **Request indexing**.
   Repeat for each builder page:
   - `/form-builder`, `/table-builder`, `/kanban-builder`, `/tree-builder`,
     `/dnd`, `/charts`, `/components`.
4. **Check coverage** after a few days: Pages report should show them "Indexed".
5. **Rich results**: use <https://search.google.com/test/rich-results> on your
   homepage — it should detect Organization, WebSite, SoftwareApplication,
   FAQPage, HowTo, ItemList, SiteNavigationElement.

## 3. Bing Webmaster Tools (feeds ChatGPT / Copilot search)

1. <https://www.bing.com/webmasters> → add `afnoui.com` (you can **import from
   Google Search Console** in one click).
2. Submit `https://afnoui.com/sitemap.xml`.
3. Use **URL submission** for the homepage + builder pages.

> Bing's index powers ChatGPT Search and Microsoft Copilot, so this directly
> helps AI-search visibility.

---

## 4. Getting sitelinks (the About / Blogs sub-links in the screenshot)

You **cannot request** sitelinks — Google generates them automatically once it
trusts your site's structure. What's already in place to earn them:

- Unique `<title>` + description on every page ✓
- A sitewide **footer** linking every builder with descriptive anchors ✓
- `SiteNavigationElement` structured data ✓
- Clean URL structure (`/form-builder`, `/table-builder`, …) ✓

**What you still need:** rank #1 for the brand term **"afnoui"** (easy — it's a
unique word, so once indexed you'll own it), plus enough authority that Google
shows expanded results. Sitelinks then appear on their own, usually **2–6 weeks**
after indexing. Keep the nav/footer stable — don't rename or move those pages.

---

## 5. Off-page authority (what actually earns #1 + AI citations)

Code makes you eligible; these make you rank and get quoted by AI:

- [ ] **Publish/announce** on your Reddit (`r/… ` + `u/AfnoUI`) and Instagram
      (`afno.ui`). Real brand mentions + searches teach Google the brand.
- [ ] **npm**: keep the `afnoui` package description + README banner current
      (done) — npm pages rank well and get scraped by AI.
- [ ] **GitHub**: add topics (`react`, `ui-components`, `form-builder`,
      `tailwindcss`, `shadcn`), a good repo description, and the banner. Star/share.
- [ ] **Get listed** in aggregators that AI models read: `awesome-react`,
      `awesome-tailwindcss`, `awesome-shadcn`, Product Hunt, dev.to / Hashnode
      posts, Reddit `r/reactjs` / `r/webdev` (where allowed).
- [ ] **Backlinks**: a few links from real dev blogs/tutorials move ranking more
      than any on-page change.
- [ ] **Comparison content**: an "AfnoUI vs shadcn/ui" or "build a form without
      code" post captures high-intent + AI-Overview queries.

## 6. AI search (Gemini / ChatGPT / Perplexity) specifics

Already shipped: AI crawlers allow-listed in `robots.txt`, `/llms.txt` summary,
FAQ + HowTo JSON-LD, quotable descriptions. To reinforce:

- [ ] Keep FAQ answers concise and factual (they get quoted verbatim).
- [ ] After deploy, ask each assistant "what is AfnoUI?" to see what it retrieves;
      gaps tell you what content to add.
- [ ] More third-party mentions = more likely to be cited (see §5).

---

## Quick reference — the pages we want ranked

| Page | Target intent |
| --- | --- |
| `/` | "afnoui", "react component library builder" |
| `/form-builder` | "visual form builder react" |
| `/table-builder` | "react table builder" |
| `/kanban-builder` | "react kanban builder" |
| `/tree-builder` | "react tree builder" |
| `/dnd` | "react drag and drop without library" |
| `/charts` | "react chart builder no library" |
| `/components` | "shadcn alternative", "accessible react components" |

_Not yet submitted (incomplete, `noindex`): `/ui-builder`, `/dashboard`. Re-enable
in `sitemap.ts`, `content.ts` (`siteNav`/`siteFeatures`), remove the `robots`
override in their layouts, and un-comment the homepage links when they ship._
