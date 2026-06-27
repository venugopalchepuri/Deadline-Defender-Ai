import React, { useState, useRef } from "react";
import { 
  Upload, FileText, AlertCircle, RefreshCw, 
  CheckCircle, ShieldCheck, Sparkles, Database, Compass, Eye, ShieldAlert, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UploadPageProps {
  onIngestFile: (fileName: string, fileType: string, fileContent: string, rawText?: string) => Promise<any | null>;
  isLoading: boolean;
  pipelineStage: 'idle' | 'extracting' | 'decomposing' | 'analyzing_risk' | 'simulating' | 'rescuing' | 'completed';
  onRunDemoMode: () => void;
}

export default function UploadPage({ onIngestFile, isLoading, pipelineStage = 'idle', onRunDemoMode }: UploadPageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg("");
    setSuccessData(null);

    const fileName = file.name;
    const fileType = file.type;

    try {
      const reader = new FileReader();

      if (fileType.startsWith("image/")) {
        reader.onload = async () => {
          try {
            const resultString = reader.result as string;
            const base64Data = resultString ? resultString.split(",")[1] : ""; 
            const data = await onIngestFile(fileName, fileType, base64Data);
            if (data) setSuccessData(data);
          } catch (err: any) {
            console.error("FileReader onload error:", err);
            setErrorMsg("Failed to process the uploaded image blueprint.");
          }
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = async () => {
          try {
            const rawText = reader.result as string;
            const data = await onIngestFile(fileName, fileType, "", rawText);
            if (data) setSuccessData(data);
          } catch (err: any) {
            console.error("FileReader onload text error:", err);
            setErrorMsg("Failed to process the uploaded document text.");
          }
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to read the file local buffer.");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  // Automated pipeline stage details
  const pipelineSteps = [
    {
      key: 'extracting',
      label: 'Document Ingestion & Parsing',
      agent: 'Reconnaissance Commander',
      desc: 'Intelligent multi-agent parser is reading text elements and extracting target parameters.',
      color: 'border-sky-500/30 text-sky-400'
    },
    {
      key: 'decomposing',
      label: 'Roadmap Milestone Decomposition',
      agent: 'Strategist Agent',
      desc: 'Formulating modular tasks with custom time weight allocations and logic.',
      color: 'border-indigo-500/30 text-indigo-400'
    },
    {
      key: 'analyzing_risk',
      label: 'Dynamic Risk & Pacing Analysis',
      agent: 'Risk Analyst Agent',
      desc: 'Scoring velocity buffers, workload coefficients, and forecasting failures.',
      color: 'border-amber-500/30 text-amber-400'
    },
    {
      key: 'simulating',
      label: 'Quantum Future Timeline Projection',
      agent: 'Accountability Agent',
      desc: 'Generating comparative WITHOUT vs WITH Defender space-time models.',
      color: 'border-purple-500/30 text-purple-400'
    },
    {
      key: 'rescuing',
      label: 'Crisis Override Recovery Plan',
      agent: 'Rescue Commander',
      desc: 'Consolidating critical path actions and postponing low-value fluff.',
      color: 'border-rose-500/30 text-rose-400'
    }
  ];

  const getStepStatus = (stepKey: string) => {
    const order = ['idle', 'extracting', 'decomposing', 'analyzing_risk', 'simulating', 'rescuing', 'completed'];
    const currentIndex = order.indexOf(pipelineStage);
    const stepIndex = order.indexOf(stepKey);

    if (pipelineStage === 'completed') return 'completed';
    if (currentIndex === stepIndex) return 'active';
    if (currentIndex > stepIndex) return 'completed';
    return 'queued';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans selection:bg-sky-500/30">
      {/* Intro info */}
      <div className="p-6 rounded-2xl bg-[#0d1117] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest text-sky-400 mb-2 font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-400" /> RECONNAISSANCE COMMANDER
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">DOCUMENT INGESTION CENTER</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Upload syllabi, hackathon guidelines, job specs, or calendar screenshots. The Reconnaissance Commander reads instructions, maps milestones, and automatically triggers our multi-agent defense pipeline.
        </p>
      </div>

      {/* Demo Mode Invite Widget */}
      {pipelineStage === 'idle' && !successData && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/20 to-purple-950/20 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              <Compass className="w-4 h-4 text-sky-400" /> Hackathon Showcase Mode
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal max-w-lg">
              Don't have a syllabus or screenshot on hand? Launch our premium pre-packaged <strong>Astrophysics Research</strong> demo mission to immediately experience full multi-agent orchestration.
            </p>
          </div>
          <button
            onClick={onRunDemoMode}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded text-[11px] font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-sky-500/10 shrink-0 transition"
          >
            Launch Premium Demo
          </button>
        </motion.div>
      )}

      {/* Upload Drag Area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all relative ${
          dragActive 
            ? "border-sky-500 bg-sky-500/5 shadow shadow-sky-500/10" 
            : "border-white/10 bg-[#0d1117] hover:bg-[#0d1117]/80 hover:border-sky-500/30"
        } ${isLoading ? "pointer-events-none" : ""}`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*,text/*,application/pdf"
          disabled={isLoading}
          className="hidden"
        />

        {isLoading ? (
          <div className="space-y-8 py-4">
            {/* Active Pipeline Dashboard */}
            <div className="max-w-xl mx-auto space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    Orchestrating Autonomous AI Pipeline
                  </span>
                </div>
                <span className="text-[10px] font-mono text-sky-400 font-semibold animate-pulse">
                  STAGES IN SEQUENCE...
                </span>
              </div>

              {/* Step Iterations */}
              <div className="space-y-4">
                {pipelineSteps.map((step, idx) => {
                  const status = getStepStatus(step.key);
                  const isCurrent = status === 'active';
                  const isDone = status === 'completed';

                  // Skip rescue commander step if pipeline stage is not rescuing and is completed without it
                  if (step.key === 'rescuing' && pipelineStage !== 'rescuing' && pipelineStage === 'completed' && !successData?.rescuePlan) {
                    return null;
                  }

                  return (
                    <motion.div 
                      key={step.key}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-3.5 rounded-xl border flex gap-4 items-start transition-colors ${
                        isCurrent 
                          ? "bg-sky-500/5 border-sky-500/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]" 
                          : isDone 
                          ? "bg-[#0b1017] border-emerald-500/20 opacity-90" 
                          : "bg-[#0d1117]/40 border-white/5 opacity-40"
                      }`}
                    >
                      <div className="pt-0.5">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                            <RefreshCw className="w-3 h-3 text-sky-400 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-slate-500">
                            0{idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white block font-sans">
                            {step.label}
                          </span>
                          <span className={`text-[8.5px] font-mono uppercase tracking-widest font-bold ${
                            isCurrent ? "text-sky-400" : isDone ? "text-emerald-500" : "text-slate-500"
                          }`}>
                            {step.agent}
                          </span>
                        </div>
                        {isCurrent && (
                          <p className="text-[10px] text-slate-400 leading-normal font-sans">
                            {step.desc}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Drag & Drop Document, Syllabus, or Screenshot</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Supports screenshots (PNG/JPEG), PDFs, text guidelines, and calendar files.
              </p>
            </div>
            <button 
              type="button"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-bold uppercase tracking-widest cursor-pointer shadow-md shadow-sky-500/15"
            >
              Select File Manually
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex gap-3 text-red-400 items-start text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong>Processing Failure:</strong> {errorMsg}
          </div>
        </div>
      )}

      {/* Success View */}
      {successData && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-[#0d1117] border border-emerald-500/20 space-y-6"
        >
          <div className="flex gap-3 items-center text-emerald-400 justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-widest uppercase font-mono">Mission Successfully Defended</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              PIPELINE SUCCESS
            </span>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <span className="text-[9px] font-mono text-emerald-500 uppercase block font-bold tracking-wider">AUTOMATIC INTEGRITY VECTOR CREATED</span>
            <h4 className="text-sm font-bold text-white mt-1">{successData.title}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{successData.description}</p>
            <div className="flex gap-6 text-[11px] text-slate-500 font-mono mt-3 pt-3 border-t border-white/5 uppercase tracking-wider font-bold">
              <span>Deadline Days: <strong className="text-slate-300">{successData.deadlineDaysFromNow} days</strong></span>
              <span>Total Estimated Effort: <strong className="text-slate-300">{successData.totalHours} hrs</strong></span>
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider font-bold">Tactical Subtasks Formulated</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Array.isArray(successData?.subtasks) && successData.subtasks.map((sub: any, i: number) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-white/5 border border-white/10 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">PHASE 0{i+1} // {sub.category}</span>
                    <p className="text-xs font-bold text-white mt-0.5 leading-tight">{sub.title}</p>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">Hours: {sub.estimatedHours} hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rescue Indicator if active */}
          {successData?.rescuePlan && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-3 items-start">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-rose-400 uppercase font-bold block tracking-wider">EMERGENCY OVERRIDE DETECTED</span>
                <p className="text-xs text-slate-300 leading-normal">
                  Due to critical urgency levels detected, our <strong>Rescue Commander</strong> automatically deployed an emergency pacing model, postponing secondary subtasks to ensure <strong>{successData.rescuePlan.newSuccessProbability || 90}% success</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="p-4.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 leading-relaxed">
            <strong>Active Shield Synchronization:</strong> This mission blueprint has been synchronized into <strong>Mission Control</strong> and projected across timelines inside your <strong>Space-Time Simulator</strong>.
          </div>
        </motion.div>
      )}
    </div>
  );
}
