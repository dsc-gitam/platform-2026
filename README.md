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
| Find-your-place paths | `src/sections/find.mjs` (`paths`, shown on the home page) and scoring in `src/assets/js/quiz.js` |
| Colours, type, components | `src/assets/css/styles.css` (`:root` tokens) |

## Before launch checklist

- Set `site.url` (canonical URLs, sitemap, OG tags).
- Set `site.client.formEndpoint` (e.g. a Google Apps Script web app writing to a Sheet) so registrations/applications reach you. Until then submissions are stored in the visitor's browser only.
- Set up the community board backend (`forumEndpoint`) — it is local-only until then.
- Replace placeholder photos/stories/bios; set `showPlaceholderTags: false`.
- Swap the brand mark for the official GDG on Campus assets, and convert `og-image.svg` to a 1200×630 PNG (most social crawlers ignore SVG).

## Publishing a past event (Documentation team)

Past events live in `src/data/site.mjs` (`events`, entries with `status: 'past'`). Until an event is **ready**, its "Explore this event" button is disabled with the tooltip "Will be available within 12 hours", and no detail page or report is built.

To publish one, fill in what you have and set `ready: true`:

- `about` (paragraphs), `speakers`, `takeaways`, `resources` (`{ label, url, kind }`), `photos` (add `src: 'assets/events/…jpg'` for real photos), `recording.youtubeId` (the id from the YouTube link).
- Optional `report` extras used only in the PDF: `stats` (`[{ label, value }]`), `highlights`, `feedback` (`[{ quote, by }]`), `thanks`, `preparedBy`.

The event page's **Download report (PDF)** button opens a print-ready page built from this data (`event-<name>-report.html`). Any section with no data is simply left out, so a partial report still looks complete. Visitors choose **Save as PDF** in the print dialog.
