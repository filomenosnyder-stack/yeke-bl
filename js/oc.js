/* ==========================================================
   耶克站 · OC 世界观：总览 / 系列详情 / 编辑模式管理
   依赖 main.js 的 loadJSON / saveData / esc / renderContent / editBar
   ========================================================== */

// 渲染章节正文：PDF 内嵌、Word 下载、md/文本用 marked 渲染
async function chapterBody(ch) {
  if (ch.file) {
    const lower = ch.file.toLowerCase();
    // PDF：网页内直接查看（保留原始排版）
    if (lower.endsWith(".pdf")) {
      return '<iframe src="' + esc(ch.file) + '" style="width:100%;height:620px;border:1px solid var(--border);border-radius:8px;background:#fff"></iframe>';
    }
    // Word：下载原件（用 Word/WPS 打开，排版原样）
    if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
      return '<div class="empty-tip" style="text-align:left">' +
        "<p>这是一份 Word 文档（保留原始排版）。点下方按钮下载，用 Word / WPS 打开查看。</p>" +
        '<p style="margin-top:12px"><a class="btn primary" href="' + esc(ch.file) + '" download>⬇ 下载查看原件</a></p>' +
        "</div>";
    }
    // 其他文本文件：尝试 marked 渲染
    try {
      const res = await fetch(ch.file);
      if (res.ok) {
        const text = await res.text();
        if (window.marked && text) return marked.parse(text);
        return renderContent(text);
      }
    } catch (e) { /* 忽略 */ }
  }
  if (window.marked && (ch.content || "")) {
    try { return marked.parse(ch.content); } catch (e) { /* 回退 */ }
  }
  return renderContent(ch.content || "");
}

function renderOC() {
  const view = document.getElementById("view");
  const params = qs();
  const seriesId = params.series;

  (async () => {
    const data = (await loadJSON("oc")) || { series: [] };
    data.series = data.series || [];
    const s = seriesId ? data.series.find((x) => x.id === seriesId) : null;
    const edit = isEditMode();

    // ---------- 系列详情 ----------
    if (s) {
      document.title = s.title + " · OC 世界观 · 耶克站";
      // 异步渲染章节（支持引用外部 md 文件）
      const chaptersHtml = [];
      const chList = s.chapters || [];
      for (let i = 0; i < chList.length; i++) {
        const ch = chList[i];
        const body = await chapterBody(ch);
        chaptersHtml.push(
          "<details class='chapter'>" +
            "<summary>" + esc(ch.title) + "</summary>" +
            '<div class="body">' + body + "</div>" +
            (edit
              ? '<div class="ch-ops">' +
                '<button class="btn sm" onclick="editChapter(' + i + ')">编辑</button>' +
                '<button class="btn sm danger" onclick="delChapter(' + i + ')">删除</button>' +
                "</div>"
              : "") +
          "</details>"
        );
      }

      view.innerHTML =
        editBar() +
        '<div class="oc-detail">' +
          '<a class="back" href="index.html">← 返回系列总览</a>' +
          '<div class="oc-head">' +
            (s.subtitle ? '<div class="st">' + esc(s.subtitle) + "</div>" : "") +
            "<h1>" + esc(s.title) + "</h1>" +
            (s.desc ? "<p>" + esc(s.desc) + "</p>" : "") +
            (edit
              ? '<div style="margin-top:12px;display:flex;gap:8px">' +
                '<button class="btn sm primary" onclick="addChapter()">＋ 添加章节</button>' +
                '<button class="btn sm" onclick="editSeriesInfo()">编辑系列信息</button>' +
                "</div>"
              : "") +
          "</div>" +
          '<div class="chapters">' + chaptersHtml.join("") + "</div>" +
        "</div>";
      return;
    }

    // ---------- 系列总览 ----------
    const cards = data.series
      .map(
        (x) =>
          '<div class="series-card">' +
            (x.subtitle ? '<div class="st">' + esc(x.subtitle) + "</div>" : "") +
            '<div class="t"><a href="?series=' + encodeURIComponent(x.id) + '">' + esc(x.title) + "</a></div>" +
            '<div class="d">' + esc(x.desc) + "</div>" +
            '<div style="margin-top:12px;display:flex;align-items:center;gap:8px">' +
              '<a class="more" href="?series=' + encodeURIComponent(x.id) + '">进入 →</a>' +
              (edit
                ? '<button class="btn sm danger" style="margin-left:auto" onclick="delSeries(\'' + encodeURIComponent(x.id) + '\')">删除</button>'
                : "") +
            "</div>" +
          "</div>"
      )
      .join("");

    view.innerHTML =
      editBar() +
      '<header class="page-head"><h1>OC 世界观</h1></header>' +
      (edit
        ? '<div style="margin:20px 0"><button class="btn primary" onclick="addSeries()">＋ 添加系列</button></div>'
        : "") +
      '<div class="series-grid">' +
        (cards || '<div class="empty-tip">还没有系列' + (edit ? "，点「添加系列」。" : "。") + "</div>") +
      "</div>";
  })();
}

/* ---------- 添加系列 ---------- */
function addSeries() {
  const view = document.getElementById("view");
  view.innerHTML =
    '<div class="editor">' +
      '<a class="back" href="javascript:renderOC()">← 返回</a>' +
      '<div class="row">' +
        '<div><label>系列 ID（英文，用于网址，如 lysia）</label><input id="s_id" placeholder="lysia" /></div>' +
        '<div><label>副标题</label><input id="s_sub" /></div>' +
      "</div>" +
      '<label>系列标题</label><input id="s_title" />' +
      '<label>简介</label><textarea id="s_desc" rows="3"></textarea>' +
      '<div class="editor-actions">' +
        '<button class="btn primary" onclick="saveNewSeries()">保存</button>' +
        '<button class="btn" onclick="renderOC()">取消</button>' +
      "</div>" +
    "</div>";
}

async function saveNewSeries() {
  const data = (await loadJSON("oc")) || { series: [] };
  data.series = data.series || [];
  data.series.push({
    id: document.getElementById("s_id").value.trim() || "s" + Date.now(),
    title: document.getElementById("s_title").value.trim(),
    subtitle: document.getElementById("s_sub").value.trim(),
    desc: document.getElementById("s_desc").value.trim(),
    cover: "",
    chapters: [],
  });
  const r = await saveData("oc", data);
  if (r && r.ok) renderOC();
  else alert("保存失败");
}

async function delSeries(id) {
  if (!confirm("确定删除这个系列？")) return;
  const data = (await loadJSON("oc")) || { series: [] };
  data.series = (data.series || []).filter((x) => String(x.id) !== String(id));
  const r = await saveData("oc", data);
  if (r && r.ok) renderOC();
  else alert("删除失败");
}

/* ---------- 编辑系列信息 ---------- */
function editSeriesInfo() {
  const view = document.getElementById("view");
  (async () => {
    const data = (await loadJSON("oc")) || { series: [] };
    const s = data.series.find((x) => x.id === qs().series);
    if (!s) return;
    view.innerHTML =
      '<div class="editor">' +
        '<a class="back" href="javascript:renderOC()">← 返回</a>' +
        '<div class="row">' +
          '<div><label>系列 ID（英文）</label><input id="s_id" value="' + esc(s.id) + '" /></div>' +
          '<div><label>副标题</label><input id="s_sub" value="' + esc(s.subtitle) + '" /></div>' +
        "</div>" +
        '<label>系列标题</label><input id="s_title" value="' + esc(s.title) + '" />' +
        '<label>简介</label><textarea id="s_desc" rows="3">' + esc(s.desc) + "</textarea>" +
        '<div class="editor-actions">' +
          '<button class="btn primary" onclick="saveSeriesInfo()">保存</button>' +
          '<button class="btn" onclick="renderOC()">取消</button>' +
        "</div>" +
      "</div>";
  })();
}

async function saveSeriesInfo() {
  const data = (await loadJSON("oc")) || { series: [] };
  const s = data.series.find((x) => x.id === qs().series);
  if (!s) return;
  s.id = document.getElementById("s_id").value.trim() || s.id;
  s.title = document.getElementById("s_title").value.trim();
  s.subtitle = document.getElementById("s_sub").value.trim();
  s.desc = document.getElementById("s_desc").value.trim();
  const r = await saveData("oc", data);
  if (r && r.ok) location.href = "?series=" + encodeURIComponent(s.id);
  else alert("保存失败");
}

/* ---------- 章节：添加 / 编辑 / 删除 ---------- */
function addChapter() {
  const view = document.getElementById("view");
  view.innerHTML =
    '<div class="editor">' +
      '<a class="back" href="javascript:renderOC()">← 返回</a>' +
      '<label>章节标题</label><input id="ch_title" />' +
      '<label>章节内容（换行分段，**加粗**）</label><textarea id="ch_content" rows="10"></textarea>' +
      '<div class="editor-actions">' +
        '<button class="btn primary" onclick="saveNewChapter()">保存</button>' +
        '<button class="btn" onclick="renderOC()">取消</button>' +
      "</div>" +
    "</div>";
}

async function saveNewChapter() {
  const data = (await loadJSON("oc")) || { series: [] };
  const s = data.series.find((x) => x.id === qs().series);
  if (!s) return;
  s.chapters = s.chapters || [];
  s.chapters.push({
    title: document.getElementById("ch_title").value.trim() || "未命名章节",
    content: document.getElementById("ch_content").value,
  });
  const r = await saveData("oc", data);
  if (r && r.ok) renderOC();
  else alert("保存失败");
}

function editChapter(i) {
  const view = document.getElementById("view");
  (async () => {
    const data = (await loadJSON("oc")) || { series: [] };
    const s = data.series.find((x) => x.id === qs().series);
    if (!s) return;
    const ch = s.chapters[i];
    view.innerHTML =
      '<div class="editor">' +
        '<a class="back" href="javascript:renderOC()">← 返回</a>' +
        '<label>章节标题</label><input id="ch_title" value="' + esc(ch.title) + '" />' +
        '<label>章节内容</label><textarea id="ch_content" rows="10">' + esc(ch.content) + "</textarea>" +
        '<div class="editor-actions">' +
          '<button class="btn primary" onclick="saveChapter(' + i + ')">保存</button>' +
          '<button class="btn" onclick="renderOC()">取消</button>' +
        "</div>" +
      "</div>";
  })();
}

async function saveChapter(i) {
  const data = (await loadJSON("oc")) || { series: [] };
  const s = data.series.find((x) => x.id === qs().series);
  if (!s) return;
  s.chapters[i] = {
    title: document.getElementById("ch_title").value.trim(),
    content: document.getElementById("ch_content").value,
  };
  const r = await saveData("oc", data);
  if (r && r.ok) renderOC();
  else alert("保存失败");
}

function delChapter(i) {
  if (!confirm("确定删除这个章节？")) return;
  (async () => {
    const data = (await loadJSON("oc")) || { series: [] };
    const s = data.series.find((x) => x.id === qs().series);
    if (!s) return;
    s.chapters.splice(i, 1);
    const r = await saveData("oc", data);
    if (r && r.ok) renderOC();
  })();
}
