<template>
    <div class="fixed-container">
        <slot name="default"></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Fixed'
})
</script>

<style lang="scss" scoped>
.fixed-container {
    @include fixed;

    z-index: 200;
}
</style>
