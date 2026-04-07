// src/services/api.js
// Backend base URL - change this to your Spring Boot server URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Helper to get JWT token from localStorage
const getToken = () => localStorage.getItem('quanment_token');

// Helper for authenticated requests
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

// ─── AUTH APIs ───────────────────────────────────────────────
export const authAPI = {
  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data; // { name, email, token }
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data; // { name, email, token }
  },

  logout: async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.text();
    return data;
  },
};

// ─── QUANTITY MEASUREMENT APIs ────────────────────────────────
// Backend unit names (enums) - must match Java enums exactly
// LengthUnit:      INCHES, FEET, YARDS, CENTIMETERS
// WeightUnit:      GRAM, KILOGRAM, POUND
// VolumeUnit:      MILLILITRE, LITRE, GALLON
// TemperatureUnit: CELSIUS, FAHRENHEIT, KELVIN

const buildPayload = (val1, unit1, type1, val2, unit2, type2, outputUnit = null) => ({
  thisQuantityDTO: { value: val1, unit: unit1, measurementType: type1 },
  thatQuantityDTO: { value: val2, unit: unit2, measurementType: type2 },
  ...(outputUnit ? { outputUnit } : {}),
});

export const quantityAPI = {
  convert: async (value, fromUnit, toUnit, measurementType) => {
    const res = await fetch(`${BASE_URL}/api/v1/quantities/convert`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(buildPayload(value, fromUnit, measurementType, 1.0, toUnit, measurementType)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Conversion failed');
    return data; // { operation, result, message, error }
  },

  add: async (val1, unit1, val2, unit2, measurementType, outputUnit) => {
    const res = await fetch(`${BASE_URL}/api/v1/quantities/add`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(buildPayload(val1, unit1, measurementType, val2, unit2, measurementType, outputUnit)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Addition failed');
    return data;
  },

  subtract: async (val1, unit1, val2, unit2, measurementType, outputUnit) => {
    const res = await fetch(`${BASE_URL}/api/v1/quantities/subtract`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(buildPayload(val1, unit1, measurementType, val2, unit2, measurementType, outputUnit)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Subtraction failed');
    return data;
  },

  divide: async (val1, unit1, val2, unit2, measurementType) => {
    const res = await fetch(`${BASE_URL}/api/v1/quantities/divide`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(buildPayload(val1, unit1, measurementType, val2, unit2, measurementType)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Division failed');
    return data;
  },

  getHistory: async () => {
    const res = await fetch(`${BASE_URL}/api/v1/quantities/history`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch history');
    return data;
  },

 deleteHistory: async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quantities/history`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear history');
  return true;
},

  deleteHistoryById: async (id) => {
    const res = await fetch(`${BASE_URL}/api/v1/quantities/history/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete history item');
  },
};

export default BASE_URL;
