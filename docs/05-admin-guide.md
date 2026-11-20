# Admin guide

Open **`/admin.html`** while signed in. What you see depends on your role.

## Roles

| Role | Can do |
|---|---|
| **MEMBER** | Nothing in the admin panel. |
| **CORE** | Scan tickets, check people in, award points, see registrations. |
| **DOCS** | Upload post-event data, see registrations and analytics. |
| **ORGANIZER** | Everything above, plus create and edit events, review requests, send notifications, see users. |
| **ADMIN** | Everything, including changing roles and forcing a publish. |

Roles are stored in the database and mirrored into a Firebase custom claim called `role`. The database is the source of truth: if the claim and the database ever disagree, the database wins.

Change someone's role in **Users & roles**. They must sign in once first so that the account exists.

## Overview

Sign-ups, members, registrations, check-ins, attendance rate, points awarded, sign-ups over the last 30 days, registrations per event, and request counts.

## Events

- **New event**: title, type, colour, date, times, venue, seats, short description, tags.
- **Speakers or hosts**: leave empty and the site shows "Speaker to be announced".
- **Registration questions**: name, email, phone, branch and year come from the member's profile, so only ask what is specific to the event.
- **Registrations** shows who signed up, with answers, and exports a CSV.
- Saving publishes to GitHub and the site redeploys within a few minutes.

## Scan and points

1. Open **Scan & points** on a phone and tap **Start camera**, or type the ticket code.
2. The attendee's card appears. Tap **Check in** (+10 points).
3. During the session, tap a preset or enter your own points and reason. You can see the person's total at once.

Only people with the CORE role (or higher) see this tab.

## Requests

Every form on the **Join** page lands here, grouped by type and status.

| Type | What *Approve* does |
|---|---|
| **Members** | Optional form; created already approved when the person submits it (everyone who signs in is already a member). |
| **Volunteers** | People who want to learn or work in a domain and help with operations (registration desk, crowd flow, tech support). *Approve & add to team page* puts them on the team page; *Approve only* just records it. |
| **Core team** | Experienced people who can lead a domain. *Approve & add to team page* also gives them the CORE role. You choose the title and short bio. |
| **Speakers** and **Session ideas** | Marks them approved. Follow up with the person by email. |
| **Stories** | *Approve & feature on site* publishes the story to Home and Legacy. *Edit text* lets you fix it first. |

Anything that changes the public site is published to GitHub automatically (see *Content and publishing*). Rejecting a featured story or an on-site team member removes it again.

## Users and roles

Search people, see whether they finished the membership form and how many events they registered for, and change their role.

## Notifications

Send a push message to everyone who enabled notifications, or only to people registered for a given event.

## Publishing

The log of every attempt to commit to GitHub, with the commit id or the error. **Publish now** forces one, which is useful after changing GitHub settings.
