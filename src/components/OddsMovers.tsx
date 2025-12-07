import React from 'react';
import { ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import type { OddsMovers } from '@/types/team';

type OddsMoversProps = {
  moversData?: OddsMovers;
  onTeamSelect: (slug: string) => void;
};

export function OddsMovers({ moversData, onTeamSelect }: OddsMoversProps) {
  if (!moversData || (!moversData.biggestRisers.length && !moversData.biggestFallers.length)) {
    return null;
  }

  // Sort bubble teams from highest to lowest odds
  const sortedBubbleTeams = moversData.bubbleTeams 
    ? [...moversData.bubbleTeams].sort((a, b) => b.currentOdds - a.currentOdds)
    : [];

  return (
    <div className="bg-white mt-12 py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column - Bubble Watch */}
          {sortedBubbleTeams.length > 0 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                Bubble Watch
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Teams closest to 50% tournament odds
              </p>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Team
                      </th>
                      <th className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Odds
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBubbleTeams.map((team) => (
                      <tr
                        key={team.espnId}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onTeamSelect(team.slug)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={team.logo}
                              alt={team.displayName}
                              className="w-6 h-6 object-contain"
                            />
                            <span className="text-gray-900 font-medium text-md">
                              {team.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-md">
                          <span className="font-medium geist-mono">
                            {team.currentOdds}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Right Column - Movers (Stacked) */}
          <div className="space-y-8">
            {/* Biggest Risers */}
            {moversData.biggestRisers.length > 0 && (
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                  Today's Biggest Movers
                </h2>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-1">
                  <ArrowUp className="w-5 h-5 text-green-700" />
                  Highest Risers
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {moversData.biggestRisers.slice(0, 4).map((team) => (
                    <div
                      key={team.espnId}
                      className="flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                      onClick={() => onTeamSelect(team.slug)}
                    >
                      <img
                        src={team.logo}
                        alt={team.displayName}
                        className="w-12 h-12 object-contain mb-3"
                      />
                      <span className="text-gray-900 font-medium text-sm mb-2 line-clamp-2">
                        {team.displayName}
                      </span>
                      <div className="flex items-center gap-1 text-green-700">
                        <ArrowUp className="w-4 h-4" />
                        <span className="font-bold geist-mono text-base">
                          +{team.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Biggest Fallers */}
            {moversData.biggestFallers.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-1">
                  <ArrowDown className="w-5 h-5 text-red-700" />
                  Falling Fast
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {moversData.biggestFallers.slice(0, 4).map((team) => (
                    <div
                      key={team.espnId}
                      className="flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 cursor-pointer transition-all"
                      onClick={() => onTeamSelect(team.slug)}
                    >
                      <img
                        src={team.logo}
                        alt={team.displayName}
                        className="w-12 h-12 object-contain mb-3"
                      />
                      <span className="text-gray-900 font-medium text-sm mb-2 line-clamp-2">
                        {team.displayName}
                      </span>
                      <div className="flex items-center gap-1 text-red-700">
                        <ArrowDown className="w-4 h-4" />
                        <span className="font-bold geist-mono text-base">
                          {team.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
