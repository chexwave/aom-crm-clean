// AOM CRM v2.2 — restored full UI + Estimate→Archive prefixes + boats/motors storage
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
  // Backfill job numbers for any jobs that don't have one
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
  const s = status || "";
  if (s.includes("Estimate") || s.includes("Needs Approval")) return "Estimate";
  if (s.includes("Quote") || s.includes("Needs Parts")) return "Quote";
  if (s.includes("Service Order") || s.includes("Needs Scheduled") || s.includes("Active")) return "Service Order";
  if (s.includes("Invoice") || s.includes("Needs Invoiced") || s.includes("Waiting Payment")) return "Invoice";
  if (s.includes("Archive")) return "Archive";
  return "Estimate";
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
    { id: "p1", brand: "LiquiMoly", category: "Motor Oil", productName: "10W-40", qtySize: "1.06 Qt (1 L)", sku: "LOM 20506", upc: "4100420205064", description: "Marine 4 Stroke Motor Oil SAE 10W-40", price: 13.99, qtyOnHand: 0 },
    { id: "p2", brand: "Yamaha", category: "Filter", productName: "Fuel Filter", qtySize: "1", sku: "18-7844", upc: "", description: "Fuel filter (Sierra)", price: 0, qtyOnHand: 0 },
    { id: "p3", brand: "Generic", category: "Gear Oil", productName: "80W-90", qtySize: "1 qt", sku: "", upc: "", description: "Gear Oil 80w-90", price: 0, qtyOnHand: 0 },
    { id: "p4", brand: "Generic", category: "Motor Oil", productName: "10W-40", qtySize: "1 qt", sku: "", upc: "", description: "Motor Oil 10w-40", price: 0, qtyOnHand: 0 },
    { id: "p5", brand: "Sta-Bil", category: "Additive", productName: "Stabil", qtySize: "10 oz", sku: "", upc: "", description: "Fuel Stabilizer", price: 0, qtyOnHand: 0 },
    { id: "p6", brand: "Mercruiser", category: "Trim", productName: "Trim Hose", qtySize: "1", sku: "182116", upc: "", description: "Trim Hose", price: 0, qtyOnHand: 0 },
    { id: "p7", brand: "Mercruiser", category: "Anode", productName: "Zinc Kit", qtySize: "Alpha-One Gen II", sku: "", upc: "", description: "Alpha-One Gen II Zinc Kit", price: 0, qtyOnHand: 0 },
    { id: "p8", brand: "Generic", category: "Impeller", productName: "Water Pump Kit", qtySize: "1", sku: "", upc: "", description: "Water pump kit", price: 0, qtyOnHand: 0 },
    { id: "p9", brand: "LiquiMoly", category: "Motor Oil", productName: "10W-30", qtySize: "1.06 Qt (1 L)", sku: "LOM 20520", upc: "4100420205200", description: "Marine 4 Stroke Motor Oil SAE 10W-30", price: 14.99, qtyOnHand: 0 },
    { id: "p10", brand: "Quicksilver", category: "Motor Oil", productName: "25W-40", qtySize: "1 qt", sku: "", upc: "", description: "Premium Plus 25W-40", price: 0, qtyOnHand: 0 },
    { id: "p11", brand: "Sierra", category: "Filter", productName: "Oil Filter", qtySize: "1", sku: "18-7902", upc: "", description: "Oil filter (Yamaha/Merc common)", price: 0, qtyOnHand: 0 },
    { id: "p12", brand: "Sierra", category: "Filter", productName: "Fuel Filter", qtySize: "1", sku: "18-79809", upc: "808282277413", description: "27 micron fuel filter Yamaha F150+", price: 0, qtyOnHand: 0 },
    { id: "p13", brand: "NGK", category: "Electrical", productName: "Spark Plug", qtySize: "DCPR6E", sku: "", upc: "", description: "Common outboard plug", price: 0, qtyOnHand: 0 },
    { id: "p14", brand: "Generic", category: "Anode", productName: "Zinc Anode", qtySize: "1", sku: "", upc: "", description: "Sacrificial zinc", price: 0, qtyOnHand: 0 },
    { id: "p15", brand: "Sea Foam", category: "Additive", productName: "Motor Treatment", qtySize: "16 oz", sku: "", upc: "", description: "Fuel system cleaner", price: 0, qtyOnHand: 0 },
    { id: "p16", brand: "Sierra", category: "Impeller", productName: "Water Pump Impeller", qtySize: "Yamaha common", sku: "18-3071", upc: "", description: "Impeller for Yamaha V4/V6", price: 0, qtyOnHand: 0 },
    { id: "p17", brand: "LiquiMoly", category: "Gear Oil", productName: "85W-90", qtySize: "1.06 Qt (1 L)", sku: "LOM 20536", upc: "", description: "Marine High Performance Gear Oil SAE 85W-90", price: 19.99, qtyOnHand: 0 },
    { id: "p18", brand: "LiquiMoly", category: "Gear Oil", productName: "75W-90", qtySize: "1.06 Qt (1 L)", sku: "LOM 20538", upc: "", description: "Marine Fully Synthetic Gear Oil GL4/GL5 SAE 75W-90", price: 32.97, qtyOnHand: 0 },
    { id: "p19", brand: "LiquiMoly", category: "Motor Oil", productName: "25W-40", qtySize: "1.06 Qt (1 L)", sku: "LOM 20546", upc: "", description: "Marine 4 Stroke Motor Oil SAE 25W-40 Synthetic Blend", price: 15.49, qtyOnHand: 0 },
    { id: "p20", brand: "LiquiMoly", category: "Motor Oil", productName: "PWC 10W-40", qtySize: "1.06 Qt (1 L)", sku: "LOM 20528", upc: "", description: "Marine PWC Oil SAE 10W-40", price: 15.99, qtyOnHand: 0 }
  ];

  if (needsJobs) {
  jobs = [
    {
      id: "j-rivera",
      punchId: "nachoparrot1012",
      jobNumber: "J-10001",
      customerId: c1.id,
      customerName: c1.name,
      customerNumber: c1.customerNumber,
      boat: "Scout 185",
      motor: "Yamaha F115",
      year: "",
      sn: "",
      family: "",
      received: "2026-10-12",
      status: "Estimate",
      workGroups: ["Winterize", "Service"],
      labor: [
        { hours: 2, desc: "Winterize Labor" },
        { hours: 1, desc: "Snap Labor" },
        { hours: 3, desc: "Electronic Labor" }
      ],
      services: [],
      parts: [
        { qty: 1, desc: "18-7844 fuel filter", price: 0 },
        { qty: 1, desc: "Gear Oil 80w-90 (qt)", price: 0 },
        { qty: 4, desc: "Motor Oil 10w-40 (qt)", price: 0 },
        { qty: 1, desc: "Stabil 10oz", price: 0 },
        { qty: 13, desc: "Cover Snaps (Female-10 Male-3)", price: 0 },
        { qty: 1, desc: "Echomap 54cv & GT20", price: 0 }
      ],
      created: "2026-10-12T12:00:00Z"
    },
    {
      id: "j-hale",
      punchId: "pizzamonkey1022",
      jobNumber: "J-10002",
      customerId: c2.id,
      customerName: c2.name,
      customerNumber: c2.customerNumber,
      boat: "Searay",
      motor: "Mercruiser 4.3L",
      year: "July 2008",
      sn: "1A330575",
      family: "8M9XM04.32VC",
      received: "2026-10-22",
      status: "Quote",
      workGroups: ["Repair", "Winterize"],
      labor: [
        { hours: 4, desc: "winterize" },
        { hours: 3, desc: "ram" },
        { hours: 2, desc: "water pump" }
      ],
      services: [
        { amount: 125, desc: "haul out" },
        { amount: 10, desc: "2 Gal Oil Disposal ($5/gal)" }
      ],
      parts: [
        { qty: 2, desc: "Gear oil (qt change)", price: 0 },
        { qty: 5, desc: "Engine oil 25w-40 (qt change)", price: 0 },
        { qty: 1, desc: "Oil filter", price: 0 },
        { qty: 1, desc: "Water separator filter", price: 0 },
        { qty: 3, desc: "Antifreeze (Gallon)", price: 0 },
        { qty: 2, desc: "Trim Hose 182116", price: 0 },
        { qty: 1, desc: "182114 & 182115", price: 0 },
        { qty: 2, desc: "Trim Cylinder", price: 0 },
        { qty: 1, desc: "Water pump kit", price: 0 },
        { qty: 1, desc: "Trim Fluid 1qt", price: 0 },
        { qty: 1, desc: "Alpha-One Gen II Zinc Kit", price: 0 },
        { qty: 1, desc: "Stabil 1 bottle", price: 0 },
        { qty: 1, desc: "Fogging Oil 1 can", price: 0 },
        { qty: 1, desc: "Miscellaneous", price: 0 }
      ],
      created: "2026-10-22T12:00:00Z"
    },
    {
      id: "j-carter",
      punchId: "waffleotter1114",
      jobNumber: "J-10003",
      customerId: "c-carter",
      customerName: "Sam Carter",
      customerNumber: "C-10003",
      boat: "Pathfinder 2300",
      motor: "Yamaha 300",
      received: "2026-11-14",
      status: "Service Order",
      workGroups: ["Service", "Oil Change"],
      labor: [{ hours: 2, desc: "Oil change" }],
      services: [],
      parts: [],
      created: "2026-11-14T10:00:00Z"
    },
    {
      id: "j-brooks",
      punchId: "tacofox1118",
      jobNumber: "J-10004",
      customerId: "c-brooks",
      customerName: "Taylor Brooks",
      customerNumber: "C-10004",
      boat: "Boston Whaler 170",
      motor: "Mercury 115",
      received: "2026-11-10",
      status: "Service Order",
      workGroups: ["Diagnose", "Repair", "Sea Trial"],
      labor: [{ hours: 4, desc: "Lower unit" }],
      services: [],
      parts: [],
      created: "2026-11-10T09:00:00Z"
    },
    {
      id: "j-ellis",
      punchId: "burgerllama1105",
      jobNumber: "J-10005",
      customerId: "c-ellis",
      customerName: "Morgan Ellis",
      customerNumber: "C-10005",
      boat: "Sea Hunt 21",
      motor: "Suzuki 150",
      received: "2026-11-05",
      status: "Invoice",
      workGroups: ["Service"],
      labor: [{ hours: 3, desc: "Annual service" }],
      services: [],
      parts: [],
      created: "2026-11-05T14:00:00Z"
    },
    {
      id: "j-quinn",
      punchId: "donutwhale1028",
      jobNumber: "J-10006",
      customerId: "c-quinn",
      customerName: "Riley Quinn",
      customerNumber: "C-10006",
      boat: "Contender 25",
      motor: "Yamaha 300",
      received: "2026-10-28",
      status: "Invoice",
      workGroups: ["Install", "Sea Trial"],
      labor: [{ hours: 5, desc: "Full service" }],
      services: [],
      parts: [],
      created: "2026-10-28T11:00:00Z"
    }
  ];
  save();

  // Merge master catalog into existing parts (by sku or brand+productName)
  const master = [
    { id: "p1", brand: "LiquiMoly", category: "Motor Oil", productName: "10W-40", qtySize: "1.06 Qt (1 L)", sku: "LOM 20506", upc: "4100420205064", description: "Marine 4 Stroke Motor Oil SAE 10W-40", price: 13.99, qtyOnHand: 0 },
    { id: "p2", brand: "Yamaha", category: "Filter", productName: "Fuel Filter", qtySize: "1", sku: "18-7844", upc: "", description: "Fuel filter (Sierra)", price: 0, qtyOnHand: 0 },
    { id: "p3", brand: "Generic", category: "Gear Oil", productName: "80W-90", qtySize: "1 qt", sku: "", upc: "", description: "Gear Oil 80w-90", price: 0, qtyOnHand: 0 },
    { id: "p4", brand: "Generic", category: "Motor Oil", productName: "10W-40", qtySize: "1 qt", sku: "", upc: "", description: "Motor Oil 10w-40", price: 0, qtyOnHand: 0 },
    { id: "p5", brand: "Sta-Bil", category: "Additive", productName: "Stabil", qtySize: "10 oz", sku: "", upc: "", description: "Fuel Stabilizer", price: 0, qtyOnHand: 0 },
    { id: "p6", brand: "Mercruiser", category: "Trim", productName: "Trim Hose", qtySize: "1", sku: "182116", upc: "", description: "Trim Hose", price: 0, qtyOnHand: 0 },
    { id: "p7", brand: "Mercruiser", category: "Anode", productName: "Zinc Kit", qtySize: "Alpha-One Gen II", sku: "", upc: "", description: "Alpha-One Gen II Zinc Kit", price: 0, qtyOnHand: 0 },
    { id: "p8", brand: "Generic", category: "Impeller", productName: "Water Pump Kit", qtySize: "1", sku: "", upc: "", description: "Water pump kit", price: 0, qtyOnHand: 0 },
    { id: "p9", brand: "LiquiMoly", category: "Motor Oil", productName: "10W-30", qtySize: "1.06 Qt (1 L)", sku: "LOM 20520", upc: "4100420205200", description: "Marine 4 Stroke Motor Oil SAE 10W-30", price: 14.99, qtyOnHand: 0 },
    { id: "p10", brand: "Quicksilver", category: "Motor Oil", productName: "25W-40", qtySize: "1 qt", sku: "", upc: "", description: "Premium Plus 25W-40", price: 0, qtyOnHand: 0 },
    { id: "p11", brand: "Sierra", category: "Filter", productName: "Oil Filter", qtySize: "1", sku: "18-7902", upc: "", description: "Oil filter (Yamaha/Merc common)", price: 0, qtyOnHand: 0 },
    { id: "p12", brand: "Sierra", category: "Filter", productName: "Fuel Filter", qtySize: "1", sku: "18-79809", upc: "808282277413", description: "27 micron fuel filter Yamaha F150+", price: 0, qtyOnHand: 0 },
    { id: "p13", brand: "NGK", category: "Electrical", productName: "Spark Plug", qtySize: "DCPR6E", sku: "", upc: "", description: "Common outboard plug", price: 0, qtyOnHand: 0 },
    { id: "p14", brand: "Generic", category: "Anode", productName: "Zinc Anode", qtySize: "1", sku: "", upc: "", description: "Sacrificial zinc", price: 0, qtyOnHand: 0 },
    { id: "p15", brand: "Sea Foam", category: "Additive", productName: "Motor Treatment", qtySize: "16 oz", sku: "", upc: "", description: "Fuel system cleaner", price: 0, qtyOnHand: 0 },
    { id: "p16", brand: "Sierra", category: "Impeller", productName: "Water Pump Impeller", qtySize: "Yamaha common", sku: "18-3071", upc: "", description: "Impeller for Yamaha V4/V6", price: 0, qtyOnHand: 0 },
    { id: "p17", brand: "LiquiMoly", category: "Gear Oil", productName: "85W-90", qtySize: "1.06 Qt (1 L)", sku: "LOM 20536", upc: "", description: "Marine High Performance Gear Oil SAE 85W-90", price: 19.99, qtyOnHand: 0 },
    { id: "p18", brand: "LiquiMoly", category: "Gear Oil", productName: "75W-90", qtySize: "1.06 Qt (1 L)", sku: "LOM 20538", upc: "", description: "Marine Fully Synthetic Gear Oil GL4/GL5 SAE 75W-90", price: 32.97, qtyOnHand: 0 },
    { id: "p19", brand: "LiquiMoly", category: "Motor Oil", productName: "25W-40", qtySize: "1.06 Qt (1 L)", sku: "LOM 20546", upc: "", description: "Marine 4 Stroke Motor Oil SAE 25W-40 Synthetic Blend", price: 15.49, qtyOnHand: 0 },
    { id: "p20", brand: "LiquiMoly", category: "Motor Oil", productName: "PWC 10W-40", qtySize: "1.06 Qt (1 L)", sku: "LOM 20528", upc: "", description: "Marine PWC Oil SAE 10W-40", price: 15.99, qtyOnHand: 0 }
  ];
  master.forEach(m => {
    const existing = parts.find(p => (p.sku && p.sku === m.sku) || (p.brand === m.brand && p.productName === m.productName));
    if (!existing) parts.push(m);
  });
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

function punchLabel(j) {
  return displayJobNumber(j) || j.punchId || j.id.slice(-6);
}

function jobLabel(j) {
  return displayJobNumber(j) || "—";
}


function renderHome() {
  const openJobs = jobs.filter(j => !(j.status || "").startsWith("Done, Archived") && j.status !== "Archive");
  const needsApproval = openJobs.filter(j => (j.status || "").includes("Estimate") || (j.status || "").includes("Needs Approval")).length;
  const needsParts = openJobs.filter(j => (j.status || "").includes("Quote") || (j.status || "").includes("Needs Parts")).length;
  const needsScheduled = openJobs.filter(j => (j.status || "").includes("Service Order") || (j.status || "").includes("Needs Scheduled")).length;
  const active = openJobs.filter(j => (j.status || "").includes("Active") || (j.status || "").includes("Service Order")).length;
  const homeGroups = new Map();
  openJobs.forEach(j => {
    const key = (j.customerName || j.customerId || "unknown").toString().trim().toLowerCase();
    if (!homeGroups.has(key)) homeGroups.set(key, []);
    homeGroups.get(key).push(j);
  });

  function homeBadgeColor(status) {
    status = status || "";
    if (status.includes("Estimate") || status.includes("Needs Approval") || status.includes("Active")) return "#bf0a30";
    if (status.includes("Quote") || status.includes("Needs Parts")) return "#c17d00";
    if (status.includes("Service Order") || status.includes("Needs Scheduled")) return "#1a5fbf";
    return "#002868";
  }

  const recentHtml = Array.from(homeGroups.entries()).slice(0, 6).map(([key, list]) => {
    if (list.length === 1) {
      const j = list[0];
      const status = j.status || "Estimate";
      const color = homeBadgeColor(status);
      return `<div onclick="show('job','${j.id}')" style="background:#fff;border-left:4px solid ${color};border-radius:6px;padding:0.55rem 0.7rem;margin-bottom:0.4rem;cursor:pointer;box-shadow:0 1px 3px rgba(0,40,104,0.08)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem">
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:0.95rem">${j.customerName || "—"} <span style="font-size:11px;color:#002868;font-weight:700">${jobLabel(j)}</span></div>
            <div style="font-size:12px;color:#444;margin-top:0.1rem">${j.boat || "No boat"} · ${j.motor || ""}</div>
          </div>
          <span class="status-pill" style="background:${color};font-size:10px">${status}</span>
        </div>
      </div>`;
    }
    const name = list[0].customerName || "Unknown";
    const gid = "hg-" + Math.random().toString(36).slice(2, 8);
    const nested = list.map(j => {
      const status = j.status || "Estimate";
      const color = homeBadgeColor(status);
      return `<div onclick="event.stopPropagation(); show('job','${j.id}')" style="border-left:4px solid ${color};padding:0.4rem 0.55rem;margin:0.15rem 0;background:#fafafa;border-radius:4px;cursor:pointer">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.4rem">
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:700;color:#002868">${jobLabel(j)}</div>
            <div style="font-size:11px;color:#555">${j.boat || ""} · ${j.motor || ""}</div>
          </div>
          <span class="status-pill" style="background:${color};font-size:9px">${status}</span>
        </div>
      </div>`;
    }).join("");
    const nums = list.map(j => jobLabel(j)).slice(0, 3).join(" · ") + (list.length > 3 ? "…" : "");
    return `<div style="background:#fff;border-radius:6px;margin-bottom:0.4rem;box-shadow:0 1px 3px rgba(0,40,104,0.08);overflow:hidden">
      <div onclick="const el=document.getElementById('${gid}'); el.style.display=el.style.display==='none'?'block':'none'" style="padding:0.5rem 0.7rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:800">${name} <span style="font-size:11px;color:#002868">${list.length} jobs</span></div>
          <div style="font-size:11px;color:#555;margin-top:0.1rem">${nums}</div>
        </div>
        <span style="font-size:12px;color:#002868">▼</span>
      </div>
      <div id="${gid}" style="display:none;padding:0 0.5rem 0.4rem">${nested}</div>
    </div>`;
  }).join("") || "<p style='color:#666'>No open jobs.</p>";

  return `
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.5rem;margin-bottom:1rem">
    <div class="stat"><div class="stat-num">${needsApproval}</div><div class="stat-label">Estimates</div></div>
    <div class="stat"><div class="stat-num">${needsParts}</div><div class="stat-label">Quotes</div></div>
    <div class="stat"><div class="stat-num">${needsScheduled}</div><div class="stat-label">Service Orders</div></div>
    <div class="stat"><div class="stat-num">${active}</div><div class="stat-label">Active</div></div>
  </div>
  <h2 style="margin:0 0 0.5rem;font-size:1rem;color:#002868">Recent</h2>
  ${recentHtml}
  `;
}

function renderCompany() {
  const info = JSON.parse(localStorage.getItem("aom_company") || '{}');
  return `
  <h2>Company</h2>
  <div class="card">
    <div><strong>American Outboard Motors</strong></div>
    <div>12611 Ocean Gateway, Cordova, MD 21625</div>
    <div>Phone: ${info.phone || "410-822-8556"}</div>
    <div>Email: ${info.email || "americanoutboard@gmail.com"}</div>
  </div>
  <div style="margin-top:1rem">
    <button class="btn" onclick="editCompany()">Edit Company Info</button>
  </div>
  <div style="margin-top:1.5rem;font-size:13px;color:#666">
    <div>Employees (placeholder)</div>
    <div>Timesheets (placeholder)</div>
  </div>
  `;
}

function editCompany() {
  const phone = prompt("Phone", "410-822-8556") || "";
  const email = prompt("Email", "americanoutboard@gmail.com") || "";
  localStorage.setItem("aom_company", JSON.stringify({phone, email}));
  show("company");
}

function renderArchive() {
  const archivedJobs = jobs.filter(j => (j.status || "").includes("Archive") || (j.status || "").includes("Archived"));
  const jobRows = archivedJobs.map(j => `<tr onclick="show('job','${j.id}')" style="cursor:pointer"><td>${jobLabel(j)}</td><td>${j.customerName || "—"}</td><td>${j.boat || ""}</td><td>${j.status || ""}</td></tr>`).join("") || `<tr><td colspan="4" style="color:#666">No archived jobs yet.</td></tr>`;
  return `
  <h2>Archive</h2>
  <table>
    <thead><tr><th>Job</th><th>Customer</th><th>Boat</th><th>Status</th></tr></thead>
    <tbody>${jobRows}</tbody>
  </table>
  `;
}

function renderBoard() {
  const q = (document.getElementById("quickSearch")?.value || "").toLowerCase();
  const statusFilter = window._statusFilter || "";
  let list = jobs.filter(j => {
    if ((j.status || "").includes("Archive") || (j.status || "").includes("Archived")) return false;
    if (statusFilter && !(j.status || "").includes(statusFilter)) return false;
    if (q) {
      const hay = [j.customerName, j.boat, j.motor, j.jobNumber, displayJobNumber(j)].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const groups = new Map();
  list.forEach(j => {
    const key = (j.customerName || "unknown").toString().trim().toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(j);
  });

  function renderSingleCard(j) {
    const status = j.status || "Estimate";
    const color = status.includes("Estimate") ? "#bf0a30" : status.includes("Quote") ? "#c17d00" : status.includes("Service") ? "#1a5fbf" : "#002868";
    return `<div class="job-card" onclick="show('job','${j.id}')" style="border-left:4px solid ${color}">
      <div style="font-weight:800">${j.customerName || "—"}</div>
      <div style="font-size:11px;font-weight:700;color:#002868;margin-top:0.05rem;letter-spacing:0.3px">${jobLabel(j)}</div>
      <div style="font-size:12px;color:#444;margin-top:0.15rem">${j.boat || ""} · ${j.motor || ""}</div>
      <span class="status-pill" style="background:${color};margin-top:0.3rem;font-size:10px">${status}</span>
    </div>`;
  }

  function renderGroup(customerKey, list) {
    const name = list[0].customerName || "Unknown";
    const gid = "g-" + Math.random().toString(36).slice(2, 8);
    const nested = list.map(j => {
      const status = j.status || "Estimate";
      const color = status.includes("Estimate") ? "#bf0a30" : status.includes("Quote") ? "#c17d00" : "#1a5fbf";
      return `<div onclick="event.stopPropagation(); show('job','${j.id}')" style="border-left:3px solid ${color};padding:0.35rem 0.5rem;margin:0.2rem 0;background:#fafafa;border-radius:4px;cursor:pointer">
        <div style="font-size:11px;font-weight:700;color:#002868;letter-spacing:0.3px">${jobLabel(j)}</div>
        <div style="font-size:11px;color:#555">${j.boat || ""} · ${status}</div>
      </div>`;
    }).join("");
    return `<div class="job-card" style="padding:0">
      <div onclick="const el=document.getElementById('${gid}'); el.style.display=el.style.display==='none'?'block':'none'" style="padding:0.55rem 0.7rem;cursor:pointer">
        <div style="font-weight:800">${name} <span style="font-size:11px;color:#002868">${list.length}</span></div>
        <div style="font-size:10px;font-weight:700;color:#002868;margin-top:0.1rem;letter-spacing:0.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${list.map(j => jobLabel(j)).slice(0, 3).join(" · ")}${list.length > 3 ? "…" : ""}</div>
      </div>
      <div id="${gid}" style="display:none;padding:0 0.5rem 0.4rem">${nested}</div>
    </div>`;
  }

  const cards = Array.from(groups.entries()).map(([k, list]) => list.length === 1 ? renderSingleCard(list[0]) : renderGroup(k, list)).join("") || "<p style='color:#666;grid-column:1/-1'>No matching jobs.</p>";

  const chips = ["", ...STATUSES].map(s => `<button class="chip ${statusFilter===s?'active':''}" onclick="window._statusFilter='${s}';show('board')">${s || "All"}</button>`).join("");

  return `
  <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.6rem">${chips}</div>
  <div class="jobs-grid">${cards}</div>
  `;
}

function renderNewCustomer() {
  return `
  <h2>New Customer</h2>
  <form onsubmit="saveNewCustomer(event)">
    <div class="field"><label>Name</label><input name="name" required></div>
    <div class="field"><label>Phone</label><input name="phone"></div>
    <div class="field"><label>Email</label><input name="email" type="email"></div>
    <div class="field"><label>Address</label><input name="address"></div>
    <button class="btn" type="submit">Save Customer</button>
  </form>
  `;
}

function saveNewCustomer(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const c = {
    id: uid(),
    customerNumber: nextCustomerNumber(),
    name: fd.get("name"),
    phone: fd.get("phone") || "",
    email: fd.get("email") || "",
    address: fd.get("address") || ""
  };
  customers.push(c);
  save();
  show("customer", c.id);
}

function renderCustomers() {
  const q = (document.getElementById("custSearch")?.value || "").toLowerCase();
  const list = customers.filter(c => !q || [c.name, c.phone, c.email, c.customerNumber].join(" ").toLowerCase().includes(q));
  const rows = list.map(c => `<tr onclick="show('customer','${c.id}')" style="cursor:pointer">
    <td>${c.customerNumber || ""}</td>
    <td>${c.name || ""}</td>
    <td>${c.phone || ""}</td>
    <td>${c.email || ""}</td>
  </tr>`).join("") || "<tr><td colspan='4'>No customers.</td></tr>";
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
    <h2 style="margin:0">Customers</h2>
    <button class="btn" onclick="show('newcustomer')">+ New</button>
  </div>
  <input id="custSearch" placeholder="Search customers" oninput="show('customers')" style="width:100%;margin-bottom:0.5rem">
  <table>
    <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Email</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  `;
}

function renderCustomer(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return show("customers");
  const jobsFor = jobs.filter(j => j.customerId === id || (j.customerName || "").toLowerCase() === (c.name || "").toLowerCase());
  return `
  <h2>${c.name} <span class="id-badge">${c.customerNumber || ""}</span></h2>
  <div class="meta">${c.phone || ""} · ${c.email || ""}</div>
  <div class="meta">${c.address || ""}</div>
  <h3 style="margin-top:1rem">Jobs</h3>
  ${jobsFor.map(j => `<div onclick="show('job','${j.id}')" style="padding:0.4rem;border-bottom:1px solid #eee;cursor:pointer">${jobLabel(j)} · ${j.boat || ""} · ${j.status}</div>`).join("") || "<p>No jobs.</p>"}
  `;
}

function renderParts() {
  const q = (document.getElementById("partSearch")?.value || "").toLowerCase();
  const list = parts.filter(p => !q || [p.brand, p.productName, p.sku, p.description].join(" ").toLowerCase().includes(q));
  const rows = list.map(p => `<tr onclick="show('part','${p.id}')" style="cursor:pointer">
    <td>${p.brand || ""}</td>
    <td>${p.productName || ""}</td>
    <td>${p.sku || ""}</td>
    <td>$${p.price || 0}</td>
  </tr>`).join("") || "<tr><td colspan='4'>No parts.</td></tr>";
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
    <h2 style="margin:0">Parts</h2>
    <button class="btn" onclick="show('newpart')">+ New</button>
  </div>
  <input id="partSearch" placeholder="Search parts" oninput="show('parts')" style="width:100%;margin-bottom:0.5rem">
  <table>
    <thead><tr><th>Brand</th><th>Name</th><th>SKU</th><th>Price</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  `;
}

function renderPart(id) {
  const p = parts.find(x => x.id === id);
  if (!p) return show("parts");
  return `
  <h2>${p.productName || "Part"}</h2>
  <div class="meta">${p.brand || ""} · ${p.sku || ""}</div>
  <div>${p.description || ""}</div>
  <div style="margin-top:0.5rem">Price: $${p.price || 0}</div>
  `;
}

function renderNewPart() {
  return `
  <h2>New Part</h2>
  <form onsubmit="saveNewPart(event)">
    <div class="field"><label>Brand</label><input name="brand"></div>
    <div class="field"><label>Product Name</label><input name="productName" required></div>
    <div class="field"><label>SKU</label><input name="sku"></div>
    <div class="field"><label>Price</label><input name="price" type="number" step="0.01"></div>
    <div class="field"><label>Description</label><input name="description"></div>
    <button class="btn" type="submit">Save Part</button>
  </form>
  `;
}

function saveNewPart(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const p = {
    id: uid(),
    brand: fd.get("brand") || "",
    productName: fd.get("productName"),
    sku: fd.get("sku") || "",
    price: parseFloat(fd.get("price")) || 0,
    description: fd.get("description") || ""
  };
  parts.push(p);
  save();
  show("part", p.id);
}

function renderNew() {
  return `
  <div class="section">
    <h2>New Estimate</h2>
    <div class="search-box">
      <label>Find existing customer</label>
      <input id="custSearch" oninput="searchCust(this.value)" placeholder="Type name or phone...">
      <div id="custResults"></div>
    </div>
    <form onsubmit="createQuote(event)">
      <div class="form-grid">
        <div><label>Customer Name *</label><input name="name" required></div>
        <div><label>Phone</label><input name="phone"></div>
        <div><label>Email</label><input name="email"></div>
        <div><label>Boat</label><input name="boat" placeholder="Scout 185"></div>
        <div><label>Motor</label><input name="motor" placeholder="Yamaha F115"></div>
      </div>

      <div style="margin:1rem 0">
        <label style="font-weight:700;color:#002868">Labor</label>
        <div id="quote-labor"></div>
        <button type="button" class="btn secondary" onclick="addQuoteLabor()" style="margin-top:0.4rem">+ Add Labor</button>
      </div>

      <div style="margin:1rem 0">
        <label style="font-weight:700;color:#002868">Parts</label>
        <div id="quote-parts"></div>
        <button type="button" class="btn secondary" onclick="addQuotePart()" style="margin-top:0.4rem">+ Add Part</button>
      </div>

      <div style="margin:0.8rem 0">
        <label>Work Groups</label>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.3rem">
          ${WORK_GROUPS.map(g => `<label style="font-weight:600;font-size:13px"><input type="checkbox" name="workGroups" value="${g}"> ${g}</label>`).join("")}
        </div>
      </div>
      <div style="margin:0.6rem 0">
        <label>Note</label>
        <textarea name="note" placeholder="Boat is in the driveway with a blue cover..." style="width:100%;min-height:60px"></textarea>
      </div>
      <button class="btn" type="submit">Finish Estimate</button>
      <button class="btn secondary" type="button" onclick="show('board')">Cancel</button>
    </form>
  </div>`;
}

function addQuoteLabor() {
  const div = document.getElementById("quote-labor");
  const row = document.createElement("div");
  row.className = "line";
  row.style.marginBottom = "0.4rem";
  row.style.position = "relative";
  const id = "labor-" + Date.now();
  row.innerHTML = `
    <input name="laborHours" type="number" step="0.5" placeholder="Hrs" style="width:70px">
    <input id="${id}" name="laborDesc" placeholder="Description (e.g. Oil change)" style="flex:1">
    <button type="button" class="btn secondary" onclick="this.parentElement.remove()" style="padding:0.2rem 0.4rem">×</button>
  `;
  div.appendChild(row);
}

function addQuotePart() {
  const div = document.getElementById("quote-parts");
  const row = document.createElement("div");
  row.className = "line parts";
  row.style.marginBottom = "0.4rem";
  row.style.position = "relative";
  const id = "part-" + Date.now();
  row.innerHTML = `
    <input name="partQty" type="number" step="1" value="1" style="width:60px">
    <input id="${id}" name="partDesc" placeholder="Search or type part" oninput="searchPart(this)" style="flex:1">
    <div id="${id}-results" style="position:absolute;top:100%;left:0;right:0;background:#fff;border:2px solid #002868;border-radius:4px;z-index:10;display:none;max-height:180px;overflow-y:auto"></div>
    <input name="partPrice" type="number" step="0.01" placeholder="Price" style="width:80px">
    <button type="button" class="btn secondary" onclick="this.parentElement.remove()" style="padding:0.2rem 0.4rem">×</button>
  `;
  div.appendChild(row);
}

function searchPart(input) {
  const q = input.value.toLowerCase().trim();
  const box = document.getElementById(input.id + "-results");
  if (!q || q.length < 1) { box.style.display = "none"; return; }
  const matches = parts.filter(p => 
    (p.brand + " " + p.productName + " " + p.sku + " " + (p.description||"")).toLowerCase().includes(q)
  ).slice(0, 8);
  if (!matches.length) { box.style.display = "none"; return; }
  box.innerHTML = matches.map(p => `
    <div style="padding:0.3rem 0.45rem;cursor:pointer;border-bottom:1px solid #eee;font-size:13px;line-height:1.3" 
      onclick="pickPart('${input.id}', '${(p.brand + " " + p.productName).replace(/'/g,"\\'")}', ${p.price || 0})">
      <strong>${p.brand} ${p.productName}</strong> · ${p.sku || ""} 
      <span style="float:right;color:#002868;font-weight:700">$${(p.price||0).toFixed(2)}</span>
    </div>`).join("");
  box.style.display = "block";
}

function pickPart(inputId, desc, price) {
  const input = document.getElementById(inputId);
  input.value = desc;
  const priceInput = input.parentElement.querySelector("[name=partPrice]");
  if (priceInput && price) priceInput.value = price;
  document.getElementById(inputId + "-results").style.display = "none";
}

function createQuote(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const custId = uid();
  const customer = {
    id: custId,
    customerNumber: nextCustomerNumber(),
    name: f.get("name"),
    phone: f.get("phone"),
    email: f.get("email")
  };
  customers.push(customer);

  const workGroups = f.getAll("workGroups");

  const labor = [];
  const hours = f.getAll("laborHours");
  const ldescs = f.getAll("laborDesc");
  hours.forEach((h, i) => {
    if (h && ldescs[i]) labor.push({ hours: parseFloat(h) || 0, desc: ldescs[i] });
  });

  const partsLines = [];
  const qtys = f.getAll("partQty");
  const pdescs = f.getAll("partDesc");
  const prices = f.getAll("partPrice");
  qtys.forEach((q, i) => {
    if (pdescs[i]) partsLines.push({ qty: parseFloat(q) || 1, desc: pdescs[i], price: parseFloat(prices[i]) || 0 });
  });

  const job = {
    id: uid(),
    jobNumber: nextJobNumber(),
    punchId: makePunchId(),
    customerId: custId,
    customerName: customer.name,
    customerNumber: customer.customerNumber,
    boat: f.get("boat") || "",
    motor: f.get("motor") || "",
    received: new Date().toISOString().slice(0,10),
    status: "Estimate",
    workGroups,
    labor,
    services: [],
    parts: partsLines,
    notes: f.get("note") || "",
    created: new Date().toISOString()
  };
  jobs.push(job);
  save();
  show("job", job.id);
}

function searchCust(q) {
  const box = document.getElementById("custResults");
  if (!q || q.length < 1) { box.innerHTML = ""; return; }
  const matches = customers.filter(c => (c.name + " " + (c.phone||"") + " " + (c.customerNumber||"")).toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  box.innerHTML = matches.map(c => `<div style="padding:0.35rem 0.5rem;cursor:pointer;border-bottom:1px solid #eee" onclick="pickCust('${c.id}')">${c.name} <span style="color:#666">${c.phone||""}</span></div>`).join("") || "<div style='padding:0.3rem;color:#666'>No matches — fill form below to create new</div>";
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

function renderJob(id) {
  const j = jobs.find(x => x.id === id);
  if (!j) return show("board");
  const laborTotal = (j.labor || []).reduce((s,l) => s + (parseFloat(l.hours)||0) * RATES.tech, 0);
  const serviceTotal = (j.services || []).reduce((s,l) => s + (parseFloat(l.qty)||1) * (parseFloat(l.amount)||0), 0);
  const partsTotal = (j.parts || []).reduce((s,l) => s + (parseFloat(l.qty)||0) * (parseFloat(l.price)||0), 0);
  const grand = laborTotal + serviceTotal + partsTotal;
  const pid = punchLabel(j);

  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem">
    <h2 style="margin:0;font-size:1.1rem;color:#002868">${j.customerName} — ${j.boat || "Job"} <span class="id-badge">${pid}</span></h2>
    <div>
      <select onchange="updateStatus('${j.id}', this.value)" style="font-size:13px">
        ${STATUSES.map(s => `<option ${s===j.status?"selected":""}>${s}</option>`).join("")}
      </select>
      <button class="btn secondary" onclick="show('board')">← Board</button>
    </div>
  </div>
  <div class="meta" style="margin-bottom:0.5rem">Cust # ${j.customerNumber || "—"} · Received: ${j.received || "—"} · Motor: ${j.motor || "—"} · SN: ${j.sn || "—"} · Family: ${j.family || "—"}</div>

  <div class="sections-grid">
    <div class="section">
      <h2>Labor</h2>
      <div id="labor-lines">${(j.labor||[]).map((l,i) => lineLabor(j.id, i, l)).join("")}</div>
      <button class="btn secondary" onclick="addLine('${j.id}','labor')">+ Labor</button>
      <div class="total">$${laborTotal.toFixed(2)}</div>
    </div>

    <div class="section">
      <h2>Services</h2>
      <div id="service-lines">${(j.services||[]).map((l,i) => lineService(j.id, i, l)).join("")}</div>
      <button class="btn secondary" onclick="addLine('${j.id}','services')">+ Service</button>
      <div class="total">$${serviceTotal.toFixed(2)}</div>
    </div>

    <div class="section">
      <h2>Parts</h2>
      <div style="margin-bottom:0.4rem;position:relative">
        <input id="partPick-${j.id}" placeholder="Search catalog" oninput="filterParts('${j.id}', this.value)" style="width:100%">
        <div id="partResults-${j.id}" style="position:absolute;background:#fff;border:1px solid #ccc;max-height:160px;overflow:auto;width:100%;z-index:10;display:none"></div>
      </div>
      <div id="parts-lines">${(j.parts||[]).map((l,i) => lineParts(j.id, i, l)).join("")}</div>
      <button class="btn secondary" onclick="addLine('${j.id}','parts')">+ Part</button>
      <div class="total">$${partsTotal.toFixed(2)}</div>
    </div>
  </div>

  <div class="grand">Grand Total: $${grand.toFixed(2)}</div>
  `;
}

function updateStatus(jid, status) {
  const j = jobs.find(x => x.id === jid);
  if (j) {
    j.status = status;
    save();
    show("job", jid);
  }
}

function lineLabor(jid, i, l) {
  return `<div class="line">
    <input type="number" step="0.5" value="${l.hours||""}" placeholder="hrs" onchange="updateLine('${jid}','labor',${i},'hours',this.value)">
    <input value="${l.desc||""}" placeholder="Description" onchange="updateLine('${jid}','labor',${i},'desc',this.value)">
    <span style="font-size:12px;font-weight:700">$${((l.hours||0)*RATES.tech).toFixed(2)}</span>
    <button class="btn secondary" style="padding:0.2rem 0.3rem" onclick="removeLine('${jid}','labor',${i})">×</button>
  </div>`;
}
function lineService(jid, i, l) {
  const amt = (parseFloat(l.amount) || 0).toFixed(2);
  return `<div class="line services">
    <input type="number" step="1" value="${l.qty||"1"}" placeholder="qty" onchange="updateLine('${jid}','services',${i},'qty',this.value)">
    <input value="${l.desc||""}" placeholder="Description" onchange="updateLine('${jid}','services',${i},'desc',this.value)">
    <div style="display:flex;align-items:center;gap:2px">
      <span style="font-size:12px;font-weight:700;color:#002868">$</span>
      <input type="number" step="0.01" value="${amt}" onchange="updateLine('${jid}','services',${i},'amount',this.value)" style="width:100%">
    </div>
    <button class="btn secondary" style="padding:0.2rem 0.3rem" onclick="removeLine('${jid}','services',${i})">×</button>
  </div>`;
}
function lineParts(jid, i, l) {
  const price = (parseFloat(l.price) || 0).toFixed(2);
  return `<div class="line parts">
    <input type="number" step="1" value="${l.qty||""}" placeholder="qty" onchange="updateLine('${jid}','parts',${i},'qty',this.value)">
    <input value="${l.desc||""}" placeholder="desc" onchange="updateLine('${jid}','parts',${i},'desc',this.value)">
    <div style="display:flex;align-items:center;gap:2px">
      <span style="font-size:12px;font-weight:700;color:#002868">$</span>
      <input type="number" step="0.01" value="${price}" onchange="updateLine('${jid}','parts',${i},'price',this.value)" style="width:100%">
    </div>
    <button class="btn secondary" style="padding:0.2rem 0.3rem" onclick="removeLine('${jid}','parts',${i})">×</button>
  </div>`;
}

function addLine(jid, type) {
  const j = jobs.find(x => x.id === jid);
  if (!j[type]) j[type] = [];
  j[type].push(type === "labor" ? {hours:1, desc:""} : type === "services" ? {qty:1, amount:0, desc:""} : {qty:1, desc:"", price:0});
  save(); show("job", jid);
}
function updateLine(jid, type, i, field, val) {
  const j = jobs.find(x => x.id === jid);
  j[type][i][field] = val;
  save(); show("job", jid);
}
function removeLine(jid, type, i) {
  const j = jobs.find(x => x.id === jid);
  j[type].splice(i,1);
  save(); show("job", jid);
}

function filterParts(jid, q) {
  const box = document.getElementById("partResults-" + jid);
  if (!q || q.length < 2) { box.style.display = "none"; return; }
  const matches = parts.filter(p => [p.brand, p.productName, p.sku, p.description].join(" ").toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  box.innerHTML = matches.map(p => `<div style="padding:0.3rem 0.5rem;cursor:pointer;border-bottom:1px solid #eee" onclick="addCatalogPart('${jid}','${p.id}')">${p.brand || ""} ${p.productName || ""} <span style="color:#666">${p.sku || ""}</span></div>`).join("") || "<div style='padding:0.3rem;color:#666'>No matches</div>";
  box.style.display = "block";
}

function addCatalogPart(jid, pid) {
  const p = parts.find(x => x.id === pid);
  if (!p) return;
  const j = jobs.find(x => x.id === jid);
  if (!j.parts) j.parts = [];
  j.parts.push({ qty: 1, desc: (p.sku ? p.sku + " " : "") + (p.productName || p.description || ""), price: p.price || 0 });
  save();
  show("job", jid);
}

function setActiveNav(view) {
  document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
  const map = { home: "nav-home", company: "nav-company", board: "nav-board", archive: "nav-archive" };
  const id = map[view];
  if (id) document.getElementById(id)?.classList.add("active");
}

function toggleAddMenu() {
  const m = document.getElementById("addMenu");
  m.style.display = m.style.display === "none" ? "block" : "none";
}

function exportData() {
  const blob = new Blob([JSON.stringify({jobs, customers, boats, motors, parts}, null, 2)], {type: "application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "aom-crm-export.json";
  a.click();
}

function resetSeed() {
  if (confirm("Reset all data to seed?")) {
    localStorage.clear();
    location.reload();
  }
}

// Startup
setTimeout(() => {
  if (document.getElementById("app")) {
    show("home");
  } else {
    document.body.innerHTML = "<p>App failed to load. Try hard refresh or reload.</p><button class=\"btn\" onclick=\"resetSeed()\">Reset Seed</button>";
  }
}, 400);
