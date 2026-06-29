import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

/* ── Types ────────────────────────────────────────────── */
export interface MealEntry {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number; // in minutes
  nutritionHighlight: string;
}

export interface MealMatrix {
  breakfast: MealEntry;
  am_snack: MealEntry;
  lunch: MealEntry;
  pm_snack: MealEntry;
  dinner: MealEntry;
  generatedAt: string;
  fridgeIngredients: string[];
}

/* ── System Prompt ────────────────────────────────────── */
const SYSTEM_PROMPT = `You are a pediatric nutritionist and chef for a 16-month-old toddler. The child eats finely chopped family food. The user provides current fridge ingredients.

Return a valid JSON object containing a '5-Meal Matrix' with keys: breakfast, am_snack, lunch, pm_snack, dinner.

Each meal must be a JSON object with these exact fields:
- "name": string — creative name of the dish in Indonesian
- "description": string — 1-2 sentence description in Indonesian
- "ingredients": string[] — list of specific ingredients with quantities
- "instructions": string[] — step-by-step cooking instructions in Indonesian (max 5 steps)
- "cookingTime": number — total prep + cook time in minutes (integer)
- "nutritionHighlight": string — key nutritional benefit in Indonesian (1 sentence)

CONSTRAINTS:
1. The "breakfast" meal MUST have cookingTime of 30 minutes or less (strict hard limit for a working mother).
2. Use ONLY the provided fridge ingredients plus these basic pantry staples: garam, gula, minyak sayur, bawang putih, bawang merah, kecap manis, tepung terigu, telur (if not already listed), nasi putih, air.
3. All portions and textures must be safe for a 16-month-old (finely chopped, not too spicy, low sodium).
4. Vary the protein sources across meals to ensure balanced nutrition.
5. Include at least one vegetable in each main meal (breakfast, lunch, dinner).
6. Return ONLY the raw JSON object — no markdown, no code fences, no explanation text.

JSON structure:
{
  "breakfast": { "name": "...", "description": "...", "ingredients": [...], "instructions": [...], "cookingTime": 25, "nutritionHighlight": "..." },
  "am_snack": { ... },
  "lunch": { ... },
  "pm_snack": { ... },
  "dinner": { ... }
}`;

/* ── POST Handler ─────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    /* 1. Parse request body */
    const body = await request.json();
    const ingredients: string[] = body.ingredients ?? [];

    if (!ingredients.length) {
      return Response.json(
        { error: "Minimal 1 bahan harus diisi." },
        { status: 400 }
      );
    }

    /* 2. Validate API key */
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[generate-meals] GEMINI_API_KEY is not set.");
      return Response.json(
        { error: "Konfigurasi server bermasalah. Hubungi admin." },
        { status: 500 }
      );
    }

    /* 3. Build prompt */
    const userPrompt = `Bahan-bahan di kulkasku saat ini:
${ingredients.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

Buatkan matrix 5 meal MPASI untuk besok berdasarkan bahan di atas.`;

    /* 4. Call Gemini 1.5 Flash */
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userPrompt);
    const rawText = result.response.text();

    /* 5. Parse and validate JSON */
    let parsed: Record<string, MealEntry>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("[generate-meals] Failed to parse Gemini JSON:", rawText);
      return Response.json(
        { error: "AI menghasilkan respons yang tidak valid. Coba lagi." },
        { status: 502 }
      );
    }

    /* 6. Validate required meal keys */
    const requiredKeys = ["breakfast", "am_snack", "lunch", "pm_snack", "dinner"];
    const missingKeys = requiredKeys.filter((k) => !(k in parsed));
    if (missingKeys.length) {
      console.error("[generate-meals] Missing keys:", missingKeys);
      return Response.json(
        { error: "Respons AI tidak lengkap. Coba lagi." },
        { status: 502 }
      );
    }

    /* 7. Build final matrix response */
    const matrix: MealMatrix = {
      breakfast: parsed.breakfast,
      am_snack: parsed.am_snack,
      lunch: parsed.lunch,
      pm_snack: parsed.pm_snack,
      dinner: parsed.dinner,
      generatedAt: new Date().toISOString(),
      fridgeIngredients: ingredients,
    };

    return Response.json({ matrix }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-meals] Unhandled error:", message);
    return Response.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
