<p align="center">
  <img src="https://afnoui.com/brand/afno-banner.svg" alt="AfnoUI" width="100%">
</p>

<h1 align="center">AfnoUI</h1>

<p align="center">
  Open-source, registry-driven React + TypeScript component library with visual
  builders (form, UI, table, kanban, tree), a chart library, and a live theme lab.
  <br>
  <a href="https://afnoui.com"><b>afnoui.com</b></a> ·
  <a href="https://www.npmjs.com/package/afnoui">npm</a> ·
  <a href="https://reddit.com/user/AfnoUI">Reddit</a> ·
  <a href="https://instagram.com/afno.ui">Instagram</a>
</p>

```bash
npx afnoui init          # set up Tailwind, tokens, and the design system
npx afnoui add button    # copy components into your project (you own the source)
```

This repo contains the AfnoUI web app + registry (Next.js 15 / React 19 /
Tailwind v4) and the `afnoui` CLI (under `afnoui-cli/`). Brand assets live in
[`brand/`](./brand/). See [`AGENTS.md`](./AGENTS.md) and `.ai-brain/` for
architecture.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
