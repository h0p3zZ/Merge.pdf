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
const pdfData = ref<ArrayBuffer>(new ArrayBuffer(0));

function importChanged(pdfD: ArrayBuffer) {
  pdfData.value = pdfD;
}
</script>
