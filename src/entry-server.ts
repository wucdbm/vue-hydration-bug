import * as connect from 'connect'
import { createApp as createVueApp } from 'vue'
import App from '@/App.vue'
import { createApp, createInitialState, InitialState } from '@/app'
import { createMemoryHistory } from 'vue-router'
import type { AppEntryPoint, PreLoaders, ServerSideResponse, SSRManifest } from 'wite-wue-ssr-test'
import { renderApp } from 'wite-wue-ssr-test'
import { EntryConfig, ServerSideResponseData } from '@/entry-server-types'

export function withoutSuffix(string: string, suffix: string): string {
    return string.endsWith(suffix) ? string.slice(0, -1 * suffix.length) : string
}

const entryPoint: AppEntryPoint<EntryConfig> = async (
    request: connect.IncomingMessage,
    data: EntryConfig,
    template: string,
    ssrManifest?: SSRManifest,
    options?: {
        preLoaders: PreLoaders
    }
): Promise<ServerSideResponse<ServerSideResponseData>> => {
    const initialState: InitialState = createInitialState()

    const baseUrl = withoutSuffix(import.meta.env.BASE_URL, '/')
    const myApp = createApp(createVueApp(App), {
        history: createMemoryHistory(baseUrl),
        initialState,
        urls: data.urls,
    })
    const {
        app,
        router,
        head,
        rickAndMortyExchange,
        initializedPlugin,
    } = myApp

    return renderApp({
        factory: () => {
            return {
                app,
                router,
                baseUrl,
                getState: (): InitialState => {
                    return {
                        rickAndMorty: rickAndMortyExchange.extractData(),
                        isInitialized: initializedPlugin.isInitialized.value,
                    }
                },
                head: head,
                preload: true,
                preLoaders: options && options.preLoaders,
            }
        },
        replacer: (headHtmlResult, body, initialState) => {
            template = template
                .replace('<html', `<html ${headHtmlResult.htmlAttrs} `)
                .replace('<body', `<body ${headHtmlResult.bodyAttrs} `)

            template = template
                .replace(
                    /<div id="app"([\s\w\-"'=[\]]*)><\/div>/,
                    `<div id="app" data-server-rendered="true"$1>__BODY_TEMP_PLACEHOLDER__</div>\n<script>window.__INITIAL_STATE__=${initialState};</script>`
                )
                .replace('__BODY_TEMP_PLACEHOLDER__', body)

            return template
        },
        request,
        ssrManifest,
    })
}

export default entryPoint
