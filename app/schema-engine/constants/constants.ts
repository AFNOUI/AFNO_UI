export type SchemaTemplateCategory = "simple" | "intermediate" | "advanced" | "complex";

export type SchemaTemplateKind = "ddl" | "json" | "csv";

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  category: SchemaTemplateCategory;
  /** Source kind — drives which input panel tab gets selected when loaded. */
  kind: SchemaTemplateKind;
  /** Raw payload — DDL text, JSON array string, or CSV text. */
  payload: string;
  /** Optional table-name override used when kind !== "ddl". */
  tableName?: string;
  /** Highlights surfaced as chips in the picker. */
  features: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple
// ─────────────────────────────────────────────────────────────────────────────

const T_BLOG_MINI = `CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES authors(id),
  title TEXT NOT NULL,
  body TEXT,
  published_at TIMESTAMP
);`;

const T_TASKS = `CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  done BOOLEAN,
  due_date DATE
);`;

// ─────────────────────────────────────────────────────────────────────────────
// Intermediate
// ─────────────────────────────────────────────────────────────────────────────

const T_ECOMMERCE = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER REFERENCES users(id)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  department_id INTEGER REFERENCES departments(id),
  amount DECIMAL(10,2),
  status TEXT,
  created_at TIMESTAMP
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);`;

const T_BLOG_FULL = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMP
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT,
  status TEXT,
  published_at TIMESTAMP
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMP
);`;

// ─────────────────────────────────────────────────────────────────────────────
// Advanced — junction tables (M:N), composite keys, self-references, indexes
// ─────────────────────────────────────────────────────────────────────────────

const T_MANY_TO_MANY = `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL
);

-- Junction table — composite primary key (student_id, course_id) makes this an M:N relationship
CREATE TABLE enrollments (
  student_id INTEGER NOT NULL REFERENCES students(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMP NOT NULL,
  grade TEXT,
  PRIMARY KEY (student_id, course_id)
);`;

const T_SELF_REF = `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  manager_id INTEGER REFERENCES employees(id),
  hired_at DATE,
  salary DECIMAL(12,2)
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  head_id INTEGER REFERENCES employees(id)
);

CREATE TABLE department_members (
  department_id INTEGER NOT NULL REFERENCES departments(id),
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  role TEXT,
  PRIMARY KEY (department_id, employee_id)
);`;

const T_ONE_TO_ONE = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP
);

-- 1:1 — user_id is BOTH a foreign key AND unique → exactly one profile per user
CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  birthday DATE
);

CREATE TABLE user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  theme TEXT,
  locale TEXT,
  notify_email BOOLEAN
);`;

// ─────────────────────────────────────────────────────────────────────────────
// Complex — multi-domain, larger surface area
// ─────────────────────────────────────────────────────────────────────────────

const T_SAAS = `CREATE TABLE organizations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT,
  created_at TIMESTAMP
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE memberships (
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  invited_by INTEGER REFERENCES users(id),
  joined_at TIMESTAMP,
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  archived BOOLEAN,
  created_at TIMESTAMP
);

CREATE TABLE issues (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  assignee_id INTEGER REFERENCES users(id),
  parent_id INTEGER REFERENCES issues(id),
  title TEXT NOT NULL,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMP,
  closed_at TIMESTAMP
);

CREATE TABLE labels (
  id INTEGER PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE issue_labels (
  issue_id INTEGER NOT NULL REFERENCES issues(id),
  label_id INTEGER NOT NULL REFERENCES labels(id),
  PRIMARY KEY (issue_id, label_id)
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  issue_id INTEGER NOT NULL REFERENCES issues(id),
  author_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMP
);`;

const T_SHOP_FULL = `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE addresses (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postcode TEXT,
  is_default BOOLEAN
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER REFERENCES categories(id),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL
);

CREATE TABLE product_categories (
  product_id INTEGER NOT NULL REFERENCES products(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  shipping_address_id INTEGER REFERENCES addresses(id),
  status TEXT NOT NULL,
  total DECIMAL(12,2),
  placed_at TIMESTAMP
);

CREATE TABLE order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  amount DECIMAL(12,2) NOT NULL,
  method TEXT,
  paid_at TIMESTAMP
);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  rating INTEGER NOT NULL,
  body TEXT,
  created_at TIMESTAMP
);`;

// ─────────────────────────────────────────────────────────────────────────────
// Advanced DDL — financial ledger (double-entry style)
// ─────────────────────────────────────────────────────────────────────────────

const T_LEDGER = `CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id INTEGER REFERENCES accounts(id),
  currency TEXT NOT NULL
);

CREATE TABLE journals (
  id INTEGER PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  posted_at TIMESTAMP NOT NULL,
  memo TEXT
);

CREATE TABLE postings (
  id BIGINT PRIMARY KEY,
  journal_id INTEGER NOT NULL REFERENCES journals(id),
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  debit DECIMAL(18,4),
  credit DECIMAL(18,4),
  description TEXT
);

CREATE TABLE counterparties (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  tax_id TEXT UNIQUE
);

CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  counterparty_id INTEGER NOT NULL REFERENCES counterparties(id),
  journal_id INTEGER REFERENCES journals(id),
  number TEXT UNIQUE NOT NULL,
  issued_at DATE NOT NULL,
  due_at DATE,
  total DECIMAL(18,4) NOT NULL,
  status TEXT NOT NULL
);`;

// ─────────────────────────────────────────────────────────────────────────────
// Advanced DDL — multi-tenant CMS with i18n & audit
// ─────────────────────────────────────────────────────────────────────────────

const T_CMS = `CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE locales (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

CREATE TABLE pages (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  slug TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE page_translations (
  page_id UUID NOT NULL REFERENCES pages(id),
  locale TEXT NOT NULL REFERENCES locales(code),
  title TEXT NOT NULL,
  body TEXT,
  PRIMARY KEY (page_id, locale)
);

CREATE TABLE assets (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  url TEXT NOT NULL,
  mime TEXT,
  bytes BIGINT
);

CREATE TABLE page_assets (
  page_id UUID NOT NULL REFERENCES pages(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  position INTEGER NOT NULL,
  PRIMARY KEY (page_id, asset_id)
);

CREATE TABLE audit_log (
  id BIGINT PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  occurred_at TIMESTAMP NOT NULL
);`;

// ─────────────────────────────────────────────────────────────────────────────
// JSON templates (auto-detected schema)
// ─────────────────────────────────────────────────────────────────────────────

const J_USERS = JSON.stringify([
  { id: 1, email: "ada@example.com", name: "Ada Lovelace", active: true,  joined_at: "2024-01-12T09:00:00Z" },
  { id: 2, email: "linus@example.com", name: "Linus Torvalds", active: true,  joined_at: "2024-02-04T14:30:00Z" },
  { id: 3, email: "grace@example.com", name: "Grace Hopper", active: false, joined_at: "2024-03-22T08:15:00Z" },
], null, 2);

const J_ORDERS = JSON.stringify([
  { id: "550e8400-e29b-41d4-a716-446655440000", user_id: 1, total: 129.95, currency: "USD", status: "paid",     placed_at: "2025-09-12T10:11:00Z" },
  { id: "550e8400-e29b-41d4-a716-446655440001", user_id: 2, total:  42.10, currency: "EUR", status: "shipped",  placed_at: "2025-09-15T16:42:00Z" },
  { id: "550e8400-e29b-41d4-a716-446655440002", user_id: 1, total: 999.00, currency: "USD", status: "refunded", placed_at: "2025-10-02T11:30:00Z" },
], null, 2);

const J_EVENTS = JSON.stringify([
  { id: 1001, type: "page_view", user_id: 1, payload: { path: "/home", referrer: "google" }, ts: "2025-10-12T10:00:00Z" },
  { id: 1002, type: "click",     user_id: 1, payload: { selector: "#cta", x: 120, y: 40 },   ts: "2025-10-12T10:00:18Z" },
  { id: 1003, type: "purchase",  user_id: 2, payload: { sku: "ABC-123", qty: 2, total: 49.5 }, ts: "2025-10-12T10:01:42Z" },
], null, 2);

// Intermediate JSON — products with nested attribute object (collapses to JSON column)
const J_PRODUCTS = JSON.stringify([
  { id: "550e8400-e29b-41d4-a716-446655440100", sku: "ABC-100", name: "Wireless Mouse",       price:  29.99, in_stock: true,  attributes: { color: "black", weight_g: 95 },   created_at: "2025-01-12T08:00:00Z" },
  { id: "550e8400-e29b-41d4-a716-446655440101", sku: "ABC-101", name: "Mechanical Keyboard",  price: 119.00, in_stock: true,  attributes: { layout: "ANSI", backlight: "RGB" }, created_at: "2025-01-13T09:30:00Z" },
  { id: "550e8400-e29b-41d4-a716-446655440102", sku: "DEF-220", name: "USB-C Hub",            price:  34.50, in_stock: false, attributes: { ports: 7, hdmi: true },             created_at: "2025-02-02T13:45:00Z" },
  { id: "550e8400-e29b-41d4-a716-446655440103", sku: "GHI-330", name: "4K Monitor",           price: 449.00, in_stock: true,  attributes: { size_in: 27, panel: "IPS" },        created_at: "2025-02-22T11:10:00Z" },
], null, 2);

// Complex JSON — IoT telemetry with nested device info, mixed nullable fields
const J_TELEMETRY = JSON.stringify([
  { id: 9001, device_id: "DEV-A1", region: "eu-west", reading: 21.4, unit: "C",   battery: 0.92, device: { firmware: "1.4.2", model: "TempSense-Pro" }, recorded_at: "2025-10-20T08:00:00Z" },
  { id: 9002, device_id: "DEV-A2", region: "us-east", reading: 18.7, unit: "C",   battery: 0.81, device: { firmware: "1.4.2", model: "TempSense-Pro" }, recorded_at: "2025-10-20T08:00:05Z" },
  { id: 9003, device_id: "DEV-B7", region: "ap-south", reading: null, unit: null, battery: 0.12, device: { firmware: "0.9.1", model: "FlowMeter-Lite" }, recorded_at: "2025-10-20T08:00:10Z" },
  { id: 9004, device_id: "DEV-C3", region: "eu-west", reading: 1013.25, unit: "hPa", battery: 0.74, device: { firmware: "2.0.0", model: "BaroPro" },     recorded_at: "2025-10-20T08:00:15Z" },
], null, 2);

// ─────────────────────────────────────────────────────────────────────────────
// Multi-table JSON / CSV — same shape as a complex DDL schema, but expressed
// as either an object-of-arrays JSON document or a multi-section CSV blob.
// FK relations are inferred from `<table>_id` column naming after parsing.
// ─────────────────────────────────────────────────────────────────────────────

const J_CMS_MULTI = JSON.stringify({
  tenants: [
    { id: "11111111-1111-1111-1111-111111111111", slug: "acme",   name: "Acme Inc",     created_at: "2025-01-10T09:00:00Z" },
    { id: "22222222-2222-2222-2222-222222222222", slug: "globex", name: "Globex Corp", created_at: "2025-02-04T11:00:00Z" },
  ],
  locales: [
    { code: "en", label: "English" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
  ],
  pages: [
    { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", tenant_id: "11111111-1111-1111-1111-111111111111", slug: "home",    status: "published", created_at: "2025-03-01T08:00:00Z" },
    { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", tenant_id: "11111111-1111-1111-1111-111111111111", slug: "about",   status: "draft",     created_at: "2025-03-02T08:00:00Z" },
    { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", tenant_id: "22222222-2222-2222-2222-222222222222", slug: "pricing", status: "published", created_at: "2025-03-05T08:00:00Z" },
  ],
  page_translations: [
    { page_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", locale: "en", title: "Welcome",   body: "Hello world" },
    { page_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", locale: "fr", title: "Bienvenue", body: "Bonjour" },
    { page_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", locale: "en", title: "Pricing",   body: "Plans" },
  ],
  assets: [
    { id: "dddddddd-dddd-dddd-dddd-dddddddddddd", tenant_id: "11111111-1111-1111-1111-111111111111", url: "https://cdn/x.jpg", mime: "image/jpeg", bytes: 84321 },
    { id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", tenant_id: "22222222-2222-2222-2222-222222222222", url: "https://cdn/y.png", mime: "image/png",  bytes: 12944 },
  ],
  page_assets: [
    { page_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", asset_id: "dddddddd-dddd-dddd-dddd-dddddddddddd", position: 1 },
    { page_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", asset_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", position: 1 },
  ],
  audit_log: [
    { id: 1, tenant_id: "11111111-1111-1111-1111-111111111111", actor: "ada@acme",   action: "page.publish", target_table: "pages",  target_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", occurred_at: "2025-03-10T09:00:00Z" },
    { id: 2, tenant_id: "22222222-2222-2222-2222-222222222222", actor: "ben@globex", action: "asset.upload", target_table: "assets", target_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", occurred_at: "2025-03-12T14:20:00Z" },
  ],
}, null, 2);

const J_SAAS_MULTI = JSON.stringify({
  organizations: [
    { id: 1, name: "Acme",   slug: "acme",   plan: "pro",     created_at: "2025-01-01T08:00:00Z" },
    { id: 2, name: "Globex", slug: "globex", plan: "starter", created_at: "2025-02-15T08:00:00Z" },
  ],
  users: [
    { id: 10, email: "ada@acme.io",    full_name: "Ada Lovelace",  created_at: "2025-01-02T08:00:00Z" },
    { id: 11, email: "ben@acme.io",    full_name: "Ben Franklin",  created_at: "2025-01-03T08:00:00Z" },
    { id: 12, email: "cleo@globex.io", full_name: "Cleo Patra",    created_at: "2025-02-16T08:00:00Z" },
  ],
  memberships: [
    { organization_id: 1, user_id: 10, role: "owner",  joined_at: "2025-01-02T09:00:00Z" },
    { organization_id: 1, user_id: 11, role: "member", joined_at: "2025-01-04T09:00:00Z" },
    { organization_id: 2, user_id: 12, role: "owner",  joined_at: "2025-02-16T09:00:00Z" },
  ],
  projects: [
    { id: 100, organization_id: 1, name: "Website redesign", archived: false, created_at: "2025-03-01T08:00:00Z" },
    { id: 101, organization_id: 1, name: "Mobile app",       archived: false, created_at: "2025-03-05T08:00:00Z" },
    { id: 102, organization_id: 2, name: "Onboarding",       archived: true,  created_at: "2025-02-20T08:00:00Z" },
  ],
  issues: [
    { id: 1000, project_id: 100, reporter_id: 10, assignee_id: 11, title: "Hero broken on mobile", status: "open",   priority: "high",   created_at: "2025-03-10T09:00:00Z" },
    { id: 1001, project_id: 100, reporter_id: 11, assignee_id: 10, title: "Add OG image",          status: "closed", priority: "medium", created_at: "2025-03-11T09:00:00Z" },
    { id: 1002, project_id: 102, reporter_id: 12, assignee_id: 12, title: "Missing welcome email", status: "open",   priority: "low",    created_at: "2025-02-25T09:00:00Z" },
  ],
}, null, 2);

const C_CMS_MULTI = `## tenants
id,slug,name,created_at
11111111-1111-1111-1111-111111111111,acme,Acme Inc,2025-01-10T09:00:00
22222222-2222-2222-2222-222222222222,globex,Globex Corp,2025-02-04T11:00:00

## locales
code,label
en,English
fr,French
es,Spanish

## pages
id,tenant_id,slug,status,created_at
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,11111111-1111-1111-1111-111111111111,home,published,2025-03-01T08:00:00
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb,11111111-1111-1111-1111-111111111111,about,draft,2025-03-02T08:00:00
cccccccc-cccc-cccc-cccc-cccccccccccc,22222222-2222-2222-2222-222222222222,pricing,published,2025-03-05T08:00:00

## page_translations
page_id,locale,title,body
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,en,Welcome,Hello world
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,fr,Bienvenue,Bonjour
cccccccc-cccc-cccc-cccc-cccccccccccc,en,Pricing,Plans

## assets
id,tenant_id,url,mime,bytes
dddddddd-dddd-dddd-dddd-dddddddddddd,11111111-1111-1111-1111-111111111111,https://cdn/x.jpg,image/jpeg,84321
eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee,22222222-2222-2222-2222-222222222222,https://cdn/y.png,image/png,12944

## page_assets
page_id,asset_id,position
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,dddddddd-dddd-dddd-dddd-dddddddddddd,1
cccccccc-cccc-cccc-cccc-cccccccccccc,eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee,1

## audit_log
id,tenant_id,actor,action,target_table,target_id,occurred_at
1,11111111-1111-1111-1111-111111111111,ada@acme,page.publish,pages,aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,2025-03-10T09:00:00
2,22222222-2222-2222-2222-222222222222,ben@globex,asset.upload,assets,eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee,2025-03-12T14:20:00
`;

const C_SHOP_MULTI = `## customers
id,email,full_name,country,created_at
1,ada@example.com,Ada Lovelace,UK,2024-01-12T08:00:00
2,linus@example.com,Linus Torvalds,FI,2024-02-04T09:30:00
3,grace@example.com,Grace Hopper,US,2024-03-22T11:15:00

## products
id,sku,name,price,stock
10,ABC-100,Wireless Mouse,29.99,125
11,ABC-101,Mechanical Keyboard,119.00,42
12,DEF-220,USB-C Hub,34.50,310

## orders
id,customer_id,status,total,placed_at
1000,1,paid,159.98,2024-04-12T10:00:00
1001,2,shipped,29.99,2024-04-13T11:30:00
1002,3,refunded,119.00,2024-04-14T15:45:00

## order_items
order_id,product_id,qty,unit_price
1000,10,2,29.99
1000,11,1,99.00
1001,10,1,29.99
1002,11,1,119.00
`;

// ─────────────────────────────────────────────────────────────────────────────
// CSV templates
// ─────────────────────────────────────────────────────────────────────────────

const C_CUSTOMERS = `id,email,full_name,country,signup_date,lifetime_value
1,ada@example.com,Ada Lovelace,UK,2024-01-12,1290.50
2,linus@example.com,Linus Torvalds,FI,2024-02-04,420.10
3,grace@example.com,Grace Hopper,US,2024-03-22,9990.00
4,alan@example.com,Alan Turing,UK,2024-05-09,310.00`;

const C_INVENTORY = `sku,name,category,price,stock,last_restock
ABC-100,Wireless Mouse,peripherals,29.99,125,2025-09-30
ABC-101,Mechanical Keyboard,peripherals,119.00,42,2025-10-04
DEF-220,USB-C Hub,accessories,34.50,310,2025-10-12
GHI-330,4K Monitor,displays,449.00,18,2025-09-21`;

const C_LOGS = `id,level,message,user_id,timestamp
1,info,User signed in,42,2025-10-12T08:30:11
2,warn,Slow query detected,42,2025-10-12T08:31:05
3,error,Payment gateway timeout,77,2025-10-12T08:32:48
4,info,Background job completed,,2025-10-12T08:33:02`;

// Simple CSV — minimal users export
const C_USERS_MINI = `id,name,email
1,Ada Lovelace,ada@example.com
2,Linus Torvalds,linus@example.com
3,Grace Hopper,grace@example.com`;

// Intermediate CSV — financial transactions with mixed types
const C_TRANSACTIONS = `id,account,amount,currency,type,posted_at
TXN-0001,ACC-100,1250.50,USD,credit,2025-08-01T09:15:00
TXN-0002,ACC-100,-340.00,USD,debit,2025-08-02T11:30:00
TXN-0003,ACC-205,89.99,EUR,credit,2025-08-02T14:45:00
TXN-0004,ACC-100,-1200.00,USD,debit,2025-08-04T08:20:00
TXN-0005,ACC-310,5000.00,GBP,credit,2025-08-05T10:05:00`;

// Advanced CSV — clinical observations with nullable values, ISO dates, decimal precision
const C_OBSERVATIONS = `obs_id,patient_id,metric,value,unit,recorded_at,notes
OBS-1,P-001,heart_rate,72,bpm,2025-09-12T08:00:00,resting
OBS-2,P-001,blood_pressure_sys,118,mmHg,2025-09-12T08:01:00,
OBS-3,P-002,heart_rate,88,bpm,2025-09-12T08:05:00,after exercise
OBS-4,P-002,oxygen_sat,97.5,%,2025-09-12T08:06:00,
OBS-5,P-003,heart_rate,,bpm,2025-09-12T08:10:00,sensor disconnected`;

// Complex CSV — fleet GPS log with high-precision floats and nested-style ids
const C_FLEET = `trip_id,vehicle_id,driver_id,lat,lng,speed_kph,odometer_km,event_at
T-9001,V-12,D-301,52.520008,13.404954,48.5,12450.20,2025-10-22T07:00:00
T-9001,V-12,D-301,52.521144,13.411019,52.0,12450.85,2025-10-22T07:00:30
T-9001,V-12,D-301,52.522301,13.420554,55.7,12451.62,2025-10-22T07:01:00
T-9002,V-15,D-308,48.856613,2.352222,0.0,28910.10,2025-10-22T07:02:00
T-9002,V-15,D-308,48.857101,2.353900,12.4,28910.35,2025-10-22T07:02:30`;

export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  // ── Simple ─────────────────────────────────────────────────────────────
  { id: "blog-mini",   kind: "ddl",  name: "Mini blog (2 tables)",        description: "Authors → Posts. The simplest 1:N example.",                                category: "simple",       features: ["DDL", "1:N", "UNIQUE"],                            payload: T_BLOG_MINI },
  { id: "tasks",       kind: "ddl",  name: "Project tasks",               description: "Projects own many tasks. Booleans, dates, NOT NULL.",                       category: "simple",       features: ["DDL", "1:N", "BOOLEAN"],                            payload: T_TASKS },
  { id: "csv-customers", kind: "csv", tableName: "customers", name: "CSV · Customers",  description: "Single table inferred from a CSV with mixed types.",            category: "simple",       features: ["CSV", "Type inference", "DATE"],                    payload: C_CUSTOMERS },
  { id: "json-users",  kind: "json", tableName: "users",     name: "JSON · Users",      description: "Array of user objects — booleans, timestamps, emails inferred.", category: "simple",       features: ["JSON", "BOOLEAN", "TIMESTAMP"],                     payload: J_USERS },
  { id: "csv-users-mini", kind: "csv", tableName: "users",   name: "CSV · Users (mini)", description: "3-column CSV — the smallest possible inferred schema.",        category: "simple",       features: ["CSV", "Minimal", "Inference"],                      payload: C_USERS_MINI },

  // ── Intermediate ──────────────────────────────────────────────────────
  { id: "ecommerce",   kind: "ddl",  name: "E-commerce starter",          description: "Users, departments, orders, order_items — classic 4-table OLTP.",            category: "intermediate", features: ["DDL", "1:N ×3", "DECIMAL"],                         payload: T_ECOMMERCE },
  { id: "blog-full",   kind: "ddl",  name: "Blog with categories",        description: "Users + categories + posts + comments with multiple FKs per table.",         category: "intermediate", features: ["DDL", "1:N ×4", "UNIQUE slug"],                     payload: T_BLOG_FULL },
  { id: "csv-inventory", kind: "csv", tableName: "inventory", name: "CSV · Inventory",  description: "SKU catalog with price, stock and last-restock date.",          category: "intermediate", features: ["CSV", "DECIMAL", "DATE"],                            payload: C_INVENTORY },
  { id: "json-orders", kind: "json", tableName: "orders",    name: "JSON · Orders",     description: "Orders with UUID ids, currency codes and status enums.",       category: "intermediate", features: ["JSON", "UUID", "DECIMAL"],                          payload: J_ORDERS },
  { id: "json-products", kind: "json", tableName: "products", name: "JSON · Products",  description: "Products with nested attribute objects collapsing to JSON.",   category: "intermediate", features: ["JSON", "Nested → JSON", "UUID"],                    payload: J_PRODUCTS },
  { id: "csv-transactions", kind: "csv", tableName: "transactions", name: "CSV · Transactions", description: "Financial txns with currency, debit/credit, ISO timestamps.", category: "intermediate", features: ["CSV", "DECIMAL", "Enum-like"],                payload: C_TRANSACTIONS },

  // ── Advanced ──────────────────────────────────────────────────────────
  { id: "m2m",         kind: "ddl",  name: "Students ↔ Courses (M:N)",    description: "Junction table with composite primary key — true many-to-many.",             category: "advanced",     features: ["DDL", "M:N", "Composite PK"],                       payload: T_MANY_TO_MANY },
  { id: "self-ref",    kind: "ddl",  name: "Self-referential org chart",  description: "Employees report to other employees (manager_id → employees.id).",           category: "advanced",     features: ["DDL", "Self-ref FK", "Compound PK"],                payload: T_SELF_REF },
  { id: "1-to-1",      kind: "ddl",  name: "1:1 user profile / settings", description: "Profile and settings each share the same PK as users — strict 1:1.",         category: "advanced",     features: ["DDL", "1:1", "PK = FK"],                            payload: T_ONE_TO_ONE },
  { id: "ledger",      kind: "ddl",  name: "Double-entry ledger",         description: "Accounts, journals, postings, counterparties, invoices — accounting core.",  category: "advanced",     features: ["DDL", "5 tables", "Self-ref accounts"],             payload: T_LEDGER },
  { id: "csv-logs",    kind: "csv",  tableName: "app_logs",  name: "CSV · App logs",    description: "Mixed nullable user_id, level enum, ISO timestamps.",          category: "advanced",     features: ["CSV", "Nullable FK", "TIMESTAMP"],                  payload: C_LOGS },
  { id: "json-events", kind: "json", tableName: "events",    name: "JSON · Analytics events", description: "Polymorphic payload column collapses to JSON automatically.", category: "advanced",  features: ["JSON", "JSON column", "Polymorphic"],                payload: J_EVENTS },
  { id: "csv-observations", kind: "csv", tableName: "observations", name: "CSV · Clinical observations", description: "Patient metrics with nullable values and ISO timestamps.", category: "advanced", features: ["CSV", "Nullable", "Decimal"],            payload: C_OBSERVATIONS },

  // ── Complex ───────────────────────────────────────────────────────────
  { id: "saas",        kind: "ddl",  name: "SaaS (orgs / projects / issues)", description: "Multi-tenant SaaS with memberships, sub-issues, labels, comments.",       category: "complex",      features: ["DDL", "8 tables", "Self-ref", "M:N"],               payload: T_SAAS },
  { id: "shop-full",   kind: "ddl",  name: "Full e-commerce shop",        description: "10 tables — customers, addresses, products, categories, orders, payments.", category: "complex",      features: ["DDL", "10 tables", "Tree", "Composite PK"],         payload: T_SHOP_FULL },
  { id: "cms",         kind: "ddl",  name: "Multi-tenant CMS + i18n",     description: "Tenants, pages, translations, assets and an audit log — UUID-based.",         category: "complex",      features: ["DDL", "UUID PK", "i18n M:N", "Audit"],              payload: T_CMS },
  { id: "json-telemetry", kind: "json", tableName: "telemetry", name: "JSON · IoT telemetry", description: "Device readings with nested device info and nullable sensor values.", category: "complex", features: ["JSON", "Nested → JSON", "Nullable"],          payload: J_TELEMETRY },
  { id: "csv-fleet",   kind: "csv",  tableName: "fleet_gps",   name: "CSV · Fleet GPS log", description: "High-precision lat/lng, odometer, multi-trip event stream.",   category: "complex",      features: ["CSV", "FLOAT precision", "Time series"],            payload: C_FLEET },
  { id: "json-cms-multi",  kind: "json", name: "JSON · Multi-tenant CMS (7 tables)", description: "Object-of-arrays JSON modelling the same CMS schema as the DDL template — relations inferred from <table>_id columns.", category: "complex", features: ["JSON", "Multi-table", "FK inference"], payload: J_CMS_MULTI },
  { id: "json-saas-multi", kind: "json", name: "JSON · SaaS workspace (5 tables)",  description: "Organizations, users, memberships, projects, issues — all in one JSON payload.",                                              category: "complex", features: ["JSON", "Multi-table", "Composite PK"], payload: J_SAAS_MULTI },
  { id: "csv-cms-multi",   kind: "csv",  name: "CSV · Multi-tenant CMS (7 tables)", description: "Multi-section CSV split by `## tableName` markers — same shape as the CMS DDL template.",                                    category: "complex", features: ["CSV", "Multi-table", "Sections"],     payload: C_CMS_MULTI },
  { id: "csv-shop-multi",  kind: "csv",  name: "CSV · Shop (4 tables)",             description: "Customers, products, orders, order_items expressed as a multi-section CSV.",                                                  category: "complex", features: ["CSV", "Multi-table", "FK inference"], payload: C_SHOP_MULTI },
];

/** Default sample shown on first load. */
export const SAMPLE_DDL = T_ECOMMERCE;

export const CATEGORY_LABELS: Record<SchemaTemplateCategory, { label: string; hint: string }> = {
  simple:       { label: "Simple",       hint: "2-3 tables — learn the basics across DDL, JSON, CSV." },
  intermediate: { label: "Intermediate", hint: "Multiple 1:N relationships with realistic constraints." },
  advanced:     { label: "Advanced",     hint: "Composite keys, junction tables, self-references, ledgers." },
  complex:      { label: "Complex",      hint: "8-10 table real-world domain models." },
};
