import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserProfile = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/users/profile/${userId}`
        );
        setLoadedUsers(responseData.userprofile);
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <div>
      <h1>Userprofile</h1>
      <h1>Userprofile</h1>
      <h1>Userprofile</h1>
    </div>
  );
};

export default UserProfile;