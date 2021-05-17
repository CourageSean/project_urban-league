import React, { Component, useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup, GeolocateControl } from 'react-map-gl';
// import Directions from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
// import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
const positionOptions = { enableHighAccuracy: true };
const geolocateStyle = {
  top: 0,
  left: 0,
  margin: 10,
};
const Map = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();
  const [loadedPlaces, setLoadedPlaces] = useState();
  const [selectedPlace, setSelectedPlace] = useState();
  const [viewport, setViewport] = useState({
    latitude: 51.22057476412195,
    longitude: 6.784130603757113,
    width: '50vw',
    height: '90vh',
    zoom: 14,
    pitch: 50,
  });
  // Controll
  const [interactionState, setInteractionState] = useState({});
  const [settings, setSettings] = useState({
    dragPan: true,
    dragRotate: true,
    scrollZoom: true,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    doubleClickZoom: true,
    minZoom: 0,
    maxZoom: 20,
    minPitch: 0,
    maxPitch: 85,
  });

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          'http://localhost:5000/api/places/staticplaces'
        );
        console.log(responseData.staticPlaces);
        setLoadedPlaces(responseData.staticPlaces);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest]);
  useEffect(() => {
    // const directions = new Directions({
    //   accessToken:
    //     'pk.eyJ1Ijoic2VhbmNvdXJhZ2UyMyIsImEiOiJja29wcm45YXUwbTJyMm5zejV0cnl0cG9hIn0.IiGcN2pz0JD8SdnnW2bgew',
    //   unit: 'metric',
    //   profile: 'mapbox/cycling',
    // });
    // var map = new mapboxgl.Map({
    //   container: 'map',
    //   style: 'mapbox://styles/mapbox/streets-v9'
    // });
    //      map.addControl(directions, 'top-left');
  }, []);
  const mapRef = React.createRef();
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className='center'>
          <LoadingSpinner />
        </div>
      )}

      <div className='map-wrapper'>
        {' '}
        <ReactMapGL
          {...viewport}
          mapboxApiAccessToken='pk.eyJ1Ijoic2VhbmNvdXJhZ2UyMyIsImEiOiJja29wcm45YXUwbTJyMm5zejV0cnl0cG9hIn0.IiGcN2pz0JD8SdnnW2bgew'
          mapStyle={'mapbox://styles/mapbox/streets-v11'}
          onViewportChange={(viewport) => {
            setViewport(viewport);
          }}
          onInteractionStateChange={(s) => setInteractionState({ ...s })}
        >
          {loadedPlaces && (
            <GeolocateControl
              style={geolocateStyle}
              positionOptions={positionOptions}
              trackUserLocation
              auto
            />
          )}
          {loadedPlaces &&
            loadedPlaces.map((place) => (
              <Marker
                key={place._id}
                latitude={place.coordinates.lat}
                longitude={place.coordinates.lng}
                // latitude={51.22057476412195}
                // longitude={6.784130603757113}
              >
                <button
                  className='marker-btn'
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedPlace(place);
                  }}
                >
                  <img
                    src='https://upload.wikimedia.org/wikipedia/commons/f/f2/678111-map-marker-512.png'
                    alt=''
                    width={50}
                    height={50}
                  />
                </button>
              </Marker>
            ))}
          {selectedPlace ? (
            <Popup
              latitude={selectedPlace.coordinates.lat}
              longitude={selectedPlace.coordinates.lng}
              onClose={() => {
                setSelectedPlace(null);
              }}
            >
              <div>
                <h2>{selectedPlace.title}</h2>
                <p>here i am</p>
              </div>
            </Popup>
          ) : null}
          {/* <Directions
            mapRef={mapRef}
            mapboxApiAccessToken='pk.eyJ1Ijoic2VhbmNvdXJhZ2UyMyIsImEiOiJja29wcm45YXUwbTJyMm5zejV0cnl0cG9hIn0.IiGcN2pz0JD8SdnnW2bgew'
          /> */}
        </ReactMapGL>
      </div>
    </React.Fragment>
  );
};
export default Map;