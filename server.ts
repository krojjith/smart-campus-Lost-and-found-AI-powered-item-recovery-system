import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_CAMPUS_ITEMS } from "./src/mockData.ts";
import { CampusItem, AIMatchCandidate } from "./src/types.ts";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "15mb" }));

// In-memory persistent state (seeded with initial campus items)
let campusItems: CampusItem[] = [...INITIAL_CAMPUS_ITEMS];

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Fallback rule-based matching engine for resilience
function ruleBasedMatch(targetItem: CampusItem, candidates: CampusItem[]): AIMatchCandidate[] {
  const targetWords = (targetItem.title + " " + targetItem.description)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const results: AIMatchCandidate[] = [];

  for (const candidate of candidates) {
    let score = 0;
    const matchedAttrs: string[] = [];
    const caveats: string[] = [];

    // Category check
    if (targetItem.category.toLowerCase() === candidate.category.toLowerCase()) {
      score += 25;
      matchedAttrs.push(`Same Category: ${targetItem.category}`);
    }

    // Word similarity
    const candText = (candidate.title + " " + candidate.description).toLowerCase();
    let wordMatches = 0;
    for (const word of targetWords) {
      if (candText.includes(word)) {
        wordMatches++;
      }
    }
    const ratio = targetWords.length > 0 ? wordMatches / targetWords.length : 0;
    score += Math.min(50, Math.round(ratio * 70));

    if (wordMatches > 0) {
      matchedAttrs.push(`Shared descriptors & identifiers (${wordMatches} keywords matched)`);
    }

    // Location proximity check
    const targetLoc = targetItem.location.toLowerCase();
    const candLoc = candidate.location.toLowerCase();
    const locKeywords = ["library", "gym", "science", "dining", "commons", "hall", "lab", "quad", "center"];
    const commonLoc = locKeywords.find((k) => targetLoc.includes(k) && candLoc.includes(k));
    if (commonLoc) {
      score += 20;
      matchedAttrs.push(`Location proximity match near campus ${commonLoc}`);
    }

    // Normalized score cap
    score = Math.min(96, Math.max(10, score));

    let confidence: "High" | "Medium" | "Low" = "Low";
    if (score >= 70) confidence = "High";
    else if (score >= 45) confidence = "Medium";

    if (score < 35) caveats.push("Different reported locations or sparse keyword correlation.");

    const lost = targetItem.type === "lost" ? targetItem : candidate;
    const found = targetItem.type === "found" ? targetItem : candidate;

    results.push({
      lostItem: lost,
      foundItem: found,
      matchScore: score,
      confidence,
      reasoning: `Matched via campus attribute comparison. ${
        score >= 70
          ? "High alignment between visual descriptors, category, and reported campus zone."
          : "Partial alignment based on category and general item description."
      }`,
      matchedAttributes: matchedAttrs.length > 0 ? matchedAttrs : ["Category alignment"],
      unmatchedOrCaveats: caveats,
      suggestedAction:
        targetItem.type === "lost"
          ? `Check retrieval point at: ${found.storageLocation || found.location}`
          : `Notify owner ${lost.contactName} (${lost.contactEmail})`,
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", itemsCount: campusItems.length });
});

// Get all items with optional filters
app.get("/api/items", (req, res) => {
  const { type, category, status, search } = req.query;
  let items = [...campusItems];

  if (type && typeof type === "string" && type !== "all") {
    items = items.filter((i) => i.type === type);
  }

  if (category && typeof category === "string" && category !== "all") {
    items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }

  if (status && typeof status === "string" && status !== "all") {
    items = items.filter((i) => i.status === status);
  }

  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, items });
});

// Create a new item (Lost or Found)
app.post("/api/items", (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      imageUrl,
      location,
      dateTime,
      contactName,
      contactEmail,
      contactPhone,
      storageLocation,
    } = req.body;

    if (!type || !title || !category || !description || !location || !dateTime || !contactName || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields for reporting item.",
      });
    }

    const newItem: CampusItem = {
      id: `item-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: type === "found" ? "found" : "lost",
      title: title.trim(),
      category,
      description: description.trim(),
      imageUrl: imageUrl || undefined,
      location: location.trim(),
      dateTime,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: (contactPhone || "").trim(),
      storageLocation: storageLocation ? storageLocation.trim() : undefined,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    campusItems.unshift(newItem);
    return res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to create item." });
  }
});

// Update item status (e.g., claimed, matched, open)
app.patch("/api/items/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["open", "matched", "claimed"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status value." });
  }

  const index = campusItems.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Item not found." });
  }

  campusItems[index] = {
    ...campusItems[index],
    status,
  };

  return res.json({ success: true, item: campusItems[index] });
});

// AI Smart Matching endpoint
// Compares a target item (or arbitrary prompt) against complementary items
app.post("/api/match", async (req, res) => {
  try {
    const { targetItemId, targetItem: providedTarget } = req.body;

    let targetItem: CampusItem | undefined = providedTarget;
    if (targetItemId && !targetItem) {
      targetItem = campusItems.find((i) => i.id === targetItemId);
    }

    if (!targetItem) {
      return res.status(400).json({ success: false, error: "Target item is required for matching." });
    }

    // Complementary pool: If target is 'lost', compare against all 'found' items, and vice versa
    const targetOppositeType = targetItem.type === "lost" ? "found" : "lost";
    const candidateItems = campusItems.filter((i) => i.type === targetOppositeType);

    if (candidateItems.length === 0) {
      return res.json({
        success: true,
        matches: [],
        analyzedCount: 0,
        isAiPowered: false,
        message: `No ${targetOppositeType} items currently registered to compare against.`,
      });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are the Campus AI Lost & Found Matching Specialist.
Your job is to compare a ${targetItem.type.toUpperCase()} item against ${candidateItems.length} candidate ${targetOppositeType.toUpperCase()} item(s).
Analyze visual traits, brands, models, specific markings, locations, categories, and chronological plausibility.

TARGET ${targetItem.type.toUpperCase()} ITEM:
- ID: ${targetItem.id}
- Title: ${targetItem.title}
- Category: ${targetItem.category}
- Description: ${targetItem.description}
- Reported Location: ${targetItem.location}
- Date & Time: ${targetItem.dateTime}

CANDIDATES TO EVALUATE:
${candidateItems
  .map(
    (c, idx) => `[Candidate ${idx + 1}]
- Candidate ID: ${c.id}
- Title: ${c.title}
- Category: ${c.category}
- Description: ${c.description}
- Location: ${c.location}
- Date & Time: ${c.dateTime}
`
  )
  .join("\n")}

Respond strictly with a JSON array ranking each candidate by similarity and likelihood of being the exact same item.
Score from 0 (completely unrelated) to 100 (definitive match).
Only return candidates that have at least some relevance (e.g. score >= 20).
Include reasoning explaining matching traits (stickers, colors, scratches, brands, nearby campus buildings) and any differences.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  candidateId: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER, description: "Match probability score 0 to 100" },
                  confidence: { type: Type.STRING, description: "High, Medium, or Low" },
                  reasoning: { type: Type.STRING, description: "Detailed comparative explanation of match" },
                  matchedAttributes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Key overlapping traits (e.g., brand, color, stickers, location proximity)",
                  },
                  unmatchedOrCaveats: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Differences or areas needing verification",
                  },
                  suggestedAction: {
                    type: Type.STRING,
                    description: "Recommended next step for student or campus staff",
                  },
                },
                required: ["candidateId", "matchScore", "confidence", "reasoning", "matchedAttributes", "suggestedAction"],
              },
            },
          },
        });

        const textOutput = response.text || "[]";
        const parsed = JSON.parse(textOutput);

        const aiMatches: AIMatchCandidate[] = [];
        for (const itemMatch of parsed) {
          const candidateObj = candidateItems.find((c) => c.id === itemMatch.candidateId);
          if (candidateObj) {
            const lost = targetItem.type === "lost" ? targetItem : candidateObj;
            const found = targetItem.type === "found" ? targetItem : candidateObj;

            aiMatches.push({
              lostItem: lost,
              foundItem: found,
              matchScore: Math.round(itemMatch.matchScore || 0),
              confidence: (itemMatch.confidence as "High" | "Medium" | "Low") || "Medium",
              reasoning: itemMatch.reasoning,
              matchedAttributes: itemMatch.matchedAttributes || [],
              unmatchedOrCaveats: itemMatch.unmatchedOrCaveats || [],
              suggestedAction: itemMatch.suggestedAction,
            });
          }
        }

        aiMatches.sort((a, b) => b.matchScore - a.matchScore);

        return res.json({
          success: true,
          matches: aiMatches,
          analyzedCount: candidateItems.length,
          isAiPowered: true,
        });
      } catch (aiErr: any) {
        console.error("Gemini AI API call error, falling back to rule-based:", aiErr?.message || aiErr);
      }
    }

    // Fallback if Gemini not available or threw error
    const fallbackMatches = ruleBasedMatch(targetItem, candidateItems);
    return res.json({
      success: true,
      matches: fallbackMatches,
      analyzedCount: candidateItems.length,
      isAiPowered: false,
      message: "Matched using campus smart text & location attributes.",
    });
  } catch (err: any) {
    console.error("Error in /api/match:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process matching." });
  }
});

// Scan all open lost items vs all open found items
app.post("/api/match-all", async (req, res) => {
  try {
    const openLost = campusItems.filter((i) => i.type === "lost" && i.status !== "claimed");
    const openFound = campusItems.filter((i) => i.type === "found" && i.status !== "claimed");

    if (openLost.length === 0 || openFound.length === 0) {
      return res.json({
        success: true,
        matches: [],
        message: "Need at least one open lost item and one open found item to scan for pairings.",
      });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are the Campus AI Lost & Found matcher.
Evaluate all open lost items against open found items on a college campus.
Identify strong and moderate match candidates.

LOST ITEMS:
${openLost.map((l) => `- ID: ${l.id} | Title: ${l.title} | Cat: ${l.category} | Desc: ${l.description} | Loc: ${l.location}`).join("\n")}

FOUND ITEMS:
${openFound.map((f) => `- ID: ${f.id} | Title: ${f.title} | Cat: ${f.category} | Desc: ${f.description} | Loc: ${f.location}`).join("\n")}

Return high quality pairings with matchScore >= 45.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lostItemId: { type: Type.STRING },
                  foundItemId: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER },
                  confidence: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  matchedAttributes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedAction: { type: Type.STRING },
                },
                required: ["lostItemId", "foundItemId", "matchScore", "confidence", "reasoning", "matchedAttributes", "suggestedAction"],
              },
            },
          },
        });

        const parsed = JSON.parse(response.text || "[]");
        const matches: AIMatchCandidate[] = [];

        for (const p of parsed) {
          const lost = openLost.find((l) => l.id === p.lostItemId);
          const found = openFound.find((f) => f.id === p.foundItemId);
          if (lost && found) {
            matches.push({
              lostItem: lost,
              foundItem: found,
              matchScore: Math.round(p.matchScore),
              confidence: p.confidence as "High" | "Medium" | "Low",
              reasoning: p.reasoning,
              matchedAttributes: p.matchedAttributes || [],
              suggestedAction: p.suggestedAction,
            });
          }
        }

        return res.json({
          success: true,
          matches: matches.sort((a, b) => b.matchScore - a.matchScore),
          isAiPowered: true,
        });
      } catch (err: any) {
        console.error("Gemini batch match error, using rule-based:", err?.message || err);
      }
    }

    // Fallback batch matching
    const allMatches: AIMatchCandidate[] = [];
    for (const lost of openLost) {
      const candidates = ruleBasedMatch(lost, openFound);
      for (const c of candidates) {
        if (c.matchScore >= 45) {
          allMatches.push(c);
        }
      }
    }

    return res.json({
      success: true,
      matches: allMatches.sort((a, b) => b.matchScore - a.matchScore),
      isAiPowered: false,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// SERVER START & VITE MIDDLEWARE
// ----------------------------------------------------
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
    console.log(`Smart Campus Lost & Found server running on http://localhost:${PORT}`);
  });
}

startServer();
