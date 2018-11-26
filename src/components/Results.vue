<template>
<div>
    <table class="table">
        <thead>
            <tr>
                <th>Indicator</th>
                <th>Risk</th>
                <th>Value</th>
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>
        <Indicator
            v-for="(source,index) in indicators"
            :source="source"
            :position="position"
            :key="index+1"
            >
        </Indicator>
        </tbody>
    </table>
</div>
</template>

<script>
import Indicator from '@/components/Indicator.vue'

export default {
  name: 'Results',
  components: {
    Indicator
  },
  props: ['position'],
  data () {
    return {
      indicators: []
    }
  },
  mounted () {
    // load indicator list from gwt api
    this.getIndicators().then(result => {
      this.indicators = result
      // console.log("Indicators: ", this.indicators)
      let surveyData = localStorage.getItem("survey")
      if(surveyData) {
        console.debug('survey found:')
        let survey = JSON.parse(surveyData).survey
        console.debug(survey)
        let selected = this.selectIndicators(survey)
        this.indicators.forEach(indicator => {
          indicator.selected = selected.has(indicator.name)
        })
      console.log("Indicators: ", this.indicators)
      }
    })
  },
  methods: {
    async getIndicators (url = '/api/v1/indicator/', name = undefined) {
      return this.$http.get(url, { 'params': name ? { name: name } : {} })
        .then(response => {
          return response.data
        })
    },
    selectIndicators(data) {
      // get indicators for survey
      let indicators = new Set()
      if(data.usegw==="yes") {
        indicators.add("Groundwater stress")
        indicators.add("Recharge")
        indicators.add("Population growth")
        indicators.add("Proximity to wetlands")
        if(data.watersector==="Drinking water") {
          indicators.add("Arsenic")
          indicators.add("Fluoride")
          indicators.add("Salinity")
          indicators.add("Proximity to the coast")
        }
        else if(data.watersector==="Irrigation" || data.watersector=="Livestock") {
          indicators.add("Arsenic")
          indicators.add("Salinity")
          indicators.add("Proximity to the coast")
        }
        else if(data.watersector==="Industry") {
          indicators.add("Salinity")
          indicators.add("Proximity to the coast")
          if(data.industry_type==="Food") {
            indicators.add("Arsenic")
            indicators.add("Fluoride")
          }
        }
      }
      if(data.generates_waste==="yes") {
        indicators.add("Vulnerability")
      }
      if(data.surface==="yes") {
        indicators.add("Population density upstream") // not yet available?
        indicators.add("Return flow ratio")
      }
      if(data.landuse==="yes") {
        // add test recharge reduction
        indicators.add("Recharge")
        indicators.add("Groundwater stress")
        indicators.add("Downstream vulnerable") // not available?
      }
      return indicators
    }
  }
}

</script>

<style>
</style>
