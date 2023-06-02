<template>
    <div class="container-fluid">
        <div class="mb-3">
            <label for="file" class="form-label">{{ buttonName }}</label>
            <input type="file" name="file" class="btn btn-primary form-control" @change="onFileChanged" accept=".pdf" />
        </div>
    </div>
</template>
<style lang="css"></style>
<script setup lang="ts">

const emit = defineEmits(['change']);
const props = defineProps({
    buttonName: {
        type: String,
        required: false,
    },
});
const buttonName = props.buttonName ?? 'Import file'

function readFileAsync(file: File): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as (ArrayBuffer | null));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function onFileChanged($event: Event): Promise<void> {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        const bytes = await readFileAsync(target.files[0]);
        if (bytes) emit('change', bytes);
        target.value = "";
    }
}
</script>