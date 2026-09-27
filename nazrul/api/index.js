// Vercel serverless entry: serves the Express backend at /api/* on the same
// domain as the website (see vercel.json). Locally, run backend/server.js.
const app = require("../backend/server");

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api(?=\/|\?|$)/, "") || "/";
  return app(req, res);
};
