import { PDFDocument } from "pdf-lib";

export async function exportPDF(exportString: string, pdfDoc: PDFDocument): Promise<boolean> {
    const documents: PDFDocument[] = [];

    if (exportString === '') {
        downloadPDF(pdfDoc);
        return true;
    }

    let startIndex = exportString.indexOf('[') + 1;
    let endIndex = exportString.indexOf(']');

    // alert if export string contains no []-brackets
    if(startIndex == -1 || endIndex == -1){
        alert("invalid export string");
        return false;
    }

    for (let docIndex = 0; endIndex != -1 || startIndex != 0; docIndex++) {
        if (endIndex === -1) endIndex = exportString.length;
        let prevEndIndex = endIndex;

        let pageString = exportString.substring(startIndex, endIndex);
        let arr = pageString.split('-');
        let pageStart = parseInt(arr[0]);

        // invalid input or index out of range
        if(isNaN(pageStart) || pageStart >= pdfDoc.getPages().length){
            alert("invalid export string");
            return false;
        }

        let pageEnd = isNaN(parseInt(arr[1])) ? pageStart : parseInt(arr[1]);

        documents[docIndex] = await PDFDocument.create();

        const copyIDs: number[] = [];

        for (let i = pageStart - 1; i < pageEnd; i++)
            copyIDs[i + 1 - pageStart] = i;

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