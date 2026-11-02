# jkneeranjan.github.io

Personal site of Neeranjan JK (Neeranjan Jayamurugan Karthikeyani), founder of [Lucidence AI](https://lucidence.ai) and builder of vertical AI.

Plain HTML, CSS and a small script: no framework, no build step and no third-party requests (fonts are self-hosted, there are no analytics). GitHub Pages serves the repository root.

## Structure

| Path | What it is |
|------|------------|
| `index.html` | The portfolio: hero, vertical AI thesis, work, Lucidence timeline, career chart, experience, education, contact |
| `legal.html` | Impressum and privacy notice |
| `cv/index.html`, `cv/cv.css` | Printable CV (A4), the source of `cv/Neeranjan-JK-CV.pdf` |
| `assets/` | Stylesheet, script, fonts (OFL licences included), photo, Open Graph image |
| `tools/` | `og.html` (Open Graph card source) and `render.mjs` (renders the OG image, icons and CV PDF) |

## Run locally

```bash
python3 -m http.server 8765
# open http://localhost:8765
```

## Regenerate the OG image, icons and CV PDF

Run after editing `cv/index.html`, `tools/og.html` or `favicon.svg`. Needs Playwright with Chromium.

```bash
python3 -m http.server 8765 &
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node tools/render.mjs
```

## Editing notes

- **Content Security Policy.** Every page sets a strict CSP in a meta tag. Inline `style="…"` attributes are blocked, so use classes. The one inline script (the theme loader in `<head>`) is allowed by its SHA-256 hash. If you change that script, recompute the hash and update it in `index.html`, `legal.html` and `404.html`.
- **Career chart.** Bar positions are decimal years in `assets/css/site.css` (`.bar--sap { --s: 2023.33; --e: 2025.83; }`). The "Today" marker is `.chart-marker--today { --m: … }`. Keep the "View as a table" rows in `index.html` in step with the bars.
- **Timeline.** Done items use `tl-item`; planned items use `tl-item tl-item--next`. When a planned step happens, move it above the "Today" pill and give it a date.
- **Lane colours** (work, study, build) were validated for colour-blind separation and contrast in both themes. Re-run a palette check if you change them.
- **Dates and numbers.** When facts change, update `index.html`, `cv/index.html` (then re-render the PDF), the JSON-LD block and `sitemap.xml` (`lastmod`).
