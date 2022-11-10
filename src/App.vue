<template>
    <router-view v-slot="{ Component }">
        <transition name="fade">
            <div
                v-if="!isInitialized"
                key="loader"
            >
                L O A D I N G
            </div>

            <div
                v-else-if="initError"
                key="init-error"
            >
                INIT ERROR
                <br>
                {{ initError }}
            </div>

            <div
                v-else
                key="content"
            >
                <router-link
                    class="button"
                    :to="{name: ROUTE_HOME}"
                >
                    Home
                </router-link>
                <router-link
                    class="button"
                    :to="{name: ROUTE_CHARACTERS}"
                >
                    Characters
                </router-link>
                <br>
                <h4>Found {{ episodes.length }} episodes</h4>
                <h5>Suppose this ^ is our dynamic menu that must be preloaded</h5>
                <br>
                <img
                    src="@/assets/vue.svg"
                    alt="Vue logo"
                >
                <br>
                <br>
                <hr>
                <br>
                <div style="border: 1px solid red; padding: 20px;">
                    <component :is="Component" />
                </div>
            </div>
        </transition>
    </router-view>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useInit} from '@/composables/app/useInit'
import {useEpisodesPlugin} from '@/plugins/episodes';
import {ROUTE_CHARACTERS, ROUTE_HOME} from '@/router';

export default defineComponent({
    name: 'App',
    setup() {
        const {
            isInitialized,
            error: initError,
        } = useInit()

        const {episodes} = useEpisodesPlugin()

        return {
            episodes,
            isInitialized,
            initError,
            ROUTE_HOME,
            ROUTE_CHARACTERS,
        }
    }
})
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.45s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-route-enter-active,
.fade-route-leave-active {
    transition: opacity 0.12s ease;
}

.fade-route-enter-from,
.fade-route-leave-to {
    opacity: 0;
}
</style>
