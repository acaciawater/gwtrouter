<template>
    <b-container id="survey">
    <survey :survey="survey"></survey>
    </b-container>
</template>

<script>
import { Survey, Model } from "survey-vue";
import "survey-vue/survey.css";

import surveyData from "../assets/survey.json";
let model = new Model(surveyData);

export default {
  name: "MySurvey",
  components: {
    Survey
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
