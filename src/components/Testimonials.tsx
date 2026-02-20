import React, { useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';

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
      gradient: "from-rose-400 to-rose-600"
    },
    {
      name: "Jean-Baptiste Yao",
      location: "Bingerville",
      initials: "JY",
      rating: 5,
      text: "Suite à mon opération, Simplice a assuré mes soins quotidiens pendant plusieurs semaines. Sa ponctualité et son expertise m'ont permis de récupérer sereinement. Un grand merci !",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      name: "Adjoua Akissi",
      location: "Abidjan - Plateau",
      initials: "AA",
      rating: 5,
      text: "En tant que personne âgée, les visites régulières de M. Ake sont rassurantes. Il prend le temps d'expliquer chaque soin et s'assure toujours de mon confort. Un infirmier exceptionnel.",
      gradient: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 fade-in-section relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
              Témoignages
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
              Ce que disent mes <span className="text-teal-700">patients</span>
            </h2>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La confiance de mes patients est ma plus grande récompense et ma motivation quotidienne.
            </p>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group animate-fade-in-up`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="relative bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 h-full hover:shadow-xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-1">
                {/* Quote icon */}
                <div className="mb-5">
                  <div className="w-10 h-10 bg-teal-50 border border-teal-200/50 rounded-xl flex items-center justify-center">
                    <Quote size={18} className="text-teal-600" />
                  </div>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" className="text-amber-400" />
                  ))}
                  <span className="text-sm text-gray-400 font-medium ml-2">5.0</span>
                </div>

                {/* Testimonial text */}
                <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                  "{testimonial.text}"
                </p>

                {/* Author info */}
                <div className="flex items-center pt-5 border-t border-gray-100">
                  <div className={`w-11 h-11 bg-gradient-to-br ${testimonial.gradient} rounded-xl flex items-center justify-center mr-3 shadow-sm`}>
                    <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-teal-600 text-xs font-medium">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-12 sm:mt-16 animate-fade-in-up delay-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200/50 rounded-xl flex items-center justify-center">
                <Star size={20} className="text-amber-500 fill-amber-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">4.9/5</div>
                <div className="text-xs text-gray-500">Note moyenne</div>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {testimonials.map((t, i) => (
                  <div key={i} className={`w-9 h-9 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-bold`}>
                    {t.initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">200+</div>
                <div className="text-xs text-gray-500">Patients satisfaits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
