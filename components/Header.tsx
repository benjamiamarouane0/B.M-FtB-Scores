import React from 'react';
import { LogoIcon } from './icons';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isSearchDisabled: boolean;
    onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, isSearchDisabled, onGoHome }) => {
  return (
    <header className="bg-brand-card shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-5xl gap-4">
        <button
          onClick={onGoHome}
          className="flex items-center space-x-3 flex-shrink-0 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-md p-1 -ml-1 transition-all"
          aria-label="Go to home page"
        >
          <LogoIcon className="w-8 h-8 text-brand-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            B.M FtB <span className="text-brand-primary">Scores</span>
          </h1>
        </button>
        <div className="relative flex-grow max-w-xs sm:max-w-sm">
            <input
                type="search"
                placeholder="Search for a competition..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={isSearchDisabled}
                className="w-full bg-brand-background border border-brand-secondary text-brand-text placeholder-brand-text-secondary rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors duration-300 disabled:opacity-50"
                aria-label="Search for a competition"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-brand-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;