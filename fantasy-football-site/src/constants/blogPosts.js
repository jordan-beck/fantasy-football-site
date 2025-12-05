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
    date: "2024-12-04",
    author: "League Commissioner",
    content: `
# Welcome to Our League!

We're excited to kick off another amazing season of fantasy football. This year promises to be full of exciting matchups, close games, and plenty of trash talk.

## What's New This Season

- **Enhanced Stats Tracking**: We've upgraded our platform to give you better insights into your team's performance
- **Weekly Power Rankings**: See how your team stacks up against the competition
- **Mobile-Friendly Interface**: Access your team on the go with our new responsive design

## Tips for Success

1. **Stay Active**: Check your lineup every week and make necessary adjustments
2. **Watch the Waiver Wire**: The best managers know that championships are won on waivers
3. **Trade Smart**: Don't be afraid to propose trades, but make sure they benefit your team

Good luck to all teams this season! May the best manager win.

---

*Remember: It's not just about winning, it's about having fun and staying engaged all season long!*
    `
  },
  {
    id: 2,
    title: "Week 1 Recap: The Season Begins",
    date: "2024-09-10",
    author: "League Commissioner",
    content: `
# Week 1 in the Books!

What a way to start the season! We saw some incredible performances and a few surprises.

## Top Performances

- Highest scoring team put up **150+ points** - impressive start!
- Several close matchups decided by less than 5 points
- The waiver wire is already heating up

## Looking Ahead

Week 2 is right around the corner. Make sure to:
- Set your lineups before Thursday night
- Check injury reports
- Stay active on waivers

Let's keep the momentum going!
    `
  }
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
  return blogPosts.find(post => post.id === id);
}

/**
 * Get recent blog posts (limit)
 */
export function getRecentPosts(limit = 3) {
  return getAllPosts().slice(0, limit);
}
