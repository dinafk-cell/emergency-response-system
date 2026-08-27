import { describe, it, expect, vi, beforeEach } from "vitest";
import { login } from "../server.js";
import { getMaxListeners } from "supertest/lib/test.js";
import jwt from "jsonwebtoken";


const { findUniqueMock, compareMock } = vi.hoisted(() => {
  return {
    findUniqueMock: vi.fn(),
    compareMock: vi.fn(),
  };
});

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      user = {
        findUnique: findUniqueMock,
      };
    },
  };
});

vi.mock("bcrypt", () => ({
  default: {
    compare: compareMock,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

it("returns 400 when required fields are missing", async () => {
  const req = {
    body: {}
  };

  const res = {
    status: vi.fn(),
    json: vi.fn()
  };

  res.status.mockReturnValue(res);

await login(req, res);

expect(res.status).toHaveBeenCalledWith(400);
});


it("returns 401 when user does not exist", async () => {

   const req = {
    body: {
        email:"test@test.com",
        password:"123456"
    }
  };

   const res = {
    status: vi.fn(),
    json: vi.fn()
  };

  res.status.mockReturnValue(res);

   findUniqueMock.mockReturnValue(null);

  await login(req, res);

  expect(res.status).toHaveBeenCalledWith(401);

});

it("returns 401 when password is invalid", async () => {

    const req = {
    body: {
        email:"test@test.com",
        password: "wrong-password"
    }
  };

   const res = {
    status: vi.fn(),
    json: vi.fn()
  };

  res.status.mockReturnValue(res);

    findUniqueMock.mockResolvedValue({
  id: 1,
  email: "test@test.com",
  password: "hashed-password"
});

    compareMock.mockResolvedValue(false);   

await login(req, res);

expect(res.status).toHaveBeenCalledWith(401);
});

it("returns 200 and token when login is successful", async () => {

    const req = {
  body: {
    email: "test@test.com",
    password: "correct-password"
  }
};

const res = {
  status: vi.fn(),
  json: vi.fn()
};

res.status.mockReturnValue(res);

findUniqueMock.mockResolvedValue({
  id: 1,
  email: "test@test.com",
  password: "hashed-password"
});
compareMock.mockResolvedValue(true);

jwt.sign.mockReturnValue("fake-token");

await login(req, res);

expect(res.status).toHaveBeenCalledWith(200);

expect(res.json).toHaveBeenCalledWith({
  message: "Login successful",
  token: "fake-token",
});


});