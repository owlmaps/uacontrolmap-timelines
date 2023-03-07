import basemap from '../helper/basemap'
import * as params from '@params';

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
    // console.log(`x ist ${diff} Tage alt`);
    // let radius  = 7;
    let fillOpacity = 0.2;
    let strokeOpacity = 2;
    let weight = 3;
    switch (diff) {
      case 0:
        // do nothing
        break;
      case 1:
        // strokeOpacity = 0.75;
        weight = 0;
        break;
      case 2:
        // strokeOpacity = 0.5;
        weight = 0;
        break;
      case 3:
        // strokeOpacity = 0.25;
        weight = 0;
        break;   
      default:
        break;
    }

    return {
      // fillOpacity: 0.5
      // radius: radius,
      weight: weight,
      // opacity: strokeOpacity
    }
  }

  function updateList(timeline) {
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

  timelineControl.addTo(map);
  timelineControl.addTimelines(timeline);
  timeline.addTo(map);
  timeline.on("change", function (e) {
    updateList(e.target);
    currentTime = this.time;
    this.setStyle(styleFunc);
  });
  updateList(timeline);



})()