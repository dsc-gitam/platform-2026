# GDG on Campus GITAM — website

Static, zero-dependency site. Source in `src/`, built HTML in `dist/` (deploy that folder anywhere: Firebase Hosting, Netlify, GitHub Pages, Cloud Storage).

```bash
npm run dev      # build + serve at http://localhost:4173
npm run build    # just build into dist/
```

## Where content lives (edit these, rebuild)

| What | File |
|---|---|
| Site name, domain, email, socials, form endpoints, "Sample" tags on/off | `src/data/site.mjs` → `site` |
| Team, open roles | `src/data/site.mjs` → `team` |
| Events (upcoming/past) | `src/data/site.mjs` → `events` |
| Announcements, forum seed posts | `updates`, `forumSeed` |
| Domains, timeline, achievements, stories, gallery, roadmap, FAQs | same file |
| Tech Atlas roles, interests | `src/data/roles.mjs` |
| Find-your-place paths | `src/pages/find-your-place.mjs` (`paths`) and scoring in `src/assets/js/quiz.js` |
| Colours, type, components | `src/assets/css/styles.css` (`:root` tokens) |

## Before launch checklist

- Set `site.url` (canonical URLs, sitemap, OG tags).
- Set `site.client.formEndpoint` (e.g. a Google Apps Script web app writing to a Sheet) so registrations/applications reach you. Until then submissions are stored in the visitor's browser only.
- Set up the community board backend (`forumEndpoint`) — it is local-only until then.
- Replace placeholder photos/stories/bios; set `showPlaceholderTags: false`.
- Swap the brand mark for the official GDG on Campus assets, and convert `og-image.svg` to a 1200×630 PNG (most social crawlers ignore SVG).
