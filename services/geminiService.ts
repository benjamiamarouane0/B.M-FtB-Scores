import { GoogleGenAI } from "@google/genai";
import { Match } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateMatchSummary = async (match: Match): Promise<string> => {
  // FIX: Removed API key check, as per guidelines to assume it's always present.
  const eventsText = match.events.length > 0
    ? match.events.map(event =>
        `Minute ${event.minute}: ${event.type} for ${event.teamId === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name} by ${event.player}${event.detail ? ` (${event.detail})` : ''}.`
      ).join('\n')
    : '';

  const scoreText = match.homeScore !== null && match.awayScore !== null
    ? `${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}`
    : 'The match has not started or is in progress.';

  const prompt = `
    Generate a short, exciting, and narrative-style summary for a football match. Do not just list the events. Weave them into a story.

    Match Details:
    - Home Team: ${match.homeTeam.name}
    - Away Team: ${match.awayTeam.name}
    - Score: ${scoreText}
    - League: ${match.league}
    - Status: ${match.status}

    Key Events:
    ${eventsText}

    Based on these details, write a compelling summary of the match. If the match is upcoming or has no events, provide a brief preview or state that the action hasn't started.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating match summary:", error);
    return "Could not generate AI summary at this time. Please try again later.";
  }
};