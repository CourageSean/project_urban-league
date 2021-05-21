import React from 'react';
import './GetStarted.css';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './Auth.css';
const GetStarted = () => {
  const { isLoading } = useHttpClient();
  return (
    <React.Fragment>
      <Card className='authentication'>
        {isLoading && <LoadingSpinner asOverlay />}
        <h1>FIND THE BEST SPOT IN THE CITY.</h1>
        <p className='about'>
          Urban League is a sports directory with the goal of helping players of
          all levels to find the best courts and make more sport wherever they
          go.
        </p>
        <div>
          <Button to={`/auth`}>GET STARTED</Button>
        </div>
      </Card>
    </React.Fragment>
  );
};
export default GetStarted;
