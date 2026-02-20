import React, { useEffect, useRef, useState } from 'react';
import { Users, Clock, Heart, TrendingUp } from 'lucide-react';

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
    const duration = 2000;
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
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      accent: 'from-blue-500 to-blue-400',
      glowColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
      icon: Clock,
      value: animatedStats.experience,
      suffix: ' ans',
      label: "D'expérience",
      description: 'Au service de la santé',
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10',
      accent: 'from-teal-500 to-teal-400',
      glowColor: 'rgba(20, 184, 166, 0.3)'
    },
    {
      icon: Heart,
      value: animatedStats.satisfaction,
      suffix: '%',
      label: 'De satisfaction',
      description: 'Taux de recommandation',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
      accent: 'from-rose-500 to-rose-400',
      glowColor: 'rgba(244, 63, 94, 0.3)'
    },
    {
      icon: TrendingUp,
      value: animatedStats.interventions,
      suffix: '+',
      label: 'Interventions',
      description: 'Soins réalisés avec succès',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      accent: 'from-purple-500 to-purple-400',
      glowColor: 'rgba(168, 85, 247, 0.3)'
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-gray-900 relative overflow-hidden">
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>

      {/* Animated gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-3xl animate-morph"></div>
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-blue-500/5 rounded-full blur-3xl animate-morph" style={{ animationDelay: '-3s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-teal-300 rounded-full text-sm font-medium mb-5">
            Nos résultats
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            En <span className="text-gradient-animated">chiffres</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Plus de deux décennies d'engagement au service de la santé
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group animate-slide-up-spring"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 card-shine relative overflow-hidden">
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ boxShadow: `inset 0 0 40px ${stat.glowColor}` }}
                ></div>

                <div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 icon-hover-spin relative z-10`}>
                  <stat.icon className={stat.iconColor} size={28} />
                </div>

                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 relative z-10">
                  {stat.value}{stat.suffix}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1 relative z-10">{stat.label}</h3>
                <p className="text-gray-500 text-xs sm:text-sm relative z-10">{stat.description}</p>

                {/* Progress bar */}
                <div className="mt-5 bg-white/5 rounded-full h-1.5 overflow-hidden relative z-10">
                  <div
                    className={`h-full bg-gradient-to-r ${stat.accent} rounded-full transition-all duration-2000 ease-out`}
                    style={{
                      width: isVisible ? '100%' : '0%',
                      transitionDelay: `${index * 200}ms`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
