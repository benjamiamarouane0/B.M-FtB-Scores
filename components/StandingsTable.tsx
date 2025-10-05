
import React from 'react';
import { Standing } from '../types';

interface StandingsTableProps {
  standings: Standing[];
}

const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  const totalStandings = standings.find(s => s.type === 'TOTAL');

  if (!totalStandings || totalStandings.table.length === 0) {
    return (
      <div className="text-center p-8 bg-brand-card-alt rounded-lg">
        <p className="text-brand-text-secondary">Standings are not available for this competition.</p>
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
                    {totalStandings.table.map(entry => (
                        <tr key={entry.team.id} className="border-b border-brand-secondary hover:bg-brand-secondary/50">
                            <td className="px-4 py-3 text-center font-medium text-brand-text">{entry.position}</td>
                            <th scope="row" className="px-6 py-3 font-medium text-brand-text whitespace-nowrap flex items-center space-x-3">
                                <img src={entry.team.crest} alt={entry.team.name} className="w-6 h-6 object-contain" />
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