import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

import './UserProfile.css';

const UserProfile = () => {
  const [loadedUser, setLoadedUser] = useState();
  const { isLoading, error, sendRequest } = useHttpClient();
  const auth = useContext(AuthContext);
  const userId = useParams().userId;
  console.log(userId);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/profile/${userId}`
        );
        setLoadedUser(responseData);
        console.log(responseData);
      } catch (err) {}
    };
    fetchUser();
  }, [sendRequest, userId]);

  if (isLoading) {
    return (
      <div className='center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedUser && !error) {
    return (
      <div className='center'>
        <Card>
          <h2>Could not find User!</h2>
        </Card>
      </div>
    );
  }

  return (
    <ul className='profile-list'>
      <li className='profile-item'>
        <Card className='profile-item__content'>
          {isLoading && <LoadingSpinner asOverlay />}
          <div className='profile-item__image'>
            <img
              src={`${process.env.REACT_APP_ASSET_URL}/${loadedUser.img}`}
              alt={loadedUser.img}
            />
          </div>
          <div className='profile-item__info'>
            <h2>{loadedUser.name}</h2>
            <p>{loadedUser.about}</p>
          </div>

          <div className='profile-item__actions'>
            <Button to={`/${userId}/places`}>SHOW FAVORITE PLACES</Button>
            {auth.userId === loadedUser.userId && (
              <Button to={`/profile/edit/${loadedUser.userId}`}>EDIT</Button>
            )}
            {auth.userId === loadedUser.userId && (
              <Button danger>DELETE</Button>
            )}
          </div>
        </Card>
      </li>
    </ul>
  );
};

export default UserProfile;
