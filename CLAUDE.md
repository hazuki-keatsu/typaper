# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Astro-based personal blog (forked from astro-paper), deployed on Vercel. Package manager: `pnpm`.

## Commands

```
pnpm dev          # Start dev server
pnpm build        # Check + build + run pagefind search index + copy to public
pnpm preview      # Preview production build
pnpm format       # Prettier format all files
pnpm format:check # Prettier check
pnpm lint         # ESLint
pnpm new:blog     # Scaffold a new blog post
```

## Architecture

```
src/
  config.ts             # Global SITE config (title, author, RSS, etc.)
  content.config.ts     # Content collections: blog (MDX), blogroll, pages
  constants.ts          # Social links, license protocols, share links
  data/
    blog/               # All blog posts (MDX) - organized in topic subdirs
    blogroll/           # Blogroll entries
    pages/              # Static pages (about.md)
  pages/
    index.astro         # Home page (featured + recent posts)
    posts/[...page].astro       # Paginated post listing
    posts/[...slug]/index.astro # Individual blog post
    tags/index.astro            # All tags
    tags/[tag]/[...page].astro  # Posts by tag (paginated)
    archives/index.astro        # Archives grouped by year/month
    search.astro                # Pagefind search
    blogroll/index.astro        # Blogroll page
    [...slug].astro             # Static pages (about, etc.)
    rss.xml.ts                  # RSS feed
    og.png.ts / posts/[...slug]/index.png.ts  # Dynamic OG images via Satori
    api/music.ts                # Music API endpoint (@meting/core proxy)
  layouts/
    Layout.astro        # Root HTML shell (meta tags, JSON-LD, theme, Player)
    Main.astro          # Listing page wrapper (title + breadcrumb)
    PostDetails.astro   # Blog post detail (progress bar, ToC, code copy, prev/next)
  components/           # Astro UI components (Card, Header, Footer, Pagination, etc.)
  utils/
    getSortedPosts.ts   # Filter drafts + sort by date
    getPostsByTag.ts    # Posts filtered by tag
    getPostsByGroupCondition.ts  # Group posts (used by archives)
    getUniqueTags.ts    # Unique sorted tags across all posts
    getPath.ts          # Resolve post URL from id + filePath
    postFilter.ts       # Exclude drafts + future posts
    slugify.ts          # Slugify (Latin via slugify, CJK via lodash.kebabcase)
  styles/               # Global CSS + Tailwind + APlayer styles
  scripts/theme.ts      # Client-side theme (light/dark) logic
```

## Key patterns

- **Content collections**: Blog posts use glob loader from `src/data/blog/`. Frontmatter schema defined in `content.config.ts`. The `slug` field in frontmatter overrides the id-derived slug.
- **URL structure**: Post URLs derive from file structure minus the `src/data/blog/` prefix. Directory names starting with `_` are excluded. See `getPath.ts`.
- **Draft/publish**: Posts with `draft: true` or future `pubDatetime` are hidden in production but visible in dev. Margin controlled by `SITE.scheduledPostMargin`.
- **Math rendering**: `remark-math` + `rehype-katex` plugins. KaTeX CSS loaded from `/katex.min.css` in public/.
- **Tailwind 4**: Configured via `@tailwindcss/vite` plugin, not a tailwind.config file.
- **OG images**: Generated dynamically via Satori + Resvg. Raster route at `/posts/{slug}/index.png` and per-post OG images. Site default at `/og.png`.
- **Music player**: Uses `@meting/core` to proxy Netease Cloud Music playlists, exposed at `/api/music`, consumed by Player component with APlayer.
- **Theme**: Light/dark via `data-theme` attribute on `<html>`. Inline script in Layout prevents FOUC; full logic in `scripts/theme.ts`.
- **Alias**: `@/*` maps to `./src/*`.
