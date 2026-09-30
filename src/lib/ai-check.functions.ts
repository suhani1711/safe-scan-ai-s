import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  content: z.string().min(1).max(4000),
  ruleScore: z.number().min(0).max(100),
});

export type AiVerdict = { verdict: "safe" | "suspicious" | "scam"; confidence: number; summary: string; advice: string };

export const aiCheck = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }): Promise<AiVerdict> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a fraud analyst for Indian users. Judge whether the given SMS, link, email or UPI QR payload is a scam. Reply ONLY with JSON: {\"verdict\":\"safe|suspicious|scam\",\"confidence\":0-100,\"summary\":\"one plain sentence\",\"advice\":\"one plain sentence\"}.",
          },
          { role: "user", content: `Rule engine trust score: ${data.ruleScore}/100.\nContent:\n${data.content}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (res.status === 429) throw new Error("AI is busy, try again in a moment.");
    if (res.status === 402) throw new Error("AI credits have run out.");
    if (!res.ok) throw new Error("AI check failed.");
    const json = await res.json();
    const text: string = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      verdict: ["safe", "suspicious", "scam"].includes(parsed.verdict) ? parsed.verdict : "suspicious",
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 50)),
      summary: String(parsed.summary ?? ""),
      advice: String(parsed.advice ?? ""),
    };
  });
