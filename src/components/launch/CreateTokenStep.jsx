import React from 'react';
import { Coins, ExternalLink, BookOpen, ArrowRight } from 'lucide-react';

const CreateTokenStep = () => {
  const tools = [
    {
      name: "TokenGo",
      description: "The easiest way to create tokens on Kadena",
      url: "https://tokengo.fun",
      features: ["No coding required", "Built-in presale contracts", "Instant deployment"],
      icon: "🚀",
      recommended: true
    },
    {
      name: "Kadena IDE",
      description: "Advanced development environment for custom tokens",
      url: "https://kadenai-docs.readthedocs.io/en/latest/ide/index.html",
      features: ["Full customization", "Smart contract templates", "Advanced features"],
      icon: "⚙️",
      recommended: false
    }
  ];

  const requirements = [
    {
      title: "Create a simple token contract",
      description: "You Need a simple token contract for KadPad integration",
      icon: "📄"
    },
    {
      title: "Configure token details",
      description: "Set your token name, symbol, supply, and image",
      icon: "🏷️"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-6">
          <Coins className="w-8 h-8 text-accent-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          Create Your Token
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Start by creating your token using one of our recommended tools. Make sure to include a presale contract 
          and set the Phase 0 start date at least two weeks from now.
        </p>
      </div>

      {/* Requirements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
          <span className="text-xl">✅</span>
          Requirements Checklist
        </h3>
        <div className="space-y-4">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border-color">
              <div className="text-2xl">{req.icon}</div>
              <div>
                <h4 className="font-medium text-primary-text mb-1">{req.title}</h4>
                <p className="text-sm text-secondary">{req.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div>
        <h3 className="text-xl font-semibold text-primary-text mb-6 text-center">
          Choose Your Token Creation Tool
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <div 
              key={index} 
              className={`card group hover:scale-105 transition-all duration-300 relative ${
                tool.recommended ? 'glow border-accent-primary/30' : ''
              }`}
            >
              {tool.recommended && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-accent-primary text-xs font-bold rounded-full">
                  Recommended
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-bg border border-border-color flex items-center justify-center text-2xl">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-primary-text mb-1">{tool.name}</h4>
                  <p className="text-sm text-secondary">{tool.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {tool.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary"></div>
                    <span className="text-secondary">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn w-full group/btn flex items-center justify-center gap-2 ${
                  tool.recommended ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                Open {tool.name}
                <ExternalLink size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="card bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-primary-text mb-2">Need Help Getting Started?</h4>
            <p className="text-secondary mb-4">
              Check out our comprehensive documentation for step-by-step guides on token creation and deployment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://docs.kadpad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost flex items-center gap-2"
              >
                <BookOpen size={16} />
                Read Documentation
                <ExternalLink size={14} />
              </a>
              <a
                href="https://discord.gg/Me8k8wsd"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost flex items-center gap-2"
              >
                💬 Join Discord
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Preview */}
      <div className="card border-accent-primary/20">
        <h4 className="font-semibold text-primary-text mb-3 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-accent-primary" />
          What's Next?
        </h4>
        <p className="text-secondary">
          Once you've created your token with a presale contract, you'll verify ownership 
          by connecting your wallet and proving you control the token's governance keys.
        </p>
      </div>
    </div>
  );
};

export default CreateTokenStep;