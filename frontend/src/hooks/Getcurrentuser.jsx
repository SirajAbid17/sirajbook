import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setuserdata, setLoading, setAuthChecked } from '../redux/userslice';
import axios from 'axios';
import { ServerUrl } from '../App';

const GetCurrentUser = () => {
  const dispatch = useDispatch();
  const { authChecked } = useSelector(state => state.user);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        dispatch(setLoading(true));
        
        const response = await axios.get(`${ServerUrl}/api/user/currentuser`, { 
          withCredentials: true 
        });
        
        if (response.data) {
          dispatch(setuserdata(response.data));
        } else {
          dispatch(setuserdata(null));
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        dispatch(setuserdata(null));
      } finally {
        dispatch(setLoading(false));
        dispatch(setAuthChecked(true));
      }
    };

    if (!authChecked) {
      getCurrentUser();
    }
  }, [dispatch, authChecked]);

  return null;
};

export default GetCurrentUser;