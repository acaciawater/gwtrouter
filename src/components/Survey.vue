<template>
      <b-container fluid id="survey" class="h-100">
      <div id="nav">
        <li title="Questionnaire" class="navitem" @click="ready=false"><v-icon name="poll-h" scale="2"/></li>
        <li title="Map" class="navitem"><v-icon name="map" scale="2"/></li>
        <li title="Report" class="navitem" @click="ready=true"><v-icon name="file-alt" scale="2"/></li>
      </div>
        <b-row class="h-100">
          <b-col cols="4">
          <Results ref="result" :position="location" :survey="survey" v-show="ready"/>
          <survey v-show="!ready" :survey="survey"></survey>
          </b-col>
          <b-col cols="8">
            <Map class="h-100" @locationChanged="onLocationChanged"></Map>
          </b-col>
        </b-row>
      </b-container>

</template>

<script>
import { Survey, Model, JsonObject } from 'survey-vue'
import Map from '@/components/Map.vue'
import Results from '@/components/Results.vue'
import 'survey-vue/survey.css'
import blankSurvey from '@/assets/survey.json'

JsonObject.metaData.addProperty('question', 'popup:text')

let model = new Model(blankSurvey)

let surveyData = localStorage.getItem('survey')
if (surveyData) {
  model.data = JSON.parse(surveyData).survey
}

model.onAfterRenderQuestion.add(function (survey, options) {
  if (options) {
    // console.log("onAfterRenderQuestion options", options);
    let question = options.question
    if (question.popup) {
      let btn = document.createElement('button')
      btn.className = 'infobutton'
      btn.innerHTML = 'Info'
      const anchor = options.htmlElement.querySelector('h5')
      const parent = anchor.parentNode
      parent.insertBefore(btn, anchor)
      // let element = document.getElementById(options.htmlElement.id);
      // console.log("found element", element);
    }
  }
})

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
      location: [0,0],
      ready: false
    }
  },

  methods: {
    onLocationChanged (newLocation) {
      this.location = newLocation
      // console.log('location changed', newLocation, this.location)
    },

    saveResult (result) {
      let survey = result.data
      let data = {
        project: survey.project_name,
        location: {
          type: 'Point',
          coordinates: this.location
        },
        survey: survey
      }
      localStorage.setItem('survey', JSON.stringify(data))

      let token = sessionStorage.getItem('token')
      let config = { headers: { Authorization: 'JWT ' + token } }
      this.$http.post('/api/v1/survey/', data, config).then(response => {
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
    }
  },

  mounted () {
    model.onValueChanged.add((sender,options) => {
      //console.log("Survey Value Changed", options)
      this.$refs.result.updateResults(sender,options)
      //this.$emit("surveyChanged", sender, options)
    })
    model.onComplete.add(result => {
      this.saveResult(result) // TODO: check if saving succeeded
      this.survey.clear(false,false)
      this.ready = true
    })
  }
}

</script>

<style scoped>
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
</style>
