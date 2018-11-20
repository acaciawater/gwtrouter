<template>
    <tr v-bind:class="context">
        <td>{{source.name}}</td>
        <td>{{risk}}</td>
        <td>{{value}}</td>
        <td>{{reason}}</td>
    </tr>
</template>

<script>
import axios from 'axios';
import xml2js from 'xml2js';

export default {
    name: 'Indicator',
    props: ['source','position'],

    data() {
        return {
            value: '',
            risk: '',
            reason: 'updating...',
            context: 'table-light'        
        }
    },

    mounted() {
        // if (this.position)
        //     this.inspect(this.position)
    },

    watch : {
        position: function(pos) {
            if(pos) 
                this.inspect(pos);
        }
    },
    
    methods: {
        clear() {
            this.value = ''
            this.risk = ''
            this.reason = ''
            this.context = 'table-light'
        },

        inspect(latlng) {
            // get pixel value and calculate risk class
            
            console.log('INSPECT',this.source.layer,latlng)
            const lat = latlng[0]
            const lon = latlng[1]
            const config = {
                service: "WMS",
                request: "GetFeatureInfo",
                version: "1.3.0",
                width: 100, height: 100,
                i: 0, j: 0,
                srs: "EPSG:4326",
                bbox: [lat,lon,lat+0.001,lon+0.001].join(','), // wms 1.3: (lat,lon), wsm 1.0: (lon,lat)
                query_layers: this.source.layer,
                info_format: "text/xml"                
            }
            let vm = this
            axios.get(this.source.url, {params: config})
                .then(response => {
                    vm.clear()
                    xml2js.parseString(response.data, (err, result) => {
                        if(err) {
                            console.log(err)
                            vm.reason = 'Error: ' + err
                            vm.context = 'table-danger'
                        }
                        else if('ServiceExceptionReport' in result) {
                            let errors = result['ServiceExceptionReport']['ServiceException'].map(x=>x._)
                            console.log(errors)
                            vm.reason = 'Error: ' + errors.join(',')
                            vm.context = 'table-danger'
                        }
                        else
                        {
                            // console.log(result)
                            let layers = result['GetFeatureInfoResponse']['Layer']
                            let attr = layers[0].Attribute[0].$
                            const value = attr.value
                            vm.value = value;

                            const categories = ['low','medium','high']
                            const variants = ['table-success','table-warning','table-danger']
                            const clamp = (x, min, max) => {
                                return Math.min(Math.max(x,min),max)
                            }
                            const limits = vm.source.limits
                            let index = limits.findIndex(item => {
                                return parseFloat(item.limit) > value
                            })

                            index = clamp(index,0,2)
                            vm.risk = categories[index]
                            vm.reason = limits[index].description
                            vm.context = variants[index]
                        }
                    })
                })
        }
    }
}

</script>

<style>

</style>
