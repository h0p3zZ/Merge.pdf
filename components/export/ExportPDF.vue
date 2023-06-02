<template>
    <button class="btn btn-primary" id="btnSave" @click="saveFile" :disabled="disabled">Save</button>
</template>

<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';

//#region props and emits
const props = defineProps({
    pdfDoc: {
        type: null,
        // required: true,
    }
});
//#endregion

let currentDoc: PDFDocument;
const disabled = ref(true);

watch(() => props.pdfDoc, (newDoc) => {
    const newData = newDoc as PDFDocument;
    if (newData) {
        console.log("new data for export");
        currentDoc = newData;
        disabled.value = false;
    } else {
        disabled.value = true;
    }
})

async function saveFile($event: Event): Promise<void> {
    const link = document.createElement('a');

    const byteArray = await currentDoc.save();

    link.href = URL.createObjectURL(new File([byteArray], "merge.pdf"));
    link.download = "merged.pdf";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
}
</script>