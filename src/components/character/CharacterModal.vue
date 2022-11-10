<template>
    <CardModal
        closable
        :open="!!characterId"
        :loading="characterResult.fetching.value"
        @close="$emit('close')"
    >
        <template #title>
            <template v-if="character">
                {{ character.type }}
                |
                {{ character.name }}
            </template>
        </template>
        <template #default>
            {{ characterId }}
            <template v-if="characterResult.error.value">
                ERROR:
                {{ characterResult.error.value }}
            </template>
            <template v-else-if="character">
                <CharacterDetails
                    :character="character"
                />
            </template>
        </template>
        <template #footer>
            <div class="select-button-wrapper">
                <button
                    @click="selectCharacter"
                >
                    Select this Character
                </button>
            </div>
        </template>
    </CardModal>
</template>

<script lang="ts">
import { computed, defineComponent, onServerPrefetch } from 'vue';
import CardModal from '@/components/modal/CardModal.vue';
import CharacterDetails from '@/components/character/CharacterDetails.vue';
import {CharacterFragment, useGetCharacterQuery} from '@/graphql';

export default defineComponent({
    components: {
        CharacterDetails,
        CardModal,
    },
    props: {
        characterId: {
            type: String,
            required: false,
            default: () => undefined
        },
    },
    emits: {
        close: () => true,
        select: (v: CharacterFragment) => v
    },
    setup(props, {emit}) {
        const characterResult = useGetCharacterQuery({
            variables: computed(() => {
                return {
                    ids: props.characterId ? [props.characterId] : [],
                }
            }),
            pause: computed(() => !props.characterId)
        })

        const character = computed((): CharacterFragment | null | undefined => characterResult.data.value?.charactersByIds?.[0])

        const selectCharacter = () => {
            if (character.value) {
                emit('select', character.value)
            }
        }

        onServerPrefetch(async () => {
            await characterResult
        })

        return {
            characterResult,
            character,
            selectCharacter
        }
    }
})
</script>

<style lang="scss" scoped>
.select-button-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
