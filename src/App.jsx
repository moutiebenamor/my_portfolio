import { useState, useEffect, useRef, useCallback } from "react";
import Landing3D from "./components/Landing3D";
import MouseTrail from "./components/MouseTrail";
import PageTransition from "./components/PageTransition";
import Scroll3D from "./components/Scroll3D";
import LoadingScreen from "./components/LoadingScreen";
import SkeletonLoader from "./components/SkeletonLoader";
import { FloatingShapes, AnimatedText, EnhancedSkillBar, InteractiveProjectCard, ScrollProgress } from "./components/LogicalEnhancements";

// ─── ICONS ────────────────────────────────────────────────────────────────
const GithubIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ─── ZUSTAND-LIKE STATE (inline for single file) ───────────────────────────
let modeListeners = [];
let currentMode = "entry";
const modeStore = {
  get: () => currentMode,
  set: (m) => { currentMode = m; modeListeners.forEach(fn => fn(m)); },
  subscribe: (fn) => { modeListeners.push(fn); return () => { modeListeners = modeListeners.filter(f => f !== fn); }; }
};

function useMode() {
  const [mode, setMode] = useState(modeStore.get());
  useEffect(() => modeStore.subscribe(setMode), []);
  return [mode, modeStore.set];
}

// ─── PARTICLE SYSTEM ───────────────────────────────────────────────────────
function ParticleCanvas({ active, fromLogical }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = 180;
    particles.current = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: Math.random() * 3 + 1,
      opacity: Math.random(),
      hue: fromLogical ? Math.random() * 60 + 180 : Math.random() * 60 + 30,
    }));

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isFromLogical = fromLogical;
      const particleStyle = isFromLogical ? "80%, 70%" : "90%, 60%";
      const connectionStyle = isFromLogical ? "200, 80%, 70%" : "40, 90%, 60%";

      // Update and Draw Particles in one pass
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${particleStyle}, ${p.opacity})`;
        ctx.fill();
      });

      // Batch Connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.current.length; i++) {
        const pi = particles.current[i];
        for (let j = i + 1; j < particles.current.length; j++) {
          const pj = particles.current[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 6400) { // 80 * 80
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${connectionStyle}, ${0.3 * (1 - dist / 80)})`;
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, fromLogical]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }} />;
}

// ─── SHADER BACKGROUND (CSS variable driven) ─────────────────────────────
function ShaderBg() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      background: `radial-gradient(ellipse at var(--mx, 50%) var(--my, 50%), #1a0533 0%, #0a0015 40%, #000308 100%)`,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(120,0,255,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0,200,255,0.1) 0%, transparent 40%),
          radial-gradient(circle at 60% 80%, rgba(255,0,150,0.1) 0%, transparent 40%)
        `,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(120,0,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120,0,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
    </div>
  );
}

// ─── ENTRY SCREEN ──────────────────────────────────────────────────────────
function EntryScreen({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => { setTimeout(() => setEntered(true), 100); }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", zIndex: 50,
      background: "#000308", fontFamily: "'Courier New', monospace",
      opacity: entered ? 1 : 0, transition: "opacity 0.8s",
    }}>
      {/* Noise Texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none",
        opacity: 0.03, mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/1000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Animated background lines */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{
            position: "absolute", left: `${i * 5.26}%`, top: 0, bottom: 0,
            width: "1px", background: "rgba(120,0,255,0.08)",
            animation: `pulse ${2 + i * 0.1}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Glitch title */}
        <div style={{
          fontSize: "clamp(12px, 2vw, 18px)", letterSpacing: "0.4em",
          color: "rgba(120,0,255,0.6)", marginBottom: "24px", textTransform: "uppercase",
        }}>
          ◈ PERSONA SPLIT ◈
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 7vw, 96px)", fontFamily: "'Georgia', serif",
          fontWeight: 400, color: "#fff", margin: "0 0 12px",
          letterSpacing: "-0.02em", lineHeight: 1,
        }}>
          Ben Amor Moutie
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.4)", fontSize: "clamp(14px, 2vw, 18px)",
          letterSpacing: "0.2em", marginBottom: "72px",
        }}>
          UI/UX DESIGNER & Web Developer
        </p>

        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: "14px",
          marginBottom: "48px", letterSpacing: "0.1em",
        }}>
          How do you want to see me?
        </p>

        <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { id: "logical", label: "RECRUITER", sub: "Structured · Professional", icon: "⬡", color: "#4a9eff" },
            { id: "creative", label: "CREATIVE DIRECTOR", sub: "Experimental · Immersive", icon: "◈", color: "#bf00ff" },
            { id: "split", label: "CURIOUS", sub: "Show me everything", icon: "◫", color: "#00ffaa" },
          ].map(opt => (
            <button key={opt.id}
              onMouseEnter={() => setHovered(opt.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(opt.id === "split" ? "logical" : opt.id)}
              style={{
                background: hovered === opt.id ? `${opt.color}18` : "transparent",
                border: `1px solid ${hovered === opt.id ? opt.color : "rgba(255,255,255,0.15)"}`,
                color: hovered === opt.id ? opt.color : "rgba(255,255,255,0.6)",
                padding: "24px 32px", cursor: "pointer",
                transition: "all 0.3s", minWidth: "160px",
                transform: hovered === opt.id ? "translateY(-4px)" : "none",
                boxShadow: hovered === opt.id ? `0 0 30px ${opt.color}30` : "none",
              }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{opt.icon}</div>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", marginBottom: "6px" }}>{opt.label}</div>
              <div style={{ fontSize: "11px", opacity: 0.6 }}>{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  );
}

// ─── TRANSITION OVERLAY ────────────────────────────────────────────────────
function TransitionOverlay({ active, fromLogical }) {
  const [phase, setPhase] = useState(0);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (!active) { 
      setPhase(0);
      setScale(1);
      return; 
    }
    setPhase(1);
    setScale(0.8);
    setTimeout(() => setPhase(2), 500);
    setTimeout(() => setPhase(3), 1000);
  }, [active]);

  if (!active && phase === 0) return null;
  
  const bgColor = fromLogical ? "#0a0015" : "#ffffff";
  const textColor = fromLogical ? "#bf00ff" : "#111";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Full screen overlay with fade */}
      <div style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        background: bgColor,
        opacity: phase === 1 ? 1 : (phase === 2 ? 1 : 0),
        transform: `scale(${scale})`,
        transition: "opacity 0.5s ease-in-out, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
      
      {/* Particle burst effect */}
      <ParticleCanvas active={phase === 1 || phase === 2} fromLogical={fromLogical} />
      
      {/* Center text with zoom effect */}
      <div style={{
        position: "relative", zIndex: 10,
        opacity: phase === 1 ? 1 : (phase === 2 ? 0.5 : 0),
        transform: phase === 1 ? "scale(1)" : (phase === 2 ? "scale(1.5)" : "scale(0.8)"),
        transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "clamp(24px,5vw,64px)", 
          fontFamily: "monospace", 
          letterSpacing: "0.3em",
          color: textColor,
          marginBottom: "16px",
        }}>
          {fromLogical ? "◈" : "⬡"}
        </div>
        <div style={{
          fontSize: "clamp(16px,3vw,32px)", 
          fontFamily: "monospace", 
          letterSpacing: "0.2em",
          color: textColor,
          opacity: 0.8,
        }}>
          SWITCHING
        </div>
      </div>
      
      {/* Blur effect on content */}
      <div style={{
        position: "absolute", inset: 0,
        backdropFilter: phase === 1 ? "blur(20px)" : "blur(0px)",
        transition: "backdrop-filter 0.5s ease-in-out",
        opacity: phase === 1 ? 0.3 : 0,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── LOGICAL MODE ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const PROJECTS_DATA = [
  { title: "Agency Portfolio", type: "Fullstack Web", year: "2026", desc: "Modern digital agency website showcasing web, mobile, UI/UX, and AI services with optimized performance.", tags: ["TypeScript", "React", "AI"], color: "#4a9eff", link: "https://github.com/moutiebenamor/agency-portfolio" },
  { title: "TKM E-Commerce", type: "Bilingual Platform", year: "2025", desc: "A robust Tunisian Kuwaiti House e-commerce platform with secure checkout and scalable frontend architecture.", tags: ["React", "E-Commerce", "i18n"], color: "#00c896", link: "https://github.com/moutiebenamor/tkm-ecommerce" },
  { title: "Hyper Scroll", type: "Creative Experiment", year: "2025", desc: "A high-fidelity immersive scrolling experience utilizing advanced canvas techniques and micro-interactions.", tags: ["JavaScript", "Canvas", "Aesthetics"], color: "#bf00ff", link: "https://github.com/moutiebenamor/HYPER_SCROLL" },
  { title: "Voice Assistant", type: "AI Tool", year: "2025", desc: "A modular desktop voice assistant featuring intent detection, memory, and proactive agent capabilities.", tags: ["Python", "NLP", "AI"], color: "#ff6b35", link: "https://github.com/moutiebenamor/voice-desktop-assistant" },
  { title: "CafeNoBistro", type: "Web Platform", year: "2025", desc: "Restaurant platform with precise UI and structured component architecture for seamless user experience.", tags: ["TypeScript", "React", "UI/UX"], color: "#ffd43b", link: "https://github.com/moutiebenamor/cafienobistro" },
  { title: "Post Management", type: "CMS Tool", year: "2024", desc: "Full CRUD content management system with structured state handling and dynamic updates.", tags: ["JavaScript", "React", "State"], color: "#00c8ff", link: "https://github.com/moutiebenamor/post_management" },
];

const SKILLS_DATA = [
  // UI/UX Skills
  { name: "Figma", level: 95, cat: "UI/UX" },
  { name: "Prototyping", level: 90, cat: "UI/UX" },
  { name: "User Research", level: 85, cat: "UI/UX" },
  { name: "Wireframing", level: 88, cat: "UI/UX" },
  { name: "Design Systems", level: 82, cat: "UI/UX" },
  { name: "Responsive Design", level: 92, cat: "UI/UX" },
  { name: "Usability Testing", level: 80, cat: "UI/UX" },
  
  // Programming Skills
  { name: "React", level: 95, cat: "Programming" },
  { name: "JavaScript", level: 93, cat: "Programming" },
  { name: "TypeScript", level: 88, cat: "Programming" },
  { name: "Python", level: 85, cat: "Programming" },
  { name: "MongoDB", level: 70, cat: "Programming" },
  { name: "Node.js", level: 78, cat: "Programming" },
  { name: "three.js", level: 72, cat: "Programming" },
  
  // Marketing Skills
  { name: "SEO", level: 85, cat: "Marketing" },
  { name: "Content Strategy", level: 88, cat: "Marketing" },
  { name: "Social Media Marketing", level: 82, cat: "Marketing" },
  { name: "Brand Strategy", level: 84, cat: "Marketing" },
];

function LogicalMode({ onToggle, contentLoading = false }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [hoveredProject, setHoveredProject] = useState(null);
  const [animatedSkills, setAnimatedSkills] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedSkills(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const sections = ["hero", "about", "skills", "projects", "contact"];

  return (
    <div style={{
      minHeight: "100vh", background: "#f8f7f5",
      fontFamily: "'Georgia', serif",
      color: "#1a1a1a",
    }}>
      {/* Creative Enhancements for Logical Mode */}
      <FloatingShapes active={true} />
      <ScrollProgress />
      
      {/* Subtle Mouse Trail for Logical Mode */}
      <MouseTrail active={true} section="default" />
      
      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(248,247,245,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "0 clamp(24px,5vw,80px)", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "monospace", fontSize: "13px", letterSpacing: "0.15em", color: "#888" }}>
          BAM / UI UX DEV
        </div>
        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
          {sections.slice(1).map(s => (
            <a key={s} href={`#${s}`} style={{
              fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#888", textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#1a1a1a"}
              onMouseLeave={e => e.target.style.color = "#888"}
            >{s}</a>
          ))}
          <button onClick={onToggle} style={{
            background: "#1a1a1a", color: "#f8f7f5", border: "none",
            padding: "8px 20px", fontSize: "11px", letterSpacing: "0.2em",
            textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.target.style.background = "#bf00ff"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "#1a1a1a"; e.target.style.color = "#f8f7f5"; }}>
            ◈ Creative Mode
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "80px clamp(24px,5vw,80px) 0",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: 0, top: "10%", bottom: "10%", width: "40%",
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.04) 39px, rgba(0,0,0,0.04) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.04) 39px, rgba(0,0,0,0.04) 40px)`,
        }} />
        <div style={{ maxWidth: "700px" }}>
          <AnimatedText delay={200}>
            <div style={{ fontSize: "12px", letterSpacing: "0.35em", color: "#aaa", marginBottom: "32px", textTransform: "uppercase" }}>
              Available for work · Based in Gabes, Tunisia
            </div>
          </AnimatedText>
          <AnimatedText delay={400}>
            <h1 style={{
              fontSize: "clamp(48px,7vw,96px)", fontWeight: 400, lineHeight: 1.0,
            letterSpacing: "-0.03em", margin: "0 0 32px",
          }}>
            Ben Amor<br />Moutie.
          </h1>
          </AnimatedText>
          <AnimatedText delay={600}>
            <p style={{
              fontSize: "clamp(16px,2vw,22px)", lineHeight: 1.7, color: "#555",
              maxWidth: "520px", margin: "0 0 48px",
              fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300,
            }}>
              UI/UX Designer and Web Developer focused on building user-centered digital products and scalable web applications.
            </p>
          </AnimatedText>
          <AnimatedText delay={800}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a href="#projects" style={{
              background: "#1a1a1a", color: "#f8f7f5", padding: "14px 32px",
              fontSize: "13px", letterSpacing: "0.1em", textDecoration: "none",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >View Projects</a>
            <a href="#contact" style={{
              border: "1px solid rgba(0,0,0,0.2)", color: "#1a1a1a", padding: "14px 32px",
              fontSize: "13px", letterSpacing: "0.1em", textDecoration: "none",
              transition: "border-color 0.2s",
            }}>Get in Touch</a>
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: "120px clamp(24px,5vw,80px)", display: "flex", gap: "80px", flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 200px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#aaa", textTransform: "uppercase", paddingTop: "6px" }}>
            01 / About
          </div>
        </div>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 400, margin: "0 0 32px", lineHeight: 1.2 }}>
            Where design<br />meets code.
          </h2>
          <p style={{ color: "#555", lineHeight: 1.8, fontSize: "17px", marginBottom: "24px", fontFamily: "sans-serif", fontWeight: 300 }}>
            Experienced in React and modern design systems, combining design thinking, development, and marketing strategy to deliver high-performance solutions.
          </p>
          <p style={{ color: "#555", lineHeight: 1.8, fontSize: "17px", fontFamily: "sans-serif", fontWeight: 300 }}>
            Previously UI/UX Designer at EDC Canada and Marketing Manager at SART Équipement. Passionate about AI-powered technologies and innovative problem-solving.
          </p>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: "120px clamp(24px,5vw,80px)", background: "#f0ede8" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#aaa", textTransform: "uppercase", marginBottom: "48px" }}>
            02 / Skills
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
            {SKILLS_DATA.map((skill, i) => (
              <EnhancedSkillBar key={skill.name} skill={skill} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={{ padding: "120px clamp(24px,5vw,80px)" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#aaa", textTransform: "uppercase", marginBottom: "64px" }}>
          03 / Selected Work
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {contentLoading ? (
            <SkeletonLoader type="project" count={PROJECTS_DATA.length} isLoading={true} />
          ) : (
            PROJECTS_DATA.map((p, i) => (
              <InteractiveProjectCard key={p.title} project={p} index={i} />
            ))
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{
        padding: "120px clamp(24px,5vw,80px)", background: "#1a1a1a", color: "#f8f7f5",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#666", textTransform: "uppercase", marginBottom: "48px" }}>
          04 / Contact
        </div>
        <h2 style={{ fontSize: "clamp(36px,6vw,80px)", fontWeight: 400, margin: "0 0 32px", lineHeight: 1.1, maxWidth: "600px" }}>
          Let's build something worth remembering.
        </h2>
        <a href="mailto:moutie.benamor@isimg.tn" style={{
          fontSize: "clamp(18px,3vw,32px)", color: "#f8f7f5", textDecoration: "none",
          borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px",
          transition: "border-color 0.3s",
        }}
          onMouseEnter={e => e.target.style.borderColor = "#4a9eff"}
          onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
        >
          moutie.benamor@isimg.tn
        </a>
        <div style={{ marginTop: "24px", color: "#666", fontSize: "14px", fontFamily: "monospace" }}>
          +216 29634221
        </div>
        <div style={{ display: "flex", gap: "24px", marginTop: "40px" }}>
          <a href="https://github.com/moutiebenamor" target="_blank" rel="noopener noreferrer" style={{ color: "#f8f7f5", opacity: 0.6, transition: "opacity 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
          >
            <GithubIcon size={24} />
          </a>
          <a href="https://linkedin.com/in/moutie-ben-amor-3b866025b" target="_blank" rel="noopener noreferrer" style={{ color: "#f8f7f5", opacity: 0.6, transition: "opacity 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
          >
            <LinkedinIcon size={24} />
          </a>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div >
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── CREATIVE MODE ───────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const CREATIVE_PROJECTS = [
  { title: "Agency Portfolio", type: "Web", color: "#4a9eff", x: "15%", y: "25%", scale: 1.1 },
  { title: "TKM E-Commerce", type: "Platform", color: "#00c896", x: "65%", y: "20%", scale: 1.0 },
  { title: "Hyper Scroll", type: "Creative", color: "#bf00ff", x: "45%", y: "55%", scale: 1.2 },
  { title: "Voice Assistant", type: "AI Tool", color: "#ff6b35", x: "80%", y: "70%", scale: 0.9 },
  { title: "CafeNoBistro", type: "UI/UX", color: "#ffd43b", x: "20%", y: "80%", scale: 1.0 },
  { title: "Post Management", type: "CMS", color: "#00c8ff", x: "85%", y: "35%", scale: 0.9 },
];

const SKILL_NODES = [
  { name: "React", x: 50, y: 30, size: 14, connections: [1, 2, 6], color: "#61dafb" },
  { name: "Figma", x: 20, y: 55, size: 12, connections: [0, 3], color: "#bf00ff" },
  { name: "TypeScript", x: 75, y: 50, size: 11, connections: [0, 4], color: "#3178c6" },
  { name: "Python", x: 30, y: 80, size: 10, connections: [1], color: "#ff6b35" },
  { name: "Marketing", x: 70, y: 75, size: 11, connections: [2, 5], color: "#84ce49" },
  { name: "AI", x: 50, y: 85, size: 10, connections: [4], color: "#ffd43b" },
  { name: "three.js", x: 35, y: 40, size: 11, connections: [0], color: "#000000" },
];

function FloatingCube({ project, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const frameRef = useRef(null);
  const rotRef = useRef({ x: 15 * index, y: 20 * index });

  useEffect(() => {
    const animate = () => {
      if (!hovered) {
        rotRef.current.x += 0.3;
        rotRef.current.y += 0.4;
        setRot({ ...rotRef.current });
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameRef.current);
  }, [hovered]);

  const size = hovered ? 140 : 100;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: "absolute", left: project.x, top: project.y,
        transform: "translate(-50%, -50%)",
        cursor: "pointer", zIndex: 10,
      }}>
      <div style={{
        width: `${size}px`, height: `${size}px`,
        transition: "width 0.3s, height 0.3s",
        transformStyle: "preserve-3d",
        transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        position: "relative",
      }}>
        {/* Cube faces */}
        {[
          { transform: `translateZ(${size / 2}px)`, bg: `${project.color}22`, border: project.color },
          { transform: `translateZ(-${size / 2}px) rotateY(180deg)`, bg: `${project.color}11`, border: project.color },
          { transform: `translateX(${size / 2}px) rotateY(90deg)`, bg: `${project.color}18`, border: project.color },
          { transform: `translateX(-${size / 2}px) rotateY(-90deg)`, bg: `${project.color}18`, border: project.color },
          { transform: `translateY(-${size / 2}px) rotateX(90deg)`, bg: `${project.color}15`, border: project.color },
          { transform: `translateY(${size / 2}px) rotateX(-90deg)`, bg: `${project.color}15`, border: project.color },
        ].map((face, fi) => (
          <div key={fi} style={{
            position: "absolute", inset: 0,
            transform: face.transform,
            background: face.bg,
            border: `1px solid ${face.border}`,
            backdropFilter: "blur(4px)",
          }} />
        ))}
      </div>

      {/* Label */}
      <div style={{
        position: "absolute", top: "100%", left: "50%",
        transform: "translateX(-50%)", marginTop: "16px",
        textAlign: "center", opacity: hovered ? 1 : 0.5,
        transition: "opacity 0.3s",
      }}>
        <div style={{ fontSize: "14px", color: project.color, fontFamily: "monospace", letterSpacing: "0.1em" }}>{project.title}</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{project.type}</div>
      </div>

      {/* Glow */}
      <div style={{
        position: "absolute", inset: "-20px",
        background: `radial-gradient(circle, ${project.color}${hovered ? "20" : "08"} 0%, transparent 70%)`,
        pointerEvents: "none", transition: "background 0.3s",
      }} />
    </div>
  );
}

function ConstellationCanvas({ hoveredNode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.parentElement.offsetWidth;
    const H = canvas.parentElement.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    // Draw connections
    SKILL_NODES.forEach((node, i) => {
      if (hoveredNode !== null && hoveredNode !== i && !SKILL_NODES[hoveredNode]?.connections.includes(i)) return;
      node.connections.forEach(j => {
        const nx = node.x / 100 * W;
        const ny = node.y / 100 * H;
        const jx = SKILL_NODES[j].x / 100 * W;
        const jy = SKILL_NODES[j].y / 100 * H;
        const active = hoveredNode === i || hoveredNode === j;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(jx, jy);
        ctx.strokeStyle = active ? `${node.color}80` : "rgba(255,255,255,0.08)";
        ctx.lineWidth = active ? 1.5 : 0.5;
        ctx.stroke();
      });
    });

    // Draw nodes
    SKILL_NODES.forEach((node, i) => {
      const nx = node.x / 100 * W;
      const ny = node.y / 100 * H;
      const isHovered = hoveredNode === i;
      const isConnected = hoveredNode !== null && SKILL_NODES[hoveredNode]?.connections.includes(i);
      const size = isHovered ? node.size * 1.8 : node.size;

      // Glow
      const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, size * 4);
      grd.addColorStop(0, `${node.color}${isHovered ? "40" : "15"}`);
      grd.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(nx, ny, size * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Node
      ctx.beginPath();
      ctx.arc(nx, ny, size, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? node.color : (isConnected ? node.color + "aa" : "rgba(255,255,255,0.3)");
      ctx.fill();
      ctx.strokeStyle = isHovered ? node.color : "transparent";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = isHovered ? node.color : (isConnected ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)");
      ctx.font = `${isHovered ? "13px" : "11px"} monospace`;
      ctx.textAlign = "center";
      ctx.fillText(node.name, nx, ny + size + 18);
    });
  }, [hoveredNode]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

function CreativeMode({ onToggle, contentLoading = false }) {
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSkillsPanel, setShowSkillsPanel] = useState(false);
  const [section, setSection] = useState("projects");
  const [previousSection, setPreviousSection] = useState("projects");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    containerRef.current.style.setProperty("--mx", `${x}%`);
    containerRef.current.style.setProperty("--my", `${y}%`);
    containerRef.current.style.setProperty("--cx", `${e.clientX}px`);
    containerRef.current.style.setProperty("--cy", `${e.clientY}px`);
  }, []);

  const handleSectionChange = useCallback((newSection) => {
    if (newSection !== section && !isTransitioning) {
      setPreviousSection(section);
      setIsTransitioning(true);
      
      // Trigger transition animation
      setTimeout(() => {
        setSection(newSection);
      }, 800);
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false);
      }, 2500);
    }
  }, [section, isTransitioning]);

  return (
    <div
      ref={containerRef}
      style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}
      onMouseMove={handleMouseMove}>
      <ShaderBg />
      
      {/* Creative Mouse Trail */}
      <MouseTrail active={true} section={section} />

      {/* Interactive 3D Scroll Elements */}
      <Scroll3D active={true} section={section} />

      {/* Custom Cursor */}
      <div style={{
        position: "fixed", left: "var(--cx, 0)", top: "var(--cy, 0)", zIndex: 1000,
        pointerEvents: "none", transform: "translate(-50%, -50%)",
        width: "32px", height: "32px",
        border: "1px solid rgba(191,0,255,0.6)",
        borderRadius: "50%", mixBlendMode: "screen",
      }} />
      <div style={{
        position: "fixed", left: "var(--cx, 0)", top: "var(--cy, 0)", zIndex: 1000,
        pointerEvents: "none", transform: "translate(-50%, -50%)",
        width: "6px", height: "6px",
        background: "#bf00ff", borderRadius: "50%",
      }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(24px,4vw,60px)", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "monospace",
      }}>
        <div style={{ fontSize: "13px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>
          BAM<span style={{ color: "#bf00ff" }}>_</span>UI/UX
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {["projects", "skills", "contact"].map(s => (
            <button 
              key={s} 
              onClick={() => setSection(s)} 
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
                color: section === s ? "#bf00ff" : "rgba(255,255,255,0.4)",
                transition: "color 0.3s", padding: "4px 0",
                borderBottom: section === s ? "1px solid #bf00ff" : "1px solid transparent",
              }}
            >{s}</button>
          ))}
          <button
            onClick={() => {
              console.log("Toggle clicked from Creative");
              onToggle();
            }}
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)", padding: "8px 20px",
              fontSize: "11px", letterSpacing: "0.2em", cursor: "pointer",
              transition: "all 0.3s", fontFamily: "monospace",
              position: "relative", zIndex: 101, // Ensure it's above other elements
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#4a9eff"; e.currentTarget.style.color = "#4a9eff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
            ⬡ Logical Mode
          </button>
        </div>
      </nav>

      {/* HERO TITLE */}
      <div style={{
        position: "fixed", left: "clamp(24px,4vw,60px)", bottom: "clamp(24px,4vw,60px)",
        zIndex: 10, pointerEvents: "none",
      }}>
        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em", marginBottom: "8px" }}>
          ◈ BEN AMOR MOUTIE
        </div>
        <div style={{ fontSize: "clamp(26px,5vw,48px)", fontFamily: "'Georgia', serif", fontWeight: 400, lineHeight: 1, color: "#fff" }}>
          UI/UX & Web <br />
          <span style={{ color: "#bf00ff" }}>Designer & Developer</span>
        </div>
      </div>

      {/* PROJECTS VIEW */}
      {section === "projects" && (
        <div style={{ position: "fixed", inset: 0, perspective: "1000px" }}>
          {CREATIVE_PROJECTS.map((p, i) => (
            <FloatingCube key={p.title} project={p} index={i} onClick={() => setSelectedProject(i)} />
          ))}

          {/* Project Detail Overlay */}
          {selectedProject !== null && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 50,
              background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }} onClick={() => setSelectedProject(null)}>
              <div style={{
                maxWidth: "600px", padding: "60px",
                border: `1px solid ${CREATIVE_PROJECTS[selectedProject].color}40`,
                background: `${CREATIVE_PROJECTS[selectedProject].color}08`,
                animation: "fadeUp 0.4s ease",
              }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: CREATIVE_PROJECTS[selectedProject].color, marginBottom: "24px", fontFamily: "monospace" }}>
                  {CREATIVE_PROJECTS[selectedProject].type}
                </div>
                <h2 style={{ fontSize: "48px", fontFamily: "'Georgia', serif", fontWeight: 400, color: "#fff", margin: "0 0 24px" }}>
                  {CREATIVE_PROJECTS[selectedProject].title}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontFamily: "sans-serif", marginBottom: "40px" }}>
                  {PROJECTS_DATA[selectedProject].desc}
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  {PROJECTS_DATA[selectedProject].tags.map(t => (
                    <span key={t} style={{
                      fontSize: "11px", padding: "6px 16px", fontFamily: "monospace",
                      border: `1px solid ${CREATIVE_PROJECTS[selectedProject].color}50`,
                      color: CREATIVE_PROJECTS[selectedProject].color,
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
                  <a href={PROJECTS_DATA[selectedProject].link} target="_blank" rel="noopener noreferrer" style={{
                    background: CREATIVE_PROJECTS[selectedProject].color, color: "#000",
                    padding: "12px 24px", fontSize: "11px", fontFamily: "monospace",
                    textDecoration: "none", fontWeight: "bold", letterSpacing: "0.1em"
                  }}>OPEN GITHUB</a>
                  <button onClick={() => setSelectedProject(null)} style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.5)", padding: "10px 24px", cursor: "pointer",
                    fontSize: "11px", letterSpacing: "0.2em", fontFamily: "monospace",
                  }}>CLOSE ✕</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SKILLS CONSTELLATION */}
      {section === "skills" && (
        <div style={{ position: "fixed", inset: "64px 0 0", zIndex: 5 }}>
          <div style={{
            position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)",
            textAlign: "center", fontFamily: "monospace",
          }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)" }}>HOVER NODES TO EXPLORE CONNECTIONS</div>
          </div>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <ConstellationCanvas hoveredNode={hoveredNode} />
            {SKILL_NODES.map((node, i) => (
              <div key={node.name}
                style={{
                  position: "absolute",
                  left: `${node.x}%`, top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: `${node.size * 3}px`, height: `${node.size * 3}px`,
                  cursor: "pointer", zIndex: 10,
                }}
                onMouseEnter={() => setHoveredNode(i)}
                onMouseLeave={() => setHoveredNode(null)}
              />
            ))}
          </div>

          {/* Button to toggle Creative Skills Details Panel */}
          <button
            onClick={() => setShowSkillsPanel(!showSkillsPanel)}
            style={{
              position: "absolute", top: "40px", right: "40px",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px", padding: "12px 20px",
              color: "white", fontSize: "12px", fontFamily: "monospace",
              cursor: "pointer", zIndex: 20,
              backdropFilter: "blur(10px)", letterSpacing: "0.1em",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.borderColor = "#bf00ff";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          >
            {showSkillsPanel ? "HIDE SKILLS" : "SHOW SKILLS"}
          </button>

          {/* Creative Skills Details Panel */}
          {showSkillsPanel && (
            <div style={{
              position: "absolute", right: "40px", top: "120px", bottom: "40px",
              width: "380px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px",
              padding: "32px", overflowY: "auto", zIndex: 15,
              animation: "slideIn 0.3s ease-out",
            }}>
              <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.3em", color: "#bf00ff", marginBottom: "24px" }}>
                SKILL MATRIX
              </div>

            {/* UI/UX Skills */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ 
                fontSize: "14px", fontWeight: "bold", color: "#fff", 
                marginBottom: "16px", fontFamily: "monospace", letterSpacing: "0.1em" 
              }}>
                UI/UX DESIGN
              </div>
              {SKILLS_DATA.filter(skill => skill.cat === "UI/UX").map((skill, i) => (
                <div key={skill.name} style={{ marginBottom: "12px" }}>
                  <div style={{ 
                    display: "flex", justifyContent: "space-between", 
                    alignItems: "center", marginBottom: "6px" 
                  }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}>
                      {skill.name}
                    </span>
                    <span style={{ 
                      fontSize: "10px", color: "#bf00ff", fontFamily: "monospace",
                      letterSpacing: "0.1em" 
                    }}>
                      {skill.level}%
                    </span>
                  </div>
                  <div style={{ 
                    height: "2px", background: "rgba(255,255,255,0.1)", 
                    position: "relative", borderRadius: "1px"
                  }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      background: "linear-gradient(90deg, #bf00ff, #ff00ff)",
                      width: `${skill.level}%`, borderRadius: "1px",
                      transition: "width 1s ease-out",
                      boxShadow: "0 0 10px rgba(191,0,255,0.5)"
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Programming Skills */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ 
                fontSize: "14px", fontWeight: "bold", color: "#fff", 
                marginBottom: "16px", fontFamily: "monospace", letterSpacing: "0.1em" 
              }}>
                PROGRAMMING
              </div>
              {SKILLS_DATA.filter(skill => skill.cat === "Programming").map((skill, i) => (
                <div key={skill.name} style={{ marginBottom: "12px" }}>
                  <div style={{ 
                    display: "flex", justifyContent: "space-between", 
                    alignItems: "center", marginBottom: "6px" 
                  }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}>
                      {skill.name}
                    </span>
                    <span style={{ 
                      fontSize: "10px", color: "#4a9eff", fontFamily: "monospace",
                      letterSpacing: "0.1em" 
                    }}>
                      {skill.level}%
                    </span>
                  </div>
                  <div style={{ 
                    height: "2px", background: "rgba(255,255,255,0.1)", 
                    position: "relative", borderRadius: "1px"
                  }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      background: "linear-gradient(90deg, #4a9eff, #00d4ff)",
                      width: `${skill.level}%`, borderRadius: "1px",
                      transition: "width 1s ease-out",
                      boxShadow: "0 0 10px rgba(74,158,255,0.5)"
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Marketing Skills */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ 
                fontSize: "14px", fontWeight: "bold", color: "#fff", 
                marginBottom: "16px", fontFamily: "monospace", letterSpacing: "0.1em" 
              }}>
                MARKETING
              </div>
              {SKILLS_DATA.filter(skill => skill.cat === "Marketing").map((skill, i) => (
                <div key={skill.name} style={{ marginBottom: "12px" }}>
                  <div style={{ 
                    display: "flex", justifyContent: "space-between", 
                    alignItems: "center", marginBottom: "6px" 
                  }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}>
                      {skill.name}
                    </span>
                    <span style={{ 
                      fontSize: "10px", color: "#00ffaa", fontFamily: "monospace",
                      letterSpacing: "0.1em" 
                    }}>
                      {skill.level}%
                    </span>
                  </div>
                  <div style={{ 
                    height: "2px", background: "rgba(255,255,255,0.1)", 
                    position: "relative", borderRadius: "1px"
                  }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      background: "linear-gradient(90deg, #00ffaa, #00ff88)",
                      width: `${skill.level}%`, borderRadius: "1px",
                      transition: "width 1s ease-out",
                      boxShadow: "0 0 10px rgba(0,255,170,0.5)"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      {/* CONTACT */}
      {section === "contact" && (
        <div style={{
          position: "fixed", inset: "64px 0 0", zIndex: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", textAlign: "center",
          fontFamily: "monospace",
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.4em", color: "#bf00ff", marginBottom: "32px" }}>
            ◈ INITIATE CONTACT
          </div>
          <h2 style={{
            fontSize: "clamp(32px,5vw,72px)", fontFamily: "'Georgia', serif",
            fontWeight: 400, color: "#fff", margin: "0 0 48px", lineHeight: 1.1,
          }}>
            Let's create<br />something <span style={{
              background: "linear-gradient(135deg, #bf00ff, #00c8ff)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>impossible.</span>
          </h2>
          <a href="mailto:moutie.benamor@isimg.tn" style={{
            fontSize: "clamp(16px,2.5vw,28px)", color: "rgba(255,255,255,0.7)",
            textDecoration: "none", borderBottom: "1px solid rgba(191,0,255,0.4)",
            paddingBottom: "4px", letterSpacing: "0.05em", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.target.style.color = "#bf00ff"; e.target.style.borderColor = "#bf00ff"; }}
            onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.7)"; e.target.style.borderColor = "rgba(191,0,255,0.4)"; }}
          >
            moutie.benamor@isimg.tn
          </a>
          <div style={{ display: "flex", gap: "32px", marginTop: "48px" }}>
            <a href="https://github.com/moutiebenamor" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.4)", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", fontSize: "11px", letterSpacing: "0.2em" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#00c8ff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "none"; }}
            >
              <GithubIcon size={18} /> GITHUB
            </a>
            <a href="https://linkedin.com/in/moutie-ben-amor-3b866025b" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.4)", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", fontSize: "11px", letterSpacing: "0.2em" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#00c8ff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "none"; }}
            >
              <LinkedinIcon size={18} /> LINKEDIN
            </a>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useMode();
  const [transitioning, setTransitioning] = useState(false);
  const [fromLogical, setFromLogical] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const handleEntrySelect = (selectedMode) => {
    setFromLogical(selectedMode === "creative");
    setTransitioning(true);
    setTimeout(() => {
      modeStore.set(selectedMode);
      setTransitioning(false);
    }, 1000);
  };

  const handleToggle = () => {
    setFromLogical(mode === "logical");
    setTransitioning(true);
    setContentLoading(true);
    setTimeout(() => {
      modeStore.set(mode === "logical" ? "creative" : "logical");
      setTransitioning(false);
      setContentLoading(false);
    }, 1000);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (mode === "entry") {
    return (
      <>
        <Landing3D onSelect={handleEntrySelect} />
        <TransitionOverlay active={transitioning} fromLogical={fromLogical} />
      </>
    );
  }

  return (
    <>
      {/* Main Loading Screen */}
      <LoadingScreen isLoading={isLoading} onComplete={handleLoadingComplete} />
      
      {mode === "logical"
        ? <LogicalMode onToggle={handleToggle} contentLoading={contentLoading} />
        : <CreativeMode onToggle={handleToggle} contentLoading={contentLoading} />
      }
      <TransitionOverlay active={transitioning} fromLogical={fromLogical} />

      {/* Global Noise Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none",
        opacity: mode === "creative" ? 0.05 : 0.02, mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/1000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />
    </>
  );
}
