import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const text = "THE HOME OF TOKEN LAUNCHES ON KADENA";
  const words = text.split(' ');

  // Mock stats that would come from your API
  const stats = [
    { label: "Total Projects", value: "47", suffix: "+" },
    { label: "Total Raised", value: "2.3M", suffix: " KDA" },
    { label: "Active Users", value: "1.2K", suffix: "+" },
    { label: "Success Rate", value: "94", suffix: "%" }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Audited",
      description: "Smart contracts audited for maximum security"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Built on Kadena's scalable blockchain"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Fair Launch",
      description: "Transparent and fair token distribution"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const handleInteraction = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pb-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
        {/* Main Heading */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent-primary mr-2" />
            <span className="text-sm font-medium text-accent-primary">
              Next Generation Token Launchpad
            </span>
          </div>
          
          <h1 className={`hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {words.map((word, index) => (
              <span
                key={index}
                className={`inline-block mr-4 mb-2 transition-all duration-500 ease-out ${
                  activeIndex === index 
                    ? 'text-accent-primary scale-105 drop-shadow-lg' 
                    : index < 3 
                      ? 'text-gradient' 
                      : 'text-primary-text'
                } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
                onMouseEnter={() => handleInteraction(index)}
                onMouseLeave={handleInteractionEnd}
                onTouchStart={() => handleInteraction(index)}
                onTouchEnd={handleInteractionEnd}
              >
                {word}
              </span>
            ))}
          </h1>
          
          <p className={`text-lg sm:text-xl text-secondary max-w-2xl mx-auto mb-8 transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Launch your token with confidence on Kadena's high-performance blockchain. 
            Join the future of decentralized finance with transparent, secure, and scalable solutions.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-all duration-1000 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link 
            to="/launch" 
            className="btn btn-primary group flex items-center gap-2 text-lg px-8 py-4"
          >
            Launch Your Token
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            to="/sales" 
            className="btn btn-secondary group flex items-center gap-2 text-lg px-8 py-4"
          >
            Explore Projects
            <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110" />
          </Link>
        </div>

        {/* Stats Section */}
        {/* <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-900 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`card text-center p-6 transition-all duration-500 ${
                currentStat === index ? 'glow scale-105' : ''
              }`}
            >
              <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">
                {stat.value}
                <span className="text-accent-primary">{stat.suffix}</span>
              </div>
              <div className="text-sm text-secondary font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div> */}

        {/* Features Preview */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16 transition-all duration-1000 delay-1100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card text-center p-6 group hover:scale-105 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-card border border-accent-primary/20 text-accent-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-primary-text mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator - Positioned absolutely at bottom */}
      {/* <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col items-center text-secondary">
          <span className="text-xs font-medium mb-3 px-3 py-1 bg-card/80 backdrop-blur-sm rounded-full border border-accent-primary/20">
            Scroll to explore
          </span>
          <div className="relative">
            <div className="w-px h-12 bg-gradient-to-b from-accent-primary via-accent-primary/50 to-transparent animate-pulse"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div> */}
    </section>
  );
};

export default Hero;