<template>
    <tr v-bind:class="source.selected?context:'table-light text-muted'" @click="clicked">
      <!-- <td><span><v-icon color="rgb(58, 131, 107)" name="info-circle"/>{{source.name}}</span></td> -->
      <td>{{source.name}}</td>
      <td>{{risk}}</td>
      <!-- <td>{{value}}</td> -->
      <td>{{reason}}</td>
    </tr>
</template>

<script>
import xml2js from 'xml2js'

export default {
  name: 'Indicator',
  props: ['source', 'position', 'popup'],

  data () {
    return {
      value: '',
      risk: '',
      reason: '',
      context: 'table-light'
    }
  },

  watch: {
    source: function(source) {
      this.inspect(this.position)
    },

    position: function (pos) {
      if (pos) {
        this.inspect(pos)
      }
    }
  },

  methods: {
    clicked(evt) {
      if(this.popup)
        this.popup(this)
    },
    clear () {
      this.value = ''
      this.risk = ''
      this.reason = ''
      this.context = 'table-light'
    },

    inspect (latlng) {
      // get pixel value and calculate risk class

      // console.log('INSPECT', this.source.layer, latlng)
      const lat = latlng[0]
      const lon = latlng[1]
      const config = {
        service: 'WMS',
        request: 'GetFeatureInfo',
        version: '1.3.0',
        width: 100,
        height: 100,
        i: 0,
        j: 0,
        srs: 'EPSG:4326',
        bbox: [lat, lon, lat + 0.001, lon + 0.001].join(','), // wms 1.3: (lat,lon), wsm 1.0: (lon,lat)
        query_layers: this.source.layer,
        info_format: 'text/xml'
      }
      let vm = this
      vm.reason = 'Updating...'
      this.$http
        .get(this.source.url, { params: config })
        .then(response => {
          vm.clear()
          xml2js.parseString(response.data, (err, result) => {
            if (err) {
              console.log(err)
              vm.reason = 'Error: ' + err
              vm.context = 'table-danger'
            } else if ('ServiceExceptionReport' in result) {
              let errors = result['ServiceExceptionReport'][
                'ServiceException'
              ].map(x => x._)
              console.log(errors)
              vm.reason = 'Error: ' + errors.join(',')
              vm.context = 'table-danger'
            } else {
              // console.log(result)
              let layers = result['GetFeatureInfoResponse']['Layer']
              let attr = layers[0].Attribute[0].$
              const value = attr.value
              if (value == 'no data') {
                vm.rish = 'unknown'
                vm.context = 'table-warning'
                vm.reason = 'Indicator cannot be evaluated at this location.'
                if(vm.source.name==="Groundwater stress") {
                  vm.reason += '\nRecharge can be used as a proxy for groundwater stress'
                }
              } else {
                const categories = ['low', 'medium', 'high']
                const variants = [
                  'table-success',
                  'table-warning',
                  'table-danger'
                ]
                const limits = vm.source.limits
                let index = limits.findIndex(item => {
                  return parseFloat(item.limit) > value
                })
                if (index < 0 || index > 2) index = 2
                vm.value = value
                vm.risk = categories[index]
                vm.context = variants[index]
                vm.reason =
                  limits[Math.min(index, limits.length - 1)].description
              }
            }
          })
        })
        .catch(err => {
          vm.reason = err
          vm.context = 'table-danger'
        })
    }
  }
}
</script>

<style scoped>
.info {
  color: blue;

}
tr {
  cursor: pointer;
}
</style>
