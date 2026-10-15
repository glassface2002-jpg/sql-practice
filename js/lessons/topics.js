/* Further topics. All text and exercises are original. */

LESSONS.push({
  id: "subqueries", section: "topics", title: "Subqueries", short: "Subqueries",
  setup: DATA.company, starter: "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);",
  body: `
<p>A <strong>subquery</strong> is a query inside another query, wrapped in parentheses. It lets you use one answer as the input to the next question, without running two queries by hand.</p>
<h2>Scalar subqueries: one value</h2>
<p>When the inner query returns exactly one value, you can use it anywhere a single value fits.</p>
${Q(`SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);`)}
<h2>List subqueries with IN</h2>
<p>When the inner query returns one column of many rows, use it with <code>IN</code> or <code>NOT IN</code>.</p>
${Q(`SELECT name FROM employees
WHERE department_id IN (SELECT id FROM departments WHERE floor = 3);`)}
<div class="note"><p>Be careful with <code>NOT IN</code>: if the subquery returns even one NULL, the whole test returns nothing. <code>NOT EXISTS</code> doesn't have this problem.</p></div>
<h2>EXISTS and correlated subqueries</h2>
<p>A <strong>correlated</strong> subquery refers to the outer query's current row, so it runs once per row. <code>EXISTS</code> is true when the subquery returns at least one row.</p>
${Q(`-- departments that have at least one project
SELECT d.name FROM departments d
WHERE EXISTS (SELECT 1 FROM projects p WHERE p.department_id = d.id);`)}
<h2>Subqueries in FROM</h2>
<p>A subquery can also act as a temporary table. Give it an alias.</p>
${Q(`SELECT MAX(headcount)
FROM (SELECT department_id, COUNT(*) AS headcount
      FROM employees GROUP BY department_id) AS counts;`)}`,
  tasks: [
    { text: "Find the <code>name</code> and <code>salary</code> of employees paid more than the company average.", solution: "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);" },
    { text: "Using <code>IN</code> and a subquery, find the <code>name</code> of every employee whose department is on floor 1.", solution: "SELECT name FROM employees WHERE department_id IN (SELECT id FROM departments WHERE floor = 1);" },
    { text: "Using <code>NOT EXISTS</code>, find the <code>name</code> of every department with no employees.", solution: "SELECT d.name FROM departments d WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.id);" },
    { text: "With a correlated subquery, find the <code>name</code> and <code>salary</code> of the top earner in each department.", solution: "SELECT e.name, e.salary FROM employees e WHERE e.salary = (SELECT MAX(e2.salary) FROM employees e2 WHERE e2.department_id = e.department_id);" },
    { text: "Using a subquery in <code>FROM</code>, find the average number of employees per department, counting only employees who have a department.", solution: "SELECT AVG(n) FROM (SELECT COUNT(*) AS n FROM employees WHERE department_id IS NOT NULL GROUP BY department_id);" }
  ]
});

LESSONS.push({
  id: "set-operations", section: "topics", title: "UNION, INTERSECT and EXCEPT", short: "Unions & set operations",
  setup: DATA.shop, starter: "SELECT name FROM customers\nUNION\nSELECT name FROM products;",
  body: `
<p>Joins put tables side by side. Set operations stack the results of two queries on top of each other. Both queries must return the same number of columns, with compatible types.</p>
<div class="ref-wrap"><table class="ref">
<tr><th>Operator</th><th>Returns</th></tr>
<tr><td><code>UNION</code></td><td>rows from either query, duplicates removed</td></tr>
<tr><td><code>UNION ALL</code></td><td>rows from either query, duplicates kept (faster)</td></tr>
<tr><td><code>INTERSECT</code></td><td>rows that appear in both</td></tr>
<tr><td><code>EXCEPT</code></td><td>rows in the first query that aren't in the second (other databases may call this <code>MINUS</code>)</td></tr>
</table></div>
${Q(`-- customer ids who ordered in January or February
SELECT customer_id FROM orders WHERE ordered_at LIKE '2025-01%'
UNION
SELECT customer_id FROM orders WHERE ordered_at LIKE '2025-02%';`)}
<p>An <code>ORDER BY</code> goes once, at the very end, and sorts the combined result. The result's column names come from the first query.</p>
<p><code>EXCEPT</code> is a neat way to ask "which of these never happened?", for example products that were never ordered.</p>`,
  tasks: [
    { text: "Using <code>UNION</code>, list every customer name and every product name together in one column.", solution: "SELECT name FROM customers UNION SELECT name FROM products;" },
    { text: "Using <code>UNION ALL</code>, list the <code>customer_id</code> of every order placed in January 2025, followed by every order placed in March 2025. Keep repeats.", solution: "SELECT customer_id FROM orders WHERE ordered_at LIKE '2025-01%' UNION ALL SELECT customer_id FROM orders WHERE ordered_at LIKE '2025-03%';" },
    { text: "Using <code>INTERSECT</code>, find the <code>customer_id</code> of customers who ordered in both February 2025 and April 2025.", solution: "SELECT customer_id FROM orders WHERE ordered_at LIKE '2025-02%' INTERSECT SELECT customer_id FROM orders WHERE ordered_at LIKE '2025-04%';" },
    { text: "Using <code>EXCEPT</code>, find the <code>id</code> of products that have never been ordered.", solution: "SELECT id FROM products EXCEPT SELECT product_id FROM order_items;" },
    { text: "Using <code>EXCEPT</code>, find the <code>id</code> of customers who have never placed an order.", solution: "SELECT id FROM customers EXCEPT SELECT customer_id FROM orders;" }
  ]
});

LESSONS.push({
  id: "keys", section: "topics", title: "Primary keys and foreign keys", short: "Primary & foreign keys",
  setup: DATA.shop, starter: "-- Try this first. It should fail, because customer 99 doesn't exist:\nINSERT INTO orders (id, customer_id, ordered_at, status)\nVALUES (50, 99, '2025-06-01 10:00:00', 'pending');",
  body: `
<p>Keys are how a relational database keeps its connections trustworthy.</p>
<h2>Primary key</h2>
<p>A <strong>primary key</strong> is the column, or set of columns, that uniquely identifies a row. It can't repeat, and in most databases it can't be NULL. <code>order_items</code> uses a <em>composite</em> key of <code>(order_id, product_id)</code>, so the same product can't appear twice in one order.</p>
<h2>Foreign key</h2>
<p>A <strong>foreign key</strong> is a column that must match a primary key in another table. The database then refuses changes that would leave a broken link.</p>
${Q(`CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  ...
);`)}
<p>With this rule in place, you can't insert an order for a customer who doesn't exist. You also can't delete a customer who still has orders. Try this in the editor to see the error:</p>
${Q(`INSERT INTO orders (id, customer_id, ordered_at, status)
VALUES (50, 99, '2025-06-01 10:00:00', 'pending');`)}
<h2>What happens on delete</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Option</th><th>When the parent row is deleted…</th></tr>
<tr><td><em>(default)</em> / <code>RESTRICT</code></td><td>the delete is refused while child rows exist</td></tr>
<tr><td><code>ON DELETE CASCADE</code></td><td>the child rows are deleted too</td></tr>
<tr><td><code>ON DELETE SET NULL</code></td><td>the child's foreign key becomes NULL</td></tr>
</table></div>
<p>In this shop, <code>order_items.order_id</code> uses <code>ON DELETE CASCADE</code>, so deleting an order removes its lines as well.</p>
<div class="note"><p>SQLite only enforces foreign keys after <code>PRAGMA foreign_keys = ON;</code>. This lesson turns it on for you. PostgreSQL and MySQL (InnoDB) always enforce them.</p></div>
<p>To list a table's foreign keys, run <code>SELECT * FROM pragma_foreign_key_list('orders');</code>.</p>`,
  tasks: [
    { text: "Create <code>reviews</code> with <code>id INTEGER PRIMARY KEY</code>, <code>product_id INTEGER NOT NULL</code> referencing <code>products(id)</code>, <code>customer_id INTEGER</code> referencing <code>customers(id)</code>, and <code>stars INTEGER</code> with <code>CHECK (stars BETWEEN 1 AND 5)</code>.", solution: "CREATE TABLE reviews (\n  id INTEGER PRIMARY KEY,\n  product_id INTEGER NOT NULL REFERENCES products(id),\n  customer_id INTEGER REFERENCES customers(id),\n  stars INTEGER CHECK (stars BETWEEN 1 AND 5)\n);", after: "SELECT \"table\", \"from\", \"to\" FROM pragma_foreign_key_list('reviews') ORDER BY \"from\"" },
    { text: "Add a review: id <code>1</code>, Omar Farouk (customer 2) gives the Burr Grinder (product 3) <code>5</code> stars.", solution: "INSERT INTO reviews (id, product_id, customer_id, stars) VALUES (1, 3, 2, 5);", after: "SELECT * FROM reviews" },
    { text: "Delete the cancelled order, id <code>12</code>. Then check that its order lines disappeared too.", solution: "DELETE FROM orders WHERE id = 12;", after: "SELECT * FROM order_items ORDER BY order_id, product_id" },
    { text: "Remove customer <code>Anya Petrova</code> (id 8). She has no orders, so the foreign key allows it.", solution: "DELETE FROM customers WHERE id = 8;", after: "SELECT id FROM customers" }
  ]
});

LESSONS.push({
  id: "dates", section: "topics", title: "Dates and times", short: "Dates & times",
  setup: DATA.shop, starter: "SELECT id, ordered_at, date(ordered_at), strftime('%Y-%m', ordered_at)\nFROM orders;",
  body: `
<p>SQLite has no separate date type. It stores dates as text in ISO format, <code>YYYY-MM-DD HH:MM:SS</code>. Because that format runs from the largest unit to the smallest, sorting the text sorts the dates, and <code>&lt;</code> and <code>BETWEEN</code> work as you'd expect.</p>
<h2>Date functions</h2>
<div class="ref-wrap"><table class="ref">
<tr><th>Function</th><th>Example result</th></tr>
<tr><td><code>date('2025-03-02 20:11:00')</code></td><td><code>2025-03-02</code></td></tr>
<tr><td><code>time(ordered_at)</code></td><td><code>20:11:00</code></td></tr>
<tr><td><code>date(ordered_at, '+7 days')</code></td><td>a week later. Also <code>'-1 month'</code>, <code>'start of month'</code></td></tr>
<tr><td><code>strftime('%Y-%m', ordered_at)</code></td><td><code>2025-03</code>: year and month</td></tr>
<tr><td><code>strftime('%w', ordered_at)</code></td><td>day of the week, <code>0</code> = Sunday</td></tr>
<tr><td><code>julianday(b) - julianday(a)</code></td><td>days between two dates, as a decimal</td></tr>
<tr><td><code>date('now')</code></td><td>today's date (UTC)</td></tr>
</table></div>
${Q(`-- orders per month
SELECT strftime('%Y-%m', ordered_at) AS month, COUNT(*)
FROM orders
GROUP BY month
ORDER BY month;`)}
<h3>Other databases</h3>
<p>PostgreSQL and MySQL have real <code>DATE</code>, <code>TIME</code> and <code>TIMESTAMP</code> types and their own functions: <code>EXTRACT(MONTH FROM d)</code>, <code>DATE_TRUNC('month', d)</code>, <code>d + INTERVAL '7 days'</code>. The ideas are the same: pull out parts, shift by intervals, subtract to get durations.</p>`,
  tasks: [
    { text: "Show each order's <code>id</code> and the date part of <code>ordered_at</code> (no time).", solution: "SELECT id, date(ordered_at) FROM orders;" },
    { text: "Find the <code>id</code> and <code>ordered_at</code> of every order placed in April 2025.", solution: "SELECT id, ordered_at FROM orders WHERE strftime('%Y-%m', ordered_at) = '2025-04';" },
    { text: "Count the orders in each month, shown as <code>YYYY-MM</code> (month, count), in date order.", solution: "SELECT strftime('%Y-%m', ordered_at) AS month, COUNT(*) FROM orders GROUP BY month ORDER BY month;", ordered: true },
    { text: "Find the <code>id</code> of every order placed on a Saturday or Sunday.", solution: "SELECT id FROM orders WHERE strftime('%w', ordered_at) IN ('0', '6');" },
    { text: "Show each order's <code>id</code> and an estimated delivery date five days after its order date.", solution: "SELECT id, date(ordered_at, '+5 days') FROM orders;" },
    { text: "Show each customer's <code>name</code> and how many whole days they had been a member on <code>2025-06-01</code>.", solution: "SELECT name, CAST(julianday('2025-06-01') - julianday(joined_on) AS INTEGER) AS days FROM customers;" }
  ]
});

LESSONS.push({
  id: "views", section: "topics", title: "Views", short: "Views",
  setup: DATA.shop, starter: "CREATE VIEW order_totals AS\nSELECT order_id, SUM(quantity * unit_price) AS total\nFROM order_items\nGROUP BY order_id;",
  body: `
<p>A <strong>view</strong> is a saved query with a name. You query it like a table, but it stores no data. Each time you read it, the database runs the query underneath, so the view always reflects the current data.</p>
${Q(`CREATE VIEW view_name AS
SELECT ...;

SELECT * FROM view_name WHERE ...;

DROP VIEW view_name;`)}
<h2>Why use views</h2>
<ul>
<li><strong>Reuse:</strong> write a tricky join or calculation once and give it a clear name.</li>
<li><strong>Simplicity:</strong> people can query <code>order_totals</code> without knowing how a total is worked out.</li>
<li><strong>Access control:</strong> in server databases, you can grant someone access to a view that hides sensitive columns.</li>
</ul>
<p>Views can be built on other views. In SQLite, views are read-only, so to change data you update the underlying tables.</p>
<div class="note"><p>Views show up in the Tables panel with a <em>view</em> tag once you create them.</p></div>`,
  tasks: [
    { text: "Create a view <code>order_totals</code> with columns <code>order_id</code> and <code>total</code>, where total is the sum of <code>quantity * unit_price</code> for each order.", solution: "CREATE VIEW order_totals AS SELECT order_id, SUM(quantity * unit_price) AS total FROM order_items GROUP BY order_id;", after: "SELECT * FROM order_totals" },
    { text: "Query the view to find orders whose total is over 100 (order_id, total).", solution: "SELECT order_id, total FROM order_totals WHERE total > 100;" },
    { text: "Create a view <code>customer_spend</code> with each customer's <code>name</code> and <code>spend</code>, the sum of their order totals. Build it on <code>order_totals</code>.", solution: "CREATE VIEW customer_spend AS SELECT c.name, SUM(t.total) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_totals t ON t.order_id = o.id GROUP BY c.id, c.name;", after: "SELECT * FROM customer_spend" },
    { text: "Drop the <code>customer_spend</code> view.", solution: "DROP VIEW customer_spend;", after: "SELECT name FROM sqlite_master WHERE type = 'view' ORDER BY name", ordered: true }
  ]
});

LESSONS.push({
  id: "case", section: "topics", title: "Conditional logic with CASE", short: "CASE expressions",
  setup: DATA.films + DATA.boxOffice, starter: "SELECT title,\n  CASE WHEN runtime_min >= 120 THEN 'Long' ELSE 'Standard' END AS length\nFROM films;",
  body: `
<p><code>CASE</code> is SQL's if/else. It checks conditions in order and returns the value for the first one that's true.</p>
${Q(`CASE
  WHEN condition_1 THEN result_1
  WHEN condition_2 THEN result_2
  ELSE fallback
END`)}
<p>Without an <code>ELSE</code>, rows that match no condition get <code>NULL</code>. There's also a short form for comparing one value with a list of options:</p>
${Q(`CASE genre WHEN 'Drama' THEN 'D' WHEN 'Comedy' THEN 'C' ELSE '?' END`)}
<h2>Conditional aggregation</h2>
<p>Put a <code>CASE</code> inside an aggregate to count or total several categories in a single row. Reports use this all the time.</p>
${Q(`SELECT
  SUM(CASE WHEN year < 2015 THEN 1 ELSE 0 END) AS before_2015,
  SUM(CASE WHEN year >= 2015 THEN 1 ELSE 0 END) AS since_2015
FROM films;`)}`,
  tasks: [
    { text: "Show each film's <code>title</code> and a label: <code>'Long'</code> if it runs 120 minutes or more, otherwise <code>'Standard'</code>.", solution: "SELECT title, CASE WHEN runtime_min >= 120 THEN 'Long' ELSE 'Standard' END FROM films;" },
    { text: "Show each film's <code>title</code> and a band from its critic score: <code>'Excellent'</code> for 8.5 and up, <code>'Good'</code> for 7 and up, otherwise <code>'Mixed'</code>. Only films with box office data.", solution: "SELECT title, CASE WHEN critic_score >= 8.5 THEN 'Excellent' WHEN critic_score >= 7 THEN 'Good' ELSE 'Mixed' END FROM films JOIN box_office ON films.id = box_office.film_id;" },
    { text: "Count the films in each era (era, count): <code>'2000s'</code> before 2010, <code>'2010s'</code> before 2020, otherwise <code>'2020s'</code>.", solution: "SELECT CASE WHEN year < 2010 THEN '2000s' WHEN year < 2020 THEN '2010s' ELSE '2020s' END AS era, COUNT(*) FROM films GROUP BY era;" },
    { text: "In a single row, count the Drama films and the Sci-Fi films (two columns).", solution: "SELECT SUM(CASE WHEN genre = 'Drama' THEN 1 ELSE 0 END), SUM(CASE WHEN genre = 'Sci-Fi' THEN 1 ELSE 0 END) FROM films;" }
  ]
});

LESSONS.push({
  id: "strings", section: "topics", title: "Working with text", short: "String functions",
  setup: DATA.company, starter: "SELECT name, UPPER(name), LENGTH(name)\nFROM employees;",
  body: `
<p>Text functions clean up, reshape and search string data.</p>
<div class="ref-wrap"><table class="ref">
<tr><th>Function</th><th>Example → result</th></tr>
<tr><td><code>UPPER(s)</code> / <code>LOWER(s)</code></td><td><code>UPPER('ada')</code> → <code>ADA</code></td></tr>
<tr><td><code>LENGTH(s)</code></td><td><code>LENGTH('Kara')</code> → <code>4</code></td></tr>
<tr><td><code>SUBSTR(s, start, len)</code></td><td><code>SUBSTR('Engineer', 1, 3)</code> → <code>Eng</code> (positions start at 1)</td></tr>
<tr><td><code>INSTR(s, find)</code></td><td><code>INSTR('Ada Moreno', ' ')</code> → <code>4</code> (0 if not found)</td></tr>
<tr><td><code>REPLACE(s, a, b)</code></td><td><code>REPLACE('a-b', '-', '+')</code> → <code>a+b</code></td></tr>
<tr><td><code>TRIM(s)</code></td><td>removes spaces from both ends</td></tr>
<tr><td><code>a || b</code></td><td>joins text (<code>CONCAT(a, b)</code> in many other databases)</td></tr>
</table></div>
<p>You can nest functions. For example, to get everything before the first space:</p>
${Q(`SELECT SUBSTR(name, 1, INSTR(name, ' ') - 1) AS first_name
FROM employees;`)}`,
  tasks: [
    { text: "Show every employee's <code>name</code> in uppercase.", solution: "SELECT UPPER(name) FROM employees;" },
    { text: "Show every employee's first name only (the text before the space).", solution: "SELECT SUBSTR(name, 1, INSTR(name, ' ') - 1) FROM employees;" },
    { text: "Show each <code>name</code> and its length, longest first, with ties sorted alphabetically by name.", solution: "SELECT name, LENGTH(name) AS len FROM employees ORDER BY len DESC, name;", ordered: true },
    { text: "Build an email for everyone: lowercase name, space replaced by a dot, followed by <code>@company.test</code> (for example <code>ada.moreno@company.test</code>).", solution: "SELECT LOWER(REPLACE(name, ' ', '.')) || '@company.test' FROM employees;" },
    { text: "Show each <code>role</code> once, with <code>Agent</code> replaced by <code>Specialist</code>.", solution: "SELECT DISTINCT REPLACE(role, 'Agent', 'Specialist') FROM employees;" }
  ]
});

LESSONS.push({
  id: "indexes", section: "topics", title: "Indexes and query plans", short: "Indexes",
  setup: DATA.shop, starter: "EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 4;",
  body: `
<p>Without help, the database finds matching rows by reading the whole table. This is called a <em>full scan</em>. An <strong>index</strong> is a sorted lookup structure on one or more columns, like the index at the back of a book. With one, the database can jump straight to the rows it needs.</p>
${Q(`CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE UNIQUE INDEX idx_name ON products(name);   -- also blocks duplicate names
DROP INDEX idx_name;`)}
<h2>Seeing the plan</h2>
<p><code>EXPLAIN QUERY PLAN</code> shows how SQLite will run a query without running it. <code>SCAN</code> means a full table read. <code>SEARCH … USING INDEX</code> means it uses an index.</p>
<h2>Trade-offs</h2>
<ul>
<li>Indexes speed up <code>WHERE</code>, <code>JOIN</code> and <code>ORDER BY</code> on the indexed columns.</li>
<li>They take up space and slow down every <code>INSERT</code>, <code>UPDATE</code> and <code>DELETE</code>, because the index has to be updated too.</li>
<li>Primary keys and <code>UNIQUE</code> columns get an index automatically.</li>
<li>Good candidates are foreign key columns and columns you filter on often.</li>
</ul>
<p>On a table this small, nothing will feel faster, but the plan output shows the change clearly.</p>`,
  tasks: [
    { text: "Run <code>EXPLAIN QUERY PLAN</code> on <code>SELECT * FROM orders WHERE customer_id = 4</code>. Notice the word SCAN.", solution: "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 4;" },
    { text: "Create an index named <code>idx_orders_customer</code> on <code>orders(customer_id)</code>.", solution: "CREATE INDEX idx_orders_customer ON orders(customer_id);", after: "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name" },
    { text: "Run the same <code>EXPLAIN QUERY PLAN</code> again and see the index being used.", solution: "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 4;" },
    { text: "Create a unique index named <code>idx_products_name</code> on <code>products(name)</code>.", solution: "CREATE UNIQUE INDEX idx_products_name ON products(name);", after: "SELECT name, \"unique\" FROM pragma_index_list('products') WHERE name = 'idx_products_name'" },
    { text: "Drop <code>idx_products_name</code>.", solution: "DROP INDEX idx_products_name;", after: "SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name", ordered: true }
  ]
});

LESSONS.push({
  id: "transactions", section: "topics", title: "Transactions", short: "Transactions",
  setup: DATA.shop, starter: "BEGIN;\nUPDATE products SET price = 0 WHERE id = 1;\nSELECT * FROM products WHERE id = 1;\nROLLBACK;\nSELECT * FROM products WHERE id = 1;",
  body: `
<p>A <strong>transaction</strong> groups several statements into one unit: either all of them take effect or none do. The classic example is moving money. Taking it from one account and adding it to another must both happen, or neither.</p>
${Q(`BEGIN;
  -- statements...
COMMIT;     -- make the changes permanent

BEGIN;
  -- statements...
ROLLBACK;   -- undo everything since BEGIN`)}
<p>Transactions give you the four <strong>ACID</strong> guarantees:</p>
<ul>
<li><strong>Atomic:</strong> all of the changes happen or none do.</li>
<li><strong>Consistent:</strong> constraints hold when the transaction finishes.</li>
<li><strong>Isolated:</strong> other users don't see half-finished work.</li>
<li><strong>Durable:</strong> once committed, the changes survive a crash.</li>
</ul>
<p>Try a rollback before you start the tasks. This sets a price to 0, shows the change, rolls it back and shows that the change is gone:</p>
${Q(`BEGIN;
UPDATE products SET price = 0 WHERE id = 1;
SELECT * FROM products WHERE id = 1;
ROLLBACK;
SELECT * FROM products WHERE id = 1;`)}
<div class="note"><p>If a statement fails halfway through, the transaction stays open. Finish it with <code>ROLLBACK</code>, or press Reset data.</p></div>`,
  tasks: [
    { text: "In one transaction, create order <code>13</code> for customer <code>8</code> at <code>'2025-05-10 10:00:00'</code> with status <code>'pending'</code>, add one line for product <code>9</code> (quantity 1, unit price 59.00), then commit.", solution: "BEGIN;\nINSERT INTO orders (id, customer_id, ordered_at, status) VALUES (13, 8, '2025-05-10 10:00:00', 'pending');\nINSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (13, 9, 1, 59.00);\nCOMMIT;", after: "SELECT o.id, o.customer_id, o.status, i.product_id, i.quantity, i.unit_price FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.id = 13" },
    { text: "In a transaction, raise the price of every Kitchen product by 10%, then commit.", solution: "BEGIN;\nUPDATE products SET price = price * 1.1 WHERE category = 'Kitchen';\nCOMMIT;", after: "SELECT id, price FROM products" },
    { text: "In one transaction, mark orders <code>10</code> and <code>13</code> as <code>'shipped'</code>, then commit.", solution: "BEGIN;\nUPDATE orders SET status = 'shipped' WHERE id IN (10, 13);\nCOMMIT;", after: "SELECT id, status FROM orders" }
  ]
});

LESSONS.push({
  id: "ctes", section: "topics", title: "Common table expressions (WITH)", short: "CTEs & recursion",
  setup: DATA.company, starter: "WITH dept_pay AS (\n  SELECT department_id, SUM(salary) AS total\n  FROM employees\n  GROUP BY department_id\n)\nSELECT * FROM dept_pay;",
  body: `
<p>A <strong>common table expression</strong> (CTE) names a subquery at the top of a query with <code>WITH</code>. You can then use it like a table. A long query becomes a series of named steps that read from top to bottom.</p>
${Q(`WITH step_one AS (
  SELECT ...
),
step_two AS (
  SELECT ... FROM step_one ...
)
SELECT * FROM step_two;`)}
<h2>Recursive CTEs</h2>
<p><code>WITH RECURSIVE</code> lets a CTE refer to itself, which you need for hierarchies such as org charts, category trees or threaded comments. It has two parts joined by <code>UNION ALL</code>: a starting row (the <em>anchor</em>) and a step that builds the next rows from the previous ones. It stops when the step returns no new rows.</p>
${Q(`WITH RECURSIVE reports(id, name) AS (
  SELECT id, name FROM employees WHERE id = 5          -- anchor: Elena
  UNION ALL
  SELECT e.id, e.name FROM employees e
  JOIN reports r ON e.manager_id = r.id               -- step: anyone reporting to someone found so far
)
SELECT name FROM reports;`)}`,
  tasks: [
    { text: "Using a CTE that totals salary by <code>department_id</code>, show each department <code>name</code> with its total salary.", solution: "WITH dept_pay AS (SELECT department_id, SUM(salary) AS total FROM employees GROUP BY department_id) SELECT d.name, p.total FROM dept_pay p JOIN departments d ON d.id = p.department_id;" },
    { text: "Using a CTE of each department's average salary, find the <code>name</code> of every employee who earns more than their department's average.", solution: "WITH avg_pay AS (SELECT department_id, AVG(salary) AS avg_salary FROM employees GROUP BY department_id) SELECT e.name FROM employees e JOIN avg_pay a ON a.department_id = e.department_id WHERE e.salary > a.avg_salary;" },
    { text: "Write a recursive CTE that produces the numbers 1 to 10 in one column.", solution: "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 10) SELECT x FROM n;" },
    { text: "Write a recursive CTE that lists the chain of command from <code>Dev Patel</code> up to the top (the names, including Dev).", solution: "WITH RECURSIVE chain(id, name, manager_id) AS (SELECT id, name, manager_id FROM employees WHERE name = 'Dev Patel' UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN chain c ON e.id = c.manager_id) SELECT name FROM chain;" }
  ]
});

LESSONS.push({
  id: "window-functions", section: "topics", title: "Window functions", short: "Window functions",
  setup: DATA.company, starter: "SELECT name, salary,\n  RANK() OVER (ORDER BY salary DESC) AS pay_rank\nFROM employees;",
  body: `
<p>An aggregate with <code>GROUP BY</code> collapses rows into one row per group. A <strong>window function</strong> calculates across related rows but keeps every row, so you can see each employee next to their department's average.</p>
${Q(`function() OVER (
  PARTITION BY column   -- optional: restart for each group
  ORDER BY column       -- optional: order within the window
)`)}
<div class="ref-wrap"><table class="ref">
<tr><th>Function</th><th>Gives</th></tr>
<tr><td><code>ROW_NUMBER()</code></td><td>1, 2, 3… with no ties</td></tr>
<tr><td><code>RANK()</code></td><td>equal values share a rank, and a gap follows (1, 2, 2, 4)</td></tr>
<tr><td><code>DENSE_RANK()</code></td><td>like RANK with no gaps (1, 2, 2, 3)</td></tr>
<tr><td><code>SUM / AVG / COUNT(...) OVER</code></td><td>group totals next to each row, or running totals when you add ORDER BY</td></tr>
<tr><td><code>LAG(col)</code> / <code>LEAD(col)</code></td><td>the value from the previous or next row</td></tr>
</table></div>
${Q(`SELECT name, department_id, salary,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rank_in_dept
FROM employees;`)}
<p>To keep only the top row from each partition, put the window query in a CTE or subquery and filter on <code>rank_in_dept = 1</code>. You can't filter on a window function in <code>WHERE</code> directly.</p>`,
  tasks: [
    { text: "Show each employee's <code>name</code>, <code>salary</code> and their <code>RANK()</code> by salary across the company (highest = 1).", solution: "SELECT name, salary, RANK() OVER (ORDER BY salary DESC) FROM employees;" },
    { text: "Show each employee's <code>name</code>, <code>department_id</code> and their <code>ROW_NUMBER()</code> by salary within their department (highest = 1).", solution: "SELECT name, department_id, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) FROM employees;" },
    { text: "Show each employee's <code>name</code>, <code>salary</code> and their department's average salary next to it.", solution: "SELECT name, salary, AVG(salary) OVER (PARTITION BY department_id) FROM employees;" },
    { text: "In hire order, show each <code>name</code>, <code>hire_date</code> and the running total of salaries as people joined.", solution: "SELECT name, hire_date, SUM(salary) OVER (ORDER BY hire_date) FROM employees ORDER BY hire_date;", ordered: true },
    { text: "In hire order, show each <code>name</code>, <code>hire_date</code> and the previous person's hire date (use <code>LAG</code>).", solution: "SELECT name, hire_date, LAG(hire_date) OVER (ORDER BY hire_date) FROM employees ORDER BY hire_date;", ordered: true }
  ]
});

LESSONS.push({
  id: "challenges", section: "topics", title: "Final challenges", short: "Final challenges",
  setup: DATA.shop, starter: "SELECT * FROM order_items;",
  body: `
<p>These challenges combine techniques from across the course, and each has more than one correct approach. Joins, subqueries, CTEs and window functions are all fair game. The grader only checks your result.</p>
<p>A quick reminder of the shop's tables: <code>customers</code> → <code>orders</code> → <code>order_items</code> ← <code>products</code>. Line revenue is <code>quantity * unit_price</code>.</p>
<div class="note"><p>Plan before you type. Decide what one row of the answer represents, which tables you need, and whether you're filtering rows (<code>WHERE</code>) or groups (<code>HAVING</code>).</p></div>`,
  tasks: [
    { text: "Find the best-selling product by units sold (name, units).", solution: "SELECT p.name, SUM(i.quantity) AS units FROM order_items i JOIN products p ON p.id = i.product_id GROUP BY p.id, p.name ORDER BY units DESC LIMIT 1;", ordered: true },
    { text: "Find customers who spent more than 200 on <em>delivered</em> orders (name, amount spent rounded to 2 decimals).", solution: "SELECT c.name, ROUND(SUM(i.quantity * i.unit_price), 2) AS spent FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items i ON i.order_id = o.id WHERE o.status = 'delivered' GROUP BY c.id, c.name HAVING SUM(i.quantity * i.unit_price) > 200;" },
    { text: "Find the month (<code>YYYY-MM</code>) with the highest revenue, ignoring cancelled and returned orders (month, revenue rounded to 2 decimals).", solution: "SELECT strftime('%Y-%m', o.ordered_at) AS month, ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.status NOT IN ('cancelled', 'returned') GROUP BY month ORDER BY revenue DESC LIMIT 1;", ordered: true },
    { text: "For each <code>city</code>, show the number of customers and the number of orders (city, customers, orders). Include cities whose customers have no orders.", solution: "SELECT c.city, COUNT(DISTINCT c.id), COUNT(o.id) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.city;" },
    { text: "Using <code>NOT EXISTS</code>, find the <code>name</code> of every product that has never been ordered.", solution: "SELECT p.name FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.product_id = p.id);" }
  ]
});
