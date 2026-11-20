# Accounts, tickets and points

## Ways to sign in

| Way | Who it is for | What they get |
|---|---|---|
| **Continue with Google** | Members | Full profile, points, badges, leaderboard, one-click registration (after the first), applications. |
| **Guest** (automatic) | Someone who just wants a ticket | A ticket for the event, kept on this device. No password, no account form. |
| **Email link** | A guest on another device | Their guest tickets, moved onto an account tied to their email. |

The account badge in the top right of the navbar opens the sign-in dialog, or the account menu when signed in.

## First sign-in

Signing in with Google is joining the club: the account's name, email and photo become the profile, and the visitor stays on the page they were on. Nothing sends them to another form.

The rest of the profile is asked **once, at the first event registration**: the dialog shows a short block (year is required; branch, registration number and WhatsApp number are optional) above the event's own questions, and saves the answers to the profile. From then on registering is a single click. People can also complete the profile at any time from **Profile → Details**, where a "Finish your profile" note appears until it is done.

The **Become a member** form on the Join page is optional: it records interests and experience level, nothing more.

## Guests and the "already have a ticket?" link

1. A visitor who is not signed in fills the registration form instead of using Google.
2. The site starts a Firebase **anonymous** session and the API stores the details from the form (including the email) on that guest account. The ticket and QR code are shown at once and kept on that device.
3. On another device, the visitor opens the registration dialog and uses **Already have a ticket? Access it here**, types the same email and gets a sign-in link by email.
4. Opening the link signs them in. The API sees a **verified** email that matches the guest's email and moves the guest's tickets, points and answers onto the real account. The guest account is then deleted.

If the guest later signs in on the same device, Firebase links the email to the same anonymous account, so nothing is lost.

Guests never appear on the leaderboard, in the member count, or in the users list. They cannot send applications (volunteer, core team, speaker, story): those need a Google sign-in.

## Tickets and the day of the event

Each registration gets a ticket code (for example `GDG-7K3M-9XQ2`) and a QR code that contains `GDG:<code>`. On the home page, a registered visitor sees **You're registered** before the event, and **Access ticket** on the day, which opens the QR in a dialog. Tickets also live in the profile under **Tickets**.

## Points, badges and the leaderboard

- Checking in at the event gives **10 points**.
- A core team member, docs or organizer can award more during the session from **Scan & points**: presets such as *Speaker question +10*, *Icebreaker winner +15*, *Quiz winner +25*, or a custom amount from -50 to 100 with a reason.
- Badges are computed from activity: joining, events attended, saved Tech Atlas roles, taking the quiz, and point milestones.
- The leaderboard in the profile ranks members by total points.

## Notifications

A friendly prompt appears shortly after landing. The browser's own permission dialog only shows if the visitor says yes. With Firebase Cloud Messaging configured, the device is registered and admins can send push messages from **Notifications**.
