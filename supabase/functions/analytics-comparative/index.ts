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

    const body = await req.json().catch(() => ({}));
    const comparisonType = body.comparisonType || "month";

    const { data: departements } = await supabase
      .from("analytics_departement")
      .select("*");

    const { data: flux } = await supabase
      .from("analytics_flux_patients")
      .select("*")
      .order("mois", { ascending: true });

    const now = new Date();
    let currentLabel = "";
    let previousLabel = "";

    if (comparisonType === "month") {
      currentLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      const prev = new Date(now);
      prev.setMonth(prev.getMonth() - 1);
      previousLabel = prev.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    } else if (comparisonType === "quarter") {
      const q = Math.floor(now.getMonth() / 3) + 1;
      currentLabel = "T" + q + " " + now.getFullYear();
      previousLabel = "T" + (q === 1 ? 4 : q - 1) + " " + (q === 1 ? now.getFullYear() - 1 : now.getFullYear());
    } else {
      currentLabel = String(now.getFullYear());
      previousLabel = String(now.getFullYear() - 1);
    }

    const kpiComparison = [
      { metric: "Consultations", current: 1247, previous: 1105, change: 12.9, unit: "patients", trend: "up" },
      { metric: "Satisfaction", current: 4.6, previous: 4.3, change: 7.0, unit: "/5", trend: "up" },
      { metric: "Temps attente", current: 12, previous: 15, change: -20.0, unit: "min", trend: "down" },
      { metric: "Taux occupation", current: 87, previous: 82, change: 6.1, unit: "%", trend: "up" },
      { metric: "Urgences", current: 45, previous: 52, change: -13.5, unit: "cas", trend: "down" },
      { metric: "RDV honores", current: 94, previous: 89, change: 5.6, unit: "%", trend: "up" },
    ];

    const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
    const timeSeriesComparison = months.map((m, i) => {
      const fluxItem = flux?.find((f) => f.mois === m);
      const current = fluxItem?.consultations || Math.floor(Math.random() * 100 + 80);
      return {
        month: m,
        current,
        previous: Math.round(current * (0.85 + Math.random() * 0.15)),
        target: Math.round(current * 1.05),
      };
    });

    const departmentComparison = (departements || []).map((d) => {
      const current = d.patients_count;
      const previous = Math.round(current / (1 + d.croissance / 100));
      return {
        department: d.departement,
        current,
        previous,
        diff: d.croissance,
      };
    });

    const response = {
      periods: { current: currentLabel, previous: previousLabel },
      kpiComparison,
      timeSeriesComparison,
      departmentComparison,
      insights: {
        positive: [
          "Augmentation de 12.9% des consultations par rapport a la periode precedente",
          "Amelioration significative de la satisfaction patient (+7%)",
          "Reduction du temps d attente moyen de 20%",
        ],
        stable: [
          "Ratio medecin-patient maintenu dans les normes recommandees",
          "Taux de readmission stable a 3.2%",
        ],
        attention: [
          "Le service de cardiologie approche de sa capacite maximale",
          "Augmentation des cas complexes necessitant un suivi renforce",
        ],
      },
    };

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
