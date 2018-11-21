<template>
    <div class="h-100">
      <l-map style="height: 96%" ref='map' :zoom='zoom' :minZoom=2 :center='center' @mousemove="setCurrent" @click="setMarker">
        <l-marker :visible='markerVisible' :draggable='true' :lat-lng.sync='markerLocation' @dragend="moveMarker"/>
      </l-map>
      {{address}}
    </div>
</template>

<script>
import querystring from 'querystring'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LMap, LMarker } from 'vue2-leaflet'
import jsonData from '@/assets/layers.json'
import secrets from '@/assets/secrets.json'

var googleAPI = require('@google/maps').createClient({
  key: secrets.google_api_key
})

export default {
  name: 'Map',
  components: { LMap, LMarker },
  // props: ['center', 'markerLocation', 'markerVisible'],
  data () {
    return {
      zoom: 3,
      center: L.latLng(20, 20),
      markerLocation: L.latLng(52.02136560574015, 4.7101521555446055),
      markerVisible: false,
      address: 'Click on the map to set the project location',
      layers: jsonData
    }
  },

  mounted () {
    let id = 0
    let vm = this
    let map = vm.$refs.map.mapObject
    //console.log('adding layers', vm)
    vm.layers.forEach(layer => {
      layer.id = ++id // add autoincremented id to layer.
      if(layer.visible) {
        vm.addLayer(layer, map)
      }
    })
  },

  methods: {
    addLayer(layer, map) {
      if (layer.type === 'tms') {
        L.tileLayer(layer.url, {
          attribution: layer.attribution,
          //minZoom: layer.minZoom || 3,
          maxZoom: layer.maxZoom || 20
        }).addTo(map)
      } else if (layer.type === 'wms') {
        L.tileLayer.wms(layer.url, {
          layers: layer.layer,
          format: 'image/png',
          transparent: true,
          opacity: layer.opacity || 1.0,
          minZoom: layer.minZoom || 3,
          maxZoom: layer.maxZoom || 18
        }).addTo(map)
      } else if (layer.type === 'wfs') {
        let options = {
          version: '1.0.0',
          service: 'WFS',
          request: 'GetFeature',
          map: layer.map,
          typename: layer.layer,
          outputFormat: 'GeoJSON'
        }
        this.$http.get(layer.url + '?' + querystring.stringify(options)).then(response => {
          let layerStyle = layer.style
          L.geoJSON(response.data, {
            style: layer.style,
            onEachFeature: (feature, layer) => {
              layer.bindTooltip(feature.properties.NAME_LONG)
              layer.on('mouseover', () => {
                layer.setStyle({ color: 'red', weight: 3 })
                layer.bringToFront()
              })
              layer.on('mouseout', () => {
                layer.setStyle(layerStyle)
              })
            }
          }).addTo(map)
        })
      }
    },   
    setCurrent (evt) {
      this.currentLocation = evt.latlng
    },
    moveMarker (evt) {
      // sets marker position from marker's dragend event
      let loc = evt.target.getLatLng()
      this.markerLocation = loc
      this.$emit('locationChanged', [loc.lat, loc.lng])
      this.geocode()
    },
    setMarker (evt) {
      // sets marker position from map click event
      let loc = evt.latlng
      this.markerLocation = loc
      this.$emit('locationChanged', [loc.lat, loc.lng])
      this.markerVisible = true
      this.geocode()
    },
    geocode () {
      // retrieve reverse geocoding information for markerLocation
      const reverseGeocodeParams = {
        latlng: this.markerLocation,
        language: 'en'
      }
      this.address = 'Locating...'
      googleAPI.reverseGeocode(reverseGeocodeParams, (err, result) => {
        // console.log(result)
        if (err) {

        }
        if (result.json.status === 'OK') {
          // todo: check address_components?
          const location = result.json.results[0]
          this.address = location.formatted_address
        } else {
          this.address = 'Unknown location'
          setTimeout(() => {
            this.address = ''
          }, 2000)
        }
      })
    },
    
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 1em 0 1em;
}
</style>
