<template>
    <!-- <canvas id="my-canvas"></canvas> -->
    <div id="pageContainer">
        <div id="viewer" class="pdfViewer"></div>
    </div>
</template>
<style lang="css">
#pageContainer {
    position: absolute;
}

/* #my-canvas {
    border: 1px solid black;
    direction: ltr;
} */
</style>
<script setup lang="ts">
import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";
import viewer from "@bundled-es-modules/pdfjs-dist/web/pdf_viewer";

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

const props = defineProps({
    pdfData: {
        type: ArrayBuffer,
        required: true,
    },
});

const pdfData = computed(() => props.pdfData);

watch(() => props.pdfData, pdfChanged);

let cont: HTMLDivElement;
let pdfViewer: viewer.PDFViewer;

async function pdfChanged() {
    cont ??= document.getElementById("pageContainer") as HTMLDivElement;
    pdfViewer ??= new viewer.PDFViewer({
        container: cont as HTMLDivElement,
        eventBus: new viewer.EventBus(),
        linkService: new viewer.PDFLinkService(),
        l10n: {
            async getLanguage(): Promise<string> {
                return "en-US";
            },
            async getDirection(): Promise<string> {
                return "";
            },
            async get(key: any, args?: null, fallback?: any): Promise<any> {
                return null;
            },
            async translate(element: any): Promise<void> {

            }
        },
        textLayerMode: 0
    });

    const tempPdf = new Uint8Array(new ArrayBuffer(pdfData.value.byteLength));
    tempPdf.set(new Uint8Array(pdfData.value));

    const doc = await pdfjs.getDocument(tempPdf as ArrayBuffer).promise;
    pdfViewer.setDocument(doc);

    // custom rendering
    // const page1 = await doc.getPage(1);
    // const viewport = page1.getViewport({ scale: 1 });
    // const canvas = document.getElementById("my-canvas") as HTMLCanvasElement;
    // const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    // canvas.height = viewport.height;
    // canvas.width = viewport.width;
    // console.log(`height: ${canvas.height}, width: ${canvas.width}`);
    // await page1.render({ canvasContext: context, viewport: viewport }).promise;
}
</script>