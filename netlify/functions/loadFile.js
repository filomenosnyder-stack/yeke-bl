const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const file = event.queryStringParameters.name || event.queryStringParameters.file;
  
  const blobsContext = process.env.NETLIFY_BLOBS_CONTEXT ? JSON.parse(process.env.NETLIFY_BLOBS_CONTEXT) : {};
  const store = getStore({
    name: "yeke-content",
    siteID: blobsContext.siteID,
    token: blobsContext.token
  });

  const data = await store.get("data:" + file, { type: "json" });
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || null)
  };
};
