import React, { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

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

  const goTo = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goPrev = () => goTo((activeIndex - 1 + testimonials.length) % testimonials.length);
  const goNext = () => goTo((activeIndex + 1) % testimonials.length);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 section-reveal relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
              Témoignages
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
              Ce que disent mes <span className="text-gradient-animated">patients</span>
            </h2>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La confiance de mes patients est ma plus grande récompense et ma motivation quotidienne.
            </p>
          </div>
        </div>

        {/* Desktop: All cards visible with active highlight */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group animate-slide-up-spring cursor-pointer transition-all duration-500 ${
                activeIndex === index ? 'scale-105 z-10' : 'scale-100 opacity-80 hover:opacity-100'
              }`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
              onClick={() => goTo(index)}
            >
              <div className={`relative bg-white rounded-2xl border p-6 sm:p-8 h-full transition-all duration-500 card-shine overflow-hidden ${
                activeIndex === index
                  ? 'border-teal-200 shadow-xl shadow-teal-100/50'
                  : 'border-gray-100 hover:shadow-lg hover:border-gray-200'
              }`}>
                {/* Active indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500 ${
                  activeIndex === index ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}></div>

                <div className="mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    activeIndex === index ? 'bg-teal-50 border border-teal-200/50' : 'bg-gray-50 border border-gray-200/50'
                  }`}>
                    <Quote size={18} className={activeIndex === index ? 'text-teal-600' : 'text-gray-400'} />
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" className="text-amber-400" />
                  ))}
                  <span className="text-sm text-gray-400 font-medium ml-2">5.0</span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center pt-5 border-t border-gray-100">
                  <div className={`w-11 h-11 bg-gradient-to-br ${testimonial.gradient} rounded-xl flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
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

        {/* Mobile: Single card carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden rounded-2xl">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  activeIndex === index
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 absolute inset-0 translate-x-full'
                }`}
              >
                <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-lg">
                  <div className="mb-4">
                    <Quote size={18} className="text-teal-600" />
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" className="text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center pt-4 border-t border-gray-100">
                    <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-xl flex items-center justify-center mr-3`}>
                      <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                      <p className="text-teal-600 text-xs">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile nav arrows */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button type="button" onClick={goPrev} aria-label="Témoignage précédent" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Témoignage ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === i ? 'w-6 bg-teal-500' : 'w-2 bg-gray-300'
                  }`}
                ></button>
              ))}
            </div>
            <button type="button" onClick={goNext} aria-label="Témoignage suivant" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Desktop dots + navigation */}
        <div className="hidden md:flex items-center justify-center gap-6 mt-10">
          <button type="button" onClick={goPrev} aria-label="Témoignage précédent" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Témoignage ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  activeIndex === i ? 'w-8 bg-teal-500' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              ></button>
            ))}
          </div>
          <button type="button" onClick={goNext} aria-label="Témoignage suivant" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Trust bar */}
        <div className="mt-12 sm:mt-14 animate-fade-in-up delay-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200/50 rounded-xl flex items-center justify-center animate-glow-pulse" style={{ animationDuration: '4s' }}>
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
                  <div key={i} className={`w-9 h-9 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-bold hover:scale-110 transition-transform duration-300`}>
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
