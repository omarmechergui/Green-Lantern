const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error("Unable to connect to the server. Please check your connection.");
    error.isNetworkError = true;
    throw error;
  }

  // Handle empty bodies or non-JSON payloads safely
  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get(endpoint, options = {}) {
    return apiRequest(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
};
