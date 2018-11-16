<template>
   <b-container class="h-100">
      <div class="row justify-content-center align-items-center h-100">
        <b-form @submit.prevent="obtain">
          <b-form-group>
            <input class="form-control form-control-lg" id="username" required v-model="username" type="text" placeholder="username"/>
          </b-form-group>
          <b-form-group>
            <b-input-group>
              <template v-if="passwordVisible">
                <b-input class="form-control form-control-lg" id="password" required v-model="password" type="text" placeholder="password"/>
                <span title="Hide password" v-on:click="togglePasswordVisibility"> <v-icon id="eye" name="eye-slash" scale="1.5"/></span>
              </template>
              <template v-else>
                <b-input class="form-control form-control-lg" id="password" required v-model="password" type="password" placeholder="password"/>
                <span title="Show password" v-on:click="togglePasswordVisibility"> <v-icon id="eye" name="eye" scale="1.5"/></span>
              </template>
            </b-input-group>
          </b-form-group>
          <b-form-group>
            <b-button class="btn btn-info btn-lg btn-block" type="submit">Login</b-button>
          </b-form-group>
        </b-form>
      </div>
   </b-container>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  
  data() {
    return { username: "", password: "", token: "", passwordVisible: false };
  },
  
  methods: {

    togglePasswordVisibility(evt) {
      this.passwordVisible = !this.passwordVisible;
    },

    verify(evt) {
      axios.post('http://localhost:8000/api/v1/token/verify', {token: this.token})
        .then(response => { 
          console.debug("verify token succeeded: " + response.statusText);
        })
        .catch(err => {
          // error code 400 (Bad Request). Reason should be in response.statusText
          console.debug("verify token failed: " + JSON.stringify(err.response.data))
        })

    },
    refresh(evt) {
      axios.post('http://localhost:8000/api/v1/token/refresh', {token: this.token})
        .then(response => { 
          const token = response.data.token;
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", this.username);
          console.debug("refresh token succeeded: " + response.statusText);
        })
        .catch(err => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          console.debug("refresh token failed: " + JSON.stringify(err.response.data))
        })

    },
    obtain(evt) {
      axios.post('http://localhost:8000/api/v1/token/', {username: this.username, password: this.password})
        .then(response => { 
          this.token = response.data.token;
          sessionStorage.setItem("token", this.token);
          sessionStorage.setItem("user", this.username);
          // console.debug("login succeeded: " + response.statusText);
          // console.debug("query: " + JSON.stringify(this.$route.query));
          let nextUrl = this.$route.query.next;
          if(nextUrl != null)
            this.$router.push(nextUrl);
        })
        .catch(err => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          console.debug("login failed: " + JSON.stringify(err.response.data))
        })
    }
  }
}
</script>

<style>
#eye {
  position: absolute;
  right: 8px;
  top: 12px;
  z-index: 999;  
}
</style>