const path = require("path");
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
// This means visiting the backend's root URL shows the app instead of a 404.
// If the frontend is deployed separately (Vercel), this is simply unused.
const frontendDist = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendDist));

app.get("/", (req, res) => {
  res.json({
    message: "URL shortener API is running",
  });
});

// API + redirect routes. Order matters: static files are served first, so a
// request to /AbCdEf (a short code) falls through to the redirect route below.
app.use(urlRoutes);

// SPA fallback: any other GET returns index.html (client-side routing / refresh).
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) next(); // no built frontend yet — let it 404 normally
  });
});

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
