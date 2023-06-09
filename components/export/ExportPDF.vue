<template>
    <div class="container-fluid">
        <button @click="showDialog = true" class="btn btn-primary" :disabled="disabled">Save</button>
    </div>

    <!-- Toast for the Toast Service - used for the error messages -->
    <p-toast/>
    <p-dialog :visible="showDialog" header="Save dialog" modal :closable="false" :draggable="false" style="width: 50vw">
        <p>Type the files you want to export in the format [startIndex-endIndex, singlepageIndex, etc.], [etc.],
                        etc.
                        - each [] is a seperate file and both startIndex and endIndex are included in ranges.</p>
                    <p>Leaving it blank will export the whole pdf as a single file.</p>
                    <input v-model="exportString" class="form-control"
                        placeholder="[startIndex-endIndex, singlepageIndex, etc.], etc." type="text">
        <template #footer>
            <button @click="showDialog = false" class="btn btn-secondary">Cancel</button>
            <button @click="saveFile" class="btn btn-primary">Save</button>
        </template>
    </p-dialog>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';

import { PDFDocument } from 'pdf-lib';
import { exportPDF } from '~/methods/export/exportPDF';

//#region props and emits
const props = defineProps({
    pdfDoc: {
        type: Object,
    },
});
//#endregion

let currentDoc: PDFDocument;
const disabled = ref(true);
const showDialog = ref(false);
const exportString = ref<string>('');

const toastService = useToast();

/**
 * This watches for changes in the PDF document.
 * Used to enable/disable the Save button (that opens the dialog).
 */
watch(() => props.pdfDoc, (newDoc) => {
    const newData = newDoc as PDFDocument;
    if (newData) {
        currentDoc = newData;
        disabled.value = false;
    } else {
        disabled.value = true;
    }
});

/**
 * This function is called when the click event on the Save button (of the dialog) is triggered.
 */
async function saveFile() {
    const errorMessage: string | null = await exportPDF(exportString.value, currentDoc);
    if (errorMessage) {
        toastService.add({ severity: "error", summary: errorMessage, life: 7000, closable: true});
        return;
    }
    exportString.value = '';
    showDialog.value = false;
}
</script>