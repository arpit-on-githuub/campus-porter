# SLING

Move things across campus without moving yourself.

SLING is a peer-to-peer delivery network built for IIT Jodhpur. If someone is already walking to the canteen, you can ask them to grab your Maggi on the way and leave a small tip(or a party) for the favour. There is no delivery fleet and no strangers at the gate, just students who are already going where you need something from.

## How it actually works

Picture 11 PM. You are buried in an assignment in your Hostel and you have run out of coffee.

1. You post a request: pick up from Neem Cafe, drop at Hostel, one cold coffee, tip twenty rupees(even a treat).
2. Ankita is already walking back from the Library past the cafe. She sees it in her feed and accepts.
3. She grabs the coffee and marks it picked up. If anything is unclear, the two of you can chat or call from inside the app.
4. She drops it off, you confirm delivery, and the tip goes through.
5. You both rate each other, which builds a reputation score for next time.

Nobody is locked into a role. Today you are the one asking. Tomorrow you are the one already walking that way and pocketing a few tips(even your tummy).

## What it does

- **Campus-only access.** Sign-up is restricted to iitj.ac.in email addresses and confirmed with a one-time code, so every account belongs to a verified student.
- **Post and accept requests.** Say what you need, where it is, where it goes, and what the tip is. Anyone heading that direction can pick it up.
- **One board, two roles.** No separate rider account. You act as requester or runner whenever it suits you.
- **A real delivery lifecycle.** Requests move through open, accepted, picked up, delivered, and completed, with proper cancel handling. The server enforces the order so nothing can jump ahead.
- **Live chat.** Once a request is accepted, both sides get a real-time chat, so "which gate are you at" gets answered right away.
- **Tips or a treat.** Every request carries a reward the two of you agree on: a small cash tip settled directly over UPI, or a party/treat you promise in person. Your call.
- **Two-way ratings.** Both people rate each other, and runners build a visible deliveries count and star rating.
- **Numbers on your terms.** Phone numbers stay hidden until you decide to share them.
- **Dark mode and notifications**, because a good chunk of campus life happens after sunset.

## Tech stack

Frontend runs on React 19 with Vite, styled with Tailwind CSS v4, using React Router, Axios, and the Socket.io client.

Backend is Node.js with Express 5, Socket.io for real-time, and Mongoose for data access.

Data lives in MongoDB Atlas. Auth uses JWT for stateless sessions, bcrypt for password hashing, and an email OTP for verification. Email is sent with Nodemailer over a pluggable SMTP setup (Gmail for local work, Brevo or SendGrid in production).

## Project layout

```
campus-porter/
├── backend/
│   ├── app.js                  Express app, middleware, routes
│   ├── server.js               HTTP and Socket.io server bootstrap
│   ├── Dockerfile              container image for Koyeb or any host
│   └── src/
│       ├── config/db.js        MongoDB connection with pooling
│       ├── models/             User and Request schemas and indexes
│       ├── controllers/        auth and request logic
│       ├── routes/             REST route definitions
│       ├── middleware/auth.js  JWT verification
│       └── utils/              sendEmail (pluggable SMTP), generateOTP
└── frontend/
    └── src/
        ├── components/         SlingLogo, Navbar, ChatBox, ProtectedRoute, RequestCard
        ├── context/            AuthContext, ThemeContext
        ├── pages/              Login, Register, OTP, ForgotPassword, Home, Post, Detail, MyRequests, Profile
        ├── api/                axios API clients
        └── index.css           Tailwind plus the SLING motion styles
```

## Running it locally

You will need Node.js 18 or newer, a MongoDB Atlas connection string, and optionally an email account.

Backend:

```bash
cd backend
npm install
cp .env.example .env      # fill in the values
npm run dev               # http://localhost:3000
```

Frontend:

```bash
cd frontend
npm install
# create frontend/.env with VITE_API_URL=http://localhost:3000
npm run dev               # http://localhost:5173
```

## Environment variables

`backend/.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_secret

EMAIL_USER=your_smtp_username_or_gmail@gmail.com
EMAIL_PASS=your_smtp_password_or_gmail_app_password
# Recommended in production (see the note below):
# EMAIL_HOST=smtp-relay.brevo.com
# EMAIL_PORT=587
# EMAIL_FROM=SLING <no-reply@yourdomain.com>
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

A note on email. Gmail SMTP is fine on your laptop, but most free cloud hosts block outbound SMTP, which makes OTP emails hang or fail. In production, point `EMAIL_HOST` and `EMAIL_PORT` at a transactional provider such as Brevo or SendGrid. No code change is needed for that. `sendEmail` also has built-in timeouts, so a bad provider returns a clear error instead of freezing the request.

## Deployment

The backend is a long-running Express and Socket.io process, so it needs an always-on host rather than a serverless one.

The backend runs on Render's free tier, which supports WebSockets and builds straight from `backend/Dockerfile`. Create a web service from the GitHub repo, set the root directory to `backend`, choose the Docker runtime, add the environment variables (including the Brevo email settings), and deploy. Render's free instances sleep after fifteen minutes of inactivity, so a free uptime monitor (UptimeRobot or cron-job.org) pings the health endpoint every few minutes to keep it awake.

The frontend runs on Vercel as a static Vite build (`npm run build` produces `dist/`). A small `vercel.json` rewrites every route to `index.html` so client-side routing and page refreshes work. `VITE_API_URL` points at the Render backend URL, and any change to it needs a fresh deploy because it is baked in at build time.

Email is handled by Brevo over SMTP, configured entirely through `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`, so no code changes when the provider changes.

The database stays on MongoDB Atlas. Network Access is opened so the backend host can connect, and backups are turned on.

## Built to handle a full campus

The target is around five thousand students, and a few choices keep it comfortable there.

- Database connections are pooled instead of opened fresh on every request.
- Indexes cover the queries that actually run hot, such as the open-requests feed and a member's own requests.
- The feed uses lean reads so responses stay small and fast.
- New-request emails only reach people who opted in, which keeps both the inbox and the email quota under control.
- Auth is stateless JWT, so you can run more than one backend instance behind a load balancer whenever you outgrow one.

When live chat traffic outgrows a single instance, the next step is a Redis adapter for Socket.io (Upstash has a free tier) so multiple instances share the same chat rooms.

## How it came together, phase by phase

**Phase 1, the foundation.** Campus-gated sign-up with an email OTP, JWT login, and the ability to post and browse requests. The iitj.ac.in gate came first, because trust is the entire point of the app.

**Phase 2, the delivery loop.** The status state machine, the accept flow, and the rules about who is allowed to move a request into which state. This is where it stopped being a noticeboard and started being a delivery app.

**Phase 3, people and trust.** Real-time chat, two-way ratings, optional phone reveal, and profiles. Every request also carries an agreed tip that the runner and requester settle between themselves.

**Phase 4, polish and reliability.** The rebrand from Campus Porter to SLING, the animated logo, and the subtle motion throughout. This phase also cleared a stack of real bugs: email that failed fast instead of hanging, no more orphaned accounts when signup half-completed, and API calls that stopped pointing at localhost. Connection pooling and indexing landed here too.

**Phase 5, going properly live.** The backend moved off the exhausted Railway trial onto Render, email now sends through Brevo, the frontend on Vercel got a single-page-app rewrite so deep links and refreshes resolve, and the web app became installable as a PWA. Next in this phase is a native Android build with Capacitor.

**Next up.** Redis-backed chat for horizontal scale, smarter runner matching based on where people already are, rate limiting to keep things tidy, and push notifications on mobile.

## Engineering report: what broke, and how we fixed it

Building SLING was less a straight line and more a series of "wait, why isn't this working" moments. This section is an honest log of the real problems, what caused them, and how each one got solved, so the reasoning does not get lost.

### Quick summary

| Problem | Root cause | Fix | Status |
| --- | --- | --- | --- |
| OTP emails never arrived and signup hung | Gmail SMTP is blocked on cloud hosts, and the send had no timeout | Added SMTP timeouts, made the provider swappable, moved to Brevo | Fixed |
| Failed signups blocked retries | The account was saved before the email was sent | Roll back the account on email failure, let unverified emails re-register | Fixed |
| Backend was about to go down | Railway free trial credit ran out | Moved the backend to Render's free tier | Fixed |
| First hosting pick was a dead end | Koyeb dropped its free tier and now wants a card | Went with Render free instead | Fixed |
| Render sleeps and cold starts | Free tier idles after 15 minutes | A free uptime monitor pings it every few minutes | Fixed |
| Deep links and refresh returned 404 on the live site | The static host had no single-page-app fallback | Added a Vercel rewrite that serves index.html for every route | Fixed |
| Payments could not actually pay runners | Razorpay checkout only collects to the platform, never pays out | Removed the gateway, tips settle over UPI | Fixed |
| Saves and chat failed on the live site | API URLs were hardcoded to localhost | Route everything through VITE_API_URL | Fixed |

### 1. The OTP email that hung the whole app

**The plan.** New users verify their iitj.ac.in address with a six digit code, sent through Gmail using Nodemailer. Simple and free.

**What went wrong.** On the deployed backend, registration and forgot-password would spin forever and then fail. New users could not verify, and because they were never verified, they could not log in either. From the outside it looked like the entire app was broken.

**Why it happened.** Two problems stacked on top of each other. First, most free cloud hosts block outbound SMTP, so the connection to Gmail never completed. Second, the code waited on the email with no timeout, so a blocked connection froze the whole request until it eventually gave up. Gmail is also winding down app passwords, so it was never a stable choice for server-sent mail to begin with.

**The fix.** Three parts. The email helper got real connection timeouts, so a bad provider now fails in about ten seconds with a clear message instead of hanging. The helper was made provider-agnostic through EMAIL_HOST and EMAIL_PORT, so switching providers is a config change rather than a code change. And the project moved to Brevo, a transactional email service built for exactly this, which sends cleanly from a server.

### 2. The signups that locked people out

**The plan.** Create the user, then email them the code.

**What went wrong.** When the email step failed, the account had already been saved as unverified. Trying again returned "user already exists", so the person was stuck with no code in their inbox and no way to start over.

**Why it happened.** The write to the database happened before the fragile email step, with nothing to undo it on failure.

**The fix.** If the verification email fails, the freshly created account is now rolled back. On top of that, an unverified email is allowed to register again, which quietly heals any account that got stuck earlier.

### 3. Keeping the backend online

**The plan.** Backend on Railway, frontend on Vercel, database on MongoDB Atlas.

**What went wrong.** Railway runs on trial credit, and it ran out. The dashboard showed roughly four dollars and zero days left, which meant the API was about to vanish and take the whole app with it.

**What we tried, and what failed.** The first move was Koyeb, picked because it was known for a free always-on tier. By 2026 that had changed. Koyeb now asks for a credit card and pushes a paid plan, so it was a dead end for a free project. Fly.io was ruled out for the same reason, having ended its free tier for new accounts.

**The fix.** The backend now runs on Render's free tier, which needs no card, supports WebSockets, and builds straight from the existing Dockerfile. It is live and connected to Atlas. The one trade-off, cold starts, is covered in the next note.

### 4. Render's cold start

**What went wrong.** A Render free service goes to sleep after fifteen minutes without traffic, and the next visitor waits about fifty seconds for it to wake back up. For a live chat app, sleeping also drops open connections.

**Why it happens.** Idling unused services is how the free tier stays free.

**The fix.** A free uptime pinger (cron-job.org or UptimeRobot) hits the health endpoint every ten minutes, so the service never sees fifteen minutes of silence and never sleeps. One service kept warm this way stays inside the 750 free hours a month. If zero cold starts ever matter more than zero cost, Railway's five dollar Hobby plan removes the problem entirely.

### 5. Payments that could not pay

**The plan.** Collect the tip inside the app through Razorpay once a delivery is done.

**What went wrong.** The integration ran in test mode, but it had a deeper flaw. Standard Razorpay checkout collects money into the platform's own account and never forwards it to the runner. Actually paying the runner would need Razorpay Route or RazorpayX, full business KYC, and every runner's bank details. There was also no webhook for reliable confirmation, and a UX bug where confirming delivery hid the pay button.

**The fix.** The gateway was removed entirely. Tips, and the playful party or treat option, are now agreed inside the app and settled directly between the two students over UPI or in person. No KYC, no payout gap, and far less to go wrong at campus scale.

### 6. The bugs that only showed up in production

A short list of things that worked fine on a laptop and broke the moment they were deployed:

- Several API calls were hardcoded to http://localhost:3000, so saving a phone number and the live chat socket silently failed on the real site. Everything now goes through a single VITE_API_URL.
- A few stray notification lines were rendering as literal text on the request screen. They were removed, and a real notification now fires on status changes.
- A debug log was printing the full database connection string, credentials and all, into the server logs. It was removed.

### 7. The 404 that only hit direct links

**What went wrong.** Opening a route like /login directly, or refreshing while on it, returned a 404 from the host. Moving around inside the app was fine, but shared links and refreshes broke.

**Why it happened.** SLING is a single-page app, so the browser is meant to handle routing. The static host, though, went looking for a real /login file, did not find one, and gave up. Nothing told it to hand every path to the app.

**The fix.** A small vercel.json rewrites every route to index.html. The host still serves real files like scripts and icons directly, and only falls back to the app for actual routes, which lets the in-app router take over. This also matters for the installed PWA, where deep links and refreshes need to resolve.

## Roadmap

- Redis adapter for multi-instance real-time
- Smart runner matching across the campus map
- Token-bucket rate limiting
- Installable mobile app with push notifications
- Scheduled and recurring requests

---

SLING. Because a coffee run at 11 PM should take one tap, not one trek.

Built for IIT Jodhpur.

Naming credit: SLING was dreamed up by me and my mate Gemini, after a long pile of rejected names and a few too many browser tabs. Gemini brought the wordplay, I kept the veto power.
