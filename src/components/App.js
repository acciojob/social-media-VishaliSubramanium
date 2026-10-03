import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams
} from "react-router-dom";
import "./../styles/App.css";

const initialUsers = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Alex Johnson" },
  { id: 4, name: "Emily Brown" }
];

const initialPosts = [
  {
    id: 1,
    userId: 1,
    title: "My First Post",
    content: "Hello everyone! Welcome to my first post.",
    reactions: {
      like: 2,
      love: 1,
      haha: 0,
      wow: 0,
      sad: 0
    }
  },
  {
    id: 2,
    userId: 2,
    title: "React is Amazing",
    content: "Learning React Router makes building apps easier.",
    reactions: {
      like: 3,
      love: 2,
      haha: 0,
      wow: 1,
      sad: 0
    }
  },
  {
    id: 3,
    userId: 3,
    title: "Weekend Plans",
    content: "Looking forward to a great weekend!",
    reactions: {
      like: 1,
      love: 0,
      haha: 0,
      wow: 0,
      sad: 0
    }
  }
];

function Layout() {
  const [users] = useState(initialUsers);
  const [posts, setPosts] = useState(initialPosts);
  const [notifications, setNotifications] = useState([]);

  const addPost = (post) => {
    setPosts((currentPosts) => [
      ...currentPosts,
      {
        ...post,
        id: Date.now(),
        reactions: {
          like: 0,
          love: 0,
          haha: 0,
          wow: 0,
          sad: 0
        }
      }
    ]);
  };

  const updatePost = (updatedPost) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const addReaction = (postId, reaction) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [reaction]: post.reactions[reaction] + 1
              }
            }
          : post
      )
    );
  };

  const refreshNotifications = () => {
    setNotifications([
      "John Doe created a new post.",
      "Jane Smith reacted to a post.",
      "Alex Johnson edited a post.",
      "You have new activity on your posts."
    ]);
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Social Media App</h1>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/users">Users</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/create">Create Post</Link>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <Home
              posts={posts}
              users={users}
              addReaction={addReaction}
            />
          }
        />

        <Route
          path="/users"
          element={<Users users={users} />}
        />

        <Route
          path="/users/:userId"
          element={
            <UserPosts
              users={users}
              posts={posts}
              addReaction={addReaction}
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <Notifications
              notifications={notifications}
              refreshNotifications={refreshNotifications}
            />
          }
        />

        <Route
          path="/create"
          element={
            <CreatePost
              users={users}
              addPost={addPost}
            />
          }
        />

        <Route
          path="/edit/:postId"
          element={
            <EditPost
              posts={posts}
              updatePost={updatePost}
            />
          }
        />
      </Routes>
    </div>
  );
}

function Home({ posts, users, addReaction }) {
  return (
    <main className="page">
      <div className="tabs">
        <Link to="/">Posts</Link>
        <Link to="/users">Users</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/create">Create Post</Link>
      </div>

      <h2>Latest Posts</h2>

      <div className="posts-list">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            users={users}
            addReaction={addReaction}
          />
        ))}
      </div>
    </main>
  );
}

function Post({ post, users, addReaction }) {
  const navigate = useNavigate();

  const author = users.find(
    (user) => user.id === post.userId
  );

  return (
    <article className="post">
      <h3>{post.title}</h3>

      <p className="author">
        By {author ? author.name : "Unknown User"}
      </p>

      <p>{post.content}</p>

      <div className="reactions">
        <button onClick={() => addReaction(post.id, "like")}>
          Like {post.reactions.like}
        </button>

        <button onClick={() => addReaction(post.id, "love")}>
          Love {post.reactions.love}
        </button>

        <button onClick={() => addReaction(post.id, "haha")}>
          Haha {post.reactions.haha}
        </button>

        <button onClick={() => addReaction(post.id, "wow")}>
          Wow {post.reactions.wow}
        </button>

        <button onClick={() => addReaction(post.id, "sad")}>
          Sad {post.reactions.sad}
        </button>
      </div>

      <button
        className="button"
        onClick={() => navigate(`/edit/${post.id}`)}
      >
        Edit
      </button>
    </article>
  );
}

function Users({ users }) {
  return (
    <main className="page">
      <h2>Users</h2>

      <div className="users-list">
        {users.map((user) => (
          <Link
            key={user.id}
            to={`/users/${user.id}`}
            className="user-card"
          >
            {user.name}
          </Link>
        ))}
      </div>
    </main>
  );
}

function UserPosts({ users, posts, addReaction }) {
  const { userId } = useParams();

  const user = users.find(
    (item) => item.id === Number(userId)
  );

  const userPosts = posts.filter(
    (post) => post.userId === Number(userId)
  );

  return (
    <main className="page">
      <h2>{user ? user.name : "User"}'s Posts</h2>

      <div className="posts-list">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              users={users}
              addReaction={addReaction}
            />
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </main>
  );
}

function Notifications({
  notifications,
  refreshNotifications
}) {
  return (
    <main className="page">
      <h2>Notifications</h2>

      <button
        className="button"
        onClick={refreshNotifications}
      >
        Refresh Notifications
      </button>

      <div className="notifications">
        {notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="notification"
            >
              {notification}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

function CreatePost({ users, addPost }) {
  const navigate = useNavigate();

  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!author || !content.trim()) {
      return;
    }

    addPost({
      userId: Number(author),
      title: "New Post",
      content: content.trim()
    });

    setAuthor("");
    setContent("");

    navigate("/");
  };

  return (
    <main className="page">
      <h2>Create Post</h2>

      <form
        onSubmit={handleSubmit}
        className="post-form"
      >
        <label htmlFor="postAuthor">
          Select Author
        </label>

        <select
          id="postAuthor"
          value={author}
          onChange={(event) =>
            setAuthor(event.target.value)
          }
        >
          <option value="">
            Select an author
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.name}
            </option>
          ))}
        </select>

        <label htmlFor="postContent">
          Post Content
        </label>

        <textarea
          id="postContent"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Write your post..."
        />

        <button
          type="submit"
          className="button"
        >
          Create Post
        </button>
      </form>
    </main>
  );
}

function EditPost({ posts, updatePost }) {
  const { postId } = useParams();
  const navigate = useNavigate();

  const post = posts.find(
    (item) => item.id === Number(postId)
  );

  const [title, setTitle] = useState(
    post ? post.title : ""
  );

  const [content, setContent] = useState(
    post ? post.content : ""
  );

  if (!post) {
    return (
      <main className="page">
        <h2>Post not found</h2>
      </main>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    updatePost({
      ...post,
      title,
      content
    });

    navigate("/");
  };

  return (
    <main className="page">
      <h2>Edit Post</h2>

      <form
        onSubmit={handleSubmit}
        className="post-form"
      >
        <label htmlFor="postTitle">
          Post Title
        </label>

        <input
          id="postTitle"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
        />

        <label htmlFor="postContent">
          Post Content
        </label>

        <textarea
          id="postContent"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
        />

        <button
          type="submit"
          className="button"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </div>
  );
};

export default App;
