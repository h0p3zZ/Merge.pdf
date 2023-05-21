<template>
  <div>
      <ImportPDF @change="importChanged"></ImportPDF>
      <ExportPDF :pdfData="pdfData"></ExportPDF>
    <ClientOnly placeholder="loading...">
      <DisplayPDF :pdfData="pdfData" :pdf-doc="pdf"></DisplayPDF>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';
import pdfjs, { PDFPageProxy, PDFDocumentProxy } from "@bundled-es-modules/pdfjs-dist/build/pdf";

const pdf = ref<PDFDocumentProxy>();
const pdfData = ref<ArrayBuffer>(new ArrayBuffer(0));

async function importChanged(pdfD: ArrayBuffer) {
  pdfData.value = pdfD;
  pdf.value = await pdfjs.getDocument(pdfD).promise;
}

</script>
