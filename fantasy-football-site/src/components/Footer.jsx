import { useTheme } from "../contexts/ThemeContext";
import "./Footer.css";

function Footer({ leagueData }) {
  const { theme } = useTheme();

  return (
    <footer
      className="footer"
      style={{
        background: theme.bg.secondary,
        borderTop: `1px solid ${theme.border.primary}`,
      }}
    >
      <div className="footer-content">
        <p style={{ color: theme.text.secondary }}>
          National Pigskin League
        </p>
        <p style={{ color: theme.text.tertiary, fontSize: '0.85em' }}>
          Stats by Sleeper, Built by{' '}
          <a
            href="https://oddlymedia.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.text.secondary,
              textDecoration: 'underline',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.color = theme.text.primary}
            onMouseLeave={(e) => e.target.style.color = theme.text.secondary}
          >
            Oddly Media
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
