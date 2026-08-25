/* ==========================================================
   耶克站 · 文字板块：列表 / 详情 / 编辑模式添加·编辑·删除 / 配图
   依赖 main.js 的 loadJSON / saveData / esc / renderContent / editBar
   ========================================================== */

function renderList(section, title, desc) {
  const view = document.getElementById("view");
  const params = qs();
  const q = params.id;

  (async () => {
    const data = (await loadJSON(section)) || { items: [] };
    data.items = data.items || [];
    const items = data.items;
    const item = q ? items.find((it) => String(it.id) === String(q)) : null;
    const edit = isEditMode();

    // ---------- 详情视图 ----------
    if (item) {
      document.title = item.title + " · 耶克站";
      view.innerHTML =
        editBar() +
        '<a class="back" href="javascript:history.back()">← 返回列表</a>' +
        '<article class="detail">' +
          "<h1>" + esc(item.title) + "</h1>" +
          '<div class="meta">' + esc(item.date || "") +
            (item.category ? " · " + esc(item.category) : "") + "</div>" +
          '<div class="content">' + renderContent(item.content) + "</div>" +
          (edit
            ? '<div class="editor-actions" style="margin-top:20px;border-top:1px solid var(--border);padding-top:14px">' +
              '<button class="btn" onclick="showEditor(\'' + section + '\',\'' + encodeURIComponent(item.id) + '\')">编辑</button>' +
              '<button class="btn danger" onclick="delItem(\'' + section + '\',\'' + encodeURIComponent(item.id) + '\')">删除</button>' +
              "</div>"
            : "") +
        "</article>";
      return;
    }

    // ---------- 列表视图 ----------
    const rows = items
      .slice()
      .reverse()
      .map(
        (it) =>
          '<div class="post-item">' +
            '<span class="date">' + esc(it.date) + "</span>" +
            '<a class="title" href="?id=' + encodeURIComponent(it.id) + '">' + esc(it.title) + "</a>" +
            (it.category ? '<span class="cat">' + esc(it.category) + "</span>" : "") +
            (edit
              ? '<span class="ops">' +
                '<button class="btn sm" onclick="showEditor(\'' + section + '\',\'' + encodeURIComponent(it.id) + '\')">编辑</button>' +
                '<button class="btn sm danger" onclick="delItem(\'' + section + '\',\'' + encodeURIComponent(it.id) + '\')">删除</button>' +
                "</span>"
              : "") +
          "</div>"
      )
      .join("");

    view.innerHTML =
      editBar() +
      '<header class="page-head"><h1>' + esc(title) + "</h1>" +
        (desc ? "<p>" + esc(desc) + "</p>" : "") + "</header>" +
      (edit
        ? '<div style="margin:20px 0"><button class="btn primary" onclick="showEditor(\'' + section + '\', null)">＋ 写新文章</button></div>'
        : "") +
      '<div class="post-list">' +
        (rows || '<div class="empty-tip">还没有内容' + (edit ? "，点「写新文章」加一篇。" : "。") + "</div>") +
      "</div>";
  })();
}

// ---------- 编辑器（添加 / 编辑共用，可上传图片） ----------
function showEditor(section, id) {
  const view = document.getElementById("view");
  (async () => {
    const data = (await loadJSON(section)) || { items: [] };
    data.items = data.items || [];
    const it = id
      ? data.items.find((x) => String(x.id) === String(id))
      : { id: "", title: "", date: "", category: "", content: "" };

    view.innerHTML =
      '<div class="editor">' +
        '<a class="back" href="javascript:renderList(SECTION, TITLE, DESC)">← 返回列表</a>' +
        '<label>标题</label><input id="fe_title" value="' + esc(it.title) + '" />' +
        '<div class="row">' +
          '<div><label>日期</label><input id="fe_date" value="' + esc(it.date) + '" /></div>' +
          '<div><label>分类</label><input id="fe_cat" value="' + esc(it.category) + '" /></div>' +
        "</div>" +
        '<div style="margin:10px 0">' +
          '<button class="btn sm" onclick="document.getElementById(\'fe_img\').click()">上传图片</button>' +
          '<input type="file" id="fe_img" accept="image/*" style="display:none" onchange="onImgPick(this)" />' +
          '<span class="hint" style="margin-left:8px">选图片后自动插到正文，可多张</span>' +
        "</div>" +
        '<label>正文（换行分段，**加粗**）</label>' +
        '<textarea id="fe_content" rows="12">' + esc(it.content) + "</textarea>" +
        '<div class="editor-actions">' +
          '<button class="btn primary" onclick="saveItem(\'' + section + '\',\'' + encodeURIComponent(it.id || "new") + '\')">保存</button>' +
          '<button class="btn" onclick="renderList(SECTION, TITLE, DESC)">取消</button>' +
        "</div>" +
      "</div>";
  })();
}

async function onImgPick(input) {
  const f = input.files[0];
  if (!f) return;
  const r = await uploadImage(f, "posts");
  if (r && r.ok) {
    const ta = document.getElementById("fe_content");
    const alt = f.name.replace(/[\[\]()\s]+/g, "") || "图片";
    ta.value += (ta.value ? "\n\n" : "") + "![" + alt + "](" + r.src + ")";
  } else {
    alert("图片上传失败：" + ((r && r.error) || ""));
  }
  input.value = "";
}

async function saveItem(section, id) {
  const title = document.getElementById("fe_title").value.trim();
  if (!title) { alert("标题不能为空"); return; }
  const today = new Date().toISOString().slice(0, 10);

  const data = (await loadJSON(section)) || { items: [] };
  data.items = data.items || [];
  const item = {
    id: id && id !== "new" ? id : "id" + Date.now(),
    title: title,
    date: document.getElementById("fe_date").value.trim() || today,
    category: document.getElementById("fe_cat").value.trim(),
    content: document.getElementById("fe_content").value,
  };

  if (id && id !== "new") {
    const idx = data.items.findIndex((x) => String(x.id) === String(id));
    if (idx >= 0) data.items[idx] = item;
  } else {
    data.items.push(item);
  }

  const r = await saveData(section, data);
  if (r && r.ok) renderList(SECTION, TITLE, DESC);
  else alert("保存失败：" + ((r && r.error) || "未知错误"));
}

async function delItem(section, id) {
  if (!confirm("确定删除这条？")) return;
  const data = (await loadJSON(section)) || { items: [] };
  data.items = (data.items || []).filter((x) => String(x.id) !== String(id));
  const r = await saveData(section, data);
  if (r && r.ok) renderList(SECTION, TITLE, DESC);
  else alert("删除失败：" + ((r && r.error) || "未知错误"));
}
