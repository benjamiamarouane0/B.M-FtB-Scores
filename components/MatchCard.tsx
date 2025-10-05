
import React from 'react';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
  onSelectMatch: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectMatch }) => {
  const getStatusElement = () => {
    switch (match.status) {
      case 'LIVE':
        return <span className="text-red-500 font-bold animate-pulse">{match.minute ? `${match.minute}'` : 'LIVE'}</span>;
      case 'HT':
        return <span className="text-yellow-400 font-bold">HT</span>;
      case 'FT':
        return <span className="text-brand-text-secondary font-bold">FT</span>;
      case 'UPCOMING':
        const matchDate = new Date(match.date);
        const today = new Date();
        const isToday = matchDate.getDate() === today.getDate() &&
                      matchDate.getMonth() === today.getMonth() &&
                      matchDate.getFullYear() === today.getFullYear();

        if (isToday) {
            return <span className="text-blue-400 font-bold">{matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
        } else {
            return <span className="text-blue-400 font-bold">{matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>;
        }
      case 'POSTPONED':
        return <span className="text-yellow-500 font-bold">PPD</span>;
      case 'SUSPENDED':
        return <span className="text-orange-500 font-bold">SUS</span>;
      case 'CANCELLED':
        return <span className="text-red-600 font-bold">CANC</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-brand-card-alt rounded-lg p-4 shadow-lg hover:bg-brand-secondary transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onSelectMatch(match)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${match.homeTeam.name} vs ${match.awayTeam.name}`}
      onKeyPress={(e) => e.key === 'Enter' && onSelectMatch(match)}
    >
      <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] gap-x-2 sm:gap-x-4 items-center">
        {/* Home Team Name */}
        <div className="truncate text-right font-semibold text-base sm:text-lg text-brand-text">
            <span className="hidden sm:inline-block" title={match.homeTeam.name}>{match.homeTeam.name}</span>
            <span className="sm:hidden">{match.homeTeam.name.substring(0,3).toUpperCase()}</span>
        </div>

        {/* Home Team Logo */}
        <img src={match.homeTeam.logo} alt={`${match.homeTeam.name} logo`} className="w-8 h-8 rounded-full object-contain flex-shrink-0" />

        {/* Score */}
        <div className="text-center px-2">
          {match.status !== 'UPCOMING' && match.homeScore !== null && match.awayScore !== null ? (
             <div className="text-2xl font-bold tracking-wider whitespace-nowrap">{`${match.homeScore} - ${match.awayScore}`}</div>
          ) : (
             <div className="text-xl font-bold text-brand-text-secondary">-</div>
          )}
          <div className="text-sm mt-1">{getStatusElement()}</div>
        </div>
        
        {/* Away Team Logo */}
        <img src={match.awayTeam.logo} alt={`${match.awayTeam.name} logo`} className="w-8 h-8 rounded-full object-contain flex-shrink-0" />
        
        {/* Away Team Name */}
        <div className="truncate text-left font-semibold text-base sm:text-lg text-brand-text">
            <span className="hidden sm:inline-block" title={match.awayTeam.name}>{match.awayTeam.name}</span>
            <span className="sm:hidden">{match.awayTeam.name.substring(0,3).toUpperCase()}</span>
        </div>
      </div>
       <p className="text-center text-xs text-brand-text-secondary mt-3 truncate" title={match.league}>{match.league}</p>
    </div>
  );
};

export default React.memo(MatchCard);