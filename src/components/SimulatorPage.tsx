import React, { useState } from "react";
import { 
  History, ShieldAlert, ShieldCheck, RefreshCw, 
  TrendingDown, TrendingUp, Play, Sparkles, Zap, AlertTriangle, ShieldAlert as AlertIcon, Trophy, Percent, HelpCircle
} from "lucide-react";
import { Mission, SimulatorTimeline } from "../types";

interface SimulatorPageProps {
  missions: Mission[];
  onTriggerSimulation: (missionId: string) => Promise<SimulatorTimeline | null>;
  activeSimulation: SimulatorTimeline | null;
  isLoading: boolean;
}

export default function SimulatorPage({
  missions,
  onTriggerSimulation,
  activeSimulation,
  isLoading,
}: SimulatorPageProps) {
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const activeMissions = missions.filter(m => m.status !== "Completed" && m.status !== "Failed");

  const handleSimulate = async () => {
    if (!selectedMissionId) return;
    await onTriggerSimulation(selectedMissionId);
  };

  return (
    <div className="space-y-8 pb-12 font-sans selection:bg-sky-500/30">
      {/* Intro section */}
      <div className="p-6 rounded-2xl bg-[#0d1117] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest text-sky-400 mb-2 font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-400" /> SIGNATURE PREDICTIVE MODELING
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI PREDICTIVE TIMELINE ENGINE</h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Compare your default trajectory against an AI-defended pacing path. Check forecasted success margins, active interventions, and confidence scores based on real mission workloads.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0 items-end">
            <div className="flex-1 md:flex-none">
              <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold tracking-wider">Select Mission to Forecast</label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                disabled={isLoading}
                className="w-full md:w-64 bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3 py-2 text-xs text-slate-300 outline-none transition"
              >
                <option value="" className="bg-[#02040a]">-- Choose Active Target --</option>
                {activeMissions.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#02040a]">{m.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSimulate}
              disabled={isLoading || !selectedMissionId}
              className="px-5 py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/15 flex items-center gap-2 cursor-pointer h-9 shrink-0 active:scale-95"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4.5 h-4.5 fill-current" />}
              Forecast Future
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="p-16 text-center border border-white/10 rounded-2xl bg-[#0d1117] space-y-4">
          <RefreshCw className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">Simulating space-time trajectories...</h3>
            <p className="text-xs text-slate-500">Accountability Agent is tracing workload overlaps, stress patterns, and build parameters.</p>
          </div>
        </div>
      )}

      {!isLoading && !activeSimulation && (
        <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1117]/50 text-slate-500 space-y-3">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-xs">No simulation loaded in active buffer. Select a mission above to run quantum schedule forecasts.</p>
        </div>
      )}

      {!isLoading && activeSimulation && (
        <div className="space-y-8 animate-fade-in">
          
          {/* COMPARATIVE ANALYSIS BANNER */}
          <div className="p-6 rounded-2xl bg-[#0d1117] border border-white/10">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-4">
              SPACE-TIME TIMELINE METRICS COMPARISON
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Without Defender */}
              <div className="p-5 rounded-xl bg-red-950/10 border border-red-500/10 space-y-4">
                <div className="flex justify-between items-center border-b border-red-500/10 pb-2">
                  <span className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> WITHOUT DEADLINE DEFENDER
                  </span>
                  <span className="text-[10px] font-mono text-red-500/80 font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                    STANDARD SLIPPAGE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Success probability</span>
                    <strong className="text-sm font-bold text-slate-300">{activeSimulation.withoutDefender?.successProbability ?? 35}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Failure probability</span>
                    <strong className="text-sm font-bold text-slate-300">{activeSimulation.withoutDefender?.failureProbability ?? 65}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Expected finish</span>
                    <strong className="text-sm font-bold text-red-400">{activeSimulation.withoutDefender?.expectedFinish ?? "T + 6 hours (Late)"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Max stress level</span>
                    <strong className="text-sm font-bold text-slate-300">{activeSimulation.withoutDefender?.stressLevel ?? 80}%</strong>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-red-500/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Safety temporal buffer</span>
                    <strong className="text-xs font-mono font-bold text-red-400/90">{activeSimulation.withoutDefender?.safetyBuffer ?? "-6 hours (Deficit)"}</strong>
                  </div>
                </div>
              </div>

              {/* With Defender */}
              <div className="p-5 rounded-xl bg-sky-950/10 border border-sky-500/25 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[20%] h-[20%] bg-sky-500/5 rounded-full blur-[20px] pointer-events-none" />
                <div className="flex justify-between items-center border-b border-sky-500/10 pb-2">
                  <span className="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> WITH DEADLINE DEFENDER
                  </span>
                  <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 animate-pulse">
                    ACTIVE DEFENSES
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Success probability</span>
                    <strong className="text-sm font-extrabold text-sky-400">{activeSimulation.withDefender?.successProbability ?? 95}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Failure probability</span>
                    <strong className="text-sm font-bold text-slate-300">{activeSimulation.withDefender?.failureProbability ?? 5}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Expected finish</span>
                    <strong className="text-sm font-bold text-sky-400">{activeSimulation.withDefender?.expectedFinish ?? "T - 18 hours (Early)"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Max stress level</span>
                    <strong className="text-sm font-bold text-slate-300">{activeSimulation.withDefender?.stressLevel ?? 15}%</strong>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-sky-500/10">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Safety temporal buffer</span>
                    <strong className="text-xs font-mono font-bold text-sky-400">{activeSimulation.withDefender?.safetyBuffer ?? "+18 hours (Secure)"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scenario A: Current Behaviour (Default Path) */}
            <div className="p-6 rounded-2xl bg-[#0d1117] border border-red-950/40 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-red-500/5 rounded-full blur-[40px] pointer-events-none" />
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider mb-2 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" /> Scenario A: Default Behavior
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">{activeSimulation.scenarioA.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{activeSimulation.scenarioA.description}</p>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Threat Prediction</span>
                    <span className="text-red-400 font-extrabold text-xs uppercase tracking-tight">CRITICAL FAILURES</span>
                  </div>
                </div>

                {/* Timeline events */}
                <div className="relative border-l border-red-500/20 pl-6 ml-3.5 space-y-8 my-8">
                  {activeSimulation.scenarioA.events.map((ev, i) => (
                    <div key={i} className="relative">
                      {/* Event dot */}
                      <span className={`absolute -left-9.5 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-mono ${
                        ev.isFailed 
                          ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse font-bold" 
                          : "bg-white/5 border-red-500/20 text-slate-500"
                      }`}>
                        0{i + 1}
                      </span>

                      <div>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-xs font-mono text-red-400 uppercase tracking-wider font-bold">{ev.date}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            Stress level: {ev.stress}%
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">{ev.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 mt-6 flex gap-3.5 items-start">
                <TrendingDown className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-red-400 font-mono uppercase block font-bold tracking-wider">Predictive Outcome Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    {activeSimulation.scenarioA.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario B: AI Optimized Path (Defender Route) */}
            <div className="p-6 rounded-2xl bg-[#0d1117] border border-sky-500/20 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1 text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider mb-2 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Scenario B: Defender Path
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">{activeSimulation.scenarioB.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{activeSimulation.scenarioB.description}</p>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Threat Prediction</span>
                    <span className="text-sky-400 font-extrabold text-xs uppercase tracking-tight">ZERO DEFICIENCIES</span>
                  </div>
                </div>

                {/* Timeline events */}
                <div className="relative border-l border-sky-500/20 pl-6 ml-3.5 space-y-8 my-8">
                  {activeSimulation.scenarioB.events.map((ev, i) => (
                    <div key={i} className="relative">
                      {/* Event dot */}
                      <span className="absolute -left-9.5 top-1.5 w-6 h-6 rounded-full border-2 bg-sky-500/10 border-sky-500 flex items-center justify-center text-[10px] text-sky-400 font-mono font-bold">
                        0{i + 1}
                      </span>

                      <div>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-bold">{ev.date}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            Stress level: {ev.stress}%
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">{ev.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/10 mt-6 flex gap-3.5 items-start">
                <TrendingUp className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-sky-400 font-mono uppercase block font-bold tracking-wider">Predictive Outcome Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    {activeSimulation.scenarioB.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE AI INTERVENTIONS APPLIED */}
          {activeSimulation.aiInterventions && activeSimulation.aiInterventions.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#0d1117] border border-white/10">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-4">
                ACTIVE AI INTERVENTIONS IMPLEMENTED
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeSimulation.aiInterventions.map((intv, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3.5 items-start">
                    <Zap className={`w-5 h-5 shrink-0 mt-0.5 ${intv.isApplied ? "text-amber-400 fill-amber-400/20 animate-pulse" : "text-slate-600"}`} />
                    <div>
                      <h4 className="text-xs font-bold text-white">{intv.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1">{intv.description}</p>
                      {intv.isApplied && (
                        <span className="text-[8px] font-mono font-bold bg-amber-500/10 border border-amber-500/25 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-2">
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MISSION FORECAST EXECUTIVE BOX */}
          {activeSimulation.forecast && (
            <div className="p-6 rounded-2xl bg-[#0d1117] border border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-4 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    INTELLIGENCE STATEMENT // FORECAST BRIEF
                  </span>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-400" /> {activeSimulation.forecast.expectedOutcome}
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl shrink-0">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Confidence Rating</span>
                    <strong className="text-sm font-bold text-emerald-400 font-mono">{activeSimulation.forecast.confidenceScore}/100</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold tracking-wider">Executive Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {activeSimulation.forecast.executiveSummary}
                  </p>
                </div>

                {activeSimulation.forecast.explanation && (
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold tracking-wider flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-400" /> Explain-Why Analysis
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1 font-sans">
                      {activeSimulation.forecast.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
