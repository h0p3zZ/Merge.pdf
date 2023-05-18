<template>
    <!-- <div :id="'pageContainer'+index">
        <div id="viewer" class="pdfViewer"></div>
    </div> -->
    <canvas ref="canvas"></canvas>
</template>
<style scoped lang="css">
div {
    position: absolute;
}

canvas {
    border: 1px solid black;
    direction: ltr;
}
</style>
<script setup lang="ts">
import pdfjs, { PDFPageProxy } from "@bundled-es-modules/pdfjs-dist/build/pdf";
import viewer from "@bundled-es-modules/pdfjs-dist/web/pdf_viewer";
import { PropType } from "nuxt/dist/app/compat/capi";
import { PDFDocument } from "pdf-lib";

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

const props = defineProps({
    page: {
        type: Object as PropType<PDFPageProxy>,
        rquired: true,
    },
    index: {
        type: Number,
        required: true,
    },
});

const page = computed(() => props.page);

const canvas = ref<HTMLCanvasElement>();

// watch(() => props.page, pdfChanged);

let cont: HTMLDivElement;
let pdfViewer: viewer.PDFViewer;

onMounted(() => {
    // cont ??= document.getElementById("pageContainer"+props.index) as HTMLDivElement;
    // pdfViewer ??= new viewer.PDFViewer({
    //     container: cont as HTMLDivElement,
    //     eventBus: new viewer.EventBus(),
    //     linkService: new viewer.PDFLinkService(),
    //     l10n: {
    //         async getLanguage(): Promise<string> {
    //             return "en-US";
    //         },
    //         async getDirection(): Promise<string> {
    //             return "";
    //         },
    //         async get(key: any, args?: null, fallback?: any): Promise<any> {
    //             return null;
    //         },
    //         async translate(element: any): Promise<void> {

    //         }
    //     },
    //     textLayerMode: 0,
    // });
    pdfChanged();
});

async function pdfChanged() {
    //const doc = await pdfjs.getDocument(page.value).promise;
    // pdfViewer.setDocument(doc);
    //custom rendering
    if (!(page.value && canvas.value)) return;
    const viewport = page.value.getViewport({ scale: 1 });
    const context = canvas.value.getContext("2d") as CanvasRenderingContext2D;
    canvas.value.height = viewport.height;
    canvas.value.width = viewport.width;
    await page.value.render({ canvasContext: context, viewport: viewport }).promise;
}
</script>