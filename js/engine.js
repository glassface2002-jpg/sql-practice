/* SQL engine: wraps sql.js (pure-JS SQLite build) and grades answers. */
(function () {
  let SQL = null;
  const ready = initSqlJs().then(function (mod) { SQL = mod; return mod; });

  function createDb(sqlList) {
    const db = new SQL.Database();
    for (const sql of sqlList) if (sql && sql.trim()) db.exec(sql);
    return db;
  }

  // Run user SQL. Returns { result: {columns, values} | null, changes, error }
  function run(db, sql) {
    try {
      const before = db.exec("SELECT total_changes()")[0].values[0][0];
      const results = db.exec(sql);
      const after = db.exec("SELECT total_changes()")[0].values[0][0];
      const last = results.length ? results[results.length - 1] : null;
      return { result: last, changes: after - before, error: null };
    } catch (e) {
      return { result: null, changes: 0, error: friendlyError(e.message) };
    }
  }

  function friendlyError(msg) {
    let hint = "";
    if (/no such table/i.test(msg)) hint = "Check the table name against the tables listed above the editor.";
    else if (/no such column/i.test(msg)) hint = "Check the column name. Text values need single quotes, like 'Drama'.";
    else if (/syntax error/i.test(msg)) hint = "Look for a missing comma, quote or keyword near the word SQLite mentions.";
    else if (/FOREIGN KEY/i.test(msg)) hint = "A foreign key blocked this change: the row it points to doesn't exist, or other rows still depend on it.";
    else if (/UNIQUE|PRIMARY KEY/i.test(msg)) hint = "That value already exists in a column that must be unique.";
    else if (/NOT NULL/i.test(msg)) hint = "A column that requires a value was left empty.";
    else if (/within a transaction/i.test(msg)) hint = "A transaction is already open. Run COMMIT or ROLLBACK first, or press Reset data.";
    else if (/incomplete input/i.test(msg)) hint = "The statement ends too early. Check for an unclosed quote or bracket.";
    return { message: msg, hint: hint };
  }

  function normCell(v) {
    if (v === null || v === undefined) return "∅NULL";
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e4) / 1e4);
    if (v instanceof Uint8Array) return "blob:" + v.length;
    // numeric strings and numbers should compare equal (e.g. '5' vs 5)
    if (/^-?\d+(\.\d+)?$/.test(v)) return normCell(Number(v));
    return String(v);
  }

  function rowsKey(result, ordered) {
    if (!result) return null;
    const rows = result.values.map(function (r) { return r.map(normCell).join("␟"); });
    if (!ordered) rows.sort();
    return result.columns.length + "|" + rows.join("␞");
  }

  function safeExec(db, sql) {
    try { const r = db.exec(sql); return r.length ? r[r.length - 1] : { columns: [], values: [] }; }
    catch (e) { return { error: e.message }; }
  }

  // Build the expected database for a task: setup + solutions of tasks [0..uptoInclusive]
  function expectedDb(lesson, uptoInclusive) {
    const parts = [lesson.setup || ""];
    for (let i = 0; i <= uptoInclusive; i++) {
      const t = lesson.tasks[i];
      if (t.after) parts.push(t.solution);
    }
    return createDb(parts);
  }

  /* Grade one task.
     task.solution: reference SQL
     task.ordered: compare row order
     task.after:   SQL run after the statement, for tasks that change data or schema */
  function grade(lesson, idx, liveDb, userRun) {
    const task = lesson.tasks[idx];
    if (userRun.error) return false;
    if (task.after) {
      const exp = expectedDb(lesson, idx);
      const want = safeExec(exp, task.after);
      exp.close();
      const got = safeExec(liveDb, task.after);
      if (want.error || got.error) return false;
      return rowsKey(want, !!task.ordered) === rowsKey(got, !!task.ordered);
    }
    if (!userRun.result) return false;
    const exp = expectedDb(lesson, idx - 1);
    const want = safeExec(exp, task.solution);
    exp.close();
    if (want.error) { console.warn("Solution error", lesson.id, idx, want.error); return false; }
    return rowsKey(want, !!task.ordered) === rowsKey(userRun.result, !!task.ordered);
  }

  function listTables(db) {
    const r = safeExec(db, "SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, rowid");
    return r.error ? [] : r.values.map(function (v) { return { name: v[0], type: v[1] }; });
  }

  window.SQLEngine = { ready: ready, createDb: createDb, run: run, grade: grade, listTables: listTables, safeExec: safeExec, expectedDb: expectedDb, rowsKey: rowsKey };
})();
