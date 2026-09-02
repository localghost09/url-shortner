import { useState } from "react";

const API_URL = "/api/urls";

// If the backend hands us a localhost short URL, swap in the current host so
// the link stays usable from wherever the app is being viewed (preview/local).
function toUsableShortUrl(shortUrl) {
  try {
    const url = new URL(shortUrl);
    const LOCAL_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"];
    if (LOCAL_HOSTS.includes(url.hostname)) {
      url.host = window.location.host;
      url.protocol = window.location.protocol;
      return url.toString().replace(/\/$/, "");
    }
  } catch (_) {
    /* not a parseable URL — keep it as returned */
  }
  return shortUrl;
}

export default function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setShortUrl("");
    setCopied(false);

    const value = originalUrl.trim();
    if (!value) {
      setError("Please enter a URL to shorten.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setShortUrl(toUsableShortUrl(data.shortUrl));
    } catch (_) {
      setError(
        "Could not reach the backend. Make sure the server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy with a fallback for browsers/iframes that block the async Clipboard
  // API (e.g. the live preview). Falls back to a hidden textarea + execCommand.
  const copyToClipboard = async () => {
    const text = shortUrl;
    setError("");

    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (_) {
        ok = false;
      }
      document.body.removeChild(textarea);
      return ok;
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (_) {
      // fall through to fallback
    }

    if (fallbackCopy()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    // Last resort: show the short URL so the user can select/copy it manually.
    setError("Could not auto-copy. Please select the link below and copy it manually.");
  };

  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <div className="brand">
            <span className="logo">🔗</span>
            <h1>URL Shortener</h1>
          </div>
          <p className="tagline">
            Turn long, messy links into short, shareable ones in a click.
          </p>
        </div>
      </header>

      <main className="container">
        <section className="card">
          <form onSubmit={handleSubmit} className="shortener-form">
            <label htmlFor="url" className="form-label">
              Paste your long URL
            </label>
            <div className="input-row">
              <input
                id="url"
                type="text"
                placeholder="e.g. https://example.com/some/very/long/path"
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Shortening…" : "Shorten URL"}
              </button>
            </div>
          </form>

          {error && <p className="error">{error}</p>}

          {shortUrl && (
            <div className="result">
              <div className="result-label">Your short URL is ready 🎉</div>
              <div className="result-line">
                <a href={shortUrl} target="_blank" rel="noreferrer">
                  {shortUrl}
                </a>
                <button className="copy-btn" onClick={copyToClipboard}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="info-grid">
          <div className="info-col">
            <h2>How it works</h2>
            <ol>
              <li>Paste any valid URL into the box above.</li>
              <li>Hit “Shorten URL” — a short code is generated for it.</li>
              <li>Share the short link anywhere. Anyone who opens it is redirected to your original URL.</li>
            </ol>
          </div>

          <div className="info-col">
            <h2>Built with</h2>
            <ul className="stack">
              <li><strong>Backend:</strong> Node.js, Express</li>
              <li><strong>Database:</strong> MongoDB &amp; Mongoose</li>
              <li><strong>Frontend:</strong> React + Vite</li>
              <li><strong>API:</strong> <code>POST /api/urls</code></li>
            </ul>
          </div>

          <div className="info-col">
            <h2>Why short links?</h2>
            <ul>
              <li>Neat, memorable and easy to paste in messages.</li>
              <li>No fragile long URLs full of query strings.</li>
              <li>Auto-generated 6-character codes, always unique.</li>
              <li>Built for speed — a tiny Express server does the redirect.</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>URL Shortener — a simple Express + MongoDB + React project.</p>
        </div>
      </footer>
    </div>
  );
}
