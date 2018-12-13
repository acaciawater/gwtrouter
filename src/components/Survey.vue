<template>
  <b-container fluid id="survey" class="h-100">
    <div id="nav">
      <router-link title="Home" class="navitem" to="/">
        <v-icon name="home" scale="2"/>
      </router-link>
      <li title="Questions" class="navitem" @click="ready=false">
        <v-icon name="poll-h" scale="2"/>
      </li>
      <li title="Results" class="navitem" @click="ready=true">
        <v-icon name="file-alt" scale="2"/>
      </li>
    </div>
    <b-row class="h-100">
      <b-col cols="4">
        <Results ref="result" :position="location" :survey="survey" v-show="ready"/>
        <survey v-show="!ready" :survey="survey"></survey>
      </b-col>
      <b-col cols="8">
        <Map
          class="h-100"
          :markerLocation="location"
          :layers="surveyLayers"
          @locationChanged="onLocationChanged"
          @addressChanged="onAddressChanged"
        ></Map>
      </b-col>
    </b-row>

    <b-modal id="myModal" ref="myModal" :title="popup.title" ok-variant="info" ok-title="Close">
      <div>
        <p v-html="popup.content"></p>
      </div>
    </b-modal>
  </b-container>
</template>

<script>
import { Survey, Model, JsonObject } from 'survey-vue'
import Map from '@/components/Map.vue'
import Results from '@/components/Results.vue'
import 'survey-vue/survey.css'
import blankSurvey from '@/assets/survey.json'
import L from 'leaflet'
import surveyLayerConfig from '@/assets/surveylayers.json'
import resultLayerConfig from '@/assets/resultlayers.json'

let popupContent = {
  address: { title: 'Water Risk Map', content: '', url: 'info/riskmap.html' },
  shallow_deep: { title: 'Shallow or deep?', content: '', url: 'info/shallowdeep.html' },
  landcover: { title: 'Land use', content: '', url: 'info/landuse.html' },
  usegw: { title: 'Groundwater use', content: '', url: 'info/groundwater.html' },
  generates_waste: { title: 'Waste', content: '', url: 'info/waste.html' },
  surface: { title: 'Surface water', content: '', url: 'info/surface.html' }
}

JsonObject.metaData.addProperty('question', 'popup:text')

let model = new Model(blankSurvey)

export default {
  name: 'MySurvey',

  components: {
    Survey,
    Map,
    Results
  },

  data () {
    return {
      survey: model,
      location: L.latLng(20, 20),
      surveyLayers: surveyLayerConfig,
      resultLayers: resultLayerConfig,
      ready: false,
      popup: {
        title: 'Popup title',
        content:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.'
      }
    }
  },

  methods: {
    onLocationChanged (newLocation) {
      this.location = newLocation
      // console.log("location changed", newLocation, this.location)
    },

    onAddressChanged (address) {
      // update address in survey
      // console.log('address changed to', address)
      this.survey.setValue('address', address)
    },

    showModal () {
      this.$refs.myModal.show()
    },

    saveResult (result) {
      if (!this.location) {
        return
      }

      let survey = result.data
      let lat = this.location.lat
      let lng = this.location.lng
      this.location = null
      let data = {
        project: survey.project_name,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        survey: survey
      }
      // console.log(data)
      localStorage.setItem('survey', JSON.stringify(data))

      let token = sessionStorage.getItem('token')
      let config = { headers: { Authorization: 'JWT ' + token } }
      this.$http
        .post('/api/v1/survey/', data, config)
        .then(response => {
          // console.debug('Successfully saved!')
          // console.debug(response)
        })
        .catch(error => {
          let e = error.response.data
          let errormsg = ''
          for (const key in e) {
            errormsg += key + ': ' + e[key].toString()
          }
          console.error(error.response.statusText, errormsg)
        })
      this.location = L.latLng(lat, lng)
    }
  },

  mounted () {
    let vm = this

    let surveyData = localStorage.getItem('survey')
    if (surveyData) {
      let surveyObject = JSON.parse(surveyData)
      model.data = surveyObject.survey
      if (surveyObject.location.coordinates[0]) {
        console.log('Setting location', surveyObject.location)
        this.location = L.latLng(surveyObject.location.coordinates)
      }
    }

    model.onValueChanged.add((sender, options) => {
      let result = this.$refs.result
      if (result) {
        result.updateResults(sender, options)
      }
    })

    model.onComplete.add(result => {
      try {
        this.saveResult(result) // TODO: check if saving succeeded
      } finally {
        this.survey.clear(false, true)
        this.ready = true
      }
    })

    model.onAfterRenderQuestion.add(function (survey, options) {
      if (options) {
        let question = options.question
        const anchor = options.htmlElement.querySelector('h5>span>span')
        if (question.popup) {
          let existingElement = anchor.querySelector('.infobutton')
          // console.log(existingElement)
          if (!existingElement) {
            let btn = document.createElement('button')
            btn.className = 'infobutton'
            btn.setAttribute('type', 'button')
            btn.onclick = function () {
              const popup = popupContent[question.name]
              if (popup.content === '') {
                popup.content = 'Loading...'
                vm.$http.get(popup.url)
                  .then(response => {
                    // console.log(result)
                    popup.content = response.data
                  })
                  .catch((error) => {
                    popup.content = error.response.data
                  })
              }
              vm.popup = popup
              vm.showModal()
            }
            btn.innerHTML = 'info'
            anchor.appendChild(btn)
          }
        }
      }
    })
  }
}
</script>

<style>
.infobutton {
  /* background: rgb(7, 1, 95) !important; */
  min-width: 20px !important;
  padding: 0 1em !important;
  float: right !important;
}
.navitem {
  display: block;
  color: rgb(122, 206, 136);
  padding: 0 1em;
  margin-top: 1em;
  margin-bottom: 4em;
}

#nav {
  height: 100%; /* Full-height: remove this if you want "auto" height */
  width: 4em; /* Set the width of the sidebar */
  position: fixed; /* Fixed Sidebar (stay in place on scroll) */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  background-color: rgb(58, 131, 107);
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 20px;
}

#nav li.active {
  color: #ffffff;
}

#nav li:hover {
  color: #ffffff;
}

.modal-dialog {
  max-width: 40% !important;
}

</style>
