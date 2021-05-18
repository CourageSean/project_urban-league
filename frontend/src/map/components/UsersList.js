import React from 'react';

import UserItem from './UserItem';
import Card from '../../shared/components/UIElements/Card';
import './UsersList.css';

const UsersList = (props) => {
  if (props.items.users.length === 0) {
    return (
      <div className='center'>
        <Card>
          <h2>No users found.</h2>
        </Card>
      </div>
    );
  }

  return (
    <ul className='users-list'>
      {props.items.users.map((user) => (
        <UserItem
          key={user.id}
          id={user.id}
          image={user.image}
          name={user.name}
          liveLocationLat={user.liveLocation.lat}
          liveLocationLng={user.liveLocation.lng}
          placeCount={user.places.length}
        />
      ))}
    </ul>
  );
};

export default UsersList;
