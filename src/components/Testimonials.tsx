import React, { useEffect, useRef } from 'react';
import { Star, User, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: "Marie Kouassi",
      location: "Abidjan - Cocody",
      initials: "MK",
      rating: 5,
      text: "Monsieur Ake s'occupe de ma mère depuis sa sortie d'hospitalisation. Son professionnalisme et sa gentillesse nous ont beaucoup aidés dans cette période difficile. Je le recommande vivement.",
      gradient: "from-pink-400 to-pink-600",
      delay: "delay-100"
    },
    {
      name: "Jean-Baptiste Yao",
      location: "Bingerville",
      initials: "JY",
      rating: 5,
      text: "Suite à mon opération, Simplice a assuré mes soins quotidiens pendant plusieurs semaines. Sa ponctualité et son expertise m'ont permis de récupérer sereinement. Un grand merci !",
      gradient: "from-blue-400 to-blue-600",
      delay: "delay-200"
    },
    {
      name: "Adjoua Akissi",
      location: "Abidjan - Plateau",
      initials: "AA",
      rating: 5,
      text: "En tant que personne âgée, les visites régulières de M. Ake sont rassurantes. Il prend le temps d'expliquer chaque soin et s'assure toujours de mon confort. Un infirmier exceptionnel.",
      gradient: "from-purple-400 to-purple-600",
      delay: "delay-300"
    }
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50 fade-in-section relative overflow-hidden section-mobile section-tablet">
      {/* Background decorative elements - Hidden on mobile */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary bg-opacity-5 rounded-full animate-float hidden lg:block"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary bg-opacity-30 rounded-full animate-float hidden lg:block" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary bg-opacity-10 rounded-full animate-pulse hidden lg:block"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium mb-4">
              Témoignages
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 font-heading">
              Ce que disent mes <span className="text-gradient">patients</span>
            </h2>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La confiance de mes patients est ma plus grande récompense et ma motivation quotidienne.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`testimonial-card animate-fade-in-up ${testimonial.delay} group`}>
              {/* Quote icon */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <Quote size={window.innerWidth < 640 ? 24 : 32} className="text-primary" />
              </div>

              {/* Rating stars */}
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill="currentColor" 
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">5.0</span>
              </div>

              {/* Testimonial text */}
              <p className="text-gray-700 italic mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author info */}
              <div className="flex items-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white font-bold text-base sm:text-lg">{testimonial.initials}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{testimonial.name}</h4>
                  <p className="text-primary font-medium text-sm sm:text-base">{testimonial.location}</p>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 sm:mt-16 text-center animate-fade-in-up delay-400">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 bg-white rounded-full px-6 sm:px-8 py-4 shadow-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Star size={18} className="text-green-600" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </div>
            <div className="w-full h-px sm:w-px sm:h-12 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User size={18} className="text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">200+</div>
                <div className="text-sm text-gray-600">Patients satisfaits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;