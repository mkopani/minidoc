import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  username: string | null;
  token: string | null;
}

interface RequiredUserData {
  username: string;
  token: string;
}

const initialState: UserState = {
  username: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<RequiredUserData>) {
      state.username = action.payload.username;
      state.token = action.payload.token;
    },
    clearUser(state) {
      state.username = null;
      state.token = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
