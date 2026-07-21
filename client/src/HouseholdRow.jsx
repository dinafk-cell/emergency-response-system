import Button from "./Button";
import { useState } from "react";

export default function HouseholdRow({
  household,
  onUpdateStatus,
  onDeleted,
  statusMeta,
  handleSaveHouseholdStatus,
}) {
  const status = household.status || "no_answer";
  const formatUpdateDate = household.lastUpdated
    ? new Date(household.lastUpdated).toLocaleString("he-IL", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";
  const [currentStatus, setCurrentStatus] = useState(household.status);

  const [currentAtHome, setCurrentAtHome] = useState(household.currentAtHome);

  const [isDirty, setIsDirty] = useState(false);


  const handleSave = async () => {
    const success = await handleSaveHouseholdStatus(
      household.id,
      currentStatus,
      currentAtHome,
    );

    if (success) {
      setIsDirty(false);
    }
  };
  //הצגת שורת התושב במסך, כפתור סלקט לסטטוס וכפתור מחיקת תושב כולל כפתור אישור לפני מחיקה
  return (
    <tr>
      <td>
        {household.contacts?.length > 0
          ? household.contacts.map((c, index) => (
              <div key={index}>
                {c.firstName} {c.lastName}
              </div>
            ))
          : "-"}
      </td>
      <td>
        {household.contacts?.length > 0
          ? household.contacts.map((c, index) => (
              <div key={index}>{c.phone}</div>
            ))
          : "-"}
      </td>
      <td>{household.address || "-"}</td>
      <td>{household.totalResidents}</td>
      <td>
        <input
          type="number"
          value={currentAtHome}
          onChange={(e) => {
            setCurrentAtHome(Number(e.target.value));
            setIsDirty(true);
          }}
          disabled={currentStatus !== "at_home"}
        />
      </td>
      <td>
        <div className="status-cell">
          <span
            className="status-dot"
            style={{
              backgroundColor: statusMeta[status]?.color || "gray",
            }}
          />

          <select
            className="status-select"
            value={currentStatus}
            onChange={(e) => {
              const newStatus = e.target.value;

              setCurrentStatus(newStatus);
              setIsDirty(true);

              if (newStatus !== "at_home") {
                setCurrentAtHome(0);
              }
            }}
          >
            <option value="at_home">At Home</option>
            <option value="not_home">Not Home</option>
            <option value="no_answer">No Answer</option>
          </select>
        </div>
      </td>
      <td>
        <div className="special-needs-cell">
          {household.specialNeeds || "-"}
        </div>
      </td>
      <td>{household.area}</td>
      <td>{formatUpdateDate}</td>
      <td>{household.updatedBy || "-"}</td>

      <td>
        <div className="action-buttons">
          <Button
            type="delete"
            disabled={!isDirty}
            onClick={handleSave}
          >
            Save
          </Button>

          <Button
            type="delete"
            onClick={() => {
              if (window.confirm("Are you sure?")) {
                onDeleted(household.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
