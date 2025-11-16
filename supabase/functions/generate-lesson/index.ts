import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { question } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating lesson for question:", question);

    const systemPrompt = `You are an expert tutor for MwalimuSmart. When given a student question, break it down into clear, educational steps that help them understand the concept deeply.

Return your response as a JSON object with this structure:
{
  "title": "A clear, descriptive title for the lesson",
  "steps": [
    {
      "id": "1",
      "text": "Clear explanation of this step (1-3 sentences)",
      "duration": 3
    }
  ],
  "summary": "Brief summary of the key takeaways"
}

Guidelines:
- Create 4-6 steps for most concepts
- Each step should be clear and build on the previous one
- Use simple language appropriate for secondary school students
- Duration should be 2-5 seconds per step based on complexity
- Focus on understanding, not just memorization`;

    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "create_lesson",
            description: "Generate a structured lesson with step-by-step explanation",
            parameters: {
              type: "object",
              properties: {
                title: { 
                  type: "string",
                  description: "A clear, descriptive title for the lesson"
                },
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      text: { type: "string", description: "Clear explanation (1-3 sentences)" },
                      duration: { type: "number", description: "Duration in seconds (2-5)" }
                    },
                    required: ["id", "text", "duration"],
                    additionalProperties: false
                  },
                  minItems: 4,
                  maxItems: 8
                },
                summary: {
                  type: "string",
                  description: "Brief summary of key takeaways"
                }
              },
              required: ["title", "steps", "summary"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "create_lesson" } }
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate lesson" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the structured output from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", data);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonData = JSON.parse(toolCall.function.arguments);
    console.log("Generated lesson:", lessonData);

    // Save lesson to database
    const { data: savedLesson, error: saveError } = await supabase
      .from('lessons')
      .insert({
        user_id: user.id,
        question,
        title: lessonData.title,
        steps: lessonData.steps,
        summary: lessonData.summary,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving lesson:", saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify({ ...lessonData, id: savedLesson.id, question }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-lesson function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
