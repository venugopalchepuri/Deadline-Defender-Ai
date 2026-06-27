import React, { useState } from "react";
import { 
  Plus, Calendar, Clock, AlertTriangle, ShieldCheck, 
  BrainCircuit, CheckSquare, Trash2, Search, Filter, RefreshCw, ChevronRight, Zap
} from "lucide-react";
import { Mission, SubTask, GeminiDecompositionResult } from "../types";

interface TasksPageProps {
  missions: Mission[];
  selectedMissionId: string | null;
  onSelectMission: (missionId: string | null) => void;
  onAddMission: (mission: Omit<Mission, 'id' | 'subtasks' | 'progress' | 'status'>) => void;
  onDecomposeMission: (missionId: string) => void;
  onDeleteMission: (missionId: string) => void;
  onToggleSubtask: (missionId: string, subtaskId: string) => void;
  onUpdateStatus: (missionId: string, status: Mission['status']) => void;
  isDecomposing: boolean;
  decompositionError?: string | null;
  onClearDecompositionError?: () => void;
  decompositionResults?: Record<string, GeminiDecompositionResult>;
}

export default function TasksPage({
  missions,
  selectedMissionId,
  onSelectMission,
  onAddMission,
  onDecomposeMission,
  onDeleteMission,
  onToggleSubtask,
  onUpdateStatus,
  isDecomposing,
  decompositionError = null,
  onClearDecompositionError,
  decompositionResults = {},
}: TasksPageProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Hackathon");
  const [newPriority, setNewPriority] = useState("High");
  const [newDeadline, setNewDeadline] = useState("");
  const [newHours, setNewHours] = useState(12);

  const selectedMission = missions.find(m => m.id === selectedMissionId) || null;

  // Filtered Missions
  const filteredMissions = missions.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;
    const matchesPriority = priorityFilter === "All" || m.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDeadline) return;
    onAddMission({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      priority: newPriority as any,
      deadline: newDeadline,
      estimatedHours: Number(newHours),
    });
    setNewTitle("");
    setNewDesc("");
    setNewCategory("Hackathon");
    setNewPriority("High");
    setNewDeadline("");
    setNewHours(12);
    setShowAddForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 font-sans selection:bg-sky-500/30">
      {/* Left Columns: Missions List & Filter Area */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1117] border border-white/10 p-4 rounded-xl">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-500" /> Active Operations Center
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition duration-200 shadow-md shadow-sky-500/15 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Initialize Mission
          </button>
        </div>

        {/* Add Mission Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-[#0d1117] border border-sky-500/30 space-y-4 shadow-lg shadow-sky-500/5">
            <h3 className="text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">Initialize New Mission Vector</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1 font-bold tracking-wider">Mission Code Title *</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Build Hackathon Project"
                  className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-2 text-xs text-white outline-none transition"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1 font-bold tracking-wider">Target Deadline Date *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-2 text-xs text-white outline-none font-mono transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1 font-bold tracking-wider">Operational Description</label>
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Core objectives and success parameters..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-2 text-xs text-white outline-none resize-none transition"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1 font-bold tracking-wider">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-2 text-xs text-slate-300 outline-none transition"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Academic">Academic</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1 font-bold tracking-wider">Threat Level</label>
                <select 
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-2 text-xs text-slate-300 outline-none transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1 font-bold tracking-wider">Estimated Hours</label>
                <input 
                  type="number" 
                  min={1}
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-2 text-xs text-white outline-none font-mono transition"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-sky-500/20 active:scale-95 transition"
                >
                  Initialize Vector
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filters and search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0d1117] border border-white/10 p-3.5 rounded-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter missions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded pl-9.5 pr-3.5 py-1.5 text-xs text-white outline-none transition"
            />
          </div>
          <div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-1.5 text-xs text-slate-300 outline-none transition"
            >
              <option value="All">All Categories</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Academic">Academic</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-3.5 py-1.5 text-xs text-slate-300 outline-none transition"
            >
              <option value="All">All Threat Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Mission List */}
        <div className="space-y-3">
          {filteredMissions.length === 0 ? (
            <div className="p-10 text-center bg-[#0d1117] border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
              No matching missions found. Change filters or initialize a new mission vector.
            </div>
          ) : (
            filteredMissions.map((mission) => (
              <div 
                key={mission.id}
                onClick={() => onSelectMission(mission.id)}
                className={`p-4.5 rounded-xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                  selectedMissionId === mission.id 
                    ? "bg-sky-500/10 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                    : "bg-[#0d1117] border-white/10 hover:border-sky-500/30"
                }`}
              >
                <div className="space-y-1 overflow-hidden pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                      mission.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      mission.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      mission.priority === 'Medium' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-white/10'
                    }`}>
                      {mission.priority}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded uppercase border border-white/10">
                      {mission.category}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase font-bold">
                      {mission.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white block truncate">{mission.title}</h3>
                  <div className="flex gap-4 text-[11px] text-slate-500 font-mono uppercase tracking-tight">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {new Date(mission.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {mission.estimatedHours}h estimated</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-sky-400 block">{mission.progress}%</span>
                    <div className="w-16 bg-white/5 h-1 rounded-full overflow-hidden mt-1 border border-white/10">
                      <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${mission.progress}%` }} />
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-600 transition-all ${selectedMissionId === mission.id ? "rotate-90 text-sky-500" : ""}`} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: In-depth Mission Room details */}
      <div className="lg:col-span-1 space-y-4">
        {selectedMission ? (
          <div className="space-y-4 sticky top-24">
            {/* Core Mission Room Info */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-white/10 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2 font-bold">
                  <BrainCircuit className="w-4.5 h-4.5 text-sky-500" /> Operational Room
                </h3>
                <button 
                  onClick={() => onDeleteMission(selectedMission.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="Abrogate Mission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight">{selectedMission.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1 font-sans">{selectedMission.description || "No description loaded."}</p>

              {/* Status Select */}
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold">State Vector</label>
                  <select 
                    value={selectedMission.status}
                    onChange={(e) => onUpdateStatus(selectedMission.id, e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 focus:border-sky-500 rounded px-2 py-1 text-xs text-slate-300 outline-none transition"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold">Target Deadline</label>
                  <span className="text-xs font-mono font-bold text-white block mt-1.5 truncate">
                    {new Date(selectedMission.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Strategist Roadmap: Subtask breakdown */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <BrainCircuit className="w-4 h-4 text-violet-400" /> ROADMAP // STRATEGIST
                </h3>
                <button
                  onClick={() => onDecomposeMission(selectedMission.id)}
                  disabled={isDecomposing}
                  className="px-2.5 py-1 bg-violet-950/20 hover:bg-violet-900/40 disabled:opacity-50 text-violet-400 rounded text-[10px] font-mono border border-violet-900/30 flex items-center gap-1 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isDecomposing ? "animate-spin" : ""}`} /> Decompose
                </button>
              </div>

              {/* AI Strategist Generation Status Section */}
              {(() => {
                const currentResult = decompositionResults[selectedMission.id];
                if (!currentResult) return null;
                const isSuccess = currentResult.geminiStatus === "success" && !currentResult.fallback;
                
                return (
                  <div className="mb-4 p-4 rounded-xl border border-white/5 bg-slate-950/60 font-mono text-xs">
                    {/* Status Display Area */}
                    <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-white/5">
                      {isSuccess ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          AI Strategist Compiled
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase text-[10px] tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Fallback Mode Activated
                        </div>
                      )}
                    </div>

                    {/* Diagnostics Panel */}
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-2.5 text-[11px] mb-3">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        🔬 Strategic Diagnostics Panel
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Planning Layer</span>
                          <span className="text-violet-300 font-bold">{currentResult.geminiModel ? currentResult.geminiModel.replace("gemini-", "Core Model ") : "Intelligent Engine"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Request Duration</span>
                          <span className="text-sky-300 font-bold">
                            {currentResult.debugLogs?.durationMs 
                              ? `${(currentResult.debugLogs.durationMs / 1000).toFixed(2)}s` 
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-2">
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Success/Failure Reason</span>
                        {isSuccess ? (
                          <span className="text-emerald-400">Structured decomposition formulated and verified successfully.</span>
                        ) : (
                          <span className="text-red-400 leading-relaxed block">
                            {currentResult.geminiError ? currentResult.geminiError.replace(/gemini/gi, 'Predictive Engine') : "AI Strategist unavailable. Safely engaged pre-designed template roadmap."}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Development mode Debug Console */}
                    <div className="mt-2 pt-1">
                      <details className="cursor-pointer group">
                        <summary className="text-[10px] text-slate-500 hover:text-white uppercase font-bold select-none list-none flex items-center justify-between">
                          <span>[DEV_CONSOLE] Debug Logs & Raw Payload</span>
                          <span className="text-violet-400 group-open:rotate-90 transition-transform duration-200">▶</span>
                        </summary>
                        <div className="mt-2 space-y-2 text-[10px] bg-black/60 p-2.5 rounded border border-white/5 max-h-[250px] overflow-y-auto font-mono text-slate-300 scrollbar-thin">
                          <div>
                            <span className="text-sky-400 font-bold block mb-0.5">1. HTTP STATUS CODE:</span>
                            <span className="text-slate-200">{String(currentResult.debugLogs?.httpStatus ?? "N/A")}</span>
                          </div>
                          {currentResult.debugLogs?.requestPayload && (
                            <div>
                              <span className="text-sky-400 font-bold block mb-0.5">2. RAW GEMINI REQUEST PROMPT:</span>
                              <pre className="p-1.5 bg-slate-900 rounded border border-white/5 whitespace-pre-wrap text-[9px] overflow-x-auto text-slate-400">
                                {currentResult.debugLogs.requestPayload.prompt || "N/A"}
                              </pre>
                            </div>
                          )}
                          {currentResult.debugLogs?.rawResponse && (
                            <div>
                              <span className="text-sky-400 font-bold block mb-0.5">3. RAW GEMINI RESPONSE TEXT:</span>
                              <pre className="p-1.5 bg-slate-900 rounded border border-white/5 whitespace-pre-wrap text-[9px] overflow-x-auto text-slate-400 font-mono">
                                {currentResult.debugLogs.rawResponse}
                              </pre>
                            </div>
                          )}
                          {currentResult.debugLogs?.jsonParsingError && (
                            <div className="p-1.5 bg-red-950/20 border border-red-900/30 rounded text-red-300">
                              <span className="text-red-400 font-bold block mb-0.5">4. JSON PARSING BREAKDOWN:</span>
                              <p>{currentResult.debugLogs.jsonParsingError.message}</p>
                            </div>
                          )}
                          {currentResult.debugLogs?.schemaValidationFailure && (
                            <div className="p-1.5 bg-red-950/20 border border-red-900/30 rounded text-red-300">
                              <span className="text-red-400 font-bold block mb-0.5">5. SCHEMA VALIDATION FAILURE:</span>
                              <ul className="list-disc list-inside space-y-0.5 mt-1 text-[9px]">
                                {currentResult.debugLogs.schemaValidationFailure.errors?.map((errStr: string, index: number) => (
                                  <li key={index}>{errStr}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })()}

              {/* Error/Warning Alert UI */}
              {decompositionError && (
                <div className={`mb-4 p-3 rounded-lg border text-xs flex justify-between items-start gap-2 animate-pulse ${
                  decompositionError.includes("fallback") 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-300" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  <div className="flex-1">
                    <span className="font-bold block uppercase font-mono text-[9px] tracking-widest mb-1 text-slate-400">
                      {decompositionError.includes("fallback") ? "⚡ STRATEGY FALLBACK" : "❌ ENGINE BREAKDOWN"}
                    </span>
                    <p className="leading-relaxed">{decompositionError}</p>
                  </div>
                  {onClearDecompositionError && (
                    <button 
                      onClick={onClearDecompositionError}
                      className="text-[10px] font-mono hover:text-white text-slate-400 uppercase bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {(!selectedMission.subtasks || selectedMission.subtasks.length === 0) ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-slate-500 text-xs">No roadmap has been decomposed yet for this mission.</p>
                  <button
                    onClick={() => onDecomposeMission(selectedMission.id)}
                    disabled={isDecomposing}
                    className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded text-xs font-bold uppercase tracking-wider transition shadow-md shadow-violet-500/20"
                  >
                    {isDecomposing ? "Decomposing..." : "AI Generate Roadmap"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedMission.subtasks?.map((sub, idx) => (
                    <div 
                      key={sub.id} 
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition duration-300 ${
                        sub.completed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/10"
                      }`}
                    >
                      <button
                        onClick={() => onToggleSubtask(selectedMission.id, sub.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                          sub.completed 
                            ? "bg-emerald-500 border-emerald-400 text-black font-bold" 
                            : "border-slate-700 hover:border-violet-400 text-transparent"
                        }`}
                      >
                        ✓
                      </button>
                      <div className="overflow-hidden flex-1">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                          Step 0{idx + 1} // {sub.category}
                        </span>
                        <p className={`text-xs font-medium leading-tight mt-0.5 font-sans ${sub.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>
                          {sub.title}
                        </p>
                        {sub.description && (
                          <p className={`text-[10px] mt-1 leading-relaxed ${sub.completed ? "text-slate-600 line-through" : "text-slate-400"}`}>
                            {sub.description}
                          </p>
                        )}
                        <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                          Effort: {sub.estimatedHours} hrs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Analyst: Risk prediction report */}
            {selectedMission.risk && (
              <div className="p-6 rounded-xl bg-[#0F1420] border border-white/10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <AlertTriangle className={`w-4 h-4 ${
                      selectedMission.risk.urgencyLevel === 'Critical' ? 'text-red-400 animate-pulse' : 'text-amber-400'
                    }`} /> RISK ANALYST REPORT
                  </h3>
                  <div className="flex items-center gap-1.5 bg-sky-500/5 px-2.5 py-1 rounded-full border border-sky-500/10">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-mono text-sky-400 uppercase font-bold">Confidence: {selectedMission.risk.confidenceLevel || 'High'}</span>
                  </div>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">Threat Level</span>
                    <span className={`text-sm font-bold block mt-1 ${
                      selectedMission.risk.urgencyLevel === 'Critical' ? 'text-red-400 font-black animate-pulse' :
                      selectedMission.risk.urgencyLevel === 'Warning' ? 'text-amber-400' : 'text-sky-400'
                    }`}>
                      {selectedMission.risk.urgencyLevel.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 mt-1 block">Calculated Urgency</span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">Threat Score</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-mono font-bold text-white">
                        {selectedMission.risk.riskScore}
                      </span>
                      <span className="text-[10px] text-slate-500">/ 100</span>
                    </div>
                    {/* Tiny micro progress bar for visual feedback */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full ${
                          selectedMission.risk.riskScore > 75 ? 'bg-red-500' :
                          selectedMission.risk.riskScore > 40 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${selectedMission.risk.riskScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">Operational Outlook</span>
                    <div className="flex justify-between items-center mt-1 font-mono text-[10px]">
                      <div className="text-emerald-400">
                        <span className="block font-bold text-xs">{selectedMission.risk.successProbability ?? (100 - selectedMission.risk.riskScore)}%</span>
                        <span>Success</span>
                      </div>
                      <div className="h-4 w-px bg-white/10" />
                      <div className="text-red-400 text-right">
                        <span className="block font-bold text-xs">{selectedMission.risk.failureProbability ?? selectedMission.risk.riskScore}%</span>
                        <span>Failure</span>
                      </div>
                    </div>
                    {/* Combined horizontal split bar */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2 flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${selectedMission.risk.successProbability ?? (100 - selectedMission.risk.riskScore)}%` }} />
                      <div className="bg-red-500 h-full" style={{ width: `${selectedMission.risk.failureProbability ?? selectedMission.risk.riskScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Risk Contributors List */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold tracking-wider">Risk Contributors Breakdown</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMission.risk.riskContributors?.map((contributor, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg flex flex-col justify-between hover:bg-white/[0.04] transition duration-200">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-medium text-slate-300 font-sans truncate">{contributor.factor}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                            contributor.impact === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                            contributor.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/10'
                          }`}>
                            {contributor.impact} Impact
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-normal font-sans">
                          {contributor.description}
                        </p>
                      </div>
                    )) || (
                      <div className="col-span-2 py-4 text-center border border-dashed border-white/5 rounded-lg text-slate-600 text-[10px] uppercase font-mono">
                        Contributors data is pending rerun of analysis
                      </div>
                    )}
                  </div>
                </div>

                {/* Balanced Reasoning Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Risks/Failure Points */}
                  <div className="space-y-2 bg-red-500/[0.01] border border-red-500/5 p-3 rounded-lg">
                    <span className="text-[9px] font-mono text-red-400/80 uppercase block font-bold tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Threat Vectors (Increases Risk)
                    </span>
                    <div className="space-y-1.5">
                      {selectedMission.risk.reasons?.map((reason, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-slate-400 leading-tight font-sans">
                          <span className="text-red-500/60 font-bold shrink-0 mt-0.5">•</span>
                          <p>{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mitigations */}
                  <div className="space-y-2 bg-emerald-500/[0.01] border border-emerald-500/5 p-3 rounded-lg">
                    <span className="text-[9px] font-mono text-emerald-400/80 uppercase block font-bold tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Mitigating Factors (Reduces Risk)
                    </span>
                    <div className="space-y-1.5">
                      {selectedMission.risk.mitigatingFactors?.map((factor, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-slate-400 leading-tight font-sans">
                          <span className="text-emerald-500/60 font-bold shrink-0 mt-0.5">✓</span>
                          <p>{factor}</p>
                        </div>
                      )) || (
                        <div className="flex gap-2 items-start text-xs text-slate-500 italic leading-tight">
                          <span>✓</span>
                          <p>Baseline timeline buffers and roadmap milestones exist.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Assessment executive summary */}
                <div className="bg-gradient-to-r from-sky-500/5 to-indigo-500/5 border border-sky-500/10 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-sky-400 uppercase tracking-wider font-bold">
                    <BrainCircuit className="w-3.5 h-3.5" /> OVERALL ASSESSMENT // AI PROJECT MANAGER
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                    {selectedMission.risk.overallAssessment || selectedMission.risk.explanation}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono italic">
                    "{selectedMission.risk.explanation}"
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#0d1117]/50 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs py-16 sticky top-24">
            Select a mission from the operations center to open its tactical board and roadmap room.
          </div>
        )}
      </div>
    </div>
  );
}
