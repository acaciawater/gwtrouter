<template>
 <div>
   <form class="login" @submit.prevent="login">
     <h1>Sign in</h1>
     <label>User name</label>
     <input required v-model="username" type="text" placeholder="username"/>
     <label>Password</label>
     <input required v-model="password" type="password" placeholder="password"/>
     <hr/>
     <button type="submit">Login</button>
   </form>
 </div>
</template>

<script>
import axios from "axios";

const logon = user =>
  new Promise((resolve, reject) => {
    axios({
      url: "http://localhost:8000/api/v1/login/",
      data: user,
      method: "POST"
    })
      .then(resp => {
        const token = resp.data.token;
        localStorage.setItem("token", token); // store the token in localstorage
        localStorage.setItem("user", user.username);
        resolve(resp);
      })
      .catch(err => {
        localStorage.removeItem("token"); // if the request fails, remove any possible user token if possible
        console.debug("login failed: " + err);
        reject(err);
      });
  });

export default {
  name: "Login",
  data() {
    return { username: '', password: '' };
  },
  methods: {
    login: function() {
      const { username, password } = this;
      logon({ username, password }).then(() => {
        this.$router.push({name:'survey'});
      });
    }
  }
};
</script>

<style>
</style>