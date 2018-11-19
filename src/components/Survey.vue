<template>
    <b-container fluid id="survey" class="h-100">
      <b-row class="h-100">
        <b-col cols="4">
        <survey :survey="survey"></survey>
        </b-col>
        <b-col cols="8">
          <!-- <Map class="h-100" :markerLocation="location" :center="location" :markerVisible="true"></Map> -->
          <Map class="h-100"></Map>
        </b-col>
      </b-row>
    </b-container>
</template>

<script>
import { Survey, Model, JsonObject } from "survey-vue";
import Map from "@/components/Map.vue";
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
    Map
  },
  
  methods: {

    saveResult(result) {
      let token = sessionStorage.getItem("token");
      axios.defaults.headers.common["Authorization"] = "JWT " + token;
      let survey = result.data;
      let data = {
        project: survey.name,
        location: {
          type: "Point",
          coordinates: this.position
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
          alert(error.response);
        });
    }
  },

  mounted() {
    model.onComplete.add(result => {
      this.saveResult(result);
    });
  },
  data() {

    return {
      survey: model,
      location: L.LatLng(52,5)
    };
  }
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
