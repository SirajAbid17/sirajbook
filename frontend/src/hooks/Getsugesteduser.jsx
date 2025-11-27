import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSuggestedUsers } from '../redux/userslice';
import axios from 'axios';
import { ServerUrl } from '../App';

const GetSuggestedUsers = () => {
  const dispatch = useDispatch();
  const { authChecked, userdata } = useSelector(state => state.user);

  useEffect(() => {
    const getSuggestedUsers = async () => {
      try {
        console.log("Fetching suggested users...");
        
        const response = await axios.get(`${ServerUrl}/api/suggestedusers`, { 
          withCredentials: true 
        });
        
        console.log("Suggested users response:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          dispatch(setSuggestedUsers(response.data));
          console.log("Suggested users set in Redux:", response.data.length);
        } else {
          console.log("No suggested users found");
          dispatch(setSuggestedUsers([]));
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        console.error("Error details:", error.response?.data);
        dispatch(setSuggestedUsers([]));
      }
    };

    if (authChecked && userdata) {
      console.log("Auth checked and user data exists, fetching suggested users");
      getSuggestedUsers();
    } else {
      console.log("Not fetching suggested users - authChecked:", authChecked, "userdata:", userdata);
    }
  }, [dispatch, authChecked, userdata]);

  return null;
};

export default GetSuggestedUsers;