import {App, computed, ComputedRef, inject, Ref, ref} from 'vue'
import {EpisodeFragment} from '@/graphql';

export type EpisodesPlugin = {
    episodes: ComputedRef<EpisodeFragment[]>
    setEpisodes: (v: EpisodeFragment[]) => void
}

const key = 'app.plugin.episodes'

export function installEpisodesPlugin(app: App): EpisodesPlugin {
    const episodes: Ref<EpisodeFragment[]> = ref([])

    const plugin: EpisodesPlugin = {
        episodes: computed(() => episodes.value),
        setEpisodes(v: EpisodeFragment[]) {
            episodes.value = v
        },
    }

    app.provide(key, plugin)

    return plugin
}

export function useEpisodesPlugin(): EpisodesPlugin {
    return inject(key) as EpisodesPlugin
}
