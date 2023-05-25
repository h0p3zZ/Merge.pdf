<template>
  <div>
      <ImportPDF @change="importChanged"></ImportPDF>
      <ExportPDF :pdfData="pdfData"></ExportPDF>
    <ClientOnly placeholder="loading...">
      <DisplayPDF :pdfData="pdfData" @order-changed="orderChanged"></DisplayPDF>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const pdfData = ref<ArrayBuffer>(new ArrayBuffer(0));

function importChanged(pdfD: ArrayBuffer) {
  pdfData.value = pdfD;
}

async function orderChanged(pdfD: Promise<Uint8Array>) {
  pdfData.value = (await pdfD).buffer;
}
</script>
