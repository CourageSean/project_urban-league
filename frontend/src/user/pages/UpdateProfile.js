import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import {
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import '../../places/pages/PlaceForm.css';

const UpdateProfile = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUser, setLoadedUser] = useState();
  const userId = useParams().userId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: {
        value: '',
        isValid: false,
      },
      about: {
        value: '',
        isValid: false,
      },
      
    },
    false
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/profile/${userId}`
        );
        setLoadedUser(responseData);
        console.log(responseData);
        setFormData(
          {
            name: {
              value: responseData.name,
              isValid: true,
            },
            about: {
              value: responseData.about,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchUser();
  }, [sendRequest, userId, setFormData]);

  const userUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/users/profile/${userId}`,
        'PATCH',
        JSON.stringify({
          name: formState.inputs.name.value,
          about: formState.inputs.about.value,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        }
      );
      history.push('/users/profile/' + auth.userId);
    } catch (err) {}
  };

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
          <h2>Could not find Profile!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedUser && (
        <form className='place-form' onSubmit={userUpdateSubmitHandler}>
          <Input
            id='name'
            element='input'
            type='text'
            label='Name'
            validators={[VALIDATOR_REQUIRE()]}
            errorText='Please enter a valid name.'
            onInput={inputHandler}
            initialValue={loadedUser.name}
            initialValid={true}
          />
           <Input
            id='about'
            element='textarea'
            label='About'
            validators={[VALIDATOR_REQUIRE()]}
            errorText='Please enter a short info.'
            onInput={inputHandler}
            initialValue={loadedUser.about}
            initialValid={true}
          />

          <Button type='submit' disabled={!formState.isValid}>
            UPDATE PROFILE
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdateProfile;
