import { useTheme } from '../ThemeContext';
import './ThemedComponents.css';

/**
 * Themed Card Component
 *
 * A reusable card component with glass morphism effect that adapts to the current theme.
 * Supports hover states and custom children content.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {Function} props.onClick - Click handler
 */
export function ThemedCard({ children, className = '', style = {}, onClick, ...props }) {
  const { theme } = useTheme();

  const cardStyle = {
    background: theme.bg.glassCard,
    border: `1px solid ${theme.border.glass}`,
    color: theme.text.primary,
    ...style,
  };

  return (
    <div
      className={`themed-card ${className}`}
      style={cardStyle}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Themed Container Component
 *
 * A larger container component with glass morphism effect for major sections.
 * Uses primary glass background for stronger visual hierarchy.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Container content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
export function ThemedContainer({ children, className = '', style = {}, ...props }) {
  const { theme } = useTheme();

  const containerStyle = {
    background: theme.bg.glass,
    border: `1px solid ${theme.border.glass}`,
    color: theme.text.primary,
    ...style,
  };

  return (
    <div
      className={`themed-container ${className}`}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Themed List Item Component
 *
 * A reusable list item with hover effects and proper theme-aware styling.
 * Commonly used for navigation items, team lists, and other repeating elements.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - List item content
 * @param {boolean} props.active - Whether this item is active/selected
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {Function} props.onClick - Click handler
 */
export function ThemedListItem({ children, active = false, className = '', style = {}, onClick, ...props }) {
  const { theme } = useTheme();

  const itemStyle = {
    color: active ? theme.text.accent : theme.text.primary,
    background: active ? theme.interactive.secondary : 'transparent',
    ...style,
  };

  return (
    <div
      className={`themed-list-item ${active ? 'active' : ''} ${className}`}
      style={itemStyle}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Themed Button Component
 *
 * A button component with primary or secondary variants that adapt to the theme.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - 'primary' or 'secondary'
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {Function} props.onClick - Click handler
 */
export function ThemedButton({
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    if (disabled) {
      return {
        background: theme.interactive.disabled,
        color: theme.text.tertiary,
        cursor: 'not-allowed',
      };
    }

    if (variant === 'primary') {
      return {
        background: theme.interactive.primary,
        color: theme.text.inverse,
        border: `1px solid ${theme.interactive.primary}`,
      };
    }

    return {
      background: theme.bg.glass,
      color: theme.text.accent,
      border: `1px solid ${theme.border.accent}`,
    };
  };

  const buttonStyle = {
    ...getButtonStyle(),
    ...style,
  };

  return (
    <button
      className={`themed-button themed-button-${variant} ${disabled ? 'disabled' : ''} ${className}`}
      style={buttonStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Themed Badge Component
 *
 * A small badge component for status indicators, counts, or labels.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - 'success', 'warning', 'error', 'info', or 'default'
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
export function ThemedBadge({ children, variant = 'default', className = '', style = {}, ...props }) {
  const { theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { background: theme.status.success, color: theme.text.inverse };
      case 'warning':
        return { background: theme.status.warning, color: theme.text.inverse };
      case 'error':
        return { background: theme.status.error, color: theme.text.inverse };
      case 'info':
        return { background: theme.status.info, color: theme.text.inverse };
      default:
        return { background: theme.bg.tertiary, color: theme.text.primary };
    }
  };

  const badgeStyle = {
    ...getVariantStyle(),
    ...style,
  };

  return (
    <span
      className={`themed-badge themed-badge-${variant} ${className}`}
      style={badgeStyle}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Themed Divider Component
 *
 * A horizontal divider line that adapts to the theme.
 *
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
export function ThemedDivider({ className = '', style = {}, ...props }) {
  const { theme } = useTheme();

  const dividerStyle = {
    borderColor: theme.border.primary,
    ...style,
  };

  return (
    <hr
      className={`themed-divider ${className}`}
      style={dividerStyle}
      {...props}
    />
  );
}
