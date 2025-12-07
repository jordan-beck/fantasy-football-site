import { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
import nplLogo from "../assets/NPL Logo.png";
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
          <div className="logo-placeholder">
            <Link to="/">
              <img src={nplLogo} alt="National Pigskin League" className="npl-logo-mobile" />
            </Link>
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
          <button
            className="mobile-drawer-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
            style={{
              color: theme.text.primary,
              border: `1px solid ${theme.border.primary}`,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="logo-container">
            <Link to="/" onClick={closeMobileMenu}>
              <img src={nplLogo} alt="National Pigskin League" className="npl-logo-drawer" />
            </Link>
          </div>
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
            <li className="nav-item">
              <NavLink to="/transactions" end className="nav-link" onClick={closeMobileMenu}>
                Transactions
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/league-details" end className="nav-link" onClick={closeMobileMenu}>
                League Details
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
          <div className="logo-container">
            <Link to="/">
              <img src={nplLogo} alt="National Pigskin League" className="npl-logo-desktop" />
            </Link>
          </div>
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
            <li className="nav-item">
              <NavLink to="/transactions" end className="nav-link">
                Transactions
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/league-details" end className="nav-link">
                League Details
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

      <Footer leagueData={leagueData} />
    </div>
  );
}

export default Layout;
