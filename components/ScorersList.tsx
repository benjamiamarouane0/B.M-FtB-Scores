

import React from 'react';
import { Scorer } from '../types';

interface ScorersListProps {
  scorers: Scorer[];
  onSelectPlayer: (player: Scorer['player']) => void;
}

const ScorersList: React.FC<ScorersListProps> = ({ scorers, onSelectPlayer }) => {
  if (scorers.length === 0) {
    return (
      <div className="text-center p-8 bg-brand-card-alt rounded-lg">
        <p className="text-brand-text-secondary">Top scorer information is not available for this competition.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-card-alt rounded-lg shadow-xl overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text-secondary">
          <thead className="text-xs text-brand-text uppercase bg-brand-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 text-center">#</th>
              <th scope="col" className="px-6 py-3">Player</th>
              <th scope="col" className="px-6 py-3 hidden sm:table-cell">Team</th>
              <th scope="col" className="px-4 py-3 text-center font-bold">Goals</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((scorer, index) => (
              <tr 
                key={scorer.player.id} 
                className="border-b border-brand-secondary hover:bg-brand-secondary/50 cursor-pointer"
                onClick={() => onSelectPlayer(scorer.player)}
              >
                <td className="px-4 py-3 text-center font-medium text-brand-text">{index + 1}</td>
                <th scope="row" className="px-6 py-3 font-medium text-brand-text whitespace-nowrap">
                  <div className="flex flex-col">
                    <span>{scorer.player.name}</span>
                    <span className="text-xs text-brand-text-secondary font-normal sm:hidden">{scorer.team.name}</span>
                  </div>
                </th>
                <td className="px-6 py-3 hidden sm:table-cell">
                  <div className="flex items-center space-x-3">
                    <img loading="lazy" src={scorer.team.crest} alt={scorer.team.name} className="w-6 h-6 object-contain bg-brand-secondary rounded-full" />
                    <span>{scorer.team.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-brand-text">{scorer.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScorersList;
