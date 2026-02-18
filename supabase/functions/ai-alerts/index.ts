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

    const { data: stats } = await supabase
      .from("analytics_stats")
      .select("*")
      .order("date", { ascending: false })
      .limit(1);

    const { data: departements } = await supabase
      .from("analytics_departement")
      .select("*");

    const { data: systemes } = await supabase
      .from("analytics_systemes")
      .select("*");

    const now = new Date();
    const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const alerts = [
      {
        id: "alert-001",
        title: "Capacite cardiologie critique",
        description: "Le service de cardiologie atteint 95% de sa capacite. Risque de saturation dans les 48h.",
        severity: "critical",
        category: "capacity",
        recommendations: [
          "Reporter les consultations non urgentes",
          "Activer le protocole de debordement vers le service B",
          "Alerter le chef de service pour planification",
        ],
        affectedMetric: "taux_occupation",
        dataContext: { current: 95, threshold: 90, trend: 3.5 },
        createdAt: now.toISOString(),
        expiresAt: inOneWeek.toISOString(),
        acknowledged: false,
      },
      {
        id: "alert-002",
        title: "Augmentation des cas a risque",
        description: "Hausse de 15% des patients a risque eleve detectee sur les 7 derniers jours.",
        severity: "high",
        category: "risk",
        recommendations: [
          "Renforcer le suivi des patients concernes",
          "Planifier des consultations de controle supplementaires",
          "Mettre a jour les protocoles de prise en charge",
        ],
        affectedMetric: "cas_risque",
        dataContext: { current: 23, previousWeek: 20, change: 15 },
        createdAt: now.toISOString(),
        expiresAt: inOneWeek.toISOString(),
        acknowledged: false,
      },
      {
        id: "alert-003",
        title: "Performance du Dr. Martin en hausse",
        description: "Le Dr. Martin a ameliore son score de satisfaction de 12% ce mois-ci.",
        severity: "low",
        category: "performance",
        recommendations: [
          "Identifier les bonnes pratiques a partager avec l equipe",
          "Considerer pour le programme de mentorat",
        ],
        createdAt: now.toISOString(),
        expiresAt: inOneWeek.toISOString(),
        acknowledged: false,
      },
      {
        id: "alert-004",
        title: "Conformite des dossiers medicaux",
        description: "12 dossiers patients incomplets detectes necessitant une mise a jour.",
        severity: "medium",
        category: "compliance",
        recommendations: [
          "Notifier les medecins concernes",
          "Planifier une session de mise a jour des dossiers",
          "Verifier les champs obligatoires manquants",
        ],
        dataContext: { incomplete: 12, total: 1247, percentage: 0.96 },
        createdAt: now.toISOString(),
        expiresAt: inOneWeek.toISOString(),
        acknowledged: false,
      },
      {
        id: "alert-005",
        title: "Tendance saisonniere detectee",
        description: "Augmentation prevue de 20% des consultations respiratoires pour le mois prochain.",
        severity: "medium",
        category: "trend",
        recommendations: [
          "Preparer les stocks de medicaments respiratoires",
          "Planifier des creneaux supplementaires en pneumologie",
          "Activer la campagne de prevention",
        ],
        affectedMetric: "consultations_pneumo",
        dataContext: { predicted: 85, current: 71, change: 20 },
        createdAt: now.toISOString(),
        expiresAt: inOneWeek.toISOString(),
        acknowledged: false,
      },
    ];

    const response = {
      alerts,
      context: {
        generatedAt: now.toISOString(),
        dataWindow: "7 derniers jours",
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
