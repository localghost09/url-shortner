const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const urlRoutes = require("./routes/urlRoutes");

const app = express();

// Render/Vercel sit behind a proxy, so trust X-Forwarded-* headers to derive
// the correct protocol/host for the short URLs we build.
app.set("trust proxy", true);

// Allow the frontend (deployed separately, e.g. on Vercel) to call this API
// from another origin. Keep it open for this project; tighten in production.
app.use(cors());
app.use(express.json());

// Serve the built React app (frontend/dist) from the same origin as the API.
// This means visiting the app's root URL shows the UI instead of a 404.
// The Render Blueprint builds the frontend during deploy (see render.yaml /
// the "build:frontend" npm script); in local development run
// `npm run build:frontend` once so this works, or use the Vite dev server.
const frontendDist = path.join(__dirname, "frontend", "dist");
const frontendIndex = path.join(frontendDist, "index.html");
const hasFrontend = fs.existsSync(frontendIndex);

if (hasFrontend) {
  app.use(express.static(frontendDist));

  // API + redirect routes. Order matters: static files are served first, so a
  // request to /AbCdEf (a short code) falls through to the redirect route below.
  app.use(urlRoutes);

  // SPA fallback: any other non-API GET returns index.html (client-side
  // routing / refresh). Kept as a plain middleware (not app.get("*")) because
  // Express 5 / path-to-regexp v8 no longer accepts the bare "*" pattern.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    res.sendFile(frontendIndex, (err) => {
      if (err) next();
    });
  });
} else {
  // No built frontend: the service is API-only. Log clearly so a missing
  // build step is obvious instead of surfacing as a confusing "Cannot GET /".
  app.use(urlRoutes);
  console.warn(
    "[server] frontend/dist/index.html not found - serving API only. " +
      "Run `npm run build:frontend` (or check the Render build command) " +
      "to serve the web app from this same URL."
  );
}

// Render and most hosts inject the port via the PORT env var.
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
