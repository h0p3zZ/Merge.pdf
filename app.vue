<template>
  <div>
      <ImportPDF @change="importChanged"></ImportPDF>
      <ImportPDF @change="mergeFileChanged" buttonName="Add another file"></ImportPDF>
      <ExportPDF :pdfDoc="currentPdf"></ExportPDF>
    <ClientOnly placeholder="loading...">
      <DisplayPDF :document="currentPdf" :triggerRefresh="triggerRefresh.valueOf()" @order-changed="orderChanged" ref="displayComponent"></DisplayPDF>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';

const currentPdf = ref<PDFDocument>(PDFDocument.prototype);
const triggerRefresh = ref<Number>(0);

async function importChanged(pdfD: ArrayBuffer) {
  currentPdf.value = await PDFDocument.load(pdfD);
}

async function mergeFileChanged(secondPdf: ArrayBuffer) {
  const pdf1 = currentPdf.value;
  const pdf2 = await PDFDocument.load(secondPdf);
  // const indices = Array.from({length: pdf2.getPageCount()}, (_, i) => i + 1);
  const indices = [...Array(pdf2.getPageCount()).keys()];
  console.log(`${pdf2.getPageCount()} pages, indices ${indices}`);
  const newPages = await pdf1.copyPages(pdf2, indices);
  newPages.forEach((page, i, _) => pdf1.addPage(page));
  triggerRefresh.value = triggerRefresh.value.valueOf() + 1;
}

async function orderChanged(pdfD: PDFDocument) {
  console.log("order changed");
  currentPdf.value = pdfD;
}
</script>
