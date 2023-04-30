<template>
    <input type="file" class="btn btn-primary" @change="onFileChanged" accept=".pdf" />
    <button @click="clicked">Test</button>
</template>
<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';

function clicked() {
    console.log("click");
}

const file = ref<File | null>();
const form = ref<HTMLFormElement>();

function readFileAsync(file: File): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as (ArrayBuffer | null));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function onFileChanged($event: Event): Promise<void> {
    console.log("file changed");
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        console.log("file valid");
        file.value = target.files[0]

        const bytes = await readFileAsync(file.value);
        if (bytes) {
            console.log("file read");
            const pdfDoc = await PDFDocument.load(bytes);
            //const firstPage = pdfDoc.getPage(0);
            const newDoc = await PDFDocument.create();
            await newDoc.copyPages(pdfDoc, [0]);
            //newDoc.addPage(test[0]);
            const byteArray = await newDoc.save();
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            console.log(url);
        }
    }
}
</script>