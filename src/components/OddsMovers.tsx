import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { OddsMovers } from '@/types/team';

type OddsMoversProps = {
  moversData?: OddsMovers;
  onTeamSelect: (slug: string) => void;
};

export function OddsMovers({ moversData, onTeamSelect }: OddsMoversProps) {
  if (!moversData || (!moversData.biggestRisers.length && !moversData.biggestFallers.length)) {
    return null;
  }

  return (
    <div className="bg-white py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Tournament Odds Movers
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Biggest Risers */}
          {moversData.biggestRisers.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-green-700" />
                Highest Risers
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Team
                      </th>
                      <th className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {moversData.biggestRisers.map((team) => (
                      <tr
                        key={team.espnId}
                        className="border-b border-gray-200 hover:bg-white cursor-pointer transition-colors"
                        onClick={() => onTeamSelect(team.slug)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={team.logo}
                              alt={team.displayName}
                              className="w-8 h-8 object-contain"
                            />
                            <span className="text-gray-900 font-medium">
                              {team.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ArrowUp className="w-4 h-4 text-green-600" />
                            <span className="font-medium geist-mono">
                              +{team.change}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Biggest Fallers */}
          {moversData.biggestFallers.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ArrowDown className="w-5 h-5 text-red-700" />
                Falling Fast
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Team
                      </th>
                      <th className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {moversData.biggestFallers.map((team) => (
                      <tr
                        key={team.espnId}
                        className="border-b border-gray-200 hover:bg-white cursor-pointer transition-colors"
                        onClick={() => onTeamSelect(team.slug)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={team.logo}
                              alt={team.displayName}
                              className="w-8 h-8 object-contain"
                            />
                            <span className="text-gray-900 font-medium">
                              {team.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ArrowDown className="w-4 h-4 text-red-600" />
                            <span className="font-medium geist-mono">
                              {team.change}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
