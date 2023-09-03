//============================================================//
// Date Helper
//
// we have multiple date format and
// need conversions between them
// variants:
// dateKey: yyyymmdd
// dateInput: yyyy-mm-dd
// dateDisplay: dd.mm.yyyy
// date: Date()
// timestamp: seconds
//============================================================//

/**
 * Converts dateKey to dateDisplay
 * @param {string} aDateKey yyyymmdd
 * @returns {string} yyyy-mm-dd
 */
const _dateKey2dateInput = (aDateKey) => {
  const year = aDateKey.slice(0, 4);
  const month = aDateKey.slice(4, 6);
  const day = aDateKey.slice(6, 8);
  return `${year}-${month}-${day}`;
}

/**
 * Converts dateInput to dateKey
 * @param {string} aDateInput yyyy-mm-dd
 * @returns {string} yyyymmdd
 */
export const dateInput2dateKey = (aDateInput) => {
  // Another solution would be to just replace '-' with ''
  const [year, month, day] = aDateInput.split('-');
  return `${year}${month}${day}`;
}

/**
 * Coverts a Date to dateDisplay
 * @param {Date} aDate a Date
 * @returns {string} dd.mm.yyyy
 */
export const date2dateDisplay = (aDate) => {
  const year = aDate.getFullYear();
  let month = aDate.getMonth() + 1;
  let day  = aDate.getDate();
  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = `0${month}`;
  }
  return `${day}.${month}.${year}`;
}

/**
 * Converts a Date to dateKey
 * @param {Date} aDate a Date
 * @returns {string} yyyymmdd
 */
const _date2dateKey = (aDate) => {
  const year = aDate.getFullYear();
  let month = aDate.getMonth() + 1;
  let day  = aDate.getDate();
  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = `0${month}`;
  }
  return `${year}${month}${day}`;
}

/**
 * Converts a dateKey to a Date
 * @param {string} aDateKey yyyymmdd
 * @returns {Date} a Date
 */
const _dateKey2Date = (aDateKey) => {
  const year = aDateKey.slice(0, 4);
  const month = aDateKey.slice(4, 6);
  const day = aDateKey.slice(6, 8);
  return new Date(`${month}/${day}/${year}`);
}

/**
 * Converts a timestamp in seconds to a Date
 * @param {number} aTimestamp in seconds
 * @returns {Date} a Date
 */
export const timestamp2date = (aTimestamp) => {
  return new Date(aTimestamp * 1000);
}

/**
 * Converts a timestamp in sconds to dateKey
 * @param {number} aTimestamp in seconds
 * @returns {string} yyyymmdd
 */
const _timestamp2dateKey = (aTimestamp) => {
  const date = new Date(aTimestamp * 1000);
  return _date2dateKey(date);
}

/**
 * Gets the number of days between 2 dateKeys
 * @param {string} startDateKey yyyymmdd
 * @param {stirng} endDateKey yyyymmdd
 * @returns {number} number of days between (inclusive) these dates
 */
const _daysBetweenDateKeys = (startDateKey, endDateKey) => {
  const startDate = _dateKey2Date(startDateKey);
  const endDate = _dateKey2Date(endDateKey);
  // diff in time
  const timeDiff = endDate.getTime() - startDate.getTime();
  // diff in days (also add 1 day fix to get the full range)
  const days = (timeDiff / (1000 * 3600 * 24)) + 1; 
  return Math.ceil(days);
}


//============================================================//
// Speed to Duration
// TODO
//============================================================//

/**
 * Converts speed to duration in ms
 * Duration for the whole playback to take
 * @param {number} aSpeed speed
 * @param {number} numDays number of days of the timeline
 * @returns {number} duration
 * @todo Base duration on number of days in range and how many days
 * should be displayed per second
 */
const _speed2duration = (aSpeed, numDays) => {
  
  // Key: speed from 1 to 5
  // Value: How many days will be display per second
  const speed2DaysPerSecond = {
    1: 1,
    2: 2.5,
    3: 5,
    4: 7.5,
    5: 10
  };
  const daysPerSecond = speed2DaysPerSecond[aSpeed];
  const seconds = numDays / daysPerSecond;
  const milliseconds = seconds * 1000;

  return milliseconds;
  // return durationMap[aSpeed];
}

//============================================================//
// Mixed helper methods
//============================================================//

/**
 * Makes a deep copy of an object
 * @param {Object} aDataObject 
 * @returns {Object}loned object (deep copy)
 */
const _clone = (aDataObject) => {
  return JSON.parse(JSON.stringify(aDataObject));
}

/**
 * URL pattern used in transformUrls
 * @constant
 * @type {RegExp}
 */
const URL_PATTERN = /(((https?:\/\/)|(www\.))[^\s|<]+)/g;

/**
 * Replaces all URLs in a text to html a tags
 * @param {string} aText 
 * @returns {string}
 */
export const transformURLs = (aText) => {
  return aText.replace(URL_PATTERN, (url) => {
    let href = url;
    console.log(href);
    if (!href.match('^https?:\/\/')) {
      href = 'http://' + href;
    }
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'
  });
}

/**
 * Gets the earliest and latest dates of a list of features
 * @param {Array<feature>} features 
 * @returns {Object} start/end as timestamp & dateKey
 */
const _getMinMaxDateRange = (features) => {
  const startFeature = features.reduce((prev, cur) => {
    const { start: startCur } = cur.properties;
    const { start: startPrev } = prev.properties;
    return startCur < startPrev ? cur : prev;
  });
  const endFeature = features.reduce((prev, cur) => {
    const { start: startCur } = cur.properties;
    const { start: startPrev } = prev.properties;
    return startCur > startPrev ? cur : prev;
  });
  const startTimestamp = startFeature.properties.start;
  const endTimestamp = endFeature.properties.start;
  const startDateKey = _timestamp2dateKey(startTimestamp);
  const endDateKey = _timestamp2dateKey(endTimestamp);
  const numDays = _daysBetweenDateKeys(startDateKey, endDateKey);
  return { 
    start: startTimestamp,     
    end: endTimestamp,
    startDateKey,
    endDateKey,
    numDays
  };
}

//============================================================//
// Props
//============================================================//

/**
 * Returns the decoded user props from the url query string
 * @returns {Object} props
 */
export const getUserProps = () => {
  // parse query params
  let userParams = new URLSearchParams(window.location.search);

  // check if we have an 'id' key with a base64 param string
  // if so, decode the base64 to string and re-parse it
  if (userParams.get('id') && userParams.get('id') !== '') {
    const decodedQuery = atob(userParams.get('id'));
    userParams = new URLSearchParams(decodedQuery);
  }

  return Object.fromEntries([...userParams]);

}

const _normalizeProps = (userProps, dateRange, dateRangeOrig) => {

  // extract range & number of days from the filtered timeline
  const { startDateKey, endDateKey, numDays } = dateRange;

  // get user provided values or set defaults

  // speed
  const speed = userProps.speed || 3;
  // latlng
  const lat = userProps.lat || '47.50';
  const lng = userProps.lng || '36.00';
  // zoom
  const zoom = userProps.zoom || 7;
  // start & end of timeline
  const start = userProps.start || startDateKey;
  const end =  userProps.end || endDateKey;
  // min & max - used for input date max/min
  const min = dateRangeOrig.startDateKey; // from orig timeline
  const max = dateRangeOrig.endDateKey; // from orig timeline

  // new props
  const props = {
    speed,
    lat,
    lng,
    zoom,
    start,
    end,
    min,
    max,
    numDays
  }

  // props validation

  // handle invalid speed values, allowed values range from 1-5
  if (props.speed > 5) {
    props.speed = 5;
  } else if (props.speed < 1) {
    props.speed = 1;
  }

  // handle invalid zoom values, allowed values range from 3-18
  if (props.zoom > 18) {
    props.zoom = 18;
  } else if (props.zoom < 3) {
    props.zoom = 3;
  }

  // handle invalid coordinates, allowed values are:
  // lat: -180 to +180
  // lng: -90 to +90
  if (props.lat > 180) {
    props.lat = 180;
  } else if (props.lat < -180) {
    props.lat = -180;
  }
  if (props.lng > 90) {
    props.lng = 90;
  } else if (props.lng < -90) {
    props.lng = -90;
  }

  // handle invalid date range
  // if outside of the original dataset, set to orig start/end
  if (props.start < dateRangeOrig.startDateKey) {
    props.start = dateRangeOrig.startDateKey;
  } else if (props.start > dateRangeOrig.endDateKey) {
    props.start = dateRangeOrig.endDateKey;
  }
  if (props.end < dateRangeOrig.startDateKey) {
    props.end = sdateRangeOrig.tartDateKey;
  } else if (props.end > dateRangeOrig.endDateKey) {
    props.end = dateRangeOrig.endDateKey;
  }

  // return normalized & validated
  return props;

}

/**
 * Generates all geolocations and props used in the timeline
 * @param {Object} geolocationsOrig 
 * @param {Object} userProps 
 * @returns {Object} geolocations and props
 */
export const generatePropsAndData = (geolocationsOrig, userProps) => {

  // delay = show features for {x} additional days on the map
  const DELAY = 3;

  // colors for ua/ru
  const COLORS = {
    ua: '#00c3ff',
    ru: '#dd0000'
  };

  // get original start/end dates
  const dateRangeOrig = _getMinMaxDateRange(geolocationsOrig.features);

  // make a deep copy, so we can reset later
  let geolocations = _clone(geolocationsOrig);

  // filter data if user provided a start and/or end
  geolocations = _filterData(geolocations, userProps, dateRangeOrig);

  // get filtered start/end dates
  const dateRange = _getMinMaxDateRange(geolocations.features);

  // normalize & validate props, set defaults if necessary
  const props = _normalizeProps(userProps, dateRange, dateRangeOrig); 

  props.DELAY = DELAY;
  props.COLORS = COLORS;
  props.duration = _speed2duration(props.speed, props.numDays);
  // console.log(`${props.numDays} days will play in ${props.duration} ms or ${props.duration/1000} s`);

  return { geolocations, props };

}


/**
 * Filter all features within the provided date range
 * @param {Array<features>} geolocations 
 * @param {Object} userProps 
 * @param {Object} dateRangeOrig
 * @returns 
 */
const _filterData = (geolocations, userProps, dateRangeOrig) => {

  // if user provided a start and/or date, filter the features
  if (userProps.start || userProps.end) {

    const customStartDateKey = userProps.start
      ? userProps.start
      : dateRangeOrig.startDateKey;
  
    const customEndDateKey = userProps.end
      ? userProps.end
      : dateRangeOrig.endDateKey;

    const newFeatures = geolocations.features.filter((feature) => {
      const dateKey = _timestamp2dateKey(feature.properties.start);
      return dateKey >= customStartDateKey && dateKey <= customEndDateKey;
    });
    geolocations.features = newFeatures;

  }

  return geolocations;

}

//============================================================//
// Custom Controls
//============================================================//

/**
 * Initialize the custom controls (speed & dates)
 * @param {Object} props props
 * @returns {void}
 */
export const initCustomControls = (props) => {
  // extract speed and alll needed dateKeys
  const { speed, start, end, min, max } = props;
  // set speed
  setSpeedSlider(speed);
  // set the input date attributes
  // start, end, min & max
  const startDateInput = _dateKey2dateInput(start);
  const endDateInput = _dateKey2dateInput(end);
  const minDateInput = _dateKey2dateInput(min);
  const maxDateInput = _dateKey2dateInput(max);
  setInputDateAttributes('cc-start', startDateInput, minDateInput, maxDateInput);
  setInputDateAttributes('cc-end', endDateInput, minDateInput, maxDateInput);
}

//============================================================//
// Custom Controls Setter
//============================================================//

/**
 * Sets the speed input range slider
 * @param {number} aSpeed
 * @returns {void}
 */
export const setSpeedSlider = (aSpeed) => {
  document.getElementById('cc-speed').value = aSpeed;
}

/**
 * Sets the 'date' input value for cc-start
 * @param {string} aDateKey yyyy-mmm-dd
 * @returns {void}
 */
export const setRangeStart = (aDateKey) => {
  document.getElementById('cc-start').value = aDateKey;
}

/**
 * Sets the 'date' input value for cc-end
 * @param {string} dateKey yyyy-mm-dd
 * @returns {void}
 */
export const setRangeEnd = (dateKey) => {
  document.getElementById('cc-end').value = dateKey;
}

/**
 * Sets all properties of an input date element
 * @param {string} aKey tag ID
 * @param {string} aValue yyyy-mm-dd
 * @param {string} aMin yyyy-mm-dd
 * @param {string} aMax yyyy-mm-dd
 * @returns {void}
 */
export const setInputDateAttributes = (aKey = 'cc-start', aValue, aMin, aMax) => {
  const input = document.getElementById(aKey);
  input.value = aValue;
  input.min = aMin;
  input.Max = aMax;
}

//============================================================//
// Custom Controls Getter
//============================================================//

/**
 * Gets the current speed value
 * @returns {number} speed value
 */
export const getSpeedSlider = () => {
  return document.getElementById('cc-speed').value;
}

/**
 * Gets the 'date' input for cc-start
 * @returns {string} yyyy-mm-dd
 */
export const getRangeStart = () => {
  return document.getElementById('cc-start').value;
}

/**
 * Gets the 'date' input for cc-end
 * @returns {string} yyyy-mm-dd
 */
export const getRangeEnd = () => {
  return document.getElementById('cc-end').value;
}





