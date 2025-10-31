import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token pricing per 1M tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
  'openai/gpt-5': { input: 2.50, output: 10.00 },
  'google/gemini-2.5-pro': { input: 1.25, output: 5.00 },
  'google/gemini-2.5-flash': { input: 0.075, output: 0.30 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = 'claude-sonnet-4-5', userId } = await req.json();
    
    const isClaude = model === 'claude-sonnet-4-5';
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!isClaude && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    if (isClaude && !ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    console.log(`AI Chat request for user ${userId} with model ${model}`);

    let response;
    let responseData: any;

    if (isClaude) {
      // Use Anthropic API for Claude
      const systemMessage = messages.find((m: any) => m.role === 'system');
      const userMessages = messages.filter((m: any) => m.role !== 'system');

      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8096,
          system: systemMessage?.content || `You are an expert coding assistant. Help users build their applications by:
- Providing clear, actionable code examples
- Explaining technical concepts simply
- Suggesting best practices and optimal architectures
- Writing clean, production-ready code
Keep responses focused, practical, and developer-friendly.`,
          messages: userMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Anthropic API error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "AI service error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      
      // Calculate cost
      const pricing = MODEL_PRICING[model];
      const inputCost = (data.usage?.input_tokens || 0) * pricing.input / 1000000;
      const outputCost = (data.usage?.output_tokens || 0) * pricing.output / 1000000;
      const totalCost = inputCost + outputCost;

      console.log(`Token usage - Input: ${data.usage?.input_tokens}, Output: ${data.usage?.output_tokens}, Cost: $${totalCost.toFixed(6)}`);

      responseData = {
        choices: [{
          message: {
            role: "assistant",
            content: data.content[0].text,
          }
        }],
        cost: {
          input_tokens: data.usage?.input_tokens || 0,
          output_tokens: data.usage?.output_tokens || 0,
          total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
          cost_usd: totalCost,
        }
      };
    } else {
      // Use Lovable AI Gateway for other models
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: "system", 
              content: `You are an expert coding assistant. Help users build their applications by:
- Providing clear, actionable code examples
- Explaining technical concepts simply
- Suggesting best practices and optimal architectures
- Writing clean, production-ready code
Keep responses focused, practical, and developer-friendly.` 
            },
            ...messages,
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
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
      const usage = data.usage || {};
      
      // Calculate cost
      const pricing = MODEL_PRICING[model] || MODEL_PRICING['google/gemini-2.5-flash'];
      const inputCost = (usage.prompt_tokens || 0) * pricing.input / 1000000;
      const outputCost = (usage.completion_tokens || 0) * pricing.output / 1000000;
      const totalCost = inputCost + outputCost;

      console.log(`Token usage - Input: ${usage.prompt_tokens}, Output: ${usage.completion_tokens}, Cost: $${totalCost.toFixed(6)}`);

      responseData = {
        ...data,
        cost: {
          input_tokens: usage.prompt_tokens || 0,
          output_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0,
          cost_usd: totalCost,
        }
      };
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
