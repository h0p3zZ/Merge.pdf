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
                    <input v-model="exportString" class="form-control" placeholder="[startIndex-endIndex, singlepageIndex, ...], ..." type="text">
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
});

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
    
    let startIndex = exportString.value.indexOf('[') + 1;
    let endIndex = exportString.value.indexOf(']');
    let docIndex: number = 0;

    while(endIndex != -1 || startIndex != 0){
        if(endIndex === -1) endIndex = exportString.value.length;
        let prevEndIndex = endIndex;

        console.log("startIndex: " + startIndex);
        console.log("nextEndIndex: " + endIndex);

        let pageString = exportString.value.substring(startIndex, endIndex);
        let arr = pageString.split('-');
        let pageStart = parseInt(arr[0]);
        let pageEnd = parseInt(arr[1]);

        console.log("pageStart: " + pageStart);
        console.log("pageEnd: " + pageEnd);

        documents[docIndex] = await PDFDocument.create();
        links[docIndex] = document.createElement('a');
        
        const copyIDs: number[] = [];

        // for the case user enters single digit in between []-brackets
        if(!isNaN(pageEnd)){
            for(let i = pageStart - 1; i < pageEnd; i++) {
                copyIDs[i + 1 - pageStart] = i;
                console.log("added page " + i);
            }
        } else{
            copyIDs[copyIDs.length] = pageStart - 1;
            console.log("added page " + (pageStart - 1));
        }
        
        const copiedPages = await documents[docIndex].copyPages(currentDoc, copyIDs);
        
        copiedPages.forEach((page) =>{
            documents[docIndex].addPage(page);
        })

        docIndex++;
        endIndex = exportString.value.indexOf(']', prevEndIndex + 1);
        startIndex = exportString.value.indexOf('[', prevEndIndex + 1) + 1;

        console.log("new start index: " + startIndex);
        console.log("new end index: " + endIndex);
    }

    links.forEach(async (link, index) => {
        const byteArray = await documents[index].save();

        link.download = `merged(${index + 1}).pdf`;
        link.href = URL.createObjectURL(new File([byteArray], "merged.pdf"));
        document.body.append(link);

        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(link.href), 7000);
    });

    exportString.value = '';
}
</script>