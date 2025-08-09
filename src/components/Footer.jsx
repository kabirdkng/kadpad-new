import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Twitter, 
  MessageCircle, 
  Send, 
  Mail, 
  ExternalLink,
  Rocket,
  TrendingUp,
  Coins,
  BookOpen,
  Heart
} from 'lucide-react';
import logo from '/favicon.svg';

const Footer = () => {
  const socialLinks = [
    {
      name: 'Twitter',
      url: 'https://x.com/kadpad_official',
      icon: <Twitter size={20} />,
      color: 'hover:text-blue-400'
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/3jkAcdtAxf',
      icon: <MessageCircle size={20} />,
      color: 'hover:text-indigo-400'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/kadpad',
      icon: <Send size={20} />,
      color: 'hover:text-cyan-400'
    }
  ];

  const quickLinks = [
    { name: 'Launch Token', to: '/launch', icon: <Rocket size={16} /> },
    { name: 'Explore Projects', to: '/sales', icon: <TrendingUp size={16} /> },
    { name: 'Staking', to: '/staking', icon: <Coins size={16} /> },
    { name: 'Documentation', to: 'https://docs.kadpad.xyz', icon: <BookOpen size={16} />, external: true }
  ];

  const resources = [
    { name: 'Help Center', url: 'mailto:support@kadpad.xyz' },
    { name: 'Terms of Service', url: 'https://docs.kadpad.xyz/documentation/terms-of-service/' },
    { name: 'Privacy Policy', url: 'https://docs.kadpad.xyz/documentation/privacy-policy/' }
  ];

  return (
    <footer className="relative bg-secondary-bg border-t border-border-color">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4 lg:mb-6">
                <img src={logo} alt="KadPad Logo" className="w-8 h-8 lg:w-10 lg:h-10" />
                <span className="text-xl lg:text-2xl font-bold text-gradient">KadPad</span>
              </div>
              <p className="text-secondary text-base lg:text-lg mb-4 lg:mb-6 max-w-md">
                Empowering the Kadena ecosystem with innovative token launch solutions. 
                Build, launch, and scale your project with confidence.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center space-x-3 lg:space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 lg:p-3 rounded-lg lg:rounded-xl bg-card border border-border-color text-secondary ${social.color} transition-all duration-300 hover:scale-110 hover:border-accent-primary/30`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="sm:col-span-1">
              <h3 className="text-base lg:text-lg font-semibold text-primary-text mb-4 lg:mb-6">Quick Links</h3>
              <ul className="space-y-3 lg:space-y-4">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 lg:gap-3 text-sm lg:text-base text-secondary hover:text-accent-primary transition-colors duration-300 group"
                      >
                        <span className="text-accent-primary group-hover:scale-110 transition-transform duration-300">
                          {link.icon}
                        </span>
                        {link.name}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="flex items-center gap-2 lg:gap-3 text-sm lg:text-base text-secondary hover:text-accent-primary transition-colors duration-300 group"
                      >
                        <span className="text-accent-primary group-hover:scale-110 transition-transform duration-300">
                          {link.icon}
                        </span>
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="sm:col-span-1">
              <h3 className="text-base lg:text-lg font-semibold text-primary-text mb-4 lg:mb-6">Resources</h3>
              <ul className="space-y-3 lg:space-y-4">
                {resources.map((resource) => (
                  <li key={resource.name}>
                    <a
                      href={resource.url}
                      className="text-sm lg:text-base text-secondary hover:text-accent-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      {resource.name}
                      {resource.url.startsWith('mailto:') && (
                        <Mail size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Newsletter Signup */}
              {/* <div className="mt-6 lg:mt-8">
                <h4 className="text-sm font-medium text-primary-text mb-3">Stay Updated</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 lg:px-4 py-2 rounded-lg bg-card border border-border-color text-primary-text text-sm focus:outline-none focus:border-accent-primary"
                  />
                  <button className="px-4 py-2 bg-accent-primary text-black rounded-lg hover:bg-accent-secondary transition-colors duration-300 flex items-center justify-center">
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-color py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 text-xs lg:text-sm text-secondary text-center lg:text-left">
              <span>© 2024 KadPad. Made with</span>
              <Heart size={14} className="text-red-500 animate-pulse" />
              <span>for the Kadena community</span>
            </div>
            
            <div className="flex items-center space-x-4 lg:space-x-6 text-xs lg:text-sm text-secondary">
              <span>Built on Kadena</span>
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
              <span>Secured & Audited</span>
            </div>
          </div>
        </div> 
      </div>
    </footer>
  );
};

export default Footer;