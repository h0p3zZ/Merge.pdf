<template>
    <input type="file" class="btn btn-primary" @change="onFileChanged" accept=".pdf" />
    <button @click="clicked">Test</button>
    <div id="pageContainer">
        <div id="viewer" class="pdfViewer"></div>
    </div>
</template>
<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';
import pdfjsLib from "pdfjs-dist";
import { EventBus, PDFLinkService, PDFViewer } from "pdfjs-dist/web/pdf_viewer";
import { IL10n } from "pdfjs-dist/types/web/interfaces";

function clicked() {
    console.log("click");
}

const file = ref<File | null>();
const form = ref<HTMLFormElement>();

function readFileAsync(file: File): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as (ArrayBuffer | null));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function onFileChanged($event: Event): Promise<void> {
    console.log("file changed");
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        console.log("file valid");
        file.value = target.files[0]

        const bytes = await readFileAsync(file.value);
        if (bytes) {
            console.log("file read");
            const pdfDoc = await PDFDocument.load(bytes);
            console.log("pages: " + pdfDoc.getPageCount());
            //const firstPage = pdfDoc.getPage(0);
            const newDoc = await PDFDocument.create();
            await newDoc.copyPages(pdfDoc, [0]);
            //newDoc.addPage(test[0]);
            const byteArray = await newDoc.save();
            const doc = await pdfjsLib.getDocument(byteArray).promise;
            let cont = document.getElementById("pageContainer") as HTMLDivElement;
            let pdfViewer = new PDFViewer({
                container: cont as HTMLDivElement,
                eventBus: new EventBus(),
                linkService: new PDFLinkService(),
                l10n: new IL10n()
            });
            pdfViewer.setDocument(doc);
        }
    }
}
</script>