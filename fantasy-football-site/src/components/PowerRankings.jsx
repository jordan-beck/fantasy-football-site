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

  // Get rank colors and tier info based on position
  const getRankTier = (index) => {
    // 1st place - Gold/Yellow
    if (index === 0) {
      return {
        color: '#FFD700',
        shadow: 'rgba(255, 215, 0, 0.6)',
        tier: 'elite',
        label: 'Elite'
      };
    }
    // 2nd-3rd place - Silver/Blue
    if (index === 1 || index === 2) {
      return {
        color: '#00D9FF',
        shadow: 'rgba(0, 217, 255, 0.6)',
        tier: 'contender',
        label: 'Contender'
      };
    }
    // Bottom 2 - Red
    if (index >= rankedTeams.length - 2) {
      return {
        color: '#FF0040',
        shadow: 'rgba(255, 0, 64, 0.6)',
        tier: 'bottom',
        label: 'Bottom'
      };
    }
    // Middle teams - Purple
    return {
      color: '#9D4EDD',
      shadow: 'rgba(157, 78, 221, 0.6)',
      tier: 'middle',
      label: 'Middle Pack'
    };
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
          const tierInfo = getRankTier(index);

          return (
            <div
              key={team.roster_id}
              className={`power-ranking-item tier-${tierInfo.tier}`}
              style={{
                background: theme.bg.tertiary,
                border: `2px solid ${tierInfo.color}`,
                boxShadow: `0 0 15px ${tierInfo.shadow}`,
              }}
            >
              <div className="ranking-info">
                <span
                  className="ranking-position"
                  style={{
                    color: tierInfo.color,
                    textShadow: `0 0 10px ${tierInfo.shadow}`
                  }}
                >
                  #{index + 1}
                </span>
                {team.avatar && (
                  <img
                    src={team.avatar}
                    alt={`${team.name} avatar`}
                    className="ranking-avatar"
                    style={{
                      borderColor: tierInfo.color,
                      boxShadow: `0 0 8px ${tierInfo.shadow}`
                    }}
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
                  borderColor: tierInfo.color,
                }}
              >
                <div
                  className="ranking-bar"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${tierInfo.color}, ${tierInfo.color}dd)`,
                    boxShadow: `0 0 15px ${tierInfo.shadow}, inset 0 0 20px rgba(0, 0, 0, 0.3)`,
                  }}
                >
                  <span className="ranking-score" style={{ color: '#000', fontWeight: 700 }}>
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
          <span className="legend-dot" style={{ background: '#FFD700', boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)' }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>Elite (1st)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#00D9FF', boxShadow: '0 0 8px rgba(0, 217, 255, 0.6)' }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>Contender (2nd-3rd)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#9D4EDD', boxShadow: '0 0 8px rgba(157, 78, 221, 0.6)' }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>Middle Pack</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#FF0040', boxShadow: '0 0 8px rgba(255, 0, 64, 0.6)' }}></span>
          <span className="legend-label" style={{ color: theme.text.secondary }}>Bottom Tier</span>
        </div>
      </div>
    </div>
  );
}

export default PowerRankings;
