import HouseholdRow from "./HouseholdRow";
import AddResident from "./AddResident";
import Button from "./Button";
import { useState } from "react";

export default function HouseholdsPage({
  filteredResidentsStatus,
  onUpdateStatus,
  handleDelete,
  handleAddHousehold,
  showAddForm,
  setShowAddForm,
  selectedArea,
  setSelectedArea,
  selectedStatus,
  setStatus,
  STATUS_META,
  staffMembers,
  setView,
  residents,
  exportResidentsToExcel,
  handleSaveHouseholdStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");


  const areas = [...new Set(filteredResidentsStatus.map((h) => h.area))].sort();

  const searchedHouseholds = filteredResidentsStatus.filter((household) => {
    const search = searchTerm.toLowerCase();

    const addressMatch = (household.address || "")
      .toString()
      .toLowerCase()
      .includes(search);

    const contactMatch = household.contacts?.some((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search),
    );

    return addressMatch || contactMatch;
  });
  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="logo-area">
          <img src="/logo.png" alt="logo" className="logo" />
          <h2>Emergency Communication Team</h2>
        </div>

        <Button type="secondary" onClick={() => setView("dashboard")}>
          ← Dashboard
        </Button>
      </div>
      <div className="title-row">
        <h1 className="page-title">Households Status</h1>

        <Button type="primary" onClick={() => setShowAddForm(true)}>
          + Add New Household
        </Button>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Filter by Area</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="">All Areas</option>

            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All status</option>
            {Object.entries(STATUS_META).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
        {/*  חיפוש תושב */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search household..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button type="secondary" onClick={exportResidentsToExcel}>
          Export to Excel
        </Button>
      </div>
      <div className="table-card">
        <table className="residents-table">
          <thead>
            <tr>
              <th>Contacts</th>
              {/* <th>Name</th> */}
              <th>Phone</th>
              <th>Address</th>
              <th>Total Residents</th>
              <th>Current At Home</th>
              <th>Status</th>
              <th>Special Needs</th>
              <th>Area</th>
              <th>Last updated</th>
              <th>Updated By</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {searchedHouseholds.map((household) => (
              <HouseholdRow
                key={household.id}
                household={household}
                onUpdateStatus={onUpdateStatus}
                onDeleted={handleDelete}
                statusMeta={STATUS_META}
                handleSaveHouseholdStatus={handleSaveHouseholdStatus}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddResident
          onAddResident={handleAddHousehold}
          onClose={() => setShowAddForm(false)}
          staffTzahiMembers={staffMembers}
        />
      )}
    </div>
  );
}
