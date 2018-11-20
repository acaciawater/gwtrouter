<template>
    <b-container fluid id="survey" class="h-100">
      <b-row class="h-100">
        <b-col cols="4">
        <Results :position="location" v-show="ready"/>
        <survey v-show="!ready" :survey="survey"></survey>
        </b-col>
        <b-col cols="8">
          <Map class="h-100" @locationChanged="onLocationChanged"></Map>
        </b-col>
      </b-row>
    </b-container>
</template>

<script>
import { Survey, Model, JsonObject } from "survey-vue";
import Map from "@/components/Map.vue";
import Results from "@/components/Results.vue";
import "survey-vue/survey.css";
import blankSurvey from "@/assets/survey.json";
import axios from "axios";

JsonObject.metaData.addProperty("question", "popup:text");

let model = new Model(blankSurvey);

let surveyData = localStorage.getItem('survey');
if (surveyData) {
  model.data = surveyData.survey
}

model.onAfterRenderQuestion.add(function(survey, options) {
  if (options) {
    // console.log("onAfterRenderQuestion options", options);
    let question = options.question;
    if (question.popup) {
      let btn = document.createElement("button");
      btn.className = "infobutton";
      btn.innerHTML = "Info";
      const question = options.question;
      const anchor = options.htmlElement.querySelector('h5');
      const parent = anchor.parentNode;
      parent.insertBefore(btn, anchor)
      // let element = document.getElementById(options.htmlElement.id);
      // console.log("found element", element);
    }
  }
})

export default {
  name: "MySurvey",

  components: {
    Survey,
    Map,
    Results
  },
  
  data() {

    return {
      survey: model,
      location: L.LatLng(52,5),
      ready: false
    };
  },

  methods: {
    onLocationChanged(newLocation) {
      this.location = newLocation
      console.log("location changed", newLocation, this.location)
    },

    saveResult(result) {
      let token = sessionStorage.getItem("token");
      axios.defaults.headers.common["Authorization"] = "JWT " + token;
      let survey = result.data;
      let data = {
        project: survey.name,
        location: {
          type: "Point",
          coordinates: [20,20] // this.location
        },
        survey: survey
      };
      sessionStorage.setItem('survey', data);
      axios
        .post("http://localhost:8000/api/v1/survey/", data)
        .then(response => {
          alert("Successfully saved!");
        })
        .catch(error => {
          console.log(error.response)
          alert(error.response);
        });
    }
  },

  mounted() {
    model.onComplete.add(result => {
      // this.saveResult(result); // TODO: check if saving succeeded
      this.ready = true
    })
  },
};

</script>

<style>
/* .sv_row :hover {
  border: 1px solid red;
} */
.infobutton {
  /* background: rgb(7, 1, 95) !important; */
  min-width: 20px !important;
  padding: 0 1em !important;
  float: right !important;
}
</style>
