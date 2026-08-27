import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn()
  }
}));

import { authenticateUser } from "../server.js";

beforeEach(() => {
  vi.resetAllMocks();
});




it("returns 401 when authorization header is missing", () => {
    const req = {
  headers: {}
};

const res = {
  status: vi.fn(),
  json: vi.fn()
};

res.status.mockReturnValue(res);

const next = vi.fn();


    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

});

it("returns 401 when token is invalid", () => {
    const req = {
  headers: {
    authorization: "Bearer invalid-token"
  }
};

const res = {
  status: vi.fn(),
  json: vi.fn()
};

res.status.mockReturnValue(res);

const next = vi.fn();

jwt.verify.mockImplementation(() => {
  throw new Error("Invalid token");
});

authenticateUser(req, res, next);

expect(res.status).toHaveBeenCalledWith(401);

});

it("calls next when token is valid", () => {
  const req = {
    headers: {
      authorization: "Bearer valid-token"
    }
  };

  const res = {
    status: vi.fn(),
    json: vi.fn()
  };

  res.status.mockReturnValue(res);

  const next = vi.fn();

  jwt.verify.mockReturnValue({ userId: 123 });

  authenticateUser(req, res, next);

  expect(req.user).toEqual({ userId: 123 });
  expect(next).toHaveBeenCalled();
});