import {
    createRouter as vueCreateRouter,
    LocationQuery,
    LocationQueryRaw,
    RouteLocationNormalized,
    Router,
    RouteRecordRaw,
    RouterHistory,
} from 'vue-router'
import { parse, ParseOptions, stringify, StringifyOptions } from 'query-string'

export const ROUTE_HOME = 'home'
export const ROUTE_CHARACTERS = 'characters'

export const routes: RouteRecordRaw[] = [
    {
        name: ROUTE_HOME,
        path: '',
        component: () => import('@/views/Home.vue'),
    },
    {
        name: ROUTE_CHARACTERS,
        path: '/characters',
        component: () => import('@/views/Characters.vue'),
        props(route: RouteLocationNormalized) {
            const fragment = parse(route.hash.substring(1))

            return {
                characterId: typeof fragment.characterId === 'string' ? fragment.characterId : undefined
            }
        },
    },
]

export const parseOptions: ParseOptions = {
    arrayFormat: 'bracket',
    parseBooleans: true,
    parseNumbers: true,
    sort: false,
}

export const stringifyOptions: StringifyOptions = {
    arrayFormat: 'bracket',
    sort: false,
    skipEmptyString: true,
    skipNull: true,
}

export function createRouter(history: RouterHistory): Router {
    return vueCreateRouter({
        history,
        routes,
        parseQuery(query: string): LocationQuery {
            return parse(query, parseOptions) as LocationQuery
        },
        stringifyQuery(query: LocationQueryRaw): string {
            return stringify(query, stringifyOptions)
        },
    })
}
