/**
 * Blog Posts Data
 *
 * Store blog posts with markdown content
 * Each post should have: id, title, date, author, content (markdown)
 */

export const blogPosts = [
  {
    id: 1,
    title: "Welcome to the National Pigskin League",
    date: "2025-12-07",
    author: "Commissioner Beck",
    content: `

# This is a test post of the blogging system.

We're excited to kick off another amazing season of fantasy football. This year promises to be full of exciting matchups, close games, and plenty of trash talk.

Good luck to all teams this season! May the best manager win.
    `,
  },
  {
    id: 2,
    title: "National Pigskin League Website v1.0",
    date: "2025-12-07",
    author: "Commissioner Beck",
    content: `
The ex-commish, Aaron (Jabroni Beaters), and I have talked many times in the past about making a website for the league.  Well that is now officially a reality.

Unfortunately, I don't have data from years prior to 2022, as that is when we switched from the ESPN platform to Sleeper.   However, I would like to eventually add this data if possible-- stay tuned.   At the very least, I will piece together past winners and losers since the league started.   We'll be relying on good old fashioned brain power for this.

I'm happy with the amount of stats and records the website currently holds, but would be willing to add more.  If you have any ideas, let me know.

-- Commissioner Beck
    `,
  },
];

/**
 * Get all blog posts sorted by date (newest first)
 */
export function getAllPosts() {
  return [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get a single blog post by ID
 */
export function getPostById(id) {
  return blogPosts.find((post) => post.id === id);
}

/**
 * Get recent blog posts (limit)
 */
export function getRecentPosts(limit = 3) {
  return getAllPosts().slice(0, limit);
}
