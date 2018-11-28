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

// TODO: load from rat server
let popupContent = {
  address: { title: 'Water Risk Map', content: require('html-loader!@/assets/html/riskmap.html') },
  shallow_deep: { title: 'Shallow or deep?', content: require('html-loader!@/assets/html/shallowdeep.html') },
  landcover: { title: 'Land use', content: require('html-loader!@/assets/html/landuse.html') },
  usegw: { title: 'Groundwater use', content: require('html-loader!@/assets/html/groundwater.html') },
  generates_waste: { title: 'Waste', content: require('html-loader!@/assets/html/waste.html') },
  surface: { title: 'Surface water', content: require('html-loader!@/assets/html/surface.html') }
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
      ready: false,
      popup: {
        title: 'Popup title',
        content:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. \
        Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, \
        pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, \
        vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede \
        mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. \
        Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, \
        feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. \
        Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.</p> \
        <p>Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. \
        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia.'
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
      console.log('address changed to', address)
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
          console.debug('Successfully saved!')
          console.debug(response)
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
              vm.popup = popupContent[question.name]
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
