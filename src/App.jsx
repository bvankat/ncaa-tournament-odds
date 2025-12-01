import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { LandingView } from '@/views/LandingView';
import { TeamView } from '@/views/TeamView';
import { formatRelativeTime, calculateTournamentOdds } from '@/lib/utils';

// (RankingSparkline moved to components/RankingSparkline.jsx)

function App() {
	const [allTeams, setAllTeams] = useState([]);
	const [selectedSlugs, setSelectedSlugs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [lastUpdated, setLastUpdated] = useState(null);
	// Landing gauge: start at 0, animate to a random value post-mount
	const [landingGauge, setLandingGauge] = useState(0);
	useEffect(() => {
		const target = Math.floor(Math.random() * 100);
		const t = setTimeout(() => setLandingGauge(target), 300);
		return () => clearTimeout(t);
	}, []);

	// Shuffle teams once for logo scroller (performance optimization)
	const shuffledTeams = useMemo(() => {
		if (allTeams.length === 0) return [];
		const shuffled = [...allTeams].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 100);
	}, [allTeams]);

	useEffect(() => {
		loadData();

		const path = window.location.pathname;
		const slugs = path.split('/').filter((s) => s);

		if (slugs.length > 0) {
			setSelectedSlugs(slugs);
		}
	}, []);

	const loadData = async () => {
	try {
	  const response = await fetch('all_teams_rankings.json');
	  const data = await response.json();
	  
	  const teamsMap = {};
	  
	  data.teams.forEach(team => {
		teamsMap[team.slug] = {
		  slug: team.slug,
		  // Use slug as a stable unique identifier (JSON has no numeric id)
		  id: team.slug,
		  displayName: team.displayName,
		  shortName: team.shortName,
		  logo: team.logo,
		  primaryColor: team.primaryColor,
		  secondaryColor: team.secondaryColor,
		  // Ranking / efficiency metrics
		  bpi: team.bpi,
		  sor: team.sor,
		  kpi: team.kpi,
		  kenpom: team.kenpomRank,
		  torvik: team.torvikRank,
		  wab: team.wab,
		  net: team.net,
		  // NCAA team sheet fields
		  record: team.record,
		  conference: team.conference,
		  home: team.home,
		  road: team.road,
		  neutral: team.neutral,
		  previous: team.previous,
		  nonDiv1: team.nonDiv1,
		  quad1: team.quad1,
		  quad2: team.quad2,
		  quad3: team.quad3,
		  quad4: team.quad4
		};
	  });
	  const teams = Object.values(teamsMap).sort((a, b) => 
		a.displayName.localeCompare(b.displayName)
	  );
	  
	  setAllTeams(teams);
	  setLastUpdated(data.lastUpdated);
	  setLoading(false);
	} catch (error) {
	  console.error('Error loading data:', error);
	  setLoading(false);
	}
  };

	const goHome = () => {
		window.history.pushState({}, '', '/');
		setSelectedSlugs([]);
	};

  const handleTeamSelect = (slug) => {
	if (slug) {
	  const newPath = `/${slug}`;
	  window.history.pushState({}, '', newPath);
	  setSelectedSlugs([slug]);
	}
  };

  const getTeamBySlug = (slug) => {
	return allTeams.find(t => t.slug === slug);
  };

	// (formatRelativeTime and calculateTournamentOdds moved to lib/utils)

	if (loading) {
	return (
	  <div className="min-h-screen bg-white flex items-center justify-center">
		<div className="text-xl text-gray-600">Loading...</div>
	  </div>
	);
  }

	const isLanding = selectedSlugs.length === 0;

	const selectedTeams = selectedSlugs.map(slug => getTeamBySlug(slug)).filter(Boolean);

	return (
		<div className="min-h-screen bg-white">
			<Layout onHome={goHome} teams={allTeams} selectedSlug={selectedSlugs[0] || ''} onTeamSelect={handleTeamSelect}>
				{isLanding ? (
					<LandingView
						teams={allTeams}
						selectedSlug={selectedSlugs[0] || ''}
						onTeamSelect={handleTeamSelect}
						lastUpdated={lastUpdated}
						formatRelativeTime={formatRelativeTime}
						landingGauge={landingGauge}
						shuffledTeams={shuffledTeams}
					/>
				) : (
					<div className="space-y-0">
						{selectedTeams.map((team) => (
							<TeamView
								key={team.id}
								team={team}
								lastUpdated={lastUpdated}
								formatRelativeTime={formatRelativeTime}
								calculateTournamentOdds={calculateTournamentOdds}
							/>
						))}
					</div>
				)}
			</Layout>
		</div>
	);
}

export default App;