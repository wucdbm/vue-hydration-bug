<template>
    <div>
        Characters Page

        <br>
        <br>

        <div v-if="selectedCharacter">
            <h1>Selected Character: {{ selectedCharacter.name }}</h1>

            <br>
            <br>
        </div>

        <div v-if="charactersResult.fetching.value">
            LOADING
        </div>
        <table v-else-if="charactersResult.data.value?.characters">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>View</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(char, key) in charactersResult.data.value.characters.results"
                    :key="key"
                >
                    <td>{{ char?.id }}</td>
                    <td>{{ char?.type }}</td>
                    <td>{{ char?.name }}</td>
                    <td>
                        <router-link
                            class="button"
                            :to="viewCharacter(char)"
                        >
                            View {{ char?.id }}
                        </router-link>
                    </td>
                </tr>
            </tbody>
        </table>

        <CharacterModal
            :character-id="characterId"
            @close="closeCharacterPopup"
            @select="selectCharacter"
        />
    </div>
</template>

<script lang="ts">
import {defineComponent, onServerPrefetch, ref, Ref} from 'vue';
import {CharacterFragment, useCharactersQuery} from '@/graphql';
import {LocationAsRelativeRaw, RouteQueryAndHash, useRouter} from 'vue-router';
import {ROUTE_CHARACTERS} from '@/router';
import CharacterModal from '@/components/character/CharacterModal.vue';
import {stringify} from 'query-string';

export default defineComponent({
    components: {CharacterModal},
    props: {
        characterId: {
            type: String,
            required: false,
            default: () => undefined
        }
    },
    setup() {
        const router = useRouter()
        const charactersResult = useCharactersQuery({})
        const selectedCharacter: Ref<CharacterFragment | null> = ref(null)

        const viewCharacter = (char: CharacterFragment | null | undefined): LocationAsRelativeRaw & RouteQueryAndHash => {
            if (!char) {
                return {
                    name: ROUTE_CHARACTERS,
                }
            }

            return {
                name: ROUTE_CHARACTERS,
                hash: char.id ? `#${stringify({characterId: char.id})}` : undefined,
            }
        }

        const closeCharacterPopup = () => {
            router.push({
                name: ROUTE_CHARACTERS
            })
        }

        const selectCharacter = (char: CharacterFragment | null | undefined): void => {
            if (!char) {
                return
            }

            selectedCharacter.value = char

            router.push({
                name: ROUTE_CHARACTERS
            })
        }

        onServerPrefetch(async () => {
            await charactersResult
        })

        return {
            charactersResult,
            viewCharacter,
            closeCharacterPopup,
            selectedCharacter,
            selectCharacter,
        }
    }
})
</script>
