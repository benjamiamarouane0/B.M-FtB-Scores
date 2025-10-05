import React from 'react';
import { Match } from '../types';
import MatchCard from './MatchCard';

interface MatchListProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, onSelectMatch }) => {
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING');
  const liveMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'HT');
  const finishedMatches = matches.filter(m => m.status === 'FT' || m.status === 'CANCELLED' || m.status === 'POSTPONED' || m.status === 'SUSPENDED');

  const renderMatchSection = (title: string, matchList: Match[]) => {
    if (matchList.length === 0) return null;
    const sortedMatches = matchList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-brand-text mb-4 pb-2 border-b-2 border-brand-secondary">{title}</h3>
        <div className="grid grid-cols-1 gap-4">
          {sortedMatches.map(match => (
            <MatchCard key={match.id} match={match} onSelectMatch={onSelectMatch} />
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
      {renderMatchSection('Live Matches', liveMatches)}
      {renderMatchSection('Upcoming Matches', upcomingMatches)}
      {renderMatchSection('Finished & Other Matches', finishedMatches)}
    </div>
  );
};

export default MatchList;
