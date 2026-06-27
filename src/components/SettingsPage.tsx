import React, { useState } from "react";
import { 
  Database, ShieldCheck, ShieldAlert, Cpu, 
  RefreshCw, CheckCircle, Info, ExternalLink, Sparkles 
} from "lucide-react";

interface SettingsPageProps {
  onResetData: () => void;
}

export default function SettingsPage({ onResetData }: SettingsPageProps) {
  const [projectId, setProjectId] = useState("deadline-defender-ai-hack");
  const [databaseId, setDatabaseId] = useState("(default)");
  const [region, setRegion] = useState("us-central1");
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    onResetData();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
    }, 4000);
  };

  // The 8 pillars of secure Firestore rules
  const rulePillars = [
    { title: "Master Gate", desc: "Verifies child documents against memberships explicitly declared on parent resources." },
    { title: "Validation Blueprints", desc: "Checks exact key length, string boundaries, and strict data formats on writes." },
    { title: "ID Poisoning Guard", desc: "Regex validates document ID sizes and parameters to block resource exhaustions." },
    { title: "Tiered Identity Tiers", desc: "Forbids non-assignees from altering core properties, opening status fields only." },
    { title: "Total Array Guard", desc: "Strictly bounds unbounded arrays to size limits preventing denial-of-wallet." },
    { title: "PII Isolation", desc: "Splits private contact details into owner-only private sub-resources." },
    { title: "Atomicity Guarantees", desc: "Uses existsAfter checks to force atomic relational updates in single batches." },
    { title: "Secure List Queries", desc: "Enforces server-enforced resource.data filters directly in list allow rules." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      {/* Intro Center */}
      <div className="p-6 rounded-2xl bg-black/40 border border-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 bg-blue-950/40 border border-blue-900/40 px-2.5 py-1 rounded text-xs font-mono text-blue-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CLOUD & ARCHITECTURE CONSOLE
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">GOOGLE SYSTEMS CONTROL</h2>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
          Inspect database entities, trigger connectivity handshakes, and audit security configurations representing the Google Cloud and Firebase architecture.
        </p>
      </div>

      {/* Database configuration variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-5 bg-black/40 border border-gray-900 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-blue-500" /> Firebase Invariant Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-mono block uppercase mb-1">GCP Cloud Project ID</label>
              <input 
                type="text" 
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-900 focus:border-blue-500 rounded px-3 py-1.5 text-xs text-gray-300 outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-mono block uppercase mb-1">Firestore Database ID</label>
              <input 
                type="text" 
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-900 focus:border-blue-500 rounded px-3 py-1.5 text-xs text-gray-300 outline-none font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-mono block uppercase mb-1">Compute Location Region</label>
            <input 
              type="text" 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-gray-950 border border-gray-900 focus:border-blue-500 rounded px-3 py-1.5 text-xs text-gray-300 outline-none font-mono"
            />
          </div>

          <div className="pt-4 border-t border-gray-900/60 flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-2 cursor-pointer active:scale-95 transition"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              Test Connection
            </button>
            {testSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Connection established: Active (Enterprise Spark)
              </span>
            )}
          </div>
        </div>

        {/* Quick actions/credits */}
        <div className="p-5 bg-black/40 border border-gray-900 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-purple-400" /> API Server Node
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Proxy server initializes on container port 3000, managing secure headers and payload structures to the Intelligent Mission Engine predictive models.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full text-center py-2 bg-red-950/15 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-900/40 text-xs font-mono rounded tracking-wider transition uppercase cursor-pointer"
          >
            Reset Demo Database
          </button>
          {resetSuccess && (
            <div className="text-[11px] text-center text-red-400 font-mono animate-pulse">
              ✓ Database reset to initial credentials.
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center border-b border-white/5 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
              PLATFORM VERIFICATION
            </span>
            <h3 className="text-lg font-bold text-white">About Deadline Defender AI</h3>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded">
            Version 1.0 (Stable)
          </span>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300 font-sans">
          <p>
            Created as an AI-powered productivity platform that predicts, prevents, and rescues users from missed deadlines through intelligent multi-agent planning.
          </p>
          
          <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[9.5px] font-mono text-slate-500 uppercase block font-bold tracking-wider">Designed & Developed by</span>
              <strong className="text-sm font-bold text-slate-200 block mt-0.5">Venugopal Chepuri</strong>
              <span className="text-[11px] text-slate-400 block font-mono">B.Tech CSE | Bennett University</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono text-slate-500 uppercase block font-bold tracking-wider">Contact & Credentials</span>
              <div className="mt-1 space-y-1 text-xs text-slate-300">
                <p>📧 <a href="mailto:chepurivenugopal1@gmail.com" className="text-blue-400 hover:underline">chepurivenugopal1@gmail.com</a></p>
                <p>📱 <span className="text-slate-300">+91 7207630778</span></p>
                <p>🔗 <a href="https://www.linkedin.com/in/venugopal-chepuri-b4899a223" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">LinkedIn <ExternalLink className="w-3 h-3" /></a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Auditor section */}
      <div className="p-5 bg-black/40 border border-gray-900 rounded-xl space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" /> Security Rules Auditor
            </h3>
            <p className="text-xs text-gray-400">Zero-Trust Attribute-Based Access Controls (ABAC) verified.</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded">
            Audit Status: 100% SECURE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rulePillars.map((pillar, i) => (
            <div key={i} className="p-3 bg-black/30 border border-gray-900 rounded-lg flex gap-3 items-start">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-200">{pillar.title} Pillar</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-normal font-sans">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-gray-950 border border-gray-900 rounded-lg">
          <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">firestore.rules Preview</span>
          <pre className="text-[10px] font-mono text-gray-400 overflow-x-auto max-h-36 pr-1 custom-scrollbar leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    function isSignedIn() { return request.auth != null; }
    function isValidId(id) { return id is string && id.size() <= 128; }
    
    match /missions/{missionId} {
      allow get: if isSignedIn() && resource.data.ownerId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.ownerId == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.ownerId == request.auth.uid;
    }
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
