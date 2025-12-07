import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAllTimeStats } from '../../hooks/useAllTimeStats';
import './AllTimeStats.css';

function AllTimeStats({ matchups, allSeasonsData, currentSeason, rosters, previousSeasons }) {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    scoring: true,
    consistency: false,
    domination: false,
    season: false,
    weekly: false,
    manager: false,
    fun: false,
  });
  const [forceRecalculate, setForceRecalculate] = useState(false);

  const { stats, loading, progress, error, recalculate } = useAllTimeStats(
    matchups,
    allSeasonsData,
    currentSeason,
    rosters,
    previousSeasons,
    forceRecalculate
  );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRecalculate = () => {
    setForceRecalculate(true);
    recalculate();
    setTimeout(() => setForceRecalculate(false), 1000);
  };

  if (loading) {
    return (
      <div className="all-time-stats-loading" style={{ color: theme.text.secondary }}>
        <div className="loading-spinner"></div>
        <p>Calculating comprehensive statistics...</p>
        {progress > 0 && (
          <div className="progress-bar" style={{ borderColor: theme.border.primary }}>
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: theme.border.accent,
              }}
            ></div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-time-stats-error" style={{ color: theme.text.tertiary }}>
        <p>Error calculating stats: {error}</p>
        <button
          onClick={handleRecalculate}
          style={{
            color: theme.text.primary,
            borderColor: theme.border.primary,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ color: theme.text.tertiary }}>
        <em>No stats data available</em>
      </div>
    );
  }

  return (
    <div className="all-time-stats-container">
      {/* Recalculate Button */}
      <div className="stats-header">
        <button
          className="recalculate-btn"
          onClick={handleRecalculate}
          style={{
            color: theme.text.secondary,
            borderColor: theme.border.primary,
          }}
        >
          🔄 Recalculate Stats
        </button>
      </div>

      {/* Scoring Extremes Section */}
      <StatsSection
        title="Scoring Extremes"
        sectionKey="scoring"
        expanded={expandedSections.scoring}
        onToggle={() => toggleSection('scoring')}
        theme={theme}
      >
        <StatItem
          label="Highest Score Ever"
          value={stats.scoringExtremes.highestScore ? (
            <>
              <strong>{stats.scoringExtremes.highestScore.points} pts</strong> by{' '}
              {stats.scoringExtremes.highestScore.team}
              <br />
              <span className="context">
                Week {stats.scoringExtremes.highestScore.week}, {stats.scoringExtremes.highestScore.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Lowest Score Ever"
          value={stats.scoringExtremes.lowestScore ? (
            <>
              <strong>{stats.scoringExtremes.lowestScore.points} pts</strong> by{' '}
              {stats.scoringExtremes.lowestScore.team}
              <br />
              <span className="context">
                Week {stats.scoringExtremes.lowestScore.week}, {stats.scoringExtremes.lowestScore.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Biggest Blowout"
          value={stats.scoringExtremes.biggestBlowout ? (
            <>
              <strong>{stats.scoringExtremes.biggestBlowout.margin} pt margin</strong>
              <br />
              {stats.scoringExtremes.biggestBlowout.winner} ({stats.scoringExtremes.biggestBlowout.winnerPoints}) defeated{' '}
              {stats.scoringExtremes.biggestBlowout.loser} ({stats.scoringExtremes.biggestBlowout.loserPoints})
              <br />
              <span className="context">
                Week {stats.scoringExtremes.biggestBlowout.week}, {stats.scoringExtremes.biggestBlowout.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Closest Game"
          value={stats.scoringExtremes.closestGame ? (
            <>
              <strong>{stats.scoringExtremes.closestGame.margin} pt margin</strong>
              <br />
              {stats.scoringExtremes.closestGame.team1} ({stats.scoringExtremes.closestGame.team1Points}) vs{' '}
              {stats.scoringExtremes.closestGame.team2} ({stats.scoringExtremes.closestGame.team2Points})
              <br />
              <span className="context">
                Week {stats.scoringExtremes.closestGame.week}, {stats.scoringExtremes.closestGame.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Most Points in a Loss"
          value={stats.scoringExtremes.mostPointsInLoss ? (
            <>
              <strong>{stats.scoringExtremes.mostPointsInLoss.points} pts</strong> by{' '}
              {stats.scoringExtremes.mostPointsInLoss.team}
              <br />
              <span className="context">
                Week {stats.scoringExtremes.mostPointsInLoss.week}, {stats.scoringExtremes.mostPointsInLoss.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Fewest Points in a Win"
          value={stats.scoringExtremes.fewestPointsInWin ? (
            <>
              <strong>{stats.scoringExtremes.fewestPointsInWin.points} pts</strong> by{' '}
              {stats.scoringExtremes.fewestPointsInWin.team}
              <br />
              <span className="context">
                Week {stats.scoringExtremes.fewestPointsInWin.week}, {stats.scoringExtremes.fewestPointsInWin.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
      </StatsSection>

      {/* Consistency & Averages Section */}
      <StatsSection
        title="Consistency & Averages"
        sectionKey="consistency"
        expanded={expandedSections.consistency}
        onToggle={() => toggleSection('consistency')}
        theme={theme}
      >
        <StatItem
          label="Total Games Played"
          value={<strong>{stats.consistency.totalGamesPlayed?.toLocaleString()}</strong>}
          theme={theme}
        />
        <StatItem
          label="Total Points Scored"
          value={<strong>{parseFloat(stats.consistency.totalPointsScored).toLocaleString()} pts</strong>}
          theme={theme}
        />
        <StatItem
          label="League Average Score"
          value={<strong>{stats.consistency.leagueAverageScore} pts</strong>}
          theme={theme}
        />
      </StatsSection>

      {/* Domination Stats Section */}
      <StatsSection
        title="Domination Stats"
        sectionKey="domination"
        expanded={expandedSections.domination}
        onToggle={() => toggleSection('domination')}
        theme={theme}
      >
        <StatItem
          label="Longest Win Streak"
          value={stats.domination.longestWinStreak ? (
            <>
              <strong>{stats.domination.longestWinStreak.streak} games</strong> by{' '}
              {stats.domination.longestWinStreak.team}
              <br />
              <span className="context">
                {stats.domination.longestWinStreak.weeks}, {stats.domination.longestWinStreak.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Longest Losing Streak"
          value={stats.domination.longestLosingStreak ? (
            <>
              <strong>{stats.domination.longestLosingStreak.streak} games</strong> by{' '}
              {stats.domination.longestLosingStreak.team}
              <br />
              <span className="context">
                {stats.domination.longestLosingStreak.weeks}, {stats.domination.longestLosingStreak.season}
              </span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
      </StatsSection>

      {/* Season Records Section */}
      <StatsSection
        title="Season Records"
        sectionKey="season"
        expanded={expandedSections.season}
        onToggle={() => toggleSection('season')}
        theme={theme}
      >
        <StatItem
          label="Best Regular Season Record"
          value={stats.seasonRecords.bestRecord ? (
            <>
              <strong>{stats.seasonRecords.bestRecord.record}</strong> ({stats.seasonRecords.bestRecord.winPct}%) by{' '}
              {stats.seasonRecords.bestRecord.team}
              <br />
              <span className="context">{stats.seasonRecords.bestRecord.season}</span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Worst Regular Season Record"
          value={stats.seasonRecords.worstRecord ? (
            <>
              <strong>{stats.seasonRecords.worstRecord.record}</strong> ({stats.seasonRecords.worstRecord.winPct}%) by{' '}
              {stats.seasonRecords.worstRecord.team}
              <br />
              <span className="context">{stats.seasonRecords.worstRecord.season}</span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Most Points in a Season"
          value={stats.seasonRecords.mostPointsSeason ? (
            <>
              <strong>{stats.seasonRecords.mostPointsSeason.points} pts</strong> by{' '}
              {stats.seasonRecords.mostPointsSeason.team}
              <br />
              Average: {stats.seasonRecords.mostPointsSeason.average} pts/game
              <br />
              <span className="context">{stats.seasonRecords.mostPointsSeason.season}</span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Fewest Points in a Season"
          value={stats.seasonRecords.fewestPointsSeason ? (
            <>
              <strong>{stats.seasonRecords.fewestPointsSeason.points} pts</strong> by{' '}
              {stats.seasonRecords.fewestPointsSeason.team}
              <br />
              Average: {stats.seasonRecords.fewestPointsSeason.average} pts/game
              <br />
              <span className="context">{stats.seasonRecords.fewestPointsSeason.season}</span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
      </StatsSection>

      {/* Weekly Superlatives Section */}
      <StatsSection
        title="Weekly Superlatives"
        sectionKey="weekly"
        expanded={expandedSections.weekly}
        onToggle={() => toggleSection('weekly')}
        theme={theme}
      >
        <StatItem
          label="Most 150+ Point Weeks"
          value={stats.weekly.most150PointWeeks ? (
            <>
              <strong>{stats.weekly.most150PointWeeks.count} weeks</strong> by{' '}
              {stats.weekly.most150PointWeeks.team}
              <br />
              <span className="context">{stats.weekly.most150PointWeeks.season}</span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Most Sub-100 Point Weeks"
          value={stats.weekly.mostSub100Weeks ? (
            <>
              <strong>{stats.weekly.mostSub100Weeks.count} weeks</strong> by{' '}
              {stats.weekly.mostSub100Weeks.team}
              <br />
              <span className="context">{stats.weekly.mostSub100Weeks.season}</span>
            </>
          ) : 'N/A'}
          theme={theme}
        />
      </StatsSection>

      {/* Manager Records Section */}
      <StatsSection
        title="Manager Records"
        sectionKey="manager"
        expanded={expandedSections.manager}
        onToggle={() => toggleSection('manager')}
        theme={theme}
      >
        <StatItem
          label="Winningest Manager"
          value={stats.managerRecords.winningestManager ? (
            <>
              <strong>{stats.managerRecords.winningestManager.manager}</strong>
              <br />
              Record: {stats.managerRecords.winningestManager.record} ({stats.managerRecords.winningestManager.winPct}%)
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Most Points All-Time"
          value={stats.managerRecords.mostPointsManager ? (
            <>
              <strong>{stats.managerRecords.mostPointsManager.manager}</strong>
              <br />
              Total: {parseFloat(stats.managerRecords.mostPointsManager.points).toLocaleString()} pts | Avg:{' '}
              {stats.managerRecords.mostPointsManager.average} pts/game
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Most Points Against (Unluckiest)"
          value={stats.managerRecords.mostPointsAgainst ? (
            <>
              <strong>{stats.managerRecords.mostPointsAgainst.manager}</strong>
              <br />
              Avg Opponent Score: {stats.managerRecords.mostPointsAgainst.avgOpponentScore} pts/game
              <br />
              Total: {parseFloat(stats.managerRecords.mostPointsAgainst.totalOpponentPoints).toLocaleString()} pts
            </>
          ) : 'N/A'}
          theme={theme}
        />
      </StatsSection>

      {/* Fun Stats Section */}
      <StatsSection
        title="Fun Stats"
        sectionKey="fun"
        expanded={expandedSections.fun}
        onToggle={() => toggleSection('fun')}
        theme={theme}
      >
        <StatItem
          label="Most 'Unlucky' Team"
          value={stats.funStats.unluckiestTeam ? (
            <>
              <strong>{stats.funStats.unluckiestTeam.team}</strong>
              <br />
              Record: {stats.funStats.unluckiestTeam.record} | Points: {stats.funStats.unluckiestTeam.points}
              <br />
              <span className="context">{stats.funStats.unluckiestTeam.season}</span>
              <br />
              <em style={{ fontSize: '0.85em', opacity: 0.8 }}>
                High points but poor record
              </em>
            </>
          ) : 'N/A'}
          theme={theme}
        />
        <StatItem
          label="Most 'Lucky' Team"
          value={stats.funStats.luckiestTeam ? (
            <>
              <strong>{stats.funStats.luckiestTeam.team}</strong>
              <br />
              Record: {stats.funStats.luckiestTeam.record} | Points: {stats.funStats.luckiestTeam.points}
              <br />
              <span className="context">{stats.funStats.luckiestTeam.season}</span>
              <br />
              <em style={{ fontSize: '0.85em', opacity: 0.8 }}>
                Good record despite lower points
              </em>
            </>
          ) : 'N/A'}
          theme={theme}
        />
      </StatsSection>
    </div>
  );
}

// StatsSection Component
function StatsSection({ title, sectionKey, expanded, onToggle, theme, children }) {
  return (
    <div
      className="stats-section"
      style={{
        background: theme.bg.tertiary,
        border: `2px solid ${theme.border.primary}`,
      }}
    >
      <div
        className="stats-section-header"
        onClick={onToggle}
        style={{
          color: theme.text.primary,
          borderBottom: expanded ? `1px solid ${theme.border.primary}` : 'none',
        }}
      >
        <h3>{expanded ? '▼' : '▶'} {title}</h3>
      </div>
      {expanded && (
        <div className="stats-section-content">
          {children}
        </div>
      )}
    </div>
  );
}

// StatItem Component
function StatItem({ label, value, theme }) {
  return (
    <div
      className="stat-item-row"
      style={{
        borderLeft: `3px solid ${theme.border.primary}`,
      }}
    >
      <div className="stat-label" style={{ color: theme.text.secondary }}>
        {label}
      </div>
      <div className="stat-value" style={{ color: theme.text.primary }}>
        {value}
      </div>
    </div>
  );
}

export default AllTimeStats;
