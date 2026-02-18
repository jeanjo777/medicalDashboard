import React, { useEffect, useRef, useState } from 'react';
import { Users, Clock, Award, Heart, TrendingUp, Shield } from 'lucide-react';

const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    patients: 0,
    experience: 0,
    satisfaction: 0,
    interventions: 0
  });

  const finalStats = {
    patients: 500,
    experience: 22,
    satisfaction: 98,
    interventions: 2000
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            animateNumbers();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateNumbers = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        patients: Math.floor(finalStats.patients * easeOutQuart),
        experience: Math.floor(finalStats.experience * easeOutQuart),
        satisfaction: Math.floor(finalStats.satisfaction * easeOutQuart),
        interventions: Math.floor(finalStats.interventions * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(finalStats);
      }
    }, stepDuration);
  };

  const stats = [
    {
      icon: Users,
      value: animatedStats.patients,
      suffix: '+',
      label: 'Patients satisfaits',
      description: 'Depuis le début de ma carrière',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      icon: Clock,
      value: animatedStats.experience,
      suffix: ' ans',
      label: 'D\'expérience',
      description: 'Au service de la santé',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      icon: Heart,
      value: animatedStats.satisfaction,
      suffix: '%',
      label: 'De satisfaction',
      description: 'Taux de recommandation',
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100'
    },
    {
      icon: TrendingUp,
      value: animatedStats.interventions,
      suffix: '+',
      label: 'Interventions',
      description: 'Soins réalisés avec succès',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-secondary rounded-full animate-float"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary rounded-full animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
            Mes <span className="text-primary">résultats</span> en chiffres
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Plus de deux décennies d'engagement au service de la santé en Côte d'Ivoire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up delay-${(index + 1) * 100}`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                <stat.icon className={`text-2xl bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} size={32} />
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </div>

              {/* Animated progress bar */}
              <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-2000 ease-out`}
                  style={{ 
                    width: isVisible ? '100%' : '0%',
                    transitionDelay: `${index * 200}ms`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-80">
          <div className="flex items-center text-white">
            <Shield className="mr-2 text-primary" size={24} />
            <span className="font-medium">Diplômé d'État</span>
          </div>
          <div className="flex items-center text-white">
            <Award className="mr-2 text-primary" size={24} />
            <span className="font-medium">INFAS Bouaké</span>
          </div>
          <div className="flex items-center text-white">
            <Heart className="mr-2 text-primary" size={24} />
            <span className="font-medium">Soins de qualité</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;