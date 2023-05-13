<template>
    <input type="file" class="btn btn-primary" @change="onFileChanged" accept=".pdf" />
    <button @click="clicked">Test</button>
    <div id="pageContainer">
        <div id="viewer" class="pdfViewer"></div>
    </div>
</template>

<style lang="css">
#pageContainer {
    position: absolute;
}
</style>

<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';
import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";
import viewer from "@bundled-es-modules/pdfjs-dist/web/pdf_viewer";

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

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
            const doc = await pdfjs.getDocument(byteArray).promise;
            let cont = document.getElementById("pageContainer") as HTMLDivElement;
            let pdfViewer = new viewer.PDFViewer({
                container: cont as HTMLDivElement,
                eventBus: new viewer.EventBus(),
                linkService: new viewer.PDFLinkService(),
                l10n: {
                    async getLanguage(): Promise<string> {
                        return "en-US";
                    },
                    async getDirection(): Promise<string> {
                        return "";
                    },
                    async get(key: any, args?: null, fallback?: any): Promise<any> {
                        return null;
                    },
                    async translate(element: any): Promise<void> {

                    }
                }
            });
            pdfViewer.setDocument(doc);
        }
    }
}
</script>