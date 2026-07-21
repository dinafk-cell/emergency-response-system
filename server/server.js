import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

app.use(express.json()); //middleware for JSON conversion of req.body

// יצירת טוקן ובדיקת אותנטיקציה

const authenticateUser= (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: "Access denied",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/import-households", authenticateUser, async (req, res) => {
  try {
    const households = req.body;

    for (const householdData of households) {
      const existingHousehold = await prisma.household.findUnique({
        where: {
          address: Number(householdData.address),
        },
      });

      if (existingHousehold) {
        continue;
      }

      const household = await prisma.household.create({
        data: {
          address: Number(householdData.address),
          contacts: householdData.contacts,
          totalResidents: householdData.totalResidents,
          area: householdData.area,
          specialNeeds: householdData.specialNeeds || null,
        },
      });

      await prisma.statusUpdate.create({
        data: {
          status: "no_answer",
          currentAtHome: 0,
          lastUpdated: new Date(),
          householdId: household.id,
          userId: req.user.id,
        },
      });
    }


    res.status(200).json({
      message: "Import completed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Import failed",
    });
  }
});

app.get("/households", authenticateUser, async (req, res) => {
  try {
    let households;

    if (req.user.role === "TEAM_LEADER") {
      households = await prisma.household.findMany();
    } else if (req.user.role === "TEAM_MEMBER") {
      households = await prisma.household.findMany({
        where: {
          area: req.user.area,
        },
      });
    }

    return res.status(200).json(households);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server error",
    });
  }
});

app.get("/households/:id", authenticateUser, async (req, res) => {
  try {
    const householdId = Number(req.params.id);


    const household = await prisma.household.findUnique({
      where: {
        id: householdId,
      },
      include: {
        statusUpdates: true,
      },
    });

    if (!household) {
      return res.status(404).json({
        error: "Household not found",
      });
    }

    // TEAM_LEADER יכול לראות הכל
    if (req.user.role === "TEAM_LEADER") {
      return res.status(200).json(household);
    }

    // TEAM_MEMBER יכול לראות רק את האזור שלו
    if (req.user.role === "TEAM_MEMBER" && household.area !== req.user.area) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    return res.status(200).json(household);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/statusupdate", authenticateUser, async (req, res) => {
  try {
    if (
      !req.body.householdId ||
      !req.body.status ||
      req.body.currentAtHome === undefined
    ) {
      return res.status(400).json({
        error: "One or more required fields are missing",
      });
    }

    const householdId = Number(req.body.householdId);
    const currentAtHome = Number(req.body.currentAtHome);
    const { status } = req.body;

    const userId = req.user.id;

    if (Number.isNaN(householdId) || Number.isNaN(currentAtHome)) {
      return res.status(400).json({
        error: "Invalid numeric values",
      });
    }

    const validStatuses = ["no_answer", "not_home", "at_home"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }
    const household = await prisma.household.findUnique({
      where: {
        id: householdId,
      },
    });
    if (req.user.role === "TEAM_MEMBER" && household.area !== req.user.area) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }
    const statusUpdate = await prisma.statusUpdate.create({
      data: {
        status,
        currentAtHome,
        lastUpdated: new Date(),
        householdId,
        userId,
      },
    });

    res.status(201).json(statusUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.post("/households", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        error: "Forbidden",
      });
    }
    if (
      !req.body.address ||
      !req.body.contacts ||
      !req.body.totalResidents ||
      !req.body.area
    ) {
      return res.status(400).json({
        error: "One or more required fields are missing",
      });
    }

    const address = Number(req.body.address);
    const totalResidents = Number(req.body.totalResidents);
    const { contacts, area, specialNeeds } = req.body;

    if (Number.isNaN(address) || Number.isNaN(totalResidents)) {
      return res.status(400).json({
        error: "Invalid numeric values",
      });
    }

    const existingHousehold = await prisma.household.findUnique({
      where: {
        address: address,
      },
    });

    if (existingHousehold) {
      return res.status(409).json({
        message:
          "Household ${address} already exists. Please update the existing household instead.",
      });
    }

    const household = await prisma.household.create({
      data: {
        address,
        contacts,
        totalResidents,
        area,
        specialNeeds,
      },
    });

    await prisma.statusUpdate.create({
      data: {
        status: "no_answer",
        currentAtHome: 0,
        lastUpdated: new Date(),
        householdId: household.id,
        userId: req.user.id,
      },
    });

    res.status(201).json(household);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// עדכון בית קיים
app.patch("/households/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        error: "Forbidden",
      });
    }
    const householdId = Number(req.params.id);
    if (Number.isNaN(householdId)) {
      return res.status(400).json({
        error: "Invalid household id",
      });
    }
    const household = await prisma.household.findUnique({
      where: {
        id: householdId,
      },
    });

    if (!household) {
      return res.status(404).json({
        error: "Household not found",
      });
    }
    const { address, contacts, totalResidents, area, specialNeeds } = req.body;
    const updateData = {};
    if (address !== undefined) {
      updateData.address = Number(address);
    }

    if (contacts !== undefined) {
      updateData.contacts = contacts;
    }

    if (totalResidents !== undefined) {
      updateData.totalResidents = Number(totalResidents);
    }

    if (area !== undefined) {
      updateData.area = area;
    }

    if (specialNeeds !== undefined) {
      updateData.specialNeeds = specialNeeds;
    }
    if (updateData.address !== undefined && Number.isNaN(updateData.address)) {
      return res.status(400).json({
        error: "Invalid address",
      });
    }

    if (
      updateData.totalResidents !== undefined &&
      Number.isNaN(updateData.totalResidents)
    ) {
      return res.status(400).json({
        error: "Invalid totalResidents",
      });
    }
    if (updateData.address !== undefined) {
      const existingHousehold = await prisma.household.findUnique({
        where: {
          address: updateData.address,
        },
      });

      if (existingHousehold && existingHousehold.id !== householdId) {
        return res.status(409).json({
          error: "Address already exists",
        });
      }
    }
    const updatedHousehold = await prisma.household.update({
      where: {
        id: householdId,
      },
      data: updateData,
    });
    res.status(200).json(updatedHousehold);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// הרשמה של משתמש חדש
// Future enhancement: Add a registration screen for TEAM_LEADER to create new users.
// בעתיד להגביל את settlement לרשימת יישובים מורשים
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, settlement, area } = req.body;
    if (!name || !email || !phone || !password || !settlement || !area) {
      return res.status(400).json({
        error: "One or more required fields are missing",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: "Invalid phone number",
      });
    }
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return res.status(409).json({
        error: "Phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "TEAM_MEMBER",
        settlement,
        area,
      },
    });
    const { password: hashedPasswordFromUser, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/current-status", authenticateUser, async (req, res) => {
  try {
    let households;

    if (req.user.role === "TEAM_LEADER") {
      households = await prisma.household.findMany({
        include: {
          statusUpdates: {
            orderBy: {
              lastUpdated: "desc",
            },
            take: 1,
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    if (req.user.role === "TEAM_MEMBER") {
      households = await prisma.household.findMany({
        where: {
          area: req.user.area,
        },
        include: {
          statusUpdates: {
            orderBy: {
              lastUpdated: "desc",
            },
            take: 1,
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    res.status(200).json(households);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

//בדיקת משתמש

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "One or more required fields are missing",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        area: user.area,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/statusupdates", authenticateUser, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const validStatuses = ["no_answer", "not_home", "at_home"];
    let dateFilter = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid date format",
        });
      }

      dateFilter = {
        lastUpdated: {
          gte: start, //Greater Than or Equal
          lte: end, //Less Than or Equal
        },
      };
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }
    let statusUpdates;

    if (req.user.role === "TEAM_LEADER") {
      statusUpdates = await prisma.statusUpdate.findMany({
        where: {
          ...(status && { status }),
          ...dateFilter,
        },
        include: {
          household: true,
        },
        orderBy: {
          lastUpdated: "asc",
        },
      });
    }
    if (req.user.role === "TEAM_MEMBER") {
      statusUpdates = await prisma.statusUpdate.findMany({
        where: {
          household: {
            area: req.user.area,
          },
          ...(status && { status }),
          ...dateFilter,
        },
        include: {
          household: true,
        },
        orderBy: {
          lastUpdated: "asc",
        },
      });
    }
    res.status(200).json(statusUpdates);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

app.delete("/households/:id", authenticateUser, async (req, res) => {
  try {
    const householdId = Number(req.params.id);

    if (Number.isNaN(householdId)) {
      return res.status(400).json({
        error: "Invalid household id",
      });
    }

    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const household = await prisma.household.findUnique({
      where: {
        id: householdId,
      },
    });

    if (!household) {
      return res.status(404).json({
        error: "Household not found",
      });
    }

    await prisma.statusUpdate.deleteMany({
      where: {
        householdId,
      },
    });

    await prisma.household.delete({
      where: {
        id: householdId,
      },
    });

    res.status(200).json({
      message: "Household deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Delete failed",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
