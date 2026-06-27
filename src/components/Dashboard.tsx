import React, { useMemo } from "react";
import { 
  ShieldAlert, ShieldCheck, Activity, Calendar, Clock, 
  ArrowRight, CheckSquare, Zap, AlertTriangle, Play, Sparkles, BrainCircuit, UserCheck 
} from "lucide-react";
import { Mission, ActivityLog, Agent } from "../types";
import { motion } from "motion/react";
import { LogoIcon } from "./Logo";

interface DashboardProps {
  missions: Mission[];
  agents: Agent[];
  activityLogs: ActivityLog[];
  onNavigate: (page: string) => void;
  onSelectMission: (missionId: string) => void;
  onCompleteTask: (missionId: string, subtaskId: string) => void;
  onStartRescue: (missionId: string) => void;
}

export default function Dashboard({
  missions,
  agents,
  activityLogs,
  onNavigate,
  onSelectMission,
  onCompleteTask,
  onStartRescue,
}: DashboardProps) {
  // Active missions
  const activeMissions = useMemo(() => {
    return missions.filter((m) => m.status !== "Completed" && m.status !== "Failed");
  }, [missions]);

  // Success / Failure calculations
  const stats = useMemo(() => {
    if (activeMissions.length === 0) {
      return { success: 95, failure: 5, riskScore: 10, totalHrs: 0 };
    }

    let totalRisk = 0;
    let totalHrs = 0;
    activeMissions.forEach((m) => {
      totalHrs += m.estimatedHours;
      if (m.risk) {
        totalRisk += m.risk.riskScore;
      } else {
        totalRisk += 30; // default moderate risk
      }
    });

    const avgRisk = Math.round(totalRisk / activeMissions.length);
    const successProb = Math.max(5, 100 - avgRisk);
    const failureProb = Math.min(95, avgRisk);

    return {
      success: successProb,
      failure: failureProb,
      riskScore: avgRisk,
      totalHrs,
    };
  }, [activeMissions]);

  // Today's Battle Plan (top 3 highest priority/closest deadline tasks or subtasks)
  const battlePlanTasks = useMemo(() => {
    const items: { missionId: string; missionTitle: string; subtaskId?: string; title: string; priority: string; deadline: string }[] = [];
    
    // Find uncompleted high/urgent priority subtasks
    activeMissions.forEach((m) => {
      (m.subtasks || []).filter(s => !s.completed).forEach((s) => {
        items.push({
          missionId: m.id,
          missionTitle: m.title,
          subtaskId: s.id,
          title: s.title,
          priority: m.priority,
          deadline: m.deadline,
        });
      });
    });

    // Sort by priority and deadline
    return items
      .sort((a, b) => {
        if (a.priority === "Urgent" && b.priority !== "Urgent") return -1;
        if (b.priority === "Urgent" && a.priority !== "Urgent") return 1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })
      .slice(0, 4);
  }, [activeMissions]);

  // Risk Heatmap data (for the next 7 days)
  const heatmapData = useMemo(() => {
    const days = ["Today", "Tomorrow", "+2 Days", "+3 Days", "+4 Days", "+5 Days", "+6 Days"];
    const results = days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      const startOfDay = new Date(date.setHours(0,0,0,0)).getTime();
      const endOfDay = new Date(date.setHours(23,59,59,999)).getTime();

      // Find tasks due on this day
      const dueMissions = activeMissions.filter((m) => {
        const d = new Date(m.deadline).getTime();
        return d >= startOfDay && d <= endOfDay;
      });

      let hours = 0;
      let maxRisk = "Safe";
      dueMissions.forEach((m) => {
        hours += m.estimatedHours;
        if (m.risk?.urgencyLevel === "Critical") maxRisk = "Critical";
        else if (m.risk?.urgencyLevel === "Warning" && maxRisk !== "Critical") maxRisk = "Warning";
      });

      let loadLevel: "low" | "medium" | "high" = "low";
      if (hours > 15 || maxRisk === "Critical") loadLevel = "high";
      else if (hours > 6 || maxRisk === "Warning") loadLevel = "medium";

      return {
        day,
        hours,
        risk: maxRisk,
        loadLevel,
        count: dueMissions.length,
      };
    });
    return results;
  }, [activeMissions]);

  // AI recommendations (Smart tactical suggestions)
  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (stats.riskScore > 60) {
      recs.push("CRITICAL OVERLOAD: The combined schedule risk exceeds 60%. Rescue Commander recommends cutting visual assets or secondary deliverables immediately on at least one high-risk mission.");
    }
    const criticalTask = activeMissions.find(m => m.risk?.urgencyLevel === 'Critical');
    if (criticalTask) {
      recs.push(`RESCUE SUGGESTION: "${criticalTask.title}" has been flagged as CRITICAL. Activate Emergency Rescue Mode to isolate MVP subtasks and stabilize the submission path.`);
    }
    const overdueMissions = activeMissions.filter(m => new Date(m.deadline).getTime() < Date.now());
    if (overdueMissions.length > 0) {
      recs.push(`OVERDUE ACTION: You have ${overdueMissions.length} mission(s) past their chronological deadlines. Negotiator recommends either formal delay logs or emergency scope shrinkage.`);
    }
    if (recs.length === 0) {
      recs.push("OPTIMIZED: Your active roadmap is currently green. Maintain present pacing to ensure risk-free early deployments.");
      recs.push("BUFFER CHECK: Strategist recommends completing at least 2 small subtasks today to cushion against late-stage presentation overhead.");
    }
    return recs;
  }, [activeMissions, stats]);

  return (
    <div className="space-y-8 pb-12 font-sans selection:bg-sky-500/30 relative">
      {/* Premium startup logo watermark centered in Mission Control backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] pointer-events-none select-none z-0" id="mc-watermark">
        <LogoIcon size="custom" customWidth={380} customHeight={380} glow={false} />
      </div>

      {/* Overview Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success / Failure Gauge Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0d1117] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Mission Success Index</h2>
              <p className="text-xs text-slate-400">Chronological risk evaluation across all active deliverables.</p>
            </div>
            <span className="text-[10px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2.5 py-1 rounded uppercase tracking-wider font-bold">
              {activeMissions.length} Active Commitments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-4">
            {/* Success Probability Meter */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" className="stroke-white/5" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="72" cy="72" r="60" 
                    className="stroke-sky-500 transition-all duration-1000" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 - (376.8 * stats.success) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white font-mono">{stats.success}%</span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold">Success Prob</span>
                </div>
              </div>
              <p className="text-xs text-sky-400 font-semibold mt-3 flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-3.5 h-3.5" /> High Completion Zone
              </p>
            </div>

            {/* Failure Probability Meter */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" className="stroke-white/5" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="72" cy="72" r="60" 
                    className="stroke-red-500 transition-all duration-1000" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 - (376.8 * stats.failure) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white font-mono">{stats.failure}%</span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold">Failure Risk</span>
                </div>
              </div>
              <p className="text-xs text-red-400 font-semibold mt-3 flex items-center gap-1.5 justify-center">
                <ShieldAlert className="w-3.5 h-3.5" /> Predicted Collapse
              </p>
            </div>

            {/* Combined Metrics */}
            <div className="space-y-4 text-left border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block font-bold">Average Threat Score</span>
                <span className={`text-2xl font-bold font-mono ${stats.riskScore > 60 ? "text-red-400" : stats.riskScore > 30 ? "text-amber-400" : "text-sky-400"}`}>
                  {stats.riskScore} / 100
                </span>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-1.5 border border-white/10">
                  <div 
                    className={`h-full rounded-full ${stats.riskScore > 60 ? "bg-red-500" : stats.riskScore > 30 ? "bg-amber-500" : "bg-sky-500"}`}
                    style={{ width: `${stats.riskScore}%` }}
                  />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block font-bold">Total Effort Backlog</span>
                <span className="text-xl font-bold text-white font-mono">{stats.totalHrs} Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="p-6 rounded-2xl bg-[#0d1117] border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[40px] pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-4 text-violet-400">
              <BrainCircuit className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-white tracking-tight text-base">Defender Recommendations</h3>
            </div>
            <div className="space-y-3.5 my-2 max-h-[160px] overflow-y-auto pr-1">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2.5 items-start bg-violet-950/10 border border-violet-900/20 p-3 rounded-xl">
                  <Zap className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec}</p>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => onNavigate("analytics")}
            className="w-full text-center py-2.5 rounded-xl border border-sky-500 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-[10px] font-mono tracking-widest transition uppercase mt-4 cursor-pointer font-bold"
          >
            CONSULT AI COACH
          </button>
        </div>
      </div>

      {/* Sub Agents Status row */}
      <div>
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-500" /> ACTIVE SWARM NETWORK
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="p-4 rounded-xl bg-[#0d1117] border border-white/10 flex items-center gap-4 hover:border-sky-500/30 transition-all duration-300">
              <div className="relative">
                <span className="text-2xl">{agent.avatar}</span>
                <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                  agent.status === 'Idle' ? 'bg-slate-600' :
                  agent.status === 'Analyzing' ? 'bg-sky-500 animate-pulse' :
                  agent.status === 'Decomposing' ? 'bg-purple-500 animate-pulse' :
                  agent.status === 'Alerting' ? 'bg-red-500 animate-ping' : 'bg-amber-500 animate-pulse'
                }`} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-[9px] font-mono text-slate-500 block tracking-widest uppercase font-bold">{agent.role}</h4>
                <span className="text-xs font-bold text-white block truncate">{agent.name}</span>
                <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5 uppercase tracking-tighter">{agent.status}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Active Missions & Today's Battle Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Missions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-500" /> Active Operations ({activeMissions.length})
            </h3>
            <button 
              onClick={() => onNavigate("tasks")} 
              className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 hover:underline"
            >
              Configure Missions <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {activeMissions.length === 0 ? (
              <div className="p-10 text-center bg-[#0d1117] border border-dashed border-white/10 rounded-xl">
                <p className="text-slate-500 text-xs">No active operations loaded. Create a mission or parse a document to initialize.</p>
                <button 
                  onClick={() => onNavigate("tasks")}
                  className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-sky-500/20"
                >
                  Create First Mission
                </button>
              </div>
            ) : (
              activeMissions.map((mission) => {
                const totalSub = (mission.subtasks || []).length;
                const completedSub = (mission.subtasks || []).filter((s) => s.completed).length;
                
                return (
                  <div 
                    key={mission.id}
                    className="p-5 rounded-xl bg-[#0d1117] border border-white/10 hover:border-sky-500/30 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                            mission.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            mission.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            mission.priority === 'Medium' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-white/10'
                          }`}>
                            {mission.priority} Priority
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase border border-white/10">
                            {mission.category}
                          </span>
                          {mission.risk?.urgencyLevel === "Critical" && (
                            <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase border border-red-500/30 animate-pulse font-bold">
                              CRITICAL RISK
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors cursor-pointer" onClick={() => onSelectMission(mission.id)}>
                          {mission.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">{mission.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">DEADLINE</span>
                        <span className="text-xs font-bold text-white font-mono uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          {new Date(mission.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono uppercase font-bold">
                          <span>Progress</span>
                          <span>{mission.progress}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                          <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${mission.progress}%` }} />
                        </div>
                      </div>

                      <div className="text-left md:text-center text-xs text-slate-400 font-mono">
                        Subtasks: <span className="text-white font-bold">{completedSub} / {totalSub}</span>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => onSelectMission(mission.id)}
                          className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition"
                        >
                          Tactical Room
                        </button>
                        {mission.risk?.urgencyLevel === 'Critical' && (
                          <button 
                            onClick={() => onStartRescue(mission.id)}
                            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(239,68,68,0.4)] flex items-center gap-1 active:scale-95 cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3" /> Rescue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Battle Plan & Activity Feed */}
        <div className="space-y-6">
          {/* Battle Plan */}
          <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/10 relative overflow-hidden">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-bold">
              <CheckSquare className="w-4.5 h-4.5 text-sky-500" /> Today's Battle Plan
            </h3>
            <div className="space-y-3">
              {battlePlanTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  All micro-milestones complete for today. Buffer is safe!
                </div>
              ) : (
                battlePlanTasks.map((task, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white/5 border border-white/10 p-3 rounded-lg hover:border-sky-500/20 transition-all duration-300">
                    <button 
                      onClick={() => onCompleteTask(task.missionId, task.subtaskId || "")}
                      className="w-4.5 h-4.5 rounded border border-white/10 hover:border-sky-500 flex items-center justify-center shrink-0 mt-0.5 text-sky-500 hover:bg-sky-500/10 transition cursor-pointer"
                    >
                      {/* empty checkmark */}
                    </button>
                    <div className="overflow-hidden flex-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block truncate max-w-[180px] font-bold">
                        {task.missionTitle}
                      </span>
                      <p className="text-xs font-bold text-white mt-0.5 font-sans leading-tight">{task.title}</p>
                      <span className="text-[10px] font-mono text-slate-500 block mt-1">
                        Due: {new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Risk Heatmap Grid */}
          <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/10">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-bold">
              <Calendar className="w-4.5 h-4.5 text-sky-500" /> Workload Threat Grid
            </h3>
            <div className="space-y-2.5">
              {heatmapData.map((data, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400 w-16">{data.day}</span>
                  <div className="flex-1 mx-3 h-2 rounded bg-white/5 border border-white/10 overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.loadLevel === 'high' ? 'bg-red-500' :
                        data.loadLevel === 'medium' ? 'bg-amber-500' :
                        data.hours > 0 ? 'bg-sky-500' : 'bg-slate-700/20'
                      }`}
                      style={{ width: `${Math.min(100, (data.hours / 24) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-right w-16 text-[10px] text-slate-500">
                    {data.hours > 0 ? `${data.hours}h / ${data.count}m` : "Idle"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Safe</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Tight</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Agent Activity Feed */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2 font-bold">
            <Activity className="w-4.5 h-4.5 text-sky-500" /> Agent Activity Log (Real-Time)
          </h3>
          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded tracking-wider uppercase font-bold">
            Network Sync: ACTIVE
          </span>
        </div>
        <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {activityLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="flex gap-4.5 items-start text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <span className="font-mono text-slate-500 shrink-0 text-[10px] mt-0.5">
                {new Date(log.timestamp).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="shrink-0 font-mono font-bold uppercase text-[10px] tracking-widest w-28 text-sky-400 truncate">
                {log.agentRole}
              </div>
              <div className="flex-1 text-slate-300 font-sans leading-relaxed">
                {log.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
