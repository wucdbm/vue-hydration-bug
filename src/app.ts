import { createHead, HeadClient } from '@vueuse/head'
import type { Router, RouterHistory } from 'vue-router'
import { createRouter } from './router'
import { App as VueApp, inject } from 'vue'
import {
    cacheExchange,
    createClient,
    dedupExchange,
    fetchExchange,
    ssrExchange as createSSRExchange
} from '@urql/core'
import {
    install,
} from '@urql/vue'
import { SSRData, SSRExchange } from '@urql/core/dist/types/exchanges/ssr'
import '@/style.css'
import { ApiUrls } from '@/entry-server-types'
import {InitializerPlugin, installInitializerPlugin} from '@/plugins/initialized';
import {installEpisodesPlugin} from '@/plugins/episodes';

export interface FrontOfficeApp {
    app: VueApp
    router: Router
    head: HeadClient
    rickAndMortyExchange: SSRExchange
    initializedPlugin: InitializerPlugin
}

export type InitialState = {
    rickAndMorty: SSRData
    isInitialized: boolean
}

export interface AppConfig {
    history: RouterHistory
    initialState: InitialState
    urls: ApiUrls
}

export function createInitialState(): InitialState {
    return {
        rickAndMorty: {},
        isInitialized: false,
    }
}

const initialStateKey = 'app.state.initial'

export function useInitialState(): InitialState {
    return inject(initialStateKey) as InitialState
}

export function createApp(app: VueApp, config: AppConfig): FrontOfficeApp {
    const { history, initialState, urls } = config

    app.config.performance = import.meta.env.DEV

    app.provide(initialStateKey, initialState)

    const initializedPlugin = installInitializerPlugin(app, initialState.isInitialized)

    const head = createHead()
    app.use(head)

    const router = createRouter(history)

    app.use(router)

    installEpisodesPlugin(app)

    const rickAndMortyExchange = createSSRExchange({
        isClient: !import.meta.env.SSR,
        initialState: initialState?.rickAndMorty as SSRData,
        staleWhileRevalidate: false,
    })

    const rickAndMortyClient = createClient({
        url: urls.rickAndMorty || 'https://rickandmortyapi.com/graphql',
        exchanges: [dedupExchange, cacheExchange, rickAndMortyExchange, fetchExchange],
    })

    install(app, rickAndMortyClient)


    return {
        app,
        router,
        head,
        rickAndMortyExchange,
        initializedPlugin,
    }
}
