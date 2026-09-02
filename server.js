const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const urlRoutes = require("./routes/urlRoutes");

const app = express();

app.use(express.json());

// Serve the built React app (frontend/dist) from the same origin as the API.
// This means visiting the backend's root URL shows the app instead of a 404.
const frontendDist = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendDist));

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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
