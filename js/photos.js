/* ==========================================================
   耶克站 · 照片墙 + 灯箱 + 编辑模式上传/删除
   依赖 main.js 的 loadJSON / saveData / esc / editBar / uploadImage
   ========================================================== */

function renderPhotos() {
  const view = document.getElementById("view");

  (async () => {
    const data = (await loadJSON("crossdress")) || { items: [] };
    data.items = data.items || [];
    const items = data.items;
    const edit = isEditMode();

    const grid = items.length
      ? items
          .map(
            (it) =>
              '<div class="ph">' +
                '<img src="' + esc(it.src) + '" alt="' + esc(it.title || "") + '" loading="lazy" onclick="openLB(this)" />' +
                '<div class="cap">' +
                  (it.title ? esc(it.title) : "照片") +
                  (edit
                    ? '<button class="btn sm danger" style="float:right" onclick="delPhoto(\'' + encodeURIComponent(it.id) + '\')">删除</button>'
                    : "") +
                "</div>" +
              "</div>"
          )
          .join("")
      : '<div class="empty-tip">还没有照片' + (edit ? "，点「添加照片」。" : "。") + "</div>";

    view.innerHTML =
      editBar() +
      '<header class="page-head"><h1>汉族男性堕落女装照</h1></header>' +
      (edit
        ? '<div style="margin:20px 0"><button class="btn primary" onclick="showAddPhoto()">＋ 添加照片</button></div>'
        : "") +
      '<div class="photo-grid">' + grid + "</div>" +
      '<div class="lightbox" id="lb" onclick="closeLB()"><img id="lbImg" alt="" /></div>';
  })();
}

// 添加照片：直接选文件上传
function showAddPhoto() {
  const view = document.getElementById("view");
  view.innerHTML =
    '<div class="editor">' +
      '<a class="back" href="javascript:renderPhotos()">← 返回照片墙</a>' +
      '<label>选择照片（从电脑里直接选）</label>' +
      '<input type="file" id="p_file" accept="image/*" />' +
      '<label>标题（可选）</label><input id="p_title" />' +
      '<div class="editor-actions">' +
        '<button class="btn primary" onclick="addPhoto()">上传并保存</button>' +
        '<button class="btn" onclick="renderPhotos()">取消</button>' +
      "</div>" +
    "</div>";
}

async function addPhoto() {
  const f = document.getElementById("p_file").files[0];
  if (!f) { alert("请先选择一张照片"); return; }
  const up = await uploadImage(f, "crossdress");
  if (!up || !up.ok) { alert("上传失败：" + ((up && up.error) || "")); return; }

  const data = (await loadJSON("crossdress")) || { items: [] };
  data.items = data.items || [];
  data.items.push({
    id: "p" + Date.now(),
    title: document.getElementById("p_title").value.trim(),
    src: up.src,
  });
  const r = await saveData("crossdress", data);
  if (r && r.ok) renderPhotos();
  else alert("保存失败：" + ((r && r.error) || "未知错误"));
}

async function delPhoto(id) {
  if (!confirm("确定删除这张照片？")) return;
  const data = (await loadJSON("crossdress")) || { items: [] };
  data.items = (data.items || []).filter((x) => String(x.id) !== String(id));
  const r = await saveData("crossdress", data);
  if (r && r.ok) renderPhotos();
  else alert("删除失败：" + ((r && r.error) || "未知错误"));
}

// 灯箱
function openLB(el) {
  const lb = document.getElementById("lb");
  document.getElementById("lbImg").src = el.src;
  lb.classList.add("open");
}
function closeLB() {
  document.getElementById("lb").classList.remove("open");
}
