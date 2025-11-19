import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

function Layout({ leagueData, children }) {
  return (
    <div className="layout">
      {/* Left sidebar, navigation */}
      <aside className="nav-sidebar">
        <div className="sidebar-header">
          <h2>{leagueData?.name || "Fantasy League"}</h2>
          <p>Season {leagueData?.season || "2024"}</p>
        </div>
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/matchups" end className="nav-link">
                Matchups
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/standings" end className="nav-link">
                Standings
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      <aside className="widgets-sidebar">{children}</aside>
    </div>
  );
}

export default Layout;
