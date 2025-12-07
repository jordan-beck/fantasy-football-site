import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "../contexts/ThemeContext";
import { getRecentPosts } from "../constants/blogPosts";
import "./Blog.css";

/**
 * Blog Component
 *
 * Displays recent blog posts with markdown rendering
 */
function Blog() {
  const { theme } = useTheme();
  const [expandedPost, setExpandedPost] = useState(null);
  const posts = getRecentPosts(3); // Show 3 most recent posts

  const togglePost = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const formatDate = (dateString) => {
    // Parse date without timezone conversion by using date parts
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="blog-section">
      <h2 className="blog-title" style={{ color: theme.text.primary }}>
        From the Commissioner's Desk
      </h2>

      <div className="blog-posts">
        {posts.map((post) => (
          <article
            key={post.id}
            className={`blog-post ${
              expandedPost === post.id ? "expanded" : ""
            }`}
            style={{
              background: theme.bg.tertiary,
              border: `1px solid ${theme.border.primary}`,
            }}
          >
            <div className="blog-post-header">
              <h3
                className="blog-post-title"
                style={{ color: theme.text.primary }}
              >
                {post.title}
              </h3>
              <div
                className="blog-post-meta"
                style={{ color: theme.text.secondary }}
              >
                <span className="blog-post-date">{formatDate(post.date)}</span>
                <span className="blog-post-separator">•</span>
                <span className="blog-post-author">{post.author}</span>
              </div>
            </div>

            <div
              className={`blog-post-content ${
                expandedPost === post.id ? "expanded" : "collapsed"
              }`}
            >
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 style={{ color: theme.text.primary }} {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 style={{ color: theme.text.primary }} {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 style={{ color: theme.text.primary }} {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p style={{ color: theme.text.primary }} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ color: theme.text.primary }} {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong style={{ color: theme.text.accent }} {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em style={{ color: theme.text.secondary }} {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr
                      style={{ borderColor: theme.border.primary }}
                      {...props}
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <button
              className="blog-post-toggle"
              onClick={() => togglePost(post.id)}
              style={{
                color: theme.text.accent,
                borderTop: `1px solid ${theme.border.primary}`,
              }}
            >
              {expandedPost === post.id ? "Show Less" : "Read More"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Blog;
