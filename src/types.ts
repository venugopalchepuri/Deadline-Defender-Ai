export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedHours: number;
  category: string;
  description?: string;
}

export interface RiskContributor {
  factor: 'Remaining Time' | 'Estimated Workload' | 'Mission Complexity' | 'Current Progress' | 'Time Buffer' | 'Number of Remaining Subtasks';
  impact: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface RiskAnalysis {
  successProbability: number;
  failureProbability: number;
  riskScore: number; // 0 - 100
  urgencyLevel: 'Safe' | 'Warning' | 'Critical';
  confidenceLevel: 'Low' | 'Medium' | 'High';
  reasons: string[]; // Threat factors/reasons why it is risky
  mitigatingFactors: string[]; // Balanced risk-reducing factors (existing progress, buffers, manageable workload, etc)
  riskContributors: RiskContributor[]; // The 6 core contributors scored
  explanation: string; // General executive brief
  overallAssessment: string; // AI project manager concise executive summary
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string; // e.g. 'Hackathon', 'Academic', 'Work', 'Personal'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  deadline: string; // ISO date string
  estimatedHours: number;
  progress: number; // 0 to 100
  status: 'Pending' | 'In Progress' | 'Review' | 'Completed' | 'Failed';
  subtasks: SubTask[];
  risk?: RiskAnalysis;
  rescuePlan?: {
    next60Minutes: string[];
    next3Hours: string[];
    next24Hours: string[];
    postpone: string[];
    protect: string[];
    newSuccessProbability: number;
    explanation: string;
    isRescueActive: boolean;
  };
}

export interface Agent {
  id: string;
  name: string;
  role: 'STRATEGIST' | 'RISK ANALYST' | 'ACCOUNTABILITY AGENT' | 'RESCUE COMMANDER';
  description: string;
  avatar: string;
  status: 'Idle' | 'Analyzing' | 'Decomposing' | 'Alerting' | 'Negotiating';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  agentRole: string;
  agentName: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
}

export interface SimulatorTimeline {
  scenarioA: {
    title: string;
    description: string;
    events: { date: string; title: string; description: string; stress: number; isFailed: boolean }[];
    summary: string;
  };
  scenarioB: {
    title: string;
    description: string;
    events: { date: string; title: string; description: string; stress: number; isFailed: boolean }[];
    summary: string;
  };
  withoutDefender?: {
    successProbability: number;
    failureProbability: number;
    stressLevel: number;
    expectedFinish: string;
    safetyBuffer: string;
  };
  withDefender?: {
    successProbability: number;
    failureProbability: number;
    stressLevel: number;
    expectedFinish: string;
    safetyBuffer: string;
  };
  aiInterventions?: {
    title: string;
    description: string;
    isApplied: boolean;
  }[];
  forecast?: {
    expectedOutcome: string;
    confidenceScore: number;
    executiveSummary: string;
    explanation: string;
  };
}

export interface DailyCheckIn {
  date: string;
  plannedCount: number;
  completedCount: number;
  missedCount: number;
  pattern: string;
  coachingFeedback: string;
}

export interface GcpArchitectureConfig {
  projectId: string;
  firestoreDatabaseId: string;
  region: string;
  isConnected: boolean;
  securityRules: string;
}

export interface GeminiDecompositionResult {
  geminiStatus: 'success' | 'failed';
  geminiModel?: string;
  geminiError?: string | null;
  fallback: boolean;
  debugLogs?: {
    requestPayload?: any;
    rawResponse?: string | null;
    httpStatus?: any;
    jsonParsingError?: any;
    schemaValidationFailure?: any;
    durationMs?: number;
  };
}
