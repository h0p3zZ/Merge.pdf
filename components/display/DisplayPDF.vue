<template>
    <div v-if="nrOfPages">
        <DisplayPage v-for="i in nrOfPages" :pdfData="pdfData" :key="i" :index="1"></DisplayPage>
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
import pdfjs, { PDFDocumentProxy, PDFPageProxy } from "@bundled-es-modules/pdfjs-dist/build/pdf";
import viewer from "@bundled-es-modules/pdfjs-dist/web/pdf_viewer";
import { PDFDocument, PDFPage } from "pdf-lib";

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

const props = defineProps({
    pdfData: {
        type: ArrayBuffer,
        required: true,
    },
});

const pdfData = computed(() => props.pdfData);
const nrOfPages = ref<Number>();

watch(() => props.pdfData, pdfChanged);

onMounted(() => {
    
    //pdfChanged();
});


async function pdfChanged() {
    const tempPdf = new Uint8Array(new ArrayBuffer(pdfData.value.byteLength));
    tempPdf.set(new Uint8Array(pdfData.value));

    const doc = await pdfjs.getDocument(tempPdf).promise;
    nrOfPages.value = doc.numPages;
    
    // for (let i = 1; i <= doc.numPages; i++) {
    //     arr[i] = await doc.getPage(i);
    // }

    // pages.value = arr;

    // const arr = new Array<ArrayBuffer>(doc.getPageCount());
    
    // for (let i = 0; i < doc.getPageCount(); i++) {
    //     const newDoc = await PDFDocument.create();
    //     const copiedPages = await newDoc.copyPages(doc, [i]);
    //     copiedPages.forEach((page) => newDoc.addPage(page));
    //     //newDoc.addPage(copiedPages[0]);
    //     const byteArray = await newDoc.save();
    //     arr[i] = byteArray;
    // }
    // pagesData.value = arr;

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