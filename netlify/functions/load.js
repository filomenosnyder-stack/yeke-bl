const { getStore } = require("@netlify/blobs");

const ALLOWED = ["site", "suibi", "xiangfa", "tucao", "oc", "crossdress", "friends"];

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const file = q.file;
  if (!ALLOWED.includes(file)) {
    return { statusCode: 200, body: JSON.stringify({ ok: false }) };
  }
  const store = getStore({ name: "yeke-content" });
  const val = await store.get("data:" + file, { type: "text" });
  if (val === null) {
    return { statusCode: 200, body: JSON.stringify({ ok: false }) };
  }
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: val };
};
