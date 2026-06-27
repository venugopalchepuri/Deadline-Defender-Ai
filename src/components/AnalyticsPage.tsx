import React, { useState } from "react";
import { 
  TrendingUp, Activity, BarChart2, Calendar, ShieldCheck, 
  UserCheck, AlertTriangle, RefreshCw, HelpCircle, Zap, Sparkles 
} from "lucide-react";
import { DailyCheckIn } from "../types";

interface AnalyticsPageProps {
  checkIns: DailyCheckIn[];
  onTriggerCoach: (completed: number, missed: number, tasksText: string) => Promise<DailyCheckIn | null>;
  isLoadingCoach: boolean;
}

export default function AnalyticsPage({
  checkIns,
  onTriggerCoach,
  isLoadingCoach,
}: AnalyticsPageProps) {
  // Check-In Form State
  const [plannedCount, setPlannedCount] = useState(5);
  const [completedCount, setCompletedCount] = useState(3);
  const [tasksText, setTasksText] = useState("");
  const [latestCoaching, setLatestCoaching] = useState<DailyCheckIn | null>(checkIns[0] || null);

  const handleCoachRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const missed = Math.max(0, plannedCount - completedCount);
    const checkIn = await onTriggerCoach(completedCount, missed, tasksText);
    if (checkIn) {
      setLatestCoaching(checkIn);
    }
  };

  // Mock Performance Data for SVG visual charts
  const weeklyCompletionRate = [65, 72, 80, 85, 78, 92]; // Last 6 weeks
  const workloadDistribution = [
    { category: "Hackathon", hours: 18, color: "bg-blue-500", fill: "#3b82f6" },
    { category: "Academic", hours: 12, color: "bg-purple-500", fill: "#a855f7" },
    { category: "Work", hours: 8, color: "bg-amber-500", fill: "#f59e0b" },
    { category: "Personal", hours: 4, color: "bg-emerald-500", fill: "#10b981" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 font-sans">
      {/* Left Columns: Analytics & Visual Trends */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-5 rounded-2xl bg-black/40 border border-gray-900">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> PRODUCTIVITY TRENDS
              </h3>
              <p className="text-xs text-gray-400">Weekly completion yield and buffer safety margins.</p>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider bg-gray-950 px-2 py-0.5 rounded border border-gray-900">
              Updated: LIVE
            </span>
          </div>

          {/* SVG line chart representing weekly completion rate */}
          <div className="relative h-48 w-full bg-black/30 border border-gray-900/40 rounded-xl p-4 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#111" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#111" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#111" strokeWidth="1" strokeDasharray="5,5" />

              {/* Area Under Curve */}
              <path 
                d="M 10 150 L 10 102.5 L 100 92 L 190 80 L 280 72.5 L 370 83 L 460 62 L 460 150 Z" 
                fill="url(#glow-gradient)" 
                opacity="0.15" 
              />

              {/* Glowing Line */}
              <path 
                d="M 10 102.5 L 100 92 L 190 80 L 280 72.5 L 370 83 L 460 62" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Interactive nodes */}
              {[
                { x: 10, y: 102.5, val: "65%" },
                { x: 100, y: 92, val: "72%" },
                { x: 190, y: 80, val: "80%" },
                { x: 280, y: 72.5, val: "85%" },
                { x: 370, y: 83, val: "78%" },
                { x: 460, y: 62, val: "92%" },
              ].map((node, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle cx={node.x} cy={node.y} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                  <text x={node.x} y={node.y - 12} textAnchor="middle" fill="#9ca3af" className="text-[9px] font-mono font-bold">
                    {node.val}
                  </text>
                </g>
              ))}

              {/* Gradient definition */}
              <defs>
                <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-3.5 px-2">
            <span>6 Wks Ago</span>
            <span>4 Wks Ago</span>
            <span>2 Wks Ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Workload distribution */}
        <div className="p-5 rounded-2xl bg-black/40 border border-gray-900">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-purple-400" /> COGNITIVE EFFORT DISTRIBUTION
          </h3>

          <div className="space-y-4">
            {workloadDistribution.map((item, idx) => {
              const maxHours = 20;
              const percent = (item.hours / maxHours) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-300 font-sans">{item.category}</span>
                    <span className="font-mono text-gray-400">{item.hours} hrs remaining</span>
                  </div>
                  <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-900">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Daily Accountability check-in & coaching */}
      <div className="lg:col-span-1 space-y-6">
        {/* Check-In Action Card */}
        <div className="p-5 rounded-2xl bg-black/40 border border-gray-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4 text-purple-400">
            <UserCheck className="w-5 h-5" />
            <h3 className="font-bold text-white tracking-tight text-base">Daily Integrity Check-In</h3>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Log your actual performance metrics from yesterday. The Accountability Agent compiles patterns and outputs direct corrective coaching.
          </p>

          <form onSubmit={handleCoachRequest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-mono block uppercase mb-1">Planned Yesterday</label>
                <input 
                  type="number" 
                  min={1}
                  value={plannedCount}
                  onChange={(e) => setPlannedCount(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-900 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-300 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-mono block uppercase mb-1">Completed Actually</label>
                <input 
                  type="number" 
                  min={0}
                  value={completedCount}
                  onChange={(e) => setCompletedCount(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-900 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-300 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-mono block uppercase mb-1">List completed & missed tasks</label>
              <textarea 
                value={tasksText}
                onChange={(e) => setTasksText(e.target.value)}
                placeholder="Completed: Core UI setup, researched icons. Missed: Connect Express API endpoints due to timing..."
                rows={2}
                className="w-full bg-gray-950 border border-gray-900 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingCoach}
              className="w-full text-center py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition duration-200 shadow-md shadow-purple-500/15 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
            >
              {isLoadingCoach ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Patterns...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" /> Submit Daily Check-In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Coach feedback */}
        {latestCoaching ? (
          <div className="p-5 rounded-2xl bg-black/40 border border-purple-900/30 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold">COACH DEBRIEFING</h4>
            </div>

            <div className="space-y-1 bg-purple-950/15 border border-purple-950/25 p-3 rounded-xl">
              <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider block font-bold">PATTERN DETECTED</span>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">{latestCoaching.pattern}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-mono text-gray-500 uppercase block font-bold">TACTICAL ACTION CORRECTIONS</span>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {latestCoaching.coachingFeedback.split("\n").filter(Boolean).map((tip, i) => (
                  <div key={i} className="text-xs text-gray-400 bg-gray-950 border border-gray-900 p-2 rounded leading-relaxed flex items-start gap-2">
                    <span className="text-purple-400 font-bold shrink-0">•</span>
                    <p>{tip.replace(/^\d+\.\s*/, "")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-gray-900 rounded-2xl bg-black/20 text-gray-500 text-xs py-14">
            Submit yesterday's check-in to trigger the Accountability Agent's live coaching engine.
          </div>
        )}
      </div>
    </div>
  );
}
