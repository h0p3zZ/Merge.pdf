<template>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" :disabled="disabled">Save</button>

    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Save dialogue</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Type the files you want to export in the format [startIndex-endIndex, singlepageIndex, ...], [...],
                        ...
                        - each [] is a seperate file</p>
                    <p>Leaving it blank will export the whole pdf as a single file.</p>
                    <input :value="exportString" hint="[startIndex-endIndex, singlepageIndex, ...], ..." type="text">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button @click="saveFile" type="button" class="btn btn-primary" data-bs-dismiss="modal">Save</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';

//#region props and emits
const props = defineProps({
    pdfDoc: {
        type: Object,
    },
});
//#endregion

let currentDoc: PDFDocument;
const disabled = ref(true);

const exportString = ref<String>('');

watch(() => props.pdfDoc, (newDoc) => {
    const newData = newDoc as PDFDocument;
    if (newData) {
        currentDoc = newData;
        disabled.value = false;
    } else {
        disabled.value = true;
    }
})

async function saveFile() {
    const links: HTMLAnchorElement[] = [];
    const documents: PDFDocument[] = [];

    if (exportString.value === '') {
        const link = document.createElement('a');

        const byteArray = await currentDoc.save();

        link.download = "merged.pdf";
        link.href = URL.createObjectURL(new File([byteArray], "merged.pdf"));
        document.body.append(link);
        
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);

        return;
    }

    // ToDo: import ExportString splitting here.

    links.forEach(async (link, index) => {
        link.download = `merged(${index + 1}).pdf`;
        document.body.append(link);
        link.click();

        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);

        const byteArray = await documents[index].save();

        link.href = URL.createObjectURL(new File([byteArray], "merged.pdf"));
    });

    exportString.value = '';
}
</script>