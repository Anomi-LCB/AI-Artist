import React, { useState } from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '#home', text: 'Home' },
    { href: '#gallery', text: 'Gallery' },
    { href: '#artists', text: 'About the Artists' },
  ];

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex items-center gap-4 text-gray-900 dark:text-gray-100">
        <div className="size-6 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
              clipRule="evenodd"
              d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
              fill="currentColor"
              fillRule="evenodd"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight">Fairy Tale Covers</h2>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex flex-1 justify-end items-center gap-8">
        <nav className="flex items-center gap-9">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors">
              {link.text}
            </a>
          ))}
        </nav>
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
          <span className="truncate">Contact</span>
        </button>
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-gray-800 dark:text-gray-200">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center">
         <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-gray-800 dark:text-gray-200">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-gray-800 dark:text-gray-200">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-background-dark rounded-md shadow-lg p-2 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {link.text}
              </a>
            ))}
             <a href="#" onClick={() => setIsMenuOpen(false)} className="text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Contact
              </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;