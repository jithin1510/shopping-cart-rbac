import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from '../features/auth/AuthSlice';
import ProductSlice from '../features/products/ProductSlice';
import CartSlice from '../features/cart/CartSlice';
import WishlistSlice from '../features/wishlist/WishlistSlice';
import OrderSlice from '../features/order/OrderSlice';
import UserSlice from '../features/user/UserSlice';
import AddressSlice from '../features/address/AddressSlice';
import ReviewSlice from '../features/review/ReviewSlice';
import BrandSlice from '../features/brands/BrandSlice';
import CategoriesSlice from '../features/categories/CategoriesSlice';

export const store = configureStore({
  reducer: {
    AuthSlice,
    ProductSlice,
    CartSlice,
    WishlistSlice,
    OrderSlice,
    UserSlice,
    AddressSlice,
    ReviewSlice,
    BrandSlice,
    CategoriesSlice
  },
});

export default store;