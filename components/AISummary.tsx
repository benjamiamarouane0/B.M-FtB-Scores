import React, { useState, useCallback } from 'react';
import { Match } from '../types';
import { generateMatchSummary } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface AISummaryProps {
  match: Match;
}

const AISummary: React.FC<AISummaryProps> = ({ match }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMatchSummary(match);
      setSummary(result);
    } catch (e: any) {
      setError(e.message || 'An error occurred while generating the summary.');
    } finally {
      setIsLoading(false);
    }
  }, [match]);

  return (
    <div className="p-4 bg-brand-card-alt rounded-b-lg text-center">
      <div className="max-w-2xl mx-auto">
        <SparklesIcon className="w-12 h-12 text-brand-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold text-brand-text mb-2">AI-Powered Match Summary</h3>
        <p className="text-brand-text-secondary mb-6">
          Get a narrative summary of the match, powered by generative AI. The summary will be based on the latest available match events.
        </p>
        
        <button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="bg-brand-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isLoading ? (
             <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
             </>
          ) : summary ? 'Regenerate Summary' : 'Generate Summary'}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        
        {summary && (
          <div className="mt-8 p-4 bg-brand-background rounded-lg text-left border border-brand-secondary">
            <p className="whitespace-pre-wrap text-brand-text leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummary;
