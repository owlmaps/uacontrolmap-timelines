import basemap from '../helper/basemap'

const DATA_URL = 'https://raw.githubusercontent.com/owlmaps/timeline-data/main/data/latestposition.json';

(async () => {
  const map = basemap();

  // delay = show items for x days on the map
  const DELAY = 3

  // url pattern
  const URL_PATTERN = /(((https?:\/\/)|(www\.))[^\s]+)/g;

  const transformUrls = function(description) {
    return description.replace(URL_PATTERN, function (url) {
      let href = url;
      if (!href.match('^https?:\/\/')) {
        href = 'http://' + href;
      }
      return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'
    });
  };

  const styleFunc = function(_data) {
    const { start } = _data.properties;
    const diff = Math.floor((currentTime - start) / 86400);
    const weight = (diff > 0) ? 0 : 3;
    return { weight }
  }

  function addFrontlineWithToggleButton() {

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


  function updateDate(timeline) {
    // const displayed = timeline.getLayers(); // data for each displayed layer
    const onChangeDate = document.getElementById("on-change-date");
    const currentDate = new Date(timeline.time * 1000);
    const year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    let day  = currentDate.getDate();
    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    const displayDate = `${day}.${month}.${year}`;
    onChangeDate.innerHTML = `[ ${displayDate} ]`;
  }

  // const dataJson = await fetch(`${params.baseURL}/data/positions.json`);
  const dataJson = await fetch(DATA_URL);
  const data = await dataJson.json();
  const { positions, frontline } = data;

  const getInterval = function (pos) {
    return {
      start: pos.properties.start ,
      end: pos.properties.start + (DELAY * 86400),
    };
  };
  const timelineControl = L.timelineSliderControl({
    formatOutput: function (date) {
      return new Date(date * 1000).toString();
    },
  });
  const timeline = L.timeline(positions, {
    getInterval: getInterval,
    pointToLayer: function (data, latlng) {
      const color = data.properties.side === "ua"
        ? '#0039a6'
        : '#d52b1e';
      const title = data.properties.name;
      const description = data.properties.description;
      const description2 = transformUrls(description);
      
      const msg = `<h4>${title}</h4><div class="msg">${description2}</div>`;
      return L.circleMarker(latlng, {
        radius: 8,
        color: color,
        fillColor: color,
      }).bindPopup(msg);
    },
  });
  // fix timeline (remove the DELAY from the end)
  timeline.end -= (DELAY * 86400);
  timeline.times.splice(timeline.length - DELAY, DELAY);

  addFrontlineWithToggleButton();

  timelineControl.addTo(map);
  timelineControl.addTimelines(timeline);
  timeline.addTo(map);
  timeline.on("change", function (e) {
    updateDate(e.target);
    currentTime = this.time;
    this.setStyle(styleFunc);
  });
  updateDate(timeline);

  // set inital time to latest layer
  timeline.setTime(timeline.end);
  timelineControl.setTime(timeline.end);

})()