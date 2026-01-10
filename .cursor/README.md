# Namastey Node - DevTinder Backend

## Project Overview

This is a **Tinder-like dating/networking app backend for developers** called "DevTinder" (also branded as "LovNti"). It's a Node.js/Express REST API that allows developers to connect with each other through a swipe-based connection system.

**Live Domain:** `lovnti.in`

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Express 5.x** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **AWS SES** | Email notifications |
| **node-cron** | Scheduled tasks |
| **validator** | Input validation |
| **date-fns** | Date manipulation |

--- 

## Project Structure

```
src/
├── app.js                    # Entry point, Express setup, CORS config
├── config/
│   └── database.js           # MongoDB connection (mongoose)
├── lib/
│   ├── sesClient.js          # AWS SES client setup
│   └── sesUtils.js           # SES utilities
├── middlewares/
│   └── auth.js               # JWT authentication middleware
├── model/
│   ├── userSchema.js         # User model with JWT & password methods
│   └── connectionRequest.js  # Connection request model (swipes)
├── routes/
│   ├── auth.js               # /signup, /login, /logout
│   ├── profile.js            # /profile, /profile/edit
│   ├── request.js            # /request/send, /request/review
│   └── user.js               # /user/requests/received, /user/connections, /feed
└── utils/
    ├── cronjob.js            # Daily email notification cron
    ├── sendEmail.js          # AWS SES email sending
    ├── validation.js         # Input validation helpers
    └── constants/
        ├── Errors/index.js   # Error message constants
        └── Success/index.js  # Success message constants
```

---

## Core Concepts

### 1. User Model (`src/model/userSchema.js`)

User schema fields:
- `firstName` (required), `lastName`
- `email` (required, unique, lowercase)
- `password` (hashed with bcrypt)
- `age`, `gender` (male/female/others)
- `photoUrl`, `about`, `skills[]`
- `timestamps` (createdAt, updatedAt)

**Instance Methods:**
- `user.getJWT()` - Generates JWT token (7-day expiry)
- `user.validatePassword(input)` - Compares password with hash

### 2. Connection Request Model (`src/model/connectionRequest.js`)

Tracks swipe interactions between users:
- `fromUserId` - User who sent the request
- `toUserId` - User receiving the request
- `status` - One of: `"interested"`, `"ignored"`, `"accepted"`, `"rejected"`

**Indexes:** Compound index on `{fromUserId, toUserId}` for query performance.

**Pre-save Hook:** Prevents users from sending requests to themselves.

---

## Authentication Flow

1. **Signup** (`POST /signup`)
   - Validates input (name length, email format, strong password)
   - Hashes password with bcrypt (10 rounds)
   - Creates user in database

2. **Login** (`POST /login`)
   - Finds user by email
   - Validates password using `user.validatePassword()`
   - Generates JWT using `user.getJWT()`
   - Sets JWT in HTTP cookie named `token`

3. **Auth Middleware** (`src/middlewares/auth.js`)
   - Extracts `token` from cookies
   - Verifies JWT with `process.env.JWT_ENCODE_KEY`
   - Fetches user from DB and attaches to `req.user`
   - Protected routes use `userAuth` middleware

4. **Logout** (`POST /logout`)
   - Expires the `token` cookie immediately

---

## API Endpoints

### Auth Routes (`/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Register new user |
| POST | `/login` | No | Login, returns JWT cookie |
| POST | `/logout` | No | Clears JWT cookie |

### Profile Routes (`/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | Yes | Get logged-in user's profile |
| PATCH | `/profile/edit` | Yes | Update profile fields |

**Editable Fields:** `firstName`, `lastName`, `age`, `about`, `photoUrl`, `gender`, `skills`

### Request Routes (`/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/request/send/:status/:toUserId` | Yes | Send connection request |
| POST | `/request/review/:status/:requestId` | Yes | Accept/reject request |

**Send Status Values:** `"interested"` (right swipe), `"ignored"` (left swipe)

**Review Status Values:** `"accepted"`, `"rejected"`

### User Routes (`/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/requests/received` | Yes | Get pending incoming requests |
| GET | `/user/connections` | Yes | Get accepted connections |
| GET | `/feed` | Yes | Get users to swipe (paginated) |

**Feed Query Params:** `?page=1&limit=10` (max limit: 50)

---

## Key Implementation Details

### Feed Algorithm (`GET /feed`)

The feed excludes:
1. The logged-in user themselves
2. Users with ANY existing connection request (sent or received, regardless of status)

```javascript
// Collects all user IDs to hide from feed
const hideUsersFromFeed = new Set();
connectionList.forEach((request) => {
  hideUsersFromFeed.add(request.fromUserId.toString());
  hideUsersFromFeed.add(request.toUserId.toString());
});
```

### Connection Request Logic

**Sending Request:**
- Checks if target user exists
- Prevents duplicate requests (bidirectional check)
- Only allows `interested` or `ignored` status

**Reviewing Request:**
- Only the recipient (`toUserId`) can review
- Only requests with `status: "interested"` can be reviewed
- Updates status to `accepted` or `rejected`

### Cron Job (`src/utils/cronjob.js`)

Runs every minute to send email notifications:
- Finds all pending `interested` requests from today
- Collects unique recipient emails
- Sends reminder emails via AWS SES (currently commented out)

---

## Response Format

All API responses follow this structure:

```json
{
  "message": "Human-readable message",
  "success": true | false,
  "data": { /* optional payload */ }
}
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port |
| `JWT_ENCODE_KEY` | Secret for JWT signing |
| `DB_USER` | MongoDB username |
| `DB_PASS` | MongoDB password |
| `DB_NAME` | Database name (default: `devTinder`) |
| AWS credentials | For SES email service |

---

## CORS Configuration

Allowed origins:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000`
- `http://13.60.188.185` (production IP)
- `https://lovnti.in` (production domain)

Credentials are enabled for cookie-based auth.

---

## Important Notes for Development

1. **Password Validation:** Uses `validator.isStrongPassword()` - requires mix of upper, lower, numbers, symbols
2. **JWT Location:** Token stored in HTTP cookie, not localStorage
3. **User Data Safety:** `USER_SAFE_DATA` constant defines fields safe to expose: `"firstName lastName age photoUrl skills about email"`
4. **No Pagination Max:** Feed has max limit of 50 items per page
5. **Email Sending:** Currently commented out in cron and login routes

---

## Database

- **Provider:** MongoDB Atlas
- **Cluster:** `node-by-akshay.wxvdczb.mongodb.net`
- **Default DB Name:** `devTinder`

---

## Running the Project

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

---

## Common Patterns in Codebase

1. **Error Handling:** Try-catch in route handlers, return `{message, success: false}`
2. **Auth Check:** Always use `userAuth` middleware for protected routes
3. **User Access:** After auth, user available at `req.user`
4. **Validation:** Centralized in `utils/validation.js`
5. **Constants:** Error/Success messages in `utils/constants/`

