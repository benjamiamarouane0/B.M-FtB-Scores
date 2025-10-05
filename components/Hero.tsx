import React from 'react';

const Hero: React.FC = () => {
  return (
    <div
      className="relative rounded-xl overflow-hidden mb-8 shadow-2xl animate-fade-in bg-brand-card bg-cover"
      style={{
        minHeight: '320px',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url('https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg')`,
        backgroundPosition: 'center center',
      }}
      aria-label="A football on a lush green pitch in a packed stadium"
    >
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4" style={{minHeight: '320px'}}>
        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight uppercase"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          Your Ultimate Front-Row Seat
        </h2>
        <p className="mt-4 text-xl sm:text-2xl font-semibold text-brand-primary"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
          To Global Football Action.
        </p>
      </div>
    </div>
  );
};

export default React.memo(Hero);