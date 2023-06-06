<template>
    <div class="container-fluid">
        <div class="mb-3">
            <label for="file" class="form-label">{{ props.buttonName }}</label>
            <input type="file" name="file" class="btn btn-primary form-control" @change="onFileChanged"
                :accept="props.acceptedMimeTypes" value=""/>
        </div>
    </div>
</template>
<style lang="css"></style>
<script setup lang="ts">
import { LoadedFile } from './loadedFile';

const emit = defineEmits(['change']);
const props = defineProps({
    buttonName: {
        type: String,
        required: true,
    },
    acceptedMimeTypes: {
        type: String,
        required: true,
    }
});

async function onFileChanged($event: Event): Promise<void> {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        const file = new LoadedFile(target.files[0]);
        if (await file.getBytesAsync()) emit('change', file);
        target.value = "";
    }
}
</script>