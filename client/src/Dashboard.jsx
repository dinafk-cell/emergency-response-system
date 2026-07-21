import Button from "./Button";
export default function Dashboard({
  residents,
  staffMembers,
  selectedArea,
  setSelectedArea,
  setView,
  importResidentsFromExcel,
  handleLogout,
}) {
  const totalResidents = residents.length;
  const atHome = residents.filter((r) => r.status === "at_home").length;
  const notHome = residents.filter((r) => r.status === "not_home").length;
  const noAnswer = residents.filter((r) => r.status === "no_answer").length;
  const checkedIn = atHome + notHome;

  return (
    <div className="dashboard-container">
      {/* HEADER */}

      <div className="dashboard-header">
        <div className="logo-area">
          <img src="/logo.png" alt="logo" className="dashboard-logo" />
        </div>

        <div>
          <h1>Local Emergency Staff Dashboard</h1>
          <p>Monitor and manage community check-ins during emergencies</p>
        </div>
      </div>

      {/* STAT CARDS */}

      <div className="stats-grid">
        <div className="stat-card checked">
          <h4>Total Residents</h4>
          <p className="stat-number">{totalResidents}</p>
        </div>

        <div className="stat-card checked">
          <h4>Security Team</h4>
          <p className="stat-number">{staffMembers.length}</p>
        </div>

        <div className="stat-card checked">
          <h4>Checked In</h4>
          <p className="stat-number">{checkedIn}</p>
        </div>

        <div className="stat-card alert">
          <h4>No Answer</h4>
          <p className="stat-number">{noAnswer}</p>
        </div>
      </div>

      {/* INFO SECTION */}

      <div className="info-grid">
        <div className="info-card">
          <h3>Check-in Status</h3>

          <div className="status-row">
            <span>At Home</span>
            <span className="status-badge green">{atHome}</span>
          </div>

          <div className="status-row">
            <span>Not Home</span>
            <span className="status-badge blue">{notHome}</span>
          </div>

          <div className="status-row">
            <span>No Answer</span>
            <span className="status-badge red">{noAnswer}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>People at Home</h3>

          <p className="big-number">{atHome}</p>
          <p>Total people currently at home</p>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="actions">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => importResidentsFromExcel(e.target.files[0])}
        />
        <div className="staff-select">
          <div>
            <label className="staff-select-label">Filter by Area:</label>
          </div>
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="">All Areas</option>

              {[...new Set(residents.map((r) => r.area))].sort().map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="primary" onClick={() => setView("residents")}>
          Residents List
        </Button>

        <Button type="primary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
