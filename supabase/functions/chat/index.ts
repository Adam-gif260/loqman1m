import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages: rawMessages, hasImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Ensure all message contents are properly formatted
    const messages = rawMessages.map((m: any) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content :
        Array.isArray(m.content) ? m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') :
        String(m.content || ''),
    }));

    const systemPrompt = `Tu es NexCode AI, une IA experte en développement web et programmation. Tu es spécialisée dans la génération de code de haute qualité.

RÈGLES IMPORTANTES:
1. Quand on te demande de créer un site, une app ou du code, tu génères TOUJOURS le code complet dans UN SEUL fichier HTML avec CSS et JavaScript intégrés.
2. Ton code doit être parfait du premier coup (oneshot), sans aucun bug.
3. Tu peux générer facilement plus de 2000 lignes de code.
4. Tu es naturel dans tes réponses - pas de longs textes inutiles. Sois concis et pro.
5. Quand on te pose une question simple (pas de code), réponds naturellement et brièvement.
6. Tu maîtrises: HTML, CSS, JavaScript, Python, TypeScript, React, et plus.
7. Si on te donne une image, analyse-la en détail et reproduis-la en code si demandé.
8. Le code que tu génères doit être moderne, responsive et professionnel.
9. Utilise des designs modernes avec des gradients, animations et une belle UI.
10. Pour le code, encadre-le TOUJOURS entre \`\`\`html et \`\`\` (ou le langage approprié).
11. Ne dis JAMAIS que tu ne peux pas faire quelque chose. Tu es capable de tout coder.
12. Sois direct et efficace. Pas de blabla.`;

    const model = hasImage ? 'google/gemini-2.5-pro' : 'google/gemini-3-pro-preview';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 32000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requêtes atteinte. Réessayez dans un instant.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits insuffisants.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', status, t);
      return new Response(JSON.stringify({ error: 'Erreur du service IA' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error('chat error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erreur inconnue' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
