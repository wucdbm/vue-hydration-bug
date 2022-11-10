<template>
    <div>
        <table>
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Name</td>
                    <td>{{ character.name }}</td>
                </tr>
                <tr>
                    <td>Type</td>
                    <td>{{ character.type }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {CharacterFragment} from '@/graphql';

export default defineComponent({
    props: {
        character: {
            type: Object as PropType<CharacterFragment>,
            required: true
        }
    }
})
</script>
