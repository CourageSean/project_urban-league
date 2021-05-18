import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">

      <li>
        <NavLink to="/livemap">LIVEMAP</NavLink>
      </li>

      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>

      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/profile/${auth.userId}`}>PROFILE</NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`}>MY FAVORITE PLACES</NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new">ADD FAVORITE PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">GET STARTED</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <button onClick={auth.logout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
