import basemap from '../helper/basemap'

const DATA_URL = 'https://raw.githubusercontent.com/owlmaps/timeline-data/main/data/frontline.json';

(async () => {
  const map = basemap();

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

  const dataJson = await fetch(DATA_URL);
  const frontline = await dataJson.json();
  // console.log(frontline);

  const getInterval = function (pos) {
    return {
      start: pos.properties.start,
      end: pos.properties.start + (1 * 86400),
    };
  };
  const timelineControl = L.timelineSliderControl({
    formatOutput: function (date) {
      return new Date(date * 1000).toString();
    },
    enableKeyboardControls: true,
  });
  const timeline = L.timeline(frontline, {
    getInterval: getInterval,
    style: function (data) {
      return {
        stroke: false,
        color: "rgb(255,0,0)",
        fillOpacity: 0.3,
        weight: 0,
        interactive: false,
      };
    },
    waitToUpdateMap: true,
  });
  // fix timeline length
  timeline.end -= (1 * 86400);
  timeline.times.splice(timeline.length - 1, 1);

  timelineControl.addTo(map);
  timelineControl.addTimelines(timeline);
  timeline.addTo(map);
  timeline.on("change", function (e) {
    updateDate(e.target);
  });
  updateDate(timeline);

  // set inital time to latest layer
  timeline.setTime(timeline.end);
  timelineControl.setTime(timeline.end);  

})()