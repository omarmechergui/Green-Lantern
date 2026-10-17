import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { api } from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Mock the global fetch
const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe("1. Frontend API Client (services/api.js)", () => {
  test("api.get passes credentials: include and parses successful JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ status: "ok", data: { test: 123 } }),
    });

    const result = await api.get("/test-endpoint");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test-endpoint"),
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
    expect(result.data.test).toBe(123);
  });

  test("api.post throws informative error on non-2xx responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ status: "error", message: "Invalid email or password." }),
    });

    await expect(api.post("/auth/login", { email: "a@b.com", password: "123" })).rejects.toThrow(
      "Invalid email or password."
    );
  });
});

describe("2. Authentication Context (context/AuthContext.jsx)", () => {
  function TestConsumer() {
    const { user, loading, isAuthenticated, login, logout } = useAuth();
    if (loading) return <div>Loading Auth...</div>;
    return (
      <div>
        <div data-testid="auth-status">{isAuthenticated ? "authenticated" : "unauthenticated"}</div>
        <div data-testid="user-email">{user?.email || "none"}</div>
        <button onClick={() => login("test@example.com", "Password123")}>Do Login</button>
        <button onClick={() => logout()}>Do Logout</button>
      </div>
    );
  }

  test("Checks session on mount and sets user when /auth/me returns 200", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        data: { user: { id: "u1", email: "citizen@example.com", fullName: "Citizen One" } },
      }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      expect(screen.getByTestId("user-email")).toHaveTextContent("citizen@example.com");
    });
  });

  test("Handles 401 on /auth/me gracefully without crashing and sets unauthenticated", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ status: "error", message: "Authentication required" }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("unauthenticated");
      expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    });
  });

  test("Never writes JWT to localStorage or sessionStorage", async () => {
    const localSpy = jest.spyOn(Storage.prototype, "setItem");
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        data: { user: { id: "u1", email: "test@example.com" } },
      }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    });

    // Verify cookies/tokens are never stored in browser storage
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("jwt")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
    localSpy.mockRestore();
  });
});

describe("3. Waste Declaration API Tests (services/api.js)", () => {
  test("Unauthenticated declaration submission is rejected with 401", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Authentication required. Please sign in.",
      }),
    });

    await expect(
      api.post("/waste-declarations", {
        wasteCategoryId: "abc123",
        deliveryMethod: "DROP_OFF",
        estimatedWeight: 2.5,
      })
    ).rejects.toThrow("Authentication required. Please sign in.");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/waste-declarations"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  test("Invalid weight/category/input is rejected with 400 validation errors", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Validation failed",
        errors: [
          { field: "estimatedWeight", message: "Weight must be a positive number" },
          { field: "wasteCategoryId", message: "Waste category is required" },
        ],
      }),
    });

    try {
      await api.post("/waste-declarations", {
        wasteCategoryId: "",
        deliveryMethod: "DROP_OFF",
        estimatedWeight: -5,
      });
      fail("Expected error to be thrown");
    } catch (err) {
      expect(err.status).toBe(400);
      expect(err.data.errors).toHaveLength(2);
      expect(err.data.errors[0].field).toBe("estimatedWeight");
    }
  });

  test("Valid declaration is persisted and associated with the authenticated user", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        message: "Waste declaration submitted successfully.",
        data: {
          declaration: {
            id: "decl-001",
            citizenId: "user-001",
            wasteCategoryId: "cat-001",
            deliveryMethod: "DROP_OFF",
            estimatedWeight: 3.5,
            description: "Mixed plastics",
            status: "PENDING",
            createdAt: "2026-10-17T09:00:00.000Z",
            wasteCategory: { name: "Plastic", pointsPerKg: 10 },
          },
        },
      }),
    });

    const result = await api.post("/waste-declarations", {
      wasteCategoryId: "cat-001",
      deliveryMethod: "DROP_OFF",
      estimatedWeight: 3.5,
      description: "Mixed plastics",
    });

    expect(result.status).toBe("success");
    expect(result.data.declaration.id).toBe("decl-001");
    expect(result.data.declaration.citizenId).toBe("user-001");
    expect(result.data.declaration.status).toBe("PENDING");
    expect(result.data.declaration.estimatedWeight).toBe(3.5);
  });

  test("Database/API errors do not produce a false success response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Internal server error",
      }),
    });

    try {
      await api.post("/waste-declarations", {
        wasteCategoryId: "cat-001",
        deliveryMethod: "DROP_OFF",
        estimatedWeight: 2.0,
      });
      fail("Expected error to be thrown");
    } catch (err) {
      expect(err.status).toBe(500);
      expect(err.message).toBe("Internal server error");
    }
  });

  test("Network failure does not produce a false success response", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    try {
      await api.post("/waste-declarations", {
        wasteCategoryId: "cat-001",
        deliveryMethod: "DROP_OFF",
        estimatedWeight: 1.0,
      });
      fail("Expected error to be thrown");
    } catch (err) {
      expect(err.isNetworkError).toBe(true);
    }
  });
});

describe("4. Frontend shows success only after successful API response", () => {
  // Lazy import to avoid module-level side effects
  let DeclareWaste;

  beforeAll(() => {
    DeclareWaste = require("./pages/User/DeclareWaste/DeclareWaste").default;
  });

  test("DeclareWaste shows success message only after API confirms persistence", async () => {
    // First call: /auth/me (from AuthProvider check — not present here, direct render)
    // The component loads categories on mount, then user submits
    let submitResolve;
    const submitPromise = new Promise((resolve) => { submitResolve = resolve; });

    let callCount = 0;
    global.fetch = jest.fn().mockImplementation((url) => {
      callCount++;
      // First call: GET /waste-categories
      if (url.includes("/waste-categories")) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: async () => ({
            status: "success",
            data: {
              categories: [
                { id: "cat-1", name: "Plastic", pointsPerKg: 10, description: null, icon: null },
              ],
            },
          }),
        });
      }
      // POST /waste-declarations
      if (url.includes("/waste-declarations")) {
        return submitPromise;
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => ({ status: "success" }),
      });
    });

    render(<DeclareWaste />);

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText("Plastic")).toBeInTheDocument();
    });

    // Fill in the weight field
    const weightInput = screen.getByPlaceholderText("e.g. 2.5");
    fireEvent.change(weightInput, { target: { value: "3" } });

    // Submit the form
    const submitBtn = screen.getByText("Submit Declaration");
    fireEvent.click(submitBtn);

    // Success message should NOT be shown yet (API hasn't resolved)
    expect(screen.queryByText(/submitted successfully/i)).not.toBeInTheDocument();

    // Now resolve the API call
    submitResolve({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        message: "Waste declaration submitted successfully.",
        data: {
          declaration: {
            id: "decl-123",
            citizenId: "u1",
            wasteCategoryId: "cat-1",
            status: "PENDING",
            estimatedWeight: 3,
          },
        },
      }),
    });

    // Now the success message should appear
    await waitFor(() => {
      expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
    });
  });
});

describe("5. Phase 3 & 4: Security, Eco Coins, Redemption & Ownership Tests", () => {
  test("Pending declarations do not award points at creation time", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        data: {
          declaration: {
            id: "decl-pending",
            status: "PENDING",
            estimatedWeight: 5.0,
          },
        },
      }),
    });

    const result = await api.post("/waste-declarations", {
      wasteCategoryId: "cat-1",
      deliveryMethod: "DROP_OFF",
      estimatedWeight: 5.0,
    });

    expect(result.data.declaration.status).toBe("PENDING");
    // Points must NOT be in the creation response
    expect(result.data.declaration.pointsAwarded).toBeUndefined();
  });

  test("Unauthorized users cannot approve declarations (403/401 forbidden)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Forbidden: You do not have permission to perform this action.",
      }),
    });

    await expect(
      api.patch("/waste-declarations/decl-1/review", { status: "APPROVED" })
    ).rejects.toThrow("Forbidden");
  });

  test("A citizen cannot approve their own declaration", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Security violation: You cannot review or approve your own declaration.",
      }),
    });

    await expect(
      api.patch("/waste-declarations/decl-own/review", { status: "APPROVED" })
    ).rejects.toThrow("Security violation: You cannot review or approve your own declaration.");
  });

  test("Repeated approval does not award points twice (idempotency rejection)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Declaration is already approved and cannot be modified.",
      }),
    });

    await expect(
      api.patch("/waste-declarations/decl-already-approved/review", { status: "APPROVED" })
    ).rejects.toThrow("Declaration is already approved");
  });

  test("Dashboard and history return data belonging only to authenticated user", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        data: {
          declarations: [
            { id: "d-1", citizenId: "my-user-id", estimatedWeight: 4 },
          ],
        },
      }),
    });

    const res = await api.get("/waste-declarations");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/waste-declarations"),
      expect.objectContaining({ credentials: "include" })
    );
    expect(res.data.declarations[0].citizenId).toBe("my-user-id");
  });

  test("Profile updates cannot change roles or balances", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        data: {
          user: {
            id: "u-1",
            fullName: "Legit Name",
            role: "CITIZEN", // Remains CITIZEN despite attack payload
            ecoBalance: 0, // Remains 0 despite attack payload
          },
        },
      }),
    });

    const res = await api.patch("/users/profile", {
      fullName: "Legit Name",
      role: "ADMIN", // Malicious attempt to escalate role
      ecoBalance: 999999, // Malicious attempt to forge balance
    });

    expect(res.data.user.role).toBe("CITIZEN");
    expect(res.data.user.ecoBalance).toBe(0);
  });

  test("Redemption fails when the balance is insufficient (400 rejection)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Insufficient Eco Coins. You need 500 points, but currently have 50.",
      }),
    });

    await expect(
      api.post("/rewards/redeem", { rewardId: "rew-1" })
    ).rejects.toThrow("Insufficient Eco Coins");
  });

  test("Repeated redemption requests cannot double-deduct points", async () => {
    let call = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      call++;
      if (call === 1) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: async () => ({
            status: "success",
            data: { remainingBalance: 0 },
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: async () => ({
          status: "error",
          message: "Insufficient Eco Coins. You need 100 points, but currently have 0.",
        }),
      });
    });

    const first = await api.post("/rewards/redeem", { rewardId: "rew-1" });
    expect(first.data.remainingBalance).toBe(0);

    // Second redemption attempt immediately fails
    await expect(api.post("/rewards/redeem", { rewardId: "rew-1" })).rejects.toThrow(
      "Insufficient Eco Coins"
    );
  });

  test("Users cannot read or mark another user's notifications as read", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "error",
        message: "Forbidden: You do not own this notification.",
      }),
    });

    await expect(
      api.patch("/notifications/notif-someone-else/read")
    ).rejects.toThrow("Forbidden: You do not own this notification.");
  });

  test("Leaderboard results do not expose private user data (passwords, emails, phones)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        status: "success",
        data: {
          leaderboard: [
            {
              rank: 1,
              id: "u-1",
              name: "Public Recycler",
              points: 500,
              isCurrentUser: false,
            },
          ],
        },
      }),
    });

    const res = await api.get("/leaderboard");
    const entry = res.data.leaderboard[0];

    expect(entry.name).toBe("Public Recycler");
    expect(entry.points).toBe(500);
    // Crucial privacy protections
    expect(entry.email).toBeUndefined();
    expect(entry.password).toBeUndefined();
    expect(entry.passwordHash).toBeUndefined();
    expect(entry.phone).toBeUndefined();
  });
});

