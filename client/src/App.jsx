import { useState, useEffect } from "react";
import { RESIDENT, staffMembers } from "./TzahiData";
import "./App.css";
import Dashboard from "./Dashboard";
import HouseholdsPage from "./HouseholdsPage";
import * as XLSX from "xlsx";
import Login from "./Login";

export default function App() {
  const [currentView, setView] = useState("dashboard");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [residents, setResidents] = useState(() => {
    const residentsLocal = localStorage.getItem("residents");
    const localData = residentsLocal ? JSON.parse(residentsLocal) : [];
    const combined = [...RESIDENT, ...localData];

    const unique = combined.filter(
      (resident, index, self) =>
        index === self.findIndex((r) => r.address === resident.address),
    );

    return unique.map((r) => ({
      ...r,
      status: r.status || "no_answer",
      lastUpdated: new Date(r.lastUpdated).getTime() || Date.now(),
    }));
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStatus, setStatus] = useState("all");
  const STATUS_PRIORITY = {
    no_answer: 1,
    not_home: 2,
    at_home: 3,
  };
  //מיון לפי סטטוס- מי עוד לא ענה- ראשון
  const sortedResidents = [...residents].sort((a, b) => {
    const statusA = STATUS_PRIORITY[a.status] ?? 999;
    const statusB = STATUS_PRIORITY[b.status] ?? 999;

    if (statusA === statusB) {
      return a.lastUpdated - b.lastUpdated; // 👈 ישן קודם
    }

    return statusA - statusB;
  });

  //סינון לפי שם איש צוות מסתמך על מערך תושבים ממוין
  const filteredResidents =
    selectedArea === ""
      ? sortedResidents
      : sortedResidents.filter((resident) => resident.area === selectedArea);

  const filteredResidentsStatus =
    selectedStatus === "all"
      ? filteredResidents
      : filteredResidents.filter(
          (resident) => resident.status === selectedStatus,
        );

  // משתנה שתומך בתצוגת הסטטוס בצבעים שונים
  const STATUS_META = {
    at_home: { label: "At Home", color: "#2EC4B6" },
    not_home: { label: "Not Home", color: "#6C8EBF" },
    no_answer: { label: "No Answer", color: "#E5533D" },
  };

  useEffect(() => {
    localStorage.setItem("residents", JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHouseholds();
    }
  }, [isLoggedIn]);

  function importResidentsFromExcel(file) {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const newHouseholds = jsonData
        .map((row) => {
          // חובה: כתובת ולפחות טלפון אחד
          if (!row["Address"] || (!row["Phone 1"] && !row["Phone 2"])) {
            return null;
          }

          const contacts = [
            {
              firstName: row["First Name 1"] || "",
              lastName: row["Last Name 1"] || "",
              phone: (row["Phone 1"] || "").toString(),
            },
            {
              firstName: row["First Name 2"] || "",
              lastName: row["Last Name 2"] || "",
              phone: (row["Phone 2"] || "").toString(),
            },
          ].filter((c) => c.phone);

          return {
            id: Date.now().toString() + Math.random(),
            address: row["Address"],
            contacts,
            totalResidents: Number(row["Total Residents"]) || 0,
            currentAtHome: 0,
            specialNeeds: row["Special Needs"] || "",
            status: "no_answer",
            lastUpdated: Date.now(),
            area: row["Area"],
          };
        })
        .filter(Boolean);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/import-households", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newHouseholds),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        return;
      }

      const result = await response.json();

      await fetchHouseholds();
    };

    reader.readAsArrayBuffer(file);
  }
  //עדכון סטטוס חדש ותאריך אחרון של עדכון
  function onUpdateStatus(residentId, newStatus) {
    setResidents((prev) =>
      prev.map((resident) => {
        if (resident.id === residentId) {
          return {
            ...resident,
            status: newStatus,
            lastUpdated: Date.now(),
          };
        }

        return resident;
      }),
    );
  }

  //הוספת תושב לרשימת התושבים

  async function handleAddHousehold(newResidentData) {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3001/households", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newResidentData),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      return;
    }

    const result = await response.json();

    await fetchHouseholds();
  }

  async function handleDelete(householdId) {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3001/households/${householdId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        return;
      }

      await fetchHouseholds();
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  }

  //מחיקת תושב ממערך הסטייט של התושבים

  function exportResidentsToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(residents);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");

    XLSX.writeFile(workbook, "residents.xlsx");
  }
  async function fetchHouseholds() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/current-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        return;
      }

      const data = await response.json();

      const householdsFromServer = data.map((household) => {
        const latestStatus = household.statusUpdates[0];

        return {
          ...household,
          status: latestStatus?.status || "no_answer",
          currentAtHome: latestStatus?.currentAtHome || 0,
          lastUpdated: latestStatus?.lastUpdated || null,
          updatedBy: latestStatus?.user?.name || "",
          area: household.area,
        };
      });

      setResidents(householdsFromServer);
    } catch (error) {
      console.error(error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }

  async function handleSaveHouseholdStatus(householdId, status, currentAtHome) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/statusupdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          householdId,
          status,
          currentAtHome,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        return;
      }

      const data = await response.json();

      await fetchHouseholds();
      setSaveMessage("Status updated successfully!");
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <>
      {saveMessage && <div className="save-message">{saveMessage}</div>}
      {currentView === "dashboard" ? (
        <Dashboard
          residents={residents}
          staffMembers={staffMembers}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          setView={setView}
          importResidentsFromExcel={importResidentsFromExcel}
          handleLogout={handleLogout}
        />
      ) : (
        <HouseholdsPage
          filteredResidentsStatus={filteredResidentsStatus}
          onUpdateStatus={onUpdateStatus}
          handleDelete={handleDelete}
          handleAddHousehold={handleAddHousehold}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          selectedStatus={selectedStatus}
          setStatus={setStatus}
          STATUS_META={STATUS_META}
          staffMembers={staffMembers}
          setView={setView}
          exportResidentsToExcel={exportResidentsToExcel}
          residents={residents}
          handleSaveHouseholdStatus={handleSaveHouseholdStatus}
        />
      )}
    </>
  );
}
