import React, { createContext, useState, useContext, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useParams,
  useNavigate
} from 'react-router-dom';

// ==========================================
// 1. CONTEXT & STATE MANAGEMENT
// ==========================================

const AppContext = createContext();

const initialUsers = [
  { id: '1', name: 'Tianna Jenkins' },
  { id: '2', name: 'Kevin Grant' },
  { id: '3', name: 'Madison Price' }
];

const initialPosts = [
  {
    id: '101',
    title: 'First Post!',
    content: 'Hello world! Excited to join this new social platform.',
    user: '1',
    date: new Date().toISOString(),
    reactions: { thumbsUp: 2, hooray: 1, heart: 5, rocket: 0, eyes: 0 }
  },
  {
    id: '102',
    title: 'React Router v6 Rules',
    content: 'Nested routing and layout routes make building SPAs seamless.',
    user: '2',
    date: new Date().toISOString(),
    reactions: { thumbsUp: 4, hooray: 0, heart: 1, rocket: 3, eyes: 0 }
  }
];

export const AppProvider = ({ children }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [users] = useState(initialUsers);
  const [notifications, setNotifications] = useState([]);

  // Add a new post
  const addPost = useCallback((title, content, userId) => {
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      user: userId,
      date: new Date().toISOString(),
      reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  // Edit an existing post
  const editPost = useCallback((id, title, content) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, title, content } : post
      )
    );
  }, []);

  // Add a reaction to a post
  const addReaction = useCallback((postId, reactionName) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionName]: (post.reactions[reactionName] || 0) + 1
            }
          };
        }
        return post;
      })
    );
  }, []);

  // Fetch / Refresh Notifications
  const fetchNotifications = useCallback(() => {
    const mockNotifications = [
      {
        id: Date.now().toString(),
        message: 'Tianna Jenkins liked your post.',
        date: new Date().toLocaleTimeString()
      },
      {
        id: (Date.now() + 1).toString(),
        message: 'Kevin Grant posted a new update.',
        date: new Date().toLocaleTimeString()
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  return (
    <AppContext.Provider
      value={{
        posts,
        users,
        notifications,
        addPost,
        editPost,
        addReaction,
        fetchNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

// ==========================================
// 2. REUSABLE COMPONENTS
// ==========================================

const reactionEmoji = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀'
};

const ReactionButtons = ({ post }) => {
  const { addReaction } = useApp();

  return (
    <div className="reaction-buttons">
      {Object.entries(reactionEmoji).map(([name, emoji]) => (
        <button
          key={name}
          type="button"
          className="muted-button reaction-button"
          onClick={() => addReaction(post.id, name)}
        >
          {emoji} {post.reactions?.[name] ?? 0}
        </button>
      ))}
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="navbar">
      <section>
        <h1>Social Media App</h1>
        <div className="navLinks">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Posts
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
            Notifications
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
            Users
          </NavLink>
          <NavLink to="/addPost" className={({ isActive }) => (isActive ? 'active' : '')}>
            Create Post
          </NavLink>
        </div>
      </section>
    </nav>
  );
};

// ==========================================
// 3. PAGES
// ==========================================

// Posts Landing Page
const PostsList = () => {
  const { posts, users } = useApp();

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {posts.map((post) => {
        const author = users.find((u) => u.id === post.user);
        return (
          <article className="post-excerpt post" key={post.id}>
            <h3>{post.title}</h3>
            <div>
              <span>by {author ? author.name : 'Unknown author'}</span>
            </div>
            <p className="post-content">{post.content.substring(0, 100)}</p>
            <ReactionButtons post={post} />
            <Link to={`/posts/${post.id}`} className="button muted-button">
              View Post
            </Link>
          </article>
        );
      })}
    </section>
  );
};

// Single Post Page
const SinglePostPage = () => {
  const { postId } = useParams();
  const { posts, users } = useApp();

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    );
  }

  const author = users.find((u) => u.id === post.user);

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <div>
          <span>by {author ? author.name : 'Unknown author'}</span>
        </div>
        <p className="post-content">{post.content}</p>
        <ReactionButtons post={post} />
        <Link to={`/editPost/${post.id}`} className="button">
          Edit Post
        </Link>
      </article>
    </section>
  );
};

// Create Post Page
const AddPostForm = () => {
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('');
  const [content, setContent] = useState('');
  const { users, addPost } = useApp();
  const navigate = useNavigate();

  const onSavePostClicked = () => {
    if (title && content && userId) {
      addPost(title, content, userId);
      setTitle('');
      setContent('');
      setUserId('');
      navigate('/');
    }
  };

  const canSave = Boolean(title) && Boolean(content) && Boolean(userId);

  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="postAuthor">Author:</label>
        <select
          id="postAuthor"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">Select Author...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button type="button" onClick={onSavePostClicked} disabled={!canSave}>
          Save Post
        </button>
      </form>
    </section>
  );
};

// Edit Post Page
const EditPostForm = () => {
  const { postId } = useParams();
  const { posts, editPost } = useApp();
  const navigate = useNavigate();

  const post = posts.find((p) => p.id === postId);

  const [title, setTitle] = useState(post ? post.title : '');
  const [content, setContent] = useState(post ? post.content : '');

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    );
  }

  const onSavePostClicked = () => {
    if (title && content) {
      editPost(post.id, title, content);
      navigate(`/posts/${post.id}`);
    }
  };

  return (
    <section className="post">
      <h2>Edit Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button className="button" type="button" onClick={onSavePostClicked}>
          Save Post
        </button>
      </form>
    </section>
  );
};

// Users List Page
const UsersList = () => {
  const { users } = useApp();

  return (
    <section>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

// Single User Profile Page
const UserPage = () => {
  const { userId } = useParams();
  const { users, posts } = useApp();

  const user = users.find((u) => u.id === userId);
  const userPosts = posts.filter((p) => p.user === userId);

  if (!user) {
    return (
      <section>
        <h2>User not found!</h2>
      </section>
    );
  }

  return (
    <section>
      <h2>{user.name}'s Posts</h2>
      <ul>
        {userPosts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

// Notifications Page
const NotificationsList = () => {
  const { notifications, fetchNotifications } = useApp();

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      <button className="button" onClick={fetchNotifications}>
        Refresh Notifications
      </button>
      {notifications.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>No notifications yet. Click refresh!</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="notification">
            <div>
              <b>{notification.message}</b>
            </div>
            <small>{notification.date}</small>
          </div>
        ))
      )}
    </section>
  );
};

// ==========================================
// 4. MAIN APP ENTRY POINT WITH ROUTING
// ==========================================

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <div className="App">
          <Routes>
            <Route path="/" element={<PostsList />} />
            <Route path="/posts/:postId" element={<SinglePostPage />} />
            <Route path="/editPost/:postId" element={<EditPostForm />} />
            <Route path="/addPost" element={<AddPostForm />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/:userId" element={<UserPage />} />
            <Route path="/notifications" element={<NotificationsList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}
