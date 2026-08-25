const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const key = q.key || "";
  if (!key) return { statusCode: 404, body: "not found" };
  const store = getStore({ name: "yeke-content" });
  const val = await store.get(key, { type: "text" });
  if (!val) return { statusCode: 404, body: "not found" };
  const m = String(val).match(/^data:([^;]+);base64,(.+)$/s);
  if (!m) return { statusCode: 404, body: "bad data" };
  return {
    statusCode: 200,
    headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=31536000" },
    body: m[2],
    isBase64Encoded: true,
  };
};
