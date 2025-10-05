

import React, { useMemo } from 'react';
import { Match, MatchEvent, MatchEventType } from '../types';
import { GoalIcon, YellowCardIcon, RedCardIcon, SubstitutionIcon } from './icons';

interface MatchStatsViewProps {
  match: Match;
}

const StatsDisplay: React.FC<{ homeGoals: number, awayGoals: number }> = ({ homeGoals, awayGoals }) => {
    const stats = [
        { label: 'Goals', icon: <GoalIcon className="w-5 h-5" />, home: homeGoals, away: awayGoals },
    ];

    return (
        <div className="grid grid-cols-3 gap-x-2 sm:gap-x-4 text-center items-center py-4">
            {/* Home stats */}
            <div className="space-y-3">
                {stats.map(stat => <div key={`${stat.label}-home`} className="text-2xl font-bold text-brand-text">{stat.home}</div>)}
            </div>
            {/* Labels */}
            <div className="space-y-3">
                {stats.map(stat => (
                    <div key={stat.label} className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-text-secondary">
                        {stat.icon}
                        <span>{stat.label}</span>
                    </div>
                ))}
            </div>
            {/* Away stats */}
            <div className="space-y-3">
                {stats.map(stat => <div key={`${stat.label}-away`} className="text-2xl font-bold text-brand-text">{stat.away}</div>)}
            </div>
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
        case MatchEventType.SUBSTITUTION:
            return <SubstitutionIcon className="w-5 h-5 text-blue-400" />;
        default:
            return null;
    }
};

const MatchStatsView: React.FC<MatchStatsViewProps> = ({ match }) => {
  const { timeline } = useMemo(() => {
    let firstHalfEvents: MatchEvent[] = [];
    let secondHalfEvents: MatchEvent[] = [];
    
    let halftimeMinute = 45;
    // Find the latest minute in the first half to account for stoppage time
    match.events.forEach(event => {
        if(event.minute <= 45 && event.minute > halftimeMinute) {
            halftimeMinute = event.minute;
        }
    });

    match.events.forEach(event => {
      if (event.minute <= halftimeMinute) {
          firstHalfEvents.push(event);
      } else {
          secondHalfEvents.push(event);
      }
    });

    const homeEvents = (events: MatchEvent[]) => events.filter(e => e.teamId === match.homeTeam.id);
    const awayEvents = (events: MatchEvent[]) => events.filter(e => e.teamId === match.awayTeam.id);

    return { 
        timeline: {
            firstHalf: {
                home: homeEvents(firstHalfEvents),
                away: awayEvents(firstHalfEvents),
            },
            secondHalf: {
                home: homeEvents(secondHalfEvents),
                away: awayEvents(secondHalfEvents),
            }
        }
    };
  }, [match]);

  const renderTimelineEvents = (home: MatchEvent[], away: MatchEvent[]) => (
    <div className="grid grid-cols-2 gap-x-4">
        <div className="space-y-3">
            {home.map((event, index) => (
                <div key={`home-${event.minute}-${index}`} className="flex items-center justify-end text-right gap-2 bg-brand-background p-2 rounded-md">
                    <div className="flex-1">
                        <p className="font-semibold text-brand-text">{event.player}</p>
                        {event.detail && <p className="text-xs text-brand-text-secondary">{event.detail}</p>}
                    </div>
                    <EventIcon type={event.type} />
                    <span className="font-bold w-8 text-center">{event.minute}'</span>
                </div>
            ))}
        </div>
        <div className="space-y-3">
             {away.map((event, index) => (
                <div key={`away-${event.minute}-${index}`} className="flex items-center justify-start text-left gap-2 bg-brand-background p-2 rounded-md">
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
  );


  const renderTimeline = () => (
      <div>
        <h4 className="text-lg font-bold text-center mb-4 text-brand-accent">Match Timeline</h4>
        {renderTimelineEvents(timeline.firstHalf.home, timeline.firstHalf.away)}
        
        {(timeline.secondHalf.home.length > 0 || timeline.secondHalf.away.length > 0) && (
            <div className="text-center my-4 py-2 bg-brand-background rounded-full font-bold text-brand-text-secondary text-sm">
                Half Time
            </div>
        )}

        {renderTimelineEvents(timeline.secondHalf.home, timeline.secondHalf.away)}
      </div>
  );
  
  return (
    <div className="p-4 bg-brand-card-alt rounded-b-lg">
        <StatsDisplay homeGoals={match.homeScore ?? 0} awayGoals={match.awayScore ?? 0} />
        {match.events.length > 0 && (
          <>
            <div className="border-t border-brand-secondary my-4"></div>
            {renderTimeline()}
          </>
        )}
    </div>
  );
};

export default MatchStatsView;