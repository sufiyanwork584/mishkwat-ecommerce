import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], itemCount: 0 },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload?.items || [];
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    clearCartState: (state) => { state.items = []; state.itemCount = 0; },
  },
  extraReducers: (builder) => {
    // Listen to the auth/logout action and automatically wipe the cart state
    builder.addCase('auth/logout', (state) => {
      state.items = [];
      state.itemCount = 0;
    });
  },
});

export const { setCart, clearCartState } = cartSlice.actions;
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.itemCount;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const price = item.product?.salePrice > 0 && item.product?.salePrice < item.product?.price
      ? item.product.salePrice : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
export default cartSlice.reducer;
