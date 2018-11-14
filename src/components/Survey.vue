<template>
    <b-container fluid id="survey" class="h-100">
      <b-row class="h-100">
        <b-col cols="4">
        <survey :survey="survey"></survey>
        </b-col>
        <b-col cols="8">
          <Map class="h-100"></Map>
        </b-col>
      </b-row>
    </b-container>
</template>

<script>
import { Survey, Model } from "survey-vue";
import Map from "@/components/Map.vue";
import "survey-vue/survey.css";
import surveyData from "@/assets/survey.json";
import axios from 'axios';

function saveResult(result) {
  let token = localStorage.getItem("token");
  axios.defaults.headers.common['Authorization'] = 'JWT ' + token;
  let survey = result.data;
  let data = {
    project: survey.name,
    location: {
      type: "Point",
      coordinates: [
        5.0, 52.0
      ]
    },
    user: localStorage.getItem("user"),
    survey: survey
  };
  axios.post('http://localhost:8000/api/v1/survey/',data)
    .then(response => {
      alert('Successfully saved!');
    })
    .catch(error => {
      alert(error);
    })
}

let model = new Model(surveyData);
model.onComplete.add(result =>
{
  saveResult(result);
});

export default {
  name: "MySurvey",
  components: {
    Survey, Map
  },
  data() {
    return {
      survey: model
    };
  }
};
</script>

<style>
</style>
