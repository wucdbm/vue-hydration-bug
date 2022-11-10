import { App, computed, ComputedRef, inject, ref } from 'vue'

export type InitializerPlugin = {
    isInitialized: ComputedRef<boolean>
    initialize: () => void
}

const key = 'app.plugin.initialized'

export function installInitializerPlugin(app: App, init: boolean): InitializerPlugin {
    const initialized = ref(init)

    const plugin: InitializerPlugin = {
        isInitialized: computed(() => initialized.value),
        initialize: () => {
            initialized.value = true
        },
    }

    app.provide(key, plugin)

    return plugin
}

export function useInitializedPlugin(): InitializerPlugin {
    return inject(key) as InitializerPlugin
}
