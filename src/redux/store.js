import { configureStore } from '@reduxjs/toolkit'
import loginSlice from './slice/loginSlice'
import chatsSlice from './slice/chatsSlice'
export const store = configureStore({
  reducer: {
      loginSlice,
      chatsSlice,
  },
})