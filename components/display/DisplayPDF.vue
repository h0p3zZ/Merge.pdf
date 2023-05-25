<template>
    <div v-if="nrOfPages">
        <div v-for="i in nrOfPages" @dragover.prevent>
            <canvas :id="'page' + i" :draggable="true" @dragstart="drag($event, parseInt(i.toString()))"></canvas>
            <div class="dropable" @drop="drop($event, parseInt(i.toString()))" @dragover.prevent
             @dragenter="dragenter($event)" @dragleave="dragleave($event)"></div>
        </div>
    </div>
</template>
<style scoped lang="css">
.dropable {
    height: 15px;
    background-color: #CECECE;
}

.dropable.dragover {
    background-color: black;
    width: 110%;
}
</style>
<script setup lang="ts">
import pdfjs, { PDFDocumentProxy } from "@bundled-es-modules/pdfjs-dist/build/pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

const props = defineProps({
    pdfData: {
        type: ArrayBuffer,
        required: true,
    },
});

const emit = defineEmits(['orderChanged']);

const pdfData = computed(() => props.pdfData);
const nrOfPages = ref<Number>();
let doc: PDFDocumentProxy;
let permutation: number[];

watch(() => props.pdfData, pdfChanged);

function drop(event: DragEvent, i: number) {
    dragleave(event);
    let data = event.dataTransfer?.getData("originalPageNumber");
    if (data) {
        const originalPageNumber = parseInt(data);

        if (originalPageNumber === i) return;

        if (originalPageNumber < i) {
            const temp = permutation[i];
            permutation.copyWithin(originalPageNumber + 1, originalPageNumber, i);
            permutation[originalPageNumber] = temp;
            for (let x = originalPageNumber; x <= i; x++) renderPage(x);
        } else {
            const temp = permutation[originalPageNumber];
            permutation.copyWithin(i + 1, i, originalPageNumber);
            permutation[i] = temp;
            for (let x = i; x <= originalPageNumber; x++) renderPage(x);
        }

        // emit('orderChanged', doc.saveDocument());
    }
}

function drag(event: DragEvent, i: number) {
    event.dataTransfer?.setData("originalPageNumber", i.toString())
    console.log(`dragged from ${i}`);
}

function dragenter(event: DragEvent) {
    const div = event.target as HTMLDivElement;
    div.classList.add('dragover');
}

function dragleave(event: DragEvent){
    const div = event.target as HTMLDivElement;
    div.classList.remove('dragover');
}

async function pdfChanged() {
    doc = await pdfjs.getDocument(pdfData.value).promise;
    nrOfPages.value = doc.numPages;
    permutation = Array.from({ length: doc.numPages + 1 }, (_, index) => index);

    // custom rendering
    for (let i = 1; i <= doc.numPages; i++) {
        renderPage(i);
    }
}

async function renderPage(i: number) {
    const page = await doc.getPage(permutation[i]);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.getElementById(`page${i}`) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
}

</script>