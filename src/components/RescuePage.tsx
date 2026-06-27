import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, ShieldCheck, ShieldAlert, Zap, Compass, 
  CheckCircle, RefreshCw, EyeOff, Clock, Sparkles, HelpCircle, ShieldCheck as ProtectIcon, RefreshCcw, Percent
} from "lucide-react";
import { Mission } from "../types";

interface RescuePageProps {
  missions: Mission[];
  onTriggerRescue: (missionId: string) => void;
  activeRescueMissionId: string | null;
  isLoading: boolean;
}

export default function RescuePage({
  missions,
  onTriggerRescue,
  activeRescueMissionId,
  isLoading,
}: RescuePageProps) {
  const [selectedMissionId, setSelectedMissionId] = useState(activeRescueMissionId || "");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const activeMissions = missions.filter(m => m.status !== "Completed" && m.status !== "Failed");
  const selectedMission = missions.find(m => m.id === selectedMissionId) || null;

  // Sync selected mission if parent notifies
  useEffect(() => {
    if (activeRescueMissionId) {
      setSelectedMissionId(activeRescueMissionId);
    }
  }, [activeRescueMissionId]);

  // Countdown timer calculations
  useEffect(() => {
    if (!selectedMission) return;

    const interval = setInterval(() => {
      const difference = new Date(selectedMission.deadline).getTime() - Date.now();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedMission]);

  const handleRescue = () => {
    if (!selectedMissionId) return;
    onTriggerRescue(selectedMissionId);
  };

  return (
    <div className="space-y-8 pb-12 font-sans selection:bg-red-500/30">
      {/* Intro section */}
      <div className="p-6 rounded-2xl bg-[#0d1117] border border-red-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-red-500/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest text-red-400 mb-2 font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL EMERGENCY PROTOCOL
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">RESCUE COMMAND DECK</h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              When deadlines enter extreme threat states, standard planning collapses. The Rescue Commander isolates critical path deliverables, postpones luxury features, and maps out a hour-by-hour recovery model.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0 items-end">
            <div className="flex-1 md:flex-none">
              <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold tracking-wider">Select Endangered Target</label>
              <select
                value={selectedMissionId}
                onChange={(e) => {
                  setSelectedMissionId(e.target.value);
                }}
                disabled={isLoading}
                className="w-full md:w-64 bg-white/5 border border-white/10 focus:border-red-500 rounded px-3 py-2 text-xs text-slate-300 outline-none transition"
              >
                <option value="" className="bg-[#02040a]">-- Choose Active Target --</option>
                {activeMissions.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#02040a]">{m.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRescue}
              disabled={isLoading || !selectedMissionId}
              className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/25 flex items-center gap-2 cursor-pointer h-9 shrink-0 active:scale-95 animate-pulse"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Initiate Rescue
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="p-16 text-center border border-red-500/20 rounded-2xl bg-[#0d1117] space-y-4">
          <RefreshCw className="w-10 h-10 text-red-500 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">Compiling tactical triage protocols...</h3>
            <p className="text-xs text-slate-500">Rescue Commander is running dependency cuts, isolating core MVP components, and calculating new success probabilities.</p>
          </div>
        </div>
      )}

      {!isLoading && !selectedMission && (
        <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1117]/50 text-slate-500 space-y-3">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-xs">No tactical target selected in the triage feed. Choose an active mission above to activate Rescue protocols.</p>
        </div>
      )}

      {!isLoading && selectedMission && !selectedMission.rescuePlan && (
        <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d1117]/50 text-slate-500 space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Rescue Plan Buffer Empty</h3>
            <p className="text-xs text-slate-400">
              No emergency intervention plan has been registered yet for "{selectedMission.title}". Execute the emergency command to activate.
            </p>
          </div>
          <button
            onClick={handleRescue}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs rounded transition shadow-md shadow-red-500/15 cursor-pointer"
          >
            Initiate Emergency Rescue Now
          </button>
        </div>
      )}

      {!isLoading && selectedMission && selectedMission.rescuePlan && (
        <div className="space-y-6 animate-fade-in">
          {/* Tactical Countdown Panel */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-950/20 to-black/60 border border-red-900/40 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left Column: Target info */}
              <div className="space-y-1.5 md:col-span-1">
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">RESCUE OPERATION ACTIVE</span>
                <h3 className="text-base font-bold text-white leading-tight">{selectedMission.title}</h3>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Target Deadline: {new Date(selectedMission.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Middle Column: Visual Clock */}
              <div className="md:col-span-2 flex justify-center md:justify-end gap-3 sm:gap-4 select-none">
                {[
                  { label: "DAYS", val: timeLeft.days },
                  { label: "HRS", val: timeLeft.hours },
                  { label: "MINS", val: timeLeft.minutes },
                  { label: "SECS", val: timeLeft.seconds },
                ].map((item, idx) => (
                  <div key={idx} className="bg-black/60 border border-red-900/40 rounded-xl px-4 py-3.5 w-18 sm:w-20 text-center flex flex-col justify-center items-center shadow shadow-red-950/10">
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-500 font-mono tracking-tighter block leading-none">
                      {String(item.val).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider mt-1.5">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EXPECTED RECOVERY OUTCOME PROJECTIONS */}
          <div className="p-5 rounded-xl bg-[#0d1117] border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[20%] h-[20%] bg-emerald-500/5 rounded-full blur-[30px] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3.5 mb-3.5">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold tracking-wider">RESCUE EFFECTIVENESS OUTLOOK</span>
                <h4 className="text-sm font-bold text-white mt-1">EXPECTED RECOVERY MARGINS</h4>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg shrink-0">
                <Percent className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[8px] text-slate-500 font-mono block uppercase">New Success Probability</span>
                  <strong className="text-xs font-bold font-mono text-emerald-400">{selectedMission.rescuePlan.newSuccessProbability}%</strong>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-red-400">PREVIOUS MARGIN: {selectedMission.risk?.successProbability ?? 35}%</span>
                  <span className="text-emerald-400">RESCUED MARGIN: {selectedMission.rescuePlan.newSuccessProbability}%</span>
                </div>
                {/* Visual side-by-side progression bar */}
                <div className="w-full h-3 bg-red-500/10 rounded-full overflow-hidden flex border border-white/5 p-0.5">
                  <div className="bg-red-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${selectedMission.risk?.successProbability ?? 35}%` }} />
                  <div className="bg-emerald-500 h-full rounded-r-full transition-all duration-500" style={{ width: `${selectedMission.rescuePlan.newSuccessProbability - (selectedMission.risk?.successProbability ?? 35)}%` }} />
                </div>
              </div>
              
              <div className="p-3 rounded bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                <strong>Explanation of Adjustments:</strong> {selectedMission.rescuePlan.explanation}
              </div>
            </div>
          </div>

          {/* Time-Phased Crisis Roadmaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Phase 1: NEXT 60 MINUTES */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-400" /> NEXT 60 MINUTES
                </span>
                <span className="text-[9.5px] font-mono text-red-400 bg-red-400/5 px-2 py-0.5 rounded font-bold animate-pulse">
                  CRITICAL SPRINT
                </span>
              </div>
              
              <div className="space-y-3">
                {selectedMission.rescuePlan.next60Minutes?.map((action, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-[10px] font-mono bg-red-500/20 border border-red-500/30 text-red-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-normal font-sans">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 2: NEXT 3 HOURS */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> NEXT 3 HOURS
                </span>
                <span className="text-[9.5px] font-mono text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded font-bold">
                  HIGH IMPACT
                </span>
              </div>

              <div className="space-y-3">
                {selectedMission.rescuePlan.next3Hours?.map((action, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-normal font-sans">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 3: NEXT 24 HOURS */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-400" /> NEXT 24 HOURS
                </span>
                <span className="text-[9.5px] font-mono text-sky-400 bg-sky-400/5 px-2 py-0.5 rounded font-bold">
                  MILESTONES
                </span>
              </div>

              <div className="space-y-3">
                {selectedMission.rescuePlan.next24Hours?.map((action, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg bg-sky-500/5 border border-sky-500/10">
                    <span className="text-[10px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-normal font-sans">{action}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Scope Adjustments: POSTPONE vs PROTECT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* POSTPONE (Shed Fluff) */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-amber-500/10 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-amber-500/10">
                <EyeOff className="w-4 h-4" /> POSTPONE // SHED NON-ESSENTIALS
              </span>
              <p className="text-[11px] text-slate-500 font-sans leading-normal">
                These subtasks are deemed non-critical or secondary luxury fluff. Shelving them recovers valuable temporal capacity to prevent critical breaches.
              </p>
              
              <div className="space-y-2">
                {selectedMission.rescuePlan.postpone?.map((item, i) => (
                  <div key={i} className="flex gap-2.5 items-center p-2.5 rounded bg-white/[0.01] border border-white/5 text-xs text-slate-400 font-sans">
                    <span className="text-amber-500 font-bold text-xs shrink-0">▼</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PROTECT (Hold Deliverables) */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-emerald-500/15 space-y-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-emerald-500/15">
                <ProtectIcon className="w-4 h-4" /> PROTECT // MANDATORY DELIVERABLES
              </span>
              <p className="text-[11px] text-slate-500 font-sans leading-normal">
                Under no circumstances should these core MVP milestones be deferred. They represent the baseline survival threshold of your mission.
              </p>

              <div className="space-y-2">
                {selectedMission.rescuePlan.protect?.map((item, i) => (
                  <div key={i} className="flex gap-2.5 items-center p-2.5 rounded bg-emerald-500/[0.02] border border-emerald-500/10 text-xs text-slate-200 font-sans font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Chief of Staff Advice */}
          <div className="p-4.5 bg-[#0d1117]/50 border border-white/10 rounded-xl flex items-center gap-3.5">
            <Sparkles className="w-5 h-5 text-violet-400 shrink-0 animate-pulse" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300 font-bold">Chief of Staff Directive:</strong> The chronological cuts and sprint assignments above are compiled recursively. Working strictly on these targets reduces effort waste by up to 45%, guaranteeing early delivery.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
