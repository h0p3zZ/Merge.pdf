<template>
    <div v-if="nrOfPages">
        <!-- For loop to display all pages -->
        <div v-for="i in nrOfPages" @dragover.prevent @mouseenter="showDelete" @mouseleave="hideDelete" class="container"
            :key="'pageDiv' + i">
            <canvas :id="'page' + i" :draggable="true" @dragstart="drag($event, +i)" class="page">
            </canvas>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="deletion" @click="deletePage(+i)">
                <path
                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                <path
                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
            </svg>
            <!-- Dropable is where the PDF page can be dropped to -->
            <div class="dropable" @drop="drop($event, +i)" @dragover.prevent @dragenter="dragenter" @dragleave="dragleave">
            </div>
        </div>
    </div>
</template>
<style scoped lang="css">
.container {
    position: relative;
}

.page {
    position: relative;
    left: 25%;
    align-self: center;
    width: 50%;
}

.deletion {
    fill: rgb(234, 142, 142);
    width: 40px;
    height: 40px;
    margin-right: 0px;
    position: absolute;
    top: 1%;
    left: 25%;
    visibility: hidden;
}

.deletion:hover {
    fill: #ff0000;
}

.dropable {
    height: 15px;
    background-color: #CECECE;
}

.dropable.dragover {
    background-color: #FFFFFF;
}
</style>
<script setup lang="ts">
import pdfjs, { PDFDocumentProxy } from "@bundled-es-modules/pdfjs-dist/build/pdf";
import { PDFDocument } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

const props = defineProps({
    pdfDoc: {
        type: Object,
    },
    triggerRefresh: {
        type: Number,
    },
});

const emit = defineEmits(['deletedPage']);

const currentDoc = computed(() => props.pdfDoc as PDFDocument);
const nrOfPages = ref<Number>();
let doc: PDFDocumentProxy;
let permutation: number[];

watch(() => props.pdfDoc, pdfChanged);
watch(() => props.triggerRefresh, pdfChanged);

/**
 * @param event Event is the DragEvent that has the information of the Drag from the PDF page.
 * @param index The index of the DIV-Element where the PDF page is dropped to.
 * 
 * @summary This is the function that is called after a PDF page has been dropped to any DIV-Element.
 */
function drop(event: DragEvent, index: number) {
    dragleave(event);
    let data = event.dataTransfer?.getData("originalPageNumber");
    if (data) {
        const originalPageNumber = parseInt(data);

        if (originalPageNumber === index) return;

        if (originalPageNumber < index) {
            const temp = permutation[originalPageNumber];
            permutation.copyWithin(originalPageNumber, originalPageNumber + 1, index + 1);
            permutation[index] = temp;
            for (let x = originalPageNumber; x <= index; x++) renderPage(x);
        } else {
            const temp = permutation[originalPageNumber];
            permutation.copyWithin(index + 1, index, originalPageNumber);
            permutation[index] = temp;
            for (let x = index; x <= originalPageNumber; x++) renderPage(x);
        }

        reorderDoc(permutation);
    }
}

/**
 * @param event The Event that appears on mouse enter of a PDF page.
 * 
 * @summary Uses the target of the event to change visibility of the SVG to visible.
 */
async function showDelete(event: Event) {
    const div = event.target as HTMLDivElement;
    const del = div.getElementsByClassName("deletion")[0] as SVGElement;
    if (!del) return;
    del.style.visibility = 'visible';
}

/**
 * @param event The Event that appears on mouse leave of a PDF page.
 * 
 * @summary Uses the target of the event to change visibility of the SVG to hidden.
 */
async function hideDelete(event: Event) {
    const div = event.target as HTMLDivElement;
    const del = div.getElementsByClassName("deletion")[0] as SVGElement;
    if (!del) return;
    del.style.visibility = 'hidden';
}

/**
 * @param permutation The permutation array that stores the changes of the PDF pages.
 * 
 * @summary Uses the permuation array to reorder the PDF Object with deleting and re-inserting the pages at the correct position.
 */
async function reorderDoc(permutation: number[]) {
    const d = currentDoc.value;
    const pages = d.getPages();

    for (let i = 0; i < permutation.length - 1; i++) {
        d.removePage(i);
        d.insertPage(i, pages[permutation[i + 1] - 1]);
    }
}

/**
 * @param event DragEvent that is sent when the drag starts.
 * @param index Index of the Element that is dragged.
 * 
 * @summary Sets the index of the object as dataTransfer.
 */
function drag(event: DragEvent, index: number) {
    event.dataTransfer?.setData("originalPageNumber", index.toString());
}

/**
 * @param event The Event that appears on mouse enter when a page is dragged.
 * 
 * @summary Adds class 'dragover' to the target of the @param event.
 */
function dragenter(event: DragEvent) {
    const div = event.target as HTMLDivElement;
    div.classList.add('dragover');
}

/**
 * @param event The Event that appears on mouse leave when a page is dragged.
 * 
 * @summary Removes class 'dragover' to the target of the @param event.
 */
function dragleave(event: DragEvent) {
    const div = event.target as HTMLDivElement;
    div.classList.remove('dragover');
}

/**
 * @param index Index of the page that should be removed.
 * 
 * @summary Removes the page with the index @param index and emits the  @emits deletedPage.
 */
async function deletePage(index: number) {
    currentDoc.value.removePage(index - 1);
    emit('deletedPage');
}

/**
 * @summary Parses the @field currentDoc to a PDFDocumentProxy, creates the permutation array and triggers rendering for all pages.
 */
async function pdfChanged() {
    doc = await pdfjs.getDocument(await currentDoc.value.save()).promise;
    nrOfPages.value = doc.numPages;
    permutation = Array.from({ length: doc.numPages + 1 }, (_, index) => index);

    // custom rendering
    for (let i = 1; i <= doc.numPages; i++) {
        renderPage(i);
    }
}

/**
 * @param index Index of the page that shouldbe rendered.
 * 
 * @summary Gets the page from the PDF document (@field doc) and renders it into a canvas.
 */
async function renderPage(index: number) {
    const page = await doc.getPage(permutation[index]);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.getElementById(`page${index}`) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
}

</script>