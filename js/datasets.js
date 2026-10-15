/* Original sample datasets. All films, people and orders are fictional; city figures are rounded approximations. */
window.DATA = {};

DATA.films = `
CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  title TEXT,
  director TEXT,
  year INTEGER,
  runtime_min INTEGER,
  genre TEXT
);
INSERT INTO films VALUES
 (1,'The Paper Lighthouse','Mara Okafor',2004,104,'Drama'),
 (2,'Gravel & Gold','Theo Lindqvist',2006,121,'Western'),
 (3,'Signal Lost','Priya Raman',2008,97,'Sci-Fi'),
 (4,'Moth Season','Mara Okafor',2009,112,'Drama'),
 (5,'Clockwork Harbor','Jun Takeda',2011,131,'Adventure'),
 (6,'The Last Tram','Theo Lindqvist',2012,88,'Comedy'),
 (7,'Orbit of Small Things','Priya Raman',2013,118,'Sci-Fi'),
 (8,'Salt and Ember','Lucia Ferreira',2015,109,'Drama'),
 (9,'Pocket Giants','Jun Takeda',2016,95,'Animation'),
 (10,'Night Bus to Nowhere','Lucia Ferreira',2017,101,'Comedy'),
 (11,'Ironwood','Theo Lindqvist',2018,139,'Western'),
 (12,'The Quiet Algorithm','Priya Raman',2019,113,'Sci-Fi'),
 (13,'Pocket Giants 2','Jun Takeda',2021,99,'Animation'),
 (14,'Glass Orchard','Mara Okafor',2022,126,'Drama'),
 (15,'Paper Kites','Sam Whitlock',2023,92,'Animation');
`;

DATA.boxOffice = `
CREATE TABLE box_office (
  film_id INTEGER,
  critic_score REAL,
  domestic_gross INTEGER,
  international_gross INTEGER
);
INSERT INTO box_office VALUES
 (1,7.8,41200000,38900000),
 (2,6.4,22500000,15100000),
 (3,8.1,88300000,120400000),
 (4,7.2,30100000,27600000),
 (5,6.9,156000000,301500000),
 (6,5.8,18700000,9200000),
 (7,8.6,112900000,198300000),
 (8,7.5,35400000,41000000),
 (9,8.3,201700000,356200000),
 (10,6.1,27300000,33800000),
 (11,7.0,64800000,52300000),
 (12,8.9,143500000,260100000),
 (13,7.7,189200000,342900000),
 (14,8.0,52600000,71400000);
`;

DATA.cities = `
CREATE TABLE cities (
  name TEXT,
  country TEXT,
  continent TEXT,
  population INTEGER,
  area_km2 INTEGER,
  latitude REAL,
  longitude REAL
);
INSERT INTO cities VALUES
 ('Tokyo','Japan','Asia',13960000,2194,35.68,139.69),
 ('Delhi','India','Asia',16790000,1484,28.61,77.21),
 ('Lagos','Nigeria','Africa',15390000,1171,6.52,3.38),
 ('Cairo','Egypt','Africa',10230000,3085,30.04,31.24),
 ('Nairobi','Kenya','Africa',4397000,696,-1.29,36.82),
 ('Sao Paulo','Brazil','South America',12330000,1521,-23.55,-46.63),
 ('Buenos Aires','Argentina','South America',3121000,203,-34.60,-58.38),
 ('Lima','Peru','South America',9750000,2672,-12.05,-77.04),
 ('Mexico City','Mexico','North America',9210000,1485,19.43,-99.13),
 ('Toronto','Canada','North America',2794000,630,43.65,-79.38),
 ('Chicago','United States','North America',2746000,606,41.88,-87.63),
 ('Los Angeles','United States','North America',3898000,1302,34.05,-118.24),
 ('London','United Kingdom','Europe',8982000,1572,51.51,-0.13),
 ('Berlin','Germany','Europe',3645000,891,52.52,13.40),
 ('Madrid','Spain','Europe',3223000,604,40.42,-3.70),
 ('Sydney','Australia','Oceania',5312000,12368,-33.87,151.21),
 ('Auckland','New Zealand','Oceania',1657000,1086,-36.85,174.76);
`;

DATA.company = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT,
  floor INTEGER
);
INSERT INTO departments VALUES
 (1,'Engineering',3),(2,'Design',2),(3,'Sales',1),(4,'Support',1),(5,'Research',NULL);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT,
  department_id INTEGER,
  manager_id INTEGER,
  salary INTEGER,
  hire_date TEXT
);
INSERT INTO employees VALUES
 (1,'Ada Moreno','CTO',1,NULL,185000,'2015-03-02'),
 (2,'Ben Achebe','Engineer',1,1,128000,'2017-06-19'),
 (3,'Chloe Park','Engineer',1,1,121000,'2019-01-07'),
 (4,'Dev Patel','Engineer',1,2,98000,'2021-09-13'),
 (5,'Elena Rossi','Design Lead',2,1,132000,'2016-11-28'),
 (6,'Felix Grant','Designer',2,5,89000,'2020-04-06'),
 (7,'Gia Nguyen','Designer',2,5,91000,'2022-02-14'),
 (8,'Hassan Ali','Sales Manager',3,1,118000,'2016-05-09'),
 (9,'Ines Duarte','Account Exec',3,8,76000,'2018-08-20'),
 (10,'Jonah Kim','Account Exec',3,8,72000,'2023-03-27'),
 (11,'Kara Osei','Support Lead',4,1,84000,'2017-10-02'),
 (12,'Liam Byrne','Support Agent',4,11,54000,'2022-07-11'),
 (13,'Maya Singh','Support Agent',4,11,52000,'2024-01-15'),
 (14,'Noor Haddad','Contractor',NULL,1,65000,'2024-06-03');

CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT,
  department_id INTEGER,
  budget INTEGER,
  lead_id INTEGER
);
INSERT INTO projects VALUES
 (1,'Atlas Rewrite',1,450000,2),
 (2,'Brand Refresh',2,120000,5),
 (3,'Q3 Outreach',3,60000,8),
 (4,'Help Center 2.0',4,90000,11),
 (5,'Mobile App',1,380000,3),
 (6,'Moonshot',NULL,250000,NULL);
`;

DATA.shop = `
PRAGMA foreign_keys = ON;
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  city TEXT,
  joined_on TEXT
);
INSERT INTO customers VALUES
 (1,'Rosa Diaz','rosa@example.com','Denver','2024-01-12'),
 (2,'Omar Farouk','omar@example.com','Austin','2024-02-03'),
 (3,'Lena Vogel','lena@example.com','Denver','2024-03-22'),
 (4,'Tariq Bello','tariq@example.com','Seattle','2024-05-17'),
 (5,'Yuki Sato','yuki@example.com','Austin','2024-07-08'),
 (6,'Priscilla Hart',NULL,'Boston','2024-09-30'),
 (7,'Mateo Cruz','mateo@example.com','Seattle','2024-11-11'),
 (8,'Anya Petrova','anya@example.com','Boston','2025-01-05');

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price REAL CHECK (price >= 0)
);
INSERT INTO products VALUES
 (1,'Pour-Over Kettle','Kitchen',39.00),
 (2,'Ceramic Dripper','Kitchen',24.50),
 (3,'Burr Grinder','Kitchen',129.00),
 (4,'Trail Mug','Outdoor',18.00),
 (5,'Camp Stove','Outdoor',89.99),
 (6,'Wool Socks','Apparel',14.00),
 (7,'Rain Shell','Apparel',149.00),
 (8,'Coffee Beans 1kg','Grocery',32.00),
 (9,'Hammock','Outdoor',59.00);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  ordered_at TEXT,
  status TEXT
);
INSERT INTO orders VALUES
 (1,1,'2025-01-04 09:15:00','delivered'),
 (2,2,'2025-01-19 18:42:00','delivered'),
 (3,1,'2025-02-07 12:03:00','delivered'),
 (4,3,'2025-02-21 08:30:00','returned'),
 (5,4,'2025-03-02 20:11:00','delivered'),
 (6,5,'2025-03-15 14:55:00','delivered'),
 (7,2,'2025-03-28 10:20:00','delivered'),
 (8,6,'2025-04-09 16:45:00','shipped'),
 (9,1,'2025-04-18 07:58:00','shipped'),
 (10,7,'2025-04-26 21:30:00','pending'),
 (11,4,'2025-05-03 11:12:00','pending'),
 (12,3,'2025-05-03 19:40:00','cancelled');

CREATE TABLE order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
INSERT INTO order_items VALUES
 (1,1,1,39.00),(1,8,2,32.00),
 (2,3,1,129.00),
 (3,2,1,24.50),(3,8,1,32.00),
 (4,7,1,149.00),
 (5,5,1,89.99),(5,4,2,18.00),
 (6,6,3,14.00),(6,8,1,32.00),
 (7,1,1,39.00),(7,2,1,24.50),(7,3,1,129.00),
 (8,7,1,149.00),(8,6,2,14.00),
 (9,8,3,32.00),
 (10,5,1,89.99),(10,4,1,18.00),
 (11,6,4,14.00),
 (12,3,1,129.00);
`;
