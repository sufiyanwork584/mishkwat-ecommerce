import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    setWishlist: (state, action) => { state.items = action.payload?.wishlist?.products || []; },
    clearWishlistState: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    // Listen to the auth/logout action and automatically wipe the wishlist state
    builder.addCase('auth/logout', (state) => {
      state.items = [];
    });
  },
});

export const { setWishlist, clearWishlistState } = wishlistSlice.actions;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some((item) => (item._id || item) === productId);
export default wishlistSlice.reducer;
