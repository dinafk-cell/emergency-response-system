import { useState } from "react";

export default function AddResident({
  onAddResident,
  onClose,
  staffTzahiMembers,
}) {
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [contact1, setContact1] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [contact2, setContact2] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [totalResidents, setTotalResidents] = useState("");
  const [currentAtHome, setCurrentAtHome] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    // בודקים שיש נתונים בסיסיים
    if (!address || !area) {
      alert("Please fill all required fields");
      return;
    }
    // בודקים שאורך השם גדול מ1, קטן מ8 ושאין ספרות
    /*  if (name.trim().length < 2 || /\d/.test(name) || name.trim().length > 8) {
      alert("Please enter valid name");
      return;
    } */
    function cleanPhoneNumber(value) {
      return (value || "").replace(/[^\d]/g, "");
    }

    const cleanContact1Phone = cleanPhoneNumber(contact1.phone);
    const cleanContact2Phone = cleanPhoneNumber(contact2.phone);

    if (!cleanContact1Phone && !cleanContact2Phone) {
      alert("Please enter at least one contact phone");
      return;
    }
    function isValidPhone(phone) {
      return phone.startsWith("05") && phone.length === 10;
    }

    if (
      (cleanContact1Phone && !isValidPhone(cleanContact1Phone)) ||
      (cleanContact2Phone && !isValidPhone(cleanContact2Phone))
    ) {
      alert("One of the contact phone numbers is invalid");
      return;
    }

    // אם יש טלפון → חייב שם תקין
    if (
      (cleanContact1Phone &&
        (!isValidName(contact1.firstName) ||
          !isValidName(contact1.lastName))) ||
      (cleanContact2Phone &&
        (!isValidName(contact2.firstName) || !isValidName(contact2.lastName)))
    ) {
      alert("Please enter valid first and last name for contacts");
      return;
    }

    function isValidName(name) {
      return name && name.trim().length >= 2 && !/\d/.test(name);
    }
    //מנקים את מספר הטלפון ממקפים ורווחים ובהמשך מוודאים מספר ספרות
    /*  const cleanPhone = phone.replace(/[^\d]/g, ""); */
    /*  const cleanContact1Phone = (contact1.phone || "").replace(/[^\d]/g, "");
    const cleanContact2Phone = (contact2.phone || "").replace(/[^\d]/g, ""); */

    /*  if (!cleanContactPhone.startsWith("05") || cleanContactPhone.length != 10) {
      alert("Please enter valid phone number");
      return;
    } */

    /*      const cleanPhone = phone.replace(/[^\d]/g, "");

if (!cleanPhone.startsWith("05") || cleanPhone.length !== 10) {
  alert("Please enter valid phone number");
  return;
} */

    await onAddResident({
      area: area,
      address,
      contacts: [
        { ...contact1, phone: cleanContact1Phone },
        { ...contact2, phone: cleanContact2Phone },
      ].filter((c) => c.phone),
      totalResidents: Number(totalResidents),
      currentAtHome: Number(currentAtHome),
      specialNeeds,
    });

    onClose(); // סוגר את הטופס אחרי הוספה
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Add Household</h3>
        <form className="add-resident-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Resident name</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="First name"
              value={contact1.firstName}
              onChange={(e) =>
                setContact1({ ...contact1, firstName: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Last name"
              value={contact1.lastName}
              onChange={(e) =>
                setContact1({ ...contact1, lastName: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Phone"
              value={contact1.phone}
              onChange={(e) =>
                setContact1({ ...contact1, phone: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Second contact first name"
              value={contact2.firstName}
              onChange={(e) =>
                setContact2({ ...contact2, firstName: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Second contact last name"
              value={contact2.lastName}
              onChange={(e) =>
                setContact2({ ...contact2, lastName: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Second contact phone"
              value={contact2.phone}
              onChange={(e) =>
                setContact2({ ...contact2, phone: e.target.value })
              }
            />
          </div>
          {/*   <div className="form-group">
            <label>Phone number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div> */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Total residents"
              value={totalResidents}
              onChange={(e) => setTotalResidents(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Currently at home"
              value={currentAtHome}
              onChange={(e) => setCurrentAtHome(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Special Needs</label>
            <textarea
              placeholder="Enter any special needs..."
              value={specialNeeds}
              onChange={(e) => setSpecialNeeds(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Area</label>
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Select Area</option>
              <option value="S0">S0</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
              <option value="S4">S4</option>
              <option value="S5">S5</option>
              <option value="S6">S6</option>
              <option value="S7">S7</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit">
            Add Household
          </button>
        </form>
      </div>
    </div>
  );
}
