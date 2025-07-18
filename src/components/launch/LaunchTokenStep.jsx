import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ExternalLink, BarChart3, Users, Share2, Trophy, CheckCircle } from 'lucide-react';

const LaunchTokenStep = ({ submissionStatus, namespace, moduleName }) => {
  if (submissionStatus !== 'Verified') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-500/20 border border-gray-500/30 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
            Launch Your Token
          </h2>
          <div className="card bg-yellow-500/5 border-yellow-500/20 max-w-md mx-auto">
            <p className="text-yellow-400 font-medium mb-2">Verification Required</p>
            <p className="text-secondary text-sm">
              You cannot access this step until your submission is verified by our team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nextSteps = [
    {
      title: "Monitor Your Dashboard",
      description: "Track your presale progress, manage whitelists, and view real-time analytics",
      icon: BarChart3,
      color: "blue"
    },
    {
      title: "Engage Your Community",
      description: "Share your launch across social media and engage with potential investors",
      icon: Users,
      color: "green"
    },
    {
      title: "Manage Presale Phases",
      description: "Control whitelist access and transition between presale phases",
      icon: Share2,
      color: "purple"
    }
  ];

  const achievements = [
    "✅ Token contract verified and approved",
    "✅ Presale configuration validated", 
    "✅ Security checks completed",
    "✅ Token is now live on KadPad"
  ];

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <Trophy className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
          🎉 Congratulations!
        </h2>
        <h3 className="text-xl text-accent-primary mb-4">
          Your Token is Now Live
        </h3>
        <p className="text-secondary max-w-2xl mx-auto">
          Your token has been successfully launched on KadPad! Your presale is now active and ready for the community. 
          Monitor your progress and engage with your investors through the dashboard.
        </p>
      </div>

      {/* Achievement List */}
      <div className="card bg-green-500/5 border-green-500/20">
        <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Launch Achievements
        </h3>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border-color animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="text-green-400">✓</div>
              <p className="text-primary-text">{achievement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Action */}
      <div className="card text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-accent-primary" />
        </div>
        <h3 className="text-xl font-semibold text-primary-text mb-4">
          Access Your Dashboard
        </h3>
        <p className="text-secondary mb-6">
          Monitor your launch progress, manage your presale, and engage with your community.
        </p>
        <Link 
          to={`/dashboard/${namespace}/${moduleName}`} 
          className="btn btn-primary flex items-center justify-center gap-2 mx-auto"
        >
          <BarChart3 size={16} />
          Go to Dashboard
        </Link>
      </div>

      {/* Next Steps */}
      <div>
        <h3 className="text-xl font-semibold text-primary-text mb-6 text-center">
          What's Next?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nextSteps.map((step, index) => {
            const IconComponent = step.icon;
            const colorClasses = {
              blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
              green: 'bg-green-500/20 border-green-500/30 text-green-400', 
              purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400'
            };
            
            return (
              <div 
                key={index} 
                className="card group hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorClasses[step.color]}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-primary-text mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-secondary">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Section */}
      <div className="card-gradient text-center">
        <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5 text-accent-primary" />
          Share Your Success
        </h3>
        <p className="text-secondary mb-6">
          Let the world know about your successful token launch! Share across social media to attract more investors.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://twitter.com/intent/tweet?text=🚀 Just launched my token on @kadpad_official! Join our presale and be part of the future. %23Kadena %23DeFi %23TokenLaunch&url=${window.location.origin}/presale/${namespace}/${moduleName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost flex items-center gap-2"
          >
            <span className="text-blue-400">🐦</span>
            Share on Twitter
            <ExternalLink size={14} />
          </a>
          
          <a
            href="https://discord.gg/Me8k8wsd"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost flex items-center gap-2"
          >
            <span className="text-indigo-400">💬</span>
            Join Discord
            <ExternalLink size={14} />
          </a>
          
          <a
            href="https://t.me/kadpad"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost flex items-center gap-2"
          >
            <span className="text-cyan-400">📱</span>
            Join Telegram
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Resources */}
      <div className="card border-accent-primary/20">
        <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
          <span className="text-xl">📚</span>
          Helpful Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://docs.kadpad.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary-bg border border-border-color hover:border-accent-primary/30 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-sm">📖</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary-text group-hover:text-accent-primary">Documentation</p>
              <p className="text-xs text-secondary">Launch guides & best practices</p>
            </div>
            <ExternalLink size={14} className="text-secondary group-hover:text-accent-primary" />
          </a>
          
          <a
            href="https://discord.gg/Me8k8wsd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary-bg border border-border-color hover:border-accent-primary/30 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <span className="text-sm">🤝</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary-text group-hover:text-accent-primary">Community Support</p>
              <p className="text-xs text-secondary">Get help from our team</p>
            </div>
            <ExternalLink size={14} className="text-secondary group-hover:text-accent-primary" />
          </a>
        </div>
      </div>

      {/* Final Message */}
      <div className="text-center">
        <div className="card max-w-2xl mx-auto">
          <h4 className="text-lg font-semibold text-primary-text mb-3">
            🌟 Welcome to the KadPad Family!
          </h4>
          <p className="text-secondary">
            You've successfully launched your token on Kadena's premier launchpad. 
            Our team is here to support you throughout your journey. Good luck with your presale!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaunchTokenStep;