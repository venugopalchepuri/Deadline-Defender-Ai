import React from "react";
import { Sparkles, AlertTriangle, Play, CheckCircle, Zap } from "lucide-react";
import { motion } from "motion/react";
import { LogoIcon, LogoWithText } from "./Logo";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col justify-between overflow-hidden font-sans relative selection:bg-sky-500/30">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <LogoWithText size="xs" animated={true} />
          <button
            onClick={onStart}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] active:scale-95 cursor-pointer"
          >
            Launch Terminal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 flex flex-col items-center justify-center py-16 lg:py-24 relative z-10 text-center">
        {/* Floating Brand Logo Visual Identity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8 relative select-none pointer-events-none"
        >
          <div className="absolute inset-0 bg-blue-500/10 rounded-full filter blur-[40px] animate-pulse"></div>
          <LogoIcon size="xl" animated={true} glow={true} className="mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 rounded-full text-xs font-mono text-sky-400 mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>HACKATHON BUILD // GOOGLE AI STUDIO POWERED</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-none mb-4"
        >
          DEADLINE <span className="bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">DEFENDER</span> AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl font-medium tracking-widest text-sky-400 font-mono mb-6 uppercase"
        >
          "The AI Chief of Staff That Refuses To Let You Fail."
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl text-slate-400 text-sm md:text-base mb-10 leading-relaxed"
        >
          Most productivity apps remind you <span className="text-red-400 font-semibold">after</span> you are already failing. Deadline Defender AI predicts missed deadlines before they happen, automatically creates tactical recovery plans, and actively guides you toward successful completion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Enter Mission Control
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            Explore Swarm Architecture
          </a>
        </motion.div>

        {/* Feature Cards / Swarm Architecture */}
        <section id="features" className="w-full pt-16 border-t border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Multi-Agent AI Swarm
          </h2>
          <p className="text-slate-400 text-xs max-w-xl mx-auto mb-12">
            Four specialized AI sub-agents analyze, predict, structure, and rescue your commitments in parallel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                role: "STRATEGIST",
                desc: "Automatically breaks large missions down into clear tactical roadmaps of achievable micro-subtasks, estimating time dynamically.",
                accent: "border-sky-500/20 hover:border-sky-500/50",
                bgGlow: "bg-sky-500/5",
                textGlow: "text-sky-400",
                badge: "Tactical Planning",
              },
              {
                role: "RISK ANALYST",
                desc: "Computes failure probabilities, risk scores, and buffer analysis in real-time. Alerts you when your trajectory slips into danger zones.",
                accent: "border-amber-500/20 hover:border-amber-500/50",
                bgGlow: "bg-amber-500/5",
                textGlow: "text-amber-400",
                badge: "Predictive Analytics",
              },
              {
                role: "ACCOUNTABILITY AGENT",
                desc: "Analyzes historical completion rates, identifies chronic procrastination patterns, and holds daily debriefs with personalized coaching.",
                accent: "border-purple-500/20 hover:border-purple-500/50",
                bgGlow: "bg-purple-500/5",
                textGlow: "text-purple-400",
                badge: "Pattern Detection",
              },
              {
                role: "RESCUE COMMANDER",
                desc: "Triggers when deadlines cross risk thresholds. Generates strict recovery checklists, isolates core features, and handles scope-reduction.",
                accent: "border-red-500/20 hover:border-red-500/50",
                bgGlow: "bg-red-500/5",
                textGlow: "text-red-400",
                badge: "Emergency Intervention",
              },
            ].map((agent, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl bg-[#0d1117] border ${agent.accent} hover:bg-[#161b22] transition-all duration-300 flex flex-col justify-between group h-full relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${agent.bgGlow} rounded-full blur-[40px] pointer-events-none`} />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Agent 0{index + 1}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10`}>
                      {agent.badge}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold text-white mb-3 tracking-tight flex items-center gap-1.5`}>
                    <span className={agent.textGlow}>{agent.role}</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{agent.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono relative z-10">
                  <span>Connection: Active</span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 pt-12 pb-10 text-xs text-slate-400 font-sans relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-white/5 pb-8">
          {/* Brand block */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <LogoIcon size="sm" glow={true} animated={false} />
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider font-mono">DEADLINE DEFENDER AI</h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tight mt-0.5">Predictive Intelligence Platform</p>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed font-sans max-w-sm">
              Your AI Chief of Staff for Mission-Critical Deadlines. Predicting missed targets, simulating timelines, and constructing emergency rescue plans automatically.
            </p>
          </div>

          {/* Developer block */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">FOUNDER & DEVELOPER</span>
            <div className="space-y-1">
              <strong className="text-sm font-semibold text-white tracking-tight block">Venugopal Chepuri</strong>
              <p className="text-xs text-slate-300 font-sans">B.Tech Computer Science & Engineering</p>
              <p className="text-[11px] text-slate-500 font-mono uppercase">Bennett University</p>
            </div>
          </div>

          {/* Contact & Network block */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">CONTACT & CREDENTIALS</span>
            <div className="space-y-2 text-[11px] text-slate-300">
              <p className="flex items-center gap-2">
                <span className="text-slate-500">📧</span>
                <a href="mailto:chepurivenugopal1@gmail.com" className="hover:text-sky-400 transition underline decoration-white/15">
                  chepurivenugopal1@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-500">📱</span>
                <span>+91 7207630778</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-500">🔗</span>
                <a 
                  href="https://www.linkedin.com/in/venugopal-chepuri-b4899a223" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-sky-400 transition font-medium underline decoration-white/15"
                >
                  LinkedIn Profile
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          <p>© 2026 Deadline Defender AI. All Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Security ABAC Rules</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
