// Vercel Serverless Function: secure proxy to the Anthropic API.
// - Keeps ANTHROPIC_API_KEY server-side only (set as a Vercel environment variable).
// - Only accepts requests from the allowed origin (your Wix domain).
// - Forwards the request body unchanged to https://api.anthropic.com/v1/messages.

const ALLOWED_ORIGINS = [
  "https://www.wisard.ai",
  "https://wisard.ai",
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(req, res);

  // Preflight
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // Reject any origin not on the allow-list (covers non-browser / no-Origin requests too)
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    res.status(403).json({ error: { message: "Forbidden: origin not allowed" } });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: "Server misconfigured: ANTHROPIC_API_KEY missing" } });
    return;
  }

  try {
    const { model, max_tokens, system, messages } = req.body || {};

    if (!model || !messages) {
      res.status(400).json({ error: { message: "Invalid request body" } });
      return;
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });

    const data = await anthropicRes.json();
    res.status(anthropicRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message || "Proxy error" } });
  }
}
