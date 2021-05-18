import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import './UserItem.css';

const UserItem = (props) => {
  return (
    <div className='user-item'>
      <Card className='user-item__content'>
        <Link to={`/profile/${props.id}`}>
          <div className='user-item__image'>
            <Avatar
              image={`http://localhost:5000/${props.image}`}
              alt={props.name}
            />
          </div>
          <div className='user-item__info'>
            <h2>{props.name}</h2>
            <h3>
              {props.placeCount}{' '}
              {props.placeCount === 1 ? 'FAVORITE PLACE' : 'FAVORITE PLACES'}
            </h3>
          </div>
        </Link>
        <div className='user-item__details'>
          <div></div>
        </div>
      </Card>
    </div>
  );
};

export default UserItem;
