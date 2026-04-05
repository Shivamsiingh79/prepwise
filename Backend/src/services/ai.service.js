const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// ✅ MANUAL STRICT JSON SCHEMA
const schema = {
  type: "object",
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralquestions",
    "skillsGap",
    "preparationPlan",
    "title"
  ],
  properties: {
    matchScore: {
      type: "number"
    },
    technicalQuestions: {
      type: "array",
      items: {
        type: "object",
        required: ["questions", "intention", "answer"],
        properties: {
          questions: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" }
        }
      }
    },
    behavioralquestions: {
      type: "array",
      items: {
        type: "object",
        required: ["questions", "intention", "answer"],
        properties: {
          questions: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" }
        }
      }
    },
    skillsGap: {
      type: "array",
      items: {
        type: "object",
        required: ["skill", "severity"],
        properties: {
          skill: { type: "string" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"]
          }
        }
      }
    },
    preparationPlan: {
      type: "array",
      items: {
        type: "object",
        required: ["day", "focus", "tasks"],
        properties: {
          day: { type: "number" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    },
    title:{
        type:"string"
    }

    
  }
};



async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  const prompt = `
You are generating a STRICT JSON interview report.

🚫 NEVER return flat arrays like:
["questions", "...", "intention", "..."]

✅ ALWAYS return:
[
  {
    "questions": "...",
    "intention": "...",
    "answer": "..."
  }
]

Include a short Professional title for the candidate based on the resume and self-description (e.g. "Senior Software Engineer", "Entry-Level Data Analyst", "Project Manager with 5+ years experience in construction", etc.) in the "title" field of the output JSON.

CRITICAL RULES:
- ONLY return valid JSON
- NO explanation text
- NO extra fields
- ALL arrays must contain OBJECTS only
- NEVER return strings inside arrays

Generate:
- 5-8 technical questions
- 5-8 behavioral questions
- skills gap with severity
- EXACTLY 7 day preparation plan

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schema
    }
  });

  try {
    const parsed = JSON.parse(response.text);

    console.log("\n✅ FINAL CLEAN OUTPUT:\n");
    console.dir(parsed, { depth: null });

    return parsed;

  } catch (err) {
    console.error("\n❌ JSON PARSE FAILED:\n", response.text);
    throw err;
  }
}





async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumepdfSchema = z.object({
    html: z.string()
  });

  const prompt = `
You are a professional resume writer.

Generate a HIGHLY PERSONALIZED HTML resume using the EXACT data provided.

STRICT RULES:
- Use REAL content from resume text
- Extract and include:
  - Projects (with description)
  - Skills
  - Experience
  - Education
  - Links (GitHub, portfolio if present)
- DO NOT invent fake content
- DO NOT generalize
- DO NOT skip sections if data exists
- If something is missing → omit section (don’t hallucinate)

STRUCTURE:
- Name / Title
- Summary (based on selfDescription)
- Skills
- Projects (VERY IMPORTANT)
- Experience
- Education
- Links (if available)

STYLE RULES:
- Use clean HTML + inline CSS
- Ensure proper spacing and margins
- Avoid content getting cut in PDF

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return ONLY:
{
  "html": "<html>...</html>"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(resumepdfSchema)
    }
  });

  console.log("RAW AI RESPONSE:", response.text);

  let jsonContent;

  try {
    jsonContent = JSON.parse(response.text);
  } catch (err) {
    console.error("❌ JSON PARSE FAILED:", response.text);
    throw new Error("Invalid AI response");
  }

  // 🔥 CLEAN HTML
  let html = jsonContent.html
    ?.replace(/```html/g, "")
    .replace(/```/g, "")
    .trim();

  // 🔥 VALIDATE HTML (VERY IMPORTANT)
  if (!html || html.length < 500) {
    console.error("❌ BAD HTML:", html);
    throw new Error("AI returned empty or invalid HTML");
  }

  console.log("FINAL HTML LENGTH:", html.length);
  console.log("HTML PREVIEW:", html.slice(0, 200));

  return html;
}




module.exports = { generateInterviewReport, generateResumePdf };