import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import "./Layout.css";

function Layout({ leagueData, children }) {
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header
        className="mobile-header"
        style={{
          background: theme.bg.secondary,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        <div className="mobile-header-content">
          <div className="logo-placeholder" style={{ color: theme.text.primary }}>
            <span className="logo-text">NPL</span>
          </div>
          <button
            className="hamburger-menu"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            style={{
              color: theme.text.primary,
            }}
          >
            <span className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Mobile Navigation Drawer */}
      <aside
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
        style={{
          background: theme.bg.secondary,
        }}
      >
        <div
          className="mobile-drawer-header"
          style={{
            borderBottom: `1px solid ${theme.border.primary}`,
          }}
        >
          <h2 style={{ color: theme.text.primary }}>
            {leagueData?.name || "Fantasy League"}
          </h2>
          <p style={{ color: theme.text.secondary }}>
            Season {leagueData?.season || "2024"}
          </p>
        </div>
        <nav>
          <ul className="mobile-nav-menu">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link" onClick={closeMobileMenu}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/matchups" end className="nav-link" onClick={closeMobileMenu}>
                Matchups
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/standings" end className="nav-link" onClick={closeMobileMenu}>
                Standings
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>
      </aside>

      {/* Desktop Left sidebar, navigation */}
      <aside
        className="nav-sidebar desktop-only"
        style={{
          background: theme.bg.secondary,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        <div
          className="sidebar-header"
          style={{
            borderBottom: `1px solid ${theme.border.primary}`,
          }}
        >
          <h2 style={{ color: theme.text.primary }}>
            {leagueData?.name || "Fantasy League"}
          </h2>
          <p style={{ color: theme.text.secondary }}>
            Season {leagueData?.season || "2024"}
          </p>
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
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      <aside
        className="widgets-sidebar"
        style={{
          background: theme.bg.secondary,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        {children}
      </aside>
    </div>
  );
}

export default Layout;
