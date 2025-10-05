
import React, { useState, useEffect, useMemo } from 'react';
import { Match } from '../types';
import { getMatchesByDate } from '../services/matchService';
import MatchList from './MatchList';
import { FootballIcon } from './icons';

interface MatchesByDayProps {
  date: string;
  onSelectMatch: (match: Match) => void;
}

const MatchesByDay: React.FC<MatchesByDayProps> = ({ date, onSelectMatch }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedMatches = await getMatchesByDate(date);
        setMatches(fetchedMatches);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred while fetching matches.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [date]);

  useEffect(() => {
    const fetchLiveUpdates = async () => {
      try {
          const fetchedMatches = await getMatchesByDate(date);
          setMatches(fetchedMatches);
      } catch (e: any) {
          console.warn("Could not fetch live updates:", e.message);
      }
    };
    
    // Start polling after initial load
    if (!loading) {
      const intervalId = setInterval(fetchLiveUpdates, 60000); // Poll every 60 seconds
      return () => clearInterval(intervalId);
    }
  }, [date, loading]);

  const groupedByCountry = useMemo(() => {
    interface CountryGroup {
        leagues: Record<string, Match[]>;
        flag: string | null;
    }

    const groups: Record<string, CountryGroup> = {};
    
    matches.forEach(match => {
        const countryName = match.area?.name || 'International';
        const leagueName = match.league;

        if (!groups[countryName]) {
            groups[countryName] = {
                leagues: {},
                flag: match.area?.flag || null
            };
        }
        if (!groups[countryName].leagues[leagueName]) {
            groups[countryName].leagues[leagueName] = [];
        }
        groups[countryName].leagues[leagueName].push(match);
    });
    return groups;
  }, [matches]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-16">
        <FootballIcon className="w-16 h-16 text-brand-primary animate-pulse" />
        <p className="text-lg mt-4 text-brand-text-secondary">Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-400 text-red-100 px-4 py-3 rounded-lg relative text-center" role="alert">
        <strong className="font-bold">Error Fetching Matches</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <p className="text-center pt-16 text-brand-text-secondary">
        No matches found for this day.
      </p>
    );
  }
  
  const countryOrder = ['Spain', 'France', 'England', 'Germany', 'Italy', 'Netherlands', 'Portugal', 'Brazil'];
  const sortedCountries = Object.keys(groupedByCountry).sort((a, b) => {
    const indexA = countryOrder.indexOf(a);
    const indexB = countryOrder.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both in custom order
    if (indexA !== -1) return -1; // Only A is in custom order
    if (indexB !== -1) return 1; // Only B is in custom order
    return a.localeCompare(b); // Neither are in custom order, sort alphabetically
  });

  return (
    <div className="space-y-8">
      {sortedCountries.map(countryName => {
        const leagues = groupedByCountry[countryName].leagues;
        let sortedLeagues = Object.keys(leagues).sort((a, b) => a.localeCompare(b));

        if (countryName === 'England') {
            const leagueOrder = ['Premier League', 'Championship'];
            sortedLeagues = Object.keys(leagues).sort((a, b) => {
                const indexA = leagueOrder.indexOf(a);
                const indexB = leagueOrder.indexOf(b);

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b);
            });
        }
        
        return (
            <div key={countryName} className="bg-brand-card-alt rounded-lg shadow-lg p-4">
            <div className="flex items-center mb-4">
                <img src={groupedByCountry[countryName].flag || ''} alt={countryName} className="w-6 h-6 rounded-full mr-3 object-cover"/>
                <h3 className="text-xl font-bold text-brand-text">{countryName}</h3>
            </div>
            <div className="space-y-6">
                {sortedLeagues.map(leagueName => (
                    <div key={leagueName}>
                        <h4 className="text-lg font-semibold text-brand-primary mb-2">{leagueName}</h4>
                        <MatchList 
                            matches={leagues[leagueName]} 
                            onSelectMatch={onSelectMatch} 
                        />
                    </div>
                ))}
            </div>
            </div>
        )
      })}
    </div>
  );
};

export default MatchesByDay;