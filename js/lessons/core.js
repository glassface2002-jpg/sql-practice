/* Core lessons. All text and exercises are original. */
window.LESSONS = window.LESSONS || [];
window.Q = function (s) {
  return '<pre class="code"><code>' + String(s).trim().replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }) + "</code></pre>";
};

LESSONS.push({
  id: "intro", section: "core", title: "What SQL is, and how this lab works", short: "Introduction",
  setup: DATA.films, starter: "SELECT * FROM films;",
  body: `
<p>SQL (Structured Query Language) is how you ask a relational database for data and how you change that data. Nearly every app you use keeps its records in tables like the ones in this lab, and SQL is the common language for working with them.</p>
<h2>Tables, rows and columns</h2>
<p>A <strong>table</strong> stores one kind of thing: films, customers or orders. Each <strong>row</strong> is one of those things, and each <strong>column</strong> is one fact about it, such as a title or a release year. Every column has a type, so <code>year</code> holds numbers and <code>title</code> holds text.</p>
<p>The <code>films</code> table below belongs to Lantern Pictures, a made-up studio. You'll use it, and a few other small datasets, throughout the course.</p>
<h2>How each lesson works</h2>
<ul>
<li>Read the explanation, then scroll to <strong>Practice</strong>.</li>
<li>The <strong>Tables</strong> panel always shows the current contents of every table, so you can check your work.</li>
<li>Write SQL in the editor and press <strong>Run query</strong> or <kbd>Ctrl</kbd> + <kbd>Enter</kbd>.</li>
<li>The highlighted task ticks off when your result matches. Row order only matters when a task asks for sorting.</li>
<li>If you get stuck, open <em>Show the solution</em> under the current task.</li>
</ul>
<p>Everything runs in your browser on a real SQLite database, so you can't break anything. <strong>Reset data</strong> puts the tables back.</p>
<div class="note"><p>The editor starts empty in every lesson. Type the query from the first task yourself, then run it.</p></div>`,
  tasks: [
    { text: "Run <code>SELECT * FROM films;</code> to see every row and column of the films table.", solution: "SELECT * FROM films;" }
  ]
});

LESSONS.push({
  id: "select-basics", section: "core", title: "SELECT: choosing columns", short: "SELECT basics",
  setup: DATA.films, starter: "SELECT title FROM films;",
  body: `
<p>Every query that reads data starts with <code>SELECT</code>. You name the columns you want, then say which table they come from with <code>FROM</code>.</p>
${Q(`SELECT column_a, column_b
FROM table_name;`)}
<p>The result is a new, temporary table. It has the columns you listed, in the order you listed them, and one row for each row in the source table.</p>
<h3>Every column at once</h3>
<p>The asterisk <code>*</code> means "all columns". It's handy for exploring, but in real code it's better to name the columns you need. The query stays readable and won't change shape if someone adds a column later.</p>
${Q(`SELECT * FROM films;`)}
<h3>Style notes</h3>
<p>SQL keywords aren't case-sensitive, so <code>select</code> works as well as <code>SELECT</code>. Writing keywords in capitals is a common habit because it makes queries easier to scan. Line breaks and extra spaces don't matter, and the closing semicolon marks where a statement ends.</p>`,
  tasks: [
    { text: "Find the <code>title</code> of every film.", solution: "SELECT title FROM films;" },
    { text: "Find the <code>director</code> of every film.", solution: "SELECT director FROM films;" },
    { text: "Find the <code>title</code> and <code>year</code> of every film.", solution: "SELECT title, year FROM films;" },
    { text: "Show the <code>genre</code> first, then the <code>title</code>, for every film.", solution: "SELECT genre, title FROM films;" },
    { text: "Show every column of every film.", solution: "SELECT * FROM films;" }
  ]
});

LESSONS.push({
  id: "where-numbers", section: "core", title: "Filtering rows with WHERE (numbers)", short: "WHERE: numbers",
  setup: DATA.films, starter: "SELECT title, year\nFROM films\nWHERE year > 2015;",
  body: `
<p>Usually you don't want every row. A <code>WHERE</code> clause keeps only the rows where its condition is true.</p>
${Q(`SELECT columns
FROM table_name
WHERE condition;`)}
<h2>Comparison operators for numbers</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
<tr><td><code>=</code></td><td>equal to</td><td><code>year = 2012</code></td></tr>
<tr><td><code>!=</code> or <code>&lt;&gt;</code></td><td>not equal to</td><td><code>year != 2012</code></td></tr>
<tr><td><code>&lt;</code> <code>&lt;=</code> <code>&gt;</code> <code>&gt;=</code></td><td>less / greater than</td><td><code>runtime_min &gt;= 100</code></td></tr>
<tr><td><code>BETWEEN a AND b</code></td><td>inside a range, ends included</td><td><code>year BETWEEN 2010 AND 2015</code></td></tr>
<tr><td><code>NOT BETWEEN a AND b</code></td><td>outside a range</td><td><code>year NOT BETWEEN 2010 AND 2015</code></td></tr>
<tr><td><code>IN (…)</code></td><td>matches any value in a list</td><td><code>id IN (1, 4, 9)</code></td></tr>
<tr><td><code>NOT IN (…)</code></td><td>matches none of them</td><td><code>id NOT IN (1, 4, 9)</code></td></tr>
</table></div>
<h2>Combining conditions</h2>
<p>Join conditions with <code>AND</code> (both must be true) or <code>OR</code> (either one). When you mix the two, use parentheses so the logic is clear.</p>
${Q(`SELECT title FROM films
WHERE year >= 2010 AND runtime_min < 100;`)}`,
  tasks: [
    { text: "Show every column for the film with <code>id</code> 9.", solution: "SELECT * FROM films WHERE id = 9;" },
    { text: "Find the <code>title</code> and <code>year</code> of films released from 2010 to 2015, both years included.", solution: "SELECT title, year FROM films WHERE year BETWEEN 2010 AND 2015;" },
    { text: "Find the <code>title</code> of films released before 2008.", solution: "SELECT title FROM films WHERE year < 2008;" },
    { text: "Find the <code>title</code> and <code>runtime_min</code> of films longer than two hours.", solution: "SELECT title, runtime_min FROM films WHERE runtime_min > 120;" },
    { text: "Show every column for the films with ids 2, 5 and 11.", solution: "SELECT * FROM films WHERE id IN (2, 5, 11);" }
  ]
});

LESSONS.push({
  id: "where-text", section: "core", title: "Filtering rows with WHERE (text)", short: "WHERE: text",
  setup: DATA.cities, starter: "SELECT name, country\nFROM cities\nWHERE continent = 'Europe';",
  body: `
<p>Text comparisons work much like number comparisons, with one rule to remember: <strong>text values go in single quotes</strong>. Without quotes, SQL reads <code>Europe</code> as a column name and returns an error.</p>
<p>This lesson uses a <code>cities</code> table of large world cities. Population and area figures are rounded.</p>
<h2>Operators for text</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
<tr><td><code>=</code></td><td>exact match</td><td><code>country = 'Japan'</code></td></tr>
<tr><td><code>!=</code></td><td>anything except</td><td><code>continent != 'Asia'</code></td></tr>
<tr><td><code>LIKE</code></td><td>pattern match</td><td><code>name LIKE 'B%'</code></td></tr>
<tr><td><code>NOT LIKE</code></td><td>doesn't match the pattern</td><td><code>name NOT LIKE '%o%'</code></td></tr>
<tr><td><code>IN (…)</code></td><td>one of a list</td><td><code>country IN ('Peru', 'Chile')</code></td></tr>
</table></div>
<h2>Wildcards in LIKE</h2>
<p><code>%</code> matches any run of characters, including none. <code>_</code> matches exactly one character.</p>
${Q(`-- names ending in "o"
SELECT name FROM cities WHERE name LIKE '%o';

-- four-letter names
SELECT name FROM cities WHERE name LIKE '____';`)}
<div class="note"><p>In SQLite, <code>LIKE</code> ignores case for English letters, so <code>'lima'</code> matches <code>Lima</code>. <code>=</code> is case-sensitive. Other databases differ here, so check yours.</p></div>
<p>Lines starting with <code>--</code> are comments. SQL ignores them.</p>`,
  tasks: [
    { text: "Find the <code>name</code> of every city in Africa.", solution: "SELECT name FROM cities WHERE continent = 'Africa';" },
    { text: "Find the <code>name</code> and <code>continent</code> of every city outside Europe.", solution: "SELECT name, continent FROM cities WHERE continent != 'Europe';" },
    { text: "Find the <code>name</code> of every city whose name starts with <code>L</code>.", solution: "SELECT name FROM cities WHERE name LIKE 'L%';" },
    { text: "Find the <code>name</code> and <code>country</code> of cities in Spain, Peru or Kenya.", solution: "SELECT name, country FROM cities WHERE country IN ('Spain', 'Peru', 'Kenya');" },
    { text: "Find the <code>name</code> of every city whose name contains a space.", solution: "SELECT name FROM cities WHERE name LIKE '% %';" }
  ]
});

LESSONS.push({
  id: "sorting", section: "core", title: "Sorting and limiting results", short: "ORDER BY & LIMIT",
  setup: DATA.films, starter: "SELECT title, year\nFROM films\nORDER BY year DESC;",
  body: `
<p>Unless you ask for an order, a database can return rows in any order it likes. Four clauses control which rows you get back and how they're arranged.</p>
<h2>DISTINCT</h2>
<p><code>SELECT DISTINCT</code> removes duplicate rows from the result. It compares whole rows, so with two columns, a row is a duplicate only when both values repeat.</p>
${Q(`SELECT DISTINCT genre FROM films;`)}
<h2>ORDER BY</h2>
<p>Sorts the result by one or more columns. <code>ASC</code> (ascending) is the default, and <code>DESC</code> reverses it. Text sorts alphabetically. If the first column has a tie, the next column decides.</p>
${Q(`SELECT title, genre, year
FROM films
ORDER BY genre ASC, year DESC;`)}
<h2>LIMIT and OFFSET</h2>
<p><code>LIMIT n</code> keeps the first <em>n</em> rows. <code>OFFSET m</code> skips <em>m</em> rows first. Together they let you show results a page at a time.</p>
${Q(`-- rows 11 to 20 of a sorted list
SELECT title FROM films
ORDER BY title
LIMIT 10 OFFSET 10;`)}
<p>Always pair <code>LIMIT</code> with <code>ORDER BY</code>. Without a sort, "the first five" can change from one run to the next.</p>`,
  tasks: [
    { text: "List each <code>director</code> once, in alphabetical order.", solution: "SELECT DISTINCT director FROM films ORDER BY director;", ordered: true },
    { text: "Find the <code>title</code> and <code>year</code> of the three newest films, newest first.", solution: "SELECT title, year FROM films ORDER BY year DESC LIMIT 3;", ordered: true },
    { text: "List the first five film <code>title</code>s in alphabetical order.", solution: "SELECT title FROM films ORDER BY title LIMIT 5;", ordered: true },
    { text: "List the next five <code>title</code>s in alphabetical order (titles 6 to 10).", solution: "SELECT title FROM films ORDER BY title LIMIT 5 OFFSET 5;", ordered: true },
    { text: "Show the <code>title</code> and <code>runtime_min</code> of every Drama, shortest first.", solution: "SELECT title, runtime_min FROM films WHERE genre = 'Drama' ORDER BY runtime_min;", ordered: true }
  ]
});

LESSONS.push({
  id: "review-select", section: "core", title: "Review: simple SELECT queries", short: "Review: SELECT",
  setup: DATA.cities, starter: "SELECT * FROM cities;",
  body: `
<p>You now know the parts of a basic query. Written in full, a query looks like this:</p>
${Q(`SELECT DISTINCT column, another_column
FROM table_name
WHERE condition AND/OR another_condition
ORDER BY column ASC/DESC
LIMIT n OFFSET m;`)}
<p>Only <code>SELECT</code> and <code>FROM</code> are required, but the clauses that you do use must appear in this order.</p>
<p>The tasks below use the <code>cities</code> table and combine everything from the last four lessons. If a task feels big, build it up one clause at a time and run the query after each step.</p>`,
  tasks: [
    { text: "List the <code>name</code> and <code>population</code> of every city in North America, largest population first.", solution: "SELECT name, population FROM cities WHERE continent = 'North America' ORDER BY population DESC;", ordered: true },
    { text: "Find the <code>name</code> and <code>population</code> of the three most populous cities that are in Asia or Africa, largest first.", solution: "SELECT name, population FROM cities WHERE continent IN ('Asia', 'Africa') ORDER BY population DESC LIMIT 3;", ordered: true },
    { text: "Find the <code>name</code> of every city in the Southern Hemisphere (latitude below 0).", solution: "SELECT name FROM cities WHERE latitude < 0;" },
    { text: "List each <code>continent</code> once, alphabetically.", solution: "SELECT DISTINCT continent FROM cities ORDER BY continent;", ordered: true },
    { text: "Find the <code>name</code> of the second and third most populous cities in Europe, in that order.", solution: "SELECT name FROM cities WHERE continent = 'Europe' ORDER BY population DESC LIMIT 2 OFFSET 1;", ordered: true }
  ]
});

LESSONS.push({
  id: "joins", section: "core", title: "Combining tables with INNER JOIN", short: "INNER JOIN",
  setup: DATA.films + DATA.boxOffice, starter: "SELECT *\nFROM films\nJOIN box_office ON films.id = box_office.film_id;",
  body: `
<p>Real databases spread data over several tables so that each fact is stored only once. This is called <strong>normalization</strong>. Here, <code>films</code> holds facts about each film and <code>box_office</code> holds its reviews and earnings. The two tables connect through <code>box_office.film_id</code>, which stores a film's <code>id</code>.</p>
<h2>INNER JOIN</h2>
<p>A join matches rows from two tables using a condition you write after <code>ON</code>. An <code>INNER JOIN</code>, or just <code>JOIN</code>, keeps only the rows that found a match on both sides.</p>
${Q(`SELECT films.title, box_office.critic_score
FROM films
INNER JOIN box_office
  ON films.id = box_office.film_id
WHERE box_office.critic_score > 8;`)}
<h3>Table aliases</h3>
<p>Writing <code>table.column</code> makes it clear where each column comes from, and it's required when both tables have a column with the same name. Short aliases save typing:</p>
${Q(`SELECT f.title, b.domestic_gross
FROM films AS f
JOIN box_office AS b ON f.id = b.film_id;`)}
<p>Compare the two tables: <em>Paper Kites</em> has no row in <code>box_office</code>, so an inner join leaves it out. The next lesson shows how to keep it.</p>`,
  tasks: [
    { text: "Show each film's <code>title</code> with its <code>domestic_gross</code> and <code>international_gross</code>.", solution: "SELECT title, domestic_gross, international_gross FROM films JOIN box_office ON films.id = box_office.film_id;" },
    { text: "Find the <code>title</code> of films that earned more internationally than domestically.", solution: "SELECT title FROM films JOIN box_office ON films.id = box_office.film_id WHERE international_gross > domestic_gross;" },
    { text: "List each film's <code>title</code> and <code>critic_score</code>, highest score first.", solution: "SELECT title, critic_score FROM films JOIN box_office ON films.id = box_office.film_id ORDER BY critic_score DESC;", ordered: true },
    { text: "Find the <code>title</code> and <code>critic_score</code> of every Sci-Fi film.", solution: "SELECT title, critic_score FROM films JOIN box_office ON films.id = box_office.film_id WHERE genre = 'Sci-Fi';" }
  ]
});

LESSONS.push({
  id: "outer-joins", section: "core", title: "Keeping unmatched rows with OUTER JOINs", short: "OUTER JOINs",
  setup: DATA.company, starter: "SELECT d.name, e.name\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.id;",
  body: `
<p>A small company's data lives in three tables: <code>departments</code>, <code>employees</code> and <code>projects</code>. The data has gaps. Research has no staff yet, one contractor belongs to no department, and one project has no lead.</p>
<p>An inner join silently drops rows like these. An <strong>outer join</strong> keeps them and fills the missing side with <code>NULL</code>.</p>
<div class="ref-wrap"><table class="ref">
<tr><th>Join</th><th>Keeps</th></tr>
<tr><td><code>LEFT JOIN</code></td><td>every row from the left (first) table, matched or not</td></tr>
<tr><td><code>RIGHT JOIN</code></td><td>every row from the right (second) table</td></tr>
<tr><td><code>FULL OUTER JOIN</code></td><td>every row from both tables</td></tr>
</table></div>
${Q(`SELECT d.name AS department, e.name AS employee
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id;`)}
<p>A <code>RIGHT JOIN</code> is a <code>LEFT JOIN</code> with the tables swapped, so many people only ever write LEFT joins. You can also read the result in the other direction: rows where the right side is <code>NULL</code> are the ones with no match. That's useful for finding gaps.</p>
<div class="note"><p><code>AS</code> renames a column in the result. You'll use it a lot from now on.</p></div>`,
  tasks: [
    { text: "List every department <code>name</code> with the <code>name</code> of each employee in it. Include departments with no employees.", solution: "SELECT d.name, e.name FROM departments d LEFT JOIN employees e ON e.department_id = d.id;" },
    { text: "List every employee <code>name</code> with their department <code>name</code>. Include employees with no department.", solution: "SELECT e.name, d.name FROM employees e LEFT JOIN departments d ON e.department_id = d.id;" },
    { text: "List every project <code>name</code> with the <code>name</code> of its lead. Include projects with no lead.", solution: "SELECT p.name, e.name FROM projects p LEFT JOIN employees e ON p.lead_id = e.id;" },
    { text: "Use a <code>FULL OUTER JOIN</code> to list every employee name and every department name together, matched where possible (employee name first).", solution: "SELECT e.name, d.name FROM employees e FULL OUTER JOIN departments d ON e.department_id = d.id;" }
  ]
});

LESSONS.push({
  id: "nulls", section: "core", title: "Working with NULL", short: "NULLs",
  setup: DATA.company, starter: "SELECT name, department_id\nFROM employees\nWHERE department_id IS NULL;",
  body: `
<p><code>NULL</code> means "no value" or "unknown". It isn't zero and it isn't an empty string. Because it's unknown, comparing anything to it gives an unknown result, which <code>WHERE</code> treats as false.</p>
${Q(`-- returns nothing, even for rows where floor is NULL
SELECT * FROM departments WHERE floor = NULL;

-- the correct way
SELECT * FROM departments WHERE floor IS NULL;`)}
<h2>Tools for NULLs</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Expression</th><th>Use</th></tr>
<tr><td><code>IS NULL</code> / <code>IS NOT NULL</code></td><td>test whether a value is missing</td></tr>
<tr><td><code>COALESCE(a, b, …)</code></td><td>returns the first argument that isn't NULL</td></tr>
<tr><td><code>IFNULL(a, b)</code></td><td>the two-argument form in SQLite</td></tr>
</table></div>
${Q(`SELECT name, COALESCE(floor, 0) AS floor
FROM departments;`)}
<p>Arithmetic with NULL also gives NULL: <code>NULL + 5</code> is <code>NULL</code>. Aggregate functions, which you'll meet soon, skip NULLs.</p>
<p>When should a column allow NULL? Only when "unknown" or "doesn't apply" is a real possibility. You'll see how to forbid it with <code>NOT NULL</code> when you create tables.</p>`,
  tasks: [
    { text: "Find the <code>name</code> of every employee with no department.", solution: "SELECT name FROM employees WHERE department_id IS NULL;" },
    { text: "Find the <code>name</code> of every department that has a floor assigned.", solution: "SELECT name FROM departments WHERE floor IS NOT NULL;" },
    { text: "Find the <code>name</code> of every employee who has a manager.", solution: "SELECT name FROM employees WHERE manager_id IS NOT NULL;" },
    { text: "List every employee <code>name</code> with their department name. Show <code>'Unassigned'</code> when they have none.", solution: "SELECT e.name, COALESCE(d.name, 'Unassigned') FROM employees e LEFT JOIN departments d ON e.department_id = d.id;" }
  ]
});

LESSONS.push({
  id: "expressions", section: "core", title: "Calculations and aliases", short: "Expressions",
  setup: DATA.films + DATA.boxOffice, starter: "SELECT title, runtime_min / 60.0 AS hours\nFROM films;",
  body: `
<p>A <code>SELECT</code> list can hold expressions as well as plain columns: arithmetic, function calls and text joined together. You can use the same expressions in <code>WHERE</code> and <code>ORDER BY</code>.</p>
${Q(`SELECT title,
       (domestic_gross + international_gross) / 1000000.0 AS total_millions
FROM films
JOIN box_office ON films.id = box_office.film_id
ORDER BY total_millions DESC;`)}
<h2>Useful pieces</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Expression</th><th>What it does</th></tr>
<tr><td><code>+ - * /</code></td><td>arithmetic. Dividing two integers drops the fraction (<code>7 / 2</code> is <code>3</code>); write <code>7 / 2.0</code> to keep it</td></tr>
<tr><td><code>%</code></td><td>remainder (<code>year % 2 = 0</code> means an even year)</td></tr>
<tr><td><code>ROUND(x, n)</code></td><td>rounds to <em>n</em> decimal places</td></tr>
<tr><td><code>ABS(x)</code></td><td>absolute value</td></tr>
<tr><td><code>a || b</code></td><td>joins two pieces of text</td></tr>
</table></div>
<h2>Aliases</h2>
<p><code>AS name</code> gives a calculated column a readable name. You can use that alias in <code>ORDER BY</code>, but not in <code>WHERE</code>. The next lessons explain why.</p>`,
  tasks: [
    { text: "Show each film's <code>title</code> and its total gross (domestic plus international) as <code>total_gross</code>.", solution: "SELECT title, domestic_gross + international_gross AS total_gross FROM films JOIN box_office ON films.id = box_office.film_id;" },
    { text: "Show each film's <code>title</code> and its runtime in hours, rounded to one decimal place.", solution: "SELECT title, ROUND(runtime_min / 60.0, 1) AS hours FROM films;" },
    { text: "Show each film's <code>title</code> and its critic score as a percentage (score times 10).", solution: "SELECT title, critic_score * 10 AS percent FROM films JOIN box_office ON films.id = box_office.film_id;" },
    { text: "Find the <code>title</code> and <code>year</code> of films released in an even-numbered year.", solution: "SELECT title, year FROM films WHERE year % 2 = 0;" },
    { text: "Show one column named <code>label</code> that reads like <code>Ironwood (2018)</code> for every film.", solution: "SELECT title || ' (' || year || ')' AS label FROM films;" }
  ]
});

LESSONS.push({
  id: "aggregates", section: "core", title: "Summarizing with aggregate functions", short: "Aggregates",
  setup: DATA.company, starter: "SELECT COUNT(*), AVG(salary)\nFROM employees;",
  body: `
<p>Aggregate functions collapse many rows into one summary value.</p>
<div class="ref-wrap"><table class="ref">
<tr><th>Function</th><th>Returns</th></tr>
<tr><td><code>COUNT(*)</code></td><td>number of rows</td></tr>
<tr><td><code>COUNT(column)</code></td><td>number of non-NULL values in that column</td></tr>
<tr><td><code>SUM(column)</code></td><td>total</td></tr>
<tr><td><code>AVG(column)</code></td><td>average</td></tr>
<tr><td><code>MIN(column)</code> / <code>MAX(column)</code></td><td>smallest / largest value (works on text and dates too)</td></tr>
</table></div>
${Q(`SELECT MIN(hire_date) AS first_hire, MAX(salary) AS top_salary
FROM employees;`)}
<h2>GROUP BY</h2>
<p>Add <code>GROUP BY</code> to get one summary row per group instead of one for the whole table. Rows that share the same value in the grouped column go into the same group.</p>
${Q(`SELECT role, COUNT(*) AS people
FROM employees
GROUP BY role;`)}
<div class="note"><p>Rule of thumb: every column in the SELECT list should either appear in <code>GROUP BY</code> or sit inside an aggregate function. SQLite allows other columns, but the values it picks for them are arbitrary.</p></div>`,
  tasks: [
    { text: "Find the highest salary at the company.", solution: "SELECT MAX(salary) FROM employees;" },
    { text: "Count the employees.", solution: "SELECT COUNT(*) FROM employees;" },
    { text: "Find the average salary for each <code>role</code> (role, average).", solution: "SELECT role, AVG(salary) FROM employees GROUP BY role;" },
    { text: "Find the total salary cost for each <code>department_id</code> (department_id, total). Unassigned employees form their own group.", solution: "SELECT department_id, SUM(salary) FROM employees GROUP BY department_id;" }
  ]
});

LESSONS.push({
  id: "group-having", section: "core", title: "Filtering groups with HAVING", short: "GROUP BY & HAVING",
  setup: DATA.company, starter: "SELECT role, COUNT(*) AS people\nFROM employees\nGROUP BY role\nHAVING COUNT(*) > 1;",
  body: `
<p><code>WHERE</code> filters rows <em>before</em> they're grouped, so it can't refer to an aggregate. To filter the groups themselves, use <code>HAVING</code>, which runs after grouping.</p>
${Q(`SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE role != 'Contractor'      -- filters rows
GROUP BY department_id
HAVING AVG(salary) > 100000;    -- filters groups`)}
<p>You can group joined tables as well. Join first, then group by the column you want a row for:</p>
${Q(`SELECT d.name, COUNT(*) AS headcount
FROM employees e
JOIN departments d ON e.department_id = d.id
GROUP BY d.name;`)}`,
  tasks: [
    { text: "Count the employees in each <code>role</code> (role, count).", solution: "SELECT role, COUNT(*) FROM employees GROUP BY role;" },
    { text: "Find the roles held by more than one person (role, count).", solution: "SELECT role, COUNT(*) FROM employees GROUP BY role HAVING COUNT(*) > 1;" },
    { text: "Show each department <code>name</code> with its average salary, only for departments that average more than 90,000.", solution: "SELECT d.name, AVG(e.salary) FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.name HAVING AVG(e.salary) > 90000;" },
    { text: "Show each department <code>name</code> with the date of its earliest hire.", solution: "SELECT d.name, MIN(e.hire_date) FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.name;" }
  ]
});

LESSONS.push({
  id: "execution-order", section: "core", title: "The order a query runs in", short: "Order of execution",
  setup: DATA.films + DATA.boxOffice, starter: "SELECT director, COUNT(*) AS films\nFROM films\nGROUP BY director;",
  body: `
<p>You write a query starting with <code>SELECT</code>, but the database doesn't run it in that order. Knowing the real order explains most "why doesn't this work?" moments.</p>
<div class="ref-wrap"><table class="ref">
<tr><th>Step</th><th>Clause</th><th>What happens</th></tr>
<tr><td>1</td><td><code>FROM</code> / <code>JOIN</code></td><td>gather the rows and combine the tables</td></tr>
<tr><td>2</td><td><code>WHERE</code></td><td>drop rows that fail the condition</td></tr>
<tr><td>3</td><td><code>GROUP BY</code></td><td>sort the remaining rows into groups</td></tr>
<tr><td>4</td><td><code>HAVING</code></td><td>drop groups that fail the condition</td></tr>
<tr><td>5</td><td><code>SELECT</code></td><td>work out the output columns and aliases</td></tr>
<tr><td>6</td><td><code>DISTINCT</code></td><td>remove duplicate rows</td></tr>
<tr><td>7</td><td><code>ORDER BY</code></td><td>sort; aliases from step 5 now exist</td></tr>
<tr><td>8</td><td><code>LIMIT</code> / <code>OFFSET</code></td><td>keep a slice</td></tr>
</table></div>
<p>So an alias made in <code>SELECT</code> isn't defined yet when <code>WHERE</code> runs. You can use it in <code>ORDER BY</code>, though. SQLite is lenient and also accepts aliases in <code>HAVING</code>, but many databases don't.</p>
${Q(`SELECT genre, AVG(critic_score) AS avg_score
FROM films
JOIN box_office ON films.id = box_office.film_id
GROUP BY genre
ORDER BY avg_score DESC;`)}`,
  tasks: [
    { text: "Count the films made by each <code>director</code> (director, count).", solution: "SELECT director, COUNT(*) FROM films GROUP BY director;" },
    { text: "Show each director's total domestic gross (director, total), highest first. Only films with box office data count.", solution: "SELECT director, SUM(domestic_gross) AS total FROM films JOIN box_office ON films.id = box_office.film_id GROUP BY director ORDER BY total DESC;", ordered: true },
    { text: "Show the genres whose average critic score is at least 7.5 (genre, average), best first.", solution: "SELECT genre, AVG(critic_score) AS avg_score FROM films JOIN box_office ON films.id = box_office.film_id GROUP BY genre HAVING AVG(critic_score) >= 7.5 ORDER BY avg_score DESC;", ordered: true },
    { text: "Find the single director with the highest combined international gross (director, total).", solution: "SELECT director, SUM(international_gross) AS total FROM films JOIN box_office ON films.id = box_office.film_id GROUP BY director ORDER BY total DESC LIMIT 1;", ordered: true }
  ]
});

LESSONS.push({
  id: "insert", section: "core", title: "Adding rows with INSERT", short: "INSERT",
  setup: DATA.films + DATA.boxOffice, starter: "INSERT INTO films\nVALUES (16, 'Harbor Lights', 'Sam Whitlock', 2024, 107, 'Drama');",
  body: `
<p>So far you've only read data. From here on you'll change it. <code>INSERT</code> adds new rows.</p>
${Q(`-- values for every column, in table order
INSERT INTO films
VALUES (16, 'Harbor Lights', 'Sam Whitlock', 2024, 107, 'Drama');

-- naming the columns (safer, and any you leave out become NULL or their default)
INSERT INTO films (id, title, year)
VALUES (20, 'Working Title', 2027);

-- several rows at once
INSERT INTO box_office VALUES
  (20, 7.1, 1000000, 2000000),
  (21, 6.5,  500000,  900000);`)}
<p>Naming the columns is the better habit. Your statement keeps working if the table gains a column, and anyone reading it can see which value goes where.</p>
<p>The Tables panel updates after every statement, so you can check your new rows straight away. If something goes wrong, press <strong>Reset data</strong>.</p>`,
  tasks: [
    { text: "Add a film: id <code>16</code>, title <code>Harbor Lights</code>, director <code>Sam Whitlock</code>, year <code>2024</code>, runtime <code>107</code>, genre <code>Drama</code>.", solution: "INSERT INTO films VALUES (16, 'Harbor Lights', 'Sam Whitlock', 2024, 107, 'Drama');", after: "SELECT * FROM films" },
    { text: "Add its box office row: film_id <code>16</code>, critic score <code>7.4</code>, domestic gross <code>23100000</code>, international gross <code>18800000</code>.", solution: "INSERT INTO box_office VALUES (16, 7.4, 23100000, 18800000);", after: "SELECT * FROM box_office" },
    { text: "Add a film with only id <code>17</code>, title <code>Untitled Project</code> and year <code>2026</code>. Leave every other column empty.", solution: "INSERT INTO films (id, title, year) VALUES (17, 'Untitled Project', 2026);", after: "SELECT * FROM films" }
  ]
});

LESSONS.push({
  id: "update", section: "core", title: "Changing rows with UPDATE", short: "UPDATE",
  setup: DATA.films + DATA.boxOffice, starter: "UPDATE films\nSET runtime_min = 91\nWHERE title = 'The Last Tram';",
  body: `
<p><code>UPDATE</code> changes values in rows that already exist.</p>
${Q(`UPDATE table_name
SET column = value, other_column = other_value
WHERE condition;`)}
<p>The <code>WHERE</code> clause picks which rows change. <strong>Leave it out and every row changes.</strong> It's one of the most common and most costly SQL mistakes. A safe habit is to write the <code>WHERE</code> as a <code>SELECT</code> first, check that it returns exactly the rows you mean, then turn it into an <code>UPDATE</code>.</p>
<p>The new value can be an expression, including one that uses the old value:</p>
${Q(`UPDATE box_office
SET domestic_gross = domestic_gross + 500000
WHERE film_id = 3;`)}`,
  tasks: [
    { text: "<em>The Last Tram</em> actually runs 91 minutes. Fix its runtime.", solution: "UPDATE films SET runtime_min = 91 WHERE title = 'The Last Tram';", after: "SELECT * FROM films" },
    { text: "<em>Paper Kites</em> was directed by <code>Mara Okafor</code> and is a <code>Drama</code>. Fix both columns in one statement.", solution: "UPDATE films SET director = 'Mara Okafor', genre = 'Drama' WHERE title = 'Paper Kites';", after: "SELECT * FROM films" },
    { text: "Raise every critic score below 6.5 by 0.5.", solution: "UPDATE box_office SET critic_score = critic_score + 0.5 WHERE critic_score < 6.5;", after: "SELECT * FROM box_office" }
  ]
});

LESSONS.push({
  id: "delete", section: "core", title: "Removing rows with DELETE", short: "DELETE",
  setup: DATA.films + DATA.boxOffice, starter: "SELECT * FROM films WHERE year < 2006;",
  body: `
<p><code>DELETE</code> removes whole rows.</p>
${Q(`DELETE FROM table_name
WHERE condition;`)}
<p>The <code>WHERE</code> warning from the last lesson applies even more here: <code>DELETE FROM films;</code> empties the table. Check with a <code>SELECT</code> that uses the same <code>WHERE</code> first.</p>
<p>Deleting rows in one table can leave rows in another table pointing at something that no longer exists. These are called <em>orphans</em>. The last task cleans some up with a <em>subquery</em>, a query inside another query. Subqueries have their own topic later on.</p>
${Q(`DELETE FROM box_office
WHERE film_id NOT IN (SELECT id FROM films);`)}`,
  tasks: [
    { text: "Delete every film released before 2006.", solution: "DELETE FROM films WHERE year < 2006;", after: "SELECT * FROM films" },
    { text: "Delete every box office row with a critic score below 6.5.", solution: "DELETE FROM box_office WHERE critic_score < 6.5;", after: "SELECT * FROM box_office" },
    { text: "Delete box office rows whose film no longer exists in <code>films</code>.", solution: "DELETE FROM box_office WHERE film_id NOT IN (SELECT id FROM films);", after: "SELECT * FROM box_office" }
  ]
});

LESSONS.push({
  id: "create-table", section: "core", title: "Creating tables", short: "CREATE TABLE",
  setup: DATA.films, starter: "CREATE TABLE screenings (\n  id INTEGER PRIMARY KEY,\n  \n);",
  body: `
<p><code>CREATE TABLE</code> defines a new table: its name, its columns, each column's type, and any rules the data must follow.</p>
${Q(`CREATE TABLE IF NOT EXISTS table_name (
  column_name TYPE constraints,
  another_column TYPE constraints DEFAULT value
);`)}
<h2>Common types</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Type</th><th>Holds</th></tr>
<tr><td><code>INTEGER</code></td><td>whole numbers</td></tr>
<tr><td><code>REAL</code></td><td>decimal numbers</td></tr>
<tr><td><code>TEXT</code></td><td>strings. SQLite also stores dates as text</td></tr>
<tr><td><code>BLOB</code></td><td>raw bytes</td></tr>
</table></div>
<p>Other databases add types such as <code>VARCHAR(n)</code>, <code>DATE</code> and <code>BOOLEAN</code>. SQLite accepts those names but stores the data with the closest match from the table above.</p>
<h2>Constraints</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Constraint</th><th>Rule</th></tr>
<tr><td><code>PRIMARY KEY</code></td><td>uniquely identifies each row</td></tr>
<tr><td><code>NOT NULL</code></td><td>a value is required</td></tr>
<tr><td><code>UNIQUE</code></td><td>no two rows can share a value</td></tr>
<tr><td><code>DEFAULT x</code></td><td>the value used when an insert leaves the column out</td></tr>
<tr><td><code>CHECK (expr)</code></td><td>every row must pass the test</td></tr>
</table></div>
<h2>Creating a table from a query</h2>
${Q(`CREATE TABLE sci_fi AS
SELECT id, title FROM films WHERE genre = 'Sci-Fi';`)}`,
  tasks: [
    { text: "Create <code>screenings</code> with columns <code>id INTEGER PRIMARY KEY</code>, <code>film_id INTEGER</code>, <code>room TEXT</code>, <code>starts_at TEXT</code> and <code>seats_sold INTEGER DEFAULT 0</code>.", solution: "CREATE TABLE screenings (\n  id INTEGER PRIMARY KEY,\n  film_id INTEGER,\n  room TEXT,\n  starts_at TEXT,\n  seats_sold INTEGER DEFAULT 0\n);", after: "SELECT name, UPPER(type), pk, dflt_value FROM pragma_table_info('screenings')" },
    { text: "Create <code>rooms</code> with <code>name TEXT PRIMARY KEY</code> and <code>capacity INTEGER NOT NULL</code>.", solution: "CREATE TABLE rooms (\n  name TEXT PRIMARY KEY,\n  capacity INTEGER NOT NULL\n);", after: "SELECT name, UPPER(type), \"notnull\", pk FROM pragma_table_info('rooms')" },
    { text: "Create a table <code>classics</code> holding the <code>id</code>, <code>title</code> and <code>year</code> of every film released before 2010, using <code>CREATE TABLE … AS SELECT</code>.", solution: "CREATE TABLE classics AS SELECT id, title, year FROM films WHERE year < 2010;", after: "SELECT * FROM classics" }
  ]
});

LESSONS.push({
  id: "alter-table", section: "core", title: "Changing a table with ALTER TABLE", short: "ALTER TABLE",
  setup: DATA.films, starter: "ALTER TABLE films\nADD COLUMN language TEXT DEFAULT 'English';",
  body: `
<p>Requirements change after a table already holds data. <code>ALTER TABLE</code> changes the structure without rebuilding it from scratch.</p>
${Q(`ALTER TABLE films ADD COLUMN language TEXT DEFAULT 'English';
ALTER TABLE films RENAME COLUMN old_name TO new_name;
ALTER TABLE films DROP COLUMN column_name;
ALTER TABLE films RENAME TO new_table_name;`)}
<p>A new column is added to every existing row. Rows get the <code>DEFAULT</code> value, or <code>NULL</code> if there's no default.</p>
<div class="note"><p>SQLite supports only these four changes. To change a column's type or constraints in SQLite, you create a new table, copy the data across and swap the names. PostgreSQL and MySQL can alter columns directly.</p></div>`,
  tasks: [
    { text: "Add a <code>language</code> column of type <code>TEXT</code> with a default of <code>'English'</code>.", solution: "ALTER TABLE films ADD COLUMN language TEXT DEFAULT 'English';", after: "SELECT id, language FROM films" },
    { text: "Rename the column <code>runtime_min</code> to <code>minutes</code>.", solution: "ALTER TABLE films RENAME COLUMN runtime_min TO minutes;", after: "SELECT name FROM pragma_table_info('films') ORDER BY cid", ordered: true },
    { text: "Rename the table <code>films</code> to <code>movies</code>.", solution: "ALTER TABLE films RENAME TO movies;", after: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name", ordered: true },
    { text: "Remove the <code>language</code> column from <code>movies</code>.", solution: "ALTER TABLE movies DROP COLUMN language;", after: "SELECT name FROM pragma_table_info('movies') ORDER BY cid", ordered: true }
  ]
});

LESSONS.push({
  id: "drop-table", section: "core", title: "Removing tables with DROP TABLE", short: "DROP TABLE",
  setup: DATA.films + DATA.boxOffice + "CREATE TABLE temp_import (raw_line TEXT); INSERT INTO temp_import VALUES ('id,title'),('99,Test');",
  starter: "DROP TABLE temp_import;",
  body: `
<p><code>DROP TABLE</code> deletes a table completely: its structure, every row and its indexes. It can't be undone, so production databases rely on backups and on permissions that limit who can run it.</p>
${Q(`DROP TABLE table_name;
DROP TABLE IF EXISTS table_name;   -- no error if it's already gone`)}
<p>Compare the three ways to remove data:</p>
<div class="ref-wrap"><table class="ref">
<tr><th>Statement</th><th>Removes</th></tr>
<tr><td><code>DELETE FROM t WHERE …</code></td><td>some rows</td></tr>
<tr><td><code>DELETE FROM t</code></td><td>all rows; the empty table stays</td></tr>
<tr><td><code>DROP TABLE t</code></td><td>the table itself</td></tr>
</table></div>
<p>When other tables point to this one through foreign keys, many databases won't let you drop it first. You'll see foreign keys in the further topics.</p>`,
  tasks: [
    { text: "Drop the leftover <code>temp_import</code> table.", solution: "DROP TABLE temp_import;", after: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name", ordered: true },
    { text: "Drop <code>box_office</code>, using <code>IF EXISTS</code>.", solution: "DROP TABLE IF EXISTS box_office;", after: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name", ordered: true },
    { text: "Finally, drop <code>films</code>.", solution: "DROP TABLE films;", after: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name", ordered: true }
  ]
});

LESSONS.push({
  id: "review-core", section: "core", title: "Review: putting it all together", short: "Review: everything",
  setup: DATA.shop, starter: "SELECT * FROM orders;",
  body: `
<p>You've covered the core of SQL: reading, filtering, sorting, joining, summarizing and changing data, and defining tables. This review uses a new dataset, a small online shop:</p>
<ul>
<li><code>customers</code>: who buys</li>
<li><code>products</code>: what's for sale</li>
<li><code>orders</code>: one row per checkout, with a timestamp and status</li>
<li><code>order_items</code>: the lines of each order (which product, how many, at what price)</li>
</ul>
<p>Revenue for an order line is <code>quantity * unit_price</code>. The further topics keep using this dataset, so it's worth getting to know it here.</p>
<div class="note"><p>Stuck on a long query? Write the <code>FROM</code> and the joins first, run with <code>SELECT *</code>, then add one clause at a time.</p></div>`,
  tasks: [
    { text: "Find the <code>name</code> of every customer in Denver.", solution: "SELECT name FROM customers WHERE city = 'Denver';" },
    { text: "Count the orders in each <code>status</code> (status, count).", solution: "SELECT status, COUNT(*) FROM orders GROUP BY status;" },
    { text: "List every customer's <code>name</code> with their number of orders, including customers with none. Sort by order count (highest first), then by name.", solution: "SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name ORDER BY orders DESC, c.name;", ordered: true },
    { text: "Show the total revenue for each product <code>category</code>, rounded to 2 decimals (category, revenue).", solution: "SELECT p.category, ROUND(SUM(i.quantity * i.unit_price), 2) FROM order_items i JOIN products p ON p.id = i.product_id GROUP BY p.category;" }
  ]
});
