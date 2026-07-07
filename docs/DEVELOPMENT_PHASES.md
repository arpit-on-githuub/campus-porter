# SLING — Development Phases

How SLING came together, phase by phase. Each phase built on the last, from a bare campus noticeboard to an installable, animated delivery app. New phases are added here as the project grows.

## Phase 1, the foundation

Campus-gated sign-up with an email OTP, JWT login, and the ability to post and browse requests. The iitj.ac.in gate came first, because trust is the entire point of the app.

## Phase 2, the delivery loop

The status state machine, the accept flow, and the rules about who is allowed to move a request into which state. This is where it stopped being a noticeboard and started being a delivery app.

## Phase 3, people and trust

Real-time chat, two-way ratings, optional phone reveal, and profiles. Every request also carries an agreed tip that the runner and requester settle between themselves.

## Phase 4, polish and reliability

The rebrand from Campus Porter to SLING, the animated logo, and the first pass of subtle motion. This phase also cleared a stack of real bugs: email that failed fast instead of hanging, no more orphaned accounts when signup half-completed, and API calls that stopped pointing at localhost. Connection pooling and indexing landed here too.

## Phase 5, going properly live

The backend moved off the exhausted Railway trial onto Render, email now sends through Brevo's HTTPS API, the frontend on Vercel got a single-page-app rewrite so deep links and refreshes resolve, and the web app became installable as a PWA.

## Phase 6, the mobile-first glow-up

A bold, playful redesign built for the phone. A full-screen zoomed SLING celebration fires when a request is posted or accepted, the navigation became a floating glass pill, and aurora backgrounds, gradient calls to action, glassmorphism, and bouncy card entrances run throughout. The request page gained an animated status timeline, and the account emails became branded HTML instead of plain text.

## Next up

- A native Android build with Capacitor, published to the Play Store
- Redis-backed chat so multiple backend instances share the same rooms
- Smarter runner matching based on where people already are
- Token-bucket rate limiting to keep things tidy
- Push notifications on mobile
