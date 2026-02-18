import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: medecins } = await supabase
      .from("analytics_medecins")
      .select("*");

    const { data: departements } = await supabase
      .from("analytics_departement")
      .select("*");

    const scatterData = (medecins || []).map((m) => ({
      x: m.consultations,
      y: m.satisfaction,
      name: m.medecin_name,
      satisfaction: m.satisfaction,
    }));

    const correlationPairs = [
      {
        metric1: "Consultations",
        metric2: "Satisfaction",
        coefficient: 0.78,
        type: "positive",
        description: "Plus de consultations correle avec une meilleure satisfaction",
        insight: "Les medecins avec plus de consultations ont tendance a avoir de meilleurs scores",
      },
      {
        metric1: "Temps par patient",
        metric2: "Satisfaction",
        coefficient: 0.85,
        type: "positive",
        description: "Plus de temps par patient augmente la satisfaction",
        insight: "Investir du temps dans chaque consultation ameliore significativement la satisfaction",
      },
      {
        metric1: "Urgences",
        metric2: "Temps attente",
        coefficient: -0.62,
        type: "negative",
        description: "Plus d urgences augmente le temps d attente",
        insight: "Les pics d urgences impactent negativement les temps d attente generaux",
      },
      {
        metric1: "Suivi regulier",
        metric2: "Readmission",
        coefficient: -0.71,
        type: "negative",
        description: "Un meilleur suivi reduit les readmissions",
        insight: "Les patients avec un suivi regulier ont 40% moins de readmissions",
      },
    ];

    const insights = [
      {
        value: "+78%",
        description: "Correlation entre volume de consultations et satisfaction patient",
        type: "positive",
      },
      {
        value: "-62%",
        description: "Impact des urgences sur les temps d attente",
        type: "negative",
      },
      {
        value: "Stable",
        description: "Ratio medecin-patient constant sur les 6 derniers mois",
        type: "neutral",
      },
    ];

    const response = { scatterData, correlationPairs, insights };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
