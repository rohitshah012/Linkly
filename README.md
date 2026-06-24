# Linkly — URL Shortener

A full-stack URL shortener built with Node.js, Express, MongoDB, and EJS. Linkly provides a public landing page, secure user authentication, click tracking, personal link management, and an administrator dashboard.

## Features

- Public, responsive landing page
- User signup and login
- Separate administrator login
- Secure password hashing with bcrypt
- JWT authentication through HTTP-only cookies
- Eight-character short URLs generated with Nano ID
- Public short-link redirects
- Per-link visit tracking
- Personal link dashboard
- Link deletion with ownership checks
- Administrator dashboard with user, link, and visit statistics
- Responsive login, signup, user, and admin interfaces

## Technology Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Server | Express |
| Database | MongoDB with Mongoose |
| Views | EJS |
| Authentication | JSON Web Tokens and cookies |
| Password security | bcrypt |
| Short IDs | Nano ID |

## Requirements

- Node.js 20.19 or newer
- npm
- MongoDB Community Server or a MongoDB Atlas database

## Installation

Clone the repository:

```bash
git clone https://github.com/rohitshah012/url-shortner.git
cd url-shortner/server
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a `.env` file inside the `server` directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/urlshortner
JWT_SECRET=replace-with-a-long-random-secret
PORT=8002
NODE_ENV=development
```

For the administrator creation script, also provide:

```env
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
```

## Running the Application

From the `server` directory, start the production server:

For development with automatic restart:

```powershell
npm run dev
```

Open:

```text
http://localhost:8002
```

## Creating an Administrator

Configure `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `server/.env`, then run:

```bash
npm run create-admin
```

The command creates a new administrator or promotes an existing account with the same email.

Administrator login is available at:

```text
http://localhost:8002/login?mode=admin
```

## How It Works

1. Visitors can view the public home page.
2. Submitting a URL while logged out redirects the visitor to login.
3. Authenticated users can create and manage short links.
4. Each short link is available at `/url/:shortId`.
5. Opening a short link records a visit before redirecting to its destination.
6. Administrators can review platform-wide user and link activity.

## Main Routes

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Landing page or authenticated user dashboard |
| `GET` | `/signup` | Public | Signup page |
| `GET` | `/login` | Public | User login page |
| `GET` | `/login?mode=admin` | Public | Administrator login page |
| `POST` | `/user` | Public | Create a user account |
| `POST` | `/user/login` | Public | Authenticate a user |
| `POST` | `/user/admin-login` | Public | Authenticate an administrator |
| `POST` | `/user/logout` | Authenticated | End the current session |
| `POST` | `/url` | Authenticated | Create a short URL |
| `GET` | `/url/:shortId` | Public | Record a visit and redirect |
| `GET` | `/url/analytics/:shortId` | Authenticated | Return link analytics |
| `DELETE` | `/url/:shortId` | Owner or admin | Delete a short URL |
| `GET` | `/admin/urls` | Admin | Open the administrator dashboard |

## Project Structure

```text
url-shortner/
├── README.md
└── server/
    ├── connection/
    │   └── connectMongo.js
    ├── controllers/
    │   ├── url.js
    │   └── user.js
    ├── middlewares/
    │   └── auth.js
    ├── models/
    │   ├── url.js
    │   └── user.js
    ├── routes/
    │   ├── stasticRoute.js
    │   ├── urlRoute.js
    │   └── user.js
    ├── scripts/
    │   └── createAdmin.js
    ├── service/
    │   └── auth.js
    ├── views/
    │   ├── admin.ejs
    │   ├── home.ejs
    │   ├── login.ejs
    │   └── signup.ejs
    ├── index.js
    └── package.json
```

## Security

- Passwords are hashed before storage.
- Authentication cookies are HTTP-only.
- Production cookies are marked secure when `NODE_ENV=production`.
- JWT sessions expire after seven days.
- Link analytics and deletion are protected by role and ownership checks.
- Only HTTP and HTTPS destination URLs are accepted.


## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Commit with a clear message.
5. Open a pull request.
