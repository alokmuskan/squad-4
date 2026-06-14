import { useRef, useState, useEffect } from "react";

interface ResumeAnalysisProps {
  onLogin: () => void;
  onDashboard: () => void;
  onBack: () => void;
  initialTab?: "upload" | "details";
}

/* ─────────────────── shared data ─────────────────── */
const analysisSteps = [
  { label: "Parsing Resume",             icon: "📄", detail: "Reading document structure..." },
  { label: "Extracting Skills",          icon: "🧠", detail: "Identifying technical keywords..." },
  { label: "Analysing Experience",       icon: "🔍", detail: "Mapping roles & impact..." },
  { label: "Calculating ATS Score",      icon: "🤖", detail: "Running recruiter filters..." },
  { label: "Generating Recommendations", icon: "✨", detail: "Building your roadmap..." },
];

const skills = [
  { name: "React",      value: 95, barColor: "#A78BFA" },
  { name: "TypeScript", value: 88, barColor: "#60A5FA" },
  { name: "Node.js",    value: 82, barColor: "#34D399" },
  { name: "MongoDB",    value: 75, barColor: "#FBBF24" },
  { name: "Docker",     value: 25, barColor: "#F87171" },
];

const kpis = [
  { label: "ATS Score",       value: "91%", tag: "Excellent",      tagBg: "#ECFDF5", tagColor: "#065F46" },
  { label: "Resume Score",    value: "87%", tag: "Strong Profile",  tagBg: "#EFF6FF", tagColor: "#1E40AF" },
  { label: "Skill Match",     value: "85%", tag: "Industry Ready",  tagBg: "#F5F3FF", tagColor: "#5B21B6" },
  { label: "Interview Ready", value: "88%", tag: "Almost There",    tagBg: "#FFFBEB", tagColor: "#92400E" },
];

const healthItems = [
  { label: "Contact Information",      status: "ok" },
  { label: "Experience Section",       status: "ok" },
  { label: "Projects Section",         status: "ok" },
  { label: "Skills Section",           status: "ok" },
  { label: "Quantified Achievements",  status: "warn" },
  { label: "ATS Keyword Optimization", status: "warn" },
];

const strengths    = ["Strong React & TypeScript skills","Clean, well-structured resume","Active GitHub portfolio","Solid project experience"];
const improvements = ["Add Docker & container experience","Build at least one AWS project","Include quantifiable metrics","Add System Design examples"];
const missingSkills = ["Docker", "AWS", "Kubernetes", "CI/CD"];

const nextSteps = [
  { icon: "🐳", title: "Docker Fundamentals", desc: "Complete a hands-on Docker course" },
  { icon: "☁️", title: "AWS Practitioner",     desc: "Earn your Cloud Practitioner cert" },
  { icon: "⚙️", title: "CI/CD Pipeline",       desc: "Build and ship a real pipeline project" },
  { icon: "📐", title: "System Design",         desc: "Practice with mock design interviews" },
];

const scoreCards = [
  { label: "Resume Score", value: 87, color: "#A78BFA", suffix: "" },
  { label: "ATS Score",    value: 91, color: "#34D399", suffix: "%" },
  { label: "Skill Match",  value: 85, color: "#60A5FA", suffix: "%" },
  { label: "Interview",    value: 72, color: "#FBBF24", suffix: "%" },
];


/* ─────────────────── micro helpers ─────────────────── */
function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
 

  useEffect(() => {
    let s = 0;
    const step = Math.ceil(to / (duration / 16));
    const t = setInterval(() => { s = Math.min(s + step, to); setVal(s); if (s >= to) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [to, duration]);
  return <>{val}</>;
}

function Ring({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDrawn(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff20" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={circ - (circ * drawn) / 100}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function ResumeAnalysis({ onLogin, onDashboard, onBack, initialTab = "upload" }: ResumeAnalysisProps) {
  const [tab, setTab]               = useState<"upload" | "details">(initialTab);
  const [fileName, setFileName]     = useState("");
  const [analyzed, setAnalyzed]     = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showPopup, setShowPopup]   = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [activeInsightTab, setActiveInsightTab] = useState<"strengths" | "improvements">("strengths");
  const fileInputRef = useRef<HTMLInputElement>(null);
 const [showDashboardPopup, setShowDashboardPopup] = useState(false);

  function handleFile(file: File) { setFileName(file.name); }

  function startAnalysis() {
    if (!fileName || isAnalyzing) return;
    setIsAnalyzing(true); setCurrentStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++; setCurrentStep(s);
      if (s >= analysisSteps.length) {
        clearInterval(iv);
        setTimeout(() => {
          setIsAnalyzing(false); setAnalyzed(true);
          setTimeout(() => setShowPopup(true), 400);
        }, 500);
      }
    }, 900);
  }

  /* ── shared page shell ── */
  return (
    <section style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg, #0D1036 0%, #1A2060 50%, #0D1036 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* ambient orbs */}
      <div style={{ position:"absolute", top:-120, left:-80, width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle,#7C3AED33 0%,transparent 70%)", animation:"orb 7s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-100, right:-60, width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,#1D4ED833 0%,transparent 70%)", animation:"orb 9s ease-in-out infinite 2s", pointerEvents:"none" }} />

      <style>{`
        @keyframes orb  { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:1} }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn{ from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(.85)} 70%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        .fu { animation: fadeUp .55s ease both }
        .si { animation: slideIn .45s ease both }
        .pi { animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both }
      `}</style>

      <div style={{ position:"relative", zIndex:10, maxWidth:1100, margin:"0 auto", padding:"36px 24px" }}>

        {/* ── top bar: back + tab switcher ── */}
        <div className="fu" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            ← Back
          </button>

          {/* TAB SWITCHER */}
          <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:16, padding:4 }}>
            {([
              { key:"upload",  label:"📤 Upload & Analyse" },
              { key:"details", label:"📊 Detailed Results" },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding:"8px 20px", borderRadius:12, fontSize:13, fontWeight:700,
                  border:"none", cursor:"pointer", transition:"all .25s ease",
                  background: tab === key ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "transparent",
                  color: tab === key ? "#fff" : "rgba(255,255,255,0.45)",
                  boxShadow: tab === key ? "0 4px 16px #7C3AED55" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* dashboard shortcut */}
          <button onClick={() => setShowDashboardPopup(true)} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, padding:"8px 16px", borderRadius:12, cursor:"pointer" }}>
            Dashboard →
          </button>
        </div>

        {/* ══════════════ TAB: UPLOAD ══════════════ */}
        {tab === "upload" && (
          <div>
            {/* header */}
            <div className="fu" style={{ marginBottom:28, animationDelay:".04s" }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:"#A78BFA", margin:"0 0 8px" }}>
                AI-Powered Career Intelligence
              </p>
              <h1 style={{ fontSize:38, fontWeight:900, color:"#fff", margin:"0 0 10px", lineHeight:1.15 }}>
                Resume & GitHub Analysis
              </h1>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:15, maxWidth:520, margin:0, lineHeight:1.7 }}>
                Drop your resume and let our AI surface skill gaps, ATS readiness, and a personalised learning path — in under 30 seconds.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

              {/* LEFT: upload panel */}
              <div className="fu" style={{
                animationDelay:".08s", borderRadius:28, padding:28,
                background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                backdropFilter:"blur(20px)", display:"flex", flexDirection:"column", gap:20,
              }}>
                {/* dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border:`2px dashed ${dragOver?"#A78BFA":"rgba(255,255,255,0.18)"}`,
                    background: dragOver?"rgba(167,139,250,0.08)":"rgba(255,255,255,0.03)",
                    borderRadius:20, padding:"32px 20px", textAlign:"center", cursor:"pointer",
                    transition:"all .25s ease",
                  }}
                >
                  <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} style={{ display:"none" }}
                    onChange={(e) => { const f=e.target.files?.[0]; if(f) handleFile(f); }} />
                  <div style={{ fontSize:44, filter:dragOver?"drop-shadow(0 0 12px #A78BFA)":"none", transition:"filter .3s" }}>
                    {fileName ? "📋" : "📤"}
                  </div>
                  {fileName ? (
                    <div style={{ marginTop:10 }}>
                      <p style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{fileName}</p>
                      <p style={{ color:"#34D399", fontSize:12, marginTop:4 }}>✓ Ready to analyse</p>
                    </div>
                  ) : (
                    <>
                      <p style={{ color:"#fff", fontWeight:600, marginTop:10, fontSize:14 }}>Drop your resume here</p>
                      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:4 }}>PDF or DOCX · max 10 MB</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        style={{ marginTop:16, padding:"10px 24px", borderRadius:999, fontSize:13, fontWeight:700, color:"#fff", border:"none", cursor:"pointer", background:"linear-gradient(135deg,#7C3AED,#4F46E5)", boxShadow:"0 4px 20px #7C3AED55" }}
                      >
                        Choose File
                      </button>
                    </>
                  )}
                </div>

                {/* divider */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }} />
                  <span style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>OR</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }} />
                </div>

                {/* github */}
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ color:"#fff", fontWeight:600, fontSize:14, margin:0 }}>Connect GitHub</p>
                    <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12, margin:"3px 0 0" }}>Analyse repos & coding patterns</p>
                  </div>
                  <button style={{ padding:"8px 18px", borderRadius:999, fontSize:13, fontWeight:600, color:"#fff", border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", cursor:"pointer" }}>
                    🐙 Connect
                  </button>
                </div>

                {/* step progress */}
                {isAnalyzing && (
                  <div className="si" style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:18, padding:20 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                      <div style={{ width:16, height:16, border:"2px solid #A78BFA", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                      <p style={{ color:"#A78BFA", fontWeight:700, fontSize:14, margin:0 }}>AI Processing…</p>
                    </div>
                    {analysisSteps.map((step, i) => {
                      const done = i < currentStep, active = i === currentStep;
                      return (
                        <div key={step.label} className="si" style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, animationDelay:`${i*.05}s` }}>
                          <span style={{ fontSize:14, opacity: done?1:active?1:.3 }}>{done?"✅":active?step.icon:"○"}</span>
                          <div>
                            <p style={{ margin:0, fontSize:13, fontWeight:600, color: done?"#34D399":active?"#fff":"rgba(255,255,255,0.3)" }}>{step.label}</p>
                            {active && <p style={{ margin:"2px 0 0", fontSize:11, color:"#A78BFA" }}>{step.detail}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CTA */}
                <button
                  disabled={!fileName || isAnalyzing}
                  onClick={startAnalysis}
                  style={{
                    width:"100%", padding:"16px 0", borderRadius:18, fontSize:16, fontWeight:900, border:"none", cursor: fileName&&!isAnalyzing?"pointer":"not-allowed",
                    background: fileName&&!isAnalyzing ? "linear-gradient(135deg,#FBBF24,#F59E0B)" : "rgba(255,255,255,0.08)",
                    color: fileName&&!isAnalyzing ? "#1A1A1A" : "rgba(255,255,255,0.3)",
                    boxShadow: fileName&&!isAnalyzing ? "0 6px 28px #FBBF2455" : "none",
                    transition:"all .3s ease",
                  }}
                >
                  {isAnalyzing ? "Analysing…" : "Analyse My Profile →"}
                </button>
              </div>

              {/* RIGHT: score preview */}
              <div className="fu" style={{
                animationDelay:".14s", borderRadius:28, padding:28,
                background: analyzed ? "linear-gradient(145deg,#1E1B4B,#312E81)" : "linear-gradient(145deg,#171C4A,#1E2560)",
                border:"1px solid rgba(255,255,255,0.12)", display:"flex", flexDirection:"column", gap:20,
                transition:"background 1s ease",
              }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:"#A78BFA", margin:"0 0 4px" }}>
                    {analyzed ? "Your Results" : "Preview"}
                  </p>
                  <h2 style={{ fontSize:24, fontWeight:900, color:"#fff", margin:"0 0 4px" }}>
                    {analyzed ? "Analysis Complete" : "AI Analysis Preview"}
                  </h2>
                  <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12, margin:0 }}>
                    {analyzed ? `Scanned: ${fileName}` : "Upload a resume to see your real scores"}
                  </p>
                </div>

                {/* ring cards */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {scoreCards.map(({ label, value, color, suffix }) => (
                    <div key={label} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:16, display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ position:"relative", width:64, height:64, flexShrink:0 }}>
                        <Ring pct={analyzed ? value : 0} color={color} size={64} />
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color }}>
                          {analyzed ? <><Counter to={value} />{suffix}</> : "--"}
                        </div>
                      </div>
                      <div>
                        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:11, margin:"0 0 2px" }}>{label}</p>
                        <p style={{ color:"#fff", fontWeight:700, fontSize:13, margin:0 }}>
                          {analyzed ? (value>=85?"Excellent":value>=70?"Good":"Needs work") : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* missing skills */}
                <div style={{
                  background: analyzed?"rgba(52,211,153,0.12)":"rgba(251,191,36,0.1)",
                  border:`1px solid ${analyzed?"rgba(52,211,153,0.3)":"rgba(251,191,36,0.2)"}`,
                  borderRadius:18, padding:18, transition:"all .5s ease",
                }}>
                  <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".15em", color: analyzed?"#34D399":"#FBBF24", margin:"0 0 10px" }}>
                    {analyzed ? "🎯 Skills to Acquire" : "💡 Example gaps"}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {(analyzed ? missingSkills : ["Docker","AWS","AI/ML"]).map((s) => (
                      <span key={s} className="pi" style={{ padding:"6px 14px", borderRadius:999, fontSize:12, fontWeight:600, color:"#fff", background:"rgba(255,255,255,0.12)" }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* strengths — post analysis */}
                {analyzed && (
                  <div className="fu" style={{ background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.25)", borderRadius:18, padding:18 }}>
                    <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".15em", color:"#60A5FA", margin:"0 0 10px" }}>💪 Your Strengths</p>
                    {["React & Frontend","REST API Design","Problem Solving"].map((s,i) => (
                      <div key={s} className="si" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, animationDelay:`${i*.07}s` }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:"#60A5FA", flexShrink:0 }} />
                        <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, margin:0 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* see full results CTA */}
                {analyzed && (
                  <button
                    onClick={() => setTab("details")}
                    style={{ width:"100%", padding:"14px 0", borderRadius:16, fontSize:14, fontWeight:800, border:"none", cursor:"pointer", background:"rgba(167,139,250,0.2)", color:"#A78BFA", transition:"all .25s" }}
                  >
                    View Detailed Results →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB: DETAILS ══════════════ */}
        {tab === "details" && (
          <div className="fu">
            {!analyzed && (
              <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.35)" }}>
                <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
                <p style={{ fontSize:18, fontWeight:700, color:"rgba(255,255,255,0.6)" }}>No analysis yet</p>
                <p style={{ fontSize:14, marginTop:8 }}>Upload and analyse your resume first to see detailed results.</p>
                <button onClick={() => setTab("upload")} style={{ marginTop:20, padding:"12px 28px", borderRadius:14, fontSize:14, fontWeight:700, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#7C3AED,#4F46E5)", color:"#fff", boxShadow:"0 4px 20px #7C3AED44" }}>
                  Go to Upload →
                </button>
              </div>
            )}

            {analyzed && (
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* Hero banner */}
                <div style={{ position:"relative", overflow:"hidden", background:"linear-gradient(135deg,#171C4A,#232D6E,#394AA0)", borderRadius:24, padding:"36px 32px", color:"#fff", boxShadow:"0 20px 60px rgba(23,28,74,0.4)" }}>
                  <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(99,102,241,0.2)", filter:"blur(50px)" }} />
                  <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", gap:24, justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ flex:1, minWidth:220 }}>
                      <span style={{ display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#A5B4FC", background:"rgba(99,102,241,0.2)", padding:"4px 12px", borderRadius:999, marginBottom:12 }}>
                        AI Resume Intelligence
                      </span>
                      <h1 style={{ fontSize:36, fontWeight:900, margin:"0 0 10px", lineHeight:1.15 }}>Your Career Snapshot</h1>
                      <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, lineHeight:1.7, maxWidth:400, margin:0 }}>
                        AI-analyzed insights covering ATS performance, skill gaps, and personalised career recommendations.
                      </p>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:20, minWidth:240, maxWidth:300 }}>
                      <p style={{ fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", margin:"0 0 8px" }}>AI Verdict</p>
                      <p style={{ color:"rgba(255,255,255,0.8)", fontSize:13, lineHeight:1.75, margin:0 }}>
                        Strong frontend profile with excellent React skills. Improving Docker, AWS, and System Design could increase employability by{" "}
                        <span style={{ color:"#FDE047", fontWeight:700 }}>18%</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* KPI cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                  {kpis.map((kpi) => (
                    <div key={kpi.label} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:20, backdropFilter:"blur(12px)" }}>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:".08em", margin:0 }}>{kpi.label}</p>
                      <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", margin:"8px 0 10px" }}>{kpi.value}</h2>
                      <span style={{ display:"inline-block", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:8, backgroundColor:kpi.tagBg, color:kpi.tagColor }}>{kpi.tag}</span>
                    </div>
                  ))}
                </div>

                {/* resume overview */}
                <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:24, backdropFilter:"blur(12px)" }}>
                  <h2 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 14px" }}>Resume Overview</h2>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                    {[
                      { label:"Role",        value:"Full Stack Dev" },
                      { label:"Experience",  value:"2 Years" },
                      { label:"Projects",    value:"8 Projects" },
                      { label:"Career Path", value:"Full Stack" },
                    ].map((item) => (
                      <div key={item.label} style={{ background:"rgba(255,255,255,0.06)", borderRadius:14, padding:16 }}>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 4px" }}>{item.label}</p>
                        <p style={{ fontWeight:700, color:"#fff", fontSize:14, margin:0 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* health check + skill analysis */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:24 }}>
                    <h2 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 14px" }}>Resume Health Check</h2>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {healthItems.map((item) => (
                        <div key={item.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, fontSize:13, fontWeight:500, backgroundColor: item.status==="ok"?"rgba(52,211,153,0.12)":"rgba(251,191,36,0.12)", color: item.status==="ok"?"#34D399":"#FBBF24", border:`1px solid ${item.status==="ok"?"rgba(52,211,153,0.25)":"rgba(251,191,36,0.25)"}` }}>
                          <span>{item.status==="ok"?"✅":"⚠️"}</span>{item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:24 }}>
                    <h2 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 18px" }}>Skill Analysis</h2>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      {skills.map((skill) => (
                        <div key={skill.name}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
                            <span style={{ fontWeight:500, color:"rgba(255,255,255,0.75)" }}>{skill.name}</span>
                            <span style={{ fontWeight:700, color: skill.value<50?"#F87171":"rgba(255,255,255,0.5)" }}>{skill.value}%</span>
                          </div>
                          <div style={{ height:8, background:"rgba(255,255,255,0.1)", borderRadius:999, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${skill.value}%`, backgroundColor:skill.barColor, borderRadius:999, transition:"width 1s ease" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* strengths / improvements tabs */}
                <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:24 }}>
                  <div style={{ display:"flex", gap:8, marginBottom:18 }}>
                    {([
                      { key:"strengths",    label:"✅ Strengths",        color:"#34D399" },
                      { key:"improvements", label:"⚠️ Areas to Improve", color:"#FBBF24" },
                    ] as const).map(({ key, label, color }) => (
                      <button key={key} onClick={() => setActiveInsightTab(key)} style={{ padding:"8px 18px", borderRadius:12, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", transition:"all .2s", background: activeInsightTab===key ? color : "rgba(255,255,255,0.08)", color: activeInsightTab===key ? "#1A1A1A" : "rgba(255,255,255,0.4)" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                    {(activeInsightTab==="strengths" ? strengths : improvements).map((item) => (
                      <div key={item} style={{ padding:"14px 16px", borderRadius:14, fontSize:13, fontWeight:500, border:`1px solid ${activeInsightTab==="strengths"?"rgba(52,211,153,0.3)":"rgba(251,191,36,0.3)"}`, background: activeInsightTab==="strengths"?"rgba(52,211,153,0.1)":"rgba(251,191,36,0.1)", color: activeInsightTab==="strengths"?"#34D399":"#FBBF24" }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* missing skills */}
                <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:24 }}>
                  <h2 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 4px" }}>Missing Skills</h2>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", margin:"0 0 14px" }}>High-demand skills not yet on your resume</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                    {missingSkills.map((s) => (
                      <span key={s} style={{ padding:"8px 18px", borderRadius:999, fontSize:13, fontWeight:700, background:"rgba(251,191,36,0.15)", color:"#FBBF24", border:"1px solid rgba(251,191,36,0.3)" }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* AI Market Insight */}
                <div style={{ background:"linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius:20, padding:28, color:"#fff", boxShadow:"0 8px 30px rgba(79,70,229,0.35)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📊</div>
                    <div>
                      <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>AI Market Insight</h2>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", margin:0 }}>Based on 5,000+ job descriptions</p>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                    {[
                      { icon:"🚀", text:"React demand up 24% this quarter" },
                      { icon:"⚠️", text:"Docker listed in 87% of job postings" },
                      { icon:"💰", text:"AWS skills boost salary potential by 20%" },
                    ].map((insight) => (
                      <div key={insight.text} style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:16, fontSize:13, lineHeight:1.6 }}>
                        <span style={{ marginRight:8 }}>{insight.icon}</span>{insight.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:28 }}>
                  <h2 style={{ fontSize:18, fontWeight:700, color:"#fff", margin:"0 0 4px" }}>Recommended Next Steps</h2>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", margin:"0 0 20px" }}>Prioritised actions to maximise your career growth</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
                    {nextSteps.map((step, i) => (
                      <div key={step.title} style={{ display:"flex", alignItems:"flex-start", gap:14, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:18 }}>
                        <div style={{ width:38, height:38, borderRadius:12, background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{step.icon}</div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700, fontSize:14, margin:"0 0 3px", color:"#fff" }}>{step.title}</p>
                          <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:0 }}>{step.desc}</p>
                        </div>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)", fontFamily:"monospace", flexShrink:0 }}>0{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SUCCESS POPUP ── */}
      {showPopup && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
          <div className="pi" style={{ background:"#fff", borderRadius:32, padding:36, maxWidth:380, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:60 }}>🎉</div>
              <h2 style={{ fontSize:24, fontWeight:900, color:"#171C4A", margin:"12px 0 8px" }}>Analysis Complete!</h2>
              <p style={{ color:"#9CA3AF", fontSize:13 }}>Your resume scored 87 — well above average.</p>
            </div>
            <div style={{ marginTop:20, background:"#F4EFD8", borderRadius:20, padding:20 }}>
              <p style={{ fontWeight:700, color:"#171C4A", fontSize:14, margin:"0 0 12px" }}>Unlock with a free account:</p>
              {[["🚀","Personalised Learning Roadmaps"],["🐙","GitHub Skill Analysis"],["🏆","XP & Progress Tracking"],["🎯","AI Mock Interviews"],["📚","Daily Learning Missions"]].map(([icon,text]) => (
                <div key={text} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#171C4A", marginBottom:8 }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={() => { setShowPopup(false); setTab("details"); }} style={{ width:"100%", padding:"14px 0", borderRadius:18, fontSize:14, fontWeight:800, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#7C3AED,#4F46E5)", color:"#fff", boxShadow:"0 6px 24px #7C3AED44" }}>
                View Detailed Results →
              </button>
              <button onClick={() => { setShowPopup(false); setShowSignup(true); }} style={{ width:"100%", padding:"14px 0", borderRadius:18, fontSize:14, fontWeight:800, border:"2px solid #171C4A", cursor:"pointer", background:"transparent", color:"#171C4A" }}>
                Create Free Account →
              </button>
            </div>
          </div>
        </div>
      )}




{showDashboardPopup && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: 32,
        width: 420,
        maxWidth: "90%",
        textAlign: "center",
        position: "relative",
      }}
    >
      <button
        onClick={() => setShowDashboardPopup(false)}
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          border: "none",
          background: "none",
          fontSize: 24,
          cursor: "pointer",
        }}
      >
        ×
      </button>

      <div style={{ fontSize: 60 }}>🎉</div>

      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#171C4A",
          marginTop: 10,
        }}
      >
        Analysis Completed!
      </h2>

      <p
        style={{
          color: "#6B7280",
          marginTop: 10,
          lineHeight: 1.6,
        }}
      >
        Sign in to unlock your Dashboard, Skill Gap Analysis,
        Personalized Learning Roadmap and AI Recommendations.
      </p>

      <button
        onClick={() => {
          setShowDashboardPopup(false);
          onLogin();
        }}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "14px",
          border: "none",
          borderRadius: 14,
          background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Sign In To Continue →
      </button>
    </div>
  </div>
)}



      {/* ── SIGN UP POPUP ── */}
      {showSignup && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
          <div className="pi" style={{ background:"#fff", borderRadius:32, padding:32, maxWidth:380, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:52 }}>🚀</div>
              <h2 style={{ fontSize:22, fontWeight:900, color:"#171C4A", margin:"10px 0 6px" }}>Create Account</h2>
              <p style={{ color:"#9CA3AF", fontSize:13 }}>Unlock personalised roadmaps & more</p>
            </div>
            <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:12 }}>
              {["Full Name","Email Address","Password"].map((ph,i) => (
                <input key={ph} type={i===2?"password":i===1?"email":"text"} placeholder={ph}
                  style={{ width:"100%", border:"1px solid #E5E7EB", borderRadius:16, padding:"12px 16px", fontSize:14, outline:"none", boxSizing:"border-box" }} />
              ))}
              <button onClick={onDashboard} style={{ width:"100%", padding:"14px 0", borderRadius:18, fontSize:14, fontWeight:800, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#7C3AED,#4F46E5)", color:"#fff", boxShadow:"0 6px 24px #7C3AED44" }}>
                Create Account →
              </button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}>
              <div style={{ flex:1, height:1, background:"#eee" }} />
              <span style={{ color:"#9CA3AF", fontSize:12 }}>OR</span>
              <div style={{ flex:1, height:1, background:"#eee" }} />
            </div>
            <button style={{ width:"100%", border:"1px solid #E5E7EB", borderRadius:16, padding:"12px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontSize:13, background:"#fff", cursor:"pointer" }}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width:18, height:18 }} />
              Continue with Google
            </button>
            <p style={{ textAlign:"center", marginTop:18, color:"#9CA3AF", fontSize:13 }}>
              Already have an account?{" "}
              <span onClick={() => { setShowSignup(false); onLogin(); }} style={{ fontWeight:700, color:"#171C4A", cursor:"pointer" }}>Sign In</span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
