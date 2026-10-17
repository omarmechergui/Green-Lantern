import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
