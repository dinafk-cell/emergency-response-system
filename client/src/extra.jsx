   {/* <div>
  <button onClick={() => setView("dashboard")}>
    ← Back to Dashboard
  </button>

  <div style={{ textAlign: "center" }}>
    <img src={logo} alt="Local Emergency Team Logo" className="logo" />
  </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div>
          <p>Choose staff member list:</p>
          <select
            value={selectedStaffMember}
            onChange={(e) => setStaffMember(e.target.value)}
          >
            <option value="all">All team</option>
            {staffMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p>Choose status:</p>
          <select
            value={selectedStatus}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All status</option>
            {Object.entries(STATUS_META).map((status) => (
              <option key={status[0]} value={status[0]}>
                {status[1].label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Last updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredResidentsStatus.map((resident) => (
            <ResidentRow
              key={resident.id}
              resident={resident}
              onUpdateStatus={onUpdateStatus}
              onDeleted={handleDelete}
              statusMeta={STATUS_META}
            />
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => setShowAddForm(true)}>Add resident</button>
      </div>
      {showAddForm && (
        <AddResident
          onAddResident={handleAddResident}
          onClose={() => setShowAddForm(false)}
          staffTzahiMembers={staffMembers}
        />
      )}
    </div> */}