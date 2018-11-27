<template>
  <b-container class="home">
    <b-row>
      <b-col>
        <b-img thumbnail fluid src="https://picsum.photos/250/250/?image=54" alt="Thumbnail"/>
      </b-col>
      <b-col>
        <b-img thumbnail fluid src="https://picsum.photos/250/250/?image=58" alt="Thumbnail"/>
      </b-col>
      <b-col>
        <b-img thumbnail fluid src="https://picsum.photos/250/250/?image=59" alt="Thumbnail"/>
      </b-col>
    </b-row>
    <HelloWorld msg="GRoundwater Impact Scan"/>
  </b-container>
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
  margin-top: 4em;
}
</style>
