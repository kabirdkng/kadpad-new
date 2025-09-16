import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const text = "THE HOME OF TOKEN LAUNCHES ON KADENA";
  const words = text.split(' ');

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
            className={`btn btn-primary group flex items-center gap-2 text-lg px-8 py-4 relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-accent-dark/90 to-accent-secondary/90 border border-accent-primary/30 shadow-lg shadow-accent-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-accent-primary/40 hover:scale-105 ${visible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: '800ms' }}
          >
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Launch Your Token</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 relative z-10" />
            {/* Auto glass sweep after appearance */}
            <div 
              className="absolute top-0 w-8 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20 transform skew-x-12 opacity-0"
              style={{
                animation: visible ? 'glass-sweep 2.5s ease-out' : 'none',
                animationDelay: '2s'
              }}
            ></div>
            {/* Hover shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
          
          <Link 
            to="/sales" 
            className={`btn btn-secondary group flex items-center gap-2 text-lg px-8 py-4 relative overflow-hidden backdrop-blur-sm bg-transparent border-2 border-accent-primary/50 shadow-lg shadow-accent-primary/10 transition-all duration-500 hover:shadow-xl hover:shadow-accent-primary/30 hover:scale-105 hover:bg-accent-primary/10 ${visible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: '900ms' }}
          >
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Explore Projects</span>
            <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110 relative z-10" />
            {/* Auto glass sweep after appearance */}
            <div 
              className="absolute top-0 w-8 h-full bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent pointer-events-none z-20 transform skew-x-12 opacity-0"
              style={{
                animation: visible ? 'glass-sweep 2.5s ease-out' : 'none',
                animationDelay: '2.5s'
              }}
            ></div>
            {/* Hover shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>

          <Link 
            to="/staking" 
            className={`btn btn-primary group flex items-center gap-2 text-lg px-8 py-4 relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-accent-primary/90 to-accent-light/90 border border-accent-primary/40 shadow-lg shadow-accent-primary/25 transition-all duration-500 hover:shadow-xl hover:shadow-accent-primary/50 hover:scale-105 ${visible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: '1000ms' }}
          >
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-accent-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 animate-pulse"></div>
            <span className="relative z-10">Stake KPAD</span>
            <Shield className="w-5 h-5 transition-transform group-hover:scale-110 relative z-10" />
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 bg-accent-primary/20 rounded-xl blur-xl group-hover:bg-accent-primary/40 transition-all duration-300"></div>
            {/* Auto glass sweep after appearance */}
            <div 
              className="absolute top-0 w-8 h-full bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none z-20 transform skew-x-12 opacity-0"
              style={{
                animation: visible ? 'glass-sweep 2.5s ease-out' : 'none',
                animationDelay: '2.9s'
              }}
            ></div>
            {/* Hover shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
        </div>

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
    </section>
  );
};

export default Hero;