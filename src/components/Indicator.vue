<template>
    <li>
        {{source.name}} {{risk}} ({{value}})
    </li>
</template>

<script>
import axios from 'axios';
import xml2js from 'xml2js';

export default {
    name: 'Indicator',
    props: ['source','position'],
    data() {
        return {
            value: 'updating..',
            risk: 'unknown',
        }
    },
    mounted() {
        this.inspect(this.position)
    },
    methods: {
        inspect(latlng) {
            // get pixel value and risk class
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

                    //console.log(response) // xml response
                    xml2js.parseString(response.data, (err, result) => {
                        if(err) {
                            console.log(err)
                        }
                        else if('ServiceExceptionReport' in result) {
                            let errors = result['ServiceExceptionReport']['ServiceException'].map(x=>x._)
                            //console.log(errors)
                            vm.value = 'Error: '+errors.join(',')
                            vm.risk = ''
                        }
                        else
                        {
                            // console.log(result)
                            let layers = result['GetFeatureInfoResponse']['Layer']
                            let attr = layers[0].Attribute[0].$
                            // console.log(attr)
                            const value = attr.value
                            vm.value = value;

                            const categories = ['low','medium','high']
                            const clamp = (x, min, max) => {
                                return Math.min(Math.max(x,min),max)
                            }
                            const limits = vm.source.limits
                            let index = limits.findIndex(item => {return parseFloat(item.limit) > value})
                            // console.log('INDEX:', index)
                            // console.log('LIMITS:', limits, index)
                            vm.risk = categories[clamp(index,0,2)]
                        }
                    })
                })
        }
    }
}

</script>

<style>

</style>
