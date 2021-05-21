// import React from 'react';
import React, { Component, useEffect, useState, useReducer } from 'react';
import axios from 'axios';
import mapStyles from './mapStyles';
import io from 'socket.io-client';
import UsersList from '../components/UsersList';
import Modal from '../../shared/components/UIElements/Modal';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import Location from './Location.css';
export default function GoogleMapComponent() {
  return (
    <div>
      <GoogleMap
        id='map'
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        options={options}
        // onClick={onMapClick}
        onLoad={onMapLoad}
        // tilt={45}
      >
        {/* {loadedUsers &&
markers.map((marker, index) => (
  <div className='marker-wrapper'>
    <h1 className='haha'>jo</h1>
    {loadedUsers && (
      <Marker
        key={index}
        position={{
          lat: marker.liveLocation.lat,
          lng: marker.liveLocation.lng,
        }}
        // animation={{ Animation: BOUNCE }}
        onClick={() => {
          setShortInfo(marker);
          setSelected(marker);
          console.log(marker);
        }}
        // icon={{
        //   url: `asd`,
        //   origin: new window.google.maps.Point(0, 0),
        //   anchor: new window.google.maps.Point(15, 15),
        //   scaledSize: new window.google.maps.Size(50, 50),
        //   label: 'hallo',
        //   title: 'jau',
        // }}
      />
    )}
  </div>
))} */}
        {places &&
          places.map((elt, index) => (
            <div className='marker-wrapper'>
              {console.log(elt, 'here')}
              <Marker
                key={index}
                position={{
                  lat: elt.coordinates.lat,
                  lng: elt.coordinates.lng,
                }}
                // animation={{ Animation: BOUNCE }}
                onClick={() => {
                  //   setShortInfo(marker);
                  setSelected(elt);
                  setSelectedPlace('More info about place');
                  console.log(elt);
                }}
                icon={{
                  url: `https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Black_square_45degree_angle.svg/1024px-Black_square_45degree_angle.svg.png`,
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15),
                  scaledSize: new window.google.maps.Size(50, 50),
                  // labelOrigin: new window.google.maps.Point(33, 0),
                }}
                label={{
                  text: elt.activeUsers.length.toString(),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '20px',
                }}
              />
            </div>
          ))}
        {newMarker.length > 0 &&
          newMarker.map((newMarker, index) => (
            <div className='marker-wrapper'>
              {console.log(
                loadedUsers.users.find((elt) => newMarker.userId === elt._id),
                'loaded users'
              )}

              <Marker
                key={index}
                position={{
                  lat: newMarker.lat,
                  lng: newMarker.lng,
                }}
                label={{
                  text: loadedUsers.users.find(
                    (elt) => newMarker.userId === elt._id
                  ).name,
                  color: '#f1fbf8',
                  fontWeight: 'bold',
                  fontSize: '22px',
                }}
                icon={{
                  url: '/green.svg',
                  anchor: new window.google.maps.Point(15, 15),
                  labelOrigin: new window.google.maps.Point(13, -10),
                  scaledSize: new window.google.maps.Size(30, 30),
                  origin: new window.google.maps.Point(0, 0),
                }}
              />
            </div>
          ))}

        {ownLocation && (
          <Marker
            position={{
              lat: ownLocation[0],
              lng: ownLocation[1],
            }}
            icon={{
              url: `/blue_sphere.svg`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          ></Marker>
        )}
        {!response && (
          <DirectionsService
            options={DirectionsServiceOption}
            callback={directionsCallback}
          />
        )}
        {response && (
          <DirectionsRenderer
            options={{
              directions: response,
            }}
          />
        )}

        {selected ? (
          <InfoWindow
            position={{
              lat: selected.coordinates.lat,
              lng: selected.coordinates.lng,
            }}
            onCloseClick={() => {
              setSelected(null);
              setSelectedPlace(null);
              setShowDetails(false);
            }}
          >
            <div className='infoWindow'>
              {selected && !selectedPlace && <h2>Text</h2>}
              {selectedPlace && <h2>{selected.title}</h2>}
              {selectedPlace && <h4>Rating: 3.5/5</h4>}
              {selectedPlace && <h4>{selected.address}</h4>}
              {selectedPlace && (
                <div>
                  <button
                    onClick={() => {
                      setShowDetails(true);
                      console.log(selected);
                    }}
                  >
                    DETAILS & CHECK IN
                  </button>
                </div>
              )}
              <div>
                <button
                  onClick={() => {
                    console.log(selected);
                    addFavMap();
                  }}
                >
                  ADD 2 FAVORITES
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    calculateRoute({
                      lat: selected.coordinates.lat,
                      lng: selected.coordinates.lng,
                    });
                  }}
                >
                  {' '}
                  ROUTE
                </button>
              </div>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
      ;
    </div>
  );
}
