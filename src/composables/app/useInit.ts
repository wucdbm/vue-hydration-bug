import { computed, onServerPrefetch, Ref, ref, watch } from 'vue'
import { useInitialState } from '@/app'

import { InitQuery, useInitQuery } from '@/graphql'
import { useInitializedPlugin } from '@/plugins/initialized'
import { promiseTimeout } from '@vueuse/core';
import {useEpisodesPlugin} from '@/plugins/episodes';

function notNull<I>(input: (I | null | undefined)[] | null | undefined): I[] {
    if (!input) {
        return []
    }

    return input.filter((v): v is I => {
        return !!v;
    })
}

export function useInit() {
    const { initialize, isInitialized } = useInitializedPlugin()
    const { setEpisodes } = useEpisodesPlugin()

    const delay = promiseTimeout(import.meta.env.SSR ? 0 : 1250)

    function processInitData(data: InitQuery): void {
        // Don't ask;
        // We have a ton of dynamic stuff like main menus, footer, and a bunch more that we need before the app can run
        // This is only here to mimic that behaviour
        setEpisodes(notNull(data.episodes?.results))
    }

    const response = useInitQuery({
        variables: computed(() => {
            return {
                page: 1
            }
        })
    })

    const { operation, data } = response
    const initialState = useInitialState()
    const apiState = initialState.rickAndMorty
    const operationState = apiState[operation.value?.key || '']
    const initData: Ref<InitQuery | undefined> = ref(undefined)

    watch(data, (data) => {
        if (!data) {
            return
        }

        processInitData(data)
    })

    let processed = false
    if (operationState && operationState.data) {
        initData.value = JSON.parse(operationState.data)

        if (initData.value) {
            processInitData(initData.value)
        }

        processed = true
    }

    const prefetchPromise = response.then((response) => {
        if (import.meta.env.SSR) {
            initialize()
        } else {
            delay.then(() => {
                initialize()
            })
        }

        initData.value = response.data.value

        if (!processed && response.data.value) {
            processInitData(response.data.value)
        }
    })

    onServerPrefetch(async () => {
        await prefetchPromise
    })

    const error = computed(() => response.error.value)

    return {
        initData,
        isInitialized,
        prefetchPromise,
        error,
    }
}
