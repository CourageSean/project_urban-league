import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import './Location.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import mapStyles from '../components/mapStyles';
import io from 'socket.io-client';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

// const testArray = [
//   { liveLocation: { lat: 50.915165747607714, lng: 6.10337325822752 } },
//   { liveLocation: { lat: 50.917165747607714, lng: 6.18337325822752 } },
//   { liveLocation: { lat: 50.93089720514569, lng: 6.104956327075176 } },
//   { liveLocation: { lat: 50.915165747607714, lng: 6.10777325822752 } },
// ];

const socket = io('https://urban-league.herokuapp.com/');
//needed variables

//const libraries = ['places'];
const mapContainerStyle = {
  position: 'absolute',
  top: '64px',
  left: '0px',
  right: '0px',
  bottom: '0px',
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
  const Modal = ({ handleClose, show, children }) => {
    const showHideClassName = show
      ? 'modal display-block'
      : 'modal display-none';

    return (
      <div className={showHideClassName}>
        <section className='modal-main'>
          {children}
          <button onClick={handleClose}>Close</button>
        </section>
      </div>
    );
  };

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
  const [newMarker, setNewMarker] = useState([]);
  const [checkInTime, setCheckInTime] = useState('');
  const Arr = [];
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
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/users`
        );
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
          `${process.env.REACT_APP_BACKEND_URL}/places/staticplaces`
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
    // console.log(response);
    setResponse(response);
    if (response) {
      if (response.status === 'OK') {
        setResponse(response);
      } else {
        // console.log('response: ', response);
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
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setDestination(destinations);
        // console.log(
        //   'from:',
        //   {
        //     lat: position.coords.latitude,
        //     lng: position.coords.longitude,
        //   },
        //   'to:',
        //   destinations
        // );
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
      // const checkArray = [...testMarkers];
      // checkArray.filter((elt) => {
      //   return elt.userId !== user_Id;
      // });
      const newAdd = Arr.push(newUserOnMap);
      // console.log(Arr, 'newAdd');
      setTestMarkers(Arr);

      const uniqueMarker = Array.from(new Set(Arr.map((a) => a.userId))).map(
        (id) => {
          return Arr.find((a) => a.userId === id);
        }
      );

      setNewMarker(uniqueMarker);
      // setNewMarker(testTest);
      // console.log(uniqueMarker, 'uniqueMarker');
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
        `${process.env.REACT_APP_BACKEND_URL}/places/609fa79b54e4b187699b9403`
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
          // console.log(data, 'own position');
          setTimeout(() => {
            setOwnLocation([data.coords.latitude, data.coords.longitude]);
            sendMessage([
              data.coords.latitude,
              data.coords.longitude,
              JSON.parse(localStorage.userData).userId,
            ]);
          }, 6000);
        },
        (error) => console.log(error)
      );
    }, 12000);
  }

  // Check In
  const checkIn = async () => {
    console.log(checkInTime);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/places/staticplaces/${
          selected._id
        }/?userId=${
          JSON.parse(localStorage.userData).userId
        }&time=${checkInTime}`
      );
      // window.location.href = 'http://localhost:3000';
      console.log(selected._id, 'selected place id');
      // console.log(data, 'single place checkin sent');
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className='center'>
          <LoadingSpinner />
        </div>
      )}
      {isLoading === false}
      <React.Fragment>
        <div className='test'></div>
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
                        url: `/place-marker.png`,
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(15, 15),
                        scaledSize: new window.google.maps.Size(50, 50),
                        labelOrigin: new window.google.maps.Point(33, 0),
                      }}
                      label={{
                        text: elt.activeUsers.length.toString(),
                        color: 'black',
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
                      loadedUsers.users.find(
                        (elt) => newMarker.userId === elt._id
                      ),
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
                        color: 'crimson',
                        fontWeight: 'bold',
                        fontSize: '22px',
                      }}
                      icon={{
                        url: '/dummi.png',
                        anchor: new window.google.maps.Point(53, 53),
                        labelOrigin: new window.google.maps.Point(33, -10),
                        scaledSize: new window.google.maps.Size(50, 50),
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
                    setShowDetails(false);
                  }}
                >
                  <div>
                    {selected && !selectedPlace && <h2>Text</h2>}
                    {selectedPlace && <h2>{selected.title}</h2>}
                    {selectedPlace && <h4>Rate 3.5/5</h4>}
                    {selectedPlace && <h4>{selected.address}</h4>}

                    {selectedPlace && (
                      <button
                        onClick={() => {
                          setShowDetails(true);

                          console.log(selected);
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
        </div>
      </React.Fragment>

      {selected && showDetails && (
        /***************************************************/
        <>
          <div className='location-info'>
            <h2
              style={{ color: 'white', cursor: 'pointer' }}
              onClick={() => {
                setShowDetails(false);
              }}
            >
              X
            </h2>
            <img src={selected.image} alt='' />
            <div className='location-info-content'>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <p>@{selected.address}</p>
              <p>{selected.activeUsers.length} Users Checked In </p>
              {selected.activeUsers.map((elt) => {
                return (
                  <div>
                    {loadedUsers.users.find((user) => elt === user._id).name}
                    <p>{elt}</p>
                  </div>
                );
              })}
              <p>possible sports </p>
              <div>
                <h1>Checking In</h1>
                <label htmlFor='time' name=''>
                  30min
                </label>
                <input
                  type='radio'
                  name='time'
                  id='thirty'
                  onChange={() => {
                    setCheckInTime(60000);
                  }}
                />
                <label htmlFor='time'>60min</label>
                <input
                  type='radio'
                  name='time'
                  id='sixty'
                  onChange={() => {
                    setCheckInTime(120000);
                  }}
                />
                <br />
                <button className='checkin-btn mt-mb' onClick={checkIn}>
                  check in
                </button>
              </div>
            </div>
          </div>
        </>

        /***************************************************/
      )}
    </React.Fragment>
  );
};

export default Map;
