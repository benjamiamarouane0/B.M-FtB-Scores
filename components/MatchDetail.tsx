import React, { useState, useEffect } from 'react';
import { Match, Head2Head } from '../types';
import { getMatchDetails, getMatchHead2Head } from '../services/matchService';
import { BackArrowIcon, StatsIcon, H2HIcon } from './icons';
import Head2HeadView from './Head2HeadView';
import MatchStatsView from './MatchStatsView';
import useTitle from './useTitle';

interface MatchDetailProps {
  match: Match;
  onBack: () => void;
  onSelectTeam: (teamId: number) => void;
}

type Tab = 'stats' | 'h2h';

const MatchDetail: React.FC<MatchDetailProps> = ({ match: initialMatch, onBack, onSelectTeam }) => {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [head2headData, setHead2headData] = useState<Head2Head | null>(null);
  const [h2hLoading, setH2hLoading] = useState<boolean>(false);
  const [displayMinute, setDisplayMinute] = useState<number | undefined>(initialMatch.minute);

  const pageTitle = `${match.homeTeam.name} vs ${match.awayTeam.name} | B.M FtB Scores`;
  const pageDescription = `Live score and details for the ${match.league} match between ${match.homeTeam.name} and ${match.awayTeam.name}.`;
  useTitle(pageTitle, pageDescription);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      const detailedMatch = await getMatchDetails(initialMatch);
      setMatch(detailedMatch);
      setIsLoadingDetails(false);
    };

    fetchDetails();
  }, [initialMatch]);

  useEffect(() => {
    // Only poll for live or half-time matches
    if (match.status !== 'LIVE' && match.status !== 'HT' && match.status !== 'ET' && match.status !== 'BREAK') {
      return;
    }

    const fetchLatestDetails = async () => {
        const detailedMatch = await getMatchDetails(match);
        setMatch(detailedMatch);
    };

    // Poll every 15 seconds for a more "live" feel.
    const intervalId = setInterval(fetchLatestDetails, 15000); 

    // Cleanup interval on component unmount or when match status changes
    return () => clearInterval(intervalId);
  }, [match]);

  useEffect(() => {
    // When the match data from polling updates, sync the display minute
    setDisplayMinute(match.minute);

    if (match.status !== 'LIVE') {
      return; // Not a live match, no timer needed
    }

    let timer: number;

    // Case 1: The API provides the official minute.
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
    else {
      const matchStartDate = new Date(match.date);
      
      const updateCalculatedMinute = () => {
        const now = new Date();
        const elapsedMilliseconds = now.getTime() - matchStartDate.getTime();
        
        if (elapsedMilliseconds < 0) {
            setDisplayMinute(undefined);
            return;
        }

        const elapsedMinutes = Math.floor(elapsedMilliseconds / 60000);
        
        setDisplayMinute(Math.min(elapsedMinutes, 120));
      };

      updateCalculatedMinute();
      timer = window.setInterval(updateCalculatedMinute, 30000); // Update every 30 seconds
    }

    // Cleanup the interval
    return () => clearInterval(timer);
  }, [match.status, match.minute, match.date]);

  useEffect(() => {
    const fetchH2H = async () => {
      if (activeTab === 'h2h' && !head2headData) {
        setH2hLoading(true);
        const h2h = await getMatchHead2Head(match.id);
        setHead2headData(h2h);
        setH2hLoading(false);
      }
    };
    fetchH2H();
  }, [activeTab, match.id, head2headData]);

  const renderContent = () => {
    switch(activeTab) {
        case 'stats':
            return <MatchStatsView match={match} />;
        case 'h2h':
            if (h2hLoading) {
                return <p className="text-center p-8 text-brand-text-secondary">Loading Head-to-Head...</p>
            }
            if (!head2headData) {
                return <p className="text-center p-8 text-brand-text-secondary">Could not load Head-to-Head data.</p>
            }
            return <Head2HeadView data={head2headData} onSelectMatch={() => {}} />;
        default:
            return null;
    }
  };

  const getStatusText = () => {
      switch (match.status) {
          case 'LIVE': return <div className="text-sm mt-1 text-red-500 font-bold">{displayMinute ? `${displayMinute}'` : 'LIVE'}</div>;
          case 'ET': return <div className="text-sm mt-1 text-red-500 font-bold">{match.minute ? `ET ${match.minute}'` : 'ET'}</div>;
          case 'BREAK': return <div className="text-sm mt-1 text-yellow-400 font-bold">Break</div>;
          case 'HT': return <div className="text-sm mt-1 text-yellow-400 font-bold">Half Time</div>;
          case 'FT': return <div className="text-sm mt-1 text-brand-text-secondary font-bold">Full Time</div>;
          default: return null;
      }
  }

  if (isLoadingDetails) {
    return (
        <div className="bg-brand-card-alt rounded-lg shadow-xl overflow-hidden p-8 flex justify-center items-center" style={{minHeight: '500px'}}>
             <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-4 text-lg">Loading match details...</p>
        </div>
    );
  }

  return (
    <div className="bg-brand-card-alt rounded-lg shadow-xl overflow-hidden animate-fade-in">
      <div className="p-4 bg-brand-secondary">
        <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="text-brand-accent hover:text-sky-300 transition-colors">
                <BackArrowIcon className="w-6 h-6" />
            </button>
            <p className="text-sm text-brand-text-secondary">{match.league}</p>
        </div>
        <div className="flex items-center justify-between text-white gap-x-2 sm:gap-x-4">
          <div
            className="flex items-center justify-end flex-1 space-x-3 text-right truncate cursor-pointer group"
            onClick={() => onSelectTeam(match.homeTeam.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelectTeam(match.homeTeam.id)}
            aria-label={`View details for ${match.homeTeam.name}`}
          >
            <span className="font-bold text-xl hidden sm:inline truncate group-hover:text-brand-accent transition-colors" title={match.homeTeam.name}>{match.homeTeam.name}</span>
            <span className="font-bold text-xl sm:hidden group-hover:text-brand-accent transition-colors">{match.homeTeam.name.substring(0,3).toUpperCase()}</span>
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-10 h-10 rounded-full object-contain flex-shrink-0 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-center px-2 flex-shrink-0">
            <div className="text-4xl font-bold tracking-wider whitespace-nowrap">{`${match.homeScore ?? '-'} - ${match.awayScore ?? '-'}`}</div>
            {getStatusText()}
            {match.status === 'FT' && match.homePenalties !== null && match.awayPenalties !== null && (
                 <div className="text-xs mt-1 text-brand-text-secondary font-bold">
                    Penalties: {match.homePenalties} - {match.awayPenalties}
                 </div>
            )}
          </div>
          <div
            className="flex items-center justify-start flex-1 space-x-3 truncate cursor-pointer group"
            onClick={() => onSelectTeam(match.awayTeam.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelectTeam(match.awayTeam.id)}
            aria-label={`View details for ${match.awayTeam.name}`}
          >
            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-10 h-10 rounded-full object-contain flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl hidden sm:inline truncate group-hover:text-brand-accent transition-colors" title={match.awayTeam.name}>{match.awayTeam.name}</span>
            <span className="font-bold text-xl sm:hidden group-hover:text-brand-accent transition-colors">{match.awayTeam.name.substring(0,3).toUpperCase()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex border-b border-brand-secondary">
        <TabButton icon={<StatsIcon/>} label="Stats" isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        <TabButton icon={<H2HIcon/>} label="H2H" isActive={activeTab === 'h2h'} onClick={() => setActiveTab('h2h')} />
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

interface TabButtonProps {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-300
        ${isActive ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-text-secondary hover:bg-brand-secondary'}`}
        aria-label={label}
    >
        {React.cloneElement(icon, { className: 'w-5 h-5 flex-shrink-0' })}
        <span>{label}</span>
    </button>
)


export default MatchDetail;