<template>
  <div>
      <ImportPDF @change="importChanged"></ImportPDF>
      <ExportPDF :pdfData="pdfData"></ExportPDF>
    <ClientOnly placeholder="loading...">
      <DisplayPDF :pdfData="pdfData"></DisplayPDF>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';

const pdf = PDFDocument.create();
const pdfData = ref<ArrayBuffer>();

function importChanged(pdfD: ArrayBuffer) {
  pdfData.value = pdfD;
}

</script>
