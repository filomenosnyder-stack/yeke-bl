const PASSWORD = "132457";

exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: body.password === PASSWORD }),
  };
};
