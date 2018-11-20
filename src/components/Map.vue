<template>
    <div class="h-100">
      <l-map style="height: 96%" ref='map' :zoom='zoom' :center='center' @mousemove="setCurrent" @click="setMarker">
        <l-marker :visible='markerVisible' :draggable='true' :lat-lng.sync='markerLocation' @dragend="moveMarker"/>
      </l-map>
      {{address}}
    </div>
</template>

<script>
import Layer from '@/components/Layer.vue';
import querystring from 'querystring';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LMap, LTileLayer, LMarker, LIcon } from 'vue2-leaflet';
import axios from 'axios';
import jsonData from '@/assets/layers.json';
import secrets from '@/assets/secrets.json';
import xml2js from 'xml2js';

var googleAPI = require('@google/maps').createClient({
  key: secrets.google_api_key
});

function addLayer(layer, map) {
  if (layer.type === 'tms') {
    L.tileLayer(layer.url, {
      attribution: layer.attribution
    }).addTo(map);
  }
  else if (layer.type === 'wms') {
    L.tileLayer.wms(layer.url, {
      layers: layer.layer,
      format: 'image/png',
      transparent: true,
      opacity: layer.opacity || 1.0,
      maxZoom: layer.maxZoom || 18
    }).addTo(map);
  } 
  else if (layer.type === 'wfs') {
    let options = {
        version: '1.0.0',
        service: 'WFS',
        request: 'GetFeature',
        map: layer.map,
        typename: layer.layer,
        outputFormat: 'GeoJSON'
      };
    axios.get(layer.url+'?'+querystring.stringify(options)).then(response => {
      let layerStyle = layer.style;
      L.geoJSON(response.data,
      {
        style: layer.style,
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(feature.properties.NAME_LONG);
          layer.on('mouseover', () => {
            layer.setStyle({color: 'red', weight: 3});
            layer.bringToFront();
          });
          layer.on('mouseout', () => {
            layer.setStyle(layerStyle);
          });
        },
      })
      .addTo(map);
    });
  }
}

export default {
  name: 'Map',
  components: { Layer, LMap, LMarker, LTileLayer, LIcon },
  // props: ['center', 'markerLocation', 'markerVisible'],
  data() {
    return {
      zoom: 3,
      center: L.latLng(20, 20),
      markerLocation: L.latLng(20, 20),
      markerVisible: false,
      address: 'Click on the map to set the project location',
      layers: jsonData
    };
  },

  mounted() {
    let id = 0;
    let map = this.$refs.map.mapObject;
    this.layers.forEach(layer => {
      layer.id = ++id; // add autoincremented id to layer.
      if (layer.visible) {
        addLayer(layer, map);
      }
    });
  },

  methods: {
    setCurrent(evt) {
      this.currentLocation = evt.latlng
    },
    moveMarker(evt) {
      // sets marker position from marker's dragend event
      this.markerLocation = evt.target.getLatLng()
      this.$emit('locationChanged', [evt.latlng.lat, evt.latlng.lng])
      this.geocode();
    },
    setMarker(evt) {
      // sets marker position from map click event
      this.markerLocation = evt.latlng;
      this.$emit('locationChanged', [evt.latlng.lat, evt.latlng.lng])
      this.markerVisible = true;
      this.geocode();
    },
    inspect(latlng) {
      // get pixel value at position
      const lat = latlng.lat
      const lon = latlng.lng
      const config = {
          // map: '/project/gwtool/GWtool.qgs',
          service: "WMS",
          request: "GetFeatureInfo",
          version: "1.3.0",
          width: 100,
          height: 100,
          i: 0,
          j: 0,
          srs: "EPSG:4326",
          bbox: [lat,lon,lat+0.001,lon+0.001].join(','), // wms 1.3: (lat,lon), wsm 1.0: (lon,lat)
          query_layers: 'WaterRisk_Aqueduct',
          info_format: "text/xml"                
      }
      axios.get('http://gis.acaciadata.com/?map=/project/gwtool/GWtool.qgs', {params: config})
        .then(response => {
            //console.log(response) // xml response
            xml2js.parseString(response.data, (err, result) => {
              if(err) {
                console.log(err)
              }
              else {
                //console.log(result)
                try {
                  let layers = result['GetFeatureInfoResponse']['Layer']
                  let attr = layers[0].Attribute[0].$
                  console.log(attr)
                }
                catch(err) {
                  console.log(err)
                }
              }
            })
        })
        .catch(err => {
            console.log(err) 
        })
      return 0.0;

    },
    geocode() {
      // retrieve reverse geocoding information for markerLocation
      const reverseGeocodeParams = {
        latlng: this.markerLocation,
        language: "en",
      };
      this.address = 'Locating...';
      googleAPI.reverseGeocode(reverseGeocodeParams, (err, result) => {
          console.log(result);
          if (result.json.status==="OK") {
            // todo: check address_components?
            const location = result.json.results[0];
            this.address = location.formatted_address;
          }
          else {
            this.address = 'Unknown location';
            setTimeout(()=>{
              this.address = ''
            }, 2000);
          }
      });
      this.inspect(this.markerLocation)
    }
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 1em 0 1em;
}
</style>
