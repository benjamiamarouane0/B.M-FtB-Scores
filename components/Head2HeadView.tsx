import React from 'react';
import { Head2Head, Match } from '../types';
import MatchList from './MatchList';

interface Head2HeadViewProps {
  data: Head2Head;
  onSelectMatch: (match: Match) => void;
}

const Head2HeadView: React.FC<Head2HeadViewProps> = ({ data, onSelectMatch }) => {
  const { aggregates, matches } = data;

  if (!aggregates || matches.length === 0) {
    return <p className="text-center p-8 text-brand-text-secondary">No historical data available for these teams.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4 text-brand-primary">Matchup History</h3>
        <div className="bg-brand-background rounded-lg p-4 grid grid-cols-3 divide-x divide-brand-secondary text-center">
          <div className="px-2">
            <p className="text-2xl font-bold">{aggregates.homeTeam.wins}</p>
            <p className="text-sm text-brand-text-secondary">{aggregates.homeTeam.name} Wins</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold">{aggregates.homeTeam.draws}</p>
            <p className="text-sm text-brand-text-secondary">Draws</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold">{aggregates.awayTeam.wins}</p>
            <p className="text-sm text-brand-text-secondary">{aggregates.awayTeam.name} Wins</p>
          </div>
        </div>
      </div>
      
      <MatchList matches={matches} onSelectMatch={onSelectMatch} />
    </div>
  );
};

export default Head2HeadView;