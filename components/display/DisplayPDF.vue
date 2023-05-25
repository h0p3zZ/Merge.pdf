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

const pdfData = computed(() => props.pdfData);
const nrOfPages = ref<Number>();
let doc: PDFDocumentProxy;
let permutation: number[];

watch(() => props.pdfData, pdfChanged);

function drop(event: DragEvent, i: number) {
    // let data = event.dataTransfer?.getData("originalPageNumber");
    // if (data) {
    //     const originalPageNumber = parseInt(data);
    //     const originalPage = permutation[originalPageNumber - 1];
    //     permutation[originalPageNumber - 1] = permutation[i - 1];
    //     permutation[i - 1] = originalPage;
    //     console.log(`dropped ${originalPage} at ${i}`);
    //     renderPage(i);
    //     renderPage(originalPageNumber);
    // }
    dragleave(event);
    let data = event.dataTransfer?.getData("originalPageNumber");
    if (data) {
        const originalPageNumber = parseInt(data);

        if (originalPageNumber === i) return;

        // move originalPageNumber to index i
        // move rest of the pages in direction of i (up or down)

        const diff = originalPageNumber < i ? -1 : +1;

        // when i is smaller (further up the pagelist) diff is positive
        // when i is bigger (further down the pagelist) diff is negative

        console.log(`dropped ${originalPageNumber} at ${i}`);
        let prev = permutation[i + 1];
        permutation[i + 1] = permutation[originalPageNumber];
        renderPage(i + 1);
        let x = i;
        let inbounds = true;
        while (inbounds) {
            const current = permutation[x];
            permutation[x] = prev;
            prev = current;
            renderPage(x);

            x += diff;
            if (diff > 0) {
                inbounds = (x < originalPageNumber);
            } else {
                inbounds = (x > originalPageNumber);
            }
        }

        permutation[originalPageNumber] = permutation[i];
        renderPage(originalPageNumber);

        // const originalPage = permutation[originalPageNumber - 1];

        // let x = originalPageNumber;


        // permutation[originalPageNumber - 1] = permutation[i - 1];
        // permutation[i - 1] = originalPage;
        // console.log(`dropped ${originalPage} at ${i}`);
        // renderPage(i);
        // renderPage(originalPageNumber);
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