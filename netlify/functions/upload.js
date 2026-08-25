const { getStore } = require("@netlify/blobs");

const PASSWORD = "132457";

exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  if (body.password !== PASSWORD) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: "密码错误" }) };
  }
  const name = String(body.name || "photo.jpg").split(/[\\/]/).pop();
  if (!/\.(jpe?g|png|gif|webp)$/i.test(name)) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: "仅支持图片" }) };
  }
  const subdir = ["crossdress", "posts", "images"].includes(body.subdir) ? body.subdir : "images";
  const key = "img:" + subdir + ":" + Date.now() + "_" + name;
  const store = getStore({ name: "yeke-content" });
  await store.set(key, String(body.data || ""));
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, src: "/api/image?key=" + encodeURIComponent(key) }),
  };
};
