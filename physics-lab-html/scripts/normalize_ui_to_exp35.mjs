#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();

const groups = {
  p2: [
    4, 5, 6, 7, 8, 9, 10, 11,
    13, 14,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33
  ].map(id => `初中物理实验${id}.html`),
  p1: [1, 2, 3, 15, 34].map(id => `初中物理实验${id}.html`),
  p12: ["初中物理实验12-1.html", "初中物理实验12-2.html"]
};

const targetGroup = process.argv.includes("--p2")
  ? "p2"
  : (process.argv.includes("--p1") ? "p1" : (process.argv.includes("--p12") ? "p12" : null));
const files = targetGroup
  ? groups[targetGroup]
  : process.argv.slice(2).filter(arg => !arg.startsWith("--"));

if (!files.length) {
  console.error("Usage: node physics-lab-html/scripts/normalize_ui_to_exp35.mjs --p2");
  process.exit(2);
}

const styleBlock = String.raw`

/* exp35-ui-normalize: shared shell compatibility */
.hint-lamp{
  position:absolute;
  left:10px;
  top:56px;
  z-index:42;
  width:34px;
  height:34px;
  border-radius:8px;
  display:grid;
  place-items:center;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.2);
  color:#ffd54f;
  font-size:16px;
  cursor:pointer;
  padding:0;
}
.hint-lamp.flash{ animation:lampFlash35 .6s ease; }
@keyframes lampFlash35{
  0%,100%{ box-shadow:none; }
  50%{ box-shadow:0 0 22px rgba(255,77,79,.86); border-color:#ff4d4f; color:#ffb0b0; }
}
.hint-pop{
  position:absolute;
  left:10px;
  top:96px;
  z-index:43;
  width:min(330px, calc(100% - 24px));
  display:none;
  padding:10px 12px;
  border:1px solid rgba(255,209,102,.36);
  border-radius:10px;
  background:rgba(16,18,20,.9);
  color:#f4efe2;
  font-size:13px;
  line-height:1.55;
}
.hint-pop.open{ display:block; }
.drawer{
  border:1px solid var(--line, rgba(255,255,255,.12));
  background:var(--panel-bg, rgba(15,15,15,.58));
  backdrop-filter:blur(6px);
  touch-action:none;
}
.drawer-header{ cursor:grab; user-select:none; -webkit-user-select:none; touch-action:none; }
.drawer-header:active{ cursor:grabbing; }
.drawer-title{ display:flex; align-items:center; gap:6px; }
.drawer-actions{ display:flex; align-items:center; gap:6px; }
.drawer-body{ max-height:360px; overflow:auto; -webkit-overflow-scrolling:touch; }
.chartWrap.exp35-record-chart{
  height:180px;
  margin-top:10px;
  border:1px solid rgba(255,255,255,.12);
  border-radius:8px;
  overflow:hidden;
  background:rgba(0,0,0,.18);
}
#recordChart{ width:100%; height:100%; display:block; }
.explanation h2{ color:#9bd3ff; }
.modal h3{ color:#fff; }
@media (max-width:720px){
  .hint-lamp{ top:56px; }
  .hint-pop{ top:96px; }
  .drawer-body{ max-height:260px; }
}
`;

const runtimeBlock = String.raw`
<script id="exp35-ui-normalize-runtime">
(function(){
  "use strict";
  var $ = function(selector){ return document.querySelector(selector); };
  var hintLamp = $("#hintLamp");
  var hintPop = $("#hintPop");
  var taskHint = $("#taskHint");
  var taskText = $("#taskText");
  var dataDock = $("#dataDock");
  var dataNotice = $("#dataNotice");
  var recordBody = $("#recordBody");
  var recordChart = $("#recordChart");
  var modalTitle = $("#doneMask .modal h3");

  try {
    if (typeof state !== "undefined") window.state = state;
  } catch (_) {}

  if (modalTitle && !/实验完成/.test(modalTitle.textContent || "")) {
    modalTitle.textContent = "实验完成";
  }

  function updateHintText(){
    if (!hintPop) return;
    var hint = taskHint ? taskHint.textContent.trim() : "";
    var text = taskText ? taskText.textContent.trim() : "";
    hintPop.textContent = hint || text || "按步骤操作器材，观察现象并记录数据。";
  }

  if (hintLamp && hintPop && !hintLamp.dataset.exp35Bound) {
    hintLamp.dataset.exp35Bound = "1";
    updateHintText();
    hintLamp.addEventListener("click", function(){
      updateHintText();
      hintPop.classList.toggle("open");
    });
  }

  function drawRecordChart(){
    if (!recordChart) return;
    var ctx = recordChart.getContext("2d");
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = recordChart.clientWidth || 320;
    var h = recordChart.clientHeight || 180;
    var nextW = Math.max(1, Math.round(w * dpr));
    var nextH = Math.max(1, Math.round(h * dpr));
    if (recordChart.width !== nextW || recordChart.height !== nextH) {
      recordChart.width = nextW;
      recordChart.height = nextH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(155,211,255,.22)";
    ctx.lineWidth = 1;
    for (var x = 24; x < w; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 14); ctx.lineTo(x, h - 18); ctx.stroke();
    }
    for (var y = 28; y < h - 8; y += 30) {
      ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(w - 12, y); ctx.stroke();
    }
    var rows = recordBody ? Array.from(recordBody.querySelectorAll("tr")).filter(function(row){
      return row.querySelectorAll("td").length > 1 && !/当前无记录|暂无|还没有记录/.test(row.textContent);
    }) : [];
    ctx.font = "700 13px Arial";
    ctx.fillStyle = "#cfe4ff";
    ctx.fillText("记录概览", 16, 24);
    if (!rows.length) {
      ctx.font = "12px Arial";
      ctx.fillStyle = "rgba(235,245,255,.64)";
      ctx.fillText("完成步骤后，这里显示记录进度。", 16, 52);
      return;
    }
    var max = Math.max(3, rows.length);
    rows.slice(0, 8).forEach(function(row, index){
      var barW = (w - 96) * ((index + 1) / max);
      var y = 46 + index * 20;
      ctx.fillStyle = ["#ffd54f", "#3ddc97", "#5bbcff", "#ef476f"][index % 4];
      ctx.fillRect(72, y - 10, barW, 9);
      ctx.fillStyle = "rgba(235,245,255,.86)";
      ctx.font = "12px Arial";
      ctx.fillText("记录 " + (index + 1), 16, y);
    });
  }

  if (recordBody && recordChart && !recordChart.dataset.exp35Bound) {
    recordChart.dataset.exp35Bound = "1";
    new MutationObserver(drawRecordChart).observe(recordBody, { childList:true, subtree:true, characterData:true });
    window.addEventListener("resize", drawRecordChart);
    setTimeout(drawRecordChart, 60);
  }

  if (dataDock && dataNotice && !dataDock.dataset.exp35NoticeBound) {
    dataDock.dataset.exp35NoticeBound = "1";
    var clearNotice = function(){
      dataNotice.textContent = "0";
      dataNotice.classList.remove("show");
      dataNotice.classList.add("hidden");
    };
    dataDock.addEventListener("click", function(evt){
      if (evt.target && evt.target.id === "dataToggleBtn") setTimeout(clearNotice, 20);
    });
  }
})();
</script>
`;

const completionFitBlock = String.raw`
<script id="exp35-ui-completion-drawer-fit">
(function(){
  "use strict";
  var $ = function(selector){ return document.querySelector(selector); };
  var stage = $("#stage");
  var controlDock = $("#controlDock");
  var dataDock = $("#dataDock");
  var controlBody = $("#controlBody");
  var dataBody = $("#dataBody");
  var controlToggle = $("#controlToggleBtn");
  var dataToggle = $("#dataToggleBtn");
  var doneMask = $("#doneMask");

  function isDone(){
    var modalDone = doneMask && getComputedStyle(doneMask).display !== "none";
    var stateDone = false;
    try { stateDone = !!window.state && !!window.state.completed; } catch (_) {}
    return modalDone || stateDone;
  }

  function setPanelCollapsed(dock, body, toggle, collapsed){
    if (dock) dock.classList.toggle("collapsed", collapsed);
    if (body) body.classList.toggle("collapsed", collapsed);
    if (toggle) toggle.textContent = collapsed ? "展开" : "收起";
  }

  function placeDock(dock, left, top){
    if (!dock || !stage) return;
    var sw = stage.clientWidth;
    var sh = stage.clientHeight;
    var w = dock.offsetWidth || 160;
    var h = dock.offsetHeight || 44;
    var x = Math.max(10, Math.min(left, sw - w - 10));
    var y = Math.max(10, Math.min(top, sh - h - 10));
    dock.style.left = x + "px";
    dock.style.top = y + "px";
    dock.style.right = "auto";
  }

  function fitCompletionDrawers(){
    if (!stage || !controlDock || !dataDock) return;
    if (!isDone()) {
      var dataOpen = dataBody && !dataBody.classList.contains("collapsed");
      var controlOpen = controlBody && !controlBody.classList.contains("collapsed");
      if (stage.clientWidth <= 760 && dataOpen && controlOpen) {
        setPanelCollapsed(controlDock, controlBody, controlToggle, true);
        var narrowW = stage.clientWidth;
        placeDock(controlDock, narrowW - (controlDock.offsetWidth || 160) - 10, 10);
        placeDock(dataDock, narrowW - (dataDock.offsetWidth || 260) - 10, 10 + (controlDock.offsetHeight || 44) + 10);
      }
      return;
    }
    setPanelCollapsed(controlDock, controlBody, controlToggle, true);
    setPanelCollapsed(dataDock, dataBody, dataToggle, false);
    var sw = stage.clientWidth;
    var controlW = controlDock.offsetWidth || 160;
    var dataW = dataDock.offsetWidth || 260;
    var controlX = sw - controlW - 10;
    var dataX = sw - dataW - 10;
    placeDock(controlDock, controlX, 10);
    placeDock(dataDock, dataX, 10 + (controlDock.offsetHeight || 44) + 10);
  }

  if (!stage || !controlDock || !dataDock) return;
  window.addEventListener("resize", function(){ requestAnimationFrame(fitCompletionDrawers); });
  setInterval(fitCompletionDrawers, 450);
})();
</script>
`;

function addStyle(html) {
  if (html.includes("exp35-ui-normalize: shared shell compatibility")) return html;
  return html.replace("</style>", `${styleBlock}\n  </style>`);
}

function addRuntime(html) {
  if (html.includes('id="exp35-ui-normalize-runtime"')) return html;
  return html.replace("</body>", `${runtimeBlock}\n</body>`);
}

function addCompletionFit(html) {
  if (html.includes('id="exp35-ui-completion-drawer-fit"')) return html;
  return html.replace("</body>", `${completionFitBlock}\n</body>`);
}

function normalizeClasses(html) {
  html = html.replace(/class="panelHead([^"]*)"\s+id="controlHead"/g, (m, rest) => {
    const classes = new Set(("panelHead" + rest + " drawer-header").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="controlHead" data-drag-handle`;
  });
  html = html.replace(/class="resultsHead([^"]*)"\s+id="dataHead"/g, (m, rest) => {
    const classes = new Set(("resultsHead" + rest + " drawer-header").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="dataHead" data-drag-handle`;
  });
  html = html.replace(/class="dock-head([^"]*)"\s+id="controlHead"/g, (m, rest) => {
    const classes = new Set(("dock-head" + rest + " drawer-header").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="controlHead" data-drag-handle`;
  });
  html = html.replace(/class="dock-head([^"]*)"\s+id="dataHead"/g, (m, rest) => {
    const classes = new Set(("dock-head" + rest + " drawer-header").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="dataHead" data-drag-handle`;
  });
  html = html.replace(/class="dock([^"]*)"\s+id="controlDock"/g, (m, rest) => {
    const classes = new Set(("dock" + rest + " drawer control").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="controlDock"`;
  });
  html = html.replace(/class="dock([^"]*)"\s+id="dataDock"/g, (m, rest) => {
    const classes = new Set(("dock" + rest + " drawer data").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="dataDock"`;
  });
  html = html.replace(/class="dockHead([^"]*)"\s+id="controlHead"/g, (m, rest) => {
    const classes = new Set(("dockHead" + rest + " drawer-header").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="controlHead" data-drag-handle`;
  });
  html = html.replace(/class="dockHead([^"]*)"\s+id="dataHead"/g, (m, rest) => {
    const classes = new Set(("dockHead" + rest + " drawer-header").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}" id="dataHead" data-drag-handle`;
  });
  html = html.replace(/class="dockTitle([^"]*)"/g, (m, rest) => {
    const classes = new Set(("dockTitle" + rest + " drawer-title").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  html = html.replace(/class="dock-title([^"]*)"/g, (m, rest) => {
    const classes = new Set(("dock-title" + rest + " drawer-title").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  html = html.replace(/class="dockBtns([^"]*)"/g, (m, rest) => {
    const classes = new Set(("dockBtns" + rest + " drawer-actions").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  html = html.replace(/class="record-tools([^"]*)"/g, (m, rest) => {
    const classes = new Set(("record-tools" + rest + " drawer-actions").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  html = html.replace(/class="dockBody([^"]*)"/g, (m, rest) => {
    const classes = new Set(("dockBody" + rest + " drawer-body").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  html = html.replace(/class="panelBody([^"]*)"/g, (m, rest) => {
    const classes = new Set(("panelBody" + rest + " drawer-body").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  html = html.replace(/class="resultsBody([^"]*)"/g, (m, rest) => {
    const classes = new Set(("resultsBody" + rest + " drawer-body").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  html = html.replace(/class="dock-body([^"]*)"/g, (m, rest) => {
    const classes = new Set(("dock-body" + rest + " drawer-body").split(/\s+/).filter(Boolean));
    return `class="${Array.from(classes).join(" ")}"`;
  });
  return html;
}

function normalizeLegacyAliases(file, html) {
  html = html.replace(/<(div|section) class="task-card">/, '<$1 class="task-card" id="taskCard">');
  if (file === "初中物理实验1.html") {
    html = html.replace(/#labArea/g, "#stage");
    html = html.replace(/id="labArea"/g, 'id="stage"');
    html = html.replace(/id="tbody"/g, 'id="recordBody"');
    html = html.replace(/#tbody/g, "#recordBody");
  }
  if (file === "初中物理实验2.html") {
    html = html.replace(/#canvas/g, "#stage");
    html = html.replace(/id="canvas"/g, 'id="stage"');
    html = html.replace(/getElementById\('canvas'\)/g, "getElementById('stage')");
  }
  if (file === "初中物理实验3.html") {
    html = html
      .replace(/panelDock/g, "controlDock")
      .replace(/panelHead/g, "controlHead")
      .replace(/panelBody/g, "controlBody")
      .replace(/panelToggleBtn/g, "controlToggleBtn");
  }
  if (file === "初中物理实验34.html") {
    html = html.replace(/<section class="task-card">/, '<section class="task-card" id="taskCard">');
    html = html.replace(/id="labWrap"/g, 'id="stage"');
    html = html.replace(/#labWrap/g, "#stage");
    html = html.replace(/id="hintLampBtn"/g, 'id="hintLamp"');
    html = html.replace(/#hintLampBtn/g, "#hintLamp");
    if (!/id=["']hintPop["']/.test(html)) {
      html = html.replace(/<div class="hint-pop">/, '<div class="hint-pop" id="hintPop">');
    }
  }
  if (file === "初中物理实验12-1.html" || file === "初中物理实验12-2.html") {
    html = html.replace(/(<div id="controlDock"[\s\S]*?<div class="dock-body[^"]*")(\s*>)/, '$1 id="controlBody"$2');
    html = html.replace(/(<div id="dataDock"[\s\S]*?<div class="dock-body[^"]*")(\s*>)/, '$1 id="dataBody"$2');
    html = html.replace(/<button class="toggle" data-toggle="controlDock">/, '<button class="toggle" id="controlToggleBtn" data-toggle="controlDock">');
    html = html.replace(/<button class="toggle" data-toggle="dataDock">/, '<button class="toggle" id="dataToggleBtn" data-toggle="dataDock">');
    html = html.replace(/byId\('hintLampBtn'\)/g, "byId('hintLamp')");
    html = html.replace(/id="hintDetailBox"/g, 'id="hintPop"');
  }
  return html;
}

function addHintLamp(html) {
  if (/id=["']hintLamp["']/.test(html)) {
    if (!/id=["']hintPop["']/.test(html)) {
      html = html.replace(/<div class="hint-pop">/, '<div class="hint-pop" id="hintPop">');
    }
    return html;
  }
  if (/id=["']hintLampBtn["']/.test(html)) {
    html = html.replace(/id="hintLampBtn"/g, 'id="hintLamp"');
    html = html.replace(/#hintLampBtn/g, "#hintLamp");
    if (!/id=["']hintPop["']/.test(html)) {
      html = html.replace(/<div class="hint-pop">/, '<div class="hint-pop" id="hintPop">');
    }
    return html;
  }
  const insert = `
    <button class="hint-lamp" id="hintLamp" type="button" aria-label="查看提示">💡</button>
    <div class="hint-pop" id="hintPop"></div>
`;
  return html.replace(/(<div class="hud"[\s\S]*?<\/div>\s*)/, `$1${insert}`);
}

function addRecordChart(html) {
  if (/id=["']recordChart["']/.test(html)) return html;
  const chart = `
        <div class="chartWrap exp35-record-chart"><canvas id="recordChart"></canvas></div>
`;
  const dataBodyMatch = html.match(/(<div class="dockBody[^"]*drawer-body[^"]*" id="dataBody"[\s\S]*?)(<\/div>\s*<\/div>\s*(?:<div class="demoCursor|<div class="checkmark|<\/div>\s*<div class="toolbar"))/);
  if (dataBodyMatch) {
    return html.replace(dataBodyMatch[0], `${dataBodyMatch[1]}${chart}      ${dataBodyMatch[2]}`);
  }
  return html.replace(/(<tbody id="recordBody"[\s\S]*?<\/tbody>\s*<\/table>)/, `$1${chart}`);
}

function normalizeModalTitle(html) {
  return html.replace(/(<div class="modal"[\s\S]*?<h3(?:\s+id="doneTitle")?>)([\s\S]*?)(<\/h3>)/, "$1实验完成$3");
}

function normalizeFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.warn(`skip missing ${file}`);
    return false;
  }
  let html = fs.readFileSync(full, "utf8");
  const before = html;
  html = normalizeLegacyAliases(file, html);
  html = normalizeClasses(html);
  html = addHintLamp(html);
  html = addRecordChart(html);
  html = normalizeModalTitle(html);
  html = addStyle(html);
  html = addRuntime(html);
  html = addCompletionFit(html);
  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    console.log(`normalized ${file}`);
    return true;
  }
  console.log(`unchanged ${file}`);
  return false;
}

let changed = 0;
for (const file of files) {
  if (normalizeFile(file)) changed += 1;
}
console.log(`done changed=${changed}/${files.length}`);
