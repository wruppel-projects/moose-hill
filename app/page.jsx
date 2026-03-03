"use client";
import { useState, useEffect, useMemo, useRef } from "react";

const IMG_TAFT = "/taft.jpg";
const IMG_HAMILTON = "/hamilton.jpg";
const IMG_STBERNARD = "/stbernard.jpg";
const IMG_MAP = "/map.jpg";

const PIN = "1921";
const ROOMS = [
  { id: "st-bernard", name: "St. Bernard's Room", location: "Downstairs",    color: "#8B4513", accent: "#B5651D", img: IMG_STBERNARD, emoji: "🐾", desc: "Ground-floor retreat with wide windows overlooking the snow-draped woods." },
  { id: "taft",       name: "Taft Room",        location: "Upstairs West",  color: "#1F3D2B", accent: "#2E5A3E", img: IMG_TAFT,      emoji: "🌲", desc: "Vaulted upstairs sanctuary with treetop views to the west." },
  { id: "hamilton",   name: "Hamilton Room",    location: "Upstairs East",  color: "#3A4A6B", accent: "#6B8CBF", img: IMG_HAMILTON,  emoji: "🌄", desc: "Bright east-facing room with a classic iron bed and morning light." },
];

const PLACES = [
  { category: "Essentials and Stores",         name: "Market 32",                  type: "Grocery Store", distance: "2.0 mi", drive: "6 min",  maps: "https://maps.google.com/?q=Market+32+Oxford+CT",                   hours: "Daily 6am-11pm" },
  { category: "Essentials and Stores",         name: "Dunkin",              type: "Coffee & Donuts", distance: "1.9 mi", drive: "5 min", maps: "https://maps.apple/p/wUIuMh-VXZqTzL" },
  { category: "Essentials and Stores", name: "Fritz's Snack Bar",   type: "Snack Bar",       distance: "2.0 mi", drive: "5 min", maps: "https://maps.apple/p/YdLNBI2MDU..oD" },
  { category: "Essentials and Stores", name: "Oxford Liquor Shoppe", type: "Liquor Store",    distance: "2.2 mi", drive: "5 min", maps: "https://maps.apple/p/tVF0u9tQy9SpTQ" },
  { category: "Essentials and Stores",         name: "Ace Hardware by Chatfield",  type: "Hardware Store", distance: "2.0 mi", drive: "6 min",  maps: "https://maps.google.com/?q=Ace+Hardware+Chatfield+Oxford+CT",      hours: "Mon-Fri 7:30am-6pm, Sat 7:30am-5pm, Sun 8am-4pm" },
  { category: "Parks & Trails",     name: "Southford Falls State Park", type: "Waterfall & Covered Bridge", distance: "3.0 mi", drive: "8 min",  maps: "https://maps.google.com/?q=Southford+Falls+State+Park+CT",        hours: "Open daily" },
  { category: "Parks & Trails",     name: "Jackson Cove Town Park",     type: "Lake Beach & Boat Launch", distance: "4.1 mi", drive: "10 min", maps: "https://maps.google.com/?q=Jackson+Cove+Town+Park+Oxford+CT",     hours: "Daily 7am-8pm" },
  { category: "Parks & Trails",     name: "Rockhouse Hill Sanctuary",   type: "Hiking & MTB Trails", distance: "5.8 mi", drive: "13 min", maps: "https://maps.google.com/?q=Rockhouse+Hill+Sanctuary+Oxford+CT",   hours: "Open daily" },
  { category: "Parks & Trails",     name: "Lovers Leap State Park",     type: "Scenic Gorge & Bridge", distance: "21 mi",  drive: "30 min", maps: "https://maps.google.com/?q=Lovers+Leap+State+Park+CT",           hours: "Daily 8am-6:30pm" },
  { category: "Parks & Trails",     name: "Steep Rock Preserve",        type: "Historic Railroad Tunnel", distance: "25 mi",  drive: "35 min", maps: "https://maps.google.com/?q=Steep+Rock+Preserve+Washington+CT",   hours: "Open 24 hours" },
  { category: "Parks & Trails",     name: "Hidden Valley Preserve",     type: "Suspension Bridge Hike", distance: "26 mi",  drive: "37 min", maps: "https://maps.google.com/?q=Hidden+Valley+Preserve+Washington+CT", hours: "Open 24 hours" },
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const C = { bg: "#F4F1E8", dark: "#1F3D2B", brown: "#1F3D2B", tan: "#9CAF88", cream: "#F9F7F2", muted: "#4F6F52" };

function formatDate(d) { return d.toISOString().split("T")[0]; }
function parseDate(s) { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); }
function formatDisplay(s) { const d = parseDate(s); return MONTH_NAMES[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate()+n); return d; }
function getDates(start, end) {
  const dates = []; let cur = new Date(start);
  while (cur <= end) { dates.push(formatDate(cur)); cur = addDays(cur,1); }
  return dates;
}

function Stars({ rating }) {
  return (
    <span style={{ color: "#C4953A", fontSize: "0.8rem" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5-Math.round(rating))}
      <span style={{ color: "#8a7a6a", marginLeft: 4, fontSize: "0.75rem" }}>{rating}</span>
    </span>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [page, setPage] = useState("home");
  const [bookings, setBookings] = useState([]);
  const [activeRoom, setActiveRoom] = useState(ROOMS[0].id);
  const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
  const [calViewMonth, setCalViewMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
  const [sel, setSel] = useState({ start: null, end: null, selecting: false });
  const [form, setForm] = useState({ name: "", guest2: "" });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [placesTab, setPlacesTab] = useState("Essentials and Stores");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const today = formatDate(new Date());

  useEffect(() => {
    window.scrollTo(0, 0);
    try { if (sessionStorage.getItem("moosehill-unlocked") === "1") setUnlocked(true); } catch {}
    try { const p = sessionStorage.getItem("moosehill-page"); if (p) setPage(p); } catch {}
    fetch("/api/bookings")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBookings(data); })
      .catch(() => {});
  }, []);

  async function saveBookings(updated) {
    setBookings(updated);
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {}
  }

  // ── PROJECTS ──
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [notesModal, setNotesModal] = useState(null);
  const [notesText, setNotesText] = useState("");
  const [expandedProjects, setExpandedProjects] = useState({});
  const [dragState, setDragState] = useState(null);
  const dragOverRef = useRef(null);

  useEffect(() => {
    if (unlocked && !projectsLoaded) {
      fetch("/api/projects")
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setProjects(data); setProjectsLoaded(true); })
        .catch(() => setProjectsLoaded(true));
    }
  }, [unlocked]);

  async function saveProjects(updated) {
    setProjects(updated);
    try {
      await fetch("/api/projects", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updated) });
    } catch {}
  }

  function addProject(status) {
    const np = { id:Date.now().toString(), name:"", status, owner:"", notes:"", subtasks:[], editing:true };
    saveProjects([np, ...projects]);
  }
  function updateProject(id, changes) { saveProjects(projects.map(p => p.id===id ? {...p,...changes} : p)); }
  function deleteProject(id) { saveProjects(projects.filter(p => p.id!==id)); }
  function addSubtask(projectId) {
    const ns = { id:Date.now().toString(), name:"", status:"Not Started", owner:"", notes:"", editing:true };
    saveProjects(projects.map(p => p.id===projectId ? {...p, subtasks:[...(p.subtasks||[]),ns]} : p));
  }
  function updateSubtask(projectId, subtaskId, changes) {
    saveProjects(projects.map(p => p.id===projectId ? {...p, subtasks:(p.subtasks||[]).map(s => s.id===subtaskId ? {...s,...changes} : s)} : p));
  }
  function deleteSubtask(projectId, subtaskId) {
    saveProjects(projects.map(p => p.id===projectId ? {...p, subtasks:(p.subtasks||[]).filter(s => s.id!==subtaskId)} : p));
  }
  function openNotes(id, isSubtask, parentId) {
    let text = "";
    if (isSubtask) { const p = projects.find(x=>x.id===parentId); const s = p&&(p.subtasks||[]).find(x=>x.id===id); text = s?s.notes||"":""; }
    else { const p = projects.find(x=>x.id===id); text = p?p.notes||"":""; }
    setNotesText(text); setNotesModal({id, isSubtask, parentId});
  }
  function saveNotes() {
    if (!notesModal) return;
    if (notesModal.isSubtask) updateSubtask(notesModal.parentId, notesModal.id, {notes:notesText});
    else updateProject(notesModal.id, {notes:notesText});
    setNotesModal(null);
  }


  const nav = (p) => { setPage(p); setMobileMenuOpen(false); window.scrollTo(0,0); try { sessionStorage.setItem("moosehill-page", p); } catch {} };

  const getBooking = (roomId, ds) => bookings.find(b => b.roomId === roomId && getDates(parseDate(b.start), parseDate(b.end)).includes(ds));

  const now = new Date();
  const maxYear = now.getFullYear() + 2;
  const canBack = () => calMonth.year > now.getFullYear() || calMonth.month > now.getMonth();
  const canFwd = () => calMonth.year < maxYear || (calMonth.year === maxYear && calMonth.month < now.getMonth());
  const prevMonth = () => setCalMonth(p => p.month === 0 ? { year: p.year-1, month: 11 } : { year: p.year, month: p.month-1 });
  const nextMonth = () => setCalMonth(p => p.month === 11 ? { year: p.year+1, month: 0 } : { year: p.year, month: p.month+1 });
  const canBackView = () => calViewMonth.year > now.getFullYear() || calViewMonth.month > now.getMonth();
  const canFwdView = () => calViewMonth.year < maxYear || (calViewMonth.year === maxYear && calViewMonth.month < now.getMonth());
  const prevMonthView = () => setCalViewMonth(p => p.month === 0 ? { year: p.year-1, month: 11 } : { year: p.year, month: p.month-1 });
  const nextMonthView = () => setCalViewMonth(p => p.month === 11 ? { year: p.year+1, month: 0 } : { year: p.year, month: p.month+1 });

  const upcoming = useMemo(() => [...bookings].filter(b => b.end >= today).sort((a,b) => a.start.localeCompare(b.start)), [bookings, today]);
  const room = ROOMS.find(r => r.id === activeRoom);

  function handleDayClick(roomId, ds) {
    if (ds < today) return;
    // If no selection started, or a complete selection already exists, start fresh
    if (!sel.selecting || !sel.start || (sel.start && sel.end)) {
      setSel({ start: ds, end: null, selecting: true });
    } else {
      let [start, end] = [sel.start, ds];
      if (end < start) [start, end] = [end, start];
      const conflictBooking = getDates(parseDate(start), parseDate(end)).map(d => getBooking(roomId, d)).find(Boolean);
      if (conflictBooking) {
        setFormError("Those dates overlap an existing booking. Please call " + conflictBooking.name + " to see if their plans are flexible."); setSel({ start:null, end:null, selecting:false }); return;
      }
      setSel({ start, end, selecting: false });
      setForm({ name:"", guest2:"" }); setFormError(""); setModalOpen(true);
    }
  }

  function handleSubmit() {
    if (!form.name.trim()) { setFormError("Please enter your name."); return; }
    saveBookings([...bookings, { id: Date.now().toString(), roomId: activeRoom, start: sel.start, end: sel.end || sel.start, name: form.name.trim(), guest2: form.guest2.trim() }]);
    setModalOpen(false); setSel({ start:null, end:null, selecting:false });
    setSuccess("Booked! " + form.name + " - " + room.name);
    setTimeout(() => setSuccess(""), 5000);
  }

  function handleCancel() {
    saveBookings(bookings.filter(b => b.id !== cancelTarget.id));
    setCancelTarget(null);
    setSuccess("Booking cancelled."); setTimeout(() => setSuccess(""), 4000);
  }

  function CalGrid({ roomId, readonly }) {
    const r = ROOMS.find(r => r.id === roomId);
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
    }
    const preview = (() => {
      if (!sel.selecting || !sel.start || !hoveredDay) return [];
      let [s, e] = [sel.start, hoveredDay];
      if (e < s) [s, e] = [e, s];
      return getDates(parseDate(s), parseDate(e));
    })();

    return (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:"0.65rem", fontWeight:700, color:"#9a8a7a", paddingBottom:5 }}>{d}</div>
        ))}
        {cells.map((ds, i) => {
          if (!ds) return <div key={"e"+i} />;
          const isPast = ds < today;
          const booking = getBooking(roomId, ds);
          const isToday = ds === today;
          const inPreview = !readonly && preview.includes(ds) && !isPast;
          const isStart = !readonly && sel.start === ds;
          const inConfirmed = !readonly && !sel.selecting && sel.start && sel.end && ds >= sel.start && ds <= sel.end;
          let bg = "transparent";
          let color = isPast ? "#ccc" : "#2a1f0e";
          if (booking) { bg = r.color + "30"; color = r.color; }
          if (inPreview) { bg = r.accent + "BB"; color = "#fff"; }
          if (inConfirmed) { bg = r.color; color = "#fff"; }
          if (isStart) { bg = r.accent; color = "#fff"; }
          if (readonly && booking) { bg = r.color; color = "#fff"; }
          return (
            <div
              key={ds}
              onClick={() => !readonly && !isPast && handleDayClick(roomId, ds)}
              onTouchStart={() => !readonly && !isPast && setHoveredDay(ds)}
              onTouchEnd={(e) => { if (!readonly && !isPast) { e.preventDefault(); handleDayClick(roomId, ds); setHoveredDay(null); } }}
              onMouseEnter={() => !readonly && setHoveredDay(ds)}
              onMouseLeave={() => !readonly && setHoveredDay(null)}
              title={booking ? booking.name + (booking.guest2 ? " + " + booking.guest2 : "") : ""}
              style={{
                textAlign:"center", padding:"8px 2px", borderRadius:7,
                fontSize:"0.82rem", fontWeight: isToday ? 800 : 400,
                background: bg, color: color,
                cursor: readonly || isPast ? "default" : "pointer",
                border: isToday ? "2px solid " + r.accent : "2px solid transparent",
                userSelect:"none", transition:"all 0.1s",
                WebkitTapHighlightColor:"transparent",
                minHeight:36
              }}
            >
              {new Date(parseDate(ds)).getDate()}
            </div>
          );
        })}
      </div>
    );
  }

  const navGroups = [
    { label:"Home", id:"home", single:true },
    { label:"Stay", items:[
      { id:"reserve", label:"Reserve" },
      { id:"calendar", label:"Calendar" },
    ]},
    { label:"The House", items:[
      { id:"wifi", label:"WiFi & Codes" },
      { id:"appliances", label:"Appliances" },
      { id:"projects", label:"Projects" },
    ]},
    { label:"Explore", items:[
      { id:"places", label:"Nearby Places" },
      { id:"oxford", label:"Oxford, CT" },
    ]},
  ];
  const allNavItems = [
    { id:"home", label:"Home" },
    { id:"reserve", label:"Reserve" },
    { id:"calendar", label:"Calendar" },
    { id:"wifi", label:"WiFi & Codes" },
    { id:"appliances", label:"Appliances" },
    { id:"projects", label:"Projects" },
    { id:"places", label:"Nearby Places" },
    { id:"oxford", label:"Oxford, CT" },
  ];
  function handleNavClick(id) {
    if (id === "oxford") { window.open("/Oxford.pdf","_blank"); return; }
    nav(id);
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight:"100vh", background:"#F4F1E8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia, serif", padding:"2rem" }}>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lora:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={{ textAlign:"center", maxWidth:400, width:"100%" }}>
          <div style={{ width:"100%", borderRadius:16, overflow:"hidden", marginBottom:24, boxShadow:"0 4px 20px rgba(31,61,43,0.15)" }}><img src="/HomepageImage.jpeg" alt="104 Moose Hill Road" style={{ width:"100%", height:"auto", display:"block" }} /></div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"2rem", fontWeight:900, color:"#1F3D2B", marginBottom:4 }}>104 Moose Hill Road</h1>
          <p style={{ fontFamily:"'Playfair Display', serif", fontStyle:"italic", color:"#9CAF88", marginBottom:36, fontSize:"0.95rem" }}>Oxford, Connecticut</p>
          <div style={{ background:"#2C1F14", borderRadius:16, padding:"2rem", boxShadow:"0 8px 40px rgba(0,0,0,0.4)" }}>
            <p style={{ color:"#fff", fontSize:"0.82rem", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700, marginBottom:16 }}>Family Access PIN</p>
            <input
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (pinInput === PIN ? (setUnlocked(true), sessionStorage.setItem("moosehill-unlocked","1"), setPinError("")) : (setPinError("Incorrect PIN."), setPinInput("")))}
              type="password" inputMode="numeric" pattern="[0-9]*"
              placeholder="Enter PIN"
              autoFocus
              style={{ width:"100%", padding:"14px 16px", background:"#fff", border:"1.5px solid #9CAF88", borderRadius:10, fontFamily:"'Lora', serif", fontSize:"1.2rem", color:"#1F3D2B", textAlign:"center", letterSpacing:"0.3em", outline:"none", marginBottom:12, boxSizing:"border-box" }}
            />
            {pinError && <div style={{ color:"#E07070", fontSize:"0.8rem", marginBottom:10 }}>{pinError}</div>}
            <button
              onClick={() => pinInput === PIN ? (setUnlocked(true), sessionStorage.setItem("moosehill-unlocked","1"), setPinError("")) : (setPinError("Incorrect PIN."), setPinInput(""))}
              style={{ width:"100%", padding:"13px", background:"#1F3D2B", color:"#F4F1E8", border:"none", borderRadius:10, fontFamily:"'Lora', serif", fontSize:"0.95rem", fontWeight:700, cursor:"pointer" }}
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Lora', Georgia, serif", color:C.dark, background:C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lora:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .room-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.14) !important; }
        .room-card { transition: transform 0.2s, box-shadow 0.2s; }
        .place-row:hover { background: #F0EBE3 !important; }
        .nav-btn:hover { color: #9CAF88 !important; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: flex !important; }
          .main-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .mobile-btn { display: none !important; }
          .mobile-nav { display: none !important; }
        }
        button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        a { -webkit-tap-highlight-color: transparent; }
        input { font-size: 16px !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:200, background:"rgba(31,61,43,0.97)", backdropFilter:"blur(8px)", borderBottom:"1px solid #2E5A3E" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", height:68 }}>
          <button onClick={() => nav("home")} style={{ background:"none", border:"none", cursor:"pointer" }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.1rem", fontWeight:700, color:"#F5EFE4" }}>104 Moose Hill Road</div>
            <div style={{ fontSize:"0.65rem", color:"#9CAF88", letterSpacing:"0.12em", textTransform:"uppercase" }}>Oxford, Connecticut</div>
          </button>
          <div className="desktop-nav" style={{ display:"flex", gap:4, alignItems:"center" }}>
            {navGroups.map(g => g.single ? (
              <button key={g.id} className="nav-btn" onClick={() => handleNavClick(g.id)}
                style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 14px", fontFamily:"'Lora', serif", fontSize:"0.85rem", color: page===g.id ? "#9CAF88" : "#E8F0E9", fontWeight: page===g.id ? 600 : 400, borderBottom: page===g.id ? "2px solid #9CAF88" : "2px solid transparent", transition:"all 0.15s" }}>
                {g.label}
              </button>
            ) : (
              <div key={g.label} style={{ position:"relative" }}
                onMouseEnter={e => e.currentTarget.querySelector(".nav-dropdown").style.display="block"}
                onMouseLeave={e => e.currentTarget.querySelector(".nav-dropdown").style.display="none"}>
                <button className="nav-btn"
                  style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 14px", fontFamily:"'Lora', serif", fontSize:"0.85rem", color: g.items.some(i => i.id===page) ? "#9CAF88" : "#E8F0E9", fontWeight: g.items.some(i => i.id===page) ? 600 : 400, borderBottom: g.items.some(i => i.id===page) ? "2px solid #9CAF88" : "2px solid transparent", transition:"all 0.15s" }}>
                  {g.label} ▾
                </button>
                <div className="nav-dropdown" style={{ display:"none", position:"absolute", top:"100%", left:0, background:"rgba(31,61,43,0.98)", borderRadius:8, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", minWidth:160, zIndex:500, overflow:"hidden", border:"1px solid #2E5A3E" }}>
                  {g.items.map(item => (
                    <button key={item.id} onClick={() => handleNavClick(item.id)}
                      style={{ display:"block", width:"100%", textAlign:"left", padding:"11px 18px", background:"none", border:"none", borderBottom:"1px solid #2E5A3E", cursor:"pointer", fontFamily:"'Lora', serif", fontSize:"0.85rem", color: page===item.id ? "#9CAF88" : "#E8F0E9" }}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="mobile-btn" onClick={() => setMobileMenuOpen(v => !v)}
            style={{ background:"none", border:"1px solid #2E5A3E", borderRadius:6, padding:"6px 10px", cursor:"pointer", color:"#E8F0E9", fontSize:"1.2rem", display:"none" }}>
            {mobileMenuOpen ? "X" : "="}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="mobile-nav" style={{ background:"#1F3D2B", borderTop:"1px solid #2E5A3E" }}>
            {navGroups.map(g => g.single ? (
              <button key={g.id} onClick={() => handleNavClick(g.id)}
                style={{ display:"block", width:"100%", textAlign:"left", padding:"12px 1.5rem", background:"none", border:"none", cursor:"pointer", fontFamily:"'Lora', serif", fontSize:"0.95rem", color: page===g.id ? "#9CAF88" : "#E8F0E9" }}>
                {g.label}
              </button>
            ) : (
              <div key={g.label}>
                <div style={{ padding:"10px 1.5rem 4px", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#4F6F52", fontFamily:"'Lora', serif" }}>{g.label}</div>
                {g.items.map(item => (
                  <button key={item.id} onClick={() => handleNavClick(item.id)}
                    style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 1.5rem 10px 2.2rem", background:"none", border:"none", cursor:"pointer", fontFamily:"'Lora', serif", fontSize:"0.9rem", color: page===item.id ? "#9CAF88" : "#E8F0E9" }}>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* TOAST */}
      {success && (
        <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:300, background:"#1F3D2B", color:"#C8E6C9", padding:"12px 24px", borderRadius:10, fontSize:"0.88rem", boxShadow:"0 4px 24px rgba(0,0,0,0.25)", animation:"fadeIn 0.3s ease" }}>
          {success}
        </div>
      )}

      {/* HOME PAGE */}
      {page === "home" && (
        <div>
          <div style={{ background:"#EAF0EA", position:"relative", overflow:"hidden", minHeight:"85vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", inset:0, opacity:0.08, background:"radial-gradient(circle, #1F3D2B 1px, transparent 1px)", backgroundSize:"24px 24px" }} />
            <div style={{ textAlign:"center", padding:"4rem 2rem", position:"relative", zIndex:1 }}>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,3.2rem)", fontWeight:900, color:"#1F3D2B", letterSpacing:"-0.02em", lineHeight:1, marginBottom:12 }}>
                104 Moose Hill Road
              </h1>
              <p style={{ fontFamily:"'Playfair Display', serif", fontStyle:"italic", fontSize:"clamp(1.2rem,3vw,1.8rem)", color:"#4F6F52", marginBottom:40 }}>
                Oxford, Connecticut
              </p>
              <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
                <button onClick={() => nav("reserve")}
                  style={{ padding:"15px 36px", background:"#1F3D2B", color:"#F4F1E8", border:"none", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"1rem", fontWeight:600, cursor:"pointer" }}>
                  Reserve a Room
                </button>
                <button onClick={() => nav("calendar")}
                  style={{ padding:"15px 36px", background:"transparent", color:"#1F3D2B", border:"1.5px solid #1F3D2B", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"1rem", cursor:"pointer" }}>
                  See Calendar
                </button>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={() => nav("wifi")}
                  style={{ padding:"9px 20px", background:"transparent", color:"#1F3D2B", border:"1.5px solid #2E5A3E", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.82rem", cursor:"pointer" }}>
                  WiFi & Codes
                </button>
                <button onClick={() => window.open("/Oxford.pdf","_blank")}
                  style={{ padding:"9px 20px", background:"transparent", color:"#1F3D2B", border:"1.5px solid #2E5A3E", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.82rem", cursor:"pointer" }}>
                  Oxford, CT
                </button>
                <button onClick={() => nav("places")}
                  style={{ padding:"9px 20px", background:"transparent", color:"#1F3D2B", border:"1.5px solid #2E5A3E", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.82rem", cursor:"pointer" }}>
                  Explore Nearby
                </button>
                <button onClick={() => nav("appliances")}
                  style={{ padding:"9px 20px", background:"transparent", color:"#1F3D2B", border:"1.5px solid #2E5A3E", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.82rem", cursor:"pointer" }}>
                  Appliances
                </button>
                <button onClick={() => nav("projects")}
                  style={{ padding:"9px 20px", background:"transparent", color:"#1F3D2B", border:"1.5px solid #2E5A3E", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.82rem", cursor:"pointer" }}>
                  Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR PAGE */}
      {page === "calendar" && (
        <div style={{ maxWidth:860, margin:"0 auto", padding:"2.5rem 1.5rem" }}>
          <div style={{ marginBottom:"2rem" }}>
            <div style={{ fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase", color:C.muted, marginBottom:8, fontWeight:700 }}>Availability</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:700, color:C.brown }}>Room Calendar</h1>
            <p style={{ color:"#2E5A3E", marginTop:6, fontSize:"0.9rem" }}>See who is staying and when. To make a booking, visit the <span onClick={() => nav("reserve")} style={{ color:C.brown, fontWeight:600, textDecoration:"underline", cursor:"pointer" }}>Reserve page</span>.</p>
          </div>

          {/* Room legend */}
          <div style={{ display:"flex", gap:20, marginBottom:"1.2rem", flexWrap:"wrap" }}>
            {ROOMS.map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:7, fontSize:"0.82rem", color:C.brown }}>
                <div style={{ width:28, height:10, borderRadius:4, background:r.color }} />
                {r.name}
              </div>
            ))}
          </div>

          {/* Month nav */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.2rem" }}>
            <button onClick={() => canBackView() && prevMonthView()} disabled={!canBackView()}
              style={{ background:"none", border:"1px solid #DDD", borderRadius:7, width:36, height:36, cursor:canBackView()?"pointer":"not-allowed", opacity:canBackView()?1:0.3, fontSize:"1.2rem", color:C.muted }}>
              &lsaquo;
            </button>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.3rem", fontWeight:700, color:C.brown }}>
              {MONTH_NAMES[calViewMonth.month]} {calViewMonth.year}
            </span>
            <button onClick={() => canFwdView() && nextMonthView()} disabled={!canFwdView()}
              style={{ background:"none", border:"1px solid #DDD", borderRadius:7, width:36, height:36, cursor:canFwdView()?"pointer":"not-allowed", opacity:canFwdView()?1:0.3, fontSize:"1.2rem", color:C.muted }}>
              &rsaquo;
            </button>
          </div>

          {/* Unified calendar grid */}
          <div style={{ background:C.cream, borderRadius:16, boxShadow:"0 2px 20px rgba(0,0,0,0.07)", padding:"1.2rem 1rem" }}>
            {/* Day headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} style={{ textAlign:"center", fontSize:"0.7rem", fontWeight:700, color:"#9a8a7a", padding:"4px 0" }}>{d}</div>
              ))}
            </div>
            {/* Day cells */}
            {(() => {
              const { year, month } = calViewMonth;
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month+1, 0).getDate();
              const cells = [];
              for (let i = 0; i < firstDay; i++) cells.push(null);
              for (let d = 1; d <= daysInMonth; d++) {
                cells.push(`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
              }
              // Pad to complete last row
              while (cells.length % 7 !== 0) cells.push(null);

              return (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                  {cells.map((ds, i) => {
                    if (!ds) return <div key={"e"+i} style={{ minHeight:64 }} />;
                    const isPast = ds < today;
                    const isToday = ds === today;
                    const dayBookings = ROOMS.map(r => {
                      const b = getBooking(r.id, ds);
                      return b ? { room: r, booking: b } : null;
                    }).filter(Boolean);

                    return (
                      <div key={ds} style={{
                        minHeight:64, borderRadius:8, padding:"6px 4px 4px",
                        background: isToday ? "#FDF5E8" : isPast ? "#F9F6F2" : "#fff",
                        border: isToday ? "2px solid "+C.tan : "1px solid #EAE4DA",
                        display:"flex", flexDirection:"column", gap:2,
                        WebkitTapHighlightColor:"transparent"
                      }}>
                        <div style={{ fontSize:"0.8rem", fontWeight: isToday ? 800 : 400, color: isPast ? "#bbb" : C.brown, textAlign:"right", paddingRight:2, marginBottom:2 }}>
                          {new Date(parseDate(ds)).getDate()}
                        </div>
                        {dayBookings.map(({ room: r, booking: b }) => {
                          const isFirst = b.start === ds;
                          const isLast = b.end === ds;
                          return (
                            <div key={r.id} title={b.name + (b.guest2 ? " + "+b.guest2 : "") + " (" + formatDisplay(b.start) + " to " + formatDisplay(b.end) + ")"}
                              style={{
                                background: r.color,
                                color: "#fff",
                                fontSize:"0.62rem",
                                fontWeight:600,
                                padding:"2px 5px",
                                borderRadius: isFirst && isLast ? 4 : isFirst ? "4px 0 0 4px" : isLast ? "0 4px 4px 0" : 0,
                                overflow:"hidden",
                                whiteSpace:"nowrap",
                                textOverflow:"ellipsis",
                                lineHeight:1.4,
                                cursor:"default"
                              }}>
                              {isFirst ? b.name : ""}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Upcoming stays */}
          <div style={{ marginTop:"1.5rem", background:C.cream, borderRadius:14, padding:"1.4rem", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.1rem", fontWeight:700, color:C.brown, marginBottom:"1rem" }}>Upcoming Stays</div>
            {upcoming.length === 0 ? (
              <div style={{ fontSize:"0.85rem", color:"#BBB", fontStyle:"italic" }}>No upcoming bookings yet.</div>
            ) : upcoming.map(b => {
              const r = ROOMS.find(r => r.id === b.roomId);
              if (!r) return null;
              return (
                <div key={b.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #F0EBE3" }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:r.color, flexShrink:0 }} />
                  <div style={{ flex:1, fontSize:"0.88rem" }}>
                    <span style={{ fontWeight:700, color:r.color }}>{r.name}</span>
                    <span style={{ color:C.brown }}> - {b.name}{b.guest2 ? " + " + b.guest2 : ""}</span>
                    <div style={{ fontSize:"0.74rem", color:C.muted }}>{formatDisplay(b.start)} to {formatDisplay(b.end)}</div>
                    <button onClick={() => setCancelTarget(b)}
                      style={{ background:"none", border:"none", color:"#C0392B", fontSize:"0.7rem", cursor:"pointer", padding:0, marginTop:2 }}>
                      Cancel booking
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:"1.2rem", textAlign:"center" }}>
            <button onClick={() => nav("reserve")}
              style={{ padding:"12px 32px", background:C.brown, color:"#F5EFE4", border:"none", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.9rem", fontWeight:600, cursor:"pointer" }}>
              Make a Reservation
            </button>
          </div>
        </div>
      )}

      {/* RESERVE PAGE */}
      {page === "reserve" && (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"2.5rem 1.5rem" }}>
          <div style={{ marginBottom:"2rem" }}>
            <div style={{ fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase", color:C.muted, marginBottom:8, fontWeight:700 }}>Reservations</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:700, color:C.brown }}>Book Your Stay</h1>
            <p style={{ color:"#2E5A3E", marginTop:6, fontSize:"0.9rem" }}>Select a room, click your check-in date, then your check-out date.</p>
          </div>
          <div className="main-grid" style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:"1.5rem", alignItems:"start" }}>
            <div style={{ background:C.cream, borderRadius:16, boxShadow:"0 2px 20px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <div style={{ display:"flex", borderBottom:"1px solid #EAE4DA" }}>
                {ROOMS.map(r => (
                  <button key={r.id} onClick={() => { setActiveRoom(r.id); setSel({start:null,end:null,selecting:false}); setFormError(""); }}
                    style={{ flex:1, padding:"14px 6px", border:"none", background: activeRoom===r.id ? "#fff" : "#F5F0E8", borderBottom: activeRoom===r.id ? "3px solid "+r.accent : "3px solid transparent", cursor:"pointer", fontFamily:"'Lora', serif", fontSize:"0.78rem", fontWeight: activeRoom===r.id ? 700 : 400, color: activeRoom===r.id ? r.color : C.muted, textAlign:"center" }}>
                    <div>{r.name}</div>
                    <div style={{ fontSize:"0.66rem", opacity:0.7 }}>{r.location}</div>
                  </button>
                ))}
              </div>
              <div style={{ padding:"1.5rem" }}>
                <div style={{ height:160, borderRadius:10, overflow:"hidden", marginBottom:"1.2rem", position:"relative" }}>
                  <img src={room.img} alt={room.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(28,21,16,0.6) 0%, transparent 60%)" }} />
                  <div style={{ position:"absolute", bottom:12, left:14, color:"#F5EFE4" }}>
                    <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.1rem", fontWeight:700 }}>{room.name}</div>
                    <div style={{ fontSize:"0.72rem", opacity:0.8 }}>{room.location}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                  <button onClick={() => canBack() && prevMonth()} disabled={!canBack()}
                    style={{ background:"none", border:"1px solid #DDD", borderRadius:7, width:32, height:32, cursor:canBack()?"pointer":"not-allowed", opacity:canBack()?1:0.3, color:C.muted }}>
                    &lsaquo;
                  </button>
                  <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.1rem", fontWeight:700, color:C.brown }}>
                    {MONTH_NAMES[calMonth.month]} {calMonth.year}
                  </span>
                  <button onClick={() => canFwd() && nextMonth()} disabled={!canFwd()}
                    style={{ background:"none", border:"1px solid #DDD", borderRadius:7, width:32, height:32, cursor:canFwd()?"pointer":"not-allowed", opacity:canFwd()?1:0.3, color:C.muted }}>
                    &rsaquo;
                  </button>
                </div>
                <CalGrid roomId={activeRoom} readonly={false} />
                {formError && <div style={{ background:"#FDEAEA", color:"#C0392B", borderRadius:7, padding:"8px 12px", fontSize:"0.8rem", marginTop:12 }}>{formError}</div>}
                {sel.selecting && sel.start && (
                  <div style={{ textAlign:"center", fontSize:"0.8rem", color:room.accent, marginTop:12, fontStyle:"italic" }}>
                    Check-in: {formatDisplay(sel.start)} - now click your check-out date
                  </div>
                )}
                {sel.start && !sel.selecting && (
                  <div style={{ marginTop:14, padding:"12px 14px", background:room.color+"15", borderRadius:10 }}>
                    <div style={{ fontSize:"0.85rem", color:C.brown, marginBottom:10 }}>
                      {formatDisplay(sel.start)} to {formatDisplay(sel.end || sel.start)}
                    </div>
                    <button onClick={() => { setForm({name:"",guest2:""}); setFormError(""); setModalOpen(true); }}
                      style={{ width:"100%", padding:"11px", background:room.color, color:"#fff", border:"none", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer" }}>
                      Reserve {room.name}
                    </button>
                    <div onClick={() => setSel({start:null,end:null,selecting:false})}
                      style={{ textAlign:"center", fontSize:"0.72rem", color:C.muted, marginTop:6, cursor:"pointer" }}>
                      clear selection
                    </div>
                  </div>
                )}
                {!sel.start && !sel.selecting && (
                  <div style={{ textAlign:"center", fontSize:"0.75rem", color:"#BBB", marginTop:10 }}>Click a date to begin</div>
                )}
              </div>
              <div style={{ padding:"0.8rem 1.5rem 1rem", borderTop:"1px solid #EAE4DA", display:"flex", gap:16, flexWrap:"wrap" }}>
                {ROOMS.map(r => (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.72rem", color:C.muted }}>
                    <div style={{ width:11, height:11, borderRadius:3, background:r.color+"30", border:"2px solid "+r.accent }} />
                    {r.name}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={{ background:C.cream, borderRadius:14, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"1.2rem" }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1rem", fontWeight:700, color:C.brown, marginBottom:12 }}>Upcoming Stays</div>
                {upcoming.length === 0 ? (
                  <div style={{ fontSize:"0.8rem", color:"#CCC", fontStyle:"italic" }}>No upcoming bookings.</div>
                ) : upcoming.map(b => {
                  const r = ROOMS.find(r => r.id === b.roomId);
                  if (!r) return null;
                  return (
                    <div key={b.id} style={{ borderLeft:"3px solid "+r.accent, paddingLeft:10, marginBottom:12, fontSize:"0.8rem" }}>
                      <div style={{ fontWeight:700, color:r.color }}>{r.name}</div>
                      <div style={{ color:C.brown }}>{b.name}{b.guest2 ? " + "+b.guest2 : ""}</div>
                      <div style={{ color:C.muted, fontSize:"0.74rem" }}>{formatDisplay(b.start)} to {formatDisplay(b.end)}</div>
                      <button onClick={() => setCancelTarget(b)}
                        style={{ background:"none", border:"none", color:"#C0392B", fontSize:"0.7rem", cursor:"pointer", padding:0, marginTop:2 }}>
                        Cancel booking
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:C.cream, borderRadius:14, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"1.2rem", borderTop:"4px solid "+room.accent }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1rem", fontWeight:700, color:C.brown, marginBottom:4 }}>How to Book</div>
                <ol style={{ paddingLeft:18, fontSize:"0.8rem", color:"#2E5A3E", lineHeight:1.8 }}>
                  <li>Pick a room tab</li>
                  <li>Click check-in date</li>
                  <li>Click check-out date</li>
                  <li>Enter your name</li>
                  <li>Confirm!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLACES PAGE */}
      {page === "places" && (
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"2.5rem 1.5rem" }}>
          <div style={{ marginBottom:"2rem" }}>
            <div style={{ fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase", color:C.muted, marginBottom:8, fontWeight:700 }}>Around Oxford</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:700, color:C.brown }}>Nearby Places</h1>
            <p style={{ color:C.muted, marginTop:6, fontSize:"0.9rem" }}>All distances from 104 Moose Hill Road.</p>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:"1.5rem", flexWrap:"wrap" }}>
            {["Essentials","Parks & Trails"].map(cat => (
              <button key={cat} onClick={() => setPlacesTab(cat)}
                style={{ padding:"9px 20px", border:"none", borderRadius:24, fontFamily:"'Lora', serif", fontSize:"0.85rem", cursor:"pointer", background: placesTab===cat ? C.brown : "#EAE4DA", color: placesTab===cat ? "#F5EFE4" : C.muted, fontWeight: placesTab===cat ? 600 : 400 }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ background:C.cream, borderRadius:16, boxShadow:"0 2px 20px rgba(0,0,0,0.07)", overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 44px", gap:12, padding:"10px 20px", borderBottom:"1px solid #EAE4DA", fontSize:"0.68rem", fontWeight:700, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>
              <div>Name</div><div style={{ textAlign:"right" }}>Distance</div><div style={{ textAlign:"right" }}>Drive</div><div />
            </div>
            {PLACES.filter(p => p.category === placesTab).map((place, i, arr) => (
              <div key={place.name} className="place-row"
                style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 44px", gap:12, padding:"16px 20px", borderBottom: i < arr.length-1 ? "1px solid #F0EBE3" : "none", alignItems:"center", background: i%2===0 ? "#fff" : C.cream }}>
                <div>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"0.95rem", fontWeight:600, color:C.brown, marginBottom:2 }}>{place.name}</div>
                  <div style={{ fontSize:"0.74rem", color:C.muted }}>{place.type}</div>
                  {place.hours && <div style={{ fontSize:"0.7rem", color:"#AAA", marginTop:1 }}>{place.hours}</div>}
                </div>
                <div style={{ textAlign:"right", fontSize:"0.82rem", fontWeight:600, color:C.brown }}>{place.distance}</div>
                <div style={{ textAlign:"right", fontSize:"0.82rem", color:C.muted }}>{place.drive}</div>
                
                <div style={{ textAlign:"right" }}>
                  <a href={place.maps} target="_blank" rel="noopener noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:32, height:32, background:C.tan, borderRadius:8, color:"#fff", textDecoration:"none", fontSize:"0.85rem" }}>
                    &#8599;
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"1rem", fontSize:"0.75rem", color:"#BBB", textAlign:"center", fontStyle:"italic" }}>
            Drive times are approximate. Ratings from Google Maps.
          </div>
        </div>
      )}

      {/* WIFI PAGE */}
      {page === "wifi" && (
        <div style={{ maxWidth:600, margin:"0 auto", padding:"2.5rem 1.5rem" }}>
          <div style={{ marginBottom:"2rem" }}>
            <div style={{ fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase", color:C.muted, marginBottom:8, fontWeight:700 }}>Access</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:700, color:C.brown }}>WiFi & Codes</h1>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {[
              { label:"WiFi Network", value:"Oxferd", large:true },
              { label:"WiFi Password", value:"Zarden1921+", large:true },
              { label:"Door Key", value:"Your key will work on the front and back doors.", large:false },
              { label:"Garage Door Code", value:"1921 [Enter]", large:true },
            ].map(item => (
              <div key={item.label} style={{ background:C.cream, borderRadius:14, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"1.4rem 1.6rem", borderLeft:"4px solid "+C.tan }}>
                <div style={{ fontSize:"0.7rem", letterSpacing:"0.15em", textTransform:"uppercase", color:C.muted, fontWeight:700, marginBottom:8 }}>{item.label}</div>
                <div style={{ fontFamily: item.large ? "'Playfair Display', serif" : "inherit", fontSize: item.large ? "1.4rem" : "1rem", fontWeight: item.large ? 700 : 400, color:C.brown, letterSpacing: item.large ? "0.05em" : 0 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPLIANCES PAGE */}
      {page === "appliances" && (
        <div style={{ maxWidth:700, margin:"0 auto", padding:"2.5rem 1.5rem" }}>
          <div style={{ marginBottom:"2rem" }}>
            <div style={{ fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase", color:C.muted, marginBottom:8, fontWeight:700 }}>Reference</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:700, color:C.brown }}>Appliance User Manuals</h1>
            <p style={{ color:C.muted, marginTop:6, fontSize:"0.9rem" }}>Links open the manufacturer manual in a new tab.</p>
          </div>
          <div style={{ background:C.cream, borderRadius:16, boxShadow:"0 2px 20px rgba(0,0,0,0.07)", overflow:"hidden" }}>
            {[
              { name:"HVAC",         icon:"❄️",  url:"https://iaq.na.panasonic.com/hubfs/PCI%20-%20Panasonic%20North%20America%20Canada/IAQ/HVAC%20Resources/Operating-Manual_CS-XZ_CS-MXZ_CU-XZ_CU-xZxxABUC_CU-xZxxBBUC_English_Nov_2025_Bill29.pdf?hsLang=en" },
              { name:"Dryer",        icon:"🌀",  url:"https://www.whirlpool.com/results.html?term=wed5010&tab=clp&plp=WED5010LW%253Arelevance&plpView=grid&clp=wed5010%253Adoc_type%253Aowners-manual&currentPage=0" },
              { name:"Washer",       icon:"🫧",  url:"https://www.whirlpool.com/content/dam/global/documents/202305/owners-manual-w11654314-revB.pdf" },
              { name:"Stove",        icon:"🔥",  url:"https://www.whirlpool.com/content/dam/global/documents/202409/owners-manual-w11640308-revc.pdf" },
              { name:"Refrigerator", icon:"🧊",  url:"https://www.whirlpool.com/content/dam/global/documents/202406/owners-manual-w11727207-revA.pdf" },
              { name:"Microwave",    icon:"📡",  url:"https://www.whirlpool.com/content/dam/global/documents/201809/use-and-care-w11247855-revA.pdf" },
              { name:"Dishwasher",   icon:"🍽️", url:"https://www.whirlpool.com/content/dam/global/documents/202304/owners-manual-w11532445-revD.pdf" },
            ].map((item, i, arr) => (
              <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", borderBottom: i<arr.length-1 ? "1px solid #EAE4DA" : "none", textDecoration:"none", background: i%2===0 ? "#fff" : C.cream }}
                onMouseEnter={e => e.currentTarget.style.background="#E8F0E9"}
                onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? "#fff" : C.cream}>
                <span style={{ fontSize:"1.5rem", width:32, textAlign:"center" }}>{item.icon}</span>
                <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"1rem", fontWeight:600, color:C.brown, flex:1 }}>{item.name}</span>
                <span style={{ fontSize:"0.8rem", color:C.tan, fontWeight:600 }}>View Manual &#8599;</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* PROJECTS PAGE */}
      {page === "projects" && (() => {
        const STATUSES = ["Not Started","In Progress","Completed"];
        const STATUS_STYLE = {
          "Not Started": { bg:"#F3F4F6", color:"#4B5563", border:"#D1D5DB" },
          "In Progress": { bg:"#EFF6FF", color:"#1D4ED8", border:"#BFDBFE" },
          "Completed":   { bg:"#F0FDF4", color:"#15803D", border:"#BBF7D0" },
        };
        const SECTION_STYLE = {
          "Not Started": { header:"#F9FAFB", accent:"#6B7280" },
          "In Progress": { header:"#EFF6FF", accent:"#2563EB" },
          "Completed":   { header:"#F0FDF4", accent:"#16A34A" },
        };

        function StatusBadge({ value, onChange }) {
          const s = STATUS_STYLE[value]||STATUS_STYLE["Not Started"];
          return (
            <select value={value} onChange={e => onChange(e.target.value)}
              style={{ appearance:"none", WebkitAppearance:"none", background:s.bg, color:s.color, border:"1px solid "+s.border, borderRadius:6, padding:"3px 10px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"'Lora', serif" }}>
              {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          );
        }

        function OwnerField({ value, onChange }) {
          const [editing, setEditing] = useState(false);
          return editing ? (
            <input autoFocus defaultValue={value} onBlur={e => { onChange(e.target.value); setEditing(false); }} onKeyDown={e => e.key==="Enter"&&e.target.blur()}
              style={{ width:90, border:"1px solid #9CAF88", borderRadius:5, padding:"3px 6px", fontSize:"0.78rem", fontFamily:"'Lora',serif", color:C.brown }} />
          ) : (
            <span onClick={() => setEditing(true)} style={{ minWidth:80, fontSize:"0.78rem", color:value?C.brown:"#9CA3AF", cursor:"text", fontStyle:value?"normal":"italic", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {value||"Owner"}
            </span>
          );
        }

        function SubtaskRow({ subtask, projectId }) {
          const [editing, setEditing] = useState(subtask.editing||false);
          const ss = STATUS_STYLE[subtask.status||"Not Started"];
          return (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px 8px 48px", borderBottom:"1px solid #F3F4F6", background:"#FAFAFA" }}>
              <span style={{ color:"#D1D5DB", fontSize:"0.8rem" }}>↳</span>
              {editing ? (
                <input autoFocus defaultValue={subtask.name} onBlur={e => { updateSubtask(projectId,subtask.id,{name:e.target.value,editing:false}); setEditing(false); }} onKeyDown={e => e.key==="Enter"&&e.target.blur()}
                  style={{ flex:1, border:"1px solid #9CAF88", borderRadius:5, padding:"3px 8px", fontSize:"0.85rem", fontFamily:"'Lora',serif", color:C.brown }} />
              ) : (
                <span onClick={() => setEditing(true)} style={{ flex:1, fontSize:"0.85rem", color:subtask.name?C.brown:"#9CA3AF", cursor:"text", fontStyle:subtask.name?"normal":"italic" }}>{subtask.name||"Click to name"}</span>
              )}
              <select value={subtask.status||"Not Started"} onChange={e => updateSubtask(projectId,subtask.id,{status:e.target.value})}
                style={{ appearance:"none", WebkitAppearance:"none", background:ss.bg, color:ss.color, border:"1px solid "+ss.border, borderRadius:6, padding:"3px 8px", fontSize:"0.72rem", fontWeight:600, cursor:"pointer", fontFamily:"'Lora',serif" }}>
                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <OwnerField value={subtask.owner||""} onChange={v => updateSubtask(projectId,subtask.id,{owner:v})} />
              <button onClick={() => openNotes(subtask.id,true,projectId)}
                style={{ background:subtask.notes?"#FEF3C7":"#F3F4F6", border:"1px solid "+(subtask.notes?"#FCD34D":"#E5E7EB"), borderRadius:5, padding:"3px 8px", fontSize:"0.72rem", cursor:"pointer", color:subtask.notes?"#92400E":"#6B7280", whiteSpace:"nowrap" }}>
                {subtask.notes?"📝 Notes":"Notes"}
              </button>
              <button onClick={() => deleteSubtask(projectId,subtask.id)}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#D1D5DB", fontSize:"0.9rem", padding:"2px 4px" }}>✕</button>
            </div>
          );
        }

        function ProjectRow({ project }) {
          const [editing, setEditing] = useState(project.editing||false);
          const expanded = expandedProjects[project.id];
          const subtasks = project.subtasks||[];
          return (
            <div draggable onDragStart={() => setDragState({id:project.id,fromStatus:project.status})} onDragEnd={() => setDragState(null)}
              style={{ background:"#fff", borderBottom:"1px solid #F3F4F6", cursor:"grab", opacity:dragState&&dragState.id===project.id?0.5:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px" }}>
                <span style={{ color:"#D1D5DB", cursor:"grab", fontSize:"0.9rem", userSelect:"none" }}>⠿</span>
                <button onClick={() => setExpandedProjects(p => ({...p,[project.id]:!p[project.id]}))}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:"0.75rem", padding:"0 2px", transform:expanded?"rotate(90deg)":"rotate(0deg)", transition:"transform 0.15s" }}>▶</button>
                {editing ? (
                  <input autoFocus defaultValue={project.name} onBlur={e => { updateProject(project.id,{name:e.target.value,editing:false}); setEditing(false); }} onKeyDown={e => e.key==="Enter"&&e.target.blur()}
                    style={{ flex:1, border:"1px solid #9CAF88", borderRadius:5, padding:"4px 10px", fontSize:"0.9rem", fontFamily:"'Lora',serif", color:C.brown, fontWeight:600 }} />
                ) : (
                  <span onClick={() => setEditing(true)} style={{ flex:1, fontSize:"0.9rem", fontWeight:600, color:project.name?C.brown:"#9CA3AF", cursor:"text", fontStyle:project.name?"normal":"italic", textDecoration:project.status==="Completed"?"line-through":"none", opacity:project.status==="Completed"?0.7:1 }}>
                    {project.name||"Click to name project"}
                  </span>
                )}
                <StatusBadge value={project.status} onChange={v => updateProject(project.id,{status:v})} />
                <OwnerField value={project.owner||""} onChange={v => updateProject(project.id,{owner:v})} />
                <button onClick={() => openNotes(project.id,false,null)}
                  style={{ background:project.notes?"#FEF3C7":"#F3F4F6", border:"1px solid "+(project.notes?"#FCD34D":"#E5E7EB"), borderRadius:5, padding:"4px 10px", fontSize:"0.75rem", cursor:"pointer", color:project.notes?"#92400E":"#6B7280", whiteSpace:"nowrap" }}>
                  {project.notes?"📝 Notes":"Notes"}
                </button>
                <button onClick={() => deleteProject(project.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#D1D5DB", fontSize:"1rem", padding:"2px 6px" }}>✕</button>
              </div>
              {expanded && (
                <div>
                  {subtasks.map(s => <SubtaskRow key={s.id} subtask={s} projectId={project.id} />)}
                  <div style={{ padding:"6px 14px 8px 48px" }}>
                    <button onClick={() => { addSubtask(project.id); setExpandedProjects(p => ({...p,[project.id]:true})); }}
                      style={{ background:"none", border:"1px dashed #D1D5DB", borderRadius:5, padding:"4px 12px", fontSize:"0.78rem", color:"#9CA3AF", cursor:"pointer" }}>
                      + Add subtask
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div style={{ maxWidth:900, margin:"0 auto", padding:"2rem 1rem" }}>
            <div style={{ marginBottom:"1.5rem", display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase", color:C.muted, marginBottom:6, fontWeight:700 }}>The House</div>
                <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:700, color:C.brown, margin:0 }}>Projects</h1>
              </div>
              <button onClick={() => addProject("Not Started")}
                style={{ background:"#1F3D2B", color:"#F4F1E8", border:"none", borderRadius:8, padding:"10px 20px", fontFamily:"'Lora',serif", fontSize:"0.88rem", fontWeight:600, cursor:"pointer" }}>
                + New Project
              </button>
            </div>
            {!projectsLoaded ? (
              <div style={{ textAlign:"center", padding:"3rem", color:C.muted }}>Loading projects…</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                {STATUSES.map(status => {
                  const sp = projects.filter(p => p.status===status);
                  const ss = SECTION_STYLE[status];
                  return (
                    <div key={status}
                      onDragOver={e => { e.preventDefault(); dragOverRef.current=status; }}
                      onDrop={() => { if (!dragState||dragState.fromStatus===status) return; updateProject(dragState.id,{status}); setDragState(null); }}
                      style={{ borderRadius:12, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"2px solid "+(dragState&&dragOverRef.current===status&&dragState.fromStatus!==status?ss.accent:"transparent"), transition:"border 0.15s" }}>
                      <div style={{ background:ss.header, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #E5E7EB" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ width:10, height:10, borderRadius:"50%", background:ss.accent, display:"inline-block" }} />
                          <span style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:"1rem", color:C.brown }}>{status}</span>
                          <span style={{ background:"#E5E7EB", color:"#6B7280", borderRadius:10, padding:"1px 8px", fontSize:"0.72rem", fontWeight:600 }}>{sp.length}</span>
                        </div>
                        <button onClick={() => addProject(status)}
                          style={{ background:"none", border:"1px solid #D1D5DB", borderRadius:6, padding:"3px 10px", fontSize:"0.75rem", color:"#6B7280", cursor:"pointer" }}>
                          + Add
                        </button>
                      </div>
                      <div style={{ background:"#fff" }}>
                        {sp.length===0 ? (
                          <div style={{ padding:"20px 14px", color:"#D1D5DB", fontSize:"0.85rem", fontStyle:"italic", textAlign:"center" }}>No projects — drag one here or click + Add</div>
                        ) : sp.map(p => <ProjectRow key={p.id} project={p} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* FOOTER */}
      <footer style={{ background:"#1F3D2B", borderTop:"1px solid #2E5A3E", padding:"2rem 1.5rem", textAlign:"center" }}>
        <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1rem", color:"#F5EFE4", marginBottom:6 }}>104 Moose Hill Road</div>
        <div style={{ fontSize:"0.75rem", color:C.muted }}>Oxford, Connecticut</div>
        <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", maxWidth:480, margin:"16px auto 0" }}>
          {allNavItems.map(n => (
            <button key={n.id} onClick={() => handleNavClick(n.id)}
              style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:"0.78rem", fontFamily:"'Lora', serif" }}>
              {n.label}
            </button>
          ))}
        </div>
      </footer>

      {/* NOTES MODAL */}
      {notesModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
          onClick={e => e.target===e.currentTarget&&setNotesModal(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:"1.8rem", width:"100%", maxWidth:480, boxShadow:"0 12px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.2rem", fontWeight:700, color:C.brown, marginBottom:16 }}>Notes</div>
            <textarea value={notesText} onChange={e => setNotesText(e.target.value)} autoFocus placeholder="Add notes here..."
              style={{ width:"100%", minHeight:160, border:"1.5px solid #E5E7EB", borderRadius:8, padding:"10px 12px", fontFamily:"'Lora',serif", fontSize:"0.9rem", color:C.brown, resize:"vertical", outline:"none", boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"flex-end" }}>
              <button onClick={() => setNotesModal(null)}
                style={{ background:"none", border:"1px solid #E5E7EB", borderRadius:8, padding:"8px 18px", fontFamily:"'Lora',serif", fontSize:"0.85rem", color:"#6B7280", cursor:"pointer" }}>Cancel</button>
              <button onClick={saveNotes}
                style={{ background:"#1F3D2B", color:"#F4F1E8", border:"none", borderRadius:8, padding:"8px 20px", fontFamily:"'Lora',serif", fontSize:"0.85rem", fontWeight:600, cursor:"pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {modalOpen && sel.start && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div style={{ background:"#fff", borderRadius:18, padding:"2rem", width:"100%", maxWidth:420, boxShadow:"0 12px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.5rem", fontWeight:700, color:C.brown, marginBottom:2 }}>{room.name}</div>
            <div style={{ fontSize:"1.05rem", color:C.brown, fontWeight:600, marginBottom:16 }}>{formatDisplay(sel.start)}{sel.end && sel.end !== sel.start ? " to " + formatDisplay(sel.end) : ""}</div>
            {formError && <div style={{ background:"#FDEAEA", color:"#C0392B", borderRadius:7, padding:"8px 12px", fontSize:"0.82rem", marginBottom:12 }}>{formError}</div>}
            {[
              { label:"Your Name", key:"name", placeholder:"e.g. Jane Smith" },
              { label:"Second Guest (optional)", key:"guest2", placeholder:"e.g. John Smith" },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize:"0.75rem", fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4, marginTop:14 }}>{f.label}</div>
                <input value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  onKeyDown={e => f.key === "guest2" && e.key === "Enter" && handleSubmit()}
                  type="text" placeholder={f.placeholder} autoFocus={f.key === "name"}
                  style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #DDD", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.9rem", background:"#FAF7F2", color:C.dark, outline:"none" }} />
              </div>
            ))}
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={() => setModalOpen(false)} style={{ flex:1, padding:"11px", background:"#EAF0EA", color:C.muted, border:"none", borderRadius:8, fontFamily:"'Lora', serif", cursor:"pointer" }}>Back</button>
              <button onClick={handleSubmit} style={{ flex:1, padding:"11px", background:room.color, color:"#fff", border:"none", borderRadius:8, fontFamily:"'Lora', serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer" }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelTarget && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
          onClick={e => e.target === e.currentTarget && setCancelTarget(null)}>
          <div style={{ background:"#fff", borderRadius:18, padding:"2rem", width:"100%", maxWidth:420, boxShadow:"0 12px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.4rem", fontWeight:700, color:C.brown, marginBottom:10 }}>Cancel Booking?</div>
            <div style={{ fontSize:"0.85rem", color:C.muted, marginBottom:20 }}>
              This will cancel {cancelTarget.name}&apos;s stay in {ROOMS.find(r => r.id === cancelTarget.roomId)?.name} ({formatDisplay(cancelTarget.start)} to {formatDisplay(cancelTarget.end)}).
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setCancelTarget(null)} style={{ flex:1, padding:"11px", background:"#EAF0EA", color:C.muted, border:"none", borderRadius:8, fontFamily:"'Lora', serif", cursor:"pointer" }}>Keep Booking</button>
              <button onClick={handleCancel} style={{ flex:1, padding:"11px", background:"#C0392B", color:"#fff", border:"none", borderRadius:8, fontFamily:"'Lora', serif", fontWeight:700, cursor:"pointer" }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
