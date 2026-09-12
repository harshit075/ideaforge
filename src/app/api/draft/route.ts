import { NextRequest, NextResponse } from "next/server";

export interface BuildSpec {
  title: string;
  tagline: string;
  detectedLanguageOrStyle?: string;
  problemStatement: string;
  targetAudience: string;
  coreFeatures: {
    mvp: string[];
    phase2: string[];
  };
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    aiAndApis: string[];
    deployment: string[];
  };
  stepByStepBuildOrder: {
    step: number;
    title: string;
    description: string;
    terminalSnippet?: string;
  }[];
  codingAgentPrompt: string;
  mermaidDiagram?: string;
  version?: number;
  refinementSummary?: string;
}

export async function POST(req: NextRequest) {
  try {
    const geminiKey =
      req.headers.get("x-gemini-key") ||
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API;

    const { transcript, cleanText, previousSpec, refinementNotes } = await req.json();

    if (!transcript && !cleanText && !refinementNotes) {
      return NextResponse.json(
        { error: "No input transcript or refinement text provided.", type: "bad_request" },
        { status: 400 }
      );
    }

    const inputContent = cleanText || transcript || refinementNotes;

    // If a valid GEMINI_API_KEY is available, call Gemini 1.5 Flash
    if (geminiKey && geminiKey.trim() !== "") {
      try {
        const spec = await callGeminiToDraftSpec(geminiKey.trim(), inputContent, previousSpec);
        return NextResponse.json({ success: true, spec, provider: "gemini" });
      } catch (geminiError: any) {
        console.warn("Gemini call failed, falling back to intelligent synthesizer:", geminiError.message);
        // Retry or fallback
        const fallbackSpec = generateIntelligentSpec(inputContent, previousSpec);
        return NextResponse.json({
          success: true,
          spec: fallbackSpec,
          provider: "synthesizer_fallback",
          warning: `Gemini API reported: ${geminiError.message}. Using intelligent spec synthesizer.`,
        });
      }
    } else {
      // Intelligent fallback when key is not provided
      const spec = generateIntelligentSpec(inputContent, previousSpec);
      return NextResponse.json({
        success: true,
        spec,
        provider: "synthesizer_fallback",
        note: "Configured without GEMINI_API_KEY. Using built-in architectural synthesizer.",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to draft specification", type: "server_error" },
      { status: 500 }
    );
  }
}

async function callGeminiToDraftSpec(apiKey: string, input: string, previousSpec?: BuildSpec): Promise<BuildSpec> {
  const isRefinement = !!previousSpec;

  const systemInstruction = `
You are IdeaForge AI — an elite technical architect and software engineer.
Your job is to transform raw, spoken product ideas (which may be spoken in Hindi, Hinglish, Spanish, French, German, or code-switched technical slang) into an immaculate, production-grade software specification and a copy-ready Coding Agent Prompt.

CRITICAL RULES:
1. Regardless of what language the user spoke (e.g. Hindi, Hinglish, Spanish), ALL OUTPUT FIELDS AND PROMPTS MUST BE WRITTEN IN POLISHED, TECHNICAL ENGLISH.
2. The "codingAgentPrompt" field must be an exhaustive, high-caliber prompt ready to be pasted directly into Cursor, Antigravity IDE, or Claude 3.7 Sonnet to build the complete application.
3. Output MUST be valid JSON conforming strictly to the requested schema. No conversational preamble or trailing remarks.
`;

  const userPrompt = isRefinement
    ? `EXISTING SPECIFICATION:
${JSON.stringify(previousSpec, null, 2)}

USER FOLLOW-UP REFINEMENT (Spoken in any language):
"${input}"

TASK:
Update the specification to seamlessly incorporate these refinements.
Increment the version number to ${(previousSpec.version || 1) + 1}.
Include a short "refinementSummary" explaining what was updated.`
    : `RAW SPOKEN IDEA (Spoken in any language or code-switched):
"${input}"

TASK:
Synthesize a comprehensive build specification and coding agent prompt for this idea. Version number should be 1.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemInstruction + "\n\n" + userPrompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  };

  const model = "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API HTTP ${res.status}: ${errorText}`);
  }

  const json = await res.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Gemini returned empty response content");
  }

  // Clean fences if present
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return normalizeSpec(parsed, isRefinement ? (previousSpec.version || 1) + 1 : 1);
}

function normalizeSpec(data: any, version: number = 1): BuildSpec {
  return {
    title: data.title || "Next-Gen Intelligent Web Application",
    tagline: data.tagline || "Turning ambitious spoken concepts into verified software reality.",
    detectedLanguageOrStyle: data.detectedLanguageOrStyle || "Universal Multilingual / Code-switched",
    problemStatement: data.problemStatement || "Modern builders need an instant bridge from unstructured thoughts to executable software architectures.",
    targetAudience: data.targetAudience || "Hackathon participants, software engineers, and technical founders.",
    coreFeatures: {
      mvp: Array.isArray(data.coreFeatures?.mvp) ? data.coreFeatures.mvp : ["Voice input processing", "Architecture synthesizer", "Exportable code prompt"],
      phase2: Array.isArray(data.coreFeatures?.phase2) ? data.coreFeatures.phase2 : ["Collaborative canvas", "Automated deployment pipeline"],
    },
    techStack: {
      frontend: Array.isArray(data.techStack?.frontend) ? data.techStack.frontend : ["Next.js 15 (App Router)", "React 19", "Tailwind CSS", "Lucide Icons"],
      backend: Array.isArray(data.techStack?.backend) ? data.techStack.backend : ["Next.js Server Actions / API Routes", "Node.js 20+"],
      database: Array.isArray(data.techStack?.database) ? data.techStack.database : ["PostgreSQL", "Supabase / Prisma ORM"],
      aiAndApis: Array.isArray(data.techStack?.aiAndApis) ? data.techStack.aiAndApis : ["AssemblyAI Dictation API (Universal-3.5 Pro)", "Google Gemini API"],
      deployment: Array.isArray(data.techStack?.deployment) ? data.techStack.deployment : ["Vercel", "Docker container"],
    },
    stepByStepBuildOrder: Array.isArray(data.stepByStepBuildOrder) ? data.stepByStepBuildOrder : [
      { step: 1, title: "Initialize Core Application", description: "Set up repository with Next.js and Tailwind design system." },
      { step: 2, title: "Integrate Voice & Dictation API", description: "Connect AssemblyAI Dictation endpoint for real-time speech intake." },
      { step: 3, title: "Orchestrate AI Spec Generator", description: "Pipe transcribed text through structured LLM synthesis." },
    ],
    codingAgentPrompt: data.codingAgentPrompt || "Build a full-stack Next.js application implementing this exact specification with pristine UI.",
    mermaidDiagram: data.mermaidDiagram || `graph TD\n  User[Spoken Voice Idea] --> Audio[Web Audio Analyzer]\n  Audio --> AAI[AssemblyAI Dictation API]\n  AAI --> Spec[Gemini Build Engine]\n  Spec --> Code[Production Coding Prompt]`,
    version: version,
    refinementSummary: data.refinementSummary || "Initial specification synthesis.",
  };
}

// Built-in intelligent architectural synthesizer for instant local execution
function generateIntelligentSpec(input: string, previousSpec?: BuildSpec): BuildSpec {
  const lower = input.toLowerCase();
  const isRefinement = !!previousSpec;
  const nextVer = isRefinement ? (previousSpec.version || 1) + 1 : 1;

  // Detect key subjects
  const isEcommerce = lower.includes("shop") || lower.includes("store") || lower.includes("cart") || lower.includes("buy") || lower.includes("sell") || lower.includes("payment");
  const isAI = lower.includes("ai") || lower.includes("bot") || lower.includes("model") || lower.includes("agent") || lower.includes("llm");
  const isHealth = lower.includes("health") || lower.includes("doctor") || lower.includes("medical") || lower.includes("patient") || lower.includes("clinic");
  const isSocial = lower.includes("social") || lower.includes("chat") || lower.includes("friend") || lower.includes("community") || lower.includes("feed");

  let title = "Universal Voice-Powered Innovation Platform";
  let tagline = "Transmuting spoken vision into high-impact software execution.";
  let problemStatement = "Builders often struggle to organize rapid, code-switched or multilingual spoken thoughts into strict technical roadmaps and prompts.";
  let targetAudience = "Global developers, founders, and teams building without linguistic friction.";

  if (isEcommerce) {
    title = "OmniCart Commerce Matrix";
    tagline = "Frictionless multi-currency e-commerce with intelligent inventory and dynamic checkout.";
    problemStatement = "Traditional commerce platforms are clunky to customize and fail to adapt smoothly to international payment flows.";
    targetAudience = "Modern digital merchants and D2C brands.";
  } else if (isHealth) {
    title = "CareSync AI Clinical Assistant";
    tagline = "Voice-first clinical intake and secure patient documentation copilot.";
    problemStatement = "Healthcare practitioners spend over 40% of their day on administrative note-taking rather than patient interaction.";
    targetAudience = "Clinicians, nursing staff, and medical practices.";
  } else if (isSocial) {
    title = "Nexus Community Hub";
    tagline = "Real-time cross-lingual conversational community with built-in voice translation.";
    problemStatement = "Language barriers fragment international user communities and slow knowledge exchange.";
    targetAudience = "Global creators and distributed project teams.";
  } else if (isAI) {
    title = "CogniFlow Agentic Suite";
    tagline = "Autonomous multi-agent orchestration for complex workflows and code generation.";
    problemStatement = "Developing and coordinating multiple autonomous LLM tools requires tedious boilerplate and inconsistent prompt structures.";
    targetAudience = "AI engineers and rapid-prototyping teams.";
  }

  // Handle refinement updates
  let refinementSummary = "Initial specification created from voice input.";
  let updatedMvp = [
    "Multilingual Voice Intake (Universal-3.5 Pro with code-switching)",
    "Instant Architectural Decomposition & Spec Synthesizer",
    "One-Click System Prompt Exporter for Coding Agents",
    "Real-Time Health & Diagnostics Telemetry Suite",
  ];
  let updatedStack = {
    frontend: ["Next.js 15 (App Router)", "React 19", "Tailwind CSS", "Framer Motion", "Lucide Icons"],
    backend: ["Next.js Edge/Node API Routes", "Server Actions", "TypeScript"],
    database: ["PostgreSQL", "Supabase (Row-Level Security)"],
    aiAndApis: ["AssemblyAI Dictation API", "Google Gemini API"],
    deployment: ["Vercel", "Docker Engine"],
  };

  if (isRefinement && previousSpec) {
    title = previousSpec.title;
    tagline = previousSpec.tagline;
    problemStatement = previousSpec.problemStatement;
    targetAudience = previousSpec.targetAudience;
    refinementSummary = `Updated specification with refinement: "${input.slice(0, 80)}..."`;

    if (lower.includes("mobile") || lower.includes("responsive")) {
      updatedMvp.push("Mobile-first adaptive layout with tactile touch gestures");
      refinementSummary += " (Added mobile-first architecture focus)";
    }
    if (lower.includes("stripe") || lower.includes("payment")) {
      updatedMvp.push("Stripe payment gateway integration with webhooks");
      updatedStack.aiAndApis.push("Stripe API");
      refinementSummary += " (Integrated Stripe payments)";
    }
    if (lower.includes("auth") || lower.includes("login")) {
      updatedMvp.push("Role-based authentication & session persistence");
      updatedStack.backend.push("NextAuth / Clerk");
      refinementSummary += " (Enhanced authentication)";
    }
    if (lower.includes("dark") || lower.includes("theme")) {
      updatedMvp.push("Dynamic obsidian dark mode with glowing accents");
    }
  }

  const codingAgentPrompt = `# PRODUCTION BUILD DIRECTIVE: ${title.toUpperCase()}
## Overview
You are building "${title}" — ${tagline}
Core Problem: ${problemStatement}
Target Audience: ${targetAudience}

## Technology Stack
- Frontend: ${updatedStack.frontend.join(", ")}
- Backend: ${updatedStack.backend.join(", ")}
- Database: ${updatedStack.database.join(", ")}
- APIs & Intelligence: ${updatedStack.aiAndApis.join(", ")}

## Key Features & Requirements
${updatedMvp.map((f, i) => `${i + 1}. **${f}**`).join("\n")}

## Execution Order
1. Scaffold Next.js project with TypeScript, Tailwind CSS, and icon set.
2. Configure environment variables for API integrations securely server-side.
3. Build responsive UI layout with dark obsidian glassmorphism.
4. Wire up audio intake, dictation processing, and prompt export functionality.
5. Validate end-to-end responsiveness and error resilience.
`;

  return {
    title,
    tagline,
    detectedLanguageOrStyle: "Universal Code-Switching (Preserved Technical Nouns)",
    problemStatement,
    targetAudience,
    coreFeatures: {
      mvp: updatedMvp,
      phase2: [
        "Automated CI/CD GitHub Action Generation",
        "Team Workspace & Real-Time Sync",
        "Fine-Tuned Domain Adapters",
      ],
    },
    techStack: updatedStack,
    stepByStepBuildOrder: [
      {
        step: 1,
        title: "Initialize Next.js Repository",
        description: "Set up Next.js 15 project with strict TypeScript and Tailwind CSS.",
        terminalSnippet: "npx create-next-app@latest ./ --typescript --tailwind --eslint",
      },
      {
        step: 2,
        title: "Configure Server-Side APIs",
        description: "Set up API route proxies for AssemblyAI and LLM processing with secure environment variables.",
        terminalSnippet: "mkdir -p src/app/api/transcribe && touch .env.local",
      },
      {
        step: 3,
        title: "Implement Audio Recording & Waveform Meter",
        description: "Build Web Audio visualizer with real-time frequency analysis and recording state machine.",
      },
      {
        step: 4,
        title: "Assemble Spec Viewer & Prompt Exporter",
        description: "Render structured cards, architecture graph, and single-click coding agent prompt exporter.",
      },
    ],
    codingAgentPrompt,
    mermaidDiagram: `graph TD
  User((Spoken Idea)) --> AudioAnalyzer[Web Audio Analyser]
  AudioAnalyzer --> AAI[AssemblyAI Dictation API]
  AAI --> Processor[Gemini Architecture Engine]
  Processor --> SpecUI[Visual Spec & Diagnostics]
  SpecUI --> AgentPrompt[Coding Agent Prompt]`,
    version: nextVer,
    refinementSummary,
  };
}
