<template>
    <div v-if="nrOfPages">
        <div v-for="i in nrOfPages" @dragover.prevent @mouseenter="showDelete($event, parseInt(i.toString()))" 
            @mouseleave="hideDelete($event, parseInt(i.toString()))" class="container">
            <canvas :id="'page' + i" :draggable="true" @dragstart="drag($event, parseInt(i.toString()))"
                class="page">
            </canvas>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"
            :id="'deletepage' + i" class="deletion"
            @mouseenter="mouseenterdelete($event)" @mouseleave="mouseleavedelete($event)"
            @click="deletePage($event, parseInt(i.toString()))">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
            </svg>
            <div class="dropable" @drop="drop($event, parseInt(i.toString()))" @dragover.prevent
                @dragenter="dragenter($event)" @dragleave="dragleave($event)"></div>
        </div>
    </div>
</template>
<style scoped lang="css">

.container{
    position: relative;
}

.page{
    position: relative;
    left: 25%;
    align-self: center;
    width: 50%;
}

.deletion{
    fill: rgb(234, 142, 142);
    width: 40px;
    height: 40px;
    margin-right: 0px;
    position: absolute;
    top: 1%;
    left: 25%;
    visibility: hidden;
}

.deletion.dragover{
    fill: #ff0000;
}

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
import { PDFDocument } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

const props = defineProps({
    document: {
        type: Object,
    },
    triggerRefresh: {
        type: Number,
    },
});

const emit = defineEmits(['orderChanged', 'deletedPage']);

const pdfDoc = computed(() => props.document as PDFDocument);
const nrOfPages = ref<Number>();
let doc: PDFDocumentProxy;
let permutation: number[];

watch(() => props.document, pdfChanged);
watch(() => props.triggerRefresh, pdfChanged);

function drop(event: DragEvent, i: number) {
    dragleave(event);
    let data = event.dataTransfer?.getData("originalPageNumber");
    if (data) {
        const originalPageNumber = parseInt(data);

        if (originalPageNumber === i) return;

        console.log(`move ${originalPageNumber} to ${i}`);
        if (originalPageNumber < i) {
            const temp = permutation[originalPageNumber];
            permutation.copyWithin(originalPageNumber, originalPageNumber + 1, i);
            permutation[i] = temp;
            for (let x = originalPageNumber; x <= i; x++) renderPage(x);
        } else {
            const temp = permutation[originalPageNumber];
            permutation.copyWithin(i + 1, i, originalPageNumber);
            permutation[i] = temp;
            for (let x = i; x <= originalPageNumber; x++) renderPage(x);
        }

        reorderDoc(permutation);
    }
}

async function showDelete(event: Event, i: number){
    const del = document.getElementById(`deletepage${i}`) as HTMLDivElement;
    del.style.visibility = 'visible';
}

async function hideDelete(event: Event, i: number){
    const del = document.getElementById(`deletepage${i}`) as HTMLDivElement;
    del.style.visibility = 'hidden';
}

async function reorderDoc(permutation: number[]) {
    const d = pdfDoc.value;
    const pages = d.getPages();

    for (let i = 0; i < permutation.length - 1; i++) {
        d.removePage(i);
        d.insertPage(i, pages[permutation[i + 1] - 1]);
    }

    emit('orderChanged', d);
}

function drag(event: DragEvent, i: number) {
    event.dataTransfer?.setData("originalPageNumber", i.toString())
    console.log(`dragged from ${i}`);
}

function dragenter(event: DragEvent) {
    const div = event.target as HTMLDivElement;
    div.classList.add('dragover');
}

function dragleave(event: DragEvent) {
    const div = event.target as HTMLDivElement;
    div.classList.remove('dragover');
}

function mouseenterdelete(event: Event){
    const div = event.target as HTMLDivElement;
    div.classList.add('dragover');
}

function mouseleavedelete(event: Event){
    const div = event.target as HTMLDivElement;
    div.classList.remove('dragover');
}

async function deletePage(event: Event, i: number){
    pdfDoc.value.removePage(i - 1);
    emit('deletedPage', pdfDoc.value);
}

async function pdfChanged() {
    doc = await pdfjs.getDocument(await pdfDoc.value.save()).promise;
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