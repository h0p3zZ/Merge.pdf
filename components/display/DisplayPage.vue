<template>
    <!-- <div :id="'pageContainer'+index">
        <div id="viewer" class="pdfViewer"></div>
    </div> -->
    <!-- <canvas ref="canvas"></canvas> -->
    <div ref="viewerContainer" class="pdfViewer singlePageView"></div>
</template>
<style scoped lang="css">
/* .pdfViewer {
    position: absolute;
} */

canvas {
    border: 1px solid black;
    direction: ltr;
}
</style>
<script setup lang="ts">
import pdfjs, { PDFPageProxy, PDFDocumentProxy } from "@bundled-es-modules/pdfjs-dist/build/pdf";
import viewer from "@bundled-es-modules/pdfjs-dist/web/pdf_viewer";
import { PropType } from "nuxt/dist/app/compat/capi";
import { PDFDocument } from "pdf-lib";
import { PDFViewer } from "@bundled-es-modules/pdfjs-dist/web/pdf_viewer";

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

const props = defineProps({
    pdfData: {
        type: ArrayBuffer,
        rquired: true,
    },
    index: {
        type: Number,
        required: true,
    },
});

const pdfData = computed(() => props.pdfData);

const canvas = ref<HTMLCanvasElement>();
const viewerContainer = ref<HTMLDivElement>();

let cont: HTMLDivElement;
let pdfViewer: viewer.PDFPageView;

const eventBus = new viewer.EventBus();

onMounted(() => {
    pdfChanged();
});

async function pdfChanged() {
    if (!viewerContainer.value || !pdfData.value) return;
    // cont ??= document.getElementById("pageContainer"+props.index) as HTMLDivElement;

    const tempPdf = new Uint8Array(new ArrayBuffer(pdfData.value.byteLength));
    tempPdf.set(new Uint8Array(pdfData.value));
    const pdf = await pdfjs.getDocument(tempPdf).promise;
    const page = await pdf.getPage(1);

    pdfViewer ??= new viewer.PDFPageView({
        container: viewerContainer.value,
        id: props.index,
        scale: 1,
        defaultViewport: page.getViewport({ scale: 1 }),
        eventBus,
        textLayerMode: 0,
    });

    pdfViewer.setPdfPage(page);
    await pdfViewer.draw();

    //const doc = await pdfjs.getDocument(page.value).promise;
    // pdfViewer.setDocument(doc);

    //custom rendering
    // if (!(page.value && canvas.value)) return;
    // const viewport = page.value.getViewport({ scale: 1 });
    // const context = canvas.value.getContext("2d") as CanvasRenderingContext2D;
    // canvas.value.height = viewport.height;
    // canvas.value.width = viewport.width;
    // await page.value.render({ canvasContext: context, viewport: viewport }).promise;
}
</script>