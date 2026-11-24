const RATES = { tech: 125, bench: 100, sea: 150 };
const STATUSES = ["Needs Approval", "Needs Parts", "Needs Scheduled", "Active", "Needs Invoiced", "Done, Waiting Payment", "Done, Needs Picked Up", "Done, Archived"];
const WORK_GROUPS = ["Winterize", "Repair", "Service", "Sea Trial", "Clean", "Install", "Diagnose", "Oil Change"];

const FOODS = ["nacho","pizza","taco","burger","sushi","waffle","donut","pretzel","bagel","chili","noodle","ramen","burrito","queso","pickle","olive","bacon","cheese","muffin","pancake"];
const ANIMALS = ["parrot","monkey","penguin","octopus","llama","koala","sloth","otter","fox","wolf","eagle","shark","whale","turtle","crab","lobster","shrimp","squid","pelican","heron"];

const BRANDS = ["LiquiMoly", "Yamaha", "Mercruiser", "Quicksilver", "Sierra", "Sta-Bil", "Mercury", "Honda", "Suzuki", "Tohatsu", "Evinrude", "Johnson", "Generic", "Other"];
const CATEGORIES = ["Motor Oil", "Gear Oil", "Filter", "Additive", "Trim", "Anode", "Impeller", "Fuel", "Hardware", "Electrical", "Lubricant", "Coolant", "Gasket", "Other"];

let jobs = [];
let customers = [];
let parts = [];
let currentView = "board";

try {
  jobs = JSON.parse(localStorage.getItem("aom_jobs") || "[]");
  customers = JSON.parse(localStorage.getItem("aom_customers") || "[]");
  parts = JSON.parse(localStorage.getItem("aom_parts") || "[]");
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
      customerId: c1.id,
      customerName: c1.name,
      customerNumber: c1.customerNumber,
      boat: "Scout 185",
      motor: "Yamaha F115",
      year: "",
      sn: "",
      family: "",
      received: "2026-10-12",
      status: "Needs Approval",
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
      customerId: c2.id,
      customerName: c2.name,
      customerNumber: c2.customerNumber,
      boat: "Searay",
      motor: "Mercruiser 4.3L",
      year: "July 2008",
      sn: "1A330575",
      family: "8M9XM04.32VC",
      received: "2026-10-22",
      status: "Needs Parts",
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
      customerId: "c-carter",
      customerName: "Sam Carter",
      customerNumber: "C-10003",
      boat: "Pathfinder 2300",
      motor: "Yamaha 300",
      received: "2026-11-14",
      status: "Needs Scheduled",
      workGroups: ["Service", "Oil Change"],
      labor: [{ hours: 2, desc: "Oil change" }],
      services: [],
      parts: [],
      created: "2026-11-14T10:00:00Z"
    },
    {
      id: "j-brooks",
      punchId: "tacofox1118",
      customerId: "c-brooks",
      customerName: "Taylor Brooks",
      customerNumber: "C-10004",
      boat: "Boston Whaler 170",
      motor: "Mercury 115",
      received: "2026-11-10",
      status: "Active - Jeremy 9am",
      workGroups: ["Diagnose", "Repair", "Sea Trial"],
      labor: [{ hours: 4, desc: "Lower unit" }],
      services: [],
      parts: [],
      created: "2026-11-10T09:00:00Z"
    },
    {
      id: "j-ellis",
      punchId: "burgerllama1105",
      customerId: "c-ellis",
      customerName: "Morgan Ellis",
      customerNumber: "C-10005",
      boat: "Sea Hunt 21",
      motor: "Suzuki 150",
      received: "2026-11-05",
      status: "Needs Invoiced",
      workGroups: ["Service"],
      labor: [{ hours: 3, desc: "Annual service" }],
      services: [],
      parts: [],
      created: "2026-11-05T14:00:00Z"
    },
    {
      id: "j-quinn",
      punchId: "donutwhale1028",
      customerId: "c-quinn",
      customerName: "Riley Quinn",
      customerNumber: "C-10006",
      boat: "Contender 25",
      motor: "Yamaha 300",
      received: "2026-10-28",
      status: "Done, Waiting Payment",
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
  // ... rest of original file content truncated for this example, but in real call it would be full
}