# SLING — Engineering Report

An honest log of the real problems hit while building and shipping SLING, what caused them, and how each one got solved, so the reasoning does not get lost. New issues are appended here as they come up.

## Quick summary

| Problem | Root cause | Fix | Status |
| --- | --- | --- | --- |
| OTP emails never arrived and signup hung | Gmail SMTP is blocked on cloud hosts, and the send had no timeout | Added SMTP timeouts, made the provider swappable, moved to Brevo | Fixed |
| Brevo email still failed once deployed | Render's free tier blocks outbound SMTP ports too | Send through Brevo's HTTPS API instead of SMTP | Fixed |
| Failed signups blocked retries | The account was saved before the email was sent | Roll back the account on email failure, let unverified emails re-register | Fixed |
| Backend was about to go down | Railway free trial credit ran out | Moved the backend to Render's free tier | Fixed |
| First hosting pick was a dead end | Koyeb dropped its free tier and now wants a card | Went with Render free instead | Fixed |
| Render sleeps and cold starts | Free tier idles after 15 minutes | A free uptime monitor pings it every few minutes | Fixed |
| Deep links and refresh returned 404 on the live site | The static host had no single-page-app fallback | Added a Vercel rewrite that serves index.html for every route | Fixed |
| Payments could not actually pay runners | Razorpay checkout only collects to the platform, never pays out | Removed the gateway, tips settle over UPI | Fixed |
| Saves and chat failed on the live site | API URLs were hardcoded to localhost | Route everything through VITE_API_URL | Fixed |

## 1. The OTP email that hung the whole app

**The plan.** New users verify their iitj.ac.in address with a six digit code, sent through Gmail using Nodemailer. Simple and free.

**What went wrong.** On the deployed backend, registration and forgot-password would spin forever and then fail. New users could not verify, and because they were never verified, they could not log in either. From the outside it looked like the entire app was broken.

**Why it happened.** Two problems stacked on top of each other. First, most free cloud hosts block outbound SMTP, so the connection to Gmail never completed. Second, the code waited on the email with no timeout, so a blocked connection froze the whole request until it eventually gave up. Gmail is also winding down app passwords, so it was never a stable choice for server-sent mail to begin with.

**The fix.** Three parts. The email helper got real connection timeouts, so a bad provider now fails in about ten seconds with a clear message instead of hanging. The helper was made provider-agnostic through EMAIL_HOST and EMAIL_PORT, so switching providers is a config change rather than a code change. And the project moved to Brevo, a transactional email service built for exactly this, which sends cleanly from a server.

## 2. The signups that locked people out

**The plan.** Create the user, then email them the code.

**What went wrong.** When the email step failed, the account had already been saved as unverified. Trying again returned "user already exists", so the person was stuck with no code in their inbox and no way to start over.

**Why it happened.** The write to the database happened before the fragile email step, with nothing to undo it on failure.

**The fix.** If the verification email fails, the freshly created account is now rolled back. On top of that, an unverified email is allowed to register again, which quietly heals any account that got stuck earlier.

## 3. Keeping the backend online

**The plan.** Backend on Railway, frontend on Vercel, database on MongoDB Atlas.

**What went wrong.** Railway runs on trial credit, and it ran out. The dashboard showed roughly four dollars and zero days left, which meant the API was about to vanish and take the whole app with it.

**What we tried, and what failed.** The first move was Koyeb, picked because it was known for a free always-on tier. By 2026 that had changed. Koyeb now asks for a credit card and pushes a paid plan, so it was a dead end for a free project. Fly.io was ruled out for the same reason, having ended its free tier for new accounts.

**The fix.** The backend now runs on Render's free tier, which needs no card, supports WebSockets, and builds straight from the existing Dockerfile. It is live and connected to Atlas. The one trade-off, cold starts, is covered in the next note.

## 4. Render's cold start

**What went wrong.** A Render free service goes to sleep after fifteen minutes without traffic, and the next visitor waits about fifty seconds for it to wake back up. For a live chat app, sleeping also drops open connections.

**Why it happens.** Idling unused services is how the free tier stays free.

**The fix.** A free uptime pinger (cron-job.org or UptimeRobot) hits the health endpoint every ten minutes, so the service never sees fifteen minutes of silence and never sleeps. One service kept warm this way stays inside the 750 free hours a month. If zero cold starts ever matter more than zero cost, Railway's five dollar Hobby plan removes the problem entirely.

## 5. Payments that could not pay

**The plan.** Collect the tip inside the app through Razorpay once a delivery is done.

**What went wrong.** The integration ran in test mode, but it had a deeper flaw. Standard Razorpay checkout collects money into the platform's own account and never forwards it to the runner. Actually paying the runner would need Razorpay Route or RazorpayX, full business KYC, and every runner's bank details. There was also no webhook for reliable confirmation, and a UX bug where confirming delivery hid the pay button.

**The fix.** The gateway was removed entirely. Tips, and the playful party or treat option, are now agreed inside the app and settled directly between the two students over UPI or in person. No KYC, no payout gap, and far less to go wrong at campus scale.

## 6. The bugs that only showed up in production

A short list of things that worked fine on a laptop and broke the moment they were deployed:

- Several API calls were hardcoded to http://localhost:3000, so saving a phone number and the live chat socket silently failed on the real site. Everything now goes through a single VITE_API_URL.
- A few stray notification lines were rendering as literal text on the request screen. They were removed, and a real notification now fires on status changes.
- A debug log was printing the full database connection string, credentials and all, into the server logs. It was removed.

## 7. The 404 that only hit direct links

**What went wrong.** Opening a route like /login directly, or refreshing while on it, returned a 404 from the host. Moving around inside the app was fine, but shared links and refreshes broke.

**Why it happened.** SLING is a single-page app, so the browser is meant to handle routing. The static host, though, went looking for a real /login file, did not find one, and gave up. Nothing told it to hand every path to the app.

**The fix.** A small vercel.json rewrites every route to index.html. The host still serves real files like scripts and icons directly, and only falls back to the app for actual routes, which lets the in-app router take over. This also matters for the installed PWA, where deep links and refreshes need to resolve.

## 8. Email blocked again, this time by the host

**What went wrong.** Even with Brevo set up, sending still failed in production with a ten second timeout, the same shape as the very first Gmail problem.

**Why it happened.** In September 2025 Render started blocking outbound SMTP ports on its free tier to curb spam. So Brevo's SMTP relay on port 587 could not connect either. It was the same wall as before, just moved from Gmail to the host.

**The fix.** Switch from SMTP to Brevo's HTTPS API. The email helper now posts to Brevo over port 443, which no host blocks, whenever a BREVO_API_KEY is set, and keeps SMTP as a fallback for local development. Email finally sends from production.
