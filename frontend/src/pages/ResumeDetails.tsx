import { useState } from "react";

interface ResumeDetailsProps {
  onBack: () => void;
    onLogin: () => void;
}



export default function ResumeDetails({
  onBack,
  onLogin,
}: ResumeDetailsProps) { 
  const [activeTab, setActiveTab] = useState<"strengths" | "improvements">("strengths");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleDashboardClick = () => {
  setShowLoginPopup(true);
};


  const skills = [
    { name: "React",      value: 95, barColor: "#3B82F6" },
    { name: "TypeScript", value: 88, barColor: "#6366F1" },
    { name: "Node.js",    value: 82, barColor: "#10B981" },
    { name: "MongoDB",    value: 75, barColor: "#059669" },
    { name: "Docker",     value: 25, barColor: "#EF4444" },
  ];

  const kpis = [
    { label: "ATS Score",       value: "91%", tag: "Excellent",      tagBg: "#ECFDF5", tagColor: "#065F46" },
    { label: "Resume Score",    value: "87%", tag: "Strong Profile",  tagBg: "#EFF6FF", tagColor: "#1E40AF" },
    { label: "Skill Match",     value: "85%", tag: "Industry Ready",  tagBg: "#F5F3FF", tagColor: "#5B21B6" },
    { label: "Interview Ready", value: "88%", tag: "Almost There",    tagBg: "#FFFBEB", tagColor: "#92400E" },
  ];

  const healthItems = [
    { label: "Contact Information",     status: "ok" },
    { label: "Experience Section",      status: "ok" },
    { label: "Projects Section",        status: "ok" },
    { label: "Skills Section",          status: "ok" },
    { label: "Quantified Achievements", status: "warn" },
    { label: "ATS Keyword Optimization",status: "warn" },
  ];

  const strengths = [
    "Strong React & TypeScript skills",
    "Clean, well-structured resume",
    "Active GitHub portfolio",
    "Solid project experience",
  ];

  const improvements = [
    "Add Docker & container experience",
    "Build at least one AWS project",
    "Include quantifiable metrics in results",
    "Add System Design examples",
  ];

  const missingSkills = ["Docker", "AWS", "Kubernetes", "CI/CD"];

  const nextSteps = [
    { icon: "🐳", title: "Docker Fundamentals",  desc: "Complete a hands-on Docker course" },
    { icon: "☁️", title: "AWS Practitioner",      desc: "Earn your Cloud Practitioner cert" },
    { icon: "⚙️", title: "CI/CD Pipeline",        desc: "Build and ship a real pipeline project" },
    { icon: "📐", title: "System Design",          desc: "Practice with mock design interviews" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F5F7", padding: "20px", fontFamily: "sans-serif" }}>

      {/* Back Button */}
     <button
  onClick={handleDashboardClick}
  style={{
    marginBottom: 24,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: "#fff",
    color: "#171C4A",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  }}
>
  Dashboard →
</button>




      {/* Hero */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #171C4A 0%, #232D6E 50%, #394AA0 100%)",
        borderRadius: 24, padding: "40px", color: "#fff",
        boxShadow: "0 20px 60px rgba(23,28,74,0.35)", marginBottom: 24
      }}>
        <div style={{
          position: "absolute", top: -64, right: -64, width: 256, height: 256,
          borderRadius: "50%", background: "rgba(99,102,241,0.2)", filter: "blur(60px)"
        }} />
        <div style={{
          position: "absolute", bottom: -64, left: -64, width: 256, height: 256,
          borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(60px)"
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#A5B4FC", background: "rgba(99,102,241,0.2)",
              padding: "4px 12px", borderRadius: 999, marginBottom: 12
            }}>
              AI Resume Intelligence
            </span>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>
              Your Career Snapshot
            </h1>
            <p style={{ marginTop: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, maxWidth: 440 }}>
              AI-analyzed insights covering ATS performance, skill gaps,
              and personalized career recommendations.
            </p>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20,
            padding: 24, minWidth: 260, maxWidth: 320
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
              AI Verdict
            </p>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 1.75, margin: 0 }}>
              Strong frontend profile with excellent React skills.
              Improving Docker, AWS, and System Design could
              increase employability by{" "}
              <span style={{ color: "#FDE047", fontWeight: 700 }}>18%</span>.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{
            background: "#fff", borderRadius: 20, padding: 20,
            border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
          }}>
            <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              {kpi.label}
            </p>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: "#171C4A", margin: "8px 0 10px" }}>
              {kpi.value}
            </h2>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 700,
              padding: "3px 10px", borderRadius: 8,
              backgroundColor: kpi.tagBg, color: kpi.tagColor
            }}>
              {kpi.tag}
            </span>
          </div>
        ))}
      </div>

      {/* Resume Overview */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#171C4A", margin: "0 0 16px" }}>Resume Overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
          {[
            { label: "Role",        value: "Full Stack Dev" },
            { label: "Experience",  value: "2 Years" },
            { label: "Projects",    value: "8 Projects" },
            { label: "Career Path", value: "Full Stack" },
          ].map((item) => (
            <div key={item.label} style={{ background: "#F4F5F7", borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                {item.label}
              </p>
              <p style={{ fontWeight: 700, color: "#171C4A", fontSize: 14, margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health + Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>

        {/* Health Check */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#171C4A", margin: "0 0 16px" }}>Resume Health Check</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {healthItems.map((item) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", borderRadius: 12, fontSize: 14, fontWeight: 500,
                backgroundColor: item.status === "ok" ? "#ECFDF5" : "#FFFBEB",
                color: item.status === "ok" ? "#065F46" : "#92400E",
              }}>
                <span>{item.status === "ok" ? "✅" : "⚠️"}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Skill Analysis */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#171C4A", margin: "0 0 20px" }}>Skill Analysis</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {skills.map((skill) => (
              <div key={skill.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                  <span style={{ fontWeight: 500, color: "#374151" }}>{skill.name}</span>
                  <span style={{ fontWeight: 700, color: skill.value < 50 ? "#EF4444" : "#6B7280" }}>{skill.value}%</span>
                </div>
                <div style={{ height: 10, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${skill.value}%`, backgroundColor: skill.barColor, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Improvements — Tabbed */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab("strengths")}
            style={{
              padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600,
              border: "none", cursor: "pointer",
              backgroundColor: activeTab === "strengths" ? "#059669" : "#F3F4F6",
              color: activeTab === "strengths" ? "#fff" : "#6B7280",
            }}
          >
            ✅ Strengths
          </button>
          <button
            onClick={() => setActiveTab("improvements")}
            style={{
              padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600,
              border: "none", cursor: "pointer",
              backgroundColor: activeTab === "improvements" ? "#F59E0B" : "#F3F4F6",
              color: activeTab === "improvements" ? "#fff" : "#6B7280",
            }}
          >
            ⚠️ Areas to Improve
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {(activeTab === "strengths" ? strengths : improvements).map((item) => (
            <div key={item} style={{
              padding: 16, borderRadius: 12, fontSize: 14, fontWeight: 500,
              border: `1px solid ${activeTab === "strengths" ? "#A7F3D0" : "#FDE68A"}`,
              backgroundColor: activeTab === "strengths" ? "#ECFDF5" : "#FFFBEB",
              color: activeTab === "strengths" ? "#065F46" : "#92400E",
            }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#171C4A", margin: "0 0 4px" }}>Missing Skills</h2>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 16px" }}>High-demand skills not yet on your resume</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {missingSkills.map((skill) => (
            <span key={skill} style={{
              padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700,
              backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A"
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Market Insight */}
      <div style={{
        background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
        borderRadius: 20, padding: 28, color: "#fff",
        boxShadow: "0 8px 30px rgba(79,70,229,0.35)", marginBottom: 24
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.2)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
          }}>📊</div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>AI Market Insight</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>Based on 5,000+ job descriptions</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { icon: "🚀", text: "React demand up 24% this quarter" },
            { icon: "⚠️", text: "Docker listed in 87% of job postings" },
            { icon: "💰", text: "AWS skills boost salary potential by 20%" },
          ].map((insight) => (
            <div key={insight.text} style={{
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: 16, fontSize: 13, lineHeight: 1.6
            }}>
              <span style={{ marginRight: 8 }}>{insight.icon}</span>{insight.text}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div style={{
        background: "#171C4A", borderRadius: 20, padding: 28, color: "#fff",
        boxShadow: "0 8px 30px rgba(23,28,74,0.4)", marginBottom: 8
      }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 4px" }}>Recommended Next Steps</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>
          Prioritized actions to maximize your career growth
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {nextSteps.map((step, i) => (
            <div key={step.title} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, padding: 16
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.12)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 3px", color: "#fff" }}>{step.title}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>{step.desc}</p>
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", flexShrink: 0 }}>
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>






{showLoginPopup && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
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
        onClick={() => setShowLoginPopup(false)}
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
          fontWeight: 700,
          color: "#171C4A",
          marginTop: 12,
        }}
      >
        Analysis Completed!
      </h2>

      <p
        style={{
          color: "#6B7280",
          marginTop: 12,
          lineHeight: 1.6,
        }}
      >
        Sign in to unlock Dashboard, Skill Gap Analysis,
        Personalized Roadmap and AI Recommendations.
      </p>

      <button
        onClick={onLogin}
        style={{
          marginTop: 24,
          width: "100%",
          padding: "12px",
          borderRadius: 12,
          border: "none",
          background: "#7C3AED",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Sign In to Continue
      </button>
    </div>
  </div>
)}


    </div>
  );
}
