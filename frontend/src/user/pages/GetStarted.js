import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';


import './Auth.css';

const GetStarted = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  return (
    <React.Fragment>
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h1>Find the best spot in the city.</h1>
        <div className="">
          <Button to={`/auth`}>GET STARTED</Button>
        </div>
      </Card>
    </React.Fragment>
  );
};

export default GetStarted;
