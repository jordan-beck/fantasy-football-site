import { useTheme } from "../contexts/ThemeContext";
import Blog from "./Blog";
import PowerRankings from "./PowerRankings";
import "./Home.css";

function Home({ leagueData, rosters, users }) {
  const { theme } = useTheme();

  return (
    <>
      <div
        className="home-container"
        style={{
          background: theme.bg.secondary,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        <h1 className="home-title" style={{ color: theme.text.primary }}>
          Welcome to {leagueData?.name || "Fantasy League"}
        </h1>

        <div className="league-info" style={{ borderTop: `1px solid ${theme.border.primary}` }}>
          <div className="info-section">
            <h2 style={{ color: theme.text.primary }}>League Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label" style={{ color: theme.text.secondary }}>
                  Season
                </span>
                <span className="info-value" style={{ color: theme.text.primary }}>
                  {leagueData?.season || "2024"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ color: theme.text.secondary }}>
                  Total Teams
                </span>
                <span className="info-value" style={{ color: theme.text.primary }}>
                  {leagueData?.total_rosters || "12"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ color: theme.text.secondary }}>
                  Scoring Type
                </span>
                <span className="info-value" style={{ color: theme.text.primary }}>
                  {leagueData?.scoring_settings?.rec ? "PPR" : "Standard"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ color: theme.text.secondary }}>
                  Current Week
                </span>
                <span className="info-value" style={{ color: theme.text.primary }}>
                  Week {leagueData?.settings?.leg || "1"}
                </span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2 style={{ color: theme.text.primary }}>About</h2>
            <p style={{ color: theme.text.secondary }}>
              Track your fantasy football league stats, view weekly matchups, check current standings,
              and see who holds the championship title. Use the navigation menu to explore different
              sections of your league.
            </p>
          </div>
        </div>

        {/* Blog Section */}
        <Blog />
      </div>

      <div
        className="home-container"
        style={{
          background: theme.bg.secondary,
          border: `1px solid ${theme.border.primary}`,
          marginTop: '20px',
        }}
      >
        {/* Power Rankings Section */}
        <PowerRankings rosters={rosters} users={users} />
      </div>
    </>
  );
}

export default Home;
