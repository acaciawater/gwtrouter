<template>
<div>
    <table class="table">
        <thead>
            <tr>
                <th>Indicator</th>
                <th>Risk</th>
                <th>Value</th>
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>
        <Indicator
            v-for="(source,index) in indicators"
            :source="source"
            :position="position"
            :key="index+1"
            >
        </Indicator>
        </tbody>
    </table>
</div>
</template>

<script>
import Indicator from '@/components/Indicator.vue'

export default {
  name: 'Results',
  components: {
    Indicator
  },
  props: ['position'],
  data () {
    return {
      indicators: []
    }
  },
  mounted () {
    // load indicator list from gwt api
    this.getIndicators().then(result => {
      this.indicators = result
      // console.log("Indicators: ", this.indicators)
    })
  },
  methods: {
    async getIndicators (url = '/api/v1/indicator/', name = undefined) {
      return this.$http.get(url, { 'params': name ? { name: name } : {} })
        .then(response => {
          return response.data
        })
    }
  }
}

</script>

<style>
</style>
