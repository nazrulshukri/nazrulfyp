// Uploaded files (photos, videos, songs) kept in MongoDB GridFS, bucket "media".
// Vercel accepts request bodies up to 4.5 MB, so one upload is at most 4 MB.
const mongoose = require("mongoose");

const { GridFSBucket, ObjectId } = mongoose.mongo;
const MAX_UPLOAD = 4 * 1024 * 1024;
const bucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: "media" });
const files = () => mongoose.connection.db.collection("media.files");

/** Saves a Buffer and returns its id (string). */
async function saveBuffer(buffer, metadata) {
  const id = new ObjectId();
  await new Promise((resolve, reject) => {
    const up = bucket().openUploadStreamWithId(id, metadata.name || `file-${id}`, { metadata });
    up.once("finish", resolve).once("error", reject);
    up.end(buffer);
  });
  return String(id);
}

const findFile = (id) => (mongoose.isValidObjectId(id) ? files().findOne({ _id: new ObjectId(id) }) : null);

function removeFile(id) {
  if (!id || !mongoose.isValidObjectId(id)) return Promise.resolve();
  return bucket()
    .delete(new ObjectId(id))
    .catch(() => {});
}

/** Sends a stored file, honouring byte ranges (Safari and iPhone need them for video and audio). */
function sendFile(file, req, res, next, cacheControl = "private, max-age=86400") {
  const size = file.length;
  let start = 0;
  let end = size - 1;
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  res.set({
    "Accept-Ranges": "bytes",
    "Content-Type": (file.metadata && file.metadata.contentType) || "application/octet-stream",
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  });
  if (range && (range[1] || range[2])) {
    if (range[1] === "") start = Math.max(0, size - Number(range[2]));
    else {
      start = Number(range[1]);
      if (range[2]) end = Math.min(Number(range[2]), size - 1);
    }
    if (start > end || start >= size) {
      res.status(416).set("Content-Range", `bytes */${size}`);
      return res.end();
    }
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  res.set("Content-Length", String(end - start + 1));
  if (req.method === "HEAD") return res.end();
  return bucket()
    .openDownloadStream(file._id, { start, end: end + 1 })
    .on("error", next)
    .pipe(res);
}

module.exports = { MAX_UPLOAD, saveBuffer, findFile, removeFile, sendFile };
