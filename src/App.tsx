import React, { useState } from 'react';
import EmergencyBanner from './components/EmergencyBanner';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesHighlight from './components/ServicesHighlight';
import AboutPreview from './components/AboutPreview';
import StatsSection from './components/StatsSection';
import Testimonials from './components/Testimonials';
import ServicesSection from './components/ServicesSection';
import AboutSection from './components/AboutSection';
import ZonesSection from './components/ZonesSection';
import FAQSection from './components/FAQSection';
import BlogSection from './components/BlogSection';
import AppointmentSection from './components/AppointmentSection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

function App() {
  const [selectedArticle, setSelectedArticle] = useState<string | undefined>(undefined);
  const [showBlogArticle, setShowBlogArticle] = useState(false);

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticle(articleId);
    setShowBlogArticle(true);
  };

  const handleBackToBlog = () => {
    setSelectedArticle(undefined);
    setShowBlogArticle(false);
  };

  // If showing a blog article, render only the article
  if (showBlogArticle && selectedArticle) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <EmergencyBanner />
        <BlogSection 
          selectedArticle={selectedArticle} 
          onBackToBlog={handleBackToBlog}
        />
        <WhatsAppButton />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <EmergencyBanner />
      <Hero />
      <ServicesHighlight />
      <AboutPreview />
      <StatsSection />
      <Testimonials />
      <div id="services">
        <ServicesSection />
      </div>
      <AboutSection />
      <ZonesSection />
      <FAQSection />
      <BlogSection onArticleSelect={handleArticleSelect} />
      <AppointmentSection />
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

export default App;