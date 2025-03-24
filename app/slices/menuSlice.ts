import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface MenuState {
  title: string | null;
  notifications: number;
}

const initialState: MenuState = {
  title: null,
  notifications: 0,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string | null>) => {
      state.title = action.payload;
    },
    incrementNotifications: (state) => {
      state.notifications += 1;
    },
    decrementNotifications: (state) => {
      if (state.notifications <= 0) return;
      state.notifications -= 1;
    },
    setNotifications: (state, action: PayloadAction<number>) => {
      state.notifications = action.payload;
    },
  },
  selectors: {
    selectTitle: (state) => state.title,
    selectNotifications: (state) => state.notifications,
  },
});

export const { 
  setTitle, 
  incrementNotifications, 
  decrementNotifications, 
  setNotifications 
} = menuSlice.actions;

export const { selectTitle, selectNotifications } = menuSlice.selectors;

export default menuSlice.reducer;