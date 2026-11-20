# Content and publishing

## How changes reach the site

When an admin approves something that the public site shows, the API builds three small files from the database and commits them to GitHub in **one commit**:

| File | Contains |
|---|---|
| `src/data/generated/events.json` | Published events, including post-event details for past events. |
| `src/data/generated/team.json` | People marked "show on site": organizers, core team, volunteers. |
| `src/data/generated/stories.json` | Approved and featured stories. |

Team photos uploaded through a profile are committed to `src/assets/team/`. The commit starts the deploy workflow, which rebuilds the site. If a file is missing, the site falls back to the sample content in `src/data/site.mjs`.

Things that trigger a publish: creating or editing an event, saving post-event data, featuring a story, approving a core or volunteer application, and a team member changing their profile or photo.

Events also change status by date: the workflow runs every night, so an upcoming event becomes a past event the day after it happens.

## Publishing a past event (documentation team)

1. Go to **Admin → Events** and press **Post-event data** on the event.
2. Fill what you have:
   - **About** (one paragraph per line) and **Key takeaways** (one per line).
   - **Resources**, one per line as `Label | URL | slides`, `code` or `link`.
   - **YouTube video ID** for the recording.
   - **Photos**, one per line as `Caption | image path or URL`. Put image files under `src/assets/events/` and use `assets/events/name.jpg`.
   - For the PDF report: **Stats** (`Label | Value`), **Highlights**, **Attendee feedback** (`Quote | Who`), a **thank-you note** and **Prepared by**.
3. Tick **Publish the event page and report** and save.

Until an event is published, its **Explore this event** button is disabled with the tooltip "Will be available within 12 hours". After publishing it opens a page with the description, speakers, takeaways, resources, the recording, photos and a **Download report (PDF)** button.

### The PDF report

The report is generated from the same data. It opens a print-ready page and the browser's print dialog, where the visitor picks **Save as PDF** (turn on *Background graphics* for the colours). Any section with no data is simply left out, so a half-filled report still looks finished.

## Editing sample content by hand

Everything that is not managed in the admin panel lives in `src/data/site.mjs`: site name and URL, social links, the team's leadership, noticeboard announcements, domains, timeline, achievements, gallery and milestone tiles, roadmap, values and FAQs. Edit the file, run `npm run build`, and commit.

Photos in the gallery and milestones are placeholders until you add a `src` to each item. Team photos for the four leaders are in `src/assets/team/`.

## Team members and their links

Leaders in `src/data/site.mjs` have `links: { linkedin: '', github: '' }`. An icon only shows when a link is set. People added through the admin panel use the LinkedIn and GitHub fields from their own profile.
