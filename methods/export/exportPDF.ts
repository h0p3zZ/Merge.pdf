import { PDFDocument } from "pdf-lib";
import { PageEntry } from "./PageEntry";
import { ExportStringContstants } from "./ExportStringConstants";

/**
 * @param exportString The export string that is parsed in the funciton.
 * @param pdfDoc The Current PDF Document with all pages.
 * @returns An Error-String if the @param exportString has a syntax issue else it returns null.
 * 
 * @summary This public function parses the export string in @param exportString and tries to Export a single (or multiple) PDF files from the given PDF document in @param pdfDoc.
 */
export async function exportPDF(exportString: string, pdfDoc: PDFDocument): Promise<string | null> {
    const documents: PDFDocument[] = [];

    if (exportString === '') {
        downloadPDF(pdfDoc);
        return null;
    }

    exportString = exportString.replaceAll(" ", "");

    let startIndex = exportString.indexOf(ExportStringContstants.FILE_START) + 1;
    let endIndex = exportString.indexOf(ExportStringContstants.FILE_END);

    if (startIndex == -1 || endIndex == -1) {
        return "Invalid: export expression must be in between []-brackets";
    }

    for (let docIndex = 0; endIndex != -1 || startIndex != 0; docIndex++) {
        if (endIndex == -1) endIndex = exportString.length;
        let prevEndIndex = endIndex;

        let pageString = exportString.substring(startIndex, endIndex);
        let pageArr = pageString.split(ExportStringContstants.PAGE_SEPARATOR);

        documents[docIndex] = await PDFDocument.create();

        for (let pageEntry of pageArr) {
            let pageStart: number;
            let pageEnd: number;

            try {
                let entry = new PageEntry(pageEntry, pdfDoc.getPageCount());
                pageStart = await entry.getPageStart();
                pageEnd = await entry.getPageEnd();
            } catch (e) {
                const error = e as Error;
                return error.message;
            }
            await addPages(documents[docIndex], pdfDoc, pageStart, pageEnd);
        }

        endIndex = exportString.indexOf(ExportStringContstants.FILE_END, prevEndIndex + 1);
        startIndex = exportString.indexOf(ExportStringContstants.FILE_START, prevEndIndex + 1) + 1;
    }

    documents.forEach(async (doc, index) => {
        let pdfName = `merged-file${index + 1}.pdf`;
        if (documents.length === 1) pdfName = 'merged.pdf';
        downloadPDF(doc, pdfName);
    }
    );

    return null;
};

/**
 * @param document Document were pages need to be attached.
 * @param pdfDoc The current PDF Document that is shown in the GUI
 * @param pageStart Startindex of the pages that need to be copied from @param pdfDoc to @param document
 * @param pageEnd Endindex of the pages that need ot be copied from @param pdfDoc to @param document
 * 
 * @summary This helper function copies pages from the currend PDF Document (@param pdfDoc) to the @param document.
 */
async function addPages(document: PDFDocument, pdfDoc: PDFDocument, pageStart: number, pageEnd: number) {
    const copyIDs: number[] = [];

    for (let i = pageStart - 1; i < pageEnd; i++) {
        copyIDs[i + 1 - pageStart] = i;
    }

    const copiedPages = await document.copyPages(pdfDoc, copyIDs);
    copiedPages.forEach((page) => {
        document.addPage(page);
    });
};

/**
 * @param pdfDoc The PDF document that is to be downloaded
 * @param name Optional name for the PDF-file that is to be downloaded
 * 
 * @summary This helper function starts a download for the PDF-file in @param pdfDoc with the optional name.
 * @default name The default name if no other name is provided is "merged.pdf".
 */
async function downloadPDF(pdfDoc: PDFDocument, name?: string) {
    const link = document.createElement('a');

    const byteArray = await pdfDoc.save();

    link.download = (name) ? name : "merged.pdf";
    link.href = URL.createObjectURL(new File([byteArray], "merged.pdf"));
    document.body.append(link);

    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
};