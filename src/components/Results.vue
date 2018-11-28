<template>
<div>
    <table class="table">
        <thead>
            <tr>
                <th>Indicator</th>
                <th>Risk</th>
                <!-- <th>Value</th> -->
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>
        <Indicator
            v-for="(source,index) in indicators"
            :source="source"
            :position="position"
            :key="index+1"
            v-show="source.selected"
            :popup="showModal"
            >
        </Indicator>
        </tbody>
    </table>
    <ul>
      <li v-for="(comment,index) in comments" :key="index+1">
        {{comment}}
      </li>
    </ul>
    <b-modal id="modalPopup" ref="modalPopup" :title="popup.title" ok-variant="info" ok-title="Close">
      <div>
        <p v-html="popup.content"></p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Indicator from '@/components/Indicator.vue'
import luChange from '@/assets/luchange.json'

export default {
  name: 'Results',
  components: {
    Indicator
  },
  props: ['survey','position'],
  data () {
    return {
      indicators: [],
      comments: [], // comments at end of indicator list
      popup: {title: "Title", content: "Content"}
    }
  },
  watch: {
    survey: function(oldSurvey, newSurvey) {
        this.updateResults(newSurvey)
    },
  },

  mounted () {
    // load indicator list from gwt api
    this.getIndicators().then(result => {
      this.indicators = result
    })
  },

  methods: {

    showModal(indicator) {
      this.popup.title = indicator.source.name
      this.popup.content = "<p>Loading...</p>"
      this.$refs.modalPopup.show();
      this.$http.get(indicator.source.info).then(response => {
        this.popup.content = response.data
      })
      .catch(err => {
        this.popup.content = err
      })
    },

    updateResults(survey, options) {
      //console.log("Updating", survey, options)
      this.comments = []
      let selected = this.selectIndicators(survey.data)
      console.log("selected indicators:", selected)
      this.indicators.forEach(indicator => {
        indicator.selected = selected.has(indicator.name)
      })
      console.log("Indicators: ", this.indicators)
      this.$forceUpdate()
    },

    async getIndicators (url = '/api/v1/indicator/', name = undefined) {
      // retrieve indicator list from backend
      return this.$http.get(url, { 'params': name ? { name: name } : {} })
        .then(response => {
          return response.data
        })
    },

    landuseChange(oldLanduse, newLanduse, type) {
      let impactMatrix = luChange[type]
      let index = luChange.Columns.indexOf(newLanduse)
      return index<0? 0 : impactMatrix[oldLanduse][index]
    },

    selectIndicators(data) {
      // select indicators for survey
      console.log(data)
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
        if(data.shallow_deep==="Shallow") {
          
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
      if(data.landcover==="yes") {
        console.log('Landuse')
        let lu1 = data.landuse_now
        let lu2 = data.landuse_future
        console.log(lu1, lu2)
        let effect = this.landuseChange(lu1, lu2, "Quantity")
        console.log("Recharge:", effect)
        if(effect) {
          indicators.add("Recharge")
          indicators.add("Groundwater stress")
          this.comments.push("Replenishment of groundwater resources is expected to decrease as a result of the planned change in land cover. This risk can be mitigated by implementing managed aquifer recharge measures")
        }
        effect = this.landuseChange(lu1, lu2, "Quality")
        console.log("Quality:", effect)
        if(effect) {
          indicators.add("Groundwater vulnerability")
          this.comments.push("Surface water quality is expected to impacted as a result of the planned change in land cover. This can have a negative impact on groundwater quality, especially in areas where the groundwater is vulnerable (see groundwater vulnerability indicator")
        }
      }
      return indicators
    }
  }
}

</script>

<style scoped>
</style>
