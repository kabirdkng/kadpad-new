import React from 'react';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import kadenaLogo from '../assets/newkadena.png';
import tokenGoLogo from '../assets/tokengo-logo.png';
import mercatusLogo from '../assets/mercatus.svg';

const Features = () => {
  const partners = [
    {
      name: "Kadena",
      logo: kadenaLogo,
      description: "Layer 1 Blockchain",
      longDescription: "The world's first scalable proof-of-work blockchain",
      url: "https://kadena.io",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      accentColor: "text-purple-400"
    },
    {
      name: "TokenGo",
      logo: tokenGoLogo,
      description: "Token Generator",
      longDescription: "Create and deploy tokens with ease",
      url: "https://tokengo.fun",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      accentColor: "text-blue-400"
    },
    {
      name: "Mercatus",
      logo: mercatusLogo,
      description: "Decentralized Exchange",
      longDescription: "Trade tokens on the premier Kadena DEX",
      url: "https://mercatus.works",
      bgColor: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20",
      accentColor: "text-green-400"
    }
  ];

  return (
    <section className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-accent-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-accent-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6">
            <span className="text-sm font-medium text-accent-primary">
              Ecosystem Partners
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
            Powered by <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Built on top of cutting-edge infrastructure and integrated with the best tools in the Kadena ecosystem.
          </p>
        </div>

        {/* Partner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`card group hover:scale-105 transition-all duration-500 bg-gradient-to-br ${partner.bgColor} border-2 ${partner.borderColor} hover:border-opacity-50 animate-fade-in`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-white/10 p-3 flex items-center justify-center">
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} Logo`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-text">
                      {partner.name}
                    </h3>
                    <p className={`text-sm font-medium ${partner.accentColor}`}>
                      {partner.description}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-secondary group-hover:text-accent-primary transition-colors duration-300" />
              </div>

              {/* Description */}
              <p className="text-secondary text-sm leading-relaxed mb-6">
                {partner.longDescription}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary font-medium">
                  Visit {partner.name}
                </span>
                <ExternalLink className="w-4 h-4 text-secondary group-hover:text-accent-primary transition-colors duration-300" />
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </a>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="card max-w-4xl mx-auto p-8 bg-gradient-card">
            <h3 className="text-2xl font-bold text-primary-text mb-4">
              Why Choose KadPad?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h4 className="font-semibold text-primary-text mb-2">Fast & Scalable</h4>
                <p className="text-sm text-secondary">
                  Built on Kadena's high-performance blockchain for instant transactions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="font-semibold text-primary-text mb-2">Secure & Audited</h4>
                <p className="text-sm text-secondary">
                  Smart contracts audited by leading security firms
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h4 className="font-semibold text-primary-text mb-2">Fair Launch</h4>
                <p className="text-sm text-secondary">
                  Transparent and fair token distribution for all participants
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;