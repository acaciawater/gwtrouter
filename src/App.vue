<template>
  <div id="app">
    <div id="nav">
      <router-link title="Home" class="navitem" to="/"><v-icon name="home" scale="2"/></router-link>
      <router-link title="Questionnaire" class="navitem" to="/survey"><v-icon name="poll-h" scale="2"/></router-link>
      <router-link title="Map" class="navitem" to="/map"><v-icon name="map" scale="2"/></router-link>
      <router-link title="Report" class="navitem" to="/result"><v-icon name="file-alt" scale="2"/></router-link>
      <router-link title="Information" class="navitem" to="/about"><v-icon name="info-circle" scale="2"/></router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
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

#nav a.router-link-exact-active {
  color: #ffffff;
}

#nav a:hover {
  color: #ffffff;
}

html,
body,
#app {
  height: 100%;
  /* padding: 0 2px 1em; */
}

#app {
  margin-left: 4em;
}
</style>
