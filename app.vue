<template>
  <div class="container">
    <ImportPDF @change="importFile" button-name="Import PDF" accepted-mime-types="application/pdf" />
    <ImportPDF @change="addFile" button-name="Add another file"
      accepted-mime-types="application/pdf,image/jpeg,image/png" 
      :disabled="disableAddFile"/>
    <div class="container-fluid">
      <ExportPDF :pdfDoc="currentPdf" />
    </div>
    <ClientOnly placeholder="loading...">
      <DisplayPDF :pdf-doc="currentPdf" :triggerRefresh="triggerRefresh.valueOf()" @deletedPage="pageDeleted" />
    </ClientOnly>
  </div>
</template>
<style scoped lang="css">
.container {
  margin-top: 3rem;
}
</style>
<script setup lang="ts">
import { PDFDocument, PDFImage, PDFPage } from 'pdf-lib';
import { LoadedFile } from './components/import/loadedFile';

const currentPdf = ref<PDFDocument>(PDFDocument.prototype);
const triggerRefresh = ref<Number>(0);
const disableAddFile = ref<boolean>(true);

/**
 * Loads the PDF document selected in the import file chooser.
 */
async function importFile(file: LoadedFile) {
  const bytes = await file.getBytesAsync();
  if (bytes) {
    currentPdf.value = await PDFDocument.load(bytes);
    disableAddFile.value = false;
  } else {
    disableAddFile.value = true;
  }
}

/**
 * Loads another file to add to the current document.
 * @param addedFile The loaded file to add, currently JPEG, PNG and PDF are supported.
 */
async function addFile(addedFile: LoadedFile) {
  const pdf1 = currentPdf.value as PDFDocument;
  let newPages: PDFPage[] = [];
  const bytes = await addedFile.getBytesAsync();
  if (!bytes) {
    return;
  }

  switch (addedFile.mimeType) {
    case 'application/pdf':
      {
        const pdf2 = await PDFDocument.load(bytes);
        newPages = await pdf1.copyPages(pdf2, pdf2.getPageIndices());
        break;
      }
    case 'image/jpeg':
      {
        const jpg = await pdf1.embedJpg(bytes);
        const page = createPageWithImage(pdf1, jpg);
        newPages.push(page);
        break;
      }
    case 'image/png':
      {
        const png = await pdf1.embedPng(bytes);
        const page = createPageWithImage(pdf1, png);
        newPages.push(page);
        break;
      }
    default:
      return;
  }

  newPages.forEach(page => pdf1.addPage(page));
  triggerRefresh.value = triggerRefresh.value.valueOf() + 1;
}

/**
 * Creates a PDF page with the given image - does not add it to the document though.
 * @param pdf The PDF document for which the page should be created.
 * @param image The image to put into the new page.
 */
function createPageWithImage(pdf: PDFDocument, image: PDFImage): PDFPage {
  const page = PDFPage.create(pdf);
  const firstPage = pdf.getPage(1);
  page.setWidth(firstPage.getWidth());
  page.setHeight(firstPage.getHeight());

  let scaled;
  if (image.height > firstPage.getHeight() || image.width > firstPage.getWidth()) {
    scaled = image.scaleToFit(firstPage.getWidth(), firstPage.getHeight());
  } else {
    scaled = image.scale(1);
  }
  page.drawImage(image, { x: 0, y: page.getHeight() - scaled.height, width: scaled.width, height: scaled.height });
  return page;
}

/**
 * Callback for when a page is deleted, refreshes the rendering.
 */
async function pageDeleted() {
  triggerRefresh.value = triggerRefresh.value.valueOf() + 1;
}
</script>
