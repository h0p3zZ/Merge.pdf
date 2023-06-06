import { PDFDocument } from "pdf-lib";

export async function exportPDF(exportString: string, pdfDoc: PDFDocument): Promise<boolean> {
    const documents: PDFDocument[] = [];

    if (exportString === '') {
        downloadPDF(pdfDoc);
        return true;
    }

    let startIndex = exportString.indexOf('[') + 1;
    let endIndex = exportString.indexOf(']');

    for (let docIndex = 0; endIndex != -1 || startIndex != 0; docIndex++) {
        if (endIndex === -1) endIndex = exportString.length;
        let prevEndIndex = endIndex;

        let pageString = exportString.substring(startIndex, endIndex);
        let arr = pageString.split('-');
        let pageStart = parseInt(arr[0]);
        let pageEnd = parseInt(arr[1]);

        documents[docIndex] = await PDFDocument.create();

        const copyIDs: number[] = [];

        // for the case user enters single digit in between []-brackets
        if (!isNaN(pageEnd)) {
            for (let i = pageStart - 1; i < pageEnd; i++) {
                copyIDs[i + 1 - pageStart] = i;
            }
        } else {
            copyIDs[copyIDs.length] = pageStart - 1;
        }

        const copiedPages = await documents[docIndex].copyPages(pdfDoc, copyIDs);

        copiedPages.forEach((page) => {
            documents[docIndex].addPage(page);
        })

        endIndex = exportString.indexOf(']', prevEndIndex + 1);
        startIndex = exportString.indexOf('[', prevEndIndex + 1) + 1;
    }

    documents.forEach(async (doc, index) => {
        let pdfName = `merged-file${index + 1}.pdf`;
        if (documents.length === 1) pdfName = 'merged.pdf';
        downloadPDF(doc, pdfName);
    }
    );

    // ToDo return true if the export worked - else return false 
    // Alternatively use custom Exceptionhandling-Errorhandling
    return true;
};


// private Helpers
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