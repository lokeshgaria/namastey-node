# Contributing to lovnt.in (namastey-node)

## Commit Convention

All commits must follow the **Conventional Commits** specification.

```
type(scope): short description

Examples:
feat(chat): add typing indicator via socket
fix(auth): resolve JWT refresh token expiry
chore(deps): update mongoose to v8.17.1
```

---

## Types

| Type       | When to Use                              | Example                                      |
|------------|------------------------------------------|----------------------------------------------|
| `feat`     | New feature the user sees                | `feat(feed): add location-based filtering`   |
| `fix`      | Bug fix                                  | `fix(auth): resolve bcrypt comparison error` |
| `chore`    | Maintenance, no logic change             | `chore(deps): update redis to v5.10.0`       |
| `refactor` | Code restructured, no feature or fix     | `refactor(user): extract profile validation` |
| `test`     | Adding or fixing tests                   | `test(connection): add unit tests for repo`  |
| `docs`     | Documentation only                       | `docs(readme): update setup instructions`    |
| `perf`     | Performance improvement                  | `perf(feed): cache feed results in Redis`    |
| `style`    | Formatting only, zero logic change       | `style(app): fix indentation in middleware`  |
| `ci`       | CI/CD pipeline changes                   | `ci(github): add test workflow on push`      |
| `build`    | Build system or config changes           | `build(eslint): migrate to flat config`      |
| `revert`   | Reverting a previous commit              | `revert: feat(chat): add typing indicator`   |

---

## Scopes

Scopes are based on your exact project structure in `src/`.

### 🔐 Auth
**Scope:** `auth`
**Touches:** `AuthController.js`, `AuthService.js`, `auth.routes.js`, `authValidators.js`, `middlewares/auth.js`, `routes/auth.js`

```bash
feat(auth): add Google OAuth login
fix(auth): resolve JWT expiry not refreshing
refactor(auth): extract token generation to helper
test(auth): add unit tests for login flow
```

---

### 👤 User
**Scope:** `user`
**Touches:** `UserController.js`, `UserService.js`, `UserRepository.js`, `user.routes.js`, `userSchema.js`, `routes/user.js`, `routes/profile.js`

```bash
feat(user): add profile completion percentage
fix(user): resolve profile photo not updating
refactor(user): move validation to userValidators
test(user): add unit tests for UserRepository
```

---

### 💬 Chat
**Scope:** `chat`
**Touches:** `ChatController.js`, `ChatService.js`, `ChatRepostory.js`, `chat.routes.js`, `chat.js (model)`, `routes/chat.js`, `utils/socket.js`

```bash
feat(chat): add typing indicator via socket
feat(chat): add read receipts to messages
fix(chat): resolve duplicate message on reconnect
refactor(chat): extract socket events to separate file
```

---

### 🔗 Connection
**Scope:** `connection`
**Touches:** `ConnectionController.js`, `ConnectionService.js`, `ConnectionRepository.js`, `connection.routes.js`, `connectionRequest.js (model)`, `connectionValidator.js`, `routes/request.js`

```bash
feat(connection): add mutual match detection
fix(connection): resolve duplicate connection request
refactor(connection): simplify accept/reject logic
test(connection): add integration tests for match flow
```

---

### 🃏 Feed
**Scope:** `feed`
**Touches:** `FeedController.js`, `Feedservice.js`, `feed.routes.js`, `routes/profile.js`

```bash
feat(feed): add age range filter to discovery
perf(feed): cache feed results in Redis
fix(feed): resolve empty feed for new users
refactor(feed): move scoring logic to FeedService
```

---

### 💳 Order / Payment
**Scope:** `order`
**Touches:** `OrderController.js`, `OrderService.js`, `OrderRepository.js`, `order.routes.js`, `Orders.js (model)`, `utils/razorPay.js`, `routes/upgrade.js`, `utils/constants/Orger.js`

```bash
feat(order): add Razorpay webhook handler
fix(order): resolve payment status not updating
refactor(order): extract Razorpay utils to helper
test(order): add unit tests for OrderService
```

---

### 📤 Upload
**Scope:** `upload`
**Touches:** `UploadController.js`, `upload.routes.js`, `uploadMiddleware.js`, `ImageService.js`, `s3Client.js`

```bash
feat(upload): add image compression before S3 upload
fix(upload): resolve multer file size limit error
refactor(upload): extract S3 logic to ImageService
perf(upload): add Sharp optimization pipeline
```

---

### 📧 Email
**Scope:** `email`
**Touches:** `sesClient.js`, `sesUtils.js`, `utils/sendEmail.js`, `infrastructure/email/sesClient.js`, `lib/sesClient.js`, `lib/sesUtils.js`

```bash
feat(email): add welcome email on registration
fix(email): resolve SES sandbox sending error
refactor(email): consolidate sesClient to infrastructure
```

---

### 🗄️ Cache
**Scope:** `cache`
**Touches:** `CacheService.js`, `infrastructure/cache/redis.js`

```bash
feat(cache): add cache-aside pattern for user profiles
fix(cache): resolve Redis connection timeout on startup
perf(cache): add TTL strategy for feed cache keys
refactor(cache): centralise key patterns in CacheService
```

---

### 🗃️ Database
**Scope:** `db`
**Touches:** `config/database.js`, `infrastructure/database/mongoose.js`, `src/database.js`

```bash
fix(db): resolve mongoose connection retry logic
refactor(db): move connection to infrastructure layer
perf(db): add indexes to connectionRequest schema
```

---

### 🏗️ Infrastructure
**Scope:** `infra`
**Touches:** `infrastructure/` (all), `config/container.js`, `config/constants.js`

```bash
refactor(infra): set up dependency injection container
feat(infra): add S3 client with retry logic
fix(infra): resolve Redis client not reconnecting
```

---

### 🔒 Middleware
**Scope:** `middleware`
**Touches:** `middlewares/auth.js`, `middlewares/errorHandler.js`, `middlewares/metricsMiddleware.js`, `middlewares/validation.js`

```bash
feat(middleware): add rate limiting to auth routes
fix(middleware): resolve error handler not catching async errors
refactor(middleware): centralise validation middleware
```

---

### 📊 Metrics / Health
**Scope:** `metrics`
**Touches:** `metricsMiddleware.js`, `metrics.routes.js`, `health.routes.js`

```bash
feat(metrics): add response time tracking
fix(metrics): resolve health check false negative
refactor(metrics): extract metric labels to constants
```

---

### ⚙️ App / Config
**Scope:** `app`
**Touches:** `src/app.js`, `config/constants.js`, `config/container.js`

```bash
fix(app): initialise cacheService correctly
refactor(app): move socket setup to utils/socket.js
chore(app): update CORS allowed origins
```

---

### 🛠️ Utils
**Scope:** `utils`
**Touches:** `utils/helpers.js`, `utils/validation.js`, `utils/cronjob.js`, `utils/constants/`

```bash
feat(utils): add pagination helper function
fix(utils): resolve date formatting in helpers
refactor(utils): consolidate error constants
```

---

### 🔁 Routes (Legacy)
**Scope:** `routes`
**Touches:** `src/routes/` (old route files before v2 migration)

```bash
refactor(routes): migrate auth routes to api/v2
chore(routes): remove deprecated profile routes
```

---

### 📦 Dependencies
**Scope:** `deps`
**Touches:** `package.json`, `package-lock.json`

```bash
chore(deps): update mongoose to v8.17.1
chore(deps): remove unused crypto package
chore(deps): replace eslint-plugin-node with eslint-plugin-n
```

---

### 🔧 Tooling
**Scope:** `eslint` `prettier` `husky` `jest` `git`
**Touches:** `eslint.config.mjs`, `.prettierrc`, `.husky/`, `commitlint.config.js`, `.gitattributes`

```bash
build(eslint): migrate to flat config v9
build(husky): add pre-push test hook
build(prettier): update print width to 100
chore(git): normalize line endings with gitattributes
```

---

## Quick Reference Card

```
feat(auth)        fix(chat)         chore(deps)
feat(user)        fix(feed)         chore(git)
feat(chat)        fix(upload)       chore(app)
feat(feed)        fix(cache)        refactor(user)
feat(connection)  fix(db)           refactor(infra)
feat(order)       fix(middleware)   refactor(connection)
feat(upload)      fix(order)        test(auth)
feat(email)       fix(auth)         test(chat)
feat(cache)       fix(app)          test(connection)
feat(metrics)     fix(utils)        perf(feed)
feat(infra)       fix(routes)       perf(cache)
feat(utils)                         docs(readme)
```

---

## Rules

1. **Type and scope are mandatory** — no exceptions
2. **Description is lowercase** — `add typing indicator` not `Add Typing Indicator`
3. **No period at the end** — `fix(auth): resolve bug` not `fix(auth): resolve bug.`
4. **Present tense** — `add feature` not `added feature`
5. **Max 72 characters** in the subject line
6. **Breaking changes** — add `!` after scope: `feat(auth)!: remove v1 login endpoint`

---

## Bad vs Good Examples

```bash
# ❌ Bad — blocked by commitlint
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"
git commit -m "asdfgh"

# ✅ Good — passes commitlint
git commit -m "fix(chat): resolve duplicate message on reconnect"
git commit -m "feat(feed): add age range filter"
git commit -m "chore(deps): update socket.io to v4.8.3"
git commit -m "refactor(user): extract avatar upload to ImageService"
```

---

*Based on [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification.*