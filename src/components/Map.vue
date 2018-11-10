<template>
  <l-map class='map' ref='map' :zoom='zoom' :center='center' />
</template>

<script>
import Layer from '@/components/Layer.vue';
import querystring from 'querystring';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LMap, LTileLayer } from 'vue2-leaflet';
import axios from 'axios';

import jsonData from '@/assets/layers.json';

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
  components: { Layer, LMap, LTileLayer },

  data() {
    return {
      zoom: 3,
      center: L.latLng(20, 20),
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
        
  }


};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 1em 0 1em;
}

</style>
