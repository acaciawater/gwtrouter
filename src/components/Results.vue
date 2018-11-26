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
  props: ['position', 'survey'],
  data () {
    return {
      indicators: []
    }
  },
  watch: {
    survey: function(oldSurvey, newSurvey) {
        this.updateResults(newSurvey)
    }
  },

  mounted () {
    // load indicator list from gwt api
    this.getIndicators().then(result => {
      this.indicators = result
    })
  },

  methods: {

    updateResults(survey, options) {
      //console.log("Updating", survey, options)
      let selected = this.selectIndicators(survey.data)
      console.log("selected indicators:", selected)
      this.indicators.forEach(indicator => {
        indicator.selected = selected.has(indicator.name)
      })
      console.log("Indicators: ", this.indicators)
    },

    async getIndicators (url = '/api/v1/indicator/', name = undefined) {
      // retrieve indicator list from backend
      return this.$http.get(url, { 'params': name ? { name: name } : {} })
        .then(response => {
          return response.data
        })
    },
    selectIndicators(data) {
      // select indicators for survey
      let indicators = new Set()
      if(data.usegw==="yes") {
        console.log('Groundwater')
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
        console.log('Waste')
        indicators.add("Groundwater vulnerability")
      }
      if(data.surface==="yes") {
        console.log('Surface water')
        indicators.add("Population density upstream") // not yet available?
        indicators.add("Return flow ratio")
      }
      if(data.landuse==="yes") {
        // add test for recharge reduction
        console.log('Land use change')
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
