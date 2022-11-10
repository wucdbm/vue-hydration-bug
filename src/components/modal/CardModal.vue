<template>
    <CharacterModal
        :open="open"
        @close="$emit('close')"
    >
        <AppCard
            closable
            :loading="loading"
            @close="$emit('close')"
        >
            <template #title>
                <slot name="title"></slot>
            </template>
            <template #default>
                <slot name="default"></slot>
            </template>
            <template
                v-if="$slots.footer"
                #footer
            >
                <slot name="footer"></slot>
            </template>
        </AppCard>
    </CharacterModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CharacterModal from '@/components/modal/Modal.vue';
import AppCard from '@/components/ui/AppCard.vue';

export default defineComponent({
    components: { AppCard, CharacterModal },
    props: {
        open: Boolean,
        loading: Boolean,
        closable: Boolean
    },
    emits: {
        close: () => true
    },
})
</script>

<style lang="scss" scoped>
:deep(.app-modal-content .app-card) {
    height: 100vh;

    @include min-width(1024) {
        height: initial;
    }

    .stone-card-content {
        max-height: calc(100vh - 140px);

        @include min-width(1024) {
            max-height: calc(80vh - 140px);
        }
    }
}
</style>
