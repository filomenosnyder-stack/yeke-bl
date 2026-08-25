/* ==========================================================
   耶克站 · 公共脚本
   ========================================================== */

// 加载 JSON 数据（支持同源静态文件，file:// 下会失败，返回 null）
async function loadJSON(file) {
  // 优先读取在线编辑的数据（Cloudflare 部署时），失败则回退到静态文件
  try {
    const r = await fetch("/api/load?file=" + encodeURIComponent(file), { cache: "no-store" });
    if (r.ok) {
      const data = await r.json();
      if (data && data.ok === false) throw new Error("no api data");
      return data;
    }
  } catch (e) { /* 回退到静态 */ }
  try {
    const res = await fetch(`/data/${file}.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}
window.loadJSON = loadJSON;

// 解析 URL query
function qs() {
  const out = {};
  const s = location.search.replace(/^\?/, "");
  if (!s) return out;
  s.split("&").forEach((kv) => {
    const [k, v] = kv.split("=");
    out[decodeURIComponent(k)] = decodeURIComponent(v || "");
  });
  return out;
}
window.qs = qs;

// 转义 HTML
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
window.esc = esc;

// 高亮当前导航
(function () {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === page) a.classList.add("active");
  });
})();

// 页脚年份
document.querySelectorAll(".year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// 内容文本 → HTML（保留换行、空行分段；支持 **加粗**）
function renderContent(text) {
  if (!text) return "";
  const t = esc(text);
  const withImg = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0" />');
  const withBold = withImg.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return withBold.split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
}
window.renderContent = renderContent;

// 格式化日期（用于显示）
function fmtDate(d) {
  return d || "";
}
window.fmtDate = fmtDate;

// 保存数据（前端直接操作内容用）
const FRONT_PASSWORD = "132457";
async function saveData(file, data) {
  const res = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: FRONT_PASSWORD, file, data }),
  });
  return res.json();
}
window.saveData = saveData;

// ---- 编辑模式（添加 / 删除需要密码）----
const EDIT_PASSWORD = "132457";
function isEditMode() {
  return sessionStorage.getItem("yeke_edit") === "1";
}
function enterEditMode() {
  const p = prompt("请输入管理密码");
  if (p === EDIT_PASSWORD) {
    sessionStorage.setItem("yeke_edit", "1");
    location.reload();
  } else {
    alert("密码错误");
  }
}
function exitEditMode() {
  sessionStorage.removeItem("yeke_edit");
  location.reload();
}
function editBar() {
  const on = isEditMode();
  return (
    '<div class="editbar">' +
    (on
      ? '<span>🔓 编辑模式已开启</span><button class="btn sm" onclick="exitEditMode()">退出编辑</button>'
      : '<span>改内容需要密码</span><button class="btn sm" onclick="enterEditMode()">🔒 进入编辑模式</button>') +
    "</div>"
  );
}
window.isEditMode = isEditMode;
window.enterEditMode = enterEditMode;
window.exitEditMode = exitEditMode;
window.editBar = editBar;

// 上传图片：选择文件 → 保存到 /assets/images/<subdir>/ → 返回路径
async function uploadImage(file, subdir) {
  const b64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: FRONT_PASSWORD, name: file.name, subdir: subdir, data: b64 }),
  });
  return res.json();
}
window.uploadImage = uploadImage;
