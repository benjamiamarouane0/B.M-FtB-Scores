

import React from 'react';
import { Standing } from '../types';

interface StandingsTableProps {
  standings: Standing[];
}

const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  // Find all standings of type 'TOTAL' that have a table with entries.
  const totalStandings = standings.filter(s => s.type === 'TOTAL' && s.table.length > 0);

  if (totalStandings.length === 0) {
    return (
      <div className="text-center p-8 bg-brand-card-alt rounded-lg">
        <p className="text-brand-text-secondary">Standings are not available for this competition.</p>
      </div>
    );
  }

  // Check if there are multiple groups, which is common for tournaments.
  const hasGroups = totalStandings.length > 1 && totalStandings.some(s => s.group !== null);

  if (hasGroups) {
    return (
      <div className="space-y-8 animate-fade-in">
        {totalStandings.map((standing, index) => (
          <div key={index} className="bg-brand-card-alt rounded-lg shadow-xl overflow-hidden">
            {standing.group && (
              <h3 className="text-lg font-bold text-brand-text p-4 bg-brand-secondary">
                {standing.group.replace(/_/g, ' ')}
              </h3>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-brand-text uppercase bg-brand-secondary/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-center">#</th>
                            <th scope="col" className="px-6 py-3">Team</th>
                            <th scope="col" className="px-2 py-3 text-center">P</th>
                            <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">W</th>
                            <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">D</th>
                            <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">L</th>
                            <th scope="col" className="px-2 py-3 text-center">GD</th>
                            <th scope="col" className="px-4 py-3 text-center font-bold">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standing.table.map(entry => (
                            <tr key={entry.team.id} className="border-b border-brand-secondary hover:bg-brand-secondary/50">
                                <td className="px-4 py-3 text-center font-medium text-brand-text">{entry.position}</td>
                                <th scope="row" className="px-6 py-3 font-medium text-brand-text whitespace-nowrap flex items-center space-x-3">
                                    <img loading="lazy" src={entry.team.crest} alt={entry.team.name} className="w-6 h-6 object-contain bg-brand-secondary rounded-full" />
                                    <span>{entry.team.name}</span>
                                </th>
                                <td className="px-2 py-3 text-center">{entry.playedGames}</td>
                                <td className="px-2 py-3 text-center hidden sm:table-cell">{entry.won}</td>
                                <td className="px-2 py-3 text-center hidden sm:table-cell">{entry.draw}</td>
                                <td className="px-2 py-3 text-center hidden sm:table-cell">{entry.lost}</td>
                                <td className="px-2 py-3 text-center">{entry.goalDifference}</td>
                                <td className="px-4 py-3 text-center font-bold text-brand-text">{entry.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for single table standings (like a regular league).
  const singleTable = totalStandings[0];
  return (
    <div className="bg-brand-card-alt rounded-lg shadow-xl overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-brand-text-secondary">
                <thead className="text-xs text-brand-text uppercase bg-brand-secondary">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-center">#</th>
                        <th scope="col" className="px-6 py-3">Team</th>
                        <th scope="col" className="px-2 py-3 text-center">P</th>
                        <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">W</th>
                        <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">D</th>
                        <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">L</th>
                        <th scope="col" className="px-2 py-3 text-center">GD</th>
                        <th scope="col" className="px-4 py-3 text-center font-bold">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {singleTable.table.map(entry => (
                        <tr key={entry.team.id} className="border-b border-brand-secondary hover:bg-brand-secondary/50">
                            <td className="px-4 py-3 text-center font-medium text-brand-text">{entry.position}</td>
                            <th scope="row" className="px-6 py-3 font-medium text-brand-text whitespace-nowrap flex items-center space-x-3">
                                <img loading="lazy" src={entry.team.crest} alt={entry.team.name} className="w-6 h-6 object-contain bg-brand-secondary rounded-full" />
                                <span>{entry.team.name}</span>
                            </th>
                            <td className="px-2 py-3 text-center">{entry.playedGames}</td>
                            <td className="px-2 py-3 text-center hidden sm:table-cell">{entry.won}</td>
                            <td className="px-2 py-3 text-center hidden sm:table-cell">{entry.draw}</td>
                            <td className="px-2 py-3 text-center hidden sm:table-cell">{entry.lost}</td>
                            <td className="px-2 py-3 text-center">{entry.goalDifference}</td>
                            <td className="px-4 py-3 text-center font-bold text-brand-text">{entry.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StandingsTable;