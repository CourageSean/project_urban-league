import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
// import mapStyles from '../components/mapStyles';
import io from 'socket.io-client';
import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

// const testArray = [
//   { liveLocation: { lat: 50.915165747607714, lng: 6.10337325822752 } },
//   { liveLocation: { lat: 50.917165747607714, lng: 6.18337325822752 } },
//   { liveLocation: { lat: 50.93089720514569, lng: 6.104956327075176 } },
//   { liveLocation: { lat: 50.915165747607714, lng: 6.10777325822752 } },
// ];

const socket = io('localhost:5000');
//needed variables

const libraries = ['places'];
const mapContainerStyle = {
  height: '85vh',
  width: '60vw',
};
const options = {
  // styles: mapStyles,
  // disableDefaultUI: true,
  zoomControl: true,
  rotateControl: true,
};
const center = {
  lat: 51.24321,
  lng: 6.78724,
};

const Map = () => {
  const { error, sendRequest, clearError } = useHttpClient();
  const [isLoading, setIsLoading] = useState();
  const [loadedUsers, setLoadedUsers] = useState();
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [places, setPlaces] = useState(null);
  const [singlePlace, setSinglePlace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [shortInfo, setShortInfo] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [testArray, setTestArray] = useState([
    { liveLocation: { lat: 50.915165747607714, lng: 6.10337325822752 } },
    { liveLocation: { lat: 50.917165747607714, lng: 6.18337325822752 } },
    { liveLocation: { lat: 50.93089720514569, lng: 6.104956327075176 } },
    { liveLocation: { lat: 50.915165747607714, lng: 6.10777325822752 } },
  ]);
  const [destination, setDestination] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [response, setResponse] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [testMarkers, setTestMarkers] = useState([]);
  const [ownLocation, setOwnLocation] = useState(null);

  // User Posiotion State
  const [user_1Position, setUser_1Position] = useState();
  // On Mapload

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
    const paaan = () => {
      // envoke watchownposition
      watchOwnPosition();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          panTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => null
      );
    };
    paaan();

    const getUsersLocation = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/users');
        setMarkers(data.users);
        setLoadedUsers(data);
        setIsLoading(false);
        console.log(data.users);
      } catch (error) {
        console.log(error);
      }
    };
    const getPlaces = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          'http://localhost:5000/api/places/staticplaces'
        );
        setPlaces(data.staticPlaces);

        console.log(data, 'places');
        console.log(data.staticPlaces[0].coordinates.lat);
      } catch (error) {
        console.log(error);
      }
    };
    getPlaces();
    //=========================
    // useEffect(() => {
    //   const fetchUsers = async () => {
    //     try {
    //       const responseData = await sendRequest(
    //         'http://localhost:5000/api/users'
    //       );

    //       setLoadedUsers(responseData.users);
    //       console.log(responseData);
    //     } catch (err) {}
    //   };
    //   fetchUsers();
    // }, [sendRequest]);
    getUsersLocation();
    // getPlaces();
  }, []);
  //direction callback
  const directionsCallback = (response) => {
    console.log(response);
    setResponse(response);
    if (response) {
      if (response.status === 'OK') {
        setResponse(response);
      } else {
        console.log('response: ', response);
      }
    }
  };

  // Directionoptions
  const DirectionsServiceOption = {
    destination: destination,
    origin: origin,
    travelMode: 'WALKING',
  };
  // calculate route
  const calculateRoute = (destinations) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          lat: 51.24321,
          lng: 6.78724,
        });
        setDestination(destinations);
        console.log(
          'from:',
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          'to:',
          destinations
        );
      },
      () => {
        // setOrigin(null);
        // setDestination(null);
        // setSelected(null);
        // setResponse(null);
      }
    );
  };

  useEffect(() => {
    setResponse(null);
  }, [origin]);

  // =============Socket. Io
  useEffect(() => {
    console.log(JSON.parse(localStorage.userData).userId, 'User ID');
    socket.on('connection', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    socket.on('position_room', (data) => {
      setLastMessage(data);
      const newUserOnMap = {
        lat: data[0],
        lng: data[1],
        userId: data[2],
      };
      const user_Id = data[2];
      console.log(user_Id, 'userID');
      const checkArray = [...testMarkers];
      checkArray.filter((elt) => {
        return elt.userId !== user_Id;
      });
      setTestMarkers([...checkArray, newUserOnMap]);
      console.log(data, 'newUserOnMap:', newUserOnMap);
    });
    return () => {
      socket.off('connection');
      socket.off('disconnect');
      socket.off('position_room');
    };
  }, []);
  const sendMessage = (position) => {
    socket.emit('position_room', position);
  };

  // Watch User Position
  // const watchUserPosition = () => {
  //   setInterval(() => {
  //     navigator.geolocation.getCurrentPosition(
  //       (data) => {
  //         setTimeout(() => {
  //           // setUser_1Position(data.coords.latitude, data.coords.longitude);
  //           sendMessage([data.coords.latitude, data.coords.longitude]);
  //           // console.log(data.coords.latitude, data.coords.longitude);
  //         }, 10000);
  //       },
  //       (error) => console.log(error)
  //     );
  //   }, 20000);
  // };

  // Get Details
  const getSinglePlace = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:5000/api/places/609fa79b54e4b187699b9403'
      );

      console.log(data, 'single place');
    } catch (error) {
      console.log(error);
    }
  };

  //Watch Own Position
  function watchOwnPosition() {
    setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (data) => {
          setOwnLocation([data.coords.latitude, data.coords.longitude]);
          console.log(data, 'own position');
          setTimeout(() => {
            setOwnLocation([data.coords.latitude, data.coords.longitude]);
            sendMessage([
              data.coords.latitude,
              data.coords.longitude,
              JSON.parse(localStorage.userData).userId,
            ]);
          }, 20000);
        },
        (error) => console.log(error)
      );
    }, 40000);
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className='center'>
          <LoadingSpinner />
        </div>
      )}
      {isLoading === false && loadedUsers && <UsersList items={loadedUsers} />}
      <div className='map-container'>
        {/* <Search panTo={panTo} /> */}

        {markers && (
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
                      url: `/place-marker.png`,
                      origin: new window.google.maps.Point(0, 0),
                      anchor: new window.google.maps.Point(15, 15),
                      scaledSize: new window.google.maps.Size(50, 50),
                      label: 'hallo',
                    }}
                  />
                </div>
              ))}
            {testMarkers.length > 0 &&
              testMarkers.map((newMarker, index) => (
                <div className='marker-wrapper'>
                  <Marker
                    key={index}
                    position={{
                      lat: newMarker.lat,
                      lng: newMarker.lng,
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
                  url: `/blue-dot.png`,
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15),
                  scaledSize: new window.google.maps.Size(50, 50),
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
                }}
              >
                <div>
                  {selected && !selectedPlace && <h2>Text</h2>}
                  {selectedPlace && <h2>Rate 3.5/5</h2>}
                  {selectedPlace && <h3>{selectedPlace}</h3>}

                  {selectedPlace && (
                    <button
                      onClick={() => {
                        setShowDetails(true);
                        console.log(selected.title);
                      }}
                    >
                      More Info & Check In
                    </button>
                  )}
                  <button
                    onClick={() => {
                      calculateRoute({
                        lat: selected.coordinates.lat,
                        lng: selected.coordinates.lng,
                      });
                    }}
                  >
                    {' '}
                    Navigate
                  </button>
                </div>
              </InfoWindow>
            ) : null}
          </GoogleMap>
        )}
        {selected && showDetails && (
          <div>
            <div>
              <img src='' alt='' />
            </div>
            <h1
              onClick={() => {
                setShowDetails(null);
              }}
            >
              X
            </h1>
            <h2>{selected.title}</h2>
            <h1>[..] Users Checked In </h1>
            <p></p>
            <button
              onClick={() => {
                calculateRoute({
                  lat: selected.liveLocation.lat,
                  lng: selected.liveLocation.lng,
                });
                setShowDetails(null);
                setSinglePlace(null);
              }}
            >
              navigate
            </button>
            <button>Check In</button>
          </div>
        )}
      </div>
      <button
        style={{ position: 'Absolute' }}
        onClick={() => {
          // setMarkers([
          //   {
          //     liveLocation: { lat: 50.915165747607714, lng: 6.10337325822752 },
          //   },
          //   {
          //     liveLocation: { lat: 50.917165747607714, lng: 6.18337325822752 },
          //   },
          //   { liveLocation: { lat: 50.93089720514569, lng: 6.14956327075176 } },
          //   {
          //     liveLocation: { lat: 50.915165747607714, lng: 6.10777325822752 },
          //   },
          // ]);
        }}
      >
        Test markers
      </button>
      <button
        style={{ position: 'Absolute', left: '150px' }}
        // onClick={watchUserPosition}
      >
        Watch Users position
      </button>
    </React.Fragment>
  );
};

export default Map;
