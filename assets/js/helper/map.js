import * as utils from "./utils";

/**
 * Creates a basemap
 * @param {Object} props props
 * @returns {Object} map
 */
export const initBasemap = (props) => {

  // extract props
  const { lat, lng, zoom } = props;

  // set map center
  const mapcenter = [lat, lng];

  // OSM tile layer
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmAttrib =
  '&copy; <a href="https://openstreetmap.org/copyright">' +
  "OpenStreetMap</a> contributors";
  const osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib,
    noWrap: true,
  });  

  // Carto tile Layer
  const cartoUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"; 
  const carto = L.tileLayer(cartoUrl, {
    maxZoom: 18,
    noWrap: true,
  }); 

  // set basemaps (from tile layers above)
  const baseMaps = {
    "OpenStreetMap": osm,
    "CartoDB": carto
  };

  // create base map with OSM layer as default
  const map = L.map("map", {
    layers: [osm],
    center: mapcenter,
    zoom: zoom,
    maxBounds: [
      [90, -180],
      [-90, 180],
    ],
  });

  // add base map switcher to map
  L.control.layers(baseMaps).addTo(map);

  // return base map
  return map;
}

/**
 * 
 * @param {Object} props props
 * @returns 
 */
const _setTimelineControl = (props) => {
  return L.timelineSliderControl({
    formatOutput: function (date) {
      const currentDate = new Date(date * 1000);
      return utils.date2dateDisplay(currentDate);
    },
    steps: props.numDays,
    duration: parseInt(props.duration),
  });
}


const _setTimeLine = (props, geolocations) => {

  /**
   * Sets the start & end of a feature
   * @param {Object} feature feature
   * @returns {Object} start & delayed end of a feature
   */
  const _getInterval = function (feature) {
    const { start } = feature.properties;
    return {
      start: start ,
      end: start + (props.DELAY * 86400),
    };
  };

  return L.timeline(geolocations, {
    getInterval: _getInterval,
    pointToLayer: function (data, latlng) {
      const { side } = data.properties;
      const color = props.COLORS[side];
      const title = data.properties.name;
      const description = data.properties.description;
      const description2 = utils.transformURLs(description);      
      const msg = `<h4>${title}</h4><div class="msg">${description2}</div>`;
      return L.circleMarker(latlng, {
        radius: 8,
        color: color,
        fillColor: color,
      }).bindPopup(msg);
    },
  });
}


export const createTimeLine = (map, props, geolocations) => {

  // set TimeLineControl
  const timelineControl = _setTimelineControl(props);

  // set timeline
  const timeline = _setTimeLine(props, geolocations);

  // fix timeline, remove DELAY from end of data
  // so we don't show future dates
  timeline.end -= (props.DELAY * 86400);

  // add everything to the map
  timelineControl.addTo(map);
  timelineControl.addTimelines(timeline);
  timeline.addTo(map);

  const _updateDate = (timeline) => {

    // const displayed = timeline.getLayers(); // data for each displayed layer
    const onChangeDate = document.getElementById("on-change-date");
    const currentDate = utils.timestamp2date(timeline.time);
    const displayDate = utils.date2dateDisplay(currentDate);
    onChangeDate.innerHTML = `${displayDate}`;
  }

  // function that sets the weight (transparency)
  const _styleFunc = (_data) => {
    const { start } = _data.properties;
    const diff = Math.floor((currentTime - start) / 86400);
    const weight = (diff > 0) ? 0 : 3;
    return { weight }
  }

  timeline.on("change", function (e) {
    _updateDate(e.target);
    currentTime = this.time;
    this.setStyle(_styleFunc);
  });
  _updateDate(timeline);

  // set inital time to last date
  // so we initially see the last aka current situation
  timeline.setTime(timeline.end);
  timelineControl.setTime(timeline.end);

  return { timeline, timelineControl };

}


export const addFrontlineWithToggleButton = (map, frontline) => {

  // frontline style
  const frontlineOptions = {
    weight: 2,
    color: '#ff0000',
    fillOpacity: 0.05,
    interactive: false,
  }

  // add frontline layers to map
  const frontlineLayer = L.geoJSON(frontline, frontlineOptions);
  // frontlineLayer.addTo(map); // leave the front line off in start

  // toggle button
  const toggleButtonControl = L.Control.extend({
    onAdd: function(map) {
        const button = L.DomUtil.create('button', 'frontline-toggle');
        button.title = 'Toggle Current Frontline';
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', function() {
          if (map.hasLayer(frontlineLayer)) {
            map.removeLayer(frontlineLayer);
          } else {
            map.addLayer(frontlineLayer);  
          }
        });
        return button;
    },  
  });
  const toggleButton = new toggleButtonControl({ position: 'topright' });
  toggleButton.addTo(map);
}
