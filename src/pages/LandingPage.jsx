import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Features from '../components/Features';

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="landing-page">
      <section className="combined-section">
        <Hero />
        <Features />
      </section>
    </div>
  );
};

export default LandingPage;
