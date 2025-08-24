import { useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="pt-16">
      <section className="combined-section">
        <Hero />
        <Features />
      </section>
    </div>
  );
};

export default LandingPage;
