<template>
    <input type="file" class="btn btn-primary" @change="onFileChanged" accept=".pdf" />
    <button class="btn btn-primary" id="btnSave" @click="saveFile">Save</button>
    <!-- <canvas id="my-canvas"></canvas> -->
    <div id="pageContainer">
        <div id="viewer" class="pdfViewer"></div>
    </div>
</template>

<style lang="css">
#pageContainer {
    position: absolute;
}

/* #my-canvas {
    border: 1px solid black;
    direction: ltr;
} */
</style>
<script setup lang="ts">
import { PDFDocument } from 'pdf-lib';
import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";
import viewer from "@bundled-es-modules/pdfjs-dist/web/pdf_viewer";

pdfjs.GlobalWorkerOptions.workerSrc = "_nuxt/node_modules/@bundled-es-modules/pdfjs-dist/build/pdf.worker.js";

// const btnSave = document.getElementById("btnSave");
// btnSave?.addEventListener("click", function save(event){
//     console.log("click");
// });

let cont: HTMLDivElement;
let pdfViewer: viewer.PDFViewer;
let pdfData: ArrayBuffer;

function readFileAsync(file: File): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as (ArrayBuffer | null));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function saveFile($event: Event): Promise<void>{
    console.log("click");
    const link = document.createElement('a');

    //let pdfBlob = new Blob([pdfData]);
    link.href = URL.createObjectURL(new File([pdfData], "pdf"));
    link.download = "merged";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
}

async function onFileChanged($event: Event): Promise<void> {
    cont ??= document.getElementById("pageContainer") as HTMLDivElement;
    pdfViewer ??= new viewer.PDFViewer({
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
        },
        textLayerMode: 0
    });

    console.log("file changed");
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        console.log("file valid");

        const bytes = await readFileAsync(target.files[0]);
        if (bytes) {
            pdfData = bytes;
            console.log("file read");
            const pdfDoc = await PDFDocument.load(bytes);
            //pdfData = pdfDoc;
            console.log("pages: " + pdfDoc.getPageCount());
            //const firstPage = pdfDoc.getPage(0);
            const newDoc = await PDFDocument.create();
            // const newDoc = await pdfDoc.copy();
            const copiedPages = await newDoc.copyPages(pdfDoc, [1]);
            copiedPages.forEach((page, idx, _) => newDoc.addPage(page));
            const byteArray = await newDoc.save();

            const doc = await pdfjs.getDocument(byteArray).promise;
            pdfViewer.setDocument(doc);

            // custom rendering
            // const page1 = await doc.getPage(1);
            // const viewport = page1.getViewport({ scale: 1 });
            // const canvas = document.getElementById("my-canvas") as HTMLCanvasElement;
            // const context = canvas.getContext("2d") as CanvasRenderingContext2D;
            // canvas.height = viewport.height;
            // canvas.width = viewport.width;
            // console.log(`height: ${canvas.height}, width: ${canvas.width}`);
            // await page1.render({ canvasContext: context, viewport: viewport }).promise;
        }
    }
}
</script>