const STATUSES = ["Estimate", "Quote", "Service Order", "Invoice", "Archive"];
let jobs = JSON.parse(localStorage.getItem("aom_jobs") || "[]");
let customers = JSON.parse(localStorage.getItem("aom_customers") || "[]");
let boats = JSON.parse(localStorage.getItem("aom_boats") || "[]");
let motors = JSON.parse(localStorage.getItem("aom_motors") || "[]");
let parts = JSON.parse(localStorage.getItem("aom_parts") || "[]");
function save() {
  localStorage.setItem("aom_jobs", JSON.stringify(jobs));
  localStorage.setItem("aom_customers", JSON.stringify(customers));
  localStorage.setItem("aom_boats", JSON.stringify(boats));
  localStorage.setItem("aom_motors", JSON.stringify(motors));
  localStorage.setItem("aom_parts", JSON.stringify(parts));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function nextCustomerNumber() {
  const nums = customers.map(c => { const m = (c.customerNumber||"").match(/C-(\d+)/); return m ? +m[1] : 0; }).filter(n=>n>0);
  return "C-" + (nums.length ? Math.max(...nums)+1 : 10001);
}
function nextJobNumber() {
  const nums = jobs.map(j => { const m = (j.jobNumber||"").match(/J-(\d+)/); return m ? +m[1] : 0; }).filter(n=>n>0);
  return "J-" + (nums.length ? Math.max(...nums)+1 : 10001);
}
function displayJobNumber(j) {
  const num = (j.jobNumber||"J-10000").replace(/^J-/,"");
  return (j.status||"Estimate") + "-" + num;
}
function show(view, id) {
  const app = document.getElementById("app");
  if (view === "home") app.innerHTML = `<h2>Home</h2><p>${jobs.filter(j=>j.status!=="Archive").length} open</p><button class="btn" onclick="show('new')">New Estimate</button>`;
  if (view === "new") app.innerHTML = renderNew();
  if (view === "board") app.innerHTML = `<h2>Jobs</h2>` + jobs.map(j=>`<div onclick="show('job','${j.id}')" style="padding:0.4rem;border-bottom:1px solid #eee;cursor:pointer">${displayJobNumber(j)} · ${j.customerName||""}</div>`).join("") || "<p>No jobs</p>";
  if (view === "job") { const j = jobs.find(x=>x.id===id); app.innerHTML = j ? `<h2>${displayJobNumber(j)}</h2><p>${j.customerName||""}</p><p>${j.boat||""} · ${j.motor||""}</p>` : "Not found"; }
  if (view === "company") app.innerHTML = `<h2>Company</h2><p>American Outboard Motors</p>`;
  if (view === "archive") app.innerHTML = `<h2>Archive</h2>`;
  if (view === "customers") app.innerHTML = `<h2>Customers</h2>` + customers.map(c=>`<div>${c.name}</div>`).join("");
  if (view === "parts") app.innerHTML = `<h2>Parts</h2>`;
}
function renderNew() {
  return `<div style="max-width:640px;padding:0.5rem">
    <h2>New Estimate</h2>
    <div style="margin-bottom:0.8rem">
      <label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Find existing customer</label>
      <input id="custSearch" oninput="searchCust(this.value)" placeholder="Type name or phone..." style="width:100%;padding:0.55rem;border:1px solid #ccc;border-radius:4px;font-size:15px">
      <div id="custResults" style="background:#fff;border:1px solid #ddd;border-radius:4px;margin-top:3px;max-height:180px;overflow:auto"></div>
    </div>
    <form onsubmit="saveNewJob(event)" style="display:flex;flex-direction:column;gap:0.75rem">
      <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Customer Name *</label><input name="name" required style="width:100%;padding:0.55rem;border:1px solid #ccc;border-radius:4px;font-size:15px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.7rem">
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Phone</label><input name="phone" style="width:100%;padding:0.55rem;border:1px solid #ccc;border-radius:4px"></div>
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Email</label><input name="email" type="email" style="width:100%;padding:0.55rem;border:1px solid #ccc;border-radius:4px"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.7rem">
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Boat</label><input name="boat" placeholder="Scout 185" style="width:100%;padding:0.55rem;border:1px solid #ccc;border-radius:4px"></div>
        <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Motor</label><input name="motor" placeholder="Yamaha F115" style="width:100%;padding:0.55rem;border:1px solid #ccc;border-radius:4px"></div>
      </div>
      <div><label style="font-weight:700;color:#002868;display:block;margin-bottom:0.25rem">Notes</label><textarea name="complaint" style="width:100%;padding:0.55rem;border:1px solid #ccc;border-radius:4px;min-height:80px"></textarea></div>
      <div style="display:flex;gap:0.6rem;margin-top:0.3rem"><button class="btn" type="submit">Create Estimate</button><button class="btn secondary" type="button" onclick="show('board')">Cancel</button></div>
    </form>
  </div>`;
}
function searchCust(q) {
  const box = document.getElementById("custResults");
  if (!q) { box.innerHTML = ""; return; }
  const matches = customers.filter(c => (c.name+" "+(c.phone||"")).toLowerCase().includes(q.toLowerCase())).slice(0,8);
  box.innerHTML = matches.map(c => `<div style="padding:0.45rem 0.6rem;cursor:pointer;border-bottom:1px solid #eee" onclick="pickCust('${c.id}')">${c.name} <span style="color:#666;font-size:12px">${c.phone||""}</span></div>`).join("") || `<div style="padding:0.45rem;color:#666">No matches — fill the form below to create new</div>`;
}
function pickCust(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;
  const form = document.querySelector("form");
  if (form) { form.querySelector("[name=name]").value = c.name||""; form.querySelector("[name=phone]").value = c.phone||""; form.querySelector("[name=email]").value = c.email||""; }
  document.getElementById("custResults").innerHTML = "";
  document.getElementById("custSearch").value = c.name;
}
function saveNewJob(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get("name") || "Unknown";
  let c = customers.find(x => (x.name||"").toLowerCase() === name.toLowerCase());
  if (!c) { c = {id:uid(), customerNumber:nextCustomerNumber(), name, phone:fd.get("phone")||"", email:fd.get("email")||"", address:""}; customers.push(c); }
  const j = { id:uid(), jobNumber:nextJobNumber(), customerId:c.id, customerName:name, customerNumber:c.customerNumber, boat:fd.get("boat")||"", motor:fd.get("motor")||"", status:"Estimate", received:new Date().toISOString().slice(0,10), labor:[], services:[], parts:[], notes:fd.get("complaint")||"", created:new Date().toISOString() };
  jobs.push(j); save(); show("job", j.id);
}
function setActiveNav() {}
function toggleAddMenu() { const m = document.getElementById("addMenu"); if(m) m.style.display = m.style.display==="none"?"block":"none"; }
function exportData() {}
function resetSeed() { if(confirm("Reset all data to seed?")) { localStorage.clear(); location.reload(); } }
setTimeout(() => show("home"), 100);
