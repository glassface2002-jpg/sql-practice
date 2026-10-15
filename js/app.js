/* App shell: routing, lesson rendering, progress. */
(function () {
  const E = window.SQLEngine;
  const LESSONS = window.LESSONS;
  const SECTIONS = { core: "Core lessons", topics: "Further topics" };
  const STORE_KEY = "sqlpractice.progress.v1";
  const DRAFT_KEY = "sqlpractice.drafts.v2";

  let progress = load(STORE_KEY);
  let drafts = load(DRAFT_KEY);
  let current = null;   // lesson object
  let liveDb = null;
  let activeTable = null;
  let hintLevel = 0;    // 0 = nothing shown, 1 = keyword hint, 2 = full solution

  /* ---------- hints ---------- */
  // Multi-word keywords, longest first so "LEFT JOIN" wins over "LEFT".
  const PHRASES = [
    "CREATE UNIQUE INDEX", "EXPLAIN QUERY PLAN", "FULL OUTER JOIN", "IS NOT NULL", "NOT BETWEEN", "NOT EXISTS",
    "CREATE TABLE", "CREATE VIEW", "CREATE INDEX", "ALTER TABLE", "DROP TABLE", "DROP VIEW", "DROP INDEX", "DROP COLUMN",
    "ADD COLUMN", "RENAME COLUMN", "RENAME TO", "INSERT INTO", "DELETE FROM", "IF EXISTS", "IF NOT EXISTS", "PRIMARY KEY",
    "NOT NULL", "IS NULL", "NOT IN", "NOT LIKE", "ORDER BY", "GROUP BY", "PARTITION BY", "LEFT JOIN", "RIGHT JOIN",
    "INNER JOIN", "UNION ALL", "WITH RECURSIVE", "ON DELETE"
  ].map(function (p) { return p.split(" "); }).sort(function (a, b) { return b.length - a.length; });
  const KEYWORDS = new Set(("SELECT DISTINCT FROM WHERE AND OR NOT IN BETWEEN LIKE IS NULL ASC DESC LIMIT OFFSET JOIN ON AS " +
    "HAVING VALUES UPDATE SET DEFAULT INTEGER TEXT REAL UNION INTERSECT EXCEPT REFERENCES CHECK CASE WHEN THEN ELSE END " +
    "EXISTS BEGIN COMMIT ROLLBACK WITH OVER CASCADE UNIQUE").split(" "));
  const FUNCTIONS = new Set(("COUNT SUM AVG MIN MAX ROUND ABS COALESCE IFNULL UPPER LOWER LENGTH SUBSTR INSTR REPLACE TRIM " +
    "DATE TIME STRFTIME JULIANDAY CAST RANK DENSE_RANK ROW_NUMBER LAG LEAD").split(" "));
  const OPERATORS = new Set(["<", ">", "<=", ">=", "=", "!=", "<>", "||", "%", "+", "-", "/"]);

  // Lists the keywords, functions and operators a solution uses, without any table, column or value names.
  function hintFor(sql) {
    const clean = sql.replace(/'(?:[^']|'')*'/g, " 'text' ").replace(/--.*$/gm, "");
    const tokens = clean.match(/'text'|[A-Za-z_][A-Za-z0-9_]*|<=|>=|!=|<>|\|\||[<>=%+\-\/*(]|\d+(?:\.\d+)?/g) || [];
    const out = [];
    const add = function (k) { if (out.indexOf(k) === -1) out.push(k); };
    for (let i = 0; i < tokens.length; i++) {
      const up = tokens[i].toUpperCase();
      const phrase = PHRASES.find(function (p) {
        return p.every(function (w, j) { return (tokens[i + j] || "").toUpperCase() === w; });
      });
      if (phrase) { add(phrase.join(" ")); i += phrase.length - 1; continue; }
      if (FUNCTIONS.has(up) && tokens[i + 1] === "(") add(up + "()");
      else if (KEYWORDS.has(up)) add(up);
      else if (OPERATORS.has(up)) add(up);
      else if (up === "*" && tokens[i - 1] && /^(SELECT|DISTINCT)$/i.test(tokens[i - 1])) add("* (all columns)");
      else if (up === "*") add("*");
    }
    return out;
  }

  function load(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }

  const $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function doneCount(lesson) { return Math.min(progress[lesson.id] || 0, lesson.tasks.length); }
  function isComplete(lesson) { return doneCount(lesson) >= lesson.tasks.length; }

  /* ---------- sidebar ---------- */
  function renderNav() {
    const nav = $("nav");
    let html = "";
    let coreNum = 0;
    for (const key of Object.keys(SECTIONS)) {
      html += '<p class="nav-head">' + SECTIONS[key] + "</p><ol class=\"nav-list\">";
      for (const l of LESSONS.filter(function (x) { return x.section === key; })) {
        const label = key === "core" ? String(coreNum++).padStart(2, "0") : "+";
        const state = isComplete(l) ? "done" : doneCount(l) > 0 ? "partial" : "";
        html += '<li><a href="#' + l.id + '" class="nav-link ' + state + (current && current.id === l.id ? " active" : "") + '">' +
          '<span class="nav-num">' + label + "</span><span class=\"nav-title\">" + esc(l.short || l.title) + "</span>" +
          '<span class="nav-state" aria-label="' + (state === "done" ? "complete" : "") + '"></span></a></li>';
      }
      html += "</ol>";
    }
    nav.innerHTML = html;
    const total = LESSONS.reduce(function (a, l) { return a + l.tasks.length; }, 0);
    const done = LESSONS.reduce(function (a, l) { return a + doneCount(l); }, 0);
    $("meter-fill").style.width = (total ? (done / total) * 100 : 0) + "%";
    $("meter-text").textContent = done + " / " + total + " tasks";
  }

  /* ---------- lesson ---------- */
  function buildLiveDb(lesson) {
    if (liveDb) liveDb.close();
    const parts = [lesson.setup || ""];
    for (let i = 0; i < doneCount(lesson); i++) if (lesson.tasks[i].after) parts.push(lesson.tasks[i].solution);
    liveDb = E.createDb(parts);
  }

  function openLesson(id) {
    const lesson = LESSONS.find(function (l) { return l.id === id; }) || LESSONS[0];
    current = lesson;
    activeTable = null;
    buildLiveDb(lesson);
    const idx = LESSONS.indexOf(lesson);
    const coreIdx = LESSONS.filter(function (l) { return l.section === "core"; }).indexOf(lesson);
    $("eyebrow").textContent = lesson.section === "core" ? (coreIdx === 0 ? "Start here" : "Lesson " + coreIdx) : "Further topic";
    $("lesson-title").textContent = lesson.title;
    $("lesson-body").innerHTML = lesson.body;
    hintLevel = 0;
    $("editor").value = drafts[lesson.id] || "";
    $("output").innerHTML = '<p class="muted">Results appear here. Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run.</p>';
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    $("prev").hidden = !prev;
    if (prev) { $("prev").href = "#" + prev.id; $("prev-title").textContent = prev.short || prev.title; }
    $("next").hidden = !next;
    if (next) { $("next").href = "#" + next.id; $("next-title").textContent = next.short || next.title; }
    renderTables();
    renderTasks();
    renderNav();
    document.title = lesson.title + " · SQL Practice Lab";
    window.scrollTo(0, 0);
    $("main").focus({ preventScroll: true });
  }

  function renderTables() {
    const tables = E.listTables(liveDb);
    if (!tables.some(function (t) { return t.name === activeTable; })) activeTable = tables.length ? tables[0].name : null;
    const tabs = $("table-tabs");
    tabs.innerHTML = tables.length ? tables.map(function (t) {
      return '<button type="button" role="tab" class="tab' + (t.name === activeTable ? " on" : "") + '" aria-selected="' + (t.name === activeTable) + '" data-table="' + esc(t.name) + '">' +
        esc(t.name) + (t.type === "view" ? ' <span class="tag">view</span>' : "") + "</button>";
    }).join("") : '<span class="muted">No tables yet. You will create them in this lesson.</span>';
    const view = $("table-view");
    if (!activeTable) { view.innerHTML = ""; return; }
    const r = E.safeExec(liveDb, 'SELECT * FROM "' + activeTable.replace(/"/g, '""') + '" LIMIT 200');
    view.innerHTML = r.error ? '<p class="muted">' + esc(r.error) + "</p>" : resultTable(r);
  }

  function resultTable(r) {
    if (!r.columns.length) return '<p class="muted">Empty table.</p>';
    let h = '<div class="grid-wrap"><table class="grid"><thead><tr>';
    for (const c of r.columns) h += "<th>" + esc(c) + "</th>";
    h += "</tr></thead><tbody>";
    if (!r.values.length) h += '<tr><td colspan="' + r.columns.length + '" class="muted">No rows</td></tr>';
    for (const row of r.values) {
      h += "<tr>";
      for (const v of row) {
        if (v === null) h += '<td class="null">NULL</td>';
        else if (typeof v === "number") h += '<td class="num">' + (Number.isInteger(v) ? v : Math.round(v * 1e4) / 1e4) + "</td>";
        else h += "<td>" + esc(v) + "</td>";
      }
      h += "</tr>";
    }
    return h + "</tbody></table></div>";
  }

  function renderTasks() {
    const lesson = current;
    const done = doneCount(lesson);
    const list = $("tasks");
    list.innerHTML = lesson.tasks.map(function (t, i) {
      const state = i < done ? "done" : i === done ? "now" : "later";
      let h = '<li class="task ' + state + '"><span class="task-mark" aria-hidden="true"></span><div class="task-text"><p>' + t.text + "</p>";
      if (state === "now") {
        h += '<div class="stuck">';
        if (hintLevel === 0) {
          h += '<button type="button" class="link-btn" data-hint="1">Stuck? Show a hint</button>';
        } else {
          h += '<p class="hint-label">You’ll need these keywords, in this order:</p><p class="chips">' +
            hintFor(t.solution).map(function (k) { return '<code class="chip">' + esc(k) + "</code>"; }).join("") + "</p>";
          if (hintLevel === 1) {
            h += '<button type="button" class="link-btn" data-hint="2">Still stuck? Show the full solution</button>';
          } else {
            h += '<p class="hint-label">Full solution:</p><pre class="code"><code>' + esc(t.solution) +
              '</code></pre><button type="button" class="link-btn" data-use="' + i + '">Put this in the editor</button>';
          }
        }
        h += "</div>";
      }
      return h + "</div></li>";
    }).join("");
    const complete = done >= lesson.tasks.length;
    $("task-count").textContent = done + " of " + lesson.tasks.length + " done";
    $("complete").hidden = !complete;
    $("next").classList.toggle("ready", complete);
  }

  /* ---------- running ---------- */
  function runQuery() {
    const sql = $("editor").value;
    drafts[current.id] = sql; save(DRAFT_KEY, drafts);
    const fb = $("feedback");
    if (!sql.trim()) { fb.textContent = "Type a query first."; fb.className = "feedback warn"; return; }
    const r = E.run(liveDb, sql);
    const out = $("output");
    if (r.error) {
      out.innerHTML = '<div class="error"><p class="error-title">SQLite error</p><p><code>' + esc(r.error.message) + "</code></p>" +
        (r.error.hint ? "<p>" + esc(r.error.hint) + "</p>" : "") + "</div>";
    } else if (r.result) {
      out.innerHTML = '<p class="rowcount">' + r.result.values.length + " row" + (r.result.values.length === 1 ? "" : "s") + "</p>" + resultTable(r.result);
    } else {
      out.innerHTML = '<p class="ok-line">Statement ran. ' + r.changes + " row" + (r.changes === 1 ? "" : "s") + " changed.</p>";
    }
    renderTables();

    const lesson = current;
    let done = doneCount(lesson);
    if (r.error || done >= lesson.tasks.length) {
      fb.textContent = r.error ? "" : done >= lesson.tasks.length ? "Lesson complete. Keep experimenting if you like." : "";
      fb.className = "feedback";
      return;
    }
    const before = done;
    while (done < lesson.tasks.length && E.grade(lesson, done, liveDb, r)) {
      done++;
      if (done < lesson.tasks.length && !lesson.tasks[done].after) break;
    }
    if (done > before) {
      progress[lesson.id] = done; save(STORE_KEY, progress);
      // start the next task from a blank editor
      hintLevel = 0;
      $("editor").value = "";
      delete drafts[lesson.id]; save(DRAFT_KEY, drafts);
      fb.textContent = done >= lesson.tasks.length ? "All tasks done. On to the next lesson." : "Task " + (before + 1) + " done. Next task is highlighted.";
      fb.className = "feedback good";
      renderTasks(); renderNav();
    } else {
      fb.textContent = mismatchHint(lesson, done, r);
      fb.className = "feedback warn";
    }
  }

  function mismatchHint(lesson, idx, r) {
    const t = lesson.tasks[idx];
    if (t.after) return "That ran, but the data doesn't match task " + (idx + 1) + " yet. Use Reset data if earlier changes went wrong.";
    if (!r.result) return "Task " + (idx + 1) + " needs a query that returns rows.";
    try {
      const exp = E.expectedDb(lesson, idx - 1);
      const want = E.safeExec(exp, t.solution); exp.close();
      if (want.error) return "Not a match yet.";
      if (want.columns.length !== r.result.columns.length) return "Not quite. Task " + (idx + 1) + " expects " + want.columns.length + " column" + (want.columns.length === 1 ? "" : "s") + "; you returned " + r.result.columns.length + ".";
      if (want.values.length !== r.result.values.length) return "Not quite. Task " + (idx + 1) + " expects " + want.values.length + " row" + (want.values.length === 1 ? "" : "s") + "; you returned " + r.result.values.length + ".";
      if (t.ordered && E.rowsKey(want, false) === E.rowsKey(r.result, false)) return "Right rows, wrong order. Check your ORDER BY.";
      return "Same shape, but some values differ. Check your conditions and the column order.";
    } catch (e) { return "Not a match yet."; }
  }

  /* ---------- events ---------- */
  function bind() {
    $("run").addEventListener("click", runQuery);
    $("editor").addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runQuery(); }
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        const el = e.target, s = el.selectionStart;
        el.setRangeText("  ", s, el.selectionEnd, "end");
      }
    });
    $("editor").addEventListener("input", function () { drafts[current.id] = $("editor").value; save(DRAFT_KEY, drafts); });
    $("reset-data").addEventListener("click", function () {
      buildLiveDb(current); renderTables();
      $("output").innerHTML = '<p class="muted">Data restored to where your completed tasks left it.</p>';
      $("feedback").textContent = ""; $("feedback").className = "feedback";
    });
    $("restart").addEventListener("click", function () {
      progress[current.id] = 0; save(STORE_KEY, progress);
      delete drafts[current.id]; save(DRAFT_KEY, drafts);
      openLesson(current.id);
    });
    $("table-tabs").addEventListener("click", function (e) {
      const b = e.target.closest("[data-table]"); if (!b) return;
      activeTable = b.dataset.table; renderTables();
    });
    $("tasks").addEventListener("click", function (e) {
      const h = e.target.closest("[data-hint]");
      if (h) { hintLevel = +h.dataset.hint; renderTasks(); return; }
      const b = e.target.closest("[data-use]"); if (!b) return;
      $("editor").value = current.tasks[+b.dataset.use].solution; $("editor").focus();
    });
    // Progress code: completed-task counts per lesson, as base64 JSON, for moving between computers.
    $("code-copy").addEventListener("click", function () {
      const box = $("code-box");
      box.value = "SQLLAB:" + btoa(JSON.stringify(progress));
      const shown = function () { box.focus(); box.select(); $("code-status").textContent = "Code is in the box below. Press Ctrl + C to copy it."; };
      try {
        navigator.clipboard.writeText(box.value).then(function () { $("code-status").textContent = "Copied. Paste it into a text file to carry it with you."; }, shown);
      } catch (e) { shown(); }
    });
    $("code-load").addEventListener("click", function () {
      let incoming;
      try {
        const raw = $("code-box").value.trim().replace(/^SQLLAB:/, "");
        incoming = JSON.parse(atob(raw));
        if (!incoming || typeof incoming !== "object") throw new Error();
      } catch (e) {
        $("code-status").textContent = "That code isn't valid. Copy the whole code, including SQLLAB: at the start.";
        return;
      }
      // keep whichever is further along, so loading never loses progress
      let lessons = 0;
      for (const l of LESSONS) {
        const n = parseInt(incoming[l.id], 10);
        if (n > 0) { progress[l.id] = Math.max(progress[l.id] || 0, Math.min(n, l.tasks.length)); lessons++; }
      }
      save(STORE_KEY, progress);
      $("code-box").value = "";
      $("code-status").textContent = "Progress loaded for " + lessons + " lesson" + (lessons === 1 ? "" : "s") + ".";
      buildLiveDb(current); renderTables(); renderTasks(); renderNav();
    });
    $("wipe").addEventListener("click", function () { $("wipe-confirm").hidden = false; });
    $("wipe-no").addEventListener("click", function () { $("wipe-confirm").hidden = true; });
    $("wipe-yes").addEventListener("click", function () {
      progress = {}; drafts = {}; save(STORE_KEY, progress); save(DRAFT_KEY, drafts);
      $("wipe-confirm").hidden = true; openLesson(current.id);
    });
    $("menu").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    $("nav").addEventListener("click", function (e) { if (e.target.closest("a")) document.body.classList.remove("nav-open"); });
    window.addEventListener("hashchange", function () { openLesson(location.hash.slice(1)); });
  }

  E.ready.then(function () {
    bind();
    $("loading").hidden = true;
    $("app").hidden = false;
    openLesson(location.hash.slice(1) || LESSONS[0].id);
  }).catch(function (e) {
    $("loading").textContent = "Couldn't load the SQL engine. Check your internet connection and reload. (" + e.message + ")";
  });
})();
