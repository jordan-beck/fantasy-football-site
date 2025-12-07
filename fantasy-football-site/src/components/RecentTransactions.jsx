import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './RecentTransactions.css';

function RecentTransactions({ transactions = [] }) {
  const { theme } = useTheme();

  // Get the 3 most recent transactions
  const recentTransactions = transactions.slice(0, 3);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'trade':
        return '⇄';
      case 'waiver':
        return '↓';
      case 'add':
        return '+';
      case 'drop':
        return '−';
      default:
        return '•';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="recent-transactions-widget"
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.primary}`,
      }}
    >
      <h3 style={{ color: theme.text.primary }}>Recent Moves</h3>

      {recentTransactions.length === 0 ? (
        <div
          className="no-transactions"
          style={{ color: theme.text.tertiary }}
        >
          No recent transactions
        </div>
      ) : (
        <div className="transactions-list">
          {recentTransactions.map((transaction, index) => (
            <div
              key={index}
              className="transaction-item"
              style={{
                borderBottom: index < recentTransactions.length - 1
                  ? `1px solid ${theme.border.primary}`
                  : 'none',
              }}
            >
              <div className="transaction-header">
                <span
                  className={`transaction-type ${transaction.type}`}
                >
                  {getTransactionIcon(transaction.type)}
                </span>
                <span
                  className="transaction-date"
                  style={{ color: theme.text.tertiary }}
                >
                  {formatDate(transaction.date)}
                </span>
              </div>
              <div
                className="transaction-team"
                style={{ color: theme.text.primary }}
              >
                {transaction.team}
              </div>
              <div
                className="transaction-details"
                style={{ color: theme.text.secondary }}
              >
                {transaction.description}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/transactions"
        className="view-all-button"
        style={{
          borderTop: `1px solid ${theme.border.primary}`,
          color: theme.text.accent,
        }}
      >
        View All Transactions →
      </Link>
    </div>
  );
}

export default RecentTransactions;
