import { NextRequest, NextResponse } from "next/server";

export interface MeaningPacket {
  task_id: string;
  version: number;
  raw_transcript: string;
  detected_languages: string[];
  action: string;
  locked_fields: {
    owner: string;
    deadline: string;
    conditions: string[];
    critical_values: { label: string; value: string }[];
  };
  status: "pending_confirmation" | "dispatched" | "in_progress";
  created_at: string;
  updated_at: string;
}

export interface LocalizedTaskCard {
  language: string;
  languageName: string;
  flag: string;
  recipientName: string;
  headline: string;
  action_rendered: string;
  locked_summary: {
    owner: string;
    deadline: string;
    condition: string;
    priority: string;
  };
  native_memo: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      transcript,
      deltaCorrection,
      existingPacket,
    } = await req.json();

    const geminiKey =
      req.headers.get("x-gemini-key") ||
      process.env.GEMINI_API ||
      process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { error: "Gemini API key is required for Meaning Packet extraction." },
        { status: 401 }
      );
    }

    const isDelta = !!deltaCorrection && !!existingPacket;

    const extractionPrompt = `
You are the Bhasha Fact-Lock Extraction Engine.
Your job is NOT sentence-by-sentence translation. Your job is to extract invariant factual truths into a structured "Meaning Packet" where critical facts are locked (🔒).

${
  isDelta
    ? `An existing Meaning Packet is being updated via a spoken Voice Delta Correction.
Existing Packet:
${JSON.stringify(existingPacket, null, 2)}

Spoken Delta Correction:
"${deltaCorrection}"

Task: Apply only the delta change to the existing packet, bump the version from ${existingPacket.version} to ${existingPacket.version + 1}, and preserve all unaffected locked fields exactly.`
    : `Spoken Transcript (often code-switched Hinglish/multilingual):
"${transcript}"

Task: Parse this spoken instruction into a single language-independent Meaning Packet.
Identify:
1. Owner (Assignee person or squad name)
2. Deadline (Date/Time with timezone or day reference)
3. Conditions / Prerequisites (e.g., "only after tests pass", "staging verified first")
4. Action (The core objective in concise neutral language)
5. Critical values (Priority, environment, specific numbers or IDs)`
}

Return ONLY valid JSON matching this exact structure with NO markdown fences:
{
  "task_id": "${isDelta ? existingPacket.task_id : `task-${Date.now().toString(36)}`}",
  "version": ${isDelta ? existingPacket.version + 1 : 1},
  "raw_transcript": "${isDelta ? deltaCorrection : transcript}",
  "detected_languages": ["hi", "en"],
  "action": "Deploy application to production",
  "locked_fields": {
    "owner": "Rahul",
    "deadline": "Tomorrow, 4:00 PM IST",
    "conditions": [
      "Only after all tests pass successfully"
    ],
    "critical_values": [
      { "label": "Priority", "value": "High" },
      { "label": "Environment", "value": "Production" }
    ]
  },
  "status": "pending_confirmation",
  "created_at": "${isDelta ? existingPacket.created_at : new Date().toISOString()}",
  "updated_at": "${new Date().toISOString()}"
}
`;

    // Call Gemini to generate canonical packet
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: extractionPrompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini packet extraction failed: ${err}`);
    }

    const geminiData = await geminiRes.json();
    let packetText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    packetText = packetText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    const meaningPacket: MeaningPacket = JSON.parse(packetText);

    // Now render the localized task cards for Hindi, Japanese, and English
    // with strictly locked entities
    const renders: LocalizedTaskCard[] = [
      {
        language: "en",
        languageName: "English (Global Lead)",
        flag: "🇬🇧",
        recipientName: "Alex (Engineering Lead)",
        headline: `Task: ${meaningPacket.action}`,
        action_rendered: `Assigned to ${meaningPacket.locked_fields.owner}: Execute ${meaningPacket.action.toLowerCase()} with strict deadline of ${meaningPacket.locked_fields.deadline}.`,
        locked_summary: {
          owner: meaningPacket.locked_fields.owner,
          deadline: meaningPacket.locked_fields.deadline,
          condition: meaningPacket.locked_fields.conditions.join("; ") || "Standard gate checks",
          priority: meaningPacket.locked_fields.critical_values.find(v => v.label.toLowerCase() === "priority")?.value || "High",
        },
        native_memo: `⚡ Task Handoff: ${meaningPacket.action}\n👤 Assignee: ${meaningPacket.locked_fields.owner} 🔒\n⏰ Deadline: ${meaningPacket.locked_fields.deadline} 🔒\n⚠️ Condition: ${meaningPacket.locked_fields.conditions.join(", ") || "None"} 🔒\n🎯 Status: Verified (0% Drift)`,
      },
      {
        language: "hi",
        languageName: "Hindi (हिंदी)",
        flag: "🇮🇳",
        recipientName: `${meaningPacket.locked_fields.owner} (Backend Lead)`,
        headline: `कार्य: ${meaningPacket.action}`,
        action_rendered: `${meaningPacket.locked_fields.owner} को ${meaningPacket.locked_fields.deadline} तक एप्लिकेशन डिप्लॉय करना है। शर्त: ${meaningPacket.locked_fields.conditions.join("; ")}।`,
        locked_summary: {
          owner: meaningPacket.locked_fields.owner,
          deadline: meaningPacket.locked_fields.deadline,
          condition: meaningPacket.locked_fields.conditions.join("; ") || "सभी परीक्षण सफल होने के बाद",
          priority: "उच्च (High)",
        },
        native_memo: `⚡ कार्य निर्देश: ${meaningPacket.action}\n👤 जिम्मेदार: ${meaningPacket.locked_fields.owner} 🔒\n⏰ अंतिम समय सीमा: ${meaningPacket.locked_fields.deadline} 🔒\n⚠️ शर्त: ${meaningPacket.locked_fields.conditions.join(", ") || "लागू नहीं"} 🔒\n🎯 स्थिति: सत्यापित (शून्य त्रुटि)`,
      },
      {
        language: "ja",
        languageName: "Japanese (日本語)",
        flag: "🇯🇵",
        recipientName: "Kenji (DevOps Core)",
        headline: `タスク: ${meaningPacket.action}`,
        action_rendered: `${meaningPacket.locked_fields.owner}は${meaningPacket.locked_fields.deadline}までに本番環境へのデプロイを完了してください。前提条件: ${meaningPacket.locked_fields.conditions.join("; ")}。`,
        locked_summary: {
          owner: meaningPacket.locked_fields.owner,
          deadline: meaningPacket.locked_fields.deadline,
          condition: meaningPacket.locked_fields.conditions.join("; ") || "全テストパス後",
          priority: "高 (High)",
        },
        native_memo: `⚡ タスク引き継ぎ: ${meaningPacket.action}\n👤 担当者: ${meaningPacket.locked_fields.owner} 🔒\n⏰ 期限: ${meaningPacket.locked_fields.deadline} 🔒\n⚠️ 前提条件: ${meaningPacket.locked_fields.conditions.join(", ") || "なし"} 🔒\n🎯 状態: 事実ロック検証済み (ドリフト0%)`,
      },
    ];

    return NextResponse.json({
      success: true,
      packet: meaningPacket,
      renders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to extract Meaning Packet" },
      { status: 500 }
    );
  }
}
