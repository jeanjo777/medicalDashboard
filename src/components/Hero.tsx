import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Heart, Shield, Phone, Star, Activity, Stethoscope } from 'lucide-react';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Parallax on mouse move
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      id="accueil"
      ref={heroRef}
      className="pt-20 sm:pt-24 lg:pt-0 relative min-h-screen flex items-center overflow-hidden fade-in-section"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-teal-50/30 animate-gradient-flow" style={{ backgroundSize: '200% 200%' }}></div>

      {/* Animated dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #0E7490 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Morphing decorative blobs with parallax */}
      <div
        className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-teal-200/30 to-blue-200/20 animate-morph blur-3xl"
        style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/40 to-transparent animate-morph blur-3xl"
        style={{ animationDelay: '-4s', transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }}
      ></div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-teal-400/20 animate-float-rotate"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * -1.5}s`,
              animationDuration: `${5 + i}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 xl:py-20 relative z-10 w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

          {/* Left side - Text content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="animate-slide-up-spring">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                Disponible 7j/7 à Abidjan
              </span>
            </div>

            <div className="animate-slide-up-spring" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 font-heading leading-tight">
                <span className="text-gradient-animated">Ake Achi Simplice</span>
              </h1>
            </div>

            <div className="animate-slide-up-spring" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-teal-700 mb-5 font-heading">
                Infirmier Diplômé d'État
              </h2>
            </div>

            <div className="animate-slide-up-spring" style={{ animationDelay: '0.3s' }}>
              <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Des soins professionnels et attentionnés, avec plus de 20 ans d'expérience
                dans le domaine de la santé en Côte d'Ivoire.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-up-spring justify-center lg:justify-start" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => scrollToSection('rendez-vous')}
                className="btn-primary btn-ripple group relative overflow-hidden w-full sm:w-auto shadow-lg hover:shadow-xl px-8 py-4 text-base font-semibold rounded-xl"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Prendre rendez-vous
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>

              <button
                onClick={() => scrollToSection('services')}
                className="btn-secondary btn-ripple group w-full sm:w-auto px-8 py-4 text-base rounded-xl flex items-center justify-center"
              >
                <Play size={16} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                Découvrir mes services
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 animate-slide-up-spring" style={{ animationDelay: '0.5s' }}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-green-50 border border-green-200/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform icon-hover-spin">
                    <Shield size={18} className="text-green-600" />
                  </div>
                  <span className="font-medium">Diplômé d'État</span>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform icon-hover-spin">
                    <Heart size={18} className="text-blue-600" />
                  </div>
                  <span className="font-medium">20+ ans d'expérience</span>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-200/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform icon-hover-spin">
                    <Star size={18} className="text-amber-500" />
                  </div>
                  <span className="font-medium">98% satisfaction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Visual card with parallax */}
          <div className="w-full lg:w-1/2 animate-slide-up-spring hidden md:block" style={{ animationDelay: '0.3s' }}>
            <div
              className="relative max-w-lg mx-auto"
              style={{ transform: `translateY(${scrollY * -0.05}px)` }}
            >
              {/* Main photo card */}
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 card-shine animate-glow-pulse">
                <div className="aspect-[4/5] relative">
                  <img
                    src="/p17.png"
                    alt="Ake Achi Simplice - Infirmier Diplômé d'État"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Stethoscope size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Ake Achi Simplice</p>
                        <p className="text-white/80 text-sm">INFAS Bouaké · Promotion 2003</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card - Phone */}
              <div
                className="absolute -left-6 top-16 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden lg:flex items-center gap-3 animate-float-rotate"
                style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)` }}
              >
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Appelez-moi</p>
                  <p className="text-sm font-bold text-gray-900">05 05 83 11 46</p>
                </div>
              </div>

              {/* Floating card - Rating */}
              <div
                className="absolute -right-4 top-1/3 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden lg:flex items-center gap-3 animate-float-rotate"
                style={{ animationDelay: '1s', transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 6}px)` }}
              >
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Satisfaction</p>
                  <p className="text-sm font-bold text-gray-900">4.9/5 <span className="text-amber-500">★★★★★</span></p>
                </div>
              </div>

              {/* Floating card - Experience */}
              <div
                className="absolute -left-4 bottom-24 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden lg:flex items-center gap-3 animate-float-rotate"
                style={{ animationDelay: '2s', transform: `translate(${mousePos.x * -5}px, ${mousePos.y * 5}px)` }}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Activity size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expérience</p>
                  <p className="text-sm font-bold text-gray-900">+22 années</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-teal-400 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-teal-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
