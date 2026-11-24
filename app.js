// AOM CRM — data model sketch v2.1 (Customer/Boat/Motor profiles + Estimate→Archive prefix)
const RATES = { tech: 125, bench: 100, sea: 150 };
const STATUSES = ["Estimate", "Quote", "Service Order", "Invoice", "Archive"];
const WORK_GROUPS = ["Winterize", "Repair", "Service", "Sea Trial", "Clean", "Install", "Diagnose", "Oil Change"];

const FOODS = ["nacho","pizza","taco","burger","sushi","waffle","donut","pretzel","bagel","chili","noodle","ramen","burrito","queso","pickle","olive","bacon","cheese","muffin","pancake"];
const ANIMALS = ["parrot","monkey","penguin","octopus","llama","koala","sloth","otter","fox","wolf","eagle","shark","whale","turtle","crab","lobster","shrimp","squid","pelican","heron"];

const BRANDS = ["LiquiMoly", "Yamaha", "Mercruiser", "Quicksilver", "Sierra", "Sta-Bil", "Mercury", "Honda", "Suzuki", "Tohatsu", "Evinrude", "Johnson", "Generic", "Other"];
const CATEGORIES = ["Motor Oil", "Gear Oil", "Filter", "Additive", "Trim", "Anode", "Impeller", "Fuel", "Hardware", "Electrical", "Lubricant", "Coolant", "Gasket", "Other"];

let jobs = [];
let customers = [];
let boats = [];
let motors = [];
let parts = [];
let currentView = "board";

try {
  jobs = JSON.parse(localStorage.getItem("aom_jobs") || "[]");
  customers = JSON.parse(localStorage.getItem("aom_customers") || "[]");
  boats = JSON.parse(localStorage.getItem("aom_boats") || "[]");
  motors = JSON.parse(localStorage.getItem("aom_motors") || "[]");
  parts = JSON.parse(localStorage.getItem("aom_parts") || "[]");
  let dirty = false;
  jobs.forEach(j => {
    if (!j.jobNumber) {
      j.jobNumber = nextJobNumber();
      dirty = true;
    }
  });
  if (dirty) save();
} catch (e) {
  console.warn("localStorage unavailable, starting fresh", e);
  jobs = [];
  customers = [];
  parts = [];
}

function save() {
  try {
    localStorage.setItem("aom_jobs", JSON.stringify(jobs));
    localStorage.setItem("aom_customers", JSON.stringify(customers));
    localStorage.setItem("aom_boats", JSON.stringify(boats));
    localStorage.setItem("aom_motors", JSON.stringify(motors));
    localStorage.setItem("aom_parts", JSON.stringify(parts));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}

function nextCustomerNumber() {
  const nums = customers.map(c => {
    const m = (c.customerNumber || "").match(/C-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }).filter(n => n > 0);
  const next = nums.length ? Math.max(...nums) + 1 : 10001;
  return "C-" + next;
}

function nextJobNumber() {
  const nums = jobs.map(j => {
    const m = (j.jobNumber || "").match(/J-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }).filter(n => n > 0);
  const next = nums.length ? Math.max(...nums) + 1 : 10001;
  return "J-" + next;
}

function displayPrefix(status) {
  const map = {
    "Estimate": "Estimate",
    "Quote": "Quote",
    "Service Order": "Service Order",
    "Invoice": "Invoice",
    "Archive": "Archive"
  };
  return map[status] || "Estimate";
}

function displayJobNumber(j) {
  const num = (j.jobNumber || "J-10000").replace(/^J-/, "");
  return displayPrefix(j.status) + "-" + num;
}

function findBoat(id) { return boats.find(b => b.id === id); }
function findMotor(id) { return motors.find(m => m.id === id); }

function nextTempSN() {
  const nums = jobs.map(j => {
    const m = (j.sn || "").match(/Temp-SN-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }).filter(n => n > 0);
  const next = nums.length ? Math.max(...nums) + 1 : 10001;
  return "Temp-SN-" + next;
}

function ensureTempSN(job) {
  if (!job.sn || !job.sn.trim()) {
    job.sn = nextTempSN();
  }
  return job.sn;
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function makePunchId(dateStr) {
  const food = FOODS[Math.floor(Math.random() * FOODS.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  let mmdd = "0000";
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d)) mmdd = String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  } else {
    const d = new Date();
    mmdd = String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  }
  return food + animal + mmdd;
}

function seedExamples() {
  const needsJobs = jobs.length === 0;
  const c1 = { id: "c-rivera", customerNumber: "C-10001", name: "Alex Rivera", phone: "410-555-0198", email: "alex.rivera@example.com", address: "123 Harbor Lane, Oxford, MD 21654" };
  const c2 = { id: "c-hale", customerNumber: "C-10002", name: "Jordan Hale", phone: "443-555-0123", email: "jordan.hale@example.com", address: "45 Bayview Drive, Easton, MD 21601" };
  const c3 = { id: "c-carter", customerNumber: "C-10003", name: "Sam Carter", phone: "410-555-0142", email: "sam.carter@example.com", address: "78 Marina Road, Cordova, MD 21625" };
  const c4 = { id: "c-brooks", customerNumber: "C-10004", name: "Taylor Brooks", phone: "410-555-0199", email: "taylor.brooks@example.com", address: "" };
  const c5 = { id: "c-ellis", customerNumber: "C-10005", name: "Morgan Ellis", phone: "410-555-0177", email: "morgan.ellis@example.com", address: "" };
  const c6 = { id: "c-quinn", customerNumber: "C-10006", name: "Riley Quinn", phone: "410-555-0133", email: "riley.quinn@example.com", address: "" };
  customers = [c1, c2, c3, c4, c5, c6];
  parts = [
    { id: "p1", brand: "LiquiMoly", category: "Motor Oil", productName: "10W-40", qtySize: "1.06 Qt (1 L)", sku: "LOM 20506", upc: "4100420205064", description: "Marine 4 Stroke Motor Oil SAE 10W-40", price: 13.99, qtyOnHand: 0 }
  ];
  if (needsJobs) {
    jobs = [{ id: "j-rivera", punchId: "nachoparrot1012", jobNumber: "J-10001", customerId: c1.id, customerName: c1.name, customerNumber: c1.customerNumber, boat: "Scout 185", motor: "Yamaha F115", received: "2026-10-12", status: "Estimate", workGroups: ["Winterize"], labor: [{hours:2,desc:"Winterize"}], services: [], parts: [], created: "2026-10-12T12:00:00Z" }];
    save();
  }
}
if (jobs.length === 0 || customers.length === 0) seedExamples();

function show(view, id) {
  currentView = view;
  setActiveNav(view);
  const app = document.getElementById("app");
  if (view === "home") app.innerHTML = renderHome();
  if (view === "company") app.innerHTML = renderCompany();
  if (view === "archive") app.innerHTML = renderArchive();
  if (view === "board") app.innerHTML = renderBoard();
  if (view === "new") app.innerHTML = renderNew();
  if (view === "job") app.innerHTML = renderJob(id);
  if (view === "customers") app.innerHTML = renderCustomers();
  if (view === "newcustomer") app.innerHTML = renderNewCustomer();
  if (view === "customer") app.innerHTML = renderCustomer(id);
  if (view === "parts") app.innerHTML = renderParts();
  if (view === "part") app.innerHTML = renderPart(id);
  if (view === "newpart") app.innerHTML = renderNewPart();
}

function punchLabel(j) { return displayJobNumber(j) || j.punchId || j.id.slice(-6); }
function jobLabel(j) { return displayJobNumber(j) || "—"; }

function renderHome() {
  const openJobs = jobs.filter(j => j.status !== "Archive");
  return `<div style="padding:1rem"><h2>Home</h2><p>${openJobs.length} open jobs</p><button class="btn" onclick="show('new')">New Estimate</button><button class="btn secondary" onclick="show('board')">Jobs</button></div>`;
}
function renderCompany() { return `<h2>Company</h2><p>American Outboard Motors</p>`; }
function renderArchive() { return `<h2>Archive</h2>`; }
function renderBoard() {
  const cards = jobs.filter(j => j.status !== "Archive").map(j => `<div class="job-card" onclick="show('job','${j.id}')"><strong>${j.customerName}</strong><div>${jobLabel(j)}</div><div>${j.boat||""}</div></div>`).join("");
  return `<div class="jobs-grid">${cards || "No jobs"}</div>`;
}
function renderNewCustomer() { return `<h2>New Customer</h2><form onsubmit="saveNewCustomer(event)"><input name="name" required placeholder="Name"><button class="btn">Save</button></form>`; }
function saveNewCustomer(e) { e.preventDefault(); const fd = new FormData(e.target); const c = {id:uid(), customerNumber:nextCustomerNumber(), name:fd.get("name"), phone:"", email:"", address:""}; customers.push(c); save(); show("customer", c.id); }
function renderCustomers() { return `<h2>Customers</h2>` + customers.map(c => `<div onclick="show('customer','${c.id}')">${c.name}</div>`).join(""); }
function renderCustomer(id) { const c = customers.find(x=>x.id===id); return c ? `<h2>${c.name}</h2>` : show("customers"); }
function renderParts() { return `<h2>Parts</h2>`; }
function renderPart(id) { return `<h2>Part</h2>`; }
function renderNewPart() { return `<h2>New Part</h2>`; }
function saveNewPart(e) { e.preventDefault(); }

function renderNew() {
  return `
  <div class="section" style="max-width:640px;padding:0.5rem">
    <h2>New Estimate</h2>
    <div style="margin-bottom:0.8rem">
      <label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Find existing customer</label>
      <input id="custSearch" oninput="searchCust(this.value)" placeholder="Type name or phone..." style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;font-size:15px">
      <div id="custResults" style="background:#fff;border:1px solid #ddd;border-radius:4px;margin-top:2px;max-height:160px;overflow:auto"></div>
    </div>
    <form onsubmit="saveNewJob(event)" style="display:flex;flex-direction:column;gap:0.75rem">
      <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.2rem">Customer Name *</label><input name="name" required style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;font-size:15px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem">
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.2rem">Phone</label><input name="phone" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px"></div>
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.2rem">Email</label><input name="email" type="email" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem">
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.2rem">Boat</label><input name="boat" placeholder="Scout 185" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px"></div>
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.2rem">Motor</label><input name="motor" placeholder="Yamaha F115" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px"></div>
      </div>
      <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.2rem">Notes</label><textarea name="complaint" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;min-height:70px"></textarea></div>
      <div style="display:flex;gap:0.5rem;margin-top:0.4rem">
        <button class="btn" type="submit">Create Estimate</button>
        <button class="btn secondary" type="button" onclick="show('board')">Cancel</button>
      </div>
    </form>
  </div>`;
}

function searchCust(q) {
  const box = document.getElementById("custResults");
  if (!q || q.length < 1) { box.innerHTML = ""; return; }
  const matches = customers.filter(c => (c.name + " " + (c.phone||"") + " " + (c.customerNumber||"")).toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  box.innerHTML = matches.map(c => `<div style="padding:0.45rem 0.6rem;cursor:pointer;border-bottom:1px solid #eee" onclick="pickCust('${c.id}')">${c.name} <span style="color:#666;font-size:12px">${c.phone||""}</span></div>`).join("") || `<div style="padding:0.45rem;color:#666">No matches — fill the form below to create new</div>`;
}

function pickCust(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;
  const form = document.querySelector("form");
  if (form) {
    form.querySelector("[name=name]").value = c.name || "";
    form.querySelector("[name=phone]").value = c.phone || "";
    form.querySelector("[name=email]").value = c.email || "";
  }
  document.getElementById("custResults").innerHTML = "";
  document.getElementById("custSearch").value = c.name;
}

function saveNewJob(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get("name") || "Unknown";
  let existing = customers.find(c => (c.name||"").toLowerCase() === name.toLowerCase());
  let customerId, customerNumber;
  if (existing) {
    customerId = existing.id;
    customerNumber = existing.customerNumber;
  } else {
    const c = { id: uid(), customerNumber: nextCustomerNumber(), name, phone: fd.get("phone")||"", email: fd.get("email")||"", address: "" };
    customers.push(c);
    customerId = c.id;
    customerNumber = c.customerNumber;
  }
  const j = {
    id: uid(),
    punchId: makePunchId(),
    jobNumber: nextJobNumber(),
    customerId,
    customerName: name,
    customerNumber,
    boat: fd.get("boat") || "",
    motor: fd.get("motor") || "",
    received: new Date().toISOString().slice(0,10),
    status: "Estimate",
    workGroups: [],
    labor: [],
    services: [],
    parts: [],
    notes: fd.get("complaint") || "",
    created: new Date().toISOString()
  };
  jobs.push(j);
  save();
  show("job", j.id);
}

function renderJob(id) {
  const j = jobs.find(x => x.id === id);
  if (!j) return show("board");
  return `<h2>${j.customerName} — ${jobLabel(j)}</h2><p>${j.boat||""} · ${j.motor||""}</p><p>Status: ${j.status}</p><button class="btn" onclick="show('board')">Back</button>`;
}
function updateStatus(jid, status) { const j = jobs.find(x=>x.id===jid); if(j){ j.status=status; save(); show("job",jid); } }
function setActiveNav(view) {
  document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
  const map = { home: "nav-home", company: "nav-company", board: "nav-board", archive: "nav-archive" };
  const id = map[view]; if (id) document.getElementById(id)?.classList.add("active");
}
function toggleAddMenu() { const m = document.getElementById("addMenu"); m.style.display = m.style.display === "none" ? "block" : "none"; }
function exportData() { const blob = new Blob([JSON.stringify({jobs,customers,boats,motors,parts},null,2)], {type:"application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "aom-crm-export.json"; a.click(); }
function resetSeed() { if (confirm("Reset all data to seed?")) { localStorage.clear(); location.reload(); } }
setTimeout(() => { if (document.getElementById("app")) show("home"); }, 200);
