<template>
    <div
        class="app-card"
    >
        <div class="app-card-header">
            <div
                class="app-card-header-title"
            >
                <span v-if="loading">
                    Loading
                </span>
                <slot
                    v-else
                    name="title"
                ></slot>
            </div>
            <div
                v-if="closable"
                class="stone-modal-close"
                @click.stop="$emit('close')"
            >
                <button type="button">
                    Close
                </button>
            </div>
        </div>

        <div
            class="app-card-content"
        >
            <LoadingAnimation
                v-if="loading"
                style="padding-bottom: 50px;"
            />
            <slot
                v-else
                name="default"
            ></slot>
        </div>

        <div
            v-if="$slots.footer && !loading"
            class="app-card-footer"
        >
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LoadingAnimation from '@/components/loading/LoadingAnimation.vue';

export default defineComponent({
    components: {LoadingAnimation},
    props: {
        closable: Boolean,
        loading: Boolean,
    },
    emits: {
        close: () => true
    },
})
</script>

<style lang="scss" scoped>
.app-card {
    background: #fff;

    @include min-width(1024) {
        background: rgba(252 246 234);
    }

    .app-card-header {
        width: 100%;
        height: 50px;
        border-bottom: 1px solid rgb(234 233 232);
        background: rgb(252 246 234);
        position: sticky;
        top: 0;
        left: 0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;

        .app-card-header-title {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05rem;
            color: rgb(74 78 84);
            font-weight: 400;
        }

        .stone-modal-close {
            position: absolute;
            top: 0;
            right: 0;
            width: 50px;
            height: 50px;
            background: transparent;
            border: none;
            display: block;
            font-size: 0;
            cursor: pointer;

            &::before {
                width: 50px;
                height: 50px;
                display: block;
                text-align: center;
                line-height: 50px;
                content: "X";
                font-size: 18px;
            }
        }
    }

    .app-card-content {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .app-card-footer {
        width: 100%;
        min-height: 90px;
        padding: 20px 0;
        border-top: 1px solid rgb(234 233 232);
        background: #fff;
        position: sticky;
        bottom: 0;
        left: 0;
        flex-shrink: 0;
        z-index: 2;

        @include min-width(1024) {
            background: rgb(252 246 234);
        }
    }
}
</style>
