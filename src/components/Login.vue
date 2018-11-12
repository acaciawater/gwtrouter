<template>
   <b-container>
    <b-form @submit.prevent="login">
      <b-form-group class="row">
        <label class="col-4" for="username">Username</label>
        <input class="col-8" id="username" required v-model="username" type="text" placeholder="username"/>
      </b-form-group>
      <b-form-group class="row">
        <label class="col-4" for="password">Password</label>
        <input class="col-8" id="password" required v-model="password" type="password" placeholder="password"/>
      </b-form-group>
    </b-form>
    <b-button type="submit">Login</b-button>
   </b-container>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data() {
    return { username: "", password: "" };
  },
  methods: {
    login: function() {
      // login to auth server and fetch jwt token
      axios.post('http://localhost:8000/api/v1/login/', {
        username: this.username, 
        password: this.password
        })
        .then(response => { 
          const token = response.data.token;
          localStorage.setItem("token", token);
          localStorage.setItem("user", this.username);
          console.debug("login succeeded");
          this.$router.push({ name: "survey" })
        })
        .catch(err => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          console.debug("login failed: " + err);

        })
    }
  }
}
</script>

<style>
</style>