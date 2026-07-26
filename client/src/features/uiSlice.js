import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { isDarkMode: false, isSidebarOpen: false, isMobileMenuOpen: false },
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => { state.isSidebarOpen = !state.isSidebarOpen; },
    toggleMobileMenu: (state) => { state.isMobileMenuOpen = !state.isMobileMenuOpen; },
    setMobileMenuOpen: (state, action) => { state.isMobileMenuOpen = action.payload; },
  },
});

export const { toggleDarkMode, toggleSidebar, toggleMobileMenu, setMobileMenuOpen } = uiSlice.actions;
export const selectIsDarkMode = (state) => state.ui.isDarkMode;
export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen;
export default uiSlice.reducer;
