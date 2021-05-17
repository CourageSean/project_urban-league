import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import UsersList from '../components/UsersList';
import UserItem from '../components/UserItem';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

import './UserProfile.css';

const UserProfile = () => {
  const [loadedUser, setLoadedUser] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const userId = useParams().userId;
  console.log(userId);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/users/profile/${userId}`
        );
        setLoadedUser(responseData);
        console.log(responseData);

      } catch (err) { }
    };
    fetchUser();
  }, [sendRequest, userId]);

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedUser && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find User!</h2>
        </Card>
      </div>
    );
  }

  return (
    <ul className="profile-list">
      <li className="profile-item">
        <Card className="profile-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="profile-item__image">
            <img
              src={`http://localhost:5000/${loadedUser.img}`}
              alt={loadedUser.img}
            />
          </div>
          <div className="profile-item__info">
            <h2>{loadedUser.name}</h2>
            <h3>{loadedUser.name}</h3>
            <p>{loadedUser.name}</p>
          </div>


          <div className="profile-item__actions">
            <Button to={`/${userId}/places`}>SHOW FAVORITE PLACES</Button>
            {auth.userId === loadedUser.userId && (
              <Button to={`/places/${loadedUser.id}`}>EDIT</Button>
            )}
            {auth.userId === loadedUser.userId && (
              <Button danger>
                DELETE
              </Button>
            )}
          </div>

        </Card>
      </li>
    </ul>
  );

};


export default UserProfile;