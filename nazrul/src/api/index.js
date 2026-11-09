// Vercel uses nazrul/src as this project's Root Directory, so its serverless
// entry must live here. The Express application remains in backend/server.js.
const app = require("../../backend/server");

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api(?=\/|\?|$)/, "") || "/";
  return app(req, res);
};
