<template>
    <input type="file" class="btn btn-primary" @change="onFileChanged" accept=".pdf" />
</template>

<script setup lang="ts">

const emit = defineEmits(['change']);

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
    }
}
</script>