/* ==========================================================
   耶克站 · 友链板块（数据驱动，支持编辑模式添加/删除）
   ========================================================== */

function renderFriends() {
  const view = document.getElementById("view");

  (async () => {
    const data = (await loadJSON("friends")) || { items: [] };
    data.items = data.items || [];
    const edit = isEditMode();

    const grid = data.items.length
      ? data.items
          .map(
            (it) =>
              '<a class="friend-card" href="' + esc(it.url) + '" target="_blank" rel="noopener">' +
                (it.avatar
                  ? '<img src="' + esc(it.avatar) + '" alt="" />'
                  : '<div class="f-avatar">' + esc((it.name || "友").charAt(0)) + "</div>") +
                '<div style="flex:1">' +
                  '<div class="f-name">' + esc(it.name) + "</div>" +
                  (it.desc ? '<div class="f-desc">' + esc(it.desc) + "</div>" : "") +
                "</div>" +
                (edit
                  ? '<button class="btn sm danger" onclick="event.preventDefault();event.stopPropagation();delFriend(\'' + encodeURIComponent(it.id) + '\')">删除</button>'
                  : "") +
              "</a>"
          )
          .join("")
      : '<div class="empty-tip">还没有友链' + (edit ? "，点「添加友链」。" : "。") + "</div>";

    view.innerHTML =
      editBar() +
      '<header class="page-head"><h1>友链</h1></header>' +
      (edit
        ? '<div style="margin:20px 0"><button class="btn primary" onclick="showAddFriend()">＋ 添加友链</button></div>'
        : "") +
      '<div class="friend-grid">' + grid + "</div>";
  })();
}

function showAddFriend() {
  const view = document.getElementById("view");
  view.innerHTML =
    '<div class="editor">' +
      '<a class="back" href="javascript:renderFriends()">← 返回友链</a>' +
      '<label>名字</label><input id="f_name" />' +
      '<label>网址</label><input id="f_url" placeholder="https://..." />' +
      '<label>头像路径（图片放 assets/images/friends/ 后填 /assets/images/friends/xxx.jpg，也可填网址）</label>' +
      '<input id="f_avatar" />' +
      '<label>描述（可选）</label><input id="f_desc" />' +
      '<div class="editor-actions">' +
        '<button class="btn primary" onclick="addFriend()">保存</button>' +
        '<button class="btn" onclick="renderFriends()">取消</button>' +
      "</div>" +
    "</div>";
}

async function addFriend() {
  const name = document.getElementById("f_name").value.trim();
  const url = document.getElementById("f_url").value.trim();
  if (!name || !url) { alert("名字和网址不能为空"); return; }
  const data = (await loadJSON("friends")) || { items: [] };
  data.items = data.items || [];
  data.items.push({
    id: "f" + Date.now(),
    name: name,
    url: url,
    avatar: document.getElementById("f_avatar").value.trim(),
    desc: document.getElementById("f_desc").value.trim(),
  });
  const r = await saveData("friends", data);
  if (r && r.ok) renderFriends();
  else alert("保存失败：" + ((r && r.error) || "未知错误"));
}

async function delFriend(id) {
  if (!confirm("确定删除这条友链？")) return;
  const data = (await loadJSON("friends")) || { items: [] };
  data.items = (data.items || []).filter((x) => String(x.id) !== String(id));
  const r = await saveData("friends", data);
  if (r && r.ok) renderFriends();
  else alert("删除失败：" + ((r && r.error) || "未知错误"));
}
