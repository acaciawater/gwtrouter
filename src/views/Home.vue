<template>
  <div>
      <div id="nav">
        <li class="navitem">
          <img src="@/assets/rvo-logo.png"/>
        </li>
      </div>
    <b-container class="home">
      <b-row>
        <b-col>
          <b-img rounded left fluid :src="require('../assets/img/GroundwaterIrrigation.png')" alt="Thumbnail"/>
        </b-col>
        <b-col>
          <b-img rounded center fluid :src="require('@/assets/img/RuralWaterSupply.png')" alt="Thumbnail"/>
        </b-col>
        <b-col>
          <b-img rounded right fluid :src="require('../assets/img/SandDam.png')" alt="Thumbnail"/>
        </b-col>
      </b-row>
      <hr/>
      <HelloWorld msg="GRoundwater Impact Scan"/>
      <router-link class="btn btn-success btn-lg btn-block col-2 mx-auto" type="button" to="/survey">Start scan</router-link>
    </b-container>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "home",
  components: {
    HelloWorld
  }
};
</script>
<style scoped>
.home {
  margin-top: 10em;
}

#nav {
  height: 8em;
  width: 100%;
  position: fixed; /* Fixed Sidebar (stay in place on scroll) */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  background-color: white;
  overflow-y: hidden;
  padding: 0;
}

#nav li.active {
  color: #ffffff;
}

#nav li:hover {
  color: #ffffff;
}

li>img {
  height: 7em;
  padding: 0;
  margin-top: -1em;
  margin-left: 50%;
}
/* .btn {
  margin-top: 4em;
} */
</style>
