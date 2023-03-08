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
  console.log(frontline)

  // const getInterval = function (pos) {
  //   return {
  //     start: pos.properties.start ,
  //     end: pos.properties.start + (DELAY * 86400),
  //   };
  // };
  // const timelineControl = L.timelineSliderControl({
  //   formatOutput: function (date) {
  //     return new Date(date * 1000).toString();
  //   },
  // });
  // const timeline = L.timeline(frontline, {
  //   getInterval: getInterval,
  //   pointToLayer: function (data, latlng) {
  //     const color = data.properties.side === "ua"
  //       ? '#0039a6'
  //       : '#d52b1e';
  //     const title = data.properties.name;
  //     const description = data.properties.description;
  //     const description2 = transformUrls(description);
      
  //     const msg = `<h4>${title}</h4><div class="msg">${description2}</div>`;
  //     return L.circleMarker(latlng, {
  //       radius: 8,
  //       color: color,
  //       fillColor: color,
  //     }).bindPopup(msg);
  //   },
  // });
  // fix timeline (remove the DELAY from the end)
  // timeline.end -= (DELAY * 86400);
  // timeline.times.splice(timeline.length - DELAY, DELAY);

  // timelineControl.addTo(map);
  // timelineControl.addTimelines(timeline);
  // timeline.addTo(map);
  // timeline.on("change", function (e) {
  //   updateDate(e.target);
  //   currentTime = this.time;
  //   this.setStyle(styleFunc);
  // });
  // updateDate(timeline);

  // set inital time to latest layer
  // timeline.setTime(timeline.end);
  // timelineControl.setTime(timeline.end);

})()