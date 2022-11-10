import { createApp, createInitialState, InitialState } from '@/app'
import { createSSRApp, createApp as vueCreateApp } from 'vue'
import App from '@/App.vue'
import { createWebHistory } from 'vue-router'
import { provideRedirect, useClientRedirect } from 'wite-wue-ssr-test'
import { deserializeState } from 'wite-wue-ssr-test'
import { createSetStatusState, provideSetStatus } from 'wite-wue-ssr-test';
import { ApiUrls, PublicConfig } from '@/entry-server-types';


let initialStateDeserialized = false

let initialState: InitialState

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window.__INITIAL_STATE__) {
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        initialState = deserializeState(window.__INITIAL_STATE__ || '{}') as InitialState

        initialStateDeserialized = true
    } catch (e) {
        initialState = createInitialState()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-console
        console.error('Failed to parse initial state', e, window.__INITIAL_STATE__ || '{}')
    }
} else {
    initialState = createInitialState()
}

let urls: ApiUrls = {
    rickAndMorty: undefined
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window.__APP_CONFIG__) {
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const config = deserializeState(window.__APP_CONFIG__ || '{}') as PublicConfig
        urls = config.urls
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-console
        console.error('Failed to parse App Config', e, window.__APP_CONFIG__ || '{}')
    }
}

const container = document.getElementById('app')
const isSSR = container && container.getAttribute('data-server-rendered') === 'true'

const {
    app,
    router,
} = createApp(
    isSSR ? createSSRApp(App) : vueCreateApp(App),
    {
        history: createWebHistory(import.meta.env.BASE_URL),
        initialState,
        urls,
    }
)

const redirect = useClientRedirect((location, status) => {
    const redirect = status === 301 ? router.replace : router.push;

    redirect(location)
        // eslint-disable-next-line no-console
        .catch(console.warn)
})

provideRedirect(app, redirect)

const statusState = createSetStatusState()
provideSetStatus(app, statusState)

if (!initialStateDeserialized) {
    // eslint-disable-next-line no-console
    console.log('App was not hydrated, fetch initial data via the API')
}

router
    .isReady()
    .then(() => {
        app.mount('#app', true)
    })
