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
  const c1 = { id: "c-rivera", name: "Alex Rivera", phone: "410-555-0198", email: "alex.rivera@example.com", address: "123 Harbor Lane, Oxford, MD 21654" };
  const c2 = { id: "c-hale", name: "Jordan Hale", phone: "443-555-0123", email: "jordan.hale@example.com", address: "45 Bayview Drive, Easton, MD 21601" };
  const c3 = { id: "c-carter", name: "Sam Carter", phone: "410-555-0142", email: "sam.carter@example.com", address: "78 Marina Road, Cordova, MD 21625" };
  const c4 = { id: "c-brooks", name: "Taylor Brooks", phone: "410-555-0199", email: "taylor.brooks@example.com", address: "" };
  const c5 = { id: "c-ellis", name: "Morgan Ellis", phone: "410-555-0177", email: "morgan.ellis@example.com", address: "" };
  const c6 = { id: "c-quinn", name: "Riley Quinn", phone: "410-555-0133", email: "riley.quinn@example.com", address: "" };
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
  master.forEach(m => {
    const existing = parts.find(p => p.sku && p.sku === m.sku);
    if (!existing) {
      parts.push(m);
    } else if (!existing.price || existing.price === 0) {
      Object.assign(existing, m);
    }
  });
  save();
  }
}

function mergeCatalog() {
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
  let added = 0;
  master.forEach(m => {
    const existing = parts.find(p => (p.sku && p.sku === m.sku) || (p.brand === m.brand && p.productName === m.productName && p.qtySize === m.qtySize));
    if (!existing) {
      parts.push({...m, id: m.id || ("p" + Date.now() + Math.random().toString(36).slice(2,4))});
      added++;
    } else if ((!existing.price || existing.price == 0) && m.price) {
      Object.assign(existing, {price: m.price, upc: m.upc || existing.upc, sku: m.sku || existing.sku, description: m.description || existing.description});
    }
  });
  if (added) save();
}

function resetSeed() {
  if (confirm("Clear everything and reload the two example jobs + sample parts?")) {
    localStorage.removeItem("aom_jobs");
    localStorage.removeItem("aom_customers");
    localStorage.removeItem("aom_parts");
    jobs = [];
    customers = [];
    parts = [];
    seedExamples();
    show("board");
  }
}

// Always ensure seed jobs exist for demo
if (!jobs.length) {
  seedExamples();
}
try { mergeCatalog(); } catch(e) { console.warn("mergeCatalog skipped", e); }

// Force the board to appear
try {
  show("board");
} catch (e) {
  document.getElementById("app").innerHTML = `<div class="section"><h2>Board failed to load</h2><p>${e.message}</p><button class="btn" onclick="location.reload()">Reload</button></div>`;
}

function setActiveNav(view) {
  ["board","new","customers","parts"].forEach(v => {
    const el = document.getElementById("nav-" + v);
    if (el) el.classList.toggle("active", view === v);
  });
}

function show(view, id) {
  currentView = view;
  setActiveNav(view);
  const app = document.getElementById("app");
  if (view === "board") app.innerHTML = renderBoard();
  if (view === "new") app.innerHTML = renderNew();
  if (view === "job") app.innerHTML = renderJob(id);
  if (view === "customers") app.innerHTML = renderCustomers();
  if (view === "customer") app.innerHTML = renderCustomer(id);
  if (view === "parts") app.innerHTML = renderParts();
  if (view === "part") app.innerHTML = renderPart(id);
  if (view === "newpart") app.innerHTML = renderNewPart();
}

function punchLabel(j) {
  return j.punchId || j.id.slice(-6);
}

function renderBoard() {
  if (!jobs.length) return `<div class="section"><h2>No open jobs yet</h2><p>Hit + New Quote to start one.</p></div>`;

  const openJobs = jobs.filter(j => !j.status.startsWith("Done, Archived"));
  const needsApproval = openJobs.filter(j => j.status.includes("Needs Approval")).length;
  const needsParts = openJobs.filter(j => j.status.includes("Needs Parts")).length;
  const needsScheduled = openJobs.filter(j => j.status.includes("Needs Scheduled")).length;
  const active = openJobs.filter(j => j.status.includes("Active")).length;
  const needsInvoice = openJobs.filter(j => j.status.includes("Needs Invoiced")).length;

  return `
  <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-start">
    <div style="flex:1;min-width:280px">
      <h2 style="margin:0 0 0.5rem;color:#002868;font-size:1.4rem;font-weight:800">Open Jobs</h2>
      <div class="filter-chips" style="margin-bottom:0.6rem">
        <button onclick="filterByStatusChip('')" class="active" data-filter="">All</button>
        <button onclick="filterByStatusChip('Needs Approval')" data-filter="Needs Approval">Needs Approval</button>
        <button onclick="filterByStatusChip('Needs Parts')" data-filter="Needs Parts">Needs Parts</button>
        <button onclick="filterByStatusChip('Needs Scheduled')" data-filter="Needs Scheduled">Needs Scheduled</button>
        <button onclick="filterByStatusChip('Active')" data-filter="Active">Active</button>
        <button onclick="filterByStatusChip('Needs Invoiced')" data-filter="Needs Invoiced">Needs Invoiced</button>
      </div>
      <input id="quickSearch" placeholder="Search jobs, customers, boats..." oninput="filterBoard(this.value)" style="width:100%;font-size:15px;padding:0.55rem;margin-bottom:0.8rem;border:2px solid #002868;border-radius:6px">
      <div id="jobList">${openJobs.map(j => {
        const status = j.status || "Needs Approval";
        let badgeColor = "#002868";
        if (status.includes("Needs Approval")) badgeColor = "#bf0a30";
        else if (status.includes("Needs Parts")) badgeColor = "#c17d00";
        else if (status.includes("Needs Scheduled")) badgeColor = "#1a5fbf";
        else if (status.includes("Active")) badgeColor = "#bf0a30";
        else if (status.includes("Needs Invoiced")) badgeColor = "#002868";
        else if (status.startsWith("Done")) badgeColor = "#555";

        return `<div class="job-row" data-search="${(j.customerName+' '+j.boat+' '+j.motor+' '+status+' '+(j.workGroups||[]).join(' ')).toLowerCase()}" onclick="show('job','${j.id}')" style="border-left-color:${badgeColor}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem">
            <div style="flex:1;min-width:0">
              <div style="font-weight:800;font-size:1.05rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.customerName || "—"}</div>
              <div style="font-size:13px;color:#444;margin-top:0.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.boat || "No boat"} · ${j.motor || ""}</div>
              ${j.workGroups && j.workGroups.length ? `<div style="margin-top:0.2rem;font-size:12px;font-weight:700;color:#002868;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.workGroups.join(" · ")}</div>` : ""}
            </div>
            <span class="status-pill" style="background:${badgeColor};flex-shrink:0">${status}</span>
          </div>
        </div>`;
      }).join("")}</div>
    </div>

    <div style="width:200px;flex-shrink:0">
      <div style="background:#fff;border:2px solid #002868;border-radius:8px;padding:0.5rem;margin-bottom:0.4rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#002868">${openJobs.length}</div>
        <div style="font-weight:700;font-size:13px;color:#002868">Open Jobs</div>
      </div>
      <div style="background:#fff;border:2px solid #bf0a30;border-radius:8px;padding:0.5rem;margin-bottom:0.4rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#bf0a30">${needsApproval}</div>
        <div style="font-weight:700;font-size:13px;color:#bf0a30">Needs Approval</div>
      </div>
      <div style="background:#fff;border:2px solid #c17d00;border-radius:8px;padding:0.5rem;margin-bottom:0.4rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#c17d00">${needsParts}</div>
        <div style="font-weight:700;font-size:13px;color:#c17d00">Needs Parts</div>
      </div>
      <div style="background:#fff;border:2px solid #1a5fbf;border-radius:8px;padding:0.5rem;margin-bottom:0.4rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#1a5fbf">${needsScheduled}</div>
        <div style="font-weight:700;font-size:13px;color:#1a5fbf">Needs Scheduled</div>
      </div>
      <div style="background:#fff;border:2px solid #bf0a30;border-radius:8px;padding:0.5rem;margin-bottom:0.4rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#bf0a30">${active}</div>
        <div style="font-weight:700;font-size:13px;color:#bf0a30">Active Today</div>
      </div>
      <div style="background:#002868;color:#fff;border-radius:8px;padding:0.55rem">
        <div style="font-weight:800;margin-bottom:0.35rem;font-size:13px">Quick Actions</div>
        <div style="display:flex;flex-direction:column;gap:0.25rem">
          <button class="btn" style="background:#fff;color:#002868;border:none;text-align:left;padding:0.3rem 0.5rem;font-size:12px" onclick="show('customers')">Customers</button>
          <button class="btn" style="background:#fff;color:#002868;border:none;text-align:left;padding:0.3rem 0.5rem;font-size:12px" onclick="show('new')">New Quote</button>
          <button class="btn" style="background:#fff;color:#002868;border:none;text-align:left;padding:0.3rem 0.5rem;font-size:12px" onclick="show('parts')">Parts</button>
        </div>
      </div>
    </div>
  </div>`;
}

function filterByStatusChip(status) {
  document.querySelectorAll(".filter-chips button").forEach(btn => btn.classList.remove("active"));
  const target = document.querySelector(`.filter-chips button[data-filter="${status}"]`);
  if (target) target.classList.add("active");
  document.querySelectorAll("#jobList .job-row").forEach(row => {
    const rowStatus = row.querySelector(".status-pill")?.textContent || "";
    row.style.display = (!status || rowStatus.includes(status)) ? "" : "none";
  });
}

function filterBoard(q) {
  const term = q.toLowerCase();
  document.querySelectorAll("#jobList .job-row").forEach(row => {
    row.style.display = row.dataset.search.includes(term) ? "" : "none";
  });
}

function filterByStatus(status) {
  document.querySelectorAll(".filter-chips button").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  document.querySelectorAll("#jobBoard .job-card").forEach(card => {
    card.style.display = (!status || card.dataset.status === status) ? "" : "none";
  });
}

function filterBoard(q) {
  const term = q.toLowerCase();
  document.querySelectorAll("#jobBoard .job-card").forEach(card => {
    const match = card.dataset.search.includes(term);
    card.style.display = match ? "" : "none";
  });
}

function renderCustomers() {
  if (!customers.length) return `<div class="section"><h2>No customers yet</h2><p>Create a job to add one.</p></div>`;
  return `
  <div style="margin-bottom:0.5rem">
    <input id="custQuickSearch" placeholder="Search customers..." oninput="filterCustomers(this.value)" style="width:100%;max-width:400px">
  </div>
  <div class="board" id="custBoard">${customers.map(c => {
    const jobCount = jobs.filter(j => j.customerId === c.id).length;
    return `<div class="cust-card" data-search="${(c.name+' '+c.phone+' '+c.email+' '+c.address).toLowerCase()}" onclick="show('customer','${c.id}')">
      <h3>${c.name || "—"}</h3>
      <div>${c.phone || "no phone"}</div>
      <div class="meta">${c.email || ""}</div>
      <div class="meta">${jobCount} job${jobCount!==1?"s":""}</div>
    </div>`;
  }).join("")}</div>`;
}

function filterCustomers(q) {
  const term = q.toLowerCase();
  document.querySelectorAll("#custBoard .cust-card").forEach(card => {
    card.style.display = card.dataset.search.includes(term) ? "" : "none";
  });
}

function renderCustomer(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return show("customers");
  const relatedJobs = jobs.filter(j => j.customerId === c.id);
  const boats = [];
  const seen = new Set();
  relatedJobs.forEach(j => {
    const key = `${j.boat||""}|${j.motor||""}|${j.year||""}|${j.sn||""}`;
    if (!seen.has(key) && (j.boat || j.motor)) {
      seen.add(key);
      boats.push({ boat: j.boat, motor: j.motor, year: j.year, sn: j.sn, family: j.family, received: j.received });
    }
  });

  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem">
    <h2 style="margin:0;font-size:1.1rem;color:#002868">${c.name}</h2>
    <button class="btn secondary" onclick="show('customers')">← Customers</button>
  </div>

  <div class="section">
    <h2>Contact</h2>
    <div class="form-grid" style="margin-bottom:0.5rem">
      <div><strong>Phone:</strong> ${c.phone || "—"}</div>
      <div><strong>Email:</strong> ${c.email || "—"}</div>
      <div style="grid-column:1/-1"><strong>Address:</strong> ${c.address || "—"}</div>
    </div>
    <form onsubmit="saveCustomer(event, '${c.id}')">
      <div class="form-grid">
        <div><label>Name</label><input name="name" value="${c.name||""}" required></div>
        <div><label>Phone</label><input name="phone" value="${c.phone||""}"></div>
        <div><label>Email</label><input name="email" value="${c.email||""}"></div>
        <div><label>Address</label><input name="address" value="${c.address||""}"></div>
      </div>
      <br>
      <button class="btn" type="submit">Save Profile</button>
    </form>
  </div>

  <div class="section">
    <h2>Boats & Motors (${boats.length})</h2>
    ${boats.length ? boats.map(b => `
      <div style="padding:0.4rem 0;border-bottom:1px solid #ddd">
        <strong>${b.boat || "Boat"}</strong> · ${b.motor || "Motor"}<br>
        <span class="meta">Year: ${b.year || "—"} · SN: ${b.sn || "—"} · Family: ${b.family || "—"}</span>
      </div>
    `).join("") : "<p>No boats recorded yet.</p>"}
  </div>

  <div class="section">
    <h2>Jobs (${relatedJobs.length})</h2>
    ${relatedJobs.length ? relatedJobs.map(j => `<div style="padding:0.3rem 0;border-bottom:1px solid #ddd;cursor:pointer" onclick="show('job','${j.id}')">
      ${j.boat||"Job"} · ${j.motor||""} · <span class="id-badge">${punchLabel(j)}</span> · ${j.status} · ${j.received||""}
    </div>`).join("") : "<p>No jobs yet.</p>"}
  </div>`;
}

function saveCustomer(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const c = customers.find(x => x.id === id);
  if (!c) return;
  const newName = f.get("name");
  c.name = newName;
  c.phone = f.get("phone");
  c.email = f.get("email");
  c.address = f.get("address");
  jobs.forEach(j => {
    if (j.customerId === id) j.customerName = newName;
  });
  save();
  show("customer", id);
}

function renderParts() {
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
    <h2 style="margin:0">Parts Catalog (${parts.length})</h2>
    <button class="btn secondary" onclick="mergeCatalog(); show('parts')">Reload Catalog</button> <button class="btn" onclick="show('newpart')">+ New Part</button>
  </div>
  <div style="margin-bottom:0.5rem">
    <input id="partSearch" placeholder="Search brand, category, SKU, name..." oninput="filterParts(this.value)" style="width:100%;max-width:400px">
  </div>
  ${parts.length ? `<div class="board" id="partBoard">${parts.map(p => `
    <div class="part-card" data-search="${(p.brand+' '+p.category+' '+p.productName+' '+p.sku+' '+(p.upc||'')+' '+p.description).toLowerCase()}" onclick="show('part','${p.id}')">
      <h3>${p.brand || ""} ${p.productName || ""}</h3>
      <div>${p.category || ""} · ${p.qtySize || ""}</div>
      <div class="meta">${p.sku ? "SKU " + p.sku : ""} ${p.upc ? "· UPC " + p.upc : ""} ${p.description ? "· " + p.description.slice(0,30) : ""}</div>
    </div>
  `).join("")}</div>` : `<div class="section"><p>No parts yet. Add the common ones.</p></div>`}`;
}

function filterParts(q) {
  const term = q.toLowerCase();
  document.querySelectorAll("#partBoard .part-card").forEach(card => {
    card.style.display = card.dataset.search.includes(term) ? "" : "none";
  });
}

function renderPart(id) {
  const p = parts.find(x => x.id === id);
  if (!p) return show("parts");
  const brandOptions = [...new Set([...BRANDS, p.brand].filter(Boolean))].map(b => `<option value="${b}">`).join("");
  const catOptions = [...new Set([...CATEGORIES, p.category].filter(Boolean))].map(c => `<option value="${c}">`).join("");
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem">
    <h2 style="margin:0">${p.brand} ${p.productName}</h2>
    <button class="btn secondary" onclick="show('parts')">← Parts</button>
  </div>
  <div class="section">
    <form onsubmit="savePart(event, '${p.id}')">
      <div class="form-grid">
        <div><label>Brand</label>
          <input name="brand" list="brandList" value="${p.brand||""}" placeholder="Type to filter...">
          <datalist id="brandList">${brandOptions}</datalist>
        </div>
        <div><label>Category</label>
          <input name="category" list="catList" value="${p.category||""}" placeholder="Type to filter...">
          <datalist id="catList">${catOptions}</datalist>
        </div>
        <div><label>Product Name</label><input name="productName" value="${p.productName||""}"></div>
        <div><label>Quantity / Size</label><input name="qtySize" value="${p.qtySize||""}"></div>
        <div><label>SKU</label><input name="sku" value="${p.sku||""}"></div>
        <div><label>UPC (optional)</label><input name="upc" value="${p.upc||""}" placeholder="barcode"></div>
        <div><label>Qty on Hand</label><input name="qtyOnHand" type="number" value="${p.qtyOnHand||0}"></div>
        <div><label>Description</label><input name="description" value="${p.description||""}"></div>
        <div><label>Default Price</label><input name="price" type="number" step="0.01" value="${p.price||0}"></div>
      </div>
      <br>
      <button class="btn" type="submit">Save Part</button>
      <button class="btn secondary" type="button" onclick="deletePart('${p.id}')">Delete</button>
    </form>
  </div>`;
}

function renderNewPart() {
  const brandOptions = BRANDS.map(b => `<option value="${b}">`).join("");
  const catOptions = CATEGORIES.map(c => `<option value="${c}">`).join("");
  return `
  <div class="section">
    <h2>New Part</h2>
    <form onsubmit="createPart(event)">
      <div class="form-grid">
        <div><label>Brand</label>
          <input name="brand" list="brandListNew" placeholder="Type to filter (e.g. Liq)">
          <datalist id="brandListNew">${brandOptions}</datalist>
        </div>
        <div><label>Category</label>
          <input name="category" list="catListNew" placeholder="Type to filter (e.g. Mot)">
          <datalist id="catListNew">${catOptions}</datalist>
        </div>
        <div><label>Product Name</label><input name="productName" placeholder="10W-40"></div>
        <div><label>Quantity / Size</label><input name="qtySize" placeholder="1L"></div>
        <div><label>SKU</label><input name="sku" placeholder="20506"></div>
        <div><label>UPC (optional)</label><input name="upc" placeholder="barcode"></div>
        <div><label>Qty on Hand</label><input name="qtyOnHand" type="number" value="0"></div>
        <div><label>Description</label><input name="description" placeholder="Marine 4T Motor Oil SAE 10W-40"></div>
        <div><label>Default Price</label><input name="price" type="number" step="0.01" value="0"></div>
      </div>
      <br>
      <button class="btn" type="submit">Add Part</button>
      <button class="btn secondary" type="button" onclick="show('parts')">Cancel</button>
    </form>
  </div>`;
}

function createPart(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  parts.push({
    id: uid(),
    brand: f.get("brand"),
    category: f.get("category"),
    productName: f.get("productName"),
    qtySize: f.get("qtySize"),
    sku: f.get("sku"),
    upc: f.get("upc") || "",
    description: f.get("description"),
    price: parseFloat(f.get("price")) || 0,
    qtyOnHand: parseInt(f.get("qtyOnHand")) || 0
  });
  save();
  show("parts");
}

function savePart(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const p = parts.find(x => x.id === id);
  if (!p) return;
  p.brand = f.get("brand");
  p.category = f.get("category");
  p.productName = f.get("productName");
  p.qtySize = f.get("qtySize");
  p.sku = f.get("sku");
  p.upc = f.get("upc") || "";
  p.description = f.get("description");
  p.price = parseFloat(f.get("price")) || 0;
  p.qtyOnHand = parseInt(f.get("qtyOnHand")) || 0;
  save();
  show("part", id);
}

function deletePart(id) {
  if (confirm("Delete this part from the catalog?")) {
    parts = parts.filter(p => p.id !== id);
    save();
    show("parts");
  }
}

function renderNew() {
  return `
  <div class="section">
    <h2>New Quote</h2>
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
      <button class="btn" type="submit">Finish Quote</button>
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
    <input id="${id}" name="laborDesc" placeholder="Description (e.g. Oil change)" style="flex:1" oninput="searchLabor(this)" autocomplete="off">
    <div id="${id}-results" style="position:absolute;top:100%;left:70px;right:40px;background:#fff;border:2px solid #002868;border-radius:4px;z-index:10;display:none;max-height:160px;overflow-y:auto"></div>
    <button type="button" class="btn secondary" onclick="this.parentElement.remove()" style="padding:0.2rem 0.4rem">×</button>
  `;
  div.appendChild(row);
}

function searchLabor(input) {
  const q = input.value.toLowerCase();
  const box = document.getElementById(input.id + "-results");
  if (!q || q.length < 2) { box.style.display = "none"; return; }
  const commons = ["Oil change", "Winterize", "Lower unit", "Water pump", "Diagnose", "Sea trial", "Annual service", "Impeller", "Fuel system", "Electronics"];
  const fromJobs = jobs.flatMap(j => (j.labor || []).map(l => l.desc)).filter(Boolean);
  const all = [...new Set([...commons, ...fromJobs])];
  const matches = all.filter(d => d.toLowerCase().includes(q)).slice(0, 6);
  if (!matches.length) { box.style.display = "none"; return; }
  box.innerHTML = matches.map(d => `<div style="padding:0.35rem 0.5rem;cursor:pointer;border-bottom:1px solid #eee" onclick="pickLabor('${input.id}', '${d.replace(/'/g,"\\'")}')">${d}</div>`).join("");
  box.style.display = "block";
}

function pickLabor(inputId, desc) {
  document.getElementById(inputId).value = desc;
  document.getElementById(inputId + "-results").style.display = "none";
}

function addQuotePart() {
  const div = document.getElementById("quote-parts");
  const row = document.createElement("div");
  row.className = "line";
  row.style.marginBottom = "0.4rem";
  row.style.position = "relative";
  const id = "part-" + Date.now();
  row.innerHTML = `
    <input name="partQty" type="number" step="1" placeholder="Qty" style="width:60px" value="1">
    <input id="${id}" name="partDesc" placeholder="Part (e.g. 10W-40 LiquiMoly)" style="flex:1" oninput="searchPart(this)" autocomplete="off">
    <input name="partPrice" type="number" step="0.01" placeholder="Price" style="width:80px">
    <div id="${id}-results" style="position:absolute;top:100%;left:60px;right:90px;background:#fff;border:2px solid #002868;border-radius:4px;z-index:10;display:none;max-height:180px;overflow-y:auto"></div>
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
    punchId: makePunchId(),
    customerId: custId,
    customerName: customer.name,
    boat: f.get("boat"),
    motor: f.get("motor"),
    status: "Needs Approval",
    workGroups: workGroups,
    note: f.get("note") || "",
    labor: labor,
    services: [],
    parts: partsLines,
    received: new Date().toISOString().slice(0,10),
    created: new Date().toISOString()
  };
  jobs.unshift(job);
  save();
  show("board");
}

function searchCust(q) {
  const el = document.getElementById("custResults");
  if (!q) { el.innerHTML = ""; return; }
  const matches = customers.filter(c => 
    (c.name||"").toLowerCase().includes(q.toLowerCase()) || 
    (c.phone||"").includes(q)
  ).slice(0,5);
  el.innerHTML = matches.map(c => 
    `<div style="padding:0.3rem;cursor:pointer;background:#fff;margin:0.15rem 0;border:1px solid #002868;border-radius:3px;font-size:13px" 
      onclick="fillCust('${c.id}')">${c.name} · ${c.phone||""}</div>`
  ).join("");
}

function fillCust(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;
  document.querySelector("[name=name]").value = c.name || "";
  document.querySelector("[name=phone]").value = c.phone || "";
  document.querySelector("[name=email]").value = c.email || "";
  document.querySelector("[name=address]").value = c.address || "";
  document.getElementById("custResults").innerHTML = "";
}

function createJob(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const custId = uid();
  const customer = {
    id: custId,
    name: f.get("name"),
    phone: f.get("phone"),
    email: f.get("email"),
    address: f.get("address")
  };
  customers.push(customer);
  const received = f.get("received");
  const job = {
    id: uid(),
    punchId: makePunchId(received),
    customerId: custId,
    customerName: customer.name,
    boat: f.get("boat"),
    motor: f.get("motor"),
    year: f.get("year"),
    sn: f.get("sn"),
    family: f.get("family"),
    received: received,
    status: "Open",
    labor: [],
    services: [],
    parts: [],
    created: new Date().toISOString()
  };
  jobs.unshift(job);
  save();
  show("job", job.id);
}

function renderJob(id) {
  const j = jobs.find(x => x.id === id);
  if (!j) return show("board");
  const laborTotal = j.labor.reduce((s,l) => s + (parseFloat(l.hours)||0) * RATES.tech, 0);
  const serviceTotal = j.services.reduce((s,l) => s + (parseFloat(l.amount)||0), 0);
  const partsTotal = j.parts.reduce((s,l) => s + (parseFloat(l.qty)||0) * (parseFloat(l.price)||0), 0);
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
  <div class="meta" style="margin-bottom:0.5rem">Received: ${j.received || "—"} · Motor: ${j.motor || "—"} · SN: ${j.sn || "—"} · Family: ${j.family || "—"}</div>

  <div class="sections-grid">
    <div class="section">
      <h2>Labor</h2>
      <div id="labor-lines">${j.labor.map((l,i) => lineLabor(j.id, i, l)).join("")}</div>
      <button class="btn secondary" onclick="addLine('${j.id}','labor')">+ Labor</button>
      <div class="total">$${laborTotal.toFixed(2)}</div>
    </div>

    <div class="section">
      <h2>Services</h2>
      <div id="service-lines">${j.services.map((l,i) => lineService(j.id, i, l)).join("")}</div>
      <button class="btn secondary" onclick="addLine('${j.id}','services')">+ Service</button>
      <div class="total">$${serviceTotal.toFixed(2)}</div>
    </div>

    <div class="section">
      <h2>Parts</h2>
      <div style="margin-bottom:0.4rem;position:relative">
        <input id="partPick-${j.id}" placeholder="Search catalog (brand, SKU, name)..." oninput="filterCatalogPick('${j.id}', this.value)" style="width:100%">
        <div id="partPickResults-${j.id}" style="position:absolute;background:#fff;border:2px solid #002868;max-height:180px;overflow:auto;z-index:10;width:100%;display:none"></div>
      </div>
      <div id="parts-lines">${j.parts.map((l,i) => lineParts(j.id, i, l)).join("")}</div>
      <button class="btn secondary" onclick="addLine('${j.id}','parts')">+ Blank Part</button>
      <div class="total">$${partsTotal.toFixed(2)}</div>
    </div>
  </div>

  <div class="section" style="text-align:right">
    <div class="total" style="font-size:1.4rem">INVOICE TOTAL: $${grand.toFixed(2)}</div>
    <button class="btn" onclick="printInvoice('${j.id}')">Print / PDF</button>
    <p class="meta">TimeChex punch ID: <strong>${pid}</strong></p>
  </div>`;
}

function lineLabor(jid, i, l) {
  return `<div class="line">
    <input type="number" step="0.25" value="${l.hours||""}" placeholder="hrs" onchange="updateLine('${jid}','labor',${i},'hours',this.value)">
    <input value="${l.desc||""}" placeholder="Winterize, Snap..." onchange="updateLine('${jid}','labor',${i},'desc',this.value)">
    <span style="font-size:12px;font-weight:700">$${((l.hours||0)*RATES.tech).toFixed(2)}</span>
    <button class="btn secondary" style="padding:0.2rem 0.3rem" onclick="removeLine('${jid}','labor',${i})">×</button>
  </div>`;
}
function lineService(jid, i, l) {
  return `<div class="line">
    <input type="number" step="0.01" value="${l.amount||""}" placeholder="$" onchange="updateLine('${jid}','services',${i},'amount',this.value)">
    <input value="${l.desc||""}" placeholder="Haul out..." onchange="updateLine('${jid}','services',${i},'desc',this.value)">
    <span></span>
    <button class="btn secondary" style="padding:0.2rem 0.3rem" onclick="removeLine('${jid}','services',${i})">×</button>
  </div>`;
}
function lineParts(jid, i, l) {
  return `<div class="line parts">
    <input type="number" step="1" value="${l.qty||""}" placeholder="qty" onchange="updateLine('${jid}','parts',${i},'qty',this.value)">
    <input value="${l.desc||""}" placeholder="desc / part #" onchange="updateLine('${jid}','parts',${i},'desc',this.value)">
    <input type="number" step="0.01" value="${l.price||""}" placeholder="$ ea" onchange="updateLine('${jid}','parts',${i},'price',this.value)">
    <button class="btn secondary" style="padding:0.2rem 0.3rem" onclick="removeLine('${jid}','parts',${i})">×</button>
  </div>`;
}

function addLine(jid, type) {
  const j = jobs.find(x => x.id === jid);
  j[type].push(type === "labor" ? {hours:1, desc:""} : type === "services" ? {amount:0, desc:""} : {qty:1, desc:"", price:0});
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
function updateStatus(jid, status) {
  const j = jobs.find(x => x.id === jid);
  j.status = status;
  save(); show("job", jid);
}

function printInvoice(id) {
  const j = jobs.find(x => x.id === id);
  const w = window.open("", "_blank");
  const laborTotal = j.labor.reduce((s,l) => s + (parseFloat(l.hours)||0)*RATES.tech, 0);
  const serviceTotal = j.services.reduce((s,l) => s + (parseFloat(l.amount)||0), 0);
  const partsTotal = j.parts.reduce((s,l) => s + (parseFloat(l.qty)||0)*(parseFloat(l.price)||0), 0);
  const pid = punchLabel(j);
  w.document.write(`
    <html><head><title>Invoice ${pid}</title>
    <style>body{font-family:sans-serif;max-width:700px;margin:2rem auto;color:#000} table{width:100%;border-collapse:collapse} td,th{padding:4px;border-bottom:1px solid #002868;text-align:left} .right{text-align:right}</style>
    </head><body>
    <h1 style="color:#002868">American Outboard Motors</h1>
    <p>12611 Ocean Gateway, Cordova, MD 21625</p>
    <hr style="border-color:#bf0a30">
    <p><strong>${j.customerName}</strong><br>${j.address||""}<br>${j.phone||""} ${j.email||""}</p>
    <p>Boat: ${j.boat||""} · Motor: ${j.motor||""}<br>Year: ${j.year||""} · SN: ${j.sn||""} · Family: ${j.family||""}<br>Received: ${j.received||""}</p>
    <h3>Labor</h3>
    <table>${j.labor.map(l=>`<tr><td>${l.hours} hrs</td><td>${l.desc}</td><td class="right">$${((l.hours||0)*RATES.tech).toFixed(2)}</td></tr>`).join("")}</table>
    <h3>Services</h3>
    <table>${j.services.map(l=>`<tr><td></td><td>${l.desc}</td><td class="right">$${parseFloat(l.amount||0).toFixed(2)}</td></tr>`).join("")}</table>
    <h3>Parts</h3>
    <table>${j.parts.map(l=>`<tr><td>${l.qty}x</td><td>${l.desc}</td><td class="right">$${((l.qty||0)*(l.price||0)).toFixed(2)}</td></tr>`).join("")}</table>
    <h2 class="right" style="color:#002868">Total: $${(laborTotal+serviceTotal+partsTotal).toFixed(2)}</h2>
    <p>Work order ID: ${pid}</p>
    </body></html>`);
  w.document.close();
  w.print();
}

function exportData() {
  const blob = new Blob([JSON.stringify({jobs, customers, parts}, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "aom-crm-export.json";
  a.click();
}


function filterCatalogPick(jid, q) {
  const box = document.getElementById("partPickResults-" + jid);
  if (!q || q.length < 1) { box.style.display = "none"; return; }
  const term = q.toLowerCase().trim();
  const matches = parts.filter(p => 
    (p.brand + " " + p.productName + " " + p.sku + " " + p.description).toLowerCase().includes(term)
  ).slice(0, 8);
  if (!matches.length) { box.style.display = "none"; return; }
  box.innerHTML = matches.map(p => 
    `<div style="padding:0.3rem 0.45rem;cursor:pointer;border-bottom:1px solid #eee;font-size:13px;line-height:1.3" 
      onclick="addFromCatalog('${jid}', '${p.id}')">
      <strong>${p.brand} ${p.productName}</strong> · ${p.qtySize || ""} · ${p.sku ? "SKU " + p.sku : ""} 
      <span style="float:right;color:#002868;font-weight:700">$${parseFloat(p.price||0).toFixed(2)}</span>
    </div>`
  ).join("");
  box.style.display = "block";
}

function addFromCatalog(jid, partId) {
  const p = parts.find(x => x.id === partId);
  if (!p) return;
  const j = jobs.find(x => x.id === jid);
  j.parts.push({
    qty: 1,
    desc: (p.brand + " " + p.productName + " " + (p.sku || "")).trim(),
    price: parseFloat(p.price) || 0,
    sku: p.sku || "",
    catalogId: p.id
  });
  save();
  show("job", jid);
  // clear the search
  const inp = document.getElementById("partPick-" + jid);
  if (inp) inp.value = "";
  const box = document.getElementById("partPickResults-" + jid);
  if (box) box.style.display = "none";
}

show("board");
