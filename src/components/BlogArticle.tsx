import React, { useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, Eye, User, Share2, Heart, Shield, Thermometer, Stethoscope } from 'lucide-react';
import { sanitizeHtml } from '../utils/sanitize';

interface BlogArticleProps {
  articleId: string;
  onBack: () => void;
}

const BlogArticle: React.FC<BlogArticleProps> = ({ articleId, onBack }) => {
  const articles = {
    'suivi-seniors': {
      title: "L'importance du suivi médical à domicile pour les personnes âgées",
      category: "Soins aux seniors",
      icon: Heart,
      date: "15 Janvier 2025",
      readTime: "5 min",
      views: 245,
      image: "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      content: `
        <p class="text-lg text-gray-700 mb-6 leading-relaxed">
          Le vieillissement de la population en Côte d'Ivoire, comme partout dans le monde, pose de nouveaux défis en matière de soins de santé. 
          Le suivi médical à domicile représente une solution innovante et humaine pour accompagner nos aînés dans leur quotidien.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Pourquoi privilégier les soins à domicile ?</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">1. Maintien de l'autonomie</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Rester dans son environnement familier permet aux personnes âgées de conserver leurs repères et leur indépendance. 
          Les soins à domicile favorisent le maintien des habitudes de vie et réduisent le stress lié au déplacement.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">2. Prévention des hospitalisations</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Un suivi régulier permet de détecter précocement les signes de détérioration de l'état de santé. 
          Cette surveillance proactive peut éviter jusqu'à 30% des hospitalisations d'urgence chez les seniors.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3. Personnalisation des soins</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          À domicile, l'infirmier peut adapter ses interventions à l'environnement et aux habitudes du patient, 
          offrant ainsi des soins plus personnalisés et efficaces.
        </p>

        <div class="bg-blue-50 border-l-4 border-primary p-6 mb-6">
          <h3 class="text-lg font-semibold text-primary mb-2">💡 Le saviez-vous ?</h3>
          <p class="text-gray-700">
            Les études montrent que les patients suivis à domicile ont une meilleure observance thérapeutique 
            et une qualité de vie supérieure comparés à ceux suivis uniquement en consultation.
          </p>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Les services essentiels</h2>
        
        <ul class="space-y-3 mb-6">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Surveillance des paramètres vitaux :</strong> tension artérielle, glycémie, saturation</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Gestion des médicaments :</strong> préparation des piluliers, surveillance de l'observance</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Soins d'hygiène :</strong> aide à la toilette, prévention des escarres</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Éducation thérapeutique :</strong> conseils adaptés au patient et à sa famille</span>
          </li>
        </ul>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Mon approche personnalisée</h2>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Avec plus de 20 ans d'expérience, j'ai développé une approche holistique qui prend en compte 
          non seulement les besoins médicaux, mais aussi les aspects psychologiques et sociaux du vieillissement.
        </p>
        
        <p class="text-gray-700 mb-6 leading-relaxed">
          Chaque plan de soins est élaboré en collaboration avec le médecin traitant, le patient et sa famille, 
          garantissant une prise en charge coordonnée et efficace.
        </p>

        <div class="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-green-800 mb-2">📞 Besoin d'un suivi à domicile ?</h3>
          <p class="text-green-700 mb-4">
            N'hésitez pas à me contacter pour discuter des besoins spécifiques de votre proche âgé. 
            Une évaluation personnalisée permet de définir le plan de soins le plus adapté.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <a href="tel:+2250505831146" class="bg-green-600 text-white px-4 py-2 rounded-lg text-center hover:bg-green-700 transition-colors">
              Appelez-moi : 05 05 83 11 46
            </a>
            <a href="https://wa.me/2250505831146" class="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center hover:bg-green-200 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      `
    },
    'prevention-infections': {
      title: "Prévention des infections : bonnes pratiques d'hygiène à domicile",
      category: "Prévention",
      icon: Shield,
      date: "10 Janvier 2025",
      readTime: "4 min",
      views: 189,
      image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      content: `
        <p class="text-lg text-gray-700 mb-6 leading-relaxed">
          La prévention des infections lors des soins à domicile est cruciale pour la sécurité du patient et de l'entourage. 
          Voici les bonnes pratiques essentielles que j'applique systématiquement.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">L'hygiène des mains : la base de tout</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Quand se laver les mains ?</h3>
        <ul class="space-y-2 mb-4">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Avant et après chaque contact avec le patient</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Avant tout geste aseptique (injection, pansement)</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Après contact avec l'environnement du patient</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Après retrait des gants</span>
          </li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Technique de lavage</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          Le lavage doit durer au minimum 30 secondes avec du savon, ou 15 secondes avec une solution hydroalcoolique. 
          N'oubliez pas les espaces entre les doigts, les pouces et les poignets.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Préparation de l'environnement</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Zone de soins</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Je prépare toujours une surface propre et désinfectée pour poser le matériel. 
          Cette zone doit être éloignée des sources de contamination (animaux, nourriture, etc.).
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Matériel stérile</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          Tout le matériel utilisé est à usage unique ou correctement stérilisé. 
          Les emballages ne sont ouverts qu'au moment de l'utilisation.
        </p>

        <div class="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
          <h3 class="text-lg font-semibold text-red-700 mb-2">⚠️ Attention</h3>
          <p class="text-red-700">
            Ne jamais réutiliser du matériel à usage unique. Cela représente un risque majeur d'infection 
            pour le patient et peut avoir des conséquences graves.
          </p>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Gestion des déchets</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Tri sélectif médical</h3>
        <ul class="space-y-3 mb-6">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Conteneur jaune :</strong> déchets infectieux (compresses souillées, seringues)</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Conteneur rouge :</strong> objets piquants/tranchants (aiguilles, lames)</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Sac noir :</strong> déchets non contaminés (emballages, gants propres)</span>
          </li>
        </ul>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Conseils pour les familles</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Avant la visite de l'infirmier</h3>
        <ul class="space-y-2 mb-4">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Aérer la pièce où auront lieu les soins</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Nettoyer et désinfecter une surface plane</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Éloigner les animaux domestiques</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Prévoir un point d'eau avec savon</span>
          </li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Après les soins</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          La zone de soins doit être nettoyée et désinfectée. Je m'occupe de l'élimination des déchets médicaux 
          selon les protocoles en vigueur.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">🛡️ Votre sécurité, ma priorité</h3>
          <p class="text-blue-700 mb-4">
            J'applique rigoureusement tous ces protocoles d'hygiène pour garantir votre sécurité et celle de vos proches. 
            N'hésitez pas à me poser des questions sur les mesures d'hygiène lors de ma visite.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <a href="tel:+2250505831146" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors">
              Questions ? Appelez-moi
            </a>
          </div>
        </div>
      `
    },
    'surveillance-glycemie': {
      title: "Surveillance de la glycémie : conseils pratiques pour les diabétiques",
      category: "Diabète",
      icon: Thermometer,
      date: "5 Janvier 2025",
      readTime: "6 min",
      views: 312,
      image: "https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      content: `
        <p class="text-lg text-gray-700 mb-6 leading-relaxed">
          La surveillance régulière de la glycémie est essentielle pour bien gérer son diabète. 
          Voici mes conseils pratiques pour un autocontrôle efficace et sécurisé.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Comprendre les valeurs glycémiques</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Valeurs de référence</h3>
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <ul class="space-y-2">
            <li class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-700 font-medium">À jeun (normal)</span>
              <span class="text-green-600 font-semibold">0,70 - 1,10 g/L</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-700 font-medium">2h après repas (normal)</span>
              <span class="text-green-600 font-semibold">< 1,40 g/L</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-700 font-medium">Diabète (à jeun)</span>
              <span class="text-red-600 font-semibold">≥ 1,26 g/L</span>
            </li>
            <li class="flex justify-between items-center py-2">
              <span class="text-gray-700 font-medium">Hypoglycémie</span>
              <span class="text-orange-600 font-semibold">< 0,70 g/L</span>
            </li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Technique de prélèvement</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Préparation</h3>
        <ol class="space-y-2 mb-4 list-decimal list-inside">
          <li class="text-gray-700">Se laver les mains à l'eau tiède et au savon</li>
          <li class="text-gray-700">Sécher soigneusement avec une serviette propre</li>
          <li class="text-gray-700">Préparer le lecteur de glycémie et une bandelette</li>
          <li class="text-gray-700">Vérifier la date de péremption des bandelettes</li>
        </ol>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Prélèvement</h3>
        <ol class="space-y-2 mb-6 list-decimal list-inside">
          <li class="text-gray-700">Piquer sur le côté du bout du doigt (moins douloureux)</li>
          <li class="text-gray-700">Masser légèrement pour faire perler une goutte de sang</li>
          <li class="text-gray-700">Déposer la goutte sur la bandelette sans appuyer</li>
          <li class="text-gray-700">Attendre le résultat et noter la valeur</li>
        </ol>

        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
          <h3 class="text-lg font-semibold text-yellow-700 mb-2">💡 Astuce professionnelle</h3>
          <p class="text-yellow-700">
            Alternez les doigts et les côtés pour éviter la formation de cals. 
            Les doigts tièdes donnent plus facilement du sang - frottez-les ou passez-les sous l'eau tiède.
          </p>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Quand contrôler sa glycémie ?</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Diabète de type 1</h3>
        <ul class="space-y-2 mb-4">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Avant chaque repas et au coucher</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">En cas de symptômes d'hypoglycémie</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Avant et après un effort physique</span>
          </li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Diabète de type 2</h3>
        <ul class="space-y-2 mb-6">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">À jeun et 2h après les repas principaux</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Selon les recommandations de votre médecin</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">En cas de maladie ou de stress</span>
          </li>
        </ul>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Interpréter les résultats</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Hypoglycémie (< 0,70 g/L)</h3>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-700 mb-2"><strong>Symptômes :</strong> tremblements, sueurs, palpitations, faim</p>
          <p class="text-red-700"><strong>Action :</strong> Prendre 15g de sucre rapide, recontrôler après 15 minutes</p>
        </div>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Hyperglycémie (> 2,50 g/L)</h3>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p class="text-orange-700 mb-2"><strong>Symptômes :</strong> soif intense, urines fréquentes, fatigue</p>
          <p class="text-orange-700"><strong>Action :</strong> Boire de l'eau, contrôler les cétones, contacter le médecin</p>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Carnet de surveillance</h2>
        
        <p class="text-gray-700 mb-4 leading-relaxed">
          Tenir un carnet de surveillance est essentiel pour :
        </p>
        <ul class="space-y-2 mb-6">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Identifier les tendances et les facteurs influençant la glycémie</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Ajuster le traitement avec votre médecin</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Préparer les consultations médicales</span>
          </li>
        </ul>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Facteurs influençant la glycémie</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="font-semibold text-red-700 mb-2">Facteurs d'augmentation</h4>
            <ul class="text-red-700 text-sm space-y-1">
              <li>• Repas riches en glucides</li>
              <li>• Stress, maladie</li>
              <li>• Manque d'activité physique</li>
              <li>• Oubli de médicament</li>
            </ul>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 class="font-semibold text-green-700 mb-2">Facteurs de diminution</h4>
            <ul class="text-green-700 text-sm space-y-1">
              <li>• Activité physique</li>
              <li>• Repas sauté ou retardé</li>
              <li>• Surdosage médicamenteux</li>
              <li>• Consommation d'alcool</li>
            </ul>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">🩺 Accompagnement personnalisé</h3>
          <p class="text-blue-700 mb-4">
            Je peux vous accompagner dans l'apprentissage de l'autocontrôle glycémique et vous aider à interpréter vos résultats. 
            Un suivi régulier permet d'optimiser l'équilibre de votre diabète.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <a href="tel:+2250505831146" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors">
              Prendre rendez-vous
            </a>
            <a href="https://wa.me/2250505831146" class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-center hover:bg-blue-200 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      `
    },
    'post-operatoire': {
      title: "Post-opératoire : optimiser sa récupération à domicile",
      category: "Post-opératoire",
      icon: Stethoscope,
      date: "28 Décembre 2024",
      readTime: "7 min",
      views: 156,
      image: "https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      content: `
        <p class="text-lg text-gray-700 mb-6 leading-relaxed">
          La période post-opératoire est cruciale pour une récupération optimale. Un suivi infirmier à domicile 
          permet d'assurer une convalescence sereine tout en prévenant les complications.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Les premières 48 heures</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Surveillance prioritaire</h3>
        <ul class="space-y-3 mb-6">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Signes vitaux :</strong> température, tension artérielle, fréquence cardiaque</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>État de la cicatrice :</strong> saignement, inflammation, écoulement</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Douleur :</strong> intensité, localisation, efficacité des antalgiques</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700"><strong>Transit intestinal :</strong> reprise progressive après anesthésie</span>
          </li>
        </ul>

        <div class="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
          <h3 class="text-lg font-semibold text-red-700 mb-2">🚨 Signes d'alerte</h3>
          <p class="text-red-700 mb-2">Contactez immédiatement votre médecin ou moi-même si vous observez :</p>
          <ul class="text-red-700 space-y-1">
            <li>• Fièvre > 38,5°C</li>
            <li>• Saignement important de la cicatrice</li>
            <li>• Douleur intense non soulagée</li>
            <li>• Gonflement, rougeur, chaleur autour de la plaie</li>
            <li>• Essoufflement, douleur thoracique</li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Soins de la cicatrice</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Pansements et nettoyage</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Je réalise les pansements selon les prescriptions chirurgicales, en respectant l'asepsie stricte. 
          La fréquence varie selon le type d'intervention et l'évolution de la cicatrisation.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Évolution normale</h3>
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <ul class="space-y-2">
            <li class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-700 font-medium">Jour 1-3</span>
              <span class="text-gray-600">Œdème et rougeur modérés</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-700 font-medium">Jour 4-7</span>
              <span class="text-gray-600">Diminution de l'inflammation</span>
            </li>
            <li class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-700 font-medium">Jour 8-15</span>
              <span class="text-gray-600">Formation de la croûte</span>
            </li>
            <li class="flex justify-between items-center py-2">
              <span class="text-gray-700 font-medium">Après J15</span>
              <span class="text-gray-600">Cicatrisation consolidée</span>
            </li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Gestion de la douleur</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Médicaments antalgiques</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Le respect des horaires de prise est essentiel pour maintenir un niveau d'antalgie efficace. 
          Je surveille l'efficacité du traitement et adapte si nécessaire avec le médecin.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Méthodes non médicamenteuses</h3>
        <ul class="space-y-2 mb-6">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Application de froid (selon prescription)</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Positionnement adapté pour soulager</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Techniques de relaxation et respiration</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Environnement calme et reposant</span>
          </li>
        </ul>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Mobilisation et rééducation</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Lever précoce</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Sauf contre-indication, la mobilisation précoce est encouragée pour prévenir les complications 
          (phlébite, pneumonie, fonte musculaire). Je vous accompagne dans les premiers levers.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Exercices respiratoires</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          Particulièrement importants après chirurgie abdominale ou thoracique, ces exercices préviennent 
          les complications pulmonaires et favorisent l'oxygénation.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Alimentation et hydratation</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Reprise alimentaire progressive</h3>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <ol class="space-y-2 list-decimal list-inside text-green-700">
            <li>Liquides clairs (eau, tisanes, bouillons)</li>
            <li>Liquides épais (compotes, yaourts)</li>
            <li>Aliments mous (purées, soupes)</li>
            <li>Retour progressif à l'alimentation normale</li>
          </ol>
        </div>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Hydratation</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          Maintenir une hydratation suffisante (1,5-2L/jour) favorise la cicatrisation et prévient 
          la constipation post-opératoire. Je surveille les apports et les éliminations.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Prévention des complications</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Thrombose veineuse</h3>
        <ul class="space-y-2 mb-4">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Port de bas de contention si prescrits</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Mobilisation régulière des membres inférieurs</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Injections d'anticoagulants si prescrits</span>
          </li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Infection</h3>
        <ul class="space-y-2 mb-6">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Hygiène rigoureuse des mains</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Soins de cicatrice aseptiques</span>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span class="text-gray-700">Surveillance des signes infectieux</span>
          </li>
        </ul>

        <h2 class="text-2xl font-bold text-gray-900 mb-4 font-heading">Retour à l'autonomie</h2>
        
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Éducation du patient et de la famille</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Je vous enseigne progressivement les gestes d'auto-soins : surveillance de la cicatrice, 
          prise des médicaments, reconnaissance des signes d'alerte.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">Planification de la sortie de soins</h3>
        <p class="text-gray-700 mb-6 leading-relaxed">
          La fin du suivi infirmier est programmée en accord avec le chirurgien, quand l'autonomie 
          est retrouvée et les risques de complications écartés.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">🏥 Suivi post-opératoire personnalisé</h3>
          <p class="text-blue-700 mb-4">
            Chaque intervention nécessite un suivi adapté. Je travaille en étroite collaboration avec votre chirurgien 
            pour vous offrir les meilleurs soins durant votre convalescence.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <a href="tel:+2250505831146" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors">
              Organiser le suivi : 05 05 83 11 46
            </a>
            <a href="https://wa.me/2250505831146" class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-center hover:bg-blue-200 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      `
    }
  };

  const article = articles[articleId as keyof typeof articles];
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <button onClick={onBack} className="btn-primary">
            Retour au blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-gray-50 py-4 sticky top-0 z-10 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center text-primary hover:text-blue-600 transition-colors duration-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour au blog
          </button>
        </div>
      </div>

      {/* Hero section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Article meta overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-center mb-4">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mr-4">
                <article.icon className="text-white mr-2" size={16} />
                <span className="text-sm font-medium">{article.category}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{article.readTime} de lecture</span>
                </div>
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{article.views} vues</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Author info */}
          <div className="flex items-center mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold text-xl">AS</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ake Achi Simplice</h3>
              <p className="text-gray-600">Infirmier Diplômé d'État • 20+ ans d'expérience</p>
              <p className="text-sm text-gray-500">Publié le {article.date}</p>
            </div>
            <div className="ml-auto">
              <button className="flex items-center text-primary hover:text-blue-600 transition-colors">
                <Share2 size={20} className="mr-2" />
                Partager
              </button>
            </div>
          </div>

          {/* Article body - sanitized to prevent XSS */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
          />

          {/* Related articles CTA */}
          <div className="mt-12 p-6 bg-gradient-to-r from-primary to-blue-600 rounded-lg text-white text-center">
            <h3 className="text-xl font-bold mb-2">Besoin de conseils personnalisés ?</h3>
            <p className="mb-4 opacity-90">
              N'hésitez pas à me contacter pour discuter de vos besoins spécifiques en matière de soins.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+2250505831146"
                className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Appelez-moi : 05 05 83 11 46
              </a>
              <a
                href="https://wa.me/2250505831146"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogArticle;