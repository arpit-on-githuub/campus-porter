# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


__________________________________________________________________________________________________________________________________________


Let me give you the complete, interview-ready explanation of everything we built. Study this like a script — but understand every word so you can answer follow-up questions naturally.

---

# Complete Project Deep Dive — Interview Ready

---

## 1. The Project — How to Introduce It

**What you say in an interview:**

"I built a campus-only peer-to-peer delivery platform for IIT Jodhpur called Campus Porter. The core idea is simple — if someone is already heading to a location like the campus store, other students can request them to bring items back for a small tip. It's like a lightweight Dunzo but restricted entirely to the IIT Jodhpur campus community.

The platform has two roles — requester and porter — but any user can play either role at any time. Requesters post delivery requests with item details and a tip amount. Porters browse open requests for locations they're already visiting, accept one, fulfill it, and get paid through Razorpay. The entire system enforces campus-only access through IIT Jodhpur email verification."

---

## 2. Why This Problem Exists — Product Thinking

**What you say:**

"The problem I identified is very specific to campus life. Students frequently make trips to the campus store, canteen, or other locations. Meanwhile, other students in hostels want items from those same places but don't want to make the trip themselves — especially late at night, during exams, or in summer heat. There was no lightweight system to connect these two groups efficiently.

Existing solutions like Swiggy or Zomato don't operate inside campuses. Asking friends over WhatsApp is informal, unreliable, and has no payment mechanism. Campus Porter fills this gap with a structured, trustworthy, payment-enabled system restricted to verified campus members."

---

## 3. Tech Stack — Why Each Choice

**What you say:**

"I chose the MERN stack — MongoDB, Express, React, and Node.js — for several deliberate reasons.

Node.js for the backend because JavaScript runs on both frontend and React frontend, which means I maintain one language across the entire codebase. This reduces context switching and is the most common stack for startups and product companies in India right now.

Express because it's the most minimal and widely used web framework for Node.js. It gives you routing, middleware, and request handling without forcing any particular structure on you.

MongoDB because the data in this app is document-oriented and flexible. A delivery request has different fields depending on its state — an open request has no porter assigned, a completed one has ratings, payment IDs, timestamps. MongoDB handles this schema flexibility better than rigid SQL tables would for an early-stage product.

React for the frontend because it's component-based, which means I can build reusable UI pieces — a request card, a status badge, a rating widget — and compose them across different pages.

Razorpay for payments because it's the most widely used payment gateway in India, supports UPI natively, has excellent documentation, and has a free sandbox environment for testing."

---

## 4. System Architecture — The Big Picture

**What you say:**

"The architecture is a classic three-tier system. The React frontend runs in the user's browser and communicates with the Node/Express backend over HTTP REST APIs. The backend handles all business logic and communicates with MongoDB Atlas, which is our cloud database. Razorpay sits as an external service that the backend communicates with for payment processing.

The backend is structured using the MVC pattern — Models, Controllers, and Routes — with an additional layer for middleware and utilities. This separation means every file has exactly one responsibility, which makes debugging, testing, and scaling much easier."

---

## 5. Authentication System — Deep Dive

This is where most interview questions will come. Know every layer.

### Why JWT over sessions?

**What you say:**

"I chose JWT over traditional session-based authentication for a specific reason — scalability and statelessness.

In session-based auth, the server stores session data in memory or a database. Every request requires a database lookup to validate the session. If you scale to multiple servers, sessions need to be shared across all of them — which requires a shared Redis store or sticky sessions.

JWT is stateless. The token itself contains the user's ID, signed with a secret key. The server verifies the signature mathematically without any database lookup. This means any server in a cluster can validate any token independently. For a campus app that might scale to thousands of concurrent users during peak times, this matters."

### How JWT actually works

**What you say:**

"A JWT has three parts separated by dots. The header contains the algorithm used for signing — in our case HS256, which is HMAC with SHA-256. The payload contains the claims — in our case just the userId and expiry time. The signature is computed as HMAC-SHA256 of base64(header) + base64(payload) using our secret key.

When a user logs in, we create this token and send it back. The client stores it and sends it in the Authorization header as 'Bearer token' on every subsequent request. Our middleware calls jwt.verify() which recomputes the signature and compares it. If someone tampers with the payload — say, changes the userId to someone else's — the signature won't match and the token is rejected. This is cryptographically secure."

### Why bcrypt for passwords

**What you say:**

"bcrypt is a password hashing function specifically designed to be slow. That's intentional. Regular hash functions like MD5 or SHA256 are designed for speed — they can compute billions of hashes per second, which makes brute-force attacks feasible. bcrypt with a cost factor of 10 takes about 100 milliseconds per hash on modern hardware. An attacker trying to crack a bcrypt hash with a dictionary attack would need years instead of hours.

bcrypt also automatically generates and embeds a random salt — unique random data mixed into the password before hashing. This means two users with the same password get completely different hashes, which defeats rainbow table attacks."

### The OTP system

**What you say:**

"OTP verification serves two purposes. First, it proves the user actually owns the email they registered with — anyone can type any email address in a form. Second, it enforces our IIT-J only constraint at a human level — only someone who can receive emails at an @iitj.ac.in address can complete registration.

The OTP is a 6-digit number generated using Math.random() scaled to the range 100000-999999. It's stored hashed — actually in our current implementation stored plain but a production improvement would be to hash it. It has a 10-minute expiry stored as a Unix timestamp. After successful verification, the OTP is set to null so it can't be reused.

The email validation happens at two layers — in the controller with a simple string check, and in the Mongoose schema with a custom validator. Two layers of validation means even if someone bypasses the controller somehow, the database will reject the document."

### The @iitj.ac.in gate

**What you say:**

"The campus-only restriction is enforced at three levels. First, the API controller checks if the email ends with @iitj.ac.in before doing any database work — fail fast. Second, the Mongoose schema has a custom validator that runs before every save operation regardless of which code path triggered it. Third, the OTP verification means the user must physically receive an email at that address — you can't fake receiving an email at a domain you don't own."

---

## 6. The Folder Structure — Why It's Designed This Way

**What you say:**

"I followed the separation of concerns principle throughout the codebase. Each folder has one clear responsibility.

Models define the data shape and validation rules. Controllers contain the business logic — what actually happens when a request comes in. Routes define the URL structure and connect URLs to controller functions. Middleware contains reusable request interceptors that run before route handlers. Utils contain pure helper functions that have no dependency on Express or MongoDB — they just take inputs and return outputs.

This structure means when a bug occurs, I know immediately which layer to look at. A 400 validation error? Check the model. Wrong business logic? Check the controller. Authentication failing? Check the middleware. URL not found? Check the routes."

---

## 7. Middleware — The Interceptor Pattern

**What you say:**

"Middleware in Express is a function that sits between receiving a request and executing the route handler. It has access to the request object, the response object, and a next() function. If it calls next(), the request continues to the route handler. If it sends a response, the chain stops there.

Our auth middleware does three things. It extracts the JWT token from the Authorization header. It verifies the token's signature using our secret key. If valid, it fetches the user from MongoDB and attaches them to req.user so every subsequent handler has access to the authenticated user without another database query. If the token is missing or invalid, it returns a 401 immediately and the route handler never executes.

This pattern means I can protect any route with a single word — just add 'protect' as a middleware parameter. The security logic is written once and reused everywhere."

---

## 8. Database Design Decisions

**What you say:**

"I chose MongoDB over PostgreSQL for this project because of schema flexibility. A delivery request evolves through multiple states — open, accepted, picked up, delivered, completed, cancelled. Each state has different relevant fields. In a relational database I'd either have nullable columns for every possible field, or a complex join across multiple tables. In MongoDB, a document naturally represents this evolving state as a single object.

I used MongoDB Atlas, the managed cloud service, instead of a local installation because it mirrors production environments, requires no maintenance, scales automatically, and has a generous free tier. The connection string uses the SRV format which handles server discovery and automatic failover across the Atlas cluster.

Mongoose adds a schema layer on top of MongoDB's flexibility. This gives us the best of both worlds — flexible document storage with enforced structure at the application level."

---

## 9. Security Decisions

**What you say:**

"Several security decisions were made deliberately.

Passwords are hashed with bcrypt before storage — we never store plain text passwords and can never retrieve them.

The JWT secret is stored in an environment variable, never in code. If it were in code, anyone with GitHub access could forge tokens.

The login error message says 'Invalid email or password' regardless of which was wrong. This is called security through obscurity at the UX level — telling an attacker 'email not found' confirms the email doesn't exist in our system, which helps them enumerate valid accounts.

The .env file is in .gitignore — secret keys never reach GitHub.

CORS is configured to only allow requests from our frontend's origin — in production this would be the actual domain, not a wildcard."

---

## 10. DSA Concepts — How to Talk About Them

**What you say:**

"Several data structure and algorithm concepts appear naturally in this project.

The OTP generation uses a random number in a specific range — this is essentially a uniform random sampling problem. The range [100000, 999999] guarantees exactly 6 digits, which is a constraint I enforced mathematically rather than with string padding.

The request board will use a priority queue — implemented as a min-heap — to sort requests by a composite score. The score function weights tip amount, time since posting, and urgency flag. This is a classic heap application where the comparator function encodes business logic.

The JWT expiry check is a time-based comparison — current timestamp versus stored expiry timestamp. Simple but it's fundamentally a range query.

When we add smart porter matching, I'll model the campus as a weighted graph where nodes are locations and edges are walking paths. Finding the nearest available porter to a request location is a BFS problem. Finding the optimal path for a porter handling multiple requests is a variant of the Travelling Salesman Problem — which I'd solve approximately using a greedy nearest-neighbor heuristic for the MVP.

Rate limiting — which prevents spam requests — will be implemented using the token bucket algorithm. Each user gets a bucket of tokens that refills at a fixed rate. Each API call costs one token. This is O(1) per check and O(n) space where n is the number of active users."

---

## 11. Common Interview Questions and Answers

**Q: What is a REST API?**
"REST stands for Representational State Transfer. It's an architectural style for building APIs over HTTP. Key constraints: stateless (server stores no client state between requests), uniform interface (standard HTTP methods — GET, POST, PUT, PATCH, DELETE), and resource-based URLs. In our app, `/api/requests` is a resource. GET fetches it, POST creates a new one, PATCH updates one."

**Q: What is middleware?**
"A function that intercepts the request-response cycle. It runs between receiving a request and executing the final handler. Can modify req/res objects, end the cycle, or call next() to pass control forward. Express processes middleware in the order they're registered."

**Q: What's the difference between authentication and authorization?**
"Authentication is proving who you are — login, JWT verification. Authorization is proving you're allowed to do something — checking if the logged-in user owns the request they're trying to update. Our auth middleware handles authentication. Authorization checks happen inside individual controller functions."

**Q: Why MongoDB over MySQL for this project?**
"The delivery request object evolves through states with different fields at each state. MongoDB's document model handles this naturally. A relational schema would require nullable columns or complex joins. For an early-stage product with potentially changing requirements, schema flexibility reduces friction."

**Q: How does bcrypt work?**
"bcrypt applies a key derivation function called Blowfish in a loop — the cost factor determines how many iterations. It generates a random 128-bit salt, prepends it to the password, and hashes the combination. The output includes the algorithm version, cost factor, salt, and hash — everything needed for future verification. The slow design makes brute force attacks computationally expensive."

**Q: What happens if the JWT secret is leaked?**
"An attacker could forge tokens for any userId in the system — essentially impersonating any user including admins. The fix is to immediately rotate the secret key, which invalidates all existing tokens forcing all users to log in again. This is why the secret must never be committed to version control."

**Q: How would you scale this system?**
"Horizontal scaling of the Node.js servers behind a load balancer. JWT is stateless so any server can handle any request. MongoDB Atlas scales with replica sets and sharding. Add Redis for OTP caching and rate limiting instead of in-memory storage. Add a CDN for static frontend assets."

---

## The one-line summary for every file

```
.env                  → secret keys, never committed to GitHub
package.json          → project dependencies list
app.js                → Express configuration, middleware, routes
server.js             → starts the server after DB connects
src/config/db.js      → opens MongoDB connection
src/models/User.js    → user data blueprint with @iitj.ac.in gate
src/utils/generateOTP → random 6-digit number generator
src/utils/sendEmail   → Gmail-based email sender
src/controllers/auth  → register, verifyOTP, login business logic
src/routes/auth       → URL to controller function mapping
src/middleware/auth   → JWT verification for protected routes
```

---

Read this three times. Understand every section. When an interviewer asks about your project, you're not reciting — you're explaining something you genuinely built and understand.

Say **"Phase 2"** when ready to continue building.
