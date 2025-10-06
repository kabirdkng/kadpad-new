import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, TrendingUp, Coins, BookOpen, Link as ChainIcon } from 'lucide-react';
import kadPadLogo from '../assets/KADPAD_Green-Rocket-01.svg';
import WalletConnectButton from './WalletConnectButton';
import useWalletStore from '../wallet/walletStore';
import config from '../wallet/config';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { account } = useWalletStore();
  const location = useLocation();
  const headerRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if menu is open and click is outside header
      // Don't interfere with wallet dropdown clicks
      if (
        isMenuOpen && 
        headerRef.current && 
        !headerRef.current.contains(event.target) &&
        !event.target.closest('.wallet-dropdown-container') // Exclude wallet dropdown area
      ) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      // Use capture phase to handle clicks before wallet dropdown
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isMenuOpen]);

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

  // Network indicator component
  const NetworkIndicator = ({ mobile = false }) => {
    const networkColor = config.name === 'mainnet' ? 'text-green-400' : 'text-orange-400';
    const networkBg = config.name === 'mainnet' ? 'bg-green-400/10 border-green-400/20' : 'bg-orange-400/10 border-orange-400/20';
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${networkBg} ${mobile ? 'text-sm' : 'text-xs'}`}>
        <ChainIcon size={mobile ? 16 : 14} className={networkColor} />
        <span className={`font-medium ${networkColor}`}>
          Kadena {config.name} | Chain {config.chainId}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Announcement Banner */}
      <div className="w-full bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center text-center">
            <p className="text-white text-sm font-medium">
              $KPAD token Sale is now live!!
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
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible || isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          top: '40px',
          background: scrolled 
            ? 'rgba(0, 0, 0, 0.3)' 
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
              onClick={closeMenu}
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
              {/* Network Indicator - Desktop */}
              <div className="hidden lg:block">
                <NetworkIndicator />
              </div>
              
              {/* Desktop Wallet Connect */}
              <div className="hidden lg:block">
                <WalletConnectButton />
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className={`lg:hidden p-3 rounded-xl transition-all duration-300 relative group ${
                  isMenuOpen 
                    ? 'bg-accent-primary text-primary-bg shadow-lg shadow-accent-primary/20 border-2 border-accent-primary' 
                    : 'bg-gradient-card border-2 border-accent-primary/30 hover:border-accent-primary hover:bg-accent-primary/10 hover:shadow-lg hover:shadow-accent-primary/10'
                }`}
              >
                {!isMenuOpen && (
                  <div className="absolute inset-0 rounded-xl bg-accent-primary/5 animate-pulse"></div>
                )}
                {isMenuOpen ? (
                  <X size={22} className="relative z-10 transition-transform duration-200 group-hover:rotate-90" />
                ) : (
                  <Menu size={22} className="relative z-10 text-accent-primary transition-transform duration-200 group-hover:scale-110" />
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
                      onClick={() => closeMenu()}
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
                      onClick={() => closeMenu()}
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
              
              {/* Network Indicator - Mobile */}
              <div className="mb-4 flex justify-center">
                <NetworkIndicator mobile={true} />
              </div>
              
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
