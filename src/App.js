import { useState, useEffect, useRef } from 'react';
import problems from './data/problems.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function App() {
  const [solved, setSolved] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const menuRef = useRef();

  useEffect(() => {
    fetch('http://localhost:5000/api/user/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) {
          setUser(data);
          setSolved(data.solved || []);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/user/leaderboard')
      .then((res) => res.json())
      .then(setLeaderboard)
      .catch(console.error);
  }, [user]);

  const toggleSolved = (index) => {
    const updated = solved.includes(index)
      ? solved.filter((i) => i !== index)
      : [...solved, index];

    setSolved(updated);

    if (user) {
      fetch('http://localhost:5000/api/user/update-solved', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solved: updated }),
      });
    }
  };

  const chartData = [
    { name: 'Solved', value: solved.length },
    { name: 'Unsolved', value: problems.length - solved.length },
  ];

  const chartColors = ['#198754', '#dc3545'];

  return (
    <div className="container py-4">
      <h1 className="mb-4">🧠 LeetCode 150 Tracker</h1>

      <div className="mb-4 text-end" ref={menuRef}>
        {user ? (
          <div className="position-relative d-inline-block">
            <div
              className="d-flex align-items-center gap-2"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <img
                src={user.photo || 'https://via.placeholder.com/32'}
                alt="Profile"
                className="rounded-circle"
                width="32"
                height="32"
              />
              <span>{user.name}</span>
            </div>
            {showMenu && (
              <div className="position-absolute end-0 mt-2 bg-white border rounded shadow p-2 z-3">
                <button
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() =>
                    (window.location.href = 'http://localhost:5000/api/user/logout')
                  }
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="http://localhost:5000/api/user/auth/google"
            className="btn btn-outline-dark"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              width="20"
              height="20"
              className="me-2"
            />
            Sign in with Google
          </a>
        )}
      </div>

      <div className="mb-5">
        <h5>📊 Progress Overview</h5>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              <Cell fill={chartColors[0]} />
              <Cell fill={chartColors[1]} />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4">
        <h5>🏆 Leaderboard</h5>
        <ul className="list-group">
          {leaderboard.map((u, i) => (
            <li key={i} className="list-group-item d-flex align-items-center gap-3">
              <span style={{ width: 20 }}>{i + 1}.</span>
              <img
                src={u.photo || 'https://via.placeholder.com/32'}
                alt={u.name}
                className="rounded-circle"
                width="32"
                height="32"
              />
              <strong>{u.name}</strong>
              <span className="ms-auto badge bg-success">
                ✅ {u.solvedCount}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <input
        className="form-control mb-4"
        placeholder="Search problems..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul className="list-group">
        {problems
          .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((problem, index) => (
            <li key={index} className="list-group-item">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={solved.includes(index)}
                  onChange={() => toggleSolved(index)}
                  id={`p-${index}`}
                />
                <label htmlFor={`p-${index}`} className="form-check-label">
                  <strong>{problem.name}</strong> <br />
                  <small className="text-muted">
                    {problem.category} · {problem.difficulty}
                  </small>
                </label>
              </div>
            </li>
          ))}
      </ul>

      <div className="mt-4 text-muted">
        ✅ Solved {solved.length} / {problems.length}
      </div>
    </div>
  );
}

export default App;
