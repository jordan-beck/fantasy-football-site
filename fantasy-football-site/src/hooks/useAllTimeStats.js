import { useState, useEffect, useMemo } from 'react';
import { calculateAllTimeStats } from '../utils/statsCalculator';

const CACHE_KEY = 'fantasy_all_time_stats_cache';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Custom hook for calculating and caching comprehensive all-time stats
 * @param {Array} matchups - Matchup data from useMatchupHistory
 * @param {Array} allSeasonsData - All seasons data
 * @param {string} currentSeason - Current season year
 * @param {Array} rosters - Current season rosters
 * @param {Array} previousSeasons - Previous season data
 * @param {boolean} forceRecalculate - Force recalculation ignoring cache
 */
export function useAllTimeStats(
  matchups,
  allSeasonsData,
  currentSeason,
  rosters,
  previousSeasons,
  forceRecalculate = false
) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Create a stable cache key based on data
  const dataCacheKey = useMemo(() => {
    if (!matchups || !allSeasonsData) return null;

    const matchupsCount = matchups.reduce((sum, m) => sum + (m.matchups?.length || 0), 0);
    const seasonsCount = allSeasonsData.length;

    return `${currentSeason}_${matchupsCount}_${seasonsCount}`;
  }, [matchups, allSeasonsData, currentSeason]);

  useEffect(() => {
    const calculateStats = async () => {
      try {
        setLoading(true);
        setProgress(0);
        setError(null);

        // Check if we have the required data
        if (!matchups || matchups.length === 0 || !allSeasonsData || allSeasonsData.length === 0) {
          setStats(null);
          setLoading(false);
          return;
        }

        // Check cache if not forcing recalculation
        if (!forceRecalculate && dataCacheKey) {
          const cached = getCachedStats(dataCacheKey);
          if (cached) {
            setStats(cached);
            setProgress(100);
            setLoading(false);
            return;
          }
        }

        setProgress(10);

        // Simulate progressive loading since calculation is synchronous
        // In a real implementation, you could break this into chunks
        setTimeout(() => setProgress(30), 100);

        const calculatedStats = calculateAllTimeStats(
          matchups,
          allSeasonsData,
          currentSeason,
          rosters,
          previousSeasons
        );

        setProgress(80);

        // Cache the results
        if (dataCacheKey) {
          cacheStats(dataCacheKey, calculatedStats);
        }

        setProgress(100);
        setStats(calculatedStats);
        setLoading(false);
      } catch (err) {
        console.error('Error calculating all-time stats:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    calculateStats();
  }, [matchups, allSeasonsData, currentSeason, rosters, previousSeasons, forceRecalculate, dataCacheKey]);

  const recalculate = () => {
    if (dataCacheKey) {
      clearCachedStats(dataCacheKey);
    }
    setLoading(true);
    // Trigger recalculation by clearing stats
    setStats(null);
  };

  return {
    stats,
    loading,
    progress,
    error,
    recalculate,
  };
}

/**
 * Get cached stats if they exist and are not expired
 */
function getCachedStats(cacheKey) {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${cacheKey}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY}_${cacheKey}`);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error reading cached stats:', err);
    return null;
  }
}

/**
 * Cache stats to localStorage
 */
function cacheStats(cacheKey, stats) {
  try {
    const cacheData = {
      data: stats,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY}_${cacheKey}`, JSON.stringify(cacheData));
  } catch (err) {
    console.error('Error caching stats:', err);
  }
}

/**
 * Clear cached stats
 */
function clearCachedStats(cacheKey) {
  try {
    localStorage.removeItem(`${CACHE_KEY}_${cacheKey}`);
  } catch (err) {
    console.error('Error clearing cached stats:', err);
  }
}

/**
 * Clear all cached stats
 */
export function clearAllCachedStats() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error('Error clearing all cached stats:', err);
  }
}
