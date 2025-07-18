import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Rocket, TrendingUp, Coins, BookOpen } from 'lucide-react';
import kadPadLogo from '../assets/KADPAD_Green-Rocket-01.svg';
import WalletConnectButton from './WalletConnectButton';
import useWalletStore from '../wallet/walletStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { account } = useWalletStore();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const controlNavbar = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      
      setScrolled(currentScrollY > 50);
      
      // More aggressive hiding - hide when scrolling down past 100px
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [controlNavbar]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navItems = [
    { 
      to: "/launch", 
      label: "Launch", 
      icon: <Rocket size={18} />,
      description: "Launch your token"
    },
    { 
      to: "/sales", 
      label: "Explore", 
      icon: <TrendingUp size={18} />,
      description: "Discover projects"
    },
    { 
      to: "/staking", 
      label: "Stake", 
      icon: <Coins size={18} />,
      description: "Earn rewards"
    },
    { 
      to: "https://docs.kadpad.xyz", 
      label: "Learn", 
      icon: <BookOpen size={18} />,
      description: "Documentation",
      external: true
    }
  ];

  const navLinkClass = ({ isActive }) => 
    `nav-link group relative flex items-center gap-2 whitespace-nowrap ${
      isActive ? 'active text-accent' : 'text-secondary hover:text-accent'
    }`;

  return (
    <>
      {/* Announcement Banner */}
      <div className="w-full bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center text-center">
            <p className="text-white text-sm font-medium">
              🚀 Announcing $KPAD Testnet Launch soon! 
              <a 
                href="https://x.com/kadpad_official" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 underline hover:no-underline transition-all duration-200 font-semibold"
              >
                Latest Updates →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible || isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          top: '40px',
          background: scrolled 
            ? 'rgba(0, 0, 0, 0.9)' 
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <img 
                src={kadPadLogo} 
                alt="KadPad Logo" 
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                KadPad
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                item.external ? (
                  <a
                    key={item.to}
                    href={item.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link group whitespace-nowrap"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={navLinkClass}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                )
              ))}
            </nav>

            {/* Wallet Connect & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop Wallet Connect */}
              <div className="hidden lg:block">
                <WalletConnectButton />
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-xl bg-card border border-border-color hover:bg-hover-bg transition-all duration-200"
              >
                {isMenuOpen ? (
                  <X size={20} className="text-primary-text" />
                ) : (
                  <Menu size={20} className="text-primary-text" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="lg:hidden border-t border-border-color"
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2 mb-6">
                {navItems.map((item) => (
                  item.external ? (
                    <a
                      key={item.to}
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-hover-bg transition-all duration-200 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-accent">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-primary-text">{item.label}</div>
                          <div className="text-sm text-secondary">{item.description}</div>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-hover-bg transition-all duration-200 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-accent">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-primary-text">{item.label}</div>
                          <div className="text-sm text-secondary">{item.description}</div>
                        </div>
                      </div>
                    </NavLink>
                  )
                ))}
              </nav>
              
              {/* Mobile Wallet Connect - Centered at Bottom */}
              <div className="flex justify-center">
                <WalletConnectButton />
              </div>
              
              {/* Account Info in Mobile Menu */}
              {account && (
                <div className="mt-4 p-3 bg-card rounded-xl border border-border-color">
                  <div className="text-sm text-secondary">Connected Account</div>
                  <div className="font-mono text-sm text-primary-text truncate">
                    {account}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content overlap */}
      <div className={`transition-all duration-300 ${isMenuOpen ? 'h-[34rem]' : 'h-28'}`}></div>
    </>
  );
};

export default Header;