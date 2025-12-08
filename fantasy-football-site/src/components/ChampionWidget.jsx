import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./ChampionWidget.css";

function ChampionWidget({ currentLeagueId }) {
  const { theme } = useTheme();
  const [championData, setChampionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // get current league, find last year's league ID
    fetch(`https://api.sleeper.app/v1/league/${currentLeagueId}`)
      .then((response) => response.json())
      .then((currentLeague) => {
        const prevLeagueId = currentLeague.previous_league_id;

        if (!prevLeagueId) {
          setLoading(false);
          return;
        }

        //get previous year's league, rosters, users

        Promise.all([
          fetch(`https://api.sleeper.app/v1/league/${prevLeagueId}`).then((r) =>
            r.json()
          ),
          fetch(
            `https://api.sleeper.app/v1/league/${prevLeagueId}/rosters`
          ).then((r) => r.json()),
          fetch(`https://api.sleeper.app/v1/league/${prevLeagueId}/users`).then(
            (r) => r.json()
          ),
        ]).then(([league, rosters, users]) => {
          const winnerRosterId = Number(
            league.metadata?.latest_league_winner_roster_id
          );

          const championRoster = rosters.find(
            (roster) => roster.roster_id === winnerRosterId
          );

          if (championRoster) {
            const championUser = users.find(
              (u) => u.user_id === championRoster.owner_id
            );

            setChampionData({
              season: league.season,
              teamName:
                championUser?.metadata?.team_name || championUser?.display_name,
              avatar: championUser?.metadata?.avatar,
              wins: championRoster.settings.wins,
              losses: championRoster.settings.losses,
              points: championRoster.settings.fpts,
            });
          }

          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error fetching champion data:", error);
        setLoading(false);
      });
  }, [currentLeagueId]);

  if (loading) {
    return (
      <div
        className="champion-widget"
        style={{
          background: theme.bg.tertiary,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        <h3 style={{ color: theme.text.primary }}>🏆 Reigning Champion</h3>
        <p style={{ color: theme.text.secondary }}>Loading...</p>
      </div>
    );
  }

  if (!championData) {
    return (
      <div
        className="champion-widget"
        style={{
          background: theme.bg.tertiary,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        <h3 style={{ color: theme.text.primary }}>🏆 Reigning Champion</h3>
        <p style={{ color: theme.text.secondary }}>No previous season data</p>
      </div>
    );
  }

  return (
    <div
      className="champion-widget"
      style={{
        background: theme.bg.tertiary,
        border: `1px solid ${theme.border.primary}`,
      }}
    >
      <h3 style={{ color: theme.text.primary }}>🏆 Reigning Champion</h3>
      <div className="champion-content">
        <div
          className="champion-season"
          style={{ color: theme.text.secondary }}
        >
          {championData.season} Season
        </div>
        {championData.avatar && (
          <img
            src={championData.avatar}
            alt="Champion avatar"
            className="champion-avatar"
            style={{ border: `3px solid ${theme.border.accent}` }}
          />
        )}
        <div className="champion-name" style={{ color: theme.text.primary }}>
          {championData.teamName}
        </div>
        <div
          className="champion-stats"
          style={{ borderTop: `1px solid ${theme.border.primary}` }}
        >
          <div className="stat">
            <span className="stat-label" style={{ color: theme.text.secondary }}>
              Record
            </span>
            <span className="stat-value" style={{ color: theme.text.primary }}>
              {championData.wins}-{championData.losses}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label" style={{ color: theme.text.secondary }}>
              Points
            </span>
            <span className="stat-value" style={{ color: theme.text.primary }}>
              {championData.points.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChampionWidget;
