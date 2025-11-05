import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { story, tone } = await req.json();
    
    if (!story || !tone) {
      return new Response(
        JSON.stringify({ error: "Story and tone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a storytelling assistant for a fundraising platform. Your job is to rewrite or enhance campaign stories to make them clear, compelling, trustworthy, and emotionally resonant, without exaggeration or manipulation.

Instructions:
- Maintain honesty, clarity, and transparency.
- Do NOT invent facts, change the meaning, or add dramatic lies.
- Focus on empathy, trust-building, and explaining why the support matters.
- Keep it concise: 2–5 paragraphs max.
- Ensure the story is at least 50 words.
- Ensure it sounds human and natural in the selected tone.
- Return only the improved story text. Do not add headings, emojis, bullet points, or commentary.`;

    const userPrompt = `User's Raw Story:
"${story}"

Tone Selected: ${tone}

Enhance this story following all the instructions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const enhancedStory = data.choices?.[0]?.message?.content;

    if (!enhancedStory) {
      throw new Error("No content received from AI");
    }

    return new Response(
      JSON.stringify({ enhancedStory }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error enhancing story:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
