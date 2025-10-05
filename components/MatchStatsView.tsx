import React, { useMemo } from 'react';
import { Match, MatchEvent, MatchEventType } from '../types';
import { GoalIcon, YellowCardIcon, RedCardIcon } from './icons';

interface MatchStatsViewProps {
  match: Match;
}

const StatBar = ({ label, homeValue, awayValue, icon }: { label: string, homeValue: number, awayValue: number, icon: React.ReactNode }) => {
    return (
        <div className="flex items-center justify-between text-lg font-semibold py-3 border-b border-brand-secondary">
            <span className="w-1/5 text-center">{homeValue}</span>
            <div className="w-3/5 flex items-center justify-center space-x-2 text-brand-text-secondary">
                {icon}
                <span>{label}</span>
            </div>
            <span className="w-1/5 text-center">{awayValue}</span>
        </div>
    );
};

const EventIcon: React.FC<{ type: MatchEventType }> = ({ type }) => {
    switch (type) {
        case MatchEventType.GOAL:
            return <GoalIcon className="w-5 h-5 text-green-400" />;
        case MatchEventType.YELLOW_CARD:
            return <YellowCardIcon className="w-4 h-5 bg-yellow-400 rounded-sm" />;
        case MatchEventType.RED_CARD:
            return <RedCardIcon className="w-4 h-5 bg-red-600 rounded-sm" />;
        default:
            return null;
    }
};

const MatchStatsView: React.FC<MatchStatsViewProps> = ({ match }) => {
  const { homeEvents, awayEvents, stats } = useMemo(() => {
    const homeStats = { goals: 0, yellowCards: 0, redCards: 0 };
    const awayStats = { goals: 0, yellowCards: 0, redCards: 0 };
    const homeEvents: MatchEvent[] = [];
    const awayEvents: MatchEvent[] = [];

    match.events.forEach(event => {
      if (event.teamId === match.homeTeam.id) {
        homeEvents.push(event);
        if (event.type === MatchEventType.GOAL) homeStats.goals++;
        if (event.type === MatchEventType.YELLOW_CARD) homeStats.yellowCards++;
        if (event.type === MatchEventType.RED_CARD) homeStats.redCards++;
      } else {
        awayEvents.push(event);
        if (event.type === MatchEventType.GOAL) awayStats.goals++;
        if (event.type === MatchEventType.YELLOW_CARD) awayStats.yellowCards++;
        if (event.type === MatchEventType.RED_CARD) awayStats.redCards++;
      }
    });
    return { homeEvents, awayEvents, stats: { homeStats, awayStats } };
  }, [match.events, match.homeTeam.id]);

  const renderTimeline = () => {
    if (match.events.length === 0) {
      return null;
    }
    return (
      <div className="mt-8">
        <h4 className="text-lg font-bold text-center mb-4 text-brand-primary">Match Timeline</h4>
        <div className="grid grid-cols-2 gap-x-4">
            {/* Home Team Events */}
            <div className="space-y-3">
                {homeEvents.map((event, index) => (
                    <div key={`home-${index}`} className="flex items-center justify-end text-right gap-2 bg-brand-background p-2 rounded-md">
                        <div className="flex-1">
                            <p className="font-semibold text-brand-text">{event.player}</p>
                            {event.detail && <p className="text-xs text-brand-text-secondary">{event.detail}</p>}
                        </div>
                        <EventIcon type={event.type} />
                        <span className="font-bold w-8 text-center">{event.minute}'</span>
                    </div>
                ))}
            </div>
            {/* Away Team Events */}
            <div className="space-y-3">
                 {awayEvents.map((event, index) => (
                    <div key={`away-${index}`} className="flex items-center justify-start text-left gap-2 bg-brand-background p-2 rounded-md">
                        <span className="font-bold w-8 text-center">{event.minute}'</span>
                        <EventIcon type={event.type} />
                        <div className="flex-1">
                            <p className="font-semibold text-brand-text">{event.player}</p>
                            {event.detail && <p className="text-xs text-brand-text-secondary">{event.detail}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 bg-brand-card-alt rounded-b-lg">
        <StatBar label="Goals" homeValue={stats.homeStats.goals} awayValue={stats.awayStats.goals} icon={<GoalIcon className="w-5 h-5"/>} />
        <StatBar label="Yellow Cards" homeValue={stats.homeStats.yellowCards} awayValue={stats.awayStats.yellowCards} icon={<YellowCardIcon className="w-4 h-5 bg-yellow-400 rounded-sm"/>} />
        <StatBar label="Red Cards" homeValue={stats.homeStats.redCards} awayValue={stats.awayStats.redCards} icon={<RedCardIcon className="w-4 h-5 bg-red-600 rounded-sm"/>} />
        {renderTimeline()}
    </div>
  );
};

export default MatchStatsView;