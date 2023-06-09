/**
 * Reads the given file and returns a promise for the file's content.
 * @param file The file to read.
 * @returns The file's content as bytes or null in case of an error.
 */
export function readFileAsync(file: File): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as (ArrayBuffer | null));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}