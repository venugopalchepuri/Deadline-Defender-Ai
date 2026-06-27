import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Shield, Zap, BrainCircuit, Activity, FileText, BarChart2, 
  Settings, LogOut, Compass, Clock, AlertTriangle, ShieldCheck, Play 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Mission, ActivityLog, Agent, DailyCheckIn, SimulatorTimeline, SubTask, GeminiDecompositionResult } from "./types";
import LandingPage from "./components/LandingPage";
import Logo, { LogoIcon, LogoWithText } from "./components/Logo";
import Dashboard from "./components/Dashboard";
import TasksPage from "./components/TasksPage";
import SimulatorPage from "./components/SimulatorPage";
import RescuePage from "./components/RescuePage";
import UploadPage from "./components/UploadPage";
import AnalyticsPage from "./components/AnalyticsPage";
import SettingsPage from "./components/SettingsPage";

// ----------------------------------------------------------------------
// Initial Pre-populated Demo Data for Hackathon Showcases
// ----------------------------------------------------------------------
const INITIAL_MISSIONS: Mission[] = [
  {
    id: "mission-1",
    title: "Deadline Defender AI Hackathon Submission",
    description: "Submit a fully responsive React & Express full-stack application built with Intelligent Mission Engine and Firestore secure architectures.",
    category: "Hackathon",
    priority: "Urgent",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 70).toISOString(), // 70 hours from now
    estimatedHours: 18,
    progress: 35,
    status: "In Progress",
    subtasks: [
      { id: "s1-1", title: "Complete high-contrast responsive CSS layout", completed: true, estimatedHours: 4, category: "UI/UX" },
      { id: "s1-2", title: "Connect server-side risk analytics predictive endpoints", completed: false, estimatedHours: 6, category: "Backend" },
      { id: "s1-3", title: "Record 2-minute workflow video showcasing AI Negotiator", completed: false, estimatedHours: 5, category: "Presentation" },
      { id: "s1-4", title: "Finalize README, credits, and deploy to Cloud Run", completed: false, estimatedHours: 3, category: "Deployment" },
    ],
    risk: {
      successProbability: 40,
      failureProbability: 60,
      riskScore: 60,
      urgencyLevel: "Critical",
      confidenceLevel: "High",
      reasons: [
        "Time window constraints: less than 3 days remaining.",
        "Overload overlap with Deep Learning paper deliverables.",
        "Crucial video showcase requires physical rehearsal space."
      ],
      mitigatingFactors: [
        "First subtask is completed and UI structure is solid.",
        "Remaining subtasks are clearly scoped and estimated."
      ],
      riskContributors: [
        { factor: "Remaining Time", impact: "High", description: "Less than 72 hours until final deadline." },
        { factor: "Estimated Workload", impact: "High", description: "14 hours of work left to complete." },
        { factor: "Mission Complexity", impact: "Medium", description: "Requires video editing and live validation." },
        { factor: "Current Progress", impact: "Medium", description: "35% of overall roadmap milestones hit." },
        { factor: "Time Buffer", impact: "High", description: "Minimal buffer for error; any delay forces failure." },
        { factor: "Number of Remaining Subtasks", impact: "Medium", description: "3 subtasks remain in the queue." }
      ],
      explanation: "Threat state: WARNING. Time buffer is tight. We recommend initiating Rescue Commander protocols to prune advanced visual items and lock in core functions.",
      overallAssessment: "While the mission is under significant schedule compression, it is achievable if all distracting scope is immediately cut and active focus is funneled purely into completing the video submission."
    }
  },
  {
    id: "mission-2",
    title: "Deep Learning Research Paper",
    description: "Write and format an 8-page paper on Convolutional Neural Networks and sequence-to-sequence model optimizations.",
    category: "Academic",
    priority: "High",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 168).toISOString(), // 7 days from now
    estimatedHours: 24,
    progress: 20,
    status: "In Progress",
    subtasks: [
      { id: "s2-1", title: "Gather academic literature on sequence-to-sequence models", completed: true, estimatedHours: 4, category: "Research" },
      { id: "s2-2", title: "Run tensorboard logs on test training loops", completed: false, estimatedHours: 8, category: "Coding" },
      { id: "s2-3", title: "Draft introduction and architecture diagram paragraphs", completed: false, estimatedHours: 8, category: "Writing" },
      { id: "s2-4", title: "Verify citation indexes and format latex template", completed: false, estimatedHours: 4, category: "Review" },
    ],
    risk: {
      successProbability: 65,
      failureProbability: 35,
      riskScore: 35,
      urgencyLevel: "Warning",
      confidenceLevel: "High",
      reasons: [
        "Total backlog of 20 effort hours remains.",
        "Vague requirements around training metrics might require extra tests."
      ],
      mitigatingFactors: [
        "Runway of 7 full days provides decent planning elasticity.",
        "Initial literature review is fully compiled."
      ],
      riskContributors: [
        { factor: "Remaining Time", impact: "Medium", description: "7 days remaining until submission." },
        { factor: "Estimated Workload", impact: "High", description: "20 estimated focus hours needed." },
        { factor: "Mission Complexity", impact: "High", description: "Requires complex sequence optimizations." },
        { factor: "Current Progress", impact: "Low", description: "20% progress leaves heavy bulk for later." },
        { factor: "Time Buffer", impact: "Medium", description: "Moderate temporal buffer exists." },
        { factor: "Number of Remaining Subtasks", impact: "Medium", description: "3 remaining academic subtasks." }
      ],
      explanation: "Condition: SAFE. Standard pacing is sufficient. Strategist suggests isolating 3 hours tomorrow to finalize training logs.",
      overallAssessment: "The research paper is on track for successful delivery, provided a consistent daily allocation of 3 hours is secured to complete the core writing."
    }
  },
  {
    id: "mission-3",
    title: "Systems Programming Midterm Exam",
    description: "Prepare for exam covering POSIX threads, memory boundaries, virtual mappings, and caching strategies.",
    category: "Academic",
    priority: "Medium",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 288).toISOString(), // 12 days from now
    estimatedHours: 12,
    progress: 0,
    status: "Pending",
    subtasks: [
      { id: "s3-1", title: "Review virtual layout cache mapping slides", completed: false, estimatedHours: 3, category: "Review" },
      { id: "s3-2", title: "Complete thread-pool synchronization assignment", completed: false, estimatedHours: 5, category: "Coding" },
      { id: "s3-3", title: "Take 2025 mock paper and log errors", completed: false, estimatedHours: 4, category: "Testing" },
    ],
    risk: {
      successProbability: 85,
      failureProbability: 15,
      riskScore: 15,
      urgencyLevel: "Safe",
      confidenceLevel: "High",
      reasons: [
        "Sufficient chronological margin: 12 days buffer.",
        "Small estimated requirement allows incremental study pacing."
      ],
      mitigatingFactors: [
        "Generous timeline of 12 days removes acute scheduling pressure.",
        "Extremely focused study topics are fully itemized."
      ],
      riskContributors: [
        { factor: "Remaining Time", impact: "Low", description: "12 days remaining to midterm date." },
        { factor: "Estimated Workload", impact: "Low", description: "Only 12 hours of total study estimated." },
        { factor: "Mission Complexity", impact: "Medium", description: "Covers complex POSIX thread behaviors." },
        { factor: "Current Progress", impact: "Low", description: "Not yet started, but backlog is small." },
        { factor: "Time Buffer", impact: "Low", description: "Excellent buffer ensures comfortable runway." },
        { factor: "Number of Remaining Subtasks", impact: "Low", description: "3 brief study subtasks left." }
      ],
      explanation: "Condition: OPTIMAL. Pacing index is perfect. Maintain existing academic reserves.",
      overallAssessment: "This midterm preparation has a high probability of success. Following a standard study schedule over the next two weeks will guarantee ready preparedness."
    }
  },
  {
    id: "mission-4",
    title: "Google Summer AI Internship",
    description: "Complete formal portal registration, resume tuning, and custom reference submissions.",
    category: "Work",
    priority: "High",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 528).toISOString(), // 22 days from now
    estimatedHours: 8,
    progress: 50,
    status: "In Progress",
    subtasks: [
      { id: "s4-1", title: "Tune resume parameters to highlight full-stack features", completed: true, estimatedHours: 3, category: "Preparation" },
      { id: "s4-2", title: "Draft targeted cover letter emphasizing Google Cloud experience", completed: true, estimatedHours: 1, category: "Writing" },
      { id: "s4-3", title: "Submit application via careers portal and log rows", completed: false, estimatedHours: 2, category: "Submission" },
      { id: "s4-4", title: "Engage in technical mock interviews with peers", completed: false, estimatedHours: 2, category: "Preparation" },
    ],
    risk: {
      successProbability: 92,
      failureProbability: 8,
      riskScore: 8,
      urgencyLevel: "Safe",
      confidenceLevel: "High",
      reasons: [
        "Significant buffer zone of 22 days remaining.",
        "Essential assets (resume & cover letter) are already complete."
      ],
      mitigatingFactors: [
        "50% of roadmap is already cleared and locked in.",
        "Ample temporal runway of 22 days minimizes all risk."
      ],
      riskContributors: [
        { factor: "Remaining Time", impact: "Low", description: "22 days remaining on submission portal." },
        { factor: "Estimated Workload", impact: "Low", description: "Only 4 hours of remaining focus needed." },
        { factor: "Mission Complexity", impact: "Low", description: "Standard application submission process." },
        { factor: "Current Progress", impact: "High", description: "50% completed including critical resume tunes." },
        { factor: "Time Buffer", impact: "Low", description: "Maximum buffer provides complete cushion." },
        { factor: "Number of Remaining Subtasks", impact: "Low", description: "2 final steps left." }
      ],
      explanation: "Condition: SECURE. Excellent defensive planning has cleared the major milestones early. Only final registration remains.",
      overallAssessment: "An absolute lock for submission. Minor action items are all that remain, and can be completed at any point over the next 3 weeks."
    }
  }
];

const INITIAL_AGENTS: Agent[] = [
  { id: "a1", name: "Strategist Brain", role: "STRATEGIST", description: "Decomposes missions into tactical checkpoints.", avatar: "🧠", status: "Idle" },
  { id: "a2", name: "Risk Forecast-9", role: "RISK ANALYST", description: "Predicts timeline breakdowns and overlaps.", avatar: "🔮", status: "Idle" },
  { id: "a3", name: "Accountability Core", role: "ACCOUNTABILITY AGENT", description: "Performs historical auditing and debriefs.", avatar: "🛡️", status: "Idle" },
  { id: "a4", name: "Rescue Triage-1", role: "RESCUE COMMANDER", description: "Enforces scope cuts during critical bottlenecks.", avatar: "⚡", status: "Idle" }
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: "l1", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), agentRole: "STRATEGIST", agentName: "Strategist Brain", message: "Decomposed 'Google Summer AI Internship' into 4 milestones successfully.", type: "success" },
  { id: "l2", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), agentRole: "RISK ANALYST", agentName: "Risk Forecast-9", message: "Calculated risk for 'Deadline Defender Hackathon Submission'. Urgency level flag set to CRITICAL.", type: "danger" },
  { id: "l3", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), agentRole: "ACCOUNTABILITY AGENT", agentName: "Accountability Core", message: "Scanned historical profiles. Underestimating task duration detected as active risk factor.", type: "warning" },
];

export default function App() {
  const [isLaunched, setIsLaunched] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const startAppBootSequence = useCallback(() => {
    setIsAppLoading(true);
    setLoadingStep(0);
    
    setTimeout(() => {
      setLoadingStep(1);
    }, 800);
    
    setTimeout(() => {
      setLoadingStep(2);
    }, 1600);
    
    setTimeout(() => {
      setLoadingStep(3);
    }, 2400);

    setTimeout(() => {
      setLoadingStep(4);
    }, 3200);
    
    setTimeout(() => {
      setIsLaunched(true);
      setIsAppLoading(false);
    }, 4000);
  }, []);

  // States
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem("dd_missions");
      return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    } catch (e) {
      console.error("Error parsing dd_missions from localStorage", e);
      return INITIAL_MISSIONS;
    }
  });

  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem("dd_logs");
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch (e) {
      console.error("Error parsing dd_logs from localStorage", e);
      return INITIAL_LOGS;
    }
  });

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() => {
    try {
      const saved = localStorage.getItem("dd_checkins");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing dd_checkins from localStorage", e);
      return [];
    }
  });

  // Active Simulation State
  const [activeSimulation, setActiveSimulation] = useState<SimulatorTimeline | null>(null);

  // Gemini Decomposition results (status and logs)
  const [decompositionResults, setDecompositionResults] = useState<Record<string, GeminiDecompositionResult>>({});

  // Loading indicator states
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [decompositionError, setDecompositionError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRescuing, setIsRescuing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<'idle' | 'extracting' | 'decomposing' | 'analyzing_risk' | 'simulating' | 'rescuing' | 'completed'>('idle');

  const missionsRef = useRef<Mission[]>(missions);
  useEffect(() => {
    missionsRef.current = missions;
  }, [missions]);

  // Persist States to Local Storage
  useEffect(() => {
    localStorage.setItem("dd_missions", JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem("dd_logs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem("dd_checkins", JSON.stringify(checkIns));
  }, [checkIns]);

  // Log append helper
  const addLog = useCallback((role: string, name: string, message: string, type: ActivityLog["type"] = "info") => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      agentRole: role,
      agentName: name,
      message,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  }, []);

  // Update Agent Status
  const setAgentStatus = useCallback((role: Agent["role"], status: Agent["status"]) => {
    setAgents((prev) =>
      prev.map((a) => (a.role === role ? { ...a, status } : a))
    );
  }, []);

  // ----------------------------------------------------------------------
  // Core AI Actions (Triggering server-side Express Gemini API endpoints)
  // ----------------------------------------------------------------------

  // 1. Recalculate Risk Engine
  const calculateRisk = useCallback(async (missionId: string, customSubtasks?: SubTask[], customHours?: number) => {
    const mission = missionsRef.current.find(m => m.id === missionId);
    if (!mission) return;

    const subtasks = customSubtasks || mission.subtasks || [];
    const hours = customHours !== undefined ? customHours : mission.estimatedHours;

    setAgentStatus("RISK ANALYST", "Analyzing");
    addLog("RISK ANALYST", "Risk Forecast-9", `Initiating quantum forecasting on schedule vectors for "${mission.title}"...`, "info");

    try {
      const res = await fetch("/api/gemini/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: mission.title,
          deadline: mission.deadline,
          subtasks,
          estimatedHours: hours,
        }),
      });
      const riskData = await res.json();

      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, risk: riskData } : m))
      );

      const type = riskData.urgencyLevel === "Critical" ? "danger" : riskData.urgencyLevel === "Warning" ? "warning" : "success";
      addLog("RISK ANALYST", "Risk Forecast-9", `Risk computed for "${mission.title}": Failure Risk is ${riskData.failureProbability}%. Urgency rated: ${riskData.urgencyLevel.toUpperCase()}.`, type);
    } catch (err) {
      console.error(err);
      addLog("RISK ANALYST", "Risk Forecast-9", "Risk evaluation module returned error. Loaded local fallback predictions.", "warning");
    } finally {
      setAgentStatus("RISK ANALYST", "Idle");
    }
  }, [missions, addLog, setAgentStatus]);

  // 2. Decompose Mission (Strategist)
  const decomposeMission = useCallback(async (missionId: string) => {
    setIsDecomposing(true);
    setDecompositionError(null);
    setAgentStatus("STRATEGIST", "Decomposing");

    try {
      const mission = missionsRef.current.find(m => m.id === missionId);
      if (!mission) {
        throw new Error("Operational Room reference not found. Please select a valid mission vector.");
      }

      addLog("STRATEGIST", "Strategist Brain", `Automatically formulating Roadmap milestones for "${mission.title}"...`, "info");

      const res = await fetch("/api/gemini/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: mission.title,
          description: mission.description,
          category: mission.category,
          deadline: mission.deadline,
          priority: mission.priority,
          estimatedHours: mission.estimatedHours,
        }),
      });

      if (!res.ok) {
        throw new Error(`Operational server error: status code ${res.status}`);
      }

      const data = await res.json();
      const rawSubs = Array.isArray(data?.subtasks) ? data.subtasks : [];
      
      // Ensure we validate and filter out null/undefined/invalid tasks on client-side
      const validatedSubs = rawSubs
        .filter((s: any) => s && typeof s === "object" && s.title && s.id)
        .map((s: any) => ({
          id: String(s.id),
          title: String(s.title),
          completed: Boolean(s.completed),
          estimatedHours: Number(s.estimatedHours || s.effortHours || 2),
          category: String(s.category || "General"),
          description: String(s.description || ""),
        }));

      if (validatedSubs.length === 0) {
        throw new Error("No valid subtask checkpoints generated.");
      }

      // Save decomposition results state (logs/model/error/status)
      setDecompositionResults((prev) => ({
        ...prev,
        [missionId]: {
          geminiStatus: data.geminiStatus || (data.fallback ? "failed" : "success"),
          geminiModel: data.geminiModel,
          geminiError: data.geminiError,
          fallback: !!data.fallback,
          debugLogs: data.debugLogs,
        },
      }));

      setMissions((prev) =>
        prev.map((m) => {
          if (m.id === missionId) {
            const totalHours = validatedSubs.reduce((sum: number, s: any) => sum + s.estimatedHours, 0);
            return {
              ...m,
              subtasks: validatedSubs,
              estimatedHours: totalHours,
              progress: 0,
            };
          }
          return m;
        })
      );

      if (data.fallback) {
        setDecompositionError(`AI decomposition failed, using safe fallback plan. Reason: ${data.geminiError || "Unknown breakdown"}`);
        addLog("STRATEGIST", "Strategist Brain", `AI decomposition failed: ${data.geminiError || "Unknown breakdown"}. Used safe fallback plan.`, "warning");
      } else {
        addLog("STRATEGIST", "Strategist Brain", `Roadmap designed for "${mission.title}": Decomposed into ${validatedSubs.length} tactical checkpoints.`, "success");
      }

      // Auto-trigger risk recalculation on the newly populated task
      setTimeout(() => {
        calculateRisk(missionId, validatedSubs, validatedSubs.reduce((sum: number, s: any) => sum + s.estimatedHours, 0));
      }, 500);

    } catch (error: any) {
      console.error("Decomposition failed:", error);
      const errMsg = error.message || "An unexpected decomposition breakdown occurred.";
      setDecompositionError(errMsg);
      addLog("STRATEGIST", "Strategist Brain", `Decomposition breakdown: ${errMsg}`, "danger");

      setDecompositionResults((prev) => ({
        ...prev,
        [missionId]: {
          geminiStatus: "failed",
          geminiError: errMsg,
          fallback: true,
          debugLogs: {
            rawResponse: null,
            httpStatus: "Client/Network Failure",
          },
        },
      }));
    } finally {
      setIsDecomposing(false);
      setAgentStatus("STRATEGIST", "Idle");
    }
  }, [missions, addLog, setAgentStatus, calculateRisk]);

  // 3. Future Simulator (Accountability Agent)
  const triggerSimulation = useCallback(async (missionId: string): Promise<SimulatorTimeline | null> => {
    const mission = missionsRef.current.find(m => m.id === missionId);
    if (!mission) return null;

    setIsSimulating(true);
    setAgentStatus("ACCOUNTABILITY AGENT", "Analyzing");
    addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Simulating alternative space-time future timelines for "${mission.title}"...`, "info");

    try {
      const res = await fetch("/api/gemini/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: mission.title, deadline: mission.deadline }),
      });
      const data = await res.json();
      setActiveSimulation(data);
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Future simulation loaded successfully. Side-by-side comparative models locked in.`, "success");
      return data;
    } catch (err) {
      console.error(err);
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Simulation forecast yielded pipeline errors.", "warning");
      return null;
    } finally {
      setIsSimulating(false);
      setAgentStatus("ACCOUNTABILITY AGENT", "Idle");
    }
  }, [missions, addLog, setAgentStatus]);

  // 4. Rescue Mode Plan (Rescue Commander)
  const triggerRescuePlan = useCallback(async (missionId: string) => {
    const mission = missionsRef.current.find(m => m.id === missionId);
    if (!mission) return;

    setIsRescuing(true);
    setAgentStatus("RESCUE COMMANDER", "Alerting");
    addLog("RESCUE COMMANDER", "Rescue Triage-1", `ACTIVATE RESCUE MODE: Setting emergency triage boundaries for "${mission.title}"...`, "danger");

    try {
      const res = await fetch("/api/gemini/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: mission.title, deadline: mission.deadline, subtasks: mission.subtasks }),
      });
      const rescuePlan = await res.json();

      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? { ...m, rescuePlan: { ...rescuePlan, isRescueActive: true } }
            : m
        )
      );

      addLog("RESCUE COMMANDER", "Rescue Triage-1", `Emergency rescue plan generated: Core focus subtasks isolated. post-poned secondary fluff.`, "success");
    } catch (err) {
      console.error(err);
      addLog("RESCUE COMMANDER", "Rescue Triage-1", "Emergency override compilation failed.", "warning");
    } finally {
      setIsRescuing(false);
      setAgentStatus("RESCUE COMMANDER", "Idle");
    }
  }, [missions, addLog, setAgentStatus]);

  // 5. Document Ingestion Sequential Multi-Agent Pipeline & Demo Mode
  const ingestFile = useCallback(async (fileName: string, fileType: string, fileContent: string, rawText?: string) => {
    setIsUploading(true);
    setPipelineStage('extracting');
    addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Uploading deliverable file: "${fileName}" for AI ingestion...`, "info");

    try {
      const res = await fetch("/api/gemini/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType, fileContent, rawText }),
      });
      const data = await res.json();

      // Create a brand new mission based on extracted parameters
      const newMissionId = `mission-${Date.now()}`;
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (data.deadlineDaysFromNow || 4));

      const newMission: Mission = {
        id: newMissionId,
        title: data.title,
        description: data.description,
        category: fileName.toLowerCase().includes("intern") ? "Work" : "Hackathon",
        priority: "High",
        deadline: deadlineDate.toISOString(),
        estimatedHours: data.totalHours || 12,
        progress: 0,
        status: "Pending",
        subtasks: Array.isArray(data?.subtasks) ? data.subtasks.map((sub: any, idx: number) => ({
          id: `subtask-${newMissionId}-${idx}`,
          title: sub.title || "Subtask",
          completed: false,
          estimatedHours: sub.estimatedHours || 3,
          category: sub.category || "Extracted Checkpoint",
          description: sub.description || "",
        })) : [],
      };

      setMissions((prev) => [newMission, ...prev]);
      setSelectedMissionId(newMissionId);
      addLog("STRATEGIST", "Strategist Brain", `New mission created from document: "${data.title}" successfully integrated.`, "success");

      // 2. Automatically trigger Strategist Decomposition
      setPipelineStage('decomposing');
      addLog("STRATEGIST", "Strategist Brain", `Automatically formulating Roadmap milestones for "${data.title}"...`, "info");
      
      const decompRes = await fetch("/api/gemini/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMission.title,
          description: newMission.description,
          category: newMission.category,
          deadline: newMission.deadline,
          priority: newMission.priority,
          estimatedHours: newMission.estimatedHours,
        }),
      });
      
      let validatedSubs = newMission.subtasks;
      let finalEstHours = newMission.estimatedHours;
      if (decompRes.ok) {
        const decompData = await decompRes.json();
        const rawSubs = Array.isArray(decompData?.subtasks) ? decompData.subtasks : [];
        if (rawSubs.length > 0) {
          validatedSubs = rawSubs.map((s: any) => ({
            id: String(s.id || `subtask-${newMissionId}-${Math.random()}`),
            title: String(s.title),
            completed: Boolean(s.completed),
            estimatedHours: Number(s.estimatedHours || s.effortHours || 2),
            category: String(s.category || "General"),
            description: String(s.description || ""),
          }));
          finalEstHours = validatedSubs.reduce((sum: number, s: any) => sum + s.estimatedHours, 0);
          
          setDecompositionResults((prev) => ({
            ...prev,
            [newMissionId]: {
              geminiStatus: decompData.geminiStatus || "success",
              geminiModel: decompData.geminiModel,
              geminiError: decompData.geminiError,
              fallback: !!decompData.fallback,
              debugLogs: decompData.debugLogs,
            },
          }));
        }
      }

      const updatedMission = {
        ...newMission,
        subtasks: validatedSubs,
        estimatedHours: finalEstHours,
      };

      setMissions((prev) => prev.map((m) => m.id === newMissionId ? updatedMission : m));
      addLog("STRATEGIST", "Strategist Brain", `Roadmap designed for "${updatedMission.title}": Decomposed into ${validatedSubs.length} tactical checkpoints.`, "success");

      // 3. Automatically trigger Risk Analysis
      setPipelineStage('analyzing_risk');
      addLog("RISK ANALYST", "Risk Forecast-9", `Initiating quantum forecasting on schedule vectors for "${updatedMission.title}"...`, "info");
      
      const riskRes = await fetch("/api/gemini/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedMission.title,
          deadline: updatedMission.deadline,
          subtasks: updatedMission.subtasks,
          estimatedHours: updatedMission.estimatedHours,
        }),
      });
      
      let finalRisk = null;
      if (riskRes.ok) {
        finalRisk = await riskRes.json();
        setMissions((prev) =>
          prev.map((m) => (m.id === newMissionId ? { ...m, risk: finalRisk } : m))
        );
        const type = finalRisk.urgencyLevel === "Critical" ? "danger" : finalRisk.urgencyLevel === "Warning" ? "warning" : "success";
        addLog("RISK ANALYST", "Risk Forecast-9", `Risk computed for "${updatedMission.title}": Failure Risk is ${finalRisk.failureProbability}%. Urgency rated: ${finalRisk.urgencyLevel.toUpperCase()}.`, type);
      }

      // 4. Automatically trigger Future Simulation
      setPipelineStage('simulating');
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Simulating alternative space-time future timelines for "${updatedMission.title}"...`, "info");
      
      const simulateRes = await fetch("/api/gemini/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updatedMission.title, deadline: updatedMission.deadline }),
      });
      if (simulateRes.ok) {
        const simulateData = await simulateRes.json();
        setActiveSimulation(simulateData);
        addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Future simulation loaded successfully. Side-by-side comparative models locked in.`, "success");
      }

      // 5. Automatically trigger Rescue Commander if risk is High or Critical
      const shouldRescue = finalRisk && (finalRisk.urgencyLevel === "Critical" || finalRisk.urgencyLevel === "Warning" || finalRisk.urgencyLevel === "High");
      if (shouldRescue) {
        setPipelineStage('rescuing');
        addLog("RESCUE COMMANDER", "Rescue Triage-1", `ACTIVATE RESCUE MODE: Setting emergency triage boundaries for "${updatedMission.title}"...`, "danger");
        
        const rescueRes = await fetch("/api/gemini/rescue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: updatedMission.title,
            deadline: updatedMission.deadline,
            subtasks: updatedMission.subtasks,
            estimatedHours: updatedMission.estimatedHours,
            risk: finalRisk
          }),
        });
        if (rescueRes.ok) {
          const rescuePlan = await rescueRes.json();
          setMissions((prev) =>
            prev.map((m) =>
              m.id === newMissionId
                ? { ...m, rescuePlan: { ...rescuePlan, isRescueActive: true } }
                : m
            )
          );
          addLog("RESCUE COMMANDER", "Rescue Triage-1", `Emergency rescue plan generated: Core focus subtasks isolated.`, "success");
        }
      }

      setPipelineStage('completed');
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Automated pipeline completed successfully for "${updatedMission.title}".`, "success");
      return data;

    } catch (err) {
      console.error(err);
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Automated ingestion pipeline failed. Loaded templates.", "warning");
      setPipelineStage('completed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [addLog]);

  const launchDemoMode = useCallback(async () => {
    setIsUploading(true);
    setPipelineStage('extracting');
    addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Demo Mode Initiated: Simulating document upload...", "info");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const newMissionId = `mission-demo-${Date.now()}`;
      const deadlineDate = new Date();
      // Set deadline tomorrow (less than 24h away) with 25 estimated hours to trigger WARNING/CRITICAL risk beautifully
      deadlineDate.setDate(deadlineDate.getDate() + 1);
      deadlineDate.setHours(21, 0, 0, 0);

      const demoMission: Mission = {
        id: newMissionId,
        title: "Deadline Defender Hackathon Submission",
        description: "Perform a final production-quality upgrade of Deadline Defender AI. Focus on reliability, AI orchestration, and hackathon-winning polish.",
        category: "Hackathon",
        priority: "High",
        deadline: deadlineDate.toISOString(),
        estimatedHours: 25,
        progress: 0,
        status: "In Progress",
        subtasks: []
      };

      setMissions((prev) => [demoMission, ...prev]);
      setSelectedMissionId(newMissionId);
      addLog("STRATEGIST", "Strategist Brain", "Created Demo Mission: 'Deadline Defender Hackathon Submission'", "success");

      // Step 2: Decompose
      setPipelineStage('decomposing');
      addLog("STRATEGIST", "Strategist Brain", "Formulating hackathon roadmap milestones using AI Strategist...", "info");
      
      const decompRes = await fetch("/api/gemini/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: demoMission.title,
          description: demoMission.description,
          category: demoMission.category,
          deadline: demoMission.deadline,
          priority: demoMission.priority,
          estimatedHours: demoMission.estimatedHours,
        }),
      });

      let validatedSubs = [
        { id: `subtask-${newMissionId}-0`, title: "Isolate high-impact core features & set fallback boundaries", completed: false, estimatedHours: 4, category: "Core Development", description: "Define minimum viable components" },
        { id: `subtask-${newMissionId}-1`, title: "Review server caching keys to prevent duplicate AI planning runs", completed: false, estimatedHours: 3, category: "Optimization", description: "Maximize pipeline response times" },
        { id: `subtask-${newMissionId}-2`, title: "Rewrite Rescue Commander visual deck using authentic backend schemas", completed: false, estimatedHours: 6, category: "UI Polish", description: "Design time-phased visual modules" },
        { id: `subtask-${newMissionId}-3`, title: "Add sequential AI pipeline steps rendering to upload deck", completed: false, estimatedHours: 4, category: "Feature Enhancement", description: "Display visual progress milestones" },
        { id: `subtask-${newMissionId}-4`, title: "Trigger full compiler test and secure absolute type safety", completed: false, estimatedHours: 5, category: "QA/Testing", description: "Run build sequences to guarantee 100% stability" }
      ];

      if (decompRes.ok) {
        const decompData = await decompRes.json();
        const rawSubs = Array.isArray(decompData?.subtasks) ? decompData.subtasks : [];
        if (rawSubs.length > 0) {
          validatedSubs = rawSubs.map((s: any) => ({
            id: String(s.id || `subtask-${newMissionId}-${Math.random()}`),
            title: String(s.title),
            completed: Boolean(s.completed),
            estimatedHours: Number(s.estimatedHours || s.effortHours || 2),
            category: String(s.category || "General"),
            description: String(s.description || ""),
          }));
        }
      }

      setMissions((prev) =>
        prev.map((m) =>
          m.id === newMissionId
            ? { ...m, subtasks: validatedSubs, estimatedHours: validatedSubs.reduce((sum, s) => sum + s.estimatedHours, 0) }
            : m
        )
      );
      addLog("STRATEGIST", "Strategist Brain", `Roadmap designed for demo mission with ${validatedSubs.length} tactical checkpoints.`, "success");

      // Step 3: Analyze Risk
      setPipelineStage('analyzing_risk');
      addLog("RISK ANALYST", "Risk Forecast-9", "Calculating real-time threat multipliers & contributors...", "info");
      
      const riskRes = await fetch("/api/gemini/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: demoMission.title,
          deadline: demoMission.deadline,
          subtasks: validatedSubs,
          estimatedHours: demoMission.estimatedHours,
        }),
      });

      let finalRisk = null;
      if (riskRes.ok) {
        finalRisk = await riskRes.json();
        setMissions((prev) =>
          prev.map((m) => (m.id === newMissionId ? { ...m, risk: finalRisk } : m))
        );
        addLog("RISK ANALYST", "Risk Forecast-9", `Risk computed: Threat Score is ${finalRisk.riskScore}/100. Status: ${finalRisk.urgencyLevel.toUpperCase()}`, "danger");
      }

      // Step 4: Simulate
      setPipelineStage('simulating');
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Simulating space-time trajectories and stress index curves...", "info");
      
      const simulateRes = await fetch("/api/gemini/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: demoMission.title, deadline: demoMission.deadline }),
      });
      if (simulateRes.ok) {
        const simulateData = await simulateRes.json();
        setActiveSimulation(simulateData);
        addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Future models compared. Interventions active.", "success");
      }

      // Step 5: Rescue
      setPipelineStage('rescuing');
      addLog("RESCUE COMMANDER", "Rescue Triage-1", "Ditching fluff & isolating core MVP deliverables...", "info");
      
      const rescueRes = await fetch("/api/gemini/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: demoMission.title,
          deadline: demoMission.deadline,
          subtasks: validatedSubs,
          estimatedHours: demoMission.estimatedHours,
          risk: finalRisk
        }),
      });
      if (rescueRes.ok) {
        const rescuePlan = await rescueRes.json();
        setMissions((prev) =>
          prev.map((m) =>
            m.id === newMissionId
              ? { ...m, rescuePlan: { ...rescuePlan, isRescueActive: true } }
              : m
          )
        );
        addLog("RESCUE COMMANDER", "Rescue Triage-1", "Crisis recovery plan compiled & finalized.", "success");
      }

      setPipelineStage('completed');
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Demo Mode setup completed flawlessly. All agent nodes active.", "success");

    } catch (err) {
      console.error(err);
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Demo Mode pipeline failed, check console logs.", "warning");
      setPipelineStage('completed');
    } finally {
      setIsUploading(false);
    }
  }, [addLog]);

  // 6. Accountability Coaching debrief
  const triggerCoach = useCallback(async (completed: number, missed: number, tasksText: string): Promise<DailyCheckIn | null> => {
    setIsCoaching(true);
    setAgentStatus("ACCOUNTABILITY AGENT", "Negotiating");
    addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Running Daily Integrity Check-In. Compiling metrics...`, "info");

    try {
      const res = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedCount: completed, missedCount: missed, tasksText }),
      });
      const coachData = await res.json();

      const newCheckIn: DailyCheckIn = {
        date: new Date().toLocaleDateString(),
        plannedCount: completed + missed,
        completedCount: completed,
        missedCount: missed,
        pattern: coachData.pattern,
        coachingFeedback: coachData.coachingFeedback,
      };

      setCheckIns((prev) => [newCheckIn, ...prev]);
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", `Yesterday's coaching completed. Procrastination pattern cataloged.`, "success");
      return newCheckIn;
    } catch (err) {
      console.error(err);
      addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Coaching pipeline feedback error.", "warning");
      return null;
    } finally {
      setIsCoaching(false);
      setAgentStatus("ACCOUNTABILITY AGENT", "Idle");
    }
  }, [addLog, setAgentStatus]);

  // ----------------------------------------------------------------------
  // User Interface Interaction Toggles
  // ----------------------------------------------------------------------
  
  // Toggle subtask completion & recalculate mission progress
  const handleToggleSubtask = useCallback((missionId: string, subtaskId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId) {
          const updatedSubs = (m.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          const completedCount = updatedSubs.filter((s) => s.completed).length;
          const progress = Math.round((completedCount / updatedSubs.length) * 100);
          
          // Estimate hours left based on uncompleted tasks
          const hoursLeft = updatedSubs
            .filter((s) => !s.completed)
            .reduce((sum, s) => sum + s.estimatedHours, 0);

          // Trigger asynchronous risk recalculation with new progress state
          setTimeout(() => {
            calculateRisk(missionId, updatedSubs, hoursLeft);
          }, 300);

          return {
            ...m,
            subtasks: updatedSubs,
            progress,
            estimatedHours: hoursLeft,
            status: progress === 100 ? "Completed" : m.status,
          };
        }
        return m;
      })
    );
    addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Subtask completion state altered. Risk indices recalculated.", "info");
  }, [calculateRisk, addLog]);

  // Update overall mission status
  const handleUpdateStatus = useCallback((missionId: string, status: Mission["status"]) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, status } : m))
    );
    addLog("STRATEGIST", "Strategist Brain", `Mission status updated to: ${status.toUpperCase()}.`, "info");
  }, [addLog]);

  // Delete/Prune Mission
  const handleDeleteMission = useCallback((missionId: string) => {
    const mission = missionsRef.current.find(m => m.id === missionId);
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    if (selectedMissionId === missionId) {
      setSelectedMissionId(null);
    }
    addLog("STRATEGIST", "Strategist Brain", `Mission "${mission?.title || "Unknown"}" abrogated from operations.`, "warning");
  }, [missions, selectedMissionId, addLog]);

  // Create new manual mission
  const handleAddMission = useCallback((missionInput: Omit<Mission, 'id' | 'subtasks' | 'progress' | 'status'>) => {
    const newId = `mission-${Date.now()}`;
    const newMission: Mission = {
      ...missionInput,
      id: newId,
      subtasks: [],
      progress: 0,
      status: "Pending",
    };
    setMissions((prev) => [newMission, ...prev]);
    setSelectedMissionId(newId);
    addLog("STRATEGIST", "Strategist Brain", `New mission vector initialized: "${newMission.title}". Execute decomposition to generate roadmap.`, "success");
    
    // Auto trigger decomposition
    setTimeout(() => {
      decomposeMission(newId);
    }, 600);
  }, [decomposeMission, addLog]);

  // Start Rescue trigger shortcut
  const handleStartRescue = useCallback((missionId: string) => {
    setSelectedMissionId(missionId);
    setActivePage("rescue");
    triggerRescuePlan(missionId);
  }, [triggerRescuePlan]);

  // Reset database values
  const handleResetData = useCallback(() => {
    setMissions(INITIAL_MISSIONS);
    setActivityLogs(INITIAL_LOGS);
    setCheckIns([]);
    setSelectedMissionId(null);
    setActiveSimulation(null);
    addLog("ACCOUNTABILITY AGENT", "Accountability Core", "Mock demo database initialized to master parameters.", "success");
  }, [addLog]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex font-sans selection:bg-sky-500/30">
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          <motion.div
            key="bootloader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0F19] text-center p-6"
          >
            <div className="max-w-md w-full space-y-8">
              {/* Pulsing Glowing Logo */}
              <div className="relative inline-block mb-2">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full filter blur-[30px] animate-pulse"></div>
                <LogoIcon size="xl" animated={true} glow={true} className="mx-auto" />
              </div>

              {/* Startup Text and steps */}
              <div className="space-y-3">
                <h2 className="text-white font-extrabold text-[11px] tracking-widest uppercase font-mono text-slate-500">
                  BOOT SEQUENCE INITIATED
                </h2>
                
                {/* Active boot stage message */}
                <div className="h-6 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs font-mono font-bold text-sky-400"
                    >
                      {loadingStep === 0 && "Initializing Deadline Defender AI..."}
                      {loadingStep === 1 && "Loading Mission Intelligence..."}
                      {loadingStep === 2 && "Activating Strategist Agent..."}
                      {loadingStep === 3 && "Preparing Predictive Engine..."}
                      {loadingStep === 4 && "Mission Control Online."}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Minimalistic Premium Loader Bar */}
              <div className="w-48 h-[3px] bg-white/5 rounded-full mx-auto overflow-hidden relative">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-600 rounded-full"
                />
              </div>

              {/* Sub-status lines */}
              <div className="text-[10px] text-slate-600 font-mono space-y-1 select-none pointer-events-none uppercase tracking-widest pt-4">
                <div className="flex justify-between max-w-xs mx-auto">
                  <span>SECURE LAYER: CHRONOS-4</span>
                  <span className="text-sky-500/60 font-bold">READY</span>
                </div>
                <div className="flex justify-between max-w-xs mx-auto">
                  <span>SWARM PROTOCOLS</span>
                  <span className="text-violet-500/60 font-bold">ARMED</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : !isLaunched ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <LandingPage onStart={startAppBootSequence} />
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full flex"
          >
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-md hidden md:flex flex-col justify-between sticky top-0 h-screen shrink-0 z-40">
              <div className="p-6 space-y-8">
                {/* Brand Header */}
                <LogoWithText size="xs" animated={true} />
 
                {/* Nav Links */}
                <nav className="space-y-1.5">
                  {[
                    { id: "dashboard", label: "Mission Control", icon: Compass },
                    { id: "tasks", label: "Operations Room", icon: FileText },
                    { id: "simulator", label: "Show My Future", icon: Play },
                    { id: "rescue", label: "Rescue Deck", icon: AlertTriangle, isAlert: missions.some(m => m.risk?.urgencyLevel === 'Critical') },
                    { id: "upload", label: "Document Ingestion", icon: ShieldCheck },
                    { id: "analytics", label: "Integrity Analytics", icon: BarChart2 },
                    { id: "settings", label: "System Console", icon: Settings },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        if (item.id === "tasks" && missions.length > 0 && !selectedMissionId) {
                          setSelectedMissionId(missions[0].id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition uppercase cursor-pointer ${
                        activePage === item.id 
                          ? "bg-sky-500/10 border border-sky-500/20 text-sky-400" 
                          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${activePage === item.id ? "text-sky-400" : "text-slate-500 group-hover:text-white"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.isAlert && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
 
              {/* Sidebar Footer */}
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 bg-slate-900/60 p-3 border border-white/5 hover:border-sky-500/20 transition-colors rounded-xl">
                  {/* Glowing custom avatar using startup logo colors */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-xs text-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.15)] font-mono shrink-0 animate-pulse">
                    JP
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block tracking-wider">AUTHORIZED OPERATOR</span>
                    <span className="text-xs font-bold text-slate-200 block truncate">Judge Portfolio</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLaunched(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-500 hover:text-red-400 transition cursor-pointer font-mono text-[10px] uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" /> Exit Terminal
                </button>
                <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-[9px] font-mono text-slate-500 tracking-wider uppercase select-none pointer-events-none">
                  <LogoIcon size="xs" glow={false} className="opacity-40" />
                  <span>AI Chief of Staff</span>
                </div>
              </div>
            </aside>
 
            {/* Mobile Nav Header */}
            <div className="flex-1 flex flex-col min-w-0">
              <header className="md:hidden border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                  <LogoIcon size="xs" animated={true} glow={true} />
                  <span className="font-bold text-sm uppercase text-white tracking-tight">Defender AI</span>
                </div>
                <div className="flex gap-4">
                  <select 
                    value={activePage} 
                    onChange={(e) => setActivePage(e.target.value)}
                    className="bg-[#02040a] border border-white/10 rounded px-2 py-1 text-xs text-slate-300 outline-none uppercase font-mono"
                  >
                    <option value="dashboard">Mission Control</option>
                    <option value="tasks">Operations</option>
                    <option value="simulator">Future Simulator</option>
                    <option value="rescue">Rescue Deck</option>
                    <option value="upload">Ingestion</option>
                    <option value="analytics">Analytics</option>
                    <option value="settings">System Console</option>
                  </select>
                </div>
              </header>
 
              {/* Main Workspace Frame */}
              <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Dynamic Header Titles */}
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-sky-400/70 font-semibold font-mono block">OPERATING SYSTEM // SECURE HUB</span>
                      <h2 className="text-xl font-bold text-white tracking-wider uppercase mt-1">
                        {activePage === "dashboard" && "Mission Control Center"}
                        {activePage === "tasks" && "Tactical Operations Chamber"}
                        {activePage === "simulator" && "Space-Time Simulator"}
                        {activePage === "rescue" && "Emergency Rescue Deck"}
                        {activePage === "upload" && "Reconnaissance Ingestion bay"}
                        {activePage === "analytics" && "Productivity Integrity logs"}
                        {activePage === "settings" && "Cloud Systems Config"}
                      </h2>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-tighter">
                      <span>Server Status: <strong className="text-emerald-400 font-bold">ONLINE</strong></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>

                  {/* Render Active Pages */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {activePage === "dashboard" && (
                        <Dashboard
                          missions={missions}
                          agents={agents}
                          activityLogs={activityLogs}
                          onNavigate={setActivePage}
                          onSelectMission={(id) => {
                            setSelectedMissionId(id);
                            setActivePage("tasks");
                          }}
                          onCompleteTask={handleToggleSubtask}
                          onStartRescue={handleStartRescue}
                        />
                      )}

                      {activePage === "tasks" && (
                        <TasksPage
                          missions={missions}
                          selectedMissionId={selectedMissionId}
                          onSelectMission={setSelectedMissionId}
                          onAddMission={handleAddMission}
                          onDecomposeMission={decomposeMission}
                          onDeleteMission={handleDeleteMission}
                          onToggleSubtask={handleToggleSubtask}
                          onUpdateStatus={handleUpdateStatus}
                          isDecomposing={isDecomposing}
                          decompositionError={decompositionError}
                          onClearDecompositionError={() => setDecompositionError(null)}
                          decompositionResults={decompositionResults}
                        />
                      )}

                      {activePage === "simulator" && (
                        <SimulatorPage
                          missions={missions}
                          onTriggerSimulation={triggerSimulation}
                          activeSimulation={activeSimulation}
                          isLoading={isSimulating}
                        />
                      )}

                      {activePage === "rescue" && (
                        <RescuePage
                          missions={missions}
                          onTriggerRescue={triggerRescuePlan}
                          activeRescueMissionId={selectedMissionId}
                          isLoading={isRescuing}
                        />
                      )}

                      {activePage === "upload" && (
                        <UploadPage
                          onIngestFile={ingestFile}
                          isLoading={isUploading}
                          pipelineStage={pipelineStage}
                          onRunDemoMode={launchDemoMode}
                        />
                      )}

                      {activePage === "analytics" && (
                        <AnalyticsPage
                          checkIns={checkIns}
                          onTriggerCoach={triggerCoach}
                          isLoadingCoach={isCoaching}
                        />
                      )}

                      {activePage === "settings" && (
                        <SettingsPage
                          onResetData={handleResetData}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Elegant Startup Workspace Footer */}
                  <footer className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono select-none">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 tracking-wider">DEADLINE DEFENDER AI</span>
                      <span className="text-slate-700">|</span>
                      <span>AI CHIEF OF STAFF</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center sm:text-right">
                      <span>DESIGNED & DEVELOPED BY <strong className="text-slate-300 font-semibold">VENUGOPAL CHEPURI</strong></span>
                      <span className="text-slate-700 hidden sm:inline">•</span>
                      <a href="mailto:chepurivenugopal1@gmail.com" className="text-slate-400 hover:text-sky-400 transition underline decoration-white/10">EMAIL</a>
                      <span className="text-slate-700">•</span>
                      <a href="https://www.linkedin.com/in/venugopal-chepuri-b4899a223" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition underline decoration-sky-400/20">LINKEDIN</a>
                    </div>
                  </footer>
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
