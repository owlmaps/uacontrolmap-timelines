import * as mapUtils from '../helper/map';
import * as utils from '../helper/utils';

// data url
const DATA_URL = 'https://raw.githubusercontent.com/owlmaps/timeline-data/main/data/latestposition.json';

(async () => {

  // fetch data and parse the json content
  let data = null;
  try {
    // const dataJson = await fetch(DATA_URL);
    const dataJson = await fetch("http://localhost:1313/uacontrolmap-timelines/latestposition.json"); // local dev
    data = await dataJson.json();
  } catch (error) {
    console.log(error);
  }
  const { positions, frontline, fortifications } = data;
  // console.log(positions)

  // get user props
  const userProps = utils.getUserProps();

  const { geolocations, props } = utils.generatePropsAndData(positions, userProps);
 
  // init custom control (speed + dates)
  utils.initCustomControls(props);

  // init basemap
  const map = mapUtils.initBasemap(props);

  // add frontline toggle
  mapUtils.addFrontlineWithToggleButton(map, frontline);

  // add frontline toggle
  mapUtils.addFortificationWithToggleButton(map, fortifications);

  // add timeline
  let tl = mapUtils.createTimeLine(map, props, geolocations);

  // add cc-control event listener
  const applyButton = document.getElementById('cc-apply');
  document.getElementById('cc-speed').addEventListener('change', () => {
    applyButton.disabled = false;
  });
  document.getElementById('cc-start').addEventListener('change', () => {
    applyButton.disabled = false;
  });
  document.getElementById('cc-end').addEventListener('change', () => {
    applyButton.disabled = false;
  });
  applyButton.addEventListener('click', () => {
    // remove old timline + control div
    tl.timelineControl.removeTimelines();
    map.removeLayer(tl.timelineControl);
    map.removeLayer(tl.timeline);
    tl = null;
    document.getElementsByClassName('leaflet-timeline-control')[0].remove();

    // get the new date range & their dateKeys
    const startRange = utils.getRangeStart();
    const endRange = utils.getRangeEnd();
    const newStart = utils.dateInput2dateKey(startRange);
    const newEnd = utils.dateInput2dateKey(endRange);
    const newSpeed = utils.getSpeedSlider();

    // disable apply button again
    applyButton.disabled = true;

    // update props
    userProps.start = newStart;
    userProps.end = newEnd;
    userProps.speed = newSpeed;

    const { geolocations, props } = utils.generatePropsAndData(positions, userProps);

    // re-create the timeline
    tl = mapUtils.createTimeLine(map, props, geolocations);

    // start playback
    // tl.timelineControl.play();
  });

  const generateButton = document.getElementById('generate-url');
  generateButton.addEventListener('click', () => {
    // gather all current settings
    const center = L.latLng(map.getCenter());
    const queryParams = {
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom(),
      speed: utils.getSpeedSlider(),
      start: utils.dateInput2dateKey(utils.getRangeStart()),
      end: utils.dateInput2dateKey(utils.getRangeEnd())
    }
    // generate query string
    const queryString = Object.keys(queryParams).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key])
    }).join('&');

    // encode as base64
    const encodedParams = { id: btoa(queryString) }
    const queryStringEncoded = Object.keys(encodedParams).map((key) => {
      return `${key}=${encodedParams[key]}`
    }).join('&');

    // build final url
    const queryUrl = `${location.host}${location.pathname}?${queryStringEncoded}`;
    
    // write to clipboard
    navigator.clipboard.writeText(queryUrl);
  });
  

  // remove loading screen
  document.getElementById('loading').classList.add('hide');

})()