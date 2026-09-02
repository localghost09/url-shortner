# 🔗 URL Shortener

A tiny full-stack URL shortener. Paste a long URL, get a short one back, and
anyone who opens the short link is redirected to the original.

## Tech stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Backend  | Node.js + Express                           |
| Database | MongoDB (Mongoose)                          |
| Frontend | React (via Vite)                            |
| API      | `POST /api/urls` to create, redirect at `/:code` |

## Project structure

```
.
├── server.js              # Express app + Mongo connection (port 5000)
├── controllers/           # Request handlers (create + redirect)
│   └── urlController.js
├── models/                # Mongoose Url schema
│   └── Url.js
├── routes/                # Express routes (POST /api/urls, GET /:code)
│   └── urlRoutes.js
├── utils/                 # Short-code generator (6-char alphanumeric)
│   └── generateCode.js
└── frontend/              # React + Vite single-page app
    └── src/
        ├── App.jsx        # UI + calls the backend
        └── index.css      # Styling
```

## Getting started

### 1. Backend

Create a `.env` file with your MongoDB connection string:

```
MONGO_URI=mongodb://127.0.0.1:27017/url-shortener
```

Install and run:

```bash
npm install
npm start   # (add "start": "node server.js" if not present)
# Server runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

The Vite dev server proxies `/api` (and short-code redirects) to the backend
on port 5000, so the browser only ever talks to the frontend origin.

## API

### Create a short URL

`POST /api/urls`

```json
{ "originalUrl": "https://example.com/very/long/path" }
```

`201 Created`

```json
{ "originalUrl": "https://example.com/very/long/path",
  "shortUrl": "http://localhost:5000/AbCdEf" }
```

The short code is a random 6-character alphanumeric string, generated until it
is unique in the database.

### Redirect

`GET /:code` → `302` redirect to the original URL (or `404` if not found).

## How each short URL is made

1. The frontend submits the original URL to `POST /api/urls`.
2. The controller validates it (must be a valid URL) and rejects empty/invalid
   input with `400`.
3. A unique 6-character code is generated (`utils/generateCode.js`).
4. The `{ originalUrl, shortCode }` document is saved to MongoDB.
5. Visiting `/code` looks up the document and issues a `302` redirect.
