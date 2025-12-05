import { useTheme } from "../contexts/ThemeContext";
import { getAvatarUrl, getTeamName } from "../utils/avatarUtils";
import "./PowerRankings.css";

/**
 * PowerRankings Component
 *
 * Displays team power rankings as horizontal bar graphs
 * Rankings are calculated based on wins and points
 */
function PowerRankings({ rosters, users }) {
  const { theme } = useTheme();

  if (!rosters || !users) {
    return null;
  }

  // Calculate power ranking score (wins * 100 + points)
  const calculatePowerScore = (roster) => {
    return (roster.settings.wins * 100) + roster.settings.fpts;
  };

  // Sort teams by power score
  const rankedTeams = [...rosters]
    .map((roster) => ({
      ...roster,
      name: getTeamName(roster, users),
      avatar: getAvatarUrl(roster, users),
      powerScore: calculatePowerScore(roster),
    }))
    .sort((a, b) => b.powerScore - a.powerScore);

  // Get max score for bar width calculation
  const maxScore = Math.max(...rankedTeams.map((team) => team.powerScore));

  // Get rank colors based on position
  const getRankColor = (index) => {
    if (index === 0) return theme.status.success; // 1st place - green
    if (index === 1 || index === 2) return theme.text.accent; // 2nd/3rd - accent
    if (index >= rankedTeams.length - 2) return theme.status.error; // Bottom 2 - red
    return theme.interactive.primary; // Middle teams - primary
  };

  return (
    <div className="power-rankings-section">
      <h2 className="power-rankings-title" style={{ color: theme.text.primary }}>
        Power Rankings
      </h2>
      <p className="power-rankings-subtitle" style={{ color: theme.text.secondary }}>
        Rankings based on wins and total points scored
      </p>

      <div className="power-rankings-list">
        {rankedTeams.map((team, index) => {
          const barWidth = (team.powerScore / maxScore) * 100;
          const rankColor = getRankColor(index);

          return (
            <div
              key={team.roster_id}
              className="power-ranking-item"
              style={{
                background: theme.bg.tertiary,
                border: `1px solid ${theme.border.primary}`,
              }}
            >
              <div className="ranking-info">
                <span className="ranking-position" style={{ color: rankColor }}>
                  #{index + 1}
                </span>
                {team.avatar && (
                  <img
                    src={team.avatar}
                    alt={`${team.name} avatar`}
                    className="ranking-avatar"
                  />
                )}
                <span className="ranking-team-name" style={{ color: theme.text.primary }}>
                  {team.name}
                </span>
              </div>

              <div className="ranking-stats">
                <span className="ranking-record" style={{ color: theme.text.secondary }}>
                  {team.settings.wins}-{team.settings.losses}
                </span>
                <span className="ranking-points" style={{ color: theme.text.secondary }}>
                  {team.settings.fpts.toFixed(1)} pts
                </span>
              </div>

              <div
                className="ranking-bar-container"
                style={{
                  background: theme.bg.primary,
                }}
              >
                <div
                  className="ranking-bar"
                  style={{
                    width: `${barWidth}%`,
                    background: rankColor,
                  }}
                >
                  <span className="ranking-score" style={{ color: theme.text.inverse }}>
                    {team.powerScore.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="power-rankings-legend" style={{ borderTop: `1px solid ${theme.border.primary}` }}>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: theme.status.success }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>1st Place</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: theme.text.accent }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>Top 3</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: theme.interactive.primary }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>Middle</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: theme.status.error }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>Bottom 2</span>
        </div>
      </div>
    </div>
  );
}

export default PowerRankings;
