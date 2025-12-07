import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTitle Component
 * Dynamically updates the document title and meta description based on current route
 */
function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    const pageTitles = {
      '/': 'Home | National Pigskin League',
      '/matchups': 'Weekly Matchups | National Pigskin League',
      '/standings': 'League Standings | National Pigskin League',
      '/transactions': 'Recent Transactions | National Pigskin League',
      '/league-details': 'League Details & History | National Pigskin League',
    };

    const pageDescriptions = {
      '/': 'View current season overview, league information, and recent activity for the National Pigskin League.',
      '/matchups': 'Track weekly head-to-head matchups, scores, and projections for all teams in the National Pigskin League.',
      '/standings': 'Current league standings with power rankings, records, and playoff positioning for the National Pigskin League.',
      '/transactions': 'Latest waiver claims, trades, and roster moves in the National Pigskin League.',
      '/league-details': 'Explore complete league history including rosters, drafts, trophy room, and all-time records for the National Pigskin League.',
    };

    // Update title
    const title = pageTitles[location.pathname] || 'National Pigskin League';
    document.title = title;

    // Update meta description
    const description = pageDescriptions[location.pathname] || 'Track standings, matchups, stats, and league history for the National Pigskin League.';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // Update Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.content = title;
    }

    // Update Open Graph description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.content = description;
    }

    // Update Twitter title
    let twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.content = title;
    }

    // Update Twitter description
    let twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.content = description;
    }

  }, [location]);

  return null; // This component doesn't render anything
}

export default PageTitle;
