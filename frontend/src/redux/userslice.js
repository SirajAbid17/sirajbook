import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userdata: null,
  loading: true,
  authChecked: false,
  suggestedUsers: [] ,
  profiledata:null
};

const userslice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setuserdata: (state, action) => {
      state.userdata = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
    logout: (state) => {
      state.userdata = null;
      state.loading = false;
      state.authChecked = true;
      state.suggestedUsers = [];
    },
    setSuggestedUsers: (state, action) => { 
      state.suggestedUsers = action.payload;
    },
    setprofiledata:(state,action)=>{
      state.profiledata=action.payload
    }
  }
});

export const { setuserdata, setLoading, setAuthChecked, logout, setSuggestedUsers,setprofiledata } = userslice.actions;
export default userslice.reducer;