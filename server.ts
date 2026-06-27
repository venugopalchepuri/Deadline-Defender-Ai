import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" })); // Allow large payloads (e.g. base64 files)

const PORT = 3000;

// Lazy initialize GoogleGenAI to prevent startup crash if API key is not set
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing in secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------------------------
// AI API Endpoints
// ----------------------------------------------------------------------

// 1. AI Task Decomposition (The Strategist Agent)
app.post("/api/gemini/decompose", async (req, res) => {
  const { title, description, category, deadline, priority, estimatedHours } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required for decomposition" });
  }

  // Caching check
  const cacheKey = JSON.stringify({ title, description, category, deadline, priority, estimatedHours });
  if (strategistCache.has(cacheKey)) {
    console.log(`[STRATEGIST] Cache HIT for mission: "${title}"`);
    return res.json(strategistCache.get(cacheKey));
  }

  const helperCleanAndParseJSON = (text: string): any => {
    let cleaned = text.trim();
    
    // 1. Try to parse directly
    try {
      return JSON.parse(cleaned);
    } catch (e: any) {
      // 2. Try to extract from markdown code blocks
      const markdownCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = cleaned.match(markdownCodeBlockRegex);
      if (match && match[1]) {
        try {
          return JSON.parse(match[1].trim());
        } catch (innerErr) {
          cleaned = match[1].trim();
        }
      }
      
      // 3. Try finding the first '{' and last '}'
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const extracted = cleaned.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(extracted);
        } catch (innerErr2: any) {
          throw new Error(`Failed to parse extracted JSON block. Original parse error: ${e.message}`);
        }
      }
      throw e;
    }
  };

  const is503Error = (err: any): boolean => {
    if (!err) return false;
    const status = err.status || err.code || err.statusCode;
    if (status === 503) return true;
    const errMsg = String(err.message || "");
    if (errMsg.includes("503") || errMsg.toLowerCase().includes("unavailable") || errMsg.toLowerCase().includes("503 service unavailable")) {
      return true;
    }
    return false;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Tracking variables scoped to the request handler
  let geminiStatus: "success" | "failed" = "failed";
  let geminiModelUsed = "gemini-2.5-flash";
  let geminiError: string | null = null;
  let debugLogs: any = {
    requestPayload: null,
    rawResponse: null,
    httpStatus: null,
    jsonParsingError: null,
    schemaValidationFailure: null
  };

  try {
    const ai = getAIClient();
    const prompt = `Decompose the following mission/task into a highly detailed, extremely domain-specific, and actionable roadmap of 6 to 10 sequential subtasks.

You MUST perform a Two-Stage Reasoning process:

STAGE 1: CLASSIFY THE MISSION DOMAIN
Classify the mission into exactly one of these nine domains:
1. 'Academic / Education' (for courses, midterms, general school studies, classes)
2. 'Software Development' (for coding projects, APIs, building apps, websites)
3. 'Event Management' (for organizing events, hackathons, conferences, weddings)
4. 'Research' (for writing research papers, thesis, surveys, experiments)
5. 'Career Preparation' (for professional certifications like AWS/GCP, job interview practice, placement prep)
6. 'Personal Productivity' (for routines, habits, life chores)
7. 'Business / Startup' (for pitch decks, business launches, marketing plans)
8. 'Legal / Administrative' (for contracts, compliance, tax filings, legal documents)
9. 'Creative / Content' (for writing blogs, creating videos, designing graphics, publishing podcasts)

STAGE 2: IDENTIFY THE SPECIFIC TOPIC & ACT AS A WORLD-CLASS SUBJECT-MATTER EXPERT
Identify the specific subject, certification, technology, field, or objective mentioned in the title/description (e.g., 'DBMS', 'AWS Solutions Architect', 'AI Security', 'React Frontend').
- If a specific subject, technology, certification, or objective is present, you are STRICTLY FORBIDDEN from generating generic, high-level, cookie-cutter templates.
- Instead, you MUST act as a world-class, elite subject-matter expert (e.g., a Database Professor, a Senior AWS Cloud Solutions Architect, a Cybersecurity Researcher, or a Senior Tech Lead).
- Design a custom roadmap matching exactly how an elite practitioner in that specific topic would plan and execute it.
- Customize both the Subtask Titles and their Categories to use deep, topic-specific terminology (e.g., "ER Modeling & Normalization" instead of generic "Concept Revision"; "VPC & IAM Core Networking" instead of generic "Concept Preparation"; "Adversarial Threat Modeling" instead of generic "Literature Review").

EXAMPLES OF EXPERT TAILORING:
- "Prepare for DBMS Midterm" (Domain: 'Academic / Education', Specific Subject: 'DBMS'):
  The subtasks and category names MUST be highly database-specific:
  1. Category: 'ER Modeling & Relational Algebra' (e.g., Design entity-relationship diagrams and study relational operators)
  2. Category: 'Normalization Theory' (e.g., Practice decomposition rules for 1NF, 2NF, 3NF, and BCNF)
  3. Category: 'SQL Query Synthesis' (e.g., Construct complex joins, nested subqueries, and aggregation)
  4. Category: 'Transaction Concurrency & ACID' (e.g., Review schedules, 2PL, locks, and recovery protocols)
  5. Category: 'Previous Exam Papers Analysis' (e.g., Solve past years' midterm exam papers under time constraints)
  6. Category: 'Midterm Mock Test & Review' (e.g., Perform a timed mock midterm and review weak spots)

- "Organize National Quiz Championship 2027" (Domain: 'Event Management', Specific Subject: 'Quiz Championship'):
  1. Category: 'Quiz Format Design' (Define quiz format, rounds, rules, and scoring system)
  2. Category: 'Platform & Venue Setup' (Finalize physical venue or set up the online quiz platform)
  3. Category: 'Sponsorship Outreach' (Create and execute sponsorship outreach plan and pitch decks)
  4. Category: 'Content & Question Review' (Build question bank and coordinate review process)
  5. Category: 'Registration & Promo' (Launch campaign, open registrations, and drive signs-ups)
  6. Category: 'Volunteer briefing' (Recruit and brief volunteer staff and quizmasters)
  7. Category: 'Event Operations' (Conduct the tournament, manage logistics, and award certificates)

- "Build Hackathon Project" (Domain: 'Software Development', Specific Subject: 'Hackathon Project'):
  1. Category: 'Requirements Analysis' (Understand the problem statement and define MVP scope)
  2. Category: 'System Architecture' (Design DB, UI layout and core endpoints)
  3. Category: 'Frontend Core' (Build main interactive components and layouts)
  4. Category: 'Backend & APIs' (Implement server routes, models and controller logic)
  5. Category: 'AI Model Integration' (Integrate Gemini AI features with robust system inputs)
  6. Category: 'Validation Testing' (Verify full user workflows and fix edge-case bugs)
  7. Category: 'Deployment' (Deploy container and prepare live video or slide demo)

- "Publish Research Paper on AI Security" (Domain: 'Research', Specific Subject: 'AI Security'):
  1. Category: 'Threat Modeling' (Read relevant papers on AI attacks and outline system threats)
  2. Category: 'Research Gap' (Identify shortcomings in existing defenses and state hypotheses)
  3. Category: 'Methodology' (Design standard benchmarks and testing metrics)
  4. Category: 'Security Defense' (Implement defense loops and adversarial training code)
  5. Category: 'Robustness Metrics' (Run experiments and generate performance plots)
  6. Category: 'Manuscript Drafting' (Write abstract, introduction, methodology, and format paper)

MISSION TO DECOMPOSE:
- Mission Title: "${title}"
- Mission Description: "${description || "No description provided."}"
- Category: "${category || "General"}"
- Target Deadline: "${deadline || "N/A"}"
- Priority: "${priority || "Medium"}"
- Total Estimated Effort: ${estimatedHours || 20} hours

Ensure that the sum of effortHours matches or is very close to the total effort (${estimatedHours || 20} hours). Return a valid JSON response with the required schema. Ensure status is 'pending' for all subtasks.`;

    // We will track the results of the model attempts here.
    let lastError: any = null;
    geminiStatus = "failed";
    geminiModelUsed = "";
    geminiError = null;
    debugLogs = {
      requestPayload: null,
      rawResponse: null,
      httpStatus: null,
      jsonParsingError: null,
      schemaValidationFailure: null,
      durationMs: 0
    };

    const modelsToTry = ["gemini-2.5-flash", "gemini-3.5-flash"];
    let finalSubtasks: any[] = [];
    let finalDomain = "General";
    let finalExplanation = "";
    let processedSuccessfully = false;

    const generateConfig = {
      systemInstruction: "You are the STRATEGIST, an elite subject-matter expert, project architect, and Chief of Staff. You perform two-stage reasoning to decompose missions: Stage 1: Classify the mission into one of nine broad domains. Stage 2: Identify the specific subject, technology, certification, field, or objective. Based on this, you act as a real-world expert in that precise topic and formulate highly specialized, deep technical/academic/practical subtasks and category names, strictly avoiding generic academic or project-management templates whenever sufficient specific information is present.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          classifiedDomain: {
            type: Type.STRING,
            description: "The classified domain of the mission, chosen from: 'Academic / Education', 'Software Development', 'Event Management', 'Research', 'Career Preparation', 'Personal Productivity', 'Business / Startup', 'Legal / Administrative', 'Creative / Content'."
          },
          explanation: {
            type: Type.STRING,
            description: "A professional, domain-specific explanation of why these specific milestones and subtasks were selected for this mission, referencing its exact description, complexity, and estimated effort."
          },
          subtasks: {
            type: Type.ARRAY,
            description: "List of decomposed subject-specific subtasks.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique identifier for the subtask, e.g., 'subtask-1'." },
                title: { type: Type.STRING, description: "Action-oriented, specific title of the subtask." },
                category: { type: Type.STRING, description: "Highly tailored domain/subject category name (e.g., 'Syllabus Analysis', 'VPC Setup', 'Marketing')." },
                description: { type: Type.STRING, description: "A short, single-sentence concrete description of what needs to be done." },
                effortHours: { type: Type.NUMBER, description: "Estimated effort hours as a number." },
                status: { type: Type.STRING, description: "Must be 'pending'." }
              },
              required: ["id", "title", "category", "description", "effortHours", "status"],
            },
          },
        },
        required: ["classifiedDomain", "explanation", "subtasks"],
      },
    };

    debugLogs.requestPayload = {
      prompt: prompt,
      systemInstruction: generateConfig.systemInstruction,
      responseMimeType: generateConfig.responseMimeType,
      responseSchema: generateConfig.responseSchema
    };

    const startTime = Date.now();

    for (const modelName of modelsToTry) {
      if (processedSuccessfully) break;
      geminiModelUsed = modelName;
      
      let attempts = 0;
      const maxRetries = 2;
      
      while (attempts <= maxRetries) {
        if (processedSuccessfully) break;
        attempts++;
        try {
          console.log(`[STRATEGIST] Routing call to ${modelName}. Attempt ${attempts}/${maxRetries + 1}...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: generateConfig,
          });

          const text = response.text || "{}";
          debugLogs.rawResponse = text;
          debugLogs.httpStatus = 200;

          let parsed: any;
          try {
            parsed = helperCleanAndParseJSON(text);
          } catch (jsonErr: any) {
            debugLogs.jsonParsingError = {
              message: jsonErr.message,
              textSnippet: text.substring(0, 1000)
            };
            throw new Error(`JSON Parsing Error: ${jsonErr.message}`);
          }

          const validationErrors: string[] = [];
          if (!parsed || typeof parsed !== "object") {
            validationErrors.push("Response is not an object.");
          } else {
            if (typeof parsed.classifiedDomain !== "string") {
              validationErrors.push("classifiedDomain must be a string.");
            }
            if (!Array.isArray(parsed.subtasks)) {
              validationErrors.push("subtasks must be an array.");
            } else if (parsed.subtasks.length === 0) {
              validationErrors.push("subtasks array is empty.");
            } else {
              parsed.subtasks.forEach((task: any, idx: number) => {
                if (!task || typeof task !== "object") {
                  validationErrors.push(`subtask at index ${idx} is not an object.`);
                  return;
                }
                if (!task.title || typeof task.title !== "string") {
                  validationErrors.push(`subtask at index ${idx} is missing or has invalid 'title'.`);
                }
                if (!task.category || typeof task.category !== "string") {
                  validationErrors.push(`subtask at index ${idx} is missing or has invalid 'category'.`);
                }
                if (task.effortHours === undefined && task.estimatedHours === undefined) {
                  validationErrors.push(`subtask at index ${idx} is missing 'effortHours' or 'estimatedHours'.`);
                }
              });
            }
          }

          if (validationErrors.length > 0) {
            debugLogs.schemaValidationFailure = {
              errors: validationErrors,
              parsedObject: parsed
            };
            throw new Error(`Schema Validation Error: ${validationErrors.join(" | ")}`);
          }

          const parsedTasks = parsed.subtasks || [];
          finalSubtasks = parsedTasks
            .filter((task: any) => task && typeof task === "object" && task.title)
            .map((task: any, index: number) => ({
              id: task.id || `subtask-${Date.now()}-${index}`,
              title: task.title,
              completed: task.status === "completed" || task.completed === true || false,
              estimatedHours: Number(task.effortHours || task.estimatedHours || 2),
              category: task.category || "General",
              description: task.description || "",
            }));

          finalDomain = parsed.classifiedDomain || "General";
          finalExplanation = parsed.explanation || "";
          geminiStatus = "success";
          processedSuccessfully = true;
          break; // Break the retry loop
        } catch (err: any) {
          lastError = err;
          geminiError = err.message || String(err);
          let statusCode = err.status || err.code || err.statusCode;
          if (!statusCode && err.message) {
            const match = err.message.match(/status\s*code\s*(\d+)/i) || err.message.match(/code\s*(\d+)/i);
            if (match) statusCode = parseInt(match[1]);
          }
          debugLogs.httpStatus = statusCode || debugLogs.httpStatus || "Error";
          
          const is503 = is503Error(err);
          console.warn(`[STRATEGIST] Attempt ${attempts} with ${modelName} failed (status: ${debugLogs.httpStatus}). Is 503 error: ${is503}.`);
          
          if (is503 && attempts <= maxRetries) {
            const delay = attempts === 1 ? 1000 : 2000;
            console.log(`[STRATEGIST] Retrying ${modelName} in ${delay}ms...`);
            await sleep(delay);
          } else {
            // Not a 503 error or we ran out of retries for this model. Move to the next model.
            break;
          }
        }
      }
    }

    debugLogs.durationMs = Date.now() - startTime;

    if (!processedSuccessfully) {
      // If we failed all models, propagate the last error to the outer catch
      throw lastError || new Error("All Gemini models failed to generate valid subtasks.");
    }

    const successResponse = {
      subtasks: finalSubtasks,
      classifiedDomain: finalDomain,
      explanation: finalExplanation,
      geminiStatus: "success",
      geminiModel: geminiModelUsed,
      geminiError: null,
      fallback: false,
      debugLogs: debugLogs
    };
    strategistCache.set(cacheKey, successResponse);
    res.json(successResponse);
  } catch (err: any) {
    console.error("Decomposition failed:", err);
    
    // Dynamic simulated fallback based on actual title keywords & classified domains
    const titleLower = title.toLowerCase();
    const descLower = (description || "").toLowerCase();
    const catLower = (category || "").toLowerCase();
    const combinedText = `${titleLower} ${descLower} ${catLower}`;

    let fallbackSubtasks = [];
    let classifiedDomain = "Personal Productivity";

    if (
      combinedText.includes("midterm") || 
      combinedText.includes("exam") || 
      combinedText.includes("quiz") || 
      combinedText.includes("study") || 
      combinedText.includes("revise") || 
      combinedText.includes("mathematics") || 
      combinedText.includes("math") || 
      combinedText.includes("dbms") || 
      combinedText.includes("learn") || 
      combinedText.includes("course") || 
      combinedText.includes("class") || 
      combinedText.includes("school") ||
      combinedText.includes("academic") ||
      combinedText.includes("university") ||
      combinedText.includes("preparation") ||
      combinedText.includes("homework") ||
      combinedText.includes("assignment") ||
      combinedText.includes("syllabus") ||
      combinedText.includes("textbook") ||
      combinedText.includes("test")
    ) {
      classifiedDomain = "Academic / Education";
      fallbackSubtasks = [
        { id: "fallback-acad-1", title: "Syllabus Analysis", category: "Syllabus Analysis", description: "Analyze exam syllabus, weightage, and define study timeline.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" },
        { id: "fallback-acad-2", title: "Notes Consolidation", category: "Notes Consolidation", description: "Synthesize lecture notes, textbook references, and resources.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-acad-3", title: "Concept Revision", category: "Concept Revision", description: "Review critical formulas, theorems, and core lecture materials.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-acad-4", title: "Topic-wise Study Plan", category: "Topic-wise Study Plan", description: "Implement structured time-blocked review of key subject areas.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-acad-5", title: "Practice Questions", category: "Practice Questions", description: "Work through chapter problems, exercises, and homework assignments.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-acad-6", title: "Previous Year Papers", category: "Previous Year Papers", description: "Solve past exam papers to understand questioning formats and patterns.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" },
        { id: "fallback-acad-7", title: "Mock Tests & Review", category: "Mock Tests", description: "Attempt timed practice assessments under real examination conditions.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" },
        { id: "fallback-acad-8", title: "Weak Area Review", category: "Weak Area Review", description: "Analyze missed questions, review explanations, and clear up doubts.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" }
      ];
    } else if (
      combinedText.includes("build") || 
      combinedText.includes("project") || 
      combinedText.includes("app") || 
      combinedText.includes("software") || 
      combinedText.includes("code") || 
      combinedText.includes("program") || 
      combinedText.includes("website") || 
      combinedText.includes("developer") || 
      combinedText.includes("coding") || 
      combinedText.includes("hackathon") || 
      combinedText.includes("git") || 
      combinedText.includes("github") || 
      combinedText.includes("application") || 
      combinedText.includes("deploy") || 
      combinedText.includes("api")
    ) {
      classifiedDomain = "Software Development";
      fallbackSubtasks = [
        { id: "fallback-dev-1", title: "Understand Problem & MVP Scope", category: "Requirements Analysis", description: "Deconstruct problems, specify scope guidelines, and sketch user flows.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-dev-2", title: "UI Design & Architecture", category: "Architecture Design", description: "Plan database schemas, system modules, and integration endpoints.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-dev-3", title: "Build Core Frontend", category: "Frontend", description: "Develop polished, responsive visual layouts and interactive views.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-dev-4", title: "Implement Backend API & Integration", category: "Backend", description: "Build reliable API logic, storage operations, and server middleware.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-dev-5", title: "Integrate Generative AI Features", category: "AI Integration", description: "Configure generative models and prompts to serve smart application outputs.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-dev-6", title: "Workflows Testing & Validation", category: "Testing", description: "Run manual sanity checks and validation cases for unexpected errors.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" },
        { id: "fallback-dev-7", title: "Host live container and deploy", category: "Deployment", description: "Host the web container online and publish the live address link.", effortHours: Math.max(1, Math.round(estimatedHours * 0.05)), status: "pending" }
      ];
    } else if (
      combinedText.includes("event") || 
      combinedText.includes("organize") || 
      combinedText.includes("wedding") || 
      combinedText.includes("party") || 
      combinedText.includes("conference") || 
      combinedText.includes("meetup") || 
      combinedText.includes("championship") || 
      combinedText.includes("tournament") ||
      combinedText.includes("festival") ||
      combinedText.includes("exhibition") ||
      combinedText.includes("venue") ||
      combinedText.includes("tickets") ||
      combinedText.includes("coordinator")
    ) {
      classifiedDomain = "Event Management";
      fallbackSubtasks = [
        { id: "fallback-evt-1", title: "Define Event Format & Rounds", category: "Planning", description: "Define event theme, dates, scheduling agenda, and budgeting targets.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-evt-2", title: "Finalize Venue & Stream Platforms", category: "Logistics", description: "Secure venue, order materials, and organize online streaming tools.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-evt-3", title: "Create Sponsorship Outreach Plan", category: "Sponsorship", description: "Pitch value proposals to prospective sponsors and outline financial options.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-evt-4", title: "Build Question Bank & Review", category: "Content", description: "Design event contents, question banks, worksheets or guidelines.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-evt-5", title: "Open Registrations & Promo Campaign", category: "Marketing", description: "Promote across socials, create marketing copy, and launch campaign.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-evt-6", title: "Recruit Volunteers & Staff", category: "Logistics", description: "Recruit, align and run briefings for team, volunteers and key staff.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" },
        { id: "fallback-evt-7", title: "Final Event Run & Publish Results", category: "Execution", description: "Run event, manage schedules, and distribute post-event forms and feedback.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" }
      ];
    } else if (
      combinedText.includes("paper") || 
      combinedText.includes("research") || 
      combinedText.includes("thesis") || 
      combinedText.includes("literature") || 
      combinedText.includes("academic paper") ||
      combinedText.includes("survey") ||
      combinedText.includes("hypothesis") ||
      combinedText.includes("analysis") ||
      combinedText.includes("scientific") ||
      combinedText.includes("journal") ||
      combinedText.includes("publish") ||
      combinedText.includes("abstract") ||
      combinedText.includes("methodology")
    ) {
      classifiedDomain = "Research";
      fallbackSubtasks = [
        { id: "fallback-res-1", title: "Literature Review", category: "Literature Review", description: "Gather and read relevant papers, organizing references conceptually.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-res-2", title: "Research Gap Identification", category: "Gap Analysis", description: "Identify shortcomings or unaddressed areas in existing literature.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" },
        { id: "fallback-res-3", title: "Threat Model/Problem Definition", category: "Methodology", description: "Define experimental variables, collection techniques, and validation metrics.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-res-4", title: "Methodology Design", category: "Methodology Design", description: "Create specific schemas and algorithms to run defensive tests.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-res-5", title: "Experimentation & Benchmarking", category: "Experimentation", description: "Run tests, gather observation points, and write raw findings.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-res-6", title: "Results Analysis & Statistics", category: "Results Analysis", description: "Analyze raw data, create visualizations, and perform statistics.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-res-7", title: "Drafting, Editing, Submission", category: "Paper Writing", description: "Draft the abstract, introduction, methodology, and discussion.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" }
      ];
    } else if (
      combinedText.includes("interview") || 
      combinedText.includes("resume") || 
      combinedText.includes("cv") || 
      combinedText.includes("portfolio") || 
      combinedText.includes("job") || 
      combinedText.includes("career") || 
      combinedText.includes("apply") || 
      combinedText.includes("recruitment") ||
      combinedText.includes("placement") ||
      combinedText.includes("certification") ||
      combinedText.includes("aws") ||
      combinedText.includes("azure") ||
      combinedText.includes("gcp") ||
      combinedText.includes("linkedin") ||
      combinedText.includes("profile")
    ) {
      classifiedDomain = "Career Preparation";
      fallbackSubtasks = [
        { id: "fallback-car-1", title: "Blueprint & Exam Syllabus Mapping", category: "Syllabus Mapping", description: "Map out the required exam syllabus or career description requirements.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-car-2", title: "Collect Online Training Modules", category: "Learning Resources", description: "Collect online lectures, cheatsheets, training modules, and books.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-car-3", title: "Core Technical Concepts Study", category: "Concept Preparation", description: "Build a solid mental model of critical technical and behavioral concepts.", effortHours: Math.max(1, Math.round(estimatedHours * 0.25)), status: "pending" },
        { id: "fallback-car-4", title: "Practice Question Banks", category: "Practice Assessments", description: "Complete mock assessments, questionnaires, and situational exercises.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-car-5", title: "Mock Behavioral & Technical Interviews", category: "Mock Interviews", description: "Practice answering job role or credential questions with a peer or assistant.", effortHours: Math.max(1, Math.round(estimatedHours * 0.20)), status: "pending" },
        { id: "fallback-car-6", title: "Portfolio & Resume Alignment", category: "Revision", description: "Perform a final review of core concept summaries and align documents.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" }
      ];
    } else if (
      combinedText.includes("startup") || 
      combinedText.includes("business") || 
      combinedText.includes("pitch") || 
      combinedText.includes("launch") || 
      combinedText.includes("marketing plan") || 
      combinedText.includes("sales") || 
      combinedText.includes("finance") || 
      combinedText.includes("sponsorship") ||
      combinedText.includes("founder") ||
      combinedText.includes("product") ||
      combinedText.includes("monetization") ||
      combinedText.includes("marketing") ||
      combinedText.includes("market size") ||
      combinedText.includes("business plan") ||
      combinedText.includes("client") ||
      combinedText.includes("lead")
    ) {
      classifiedDomain = "Business / Startup";
      fallbackSubtasks = [
        { id: "fallback-bus-1", title: "Market Research & Competitor Analysis", category: "Market Research", description: "Analyze target audience profile, market size, and current competitors.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-bus-2", title: "Elevator Pitch & Value Proposition", category: "Value Proposition", description: "Formulate the core elevator pitch and specify target customer gains.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-bus-3", title: "Financial Plan & Operational Budget", category: "Financial Projections", description: "Estimate pricing strategies, operational budgets, and startup timelines.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-bus-4", title: "MVP Deliverables Definition", category: "MVP Specifications", description: "Define minimal scope deliverables needed to trigger live feedback.", effortHours: Math.max(1, Math.round(estimatedHours * 0.25)), status: "pending" },
        { id: "fallback-bus-5", title: "Visual Slide Pitch Deck Design", category: "Pitch Deck Design", description: "Format visual presentation slides representing market validation.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-bus-6", title: "Launch Promotion & First Users Signup", category: "Launch Coordination", description: "Organize initial soft launch campaign and gather early user signups.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" }
      ];
    } else if (
      combinedText.includes("contract") || 
      combinedText.includes("compliance") || 
      combinedText.includes("tax") || 
      combinedText.includes("legal") || 
      combinedText.includes("law") || 
      combinedText.includes("document") || 
      combinedText.includes("policy") || 
      combinedText.includes("terms") || 
      combinedText.includes("agreement") || 
      combinedText.includes("audit") || 
      combinedText.includes("administrative") || 
      combinedText.includes("invoice") || 
      combinedText.includes("accounting") || 
      combinedText.includes("filing") || 
      combinedText.includes("register") || 
      combinedText.includes("permit")
    ) {
      classifiedDomain = "Legal / Administrative";
      fallbackSubtasks = [
        { id: "fallback-leg-1", title: "Review Document Requirements & Compliance Guidelines", category: "Document Analysis", description: "Review and list necessary guidelines, document structures, and dates.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-leg-2", title: "Consult Legal Templates or Frameworks", category: "Research", description: "Research official frameworks or retrieve compliance legal templates.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-leg-3", title: "Draft Primary Terms and Standard Clauses", category: "Drafting", description: "Perform initial drafting of core definitions, terms, and outlines.", effortHours: Math.max(1, Math.round(estimatedHours * 0.25)), status: "pending" },
        { id: "fallback-leg-4", title: "Formulate Security, Liability, and Risk Clauses", category: "Risk Review", description: "Build and review protection, risk management, and indemnity sections.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-leg-5", title: "Peer Review or Expert Verification", category: "Verification", description: "Coordinate with an expert or perform manual proofreading runs.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-leg-6", title: "Execute Filing, Signature, or Final Submission", category: "Execution", description: "Complete final electronic signing, submission, or storage registry.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" }
      ];
    } else if (
      combinedText.includes("blog") || 
      combinedText.includes("video") || 
      combinedText.includes("design") || 
      combinedText.includes("graphic") || 
      combinedText.includes("publish") || 
      combinedText.includes("podcast") || 
      combinedText.includes("creative") || 
      combinedText.includes("logo") || 
      combinedText.includes("content") || 
      combinedText.includes("art") || 
      combinedText.includes("youtube") || 
      combinedText.includes("tiktok") || 
      combinedText.includes("social media") || 
      combinedText.includes("post") || 
      combinedText.includes("edit") || 
      combinedText.includes("voiceover") || 
      combinedText.includes("script") || 
      combinedText.includes("write")
    ) {
      classifiedDomain = "Creative / Content";
      fallbackSubtasks = [
        { id: "fallback-cre-1", title: "Brainstorming, Concept Design, and Research", category: "Concept Research", description: "Develop and validate creative themes, mood boards, and designs.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-cre-2", title: "Scriptwriting, Storyboarding, or Outline Planning", category: "Scriptwriting", description: "Write structured scripts or step-by-step story outline grids.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-cre-3", title: "Audio/Video Capturing, Recording, or Graphic Designing", category: "Production", description: "Record footage, voiceovers, or design primary visual templates.", effortHours: Math.max(1, Math.round(estimatedHours * 0.3)), status: "pending" },
        { id: "fallback-cre-4", title: "Editing, Polishing, Post-production, or Assembly", category: "Post-production", description: "Edit assets, add effects/transitions, and align music or text layers.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-cre-5", title: "Visual Artwork & Promo Metadata Design", category: "Metadata", description: "Design promotional thumbnails, titles, tags, and descriptive captions.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" },
        { id: "fallback-cre-6", title: "Publish on Target Platform & Track Analytics", category: "Distribution", description: "Upload contents online and check response analytics.", effortHours: Math.max(1, Math.round(estimatedHours * 0.1)), status: "pending" }
      ];
    } else {
      classifiedDomain = "Personal Productivity";
      fallbackSubtasks = [
        { id: "fallback-prd-1", title: "Habit Goal Definition", category: "Goal Definition", description: "Clearly define specific, measurable habit targets and tracking metrics.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-prd-2", title: "Calendar Time-Blocking", category: "Calendar Time-Blocking", description: "Schedule specific daily calendar blocks dedicated only to execution.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-prd-3", title: "Context Triggers & Setup", category: "Routine Triggers", description: "Establish custom context cues and automatic anchors to start the habit.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-prd-4", title: "Environment Preparation", category: "Workspace Decluttering", description: "Remove distractions, organize files/tools, and prepare operational resources.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" },
        { id: "fallback-prd-5", title: "Daily Streak Consistency Tracking", category: "Milestone Consistency", description: "Log daily success metrics to visualize streak consistency.", effortHours: Math.max(1, Math.round(estimatedHours * 0.2)), status: "pending" },
        { id: "fallback-prd-6", title: "Weekly Progress Review & Adjust", category: "Routine Performance Audit", description: "Review progress logs, adjust scheduling bottlenecks, and reward consistency.", effortHours: Math.max(1, Math.round(estimatedHours * 0.15)), status: "pending" }
      ];
    }

    // Ensure sum of fallback hours matches requested estimatedHours exactly
    const currentSum = fallbackSubtasks.reduce((s, item) => s + item.effortHours, 0);
    const diff = (estimatedHours || 20) - currentSum;
    if (diff !== 0 && fallbackSubtasks.length > 0) {
      let maxIdx = 0;
      for (let i = 1; i < fallbackSubtasks.length; i++) {
        if (fallbackSubtasks[i].effortHours > fallbackSubtasks[maxIdx].effortHours) {
          maxIdx = i;
        }
      }
      fallbackSubtasks[maxIdx].effortHours = Math.max(1, fallbackSubtasks[maxIdx].effortHours + diff);
    }

    const fallbackResponse = {
      subtasks: fallbackSubtasks.map((task) => ({
        id: task.id,
        title: task.title,
        completed: false,
        estimatedHours: task.effortHours,
        category: task.category,
        description: task.description,
      })),
      classifiedDomain,
      explanation: `[AI STRATEGIST FALLBACK] Standard operational template compiled for "${title}". This default structure contains necessary milestones for high-quality delivery, scaled to the estimated ${estimatedHours} working hours.`,
      fallback: true,
      message: err.message,
      geminiStatus: "failed",
      geminiModel: geminiModelUsed || "gemini-3.5-flash",
      geminiError: geminiError || err.message,
      debugLogs: debugLogs
    };
    strategistCache.set(cacheKey, fallbackResponse);
    res.json(fallbackResponse);
  }
});

// 2. AI Deadline Risk Engine (The Risk Analyst Agent)
app.post("/api/gemini/risk", async (req, res) => {
  const { title, deadline, subtasks, estimatedHours } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required for risk assessment" });
  }

  // Caching check
  const cacheKey = JSON.stringify({ title, deadline, subtasks, estimatedHours });
  if (riskCache.has(cacheKey)) {
    console.log(`[RISK] Cache HIT for mission: "${title}"`);
    return res.json(riskCache.get(cacheKey));
  }

  try {
    const ai = getAIClient();
    const prompt = `Evaluate the deadline failure risk for this mission with the rigor of an elite enterprise project decision engine:
Mission Title: "${title}"
Deadline: "${deadline}"
Current Time: "${new Date().toISOString()}"
Total Estimated Hours remaining: ${estimatedHours} hrs
Subtasks details: ${JSON.stringify(subtasks || [])}

Calculate:
1. Success Probability (0-100%) and Failure Probability (0-100%). These must sum up to exactly 100%.
2. Confidence Level (Low / Medium / High).
3. Risk Score (0-100, where higher represents higher risk).
   - High Threat Case: If estimated hours remain high (e.g. 25+ hours) and deadline is tomorrow (e.g., <= 1 day), the risk score MUST be Critical (80-95/100).
   - Low Threat Case: If estimated hours are low and the deadline is far away, the risk score MUST score Low (10-30/100).
   - Compute this score dynamically and proportionally.
4. Urgency Level ("Safe" if risk is low, "Warning" if risk is moderate/tight deadline, "Critical" if remaining hours exceed duration or extremely tight).
5. At least 3 logical, structured reasons for risk / failure threats (Threat Factors).
6. Balanced perspective: At least 3 logical mitigating factors that currently reduce the risk (such as existing progress, time buffer, completed subtasks, or manageable workload).
7. Scoring of the following 6 core "Risk Contributors" (each must be rated as Low / Medium / High impact and given a concise, professional supporting explanation):
   - Remaining Time
   - Estimated Workload
   - Mission Complexity
   - Current Progress
   - Time Buffer
   - Number of Remaining Subtasks
8. A short executive explanation brief.
9. Overall Assessment: One concise executive summary explaining whether the mission is realistically achievable and why, written in the tone of an elite AI project manager.`;

    const response = await callGeminiWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the RISK ANALYST, an hyper-advanced enterprise forecasting agent and AI project manager. You analyze schedule overlaps, workload density, and temporal buffer zones to predict failure before it occurs, providing highly professional and objective assessments.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              successProbability: { type: Type.INTEGER, description: "Success probability percentage (0-100)" },
              failureProbability: { type: Type.INTEGER, description: "Failure probability percentage (0-100)" },
              riskScore: { type: Type.INTEGER, description: "Risk score (0-100)" },
              urgencyLevel: { type: Type.STRING, enum: ["Safe", "Warning", "Critical"], description: "Risk Urgency level" },
              confidenceLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "Confidence level of this assessment" },
              reasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Structured threat factors explaining why this mission has risk",
              },
              mitigatingFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Structured factors explaining what is currently reducing risk or supporting success",
              },
              riskContributors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    factor: { type: Type.STRING, enum: ["Remaining Time", "Estimated Workload", "Mission Complexity", "Current Progress", "Time Buffer", "Number of Remaining Subtasks"] },
                    impact: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                    description: { type: Type.STRING, description: "Supporting explanation for the rating" }
                  },
                  required: ["factor", "impact", "description"]
                },
                description: "The 6 core risk indicators being scored"
              },
              explanation: { type: Type.STRING, description: "Executive summary explaining the calculation" },
              overallAssessment: { type: Type.STRING, description: "Concise executive summary explaining whether the mission is realistically achievable and why" }
            },
            required: [
              "successProbability", 
              "failureProbability", 
              "riskScore", 
              "urgencyLevel", 
              "confidenceLevel", 
              "reasons", 
              "mitigatingFactors", 
              "riskContributors", 
              "explanation", 
              "overallAssessment"
            ],
          },
        },
      });
    });

    const risk = JSON.parse(response.text || "{}");
    riskCache.set(cacheKey, risk);
    res.json(risk);
  } catch (err: any) {
    console.error("Risk calculation failed:", err);
    // Dynamic simulated fallback based on actual deadlines and hours
    const daysLeft = Math.max(0.1, ((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const hoursNeeded = estimatedHours || 20;
    const ratio = hoursNeeded / (daysLeft * 8); // Assume 8 hours work per day

    let urgencyLevel: 'Safe' | 'Warning' | 'Critical' = 'Safe';
    let riskScore = 20;
    let confidenceLevel: 'Low' | 'Medium' | 'High' = 'High';

    if (daysLeft <= 1 && hoursNeeded >= 15) {
      urgencyLevel = 'Critical';
      riskScore = Math.min(95, Math.round(80 + (hoursNeeded / 10)));
    } else if (ratio > 1.2) {
      urgencyLevel = 'Critical';
      riskScore = Math.min(98, Math.round(65 + ratio * 15));
    } else if (ratio > 0.6) {
      urgencyLevel = 'Warning';
      riskScore = Math.min(75, Math.round(35 + ratio * 30));
    } else {
      riskScore = Math.max(10, Math.min(30, Math.round(15 + ratio * 10)));
    }

    const failureProbability = riskScore;
    const successProbability = 100 - riskScore;

    const totalSubtasksCount = Array.isArray(subtasks) ? subtasks.length : 0;
    const remainingSubtasksCount = Array.isArray(subtasks) ? subtasks.filter((s: any) => !s.completed).length : 0;
    const progress = totalSubtasksCount > 0 ? Math.round(((totalSubtasksCount - remainingSubtasksCount) / totalSubtasksCount) * 100) : 0;

    const riskContributors = [
      {
        factor: 'Remaining Time' as const,
        impact: daysLeft < 2 ? 'High' as const : daysLeft < 5 ? 'Medium' as const : 'Low' as const,
        description: `${daysLeft.toFixed(1)} days remaining until deadline.`
      },
      {
        factor: 'Estimated Workload' as const,
        impact: hoursNeeded > 20 ? 'High' as const : hoursNeeded > 8 ? 'Medium' as const : 'Low' as const,
        description: `${hoursNeeded} total hours of focus work remaining.`
      },
      {
        factor: 'Mission Complexity' as const,
        impact: totalSubtasksCount > 6 ? 'High' as const : totalSubtasksCount > 3 ? 'Medium' as const : 'Low' as const,
        description: `Composed of ${totalSubtasksCount} discrete structural subtasks.`
      },
      {
        factor: 'Current Progress' as const,
        impact: progress > 70 ? 'Low' as const : progress > 30 ? 'Medium' as const : 'High' as const,
        description: `Current milestone progress stands at ${progress}%.`
      },
      {
        factor: 'Time Buffer' as const,
        impact: ratio > 1.0 ? 'High' as const : ratio > 0.5 ? 'Medium' as const : 'Low' as const,
        description: `Temporal ratio of remaining work to calendar window is ${(ratio * 100).toFixed(0)}%.`
      },
      {
        factor: 'Number of Remaining Subtasks' as const,
        impact: remainingSubtasksCount > 5 ? 'High' as const : remainingSubtasksCount > 2 ? 'Medium' as const : 'Low' as const,
        description: `${remainingSubtasksCount} uncompleted items remain in queue.`
      }
    ];

    const fallbackRisk = {
      successProbability,
      failureProbability,
      riskScore,
      urgencyLevel,
      confidenceLevel,
      reasons: [
        `Time window constraints: ${daysLeft.toFixed(1)} days remaining versus ${hoursNeeded} estimated working hours.`,
        ratio > 1.0 ? "Workload density exceeds standard daily bandwidth allocations." : "Hourly resource demand is within normal boundaries.",
        `Remaining tasks load: ${remainingSubtasksCount} open steps require action.`
      ],
      mitigatingFactors: [
        progress > 0 ? `Secured initial traction with ${progress}% milestones already complete.` : "Pre-flight roadmap is defined and structured.",
        ratio < 0.8 ? "Generous temporal runway reduces high-intensity pressure." : "Strategic mitigation via micro-milestones remains viable.",
        hoursNeeded < 10 ? "Extremely compact scope reduces coordinate overhead." : "Remaining workload is heavily structured."
      ],
      riskContributors,
      explanation: `[FALLBACK STATS] Evaluated at a ratio of ${(ratio * 100).toFixed(0)}% workload density across a ${daysLeft.toFixed(1)}-day horizon.`,
      overallAssessment: `The mission "${title}" has a risk score of ${riskScore}/100. ${
        urgencyLevel === 'Critical' 
          ? "Execution risk is highly concentrated. Standard timelines are compressed; immediate activation of the Rescue Commander and tight focus on high-impact subtasks are required to secure this delivery."
          : urgencyLevel === 'Warning'
          ? "The schedule is tight but thoroughly manageable. Maintaining structured execution and preventing scope creep will ensure successful, on-time completion."
          : "The schedule is safe and highly achievable. With current pacing and moderate daily focus, you are fully positioned to deliver on-schedule without stress."
      }`
    };
    riskCache.set(cacheKey, fallbackRisk);
    res.json(fallbackRisk);
  }
});

// 3. Future Failure Simulator (Show My Future)
app.post("/api/gemini/simulate", async (req, res) => {
  const { title, deadline } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required for simulation" });
  }

  // Caching check
  const cacheKey = JSON.stringify({ title, deadline });
  if (simulateCache.has(cacheKey)) {
    console.log(`[SIMULATE] Cache HIT for mission: "${title}"`);
    return res.json(simulateCache.get(cacheKey));
  }

  try {
    const ai = getAIClient();
    const prompt = `Simulate two futures side-by-side for the mission: "${title}" with deadline: "${deadline}".
Future A represents: "Current Behaviour" (WITHOUT DEADLINE DEFENDER - Procrastination, uncoordinated tasks, ignored warnings, late rushes).
Future B represents: "AI-Optimized Path" (WITH DEADLINE DEFENDER - Immediate strategizing, micro-milestones, Chief of Staff active pacing).

Formulate a detailed predictive simulation containing:
1. Detailed timelines: 4 chronological events for each future timeline showing Date/Relative Time, Event Title, Event Description, Stress level (0-100), and whether it triggered a Failure state. Include scenario summaries.
2. Comparative metrics WITHOUT DEADLINE DEFENDER vs WITH DEADLINE DEFENDER:
   - successProbability (percentage 0-100)
   - failureProbability (percentage 0-100)
   - stressLevel (average stress 0-100)
   - expectedFinish (e.g., "T + 1 day (Late)" vs "T - 12 hours (Early)")
   - safetyBuffer (e.g., "-16 hours (Deficit)" vs "+24 hours (Secure)")
3. AI Interventions applied in Future B: List of 3 core actions applied (e.g., started work earlier, reduced workload, eliminated scope creep, preserved buffer, lowered burnout) with their titles, descriptions, and whether they are applied (isApplied: true).
4. MISSION FORECAST:
   - expectedOutcome: professional high-level forecast statement of delivery.
   - confidenceScore: integer percentage of AI forecasting confidence (0-100%).
   - executiveSummary: a concise executive brief explaining the forecast.
   - explanation: a detailed, data-driven "Explain Why" that references specific mission parameters, time buffers, and why the prediction changes.`;

    const response = await callGeminiWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the ACCOUNTABILITY AGENT and space-time forecasting commander. You simulate different timelines of human developer execution, showing them the direct consequences of procrastination versus structured, AI-assisted work paths with realistic numbers.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenarioA: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  events: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        date: { type: Type.STRING, description: "Relative time (e.g., 'T - 3 days', 'Deadline Eve')" },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        stress: { type: Type.INTEGER },
                        isFailed: { type: Type.BOOLEAN },
                      },
                      required: ["date", "title", "description", "stress", "isFailed"],
                    },
                  },
                },
                required: ["title", "description", "summary", "events"],
              },
              scenarioB: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  events: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        date: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        stress: { type: Type.INTEGER },
                        isFailed: { type: Type.BOOLEAN },
                      },
                      required: ["date", "title", "description", "stress", "isFailed"],
                    },
                  },
                },
                required: ["title", "description", "summary", "events"],
              },
              withoutDefender: {
                type: Type.OBJECT,
                properties: {
                  successProbability: { type: Type.INTEGER },
                  failureProbability: { type: Type.INTEGER },
                  stressLevel: { type: Type.INTEGER },
                  expectedFinish: { type: Type.STRING },
                  safetyBuffer: { type: Type.STRING }
                },
                required: ["successProbability", "failureProbability", "stressLevel", "expectedFinish", "safetyBuffer"]
              },
              withDefender: {
                type: Type.OBJECT,
                properties: {
                  successProbability: { type: Type.INTEGER },
                  failureProbability: { type: Type.INTEGER },
                  stressLevel: { type: Type.INTEGER },
                  expectedFinish: { type: Type.STRING },
                  safetyBuffer: { type: Type.STRING }
                },
                required: ["successProbability", "failureProbability", "stressLevel", "expectedFinish", "safetyBuffer"]
              },
              aiInterventions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    isApplied: { type: Type.BOOLEAN }
                  },
                  required: ["title", "description", "isApplied"]
                }
              },
              forecast: {
                type: Type.OBJECT,
                properties: {
                  expectedOutcome: { type: Type.STRING },
                  confidenceScore: { type: Type.INTEGER },
                  executiveSummary: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["expectedOutcome", "confidenceScore", "executiveSummary", "explanation"]
              }
            },
            required: ["scenarioA", "scenarioB", "withoutDefender", "withDefender", "aiInterventions", "forecast"],
          },
        },
      });
    });

    const parsed = JSON.parse(response.text || "{}");
    simulateCache.set(cacheKey, parsed);
    res.json(parsed);
  } catch (err: any) {
    console.error("Simulation failed:", err);
    
    const fallbackSimulation = {
      scenarioA: {
        title: "Default Behavior (Procrastination)",
        description: "Ignored warnings, late night cramming, and missed parameters.",
        summary: "The project is submitted late with major unresolved errors, causing severe burnout and low grades.",
        events: [
          { date: "T - 3 days", title: "Ignorance & Delay", description: "You push off starting, assuming it will take less time than calculated. Stress: 25%.", stress: 25, isFailed: false },
          { date: "T - 1 day", title: "Sudden Panic", description: "You realize the complexity of the roadmap. You start working late at night. Stress: 75%.", stress: 75, isFailed: false },
          { date: "Deadline Hour", title: "Fatal Code Crash", description: "Vite build fails right before submit. You don't have time to seek assistance. Stress: 99%.", stress: 99, isFailed: true },
          { date: "Post-Deadline", title: "Incomplete Submission", description: "You submit a broken, half-baked build. Grade/Outcome is severely impacted. Stress: 85%.", stress: 85, isFailed: true },
        ],
      },
      scenarioB: {
        title: "AI-Defended Pacing (The Warrior Path)",
        description: "Rigid accountability, micro-milestones met, automated recovery plans active.",
        summary: "Completed 18 hours before the deadline. Polished design, robust code, and total peace of mind.",
        events: [
          { date: "T - 3 days", title: "Tactical Launch", description: "Strategist decomposes tasks. You complete Research & Core Layout. Stress: 15%.", stress: 15, isFailed: false },
          { date: "T - 2 days", title: "Peak Velocity", description: "Risk analyst monitors tasks. You connect Frontend and mock Backend. Stress: 30%.", stress: 30, isFailed: false },
          { date: "T - 1 day", title: "Safety Margin Met", description: "Deployment is completed early. You spend the evening polishing. Stress: 10%.", stress: 10, isFailed: false },
          { date: "Deadline Hour", title: "Victory Lap", description: "You present a fully polished, working build with absolute confidence. Stress: 5%.", stress: 5, isFailed: false },
        ]
      },
      withoutDefender: {
        successProbability: 35,
        failureProbability: 65,
        stressLevel: 72,
        expectedFinish: "T + 6 hours (Late)",
        safetyBuffer: "-6 hours (Deficit)"
      },
      withDefender: {
        successProbability: 95,
        failureProbability: 5,
        stressLevel: 15,
        expectedFinish: "T - 18 hours (Early)",
        safetyBuffer: "+18 hours (Secure)"
      },
      aiInterventions: [
        {
          title: "Early Horizon Activation",
          description: "Subtasks decomposed 72 hours prior to execution windows, preventing a massive last-minute bottleneck.",
          isApplied: true
        },
        {
          title: "Autonomous Risk Gating",
          description: "Calculated pacing signals alert you as soon as the workload exceeds the remaining temporal bandwidth.",
          isApplied: true
        },
        {
          title: "Automatic Rescue Commander",
          description: "Active crisis plan immediately triggers if risk exceeds critical threshold boundaries.",
          isApplied: true
        }
      ],
      forecast: {
        expectedOutcome: "HIGH-PROBABILITY DELIVERY SUCCESS",
        confidenceScore: 92,
        executiveSummary: "Following AI-assisted pacing guarantees completion with a high safety margin, dropping maximum stress levels below 20%.",
        explanation: "Dynamic forecast comparison predicts a 95% success rate under the Defender protocol compared to a 35% probability when executing manually, largely driven by immediate modular distribution of effort."
      },
      fallback: true
    };

    simulateCache.set(cacheKey, fallbackSimulation);
    res.json(fallbackSimulation);
  }
});

// In-memory cache for all AI endpoints to maximize performance and avoid unnecessary regeneration
const strategistCache = new Map<string, any>();
const riskCache = new Map<string, any>();
const simulateCache = new Map<string, any>();
const rescueCache = new Map<string, any>();

// Helper to handle retries for Gemini calls
async function callGeminiWithRetry(fn: () => Promise<any>, retriesLeft = 2): Promise<any> {
  try {
    return await fn();
  } catch (err: any) {
    if (retriesLeft > 0) {
      console.warn(`Gemini call failed. Retrying... (${2 - retriesLeft + 1}/2). Error: ${err.message || err}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return callGeminiWithRetry(fn, retriesLeft - 1);
    }
    throw err;
  }
}

// 4. Rescue Mode Generator (Rescue Commander Agent)
app.post("/api/gemini/rescue", async (req, res) => {
  const { title, deadline, progress, subtasks, estimatedHours, risk } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required for rescue planning" });
  }

  // Caching key
  const cacheKey = JSON.stringify({ title, deadline, progress, subtasks, estimatedHours, risk });
  if (rescueCache.has(cacheKey)) {
    console.log(`[RESCUE] Cache HIT for mission: "${title}"`);
    return res.json(rescueCache.get(cacheKey));
  }

  try {
    const ai = getAIClient();
    const prompt = `ACTIVATE EMERGENCY RESCUE MODE - CRISIS MANAGER REPORT.
The mission "${title}" has entered High or Critical risk of failure.
We need an intense, immediate, and highly-actionable recovery plan to rescue this deadline.

Analyze these parameters:
- Mission Title: "${title}"
- Current Progress: ${progress || 0}%
- Total Estimated Effort: ${estimatedHours || 20} hours
- Deadline: "${deadline}" (current time is ${new Date().toISOString()})
- All Subtasks (Strategist Roadmap): ${JSON.stringify(subtasks || [])}
- Risk Analyst Output: ${JSON.stringify(risk || {})}

Formulate an actionable Crisis Recovery Plan with the following structure:
1. NEXT 60 MINUTES: Exact, high-urgency, laser-focused actions to complete immediately to stop the panic and start building momentum.
2. NEXT 3 HOURS: High-impact tactical tasks to execute.
3. NEXT 24 HOURS: Clear recovery milestones and steps to get back on track.
4. POSTPONE: Non-essential, low-value items, features, or parts of the roadmap that can be cut, delayed, or simplified to guarantee delivery.
5. PROTECT: Critical, high-stakes deliverables that must never be compromised or skipped under any circumstances.
6. EXPECTED OUTCOME (newSuccessProbability): A realistic success probability percentage (0-100%) if the user strictly follows this plan. This must be a substantial increase compared to the original success probability of ${risk?.successProbability || (100 - (risk?.riskScore || 50))}%.
7. EXPLAIN WHY (explanation): An elite AI Crisis Manager explanation. Explain why each recommendation was chosen, specifically referencing actual subtasks, progress stats, and timeline details. Do not use generic templates.`;

    const response = await callGeminiWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the RESCUE COMMANDER, an emergency task-triage elite Chief of Staff and crisis manager. Your job is to make tough executive cuts, focus bandwidth exclusively on core MVP parameters, protect key outcomes, and guarantee successful on-time delivery under extreme stress.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              next60Minutes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exact actions to complete in next 60 minutes" },
              next3Hours: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High-impact tasks to execute in next 3 hours" },
              next24Hours: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recovery milestones to achieve in next 24 hours" },
              postpone: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Low-value tasks that can safely wait or be postponed" },
              protect: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical deliverables that must never be skipped" },
              newSuccessProbability: { type: Type.INTEGER, description: "New success probability percentage (0-100) after following this rescue plan" },
              explanation: { type: Type.STRING, description: "Detailed explanation of why each recommendation was chosen, referencing actual subtask data" },
            },
            required: ["next60Minutes", "next3Hours", "next24Hours", "postpone", "protect", "newSuccessProbability", "explanation"],
          },
        },
      });
    });

    const parsed = JSON.parse(response.text || "{}");
    rescueCache.set(cacheKey, parsed);
    res.json(parsed);
  } catch (err: any) {
    console.error("Rescue generation failed:", err);
    
    // Highly contextual fallback
    const fallbackNewSuccess = Math.min(95, Math.round((risk?.successProbability || 40) + 30));
    const rescueFallback = {
      next60Minutes: [
        "Freeze all styling modifications and visual fluff immediately.",
        `Isolate the absolute next actionable subtask from the list of ${subtasks?.filter((s: any) => !s.completed)?.length || 3} uncompleted subtasks.`,
        "Set a countdown timer for 45 minutes to execute a single uninterrupted focus sprint."
      ],
      next3Hours: [
        "Develop and hardcode robust mock handlers for any integration points that are causing blocks.",
        "Run a local test build sequence to verify that there are no catastrophic compilation errors.",
        "Refactor your local state to handle missing data fields gracefully, completely eliminating app crashes."
      ],
      next24Hours: [
        "Finish all core structural features required for basic submission.",
        "Publish the initial live web application, validating that the deployment URL is active.",
        "Perform a validation walkthrough of the entire end-to-end critical user flow."
      ],
      postpone: [
        "Postpone full database persistence; rely on localStorage or simulated server in-memory mock storage.",
        "Omit complex customization controls, advanced user roles, and fine-tuning configurations.",
        "Postpone multi-platform responsive checking, focusing only on standard desktop preview layout first."
      ],
      protect: [
        "Ensure the main core dashboard displays cleanly without throwing runtime console errors.",
        "Ensure the final build file bundles correctly via npm run build.",
        "Protect submission of the live URL before the hard deadline closes."
      ],
      newSuccessProbability: fallbackNewSuccess,
      explanation: `[AI PM FALLBACK REVIEW] Following this plan targets the highest-friction bottlenecks on "${title}". By immediately postponing non-critical integrations and focusing purely on the core operational path, your success probability recovers from ${risk?.successProbability || (100 - (risk?.riskScore || 50))}% to ${fallbackNewSuccess}%.`
    };

    rescueCache.set(cacheKey, rescueFallback);
    res.json(rescueFallback);
  }
});

// 5. AI Negotiator (The Workload Optimizer)
app.post("/api/gemini/negotiate", async (req, res) => {
  const { currentLoadHours, activeMissionsCount } = req.body;

  try {
    const ai = getAIClient();
    const prompt = `Analyze current workload:
- Active Missions: ${activeMissionsCount}
- Combined Estimated Effort Needed: ${currentLoadHours} hours.
The target threshold is 25 hours per week of dedicated execution.
Suggest a tactical action: "Start Now" (high reward/low friction), "Delay" (low priority/postpone), "Delegate" (can be split or handled by tools/AI), or "Reduce Scope" (essential but too large). Provide clear architectural reasons and a short chief of staff coach quote.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the AI CHIEF OF STAFF. You manage human capital allocation, advising users when to hold the line, when to cut scope, and when to optimize schedules.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING, enum: ["Start Now", "Delay", "Delegate", "Reduce Scope"] },
            reasoning: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific bulleted bullet points of logical reasoning" },
            coachQuote: { type: Type.STRING, description: "A high-morale, tactical Chief of Staff quote" },
          },
          required: ["recommendation", "reasoning", "coachQuote"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Negotiation failed:", err);
    let recommendation = "Start Now";
    let reasoning = [
      "Your workload density is currently in the safe zone (< 15 hours). No immediate scope cuts required.",
      "Tackling subtasks now builds a cumulative momentum buffer.",
      "Maximize productivity by pairing current high energy with low structural overhead.",
    ];
    let coachQuote = "The battle is won before the first bug is written. Strike while the buffer is in your favor.";

    if (currentLoadHours > 30) {
      recommendation = "Reduce Scope";
      reasoning = [
        `Dangerous overload: ${currentLoadHours} active hours remaining exceed standard cognitive bandwidth bounds.`,
        "Multi-tasking across multiple deadlines is causing severe priority collision.",
        "Cutting non-essential modules immediately is the only mathematical way to guarantee delivery.",
      ];
      coachQuote = "Amateurs try to build everything. Professionals know that shipping a focused masterpiece beats an incomplete empire.";
    } else if (currentLoadHours > 18) {
      recommendation = "Delegate";
      reasoning = [
        `Moderate pressure detected at ${currentLoadHours} hours.`,
        "Utilize the Strategist Agent to decompose and auto-solve initial research subtasks.",
        "Delegate mechanical documentation tasks to Gemini to reclaim creative brainpower.",
      ];
      coachQuote = "Force multiplication is the secret of the elite. Offload the mechanical; focus exclusively on the conceptual core.";
    }

    res.json({
      recommendation,
      reasoning,
      coachQuote,
      fallback: true,
    });
  }
});

// 6. Upload Center (Gemini Vision + Text Extractor)
app.post("/api/gemini/upload", async (req, res) => {
  const { fileName, fileType, fileContent, rawText } = req.body;

  try {
    const ai = getAIClient();
    let response;

    if (fileContent && fileType.startsWith("image/")) {
      // Handle Image uploads via Gemini Multi-modal Vision API
      const imagePart = {
        inlineData: {
          mimeType: fileType,
          data: fileContent, // base64 encoded string
        },
      };
      const promptPart = {
        text: `Analyze this image (hackathon guideline, screenshot, or assignment doc). Identify:
1. Proposed Mission Title (short, engaging, descriptive name)
2. Main Goal Description (concise)
3. Direct Deadline or estimate a realistic deadline based on calendar / default to 3 days from now if not found.
4. Total estimated working hours required.
5. Decompose into 4-6 sequential tactical subtasks with category and estimated hours.`,
      };

      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, promptPart] },
        config: {
          systemInstruction: "You are the RECONNAISSANCE COMMANDER. You ingest messy screenshots, hackathon slides, and raw graphics to instantly map missions, extract precise deliverables, and predict effort metrics.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              deadlineDaysFromNow: { type: Type.INTEGER, description: "Deadlines as integer days from now (e.g. 3, 5, 7)" },
              totalHours: { type: Type.INTEGER },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    estimatedHours: { type: Type.INTEGER },
                  },
                  required: ["title", "category", "estimatedHours"],
                },
              },
            },
            required: ["title", "description", "deadlineDaysFromNow", "totalHours", "subtasks"],
          },
        },
      });
    } else {
      // Handle raw document or email text parses
      const docText = rawText || "Empty uploaded document";
      const prompt = `Ingest this raw document text (syllabus, email, or guide) and extract the core deliverables:
Document Name: "${fileName}"
Content:
"${docText}"

Extract:
1. Proposed Mission Title (descriptive and concise)
2. Concise Description of the mission's core parameters
3. Direct Deadline or estimate a realistic days-to-complete from now (e.g., 5 days)
4. Combined working effort in hours
5. 4 to 6 critical, sequential subtasks with categories (Research, Coding, Setup, etc.) and hours.`;

      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the RECONNAISSANCE COMMANDER. You ingest documents, text transcripts, and raw emails to instantly construct structured tactical missions.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              deadlineDaysFromNow: { type: Type.INTEGER },
              totalHours: { type: Type.INTEGER },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    estimatedHours: { type: Type.INTEGER },
                  },
                  required: ["title", "category", "estimatedHours"],
                },
              },
            },
            required: ["title", "description", "deadlineDaysFromNow", "totalHours", "subtasks"],
          },
        },
      });
    }

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Document ingestion failed:", err);
    // Highly context-aware fallback based on filename!
    const isInternship = fileName.toLowerCase().includes("intern") || fileName.toLowerCase().includes("email");
    const isHackathon = fileName.toLowerCase().includes("hack") || fileName.toLowerCase().includes("guide");

    let title = "Ingested Mission";
    let description = `Ingested deliverables from: ${fileName}`;
    let subtasks = [
      { title: "Review requirements and scope parameters", category: "Research", estimatedHours: 2 },
      { title: "Configure initial workspace and scaffold models", category: "Setup", estimatedHours: 3 },
      { title: "Build core screens & layout mechanics", category: "UI & Frontend", estimatedHours: 5 },
      { title: "Final testing and package deployment", category: "Testing", estimatedHours: 3 },
    ];

    if (isInternship) {
      title = "Apply for Summer AI Internship";
      description = "Extracted application timeline and resume tuning milestones from recruitment email.";
      subtasks = [
        { title: "Refactor portfolio to highlight full-stack architectures", category: "Preparation", estimatedHours: 4 },
        { title: "Draft targeted cover letter emphasizing Gemini SDK integration", category: "Writing", estimatedHours: 2 },
        { title: "Submit materials via career portal and log spreadsheet row", category: "Submission", estimatedHours: 1 },
        { title: "Conduct mock technical system-design and interview prep", category: "Review", estimatedHours: 6 },
      ];
    } else if (isHackathon) {
      title = "Submit Deadline Defender Hackathon build";
      description = "Scraped core submission guidelines and presentation benchmarks from slides.";
      subtasks = [
        { title: "Complete high-contrast responsive CSS layout", category: "UI/UX", estimatedHours: 4 },
        { title: "Connect server-side Gemini risk analytics endpoints", category: "Backend", estimatedHours: 6 },
        { title: "Record 2-minute workflow video showcasing AI Negotiator", category: "Presentation", estimatedHours: 3 },
        { title: "Finalize README, credits, and deploy to Cloud Run", category: "Deployment", estimatedHours: 2 },
      ];
    }

    res.json({
      title,
      description,
      deadlineDaysFromNow: 4,
      totalHours: subtasks.reduce((sum, s) => sum + s.estimatedHours, 0),
      subtasks,
      fallback: true,
      errorMsg: err.message,
    });
  }
});

// 7. Accountability Agent Daily Coaching
app.post("/api/gemini/coach", async (req, res) => {
  const { completedCount, missedCount, tasksText } = req.body;

  try {
    const ai = getAIClient();
    const prompt = `Conduct yesterday's accountability coaching debrief:
Yesterday:
- Completed Missions: ${completedCount}
- Missed/Overdue Missions: ${missedCount}
- Tasks List Context: "${tasksText || "Standard stack of daily commitments"}"

Analyze productivity patterns (e.g. overestimating speed, lack of subtask granularity, ignoring warning thresholds).
Provide:
1. Pattern Detection (Short, precise, objective analysis).
2. Actionable coaching (3 direct military-grade execution principles to prevent failure today).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the ACCOUNTABILITY AGENT, a high-integrity, motivational developer coach. You tell the user hard truths about their work ethics while providing high-leverage tactical optimization.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pattern: { type: Type.STRING, description: "Detailed detection of human productivity pitfalls seen here" },
            coachingFeedback: { type: Type.STRING, description: "Direct coaching advice with 3 actionable tips" },
          },
          required: ["pattern", "coachingFeedback"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Coaching failed:", err);
    res.json({
      pattern: "[SIMULATED ACCOUNTABILITY METRIC] Critical fatigue on long-duration tasks. There is a strong pattern of failing to decompose goals, leading to an 'Activation Energy' barrier where you delay starting because the task looks too massive.",
      coachingFeedback: "1. Force Decompositions: Never work on a mission that doesn't have an active subtask roadmap.\n2. Time Boxing: Commit to exactly 45 minutes of isolated focus on the top priority task first thing in the morning.\n3. Buffer Padding: When estimating hours, immediately multiply by 1.5 to cushion against unexpected bugs.",
      fallback: true,
    });
  }
});

// ----------------------------------------------------------------------
// Vite Middleware & Static File Server Integration
// ----------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DEADLINE DEFENDER AI SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();
