<template>
    <div>
        <ul>
            <li
                v-for="(e, k) in episodes"
                :key="k"
            >
                {{ e.episode }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useEpisodesPlugin} from '@/plugins/episodes';

export default defineComponent({
    setup() {
        const {episodes} = useEpisodesPlugin()

        return {
            episodes
        }
    }
})
</script>
