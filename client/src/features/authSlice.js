import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, isLoading: false },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAccessToken: (state, action) => { state.accessToken = action.payload; },
    updateUser: (state, action) => { state.user = { ...state.user, ...action.payload }; },
    logout: (state) => { state.user = null; state.accessToken = null; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

export const { setCredentials, setAccessToken, updateUser, logout, setLoading } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;

// Decodes a JWT token payload to read its expiration date safely without external dependencies
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token expiration (exp) is in the past (multiply by 1000 to convert to ms)
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true; // If decoding fails, treat it as expired/invalid
  }
};

export const selectIsAuthenticated = (state) => {
  const { user, accessToken } = state.auth;
  // User is authenticated ONLY if both user object exists and access token is valid
  return !!user && !isTokenExpired(accessToken);
};

export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export default authSlice.reducer;
