import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "/api";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("userId") ? "dashboard" : "login"
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("userId"))
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`${API}/me`, {
      headers: {
        Authorization: `Bearer ${userId}`
      }
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Session expired");
        }

        return data;
      })
      .then((data) => {
        setUser(data);
        setPage("dashboard");
      })
      .catch(() => {
        localStorage.removeItem("userId");
        setPage("login");
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("userId");
    setUser(null);
    setPage("login");
  }

  if (loading) {
    return <div className="loading">Checking session...</div>;
  }

  if (page === "dashboard" && user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  if (page === "register") {
    return (
      <Register
        onLogin={() => setPage("login")}
      />
    );
  }

  return (
    <Login
      onRegister={() => setPage("register")}
      onSuccess={(loggedInUser) => {
        setUser(loggedInUser);
        setPage("dashboard");
      }}
    />
  );
}

function Login({ onRegister, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("userId", data.token);
      onSuccess(data.user);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="instagram-page">
      <section className="instagram-login-wrap">
        <div className="instagram-card">
          <div className="instagram-logo" aria-label="Instagram">
            Instagram
          </div>

          <form className="instagram-form" onSubmit={submit}>
            <input
              type="email"
              placeholder="Phone number, username, or email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button className="instagram-login-button" type="submit">
              Log in
            </button>
          </form>

          {message && <div className="instagram-error">{message}</div>}

          <div className="instagram-divider">
            <span />
            <b>OR</b>
            <span />
          </div>

          <button className="facebook-login" type="button">
            <span className="facebook-icon">f</span>
            Log in with Facebook
          </button>

          <button className="forgot-password" type="button">
            Forgot password?
          </button>
        </div>

        <div className="instagram-signup-card">
          <span>Don&apos;t have an account?</span>
          <button className="instagram-signup-link" onClick={onRegister}>
            Sign up.
          </button>
        </div>
      </section>
    </main>
  );
}

function Register({ onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      setSuccess(true);
      setMessage("Your account has been created. You can now log in.");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="instagram-page">
      <section className="instagram-login-wrap">
        <div className="instagram-card instagram-register-card">
          <div className="instagram-logo">Instagram</div>
          <p className="instagram-register-title">Sign up to see photos and videos from your friends.</p>

          <form className="instagram-register-form" onSubmit={submit}>
            <input name="name" placeholder="Full name" value={form.name} onChange={updateField} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={updateField} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={updateField} minLength="6" required />
            <button type="submit">Sign up</button>
          </form>

          {message && <div className={success ? "instagram-success" : "instagram-error"}>{message}</div>}
          <p className="instagram-register-note">By signing up, you agree to our Terms and Privacy Policy.</p>
          <button className="instagram-back-link" onClick={onLogin}>← Back to login</button>
        </div>

        <div className="instagram-signup-card">
          <span>Have an account?</span>
          <button className="instagram-signup-link" onClick={onLogin}>Log in</button>
        </div>
        <div className="instagram-footer">Instagram-inspired 3-tier application</div>
      </section>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  return (
    <main className="instagram-app-page">
      <nav className="instagram-navbar">
        <div className="nav-logo">Instagram</div>
        <button className="nav-logout" onClick={onLogout}>Log out</button>
      </nav>

      <section className="instagram-profile">
        <div className="profile-head">
          <div className="profile-avatar"><div className="profile-avatar-inner">{(user.name || "U").charAt(0).toUpperCase()}</div></div>
          <div className="profile-info">
            <div className="profile-username">
              <h1>{user.name}</h1>
              <button className="profile-logout" onClick={onLogout}>Log out</button>
            </div>
            <div className="profile-stats">
              <span><strong>0</strong> posts</span>
              <span><strong>0</strong> followers</span>
              <span><strong>0</strong> following</span>
            </div>
            <div className="profile-bio">
              <strong>{user.name}</strong>
              <span>Welcome to your Instagram-style dashboard ✨</span>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-post">📷</div>
          <div className="profile-post">♡</div>
          <div className="profile-post">✦</div>
        </div>
      </section>
    </main>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);
