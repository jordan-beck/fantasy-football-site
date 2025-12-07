import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Transactions.css';

function Transactions({ transactions = [] }) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const transactionsPerPage = 20;

  // Filter transactions by type
  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.type === filterType);

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      className="transactions-container"
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.primary}`,
      }}
    >
      <h1
        className="transactions-title"
        style={{ color: theme.text.primary }}
      >
        League Transactions
      </h1>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {['all', 'trade', 'waiver', 'add', 'drop'].map((type) => (
          <button
            key={type}
            className={`filter-button ${filterType === type ? 'active' : ''}`}
            onClick={() => handleFilterChange(type)}
            style={{
              color: filterType === type ? theme.text.accent : theme.text.secondary,
              borderColor: filterType === type ? theme.border.primary : 'transparent',
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {currentTransactions.length === 0 ? (
        <div
          className="no-transactions-message"
          style={{ color: theme.text.tertiary }}
        >
          No transactions found
        </div>
      ) : (
        <div className="transactions-table">
          {currentTransactions.map((transaction, index) => (
            <div
              key={index}
              className="transaction-row"
              style={{
                borderBottom: `1px solid ${theme.border.primary}`,
              }}
            >
              <div className="transaction-main">
                <div className="transaction-icon-wrapper">
                  <span
                    className={`transaction-icon ${transaction.type}`}
                  >
                    {getTransactionIcon(transaction.type)}
                  </span>
                  <span
                    className="transaction-type-label"
                    style={{ color: theme.text.tertiary }}
                  >
                    {transaction.type.toUpperCase()}
                  </span>
                </div>

                <div className="transaction-content">
                  <div
                    className="transaction-team-name"
                    style={{ color: theme.text.primary }}
                  >
                    {transaction.team}
                  </div>
                  <div
                    className="transaction-description"
                    style={{ color: theme.text.secondary }}
                  >
                    {transaction.description}
                  </div>
                </div>

                <div className="transaction-timestamp">
                  <div
                    className="transaction-date-display"
                    style={{ color: theme.text.primary }}
                  >
                    {formatDate(transaction.date)}
                  </div>
                  <div
                    className="transaction-time-display"
                    style={{ color: theme.text.tertiary }}
                  >
                    {formatTime(transaction.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              color: currentPage === 1 ? theme.text.tertiary : theme.text.accent,
              borderColor: theme.border.primary,
            }}
          >
            ← Prev
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="pagination-ellipsis"
                  style={{ color: theme.text.tertiary }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  style={{
                    color: currentPage === page ? theme.text.accent : theme.text.secondary,
                    borderColor: currentPage === page ? theme.text.accent : theme.border.primary,
                  }}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              color: currentPage === totalPages ? theme.text.tertiary : theme.text.accent,
              borderColor: theme.border.primary,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Transactions;
