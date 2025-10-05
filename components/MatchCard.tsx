
import React, { useState, useEffect } from 'react';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
  onSelectMatch: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectMatch }) => {
  const [displayMinute, setDisplayMinute] = useState<number | undefined>(match.minute);

  useEffect(() => {
    // Reset display minute when match data from API changes
    setDisplayMinute(match.minute);

    if (match.status !== 'LIVE') {
      return; // Not a live match, no timer needed
    }

    let timer: number;

    // Case 1: The API provides the official minute. We use that as the source of truth
    // and increment it locally for a smoother UX between API polls.
    if (match.minute) {
      timer = window.setInterval(() => {
        setDisplayMinute(currentMinute => {
          if (currentMinute && currentMinute < 120) { // Allow for extra time
            return currentMinute + 1;
          }
          return currentMinute;
        });
      }, 60000); // Increment every minute
    } 
    // Case 2: The API says the match is LIVE but doesn't provide a minute.
    // We calculate a fallback minute based on the match start time.
    else {
      const matchStartDate = new Date(match.date);
      
      const updateCalculatedMinute = () => {
        const now = new Date();
        const elapsedMilliseconds = now.getTime() - matchStartDate.getTime();
        
        // Don't show a minute if kickoff time is in the future
        if (elapsedMilliseconds < 0) {
            setDisplayMinute(undefined);
            return;
        }

        const elapsedMinutes = Math.floor(elapsedMilliseconds / 60000);
        
        // A simple approximation, capped at 90 minutes. Stoppage/extra time will
        // be corrected once the official `match.minute` is available from the API.
        setDisplayMinute(Math.min(elapsedMinutes, 90));
      };

      updateCalculatedMinute(); // Set initial calculated minute
      timer = window.setInterval(updateCalculatedMinute, 30000); // Update every 30 seconds for responsiveness
    }

    // Cleanup the interval when the component unmounts or match data changes.
    return () => clearInterval(timer);
  }, [match.status, match.minute, match.date]);

  const getStatusElement = () => {
    switch (match.status) {
      case 'LIVE':
        return <span className="text-red-500 font-bold animate-pulse">{displayMinute ? `${displayMinute}'` : 'LIVE'}</span>;
      case 'ET':
        return <span className="text-red-500 font-bold animate-pulse">{match.minute ? `ET ${match.minute}'` : 'ET'}</span>;
      case 'BREAK':
         return <span className="text-yellow-400 font-bold">Break</span>;
      case 'HT':
        return <span className="text-yellow-400 font-bold">HT</span>;
      case 'FT':
        let statusText = "FT";
        if (match.homePenalties !== null && match.awayPenalties !== null) {
          statusText = "FT (P)";
        }
        return <span className="text-brand-text-secondary font-bold">{statusText}</span>;
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
  
  const renderScore = () => {
      let scoreString = `${match.homeScore} - ${match.awayScore}`;
      if (match.status === 'FT' && match.homePenalties !== null && match.awayPenalties !== null) {
          scoreString += ` (${match.homePenalties}-${match.awayPenalties})`;
      }
      return scoreString;
  }

  return (
    <div
      className="bg-brand-card-alt rounded-lg p-4 shadow-lg hover:bg-brand-secondary transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onSelectMatch(match)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${match.homeTeam.name} vs ${match.awayTeam.name}`}
      onKeyPress={(e) => e.key === 'Enter' && onSelectMatch(match)}
    >
        <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 sm:gap-x-4 items-center">
            {/* Home Team: Logo and Name */}
            <div className="flex items-center space-x-3 justify-end truncate">
                <span className="font-semibold text-base sm:text-lg text-brand-text hidden sm:inline-block truncate" title={match.homeTeam.name}>
                    {match.homeTeam.name}
                </span>
                <span className="font-semibold text-base sm:text-lg text-brand-text sm:hidden">
                    {match.homeTeam.name.substring(0, 3).toUpperCase()}
                </span>
                <img loading="lazy" src={match.homeTeam.logo} alt={`${match.homeTeam.name} logo`} className="w-8 h-8 rounded-full object-contain flex-shrink-0 bg-brand-secondary" />
            </div>

            {/* Score Box */}
            <div className="text-center px-2">
                {match.status !== 'UPCOMING' && match.homeScore !== null && match.awayScore !== null ? (
                    <div className="text-2xl font-bold tracking-wider whitespace-nowrap">{renderScore()}</div>
                ) : (
                    <div className="text-xl font-bold text-brand-text-secondary">-</div>
                )}
                <div className="text-sm mt-1">{getStatusElement()}</div>
            </div>
            
            {/* Away Team: Logo and Name */}
            <div className="flex items-center space-x-3 justify-start truncate">
                <img loading="lazy" src={match.awayTeam.logo} alt={`${match.awayTeam.name} logo`} className="w-8 h-8 rounded-full object-contain flex-shrink-0 bg-brand-secondary" />
                <span className="font-semibold text-base sm:text-lg text-brand-text hidden sm:inline-block truncate" title={match.awayTeam.name}>
                    {match.awayTeam.name}
                </span>
                <span className="font-semibold text-base sm:text-lg text-brand-text sm:hidden">
                    {match.awayTeam.name.substring(0, 3).toUpperCase()}
                </span>
            </div>
        </div>
       <p className="text-center text-xs text-brand-text-secondary mt-3 truncate" title={match.league}>{match.league}</p>
    </div>
  );
};

export default React.memo(MatchCard);