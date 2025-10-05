import React, { useState } from 'react';
import { Match } from '../types';
import MatchesByDay from './MatchesByDay';

interface MatchesViewProps {
  onSelectMatch: (match: Match) => void;
}

// Helper to format date to YYYY-MM-DD for API and input
const formatDateForApi = (date: Date): string => date.toISOString().split('T')[0];

const MatchesView: React.FC<MatchesViewProps> = ({ onSelectMatch }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const setDateAndResetTime = (date: Date) => {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0); // Normalize time part for reliable comparison
      setSelectedDate(newDate);
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // The value from a date input is 'YYYY-MM-DD'. Creating a new Date from this string
    // can lead to timezone issues (e.g., being off by one day).
    // Parsing it manually ensures it's created in the user's local timezone.
    const dateString = event.target.value;
    const [year, month, day] = dateString.split('-').map(Number);
    const dateInLocalTimezone = new Date(year, month - 1, day);
    setDateAndResetTime(dateInLocalTimezone);
  };
  
  const handleSetDatePreset = (preset: 'yesterday' | 'today' | 'tomorrow') => {
      const newDate = new Date();
      if (preset === 'yesterday') {
          newDate.setDate(newDate.getDate() - 1);
      } else if (preset === 'tomorrow') {
          newDate.setDate(newDate.getDate() + 1);
      }
      setDateAndResetTime(newDate);
  };
  
  const selectedDateString = formatDateForApi(selectedDate);

  const isPresetActive = (preset: 'yesterday' | 'today' | 'tomorrow'): boolean => {
      const presetDate = new Date();
      presetDate.setHours(0,0,0,0);
      if (preset === 'yesterday') presetDate.setDate(presetDate.getDate() - 1);
      if (preset === 'tomorrow') presetDate.setDate(presetDate.getDate() + 1);
      
      const selected = new Date(selectedDate);
      selected.setHours(0,0,0,0);

      return selected.getTime() === presetDate.getTime();
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-text text-center">
        Find Matches by Date
      </h2>
      
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 bg-brand-card p-3 rounded-xl shadow-lg">
        <button
          onClick={() => handleSetDatePreset('yesterday')}
          className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 ${isPresetActive('yesterday') ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-background text-brand-text-secondary hover:bg-brand-secondary hover:text-white'}`}
        >
          Yesterday
        </button>
        <button
          onClick={() => handleSetDatePreset('today')}
          className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 ${isPresetActive('today') ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-background text-brand-text-secondary hover:bg-brand-secondary hover:text-white'}`}
        >
          Today
        </button>
        <button
          onClick={() => handleSetDatePreset('tomorrow')}
          className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 ${isPresetActive('tomorrow') ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-background text-brand-text-secondary hover:bg-brand-secondary hover:text-white'}`}
        >
          Tomorrow
        </button>

        {/* Date Picker */}
        <div className="relative">
            <input
                type="date"
                value={selectedDateString}
                onChange={handleDateChange}
                className="bg-brand-background border border-brand-secondary text-brand-text rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                style={{ colorScheme: 'dark' }}
                aria-label="Select a date"
            />
        </div>
      </div>

      <MatchesByDay 
        key={selectedDateString}
        date={selectedDateString} 
        onSelectMatch={onSelectMatch} 
      />
    </div>
  );
};

export default MatchesView;
