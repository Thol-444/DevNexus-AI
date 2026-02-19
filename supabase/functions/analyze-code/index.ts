import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert code analyzer and interview preparation assistant. When given source code and its programming language, you MUST return a JSON object with exactly these fields:

{
  "error_analysis": "Detailed analysis of syntax errors, logical errors, runtime risks, edge case failures, and inefficient patterns found in the code.",
  "corrected_code": "The fixed version of the code with all errors corrected.",
  "correction_explanation": "Explanation of what was corrected and why.",
  "optimized_code": "A more efficient implementation of the code.",
  "optimization_strategy": "Explanation of the optimization strategy and comparison with original.",
  "time_complexity": "Big-O time complexity with explanation.",
  "space_complexity": "Big-O space complexity with explanation.",
  "step_by_step": "Line-by-line explanation of the code with example input/output walkthrough.",
  "conceptual_dive": "Deep explanation of concepts used (Arrays, HashMap, Recursion, DP, BFS, DFS, etc.), theory behind them, and real-world applications.",
  "interview_questions": {
    "easy": [{"question": "...", "answer": "..."}],
    "medium": [{"question": "...", "answer": "..."}],
    "hard": [{"question": "...", "answer": "..."}]
  },
  "viva_questions": [{"question": "...", "answer": "..."}],
  "company_relevance": [
    {"company": "Amazon", "relevance": "High/Medium/Low", "similar_pattern": "...", "interview_round": "OA/Technical/System Design"},
    {"company": "Microsoft", "relevance": "...", "similar_pattern": "...", "interview_round": "..."},
    {"company": "Google", "relevance": "...", "similar_pattern": "...", "interview_round": "..."},
    {"company": "Uber", "relevance": "...", "similar_pattern": "...", "interview_round": "..."},
    {"company": "Meta", "relevance": "...", "similar_pattern": "...", "interview_round": "..."}
  ],
  "practice_problems": [
    {"title": "...", "platform": "LeetCode/HackerRank/CodeChef", "difficulty": "Easy/Medium/Hard", "description": "...", "why_related": "..."}
  ]
}

Generate 5 easy, 5 medium, and 5 hard interview questions. Generate 10 viva questions. Generate at least 5 practice problems.
All content must be dynamically generated based on the actual code logic and concepts used. Return ONLY valid JSON, no markdown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source_code, language } = await req.json();
    
    if (!source_code || !language) {
      return new Response(JSON.stringify({ error: "source_code and language are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Language: ${language}\n\nSource Code:\n\`\`\`${language}\n${source_code}\n\`\`\`` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON from the AI response
    let analysis;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-code error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
