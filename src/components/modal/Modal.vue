<template>
    <Fixed :class="{ open }">
        <template #default>
            <div
                class="app-modal-overlay"
            ></div>
            <div class="app-modal-content">
                <div ref="contentWrapper">
                    <slot
                        name="default"
                    ></slot>
                </div>
            </div>
        </template>
    </Fixed>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import Fixed from '@/components/modal/Fixed.vue';
import {onClickOutside} from '@vueuse/core';

export default defineComponent({
    components: {Fixed},
    props: {
        open: Boolean
    },
    emits: {
        close: () => true,
    },
    setup(props, {emit}) {
        const contentWrapper = ref()

        onClickOutside(contentWrapper, (e) => {
            if (props.open) {
                e.stopPropagation()
                emit('close')
            }
        })

        return {
            contentWrapper,
        }
    }
})
</script>

<style lang="scss" scoped>
.fixed-container {
    display: none;

    &.open {
        display: block;
    }

    .app-modal-overlay {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: rgba(0 0 0 / 30%);
        position: fixed;
        z-index: 201;
    }

    .app-modal-content {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: auto;
        overflow: hidden;
        flex-direction: column;
        z-index: 202;

        @include min-width(1024) {
            width: 100%;
            max-width: 1040px;
            // todo maybe delete this max-height as it's not really necessary?
            max-height: 80vh;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            display: flex;
            justify-content: center;
        }
    }
}
</style>
