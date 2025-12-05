/**
 * Avatar Utility Functions
 *
 * Handles avatar retrieval with proper fallback logic:
 * 1. Team-specific avatar (user.metadata.avatar)
 * 2. User avatar (user.avatar)
 * 3. Null (no avatar available)
 */

/**
 * Get avatar URL for a roster
 * Falls back from team avatar to user avatar
 *
 * @param {Object} roster - The roster object
 * @param {Array} users - Array of user objects
 * @returns {string|null} - Avatar URL or null
 */
export function getAvatarUrl(roster, users) {
  const user = users.find((u) => u.user_id === roster.owner_id);

  if (!user) return null;

  // Priority 1: Team-specific avatar (metadata.avatar)
  if (user.metadata?.avatar) {
    // Check if it's already a full URL
    if (user.metadata.avatar.startsWith('http')) {
      return user.metadata.avatar;
    }
    // Otherwise, construct the Sleeper CDN URL
    return `https://sleepercdn.com/avatars/thumbs/${user.metadata.avatar}`;
  }

  // Priority 2: User avatar
  if (user.avatar) {
    // Check if it's already a full URL
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    // Otherwise, construct the Sleeper CDN URL
    return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
  }

  // No avatar available
  return null;
}

/**
 * Get team name for a roster
 * Falls back from team name to display name to "Unknown Team"
 *
 * @param {Object} roster - The roster object
 * @param {Array} users - Array of user objects
 * @returns {string} - Team name
 */
export function getTeamName(roster, users) {
  const user = users.find((u) => u.user_id === roster.owner_id);
  return user?.metadata?.team_name || user?.display_name || "Unknown Team";
}
