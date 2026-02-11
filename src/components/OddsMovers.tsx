import React from 'react';
import { ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import type { OddsMovers } from '@/types/team';
import { formatPercent } from '@/lib/utils';

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
    <div className="bg-white py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column - Bubble Watch */}
          {sortedBubbleTeams.length > 0 && (
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 ibm-plex-sans">
                Bubble Watch
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Teams closest to the cut line. High volatility for wins and losses.
              </p>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Team
                      </th>
                      <th className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase"></th>
                      <th className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Odds
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBubbleTeams.map((team) => {
                      const changeMagnitude = Math.abs(team.change ?? 0);
                      const hasChange = changeMagnitude >= 1;
                      const formattedChange = formatPercent(changeMagnitude, {
                        includeSymbol: false,
                        decimals: 0,
                        showLessThanOne: false,
                      });
                      const formattedOdds = formatPercent(team.currentOdds, { decimals: 0 });

                      return (
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
                              <span className="text-gray-900 font-medium text-sm">
                                {team.displayName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {hasChange ? (
                              <div className={`flex items-center justify-end gap-1 ${
                                team.change > 0 ? 'text-green-800/50' : 'text-red-800/50'
                              }`}>
                                <span className="font-medium geist-mono text-xs">
                                  {team.change > 0 ? '+' : '-'}{formattedChange}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 geist-mono text-xs"></span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            <span className="font-medium geist-mono">
                              {formattedOdds}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
              
              </div>
                <p className="mt-4 text-gray-500 text-xs cursor-pointer hover:underline"><a href="/all-teams">Full teams list »</a></p>
            </div>
          )}

          {/* Right Column - Movers (Stacked) */}
          <div className="space-y-8">
            {/* Biggest Risers */}
            {moversData.biggestRisers.length > 0 && (
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 ibm-plex-sans">
                  Today's Biggest Movers
                </h2>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-1 ibm-plex-sans">
                  <ArrowUp className="w-5 h-5 text-green-700" />
                  Highest Risers
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {moversData.biggestRisers.slice(0, 4).map((team) => {
                    const changeMagnitude = Math.abs(team.change ?? 0);
                    const hasChange = changeMagnitude >= 1;
                    const changeLabel = formatPercent(team.change ?? 0, {
                      includeSymbol: false,
                      decimals: 0,
                      showLessThanOne: false,
                    });
                    return (
                      <div
                        key={team.espnId}
                        className="flex flex-col items-center text-center p-4 rounded-md border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                        onClick={() => onTeamSelect(team.slug)}
                      >
                        <img
                          src={team.logo}
                          alt={team.displayName}
                          className="w-9 h-9 object-contain mb-3"
                        />
                        <span className="text-gray-900 font-medium text-sm mb-2 line-clamp-2">
                          {team.displayName}
                        </span>
                        {hasChange && (
                          <div className="flex items-center gap-1 text-green-700">
                            <span className="font-bold geist-mono text-base">
                              +{changeLabel}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Biggest Fallers */}
            {moversData.biggestFallers.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-1 ibm-plex-sans">
                  <ArrowDown className="w-5 h-5 text-red-700" />
                  Headed Down
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {moversData.biggestFallers.slice(0, 4).map((team) => {
                    const changeMagnitude = Math.abs(team.change ?? 0);
                    const hasChange = changeMagnitude >= 1;
                    const changeLabel = formatPercent(Math.abs(team.change ?? 0), {
                      includeSymbol: false,
                      decimals: 0,
                      showLessThanOne: false,
                    });
                    return (
                      <div
                        key={team.espnId}
                        className="flex flex-col items-center text-center p-4 rounded-md border border-gray-200 hover:border-red-300 hover:bg-red-50 cursor-pointer transition-all"
                        onClick={() => onTeamSelect(team.slug)}
                      >
                        <img
                          src={team.logo}
                          alt={team.displayName}
                          className="w-9 h-9 object-contain mb-3"
                        />
                        <span className="text-gray-900 font-medium text-sm mb-2 line-clamp-2">
                          {team.displayName}
                        </span>
                        {hasChange && (
                          <div className="flex items-center gap-1 text-red-700">
                            <span className="font-bold geist-mono text-base">
                              -{changeLabel}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
