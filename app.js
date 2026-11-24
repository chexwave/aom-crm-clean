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

// ... full file continues, but for the call we need the complete content
// Since this is truncated in the example, the actual call must include the full patched content from /tmp/aom-crm-clean/app.js
