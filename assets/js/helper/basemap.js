const basemap = () => {

  const mapcenter = [48.96034143469434, 32.523124838234374];

  // tile layer
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const cartoUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const osmAttrib =
    '&copy; <a href="https://openstreetmap.org/copyright">' +
    "OpenStreetMap</a> contributors";

  const osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib,
    noWrap: true,
  });   
  const carto = L.tileLayer(cartoUrl, {
    maxZoom: 18,
    // attribution: osmAttrib,
    noWrap: true,
  }); 


  const map = L.map("map", {
    layers: [osm],
    center: mapcenter,
    zoom: 6,
    maxBounds: [
      [90, -180],
      [-90, 180],
    ],
  });

  const baseMaps = {
    "OpenStreetMap": osm,
    "CartoDB": carto
  };
  L.control.layers(baseMaps).addTo(map);

  return map;
}

export default basemap;