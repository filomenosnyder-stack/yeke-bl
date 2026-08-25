const { getStore } = require("@netlify/blobs");

const PASSWORD = "132457";
const ALLOWED = ["site", "suibi", "xiangfa", "tucao", "oc", "crossdress", "friends"];

exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  if (body.password !== PASSWORD) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: "密码错误" }) };
  }
  if (!ALLOWED.includes(body.file)) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: "不允许的文件" }) };
  }

  const blobsContext = process.env.NETLIFY_BLOBS_CONTEXT ? JSON.parse(process.env.NETLIFY_BLOBS_CONTEXT) : {};
  const store = getStore({
    name: "yeke-content",
    siteID: blobsContext.siteID,
    token: blobsContext.token
  });

  await store.set("data:" + body.file, JSON.stringify(body.data));
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
