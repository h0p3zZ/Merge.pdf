<template>
    <button class="btn btn-primary" id="btnSave" @click="saveFile" :disabled="disabled">Save</button>
</template>

<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';

//#region props and emits
const props = defineProps({
    pdfData: {
        type: ArrayBuffer,
        required: true,
    }
});
//#endregion

const pdfData = ref<ArrayBuffer>(new ArrayBuffer(0));
const disabled = ref(true);

watch(() => props.pdfData, (newData) => {
    if(newData && newData.byteLength > 0) {
        pdfData.value = newData;
        disabled.value = false;
    } else {
        disabled.value = true;
    }
})

async function saveFile($event: Event): Promise<void>{
    const link = document.createElement('a');

    const pdfDoc = await PDFDocument.load(pdfData.value);
    const byteArray = await pdfDoc.save();

    link.href = URL.createObjectURL(new File([byteArray], "merge.pdf"));
    link.download = "merged.pdf";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
}
</script>