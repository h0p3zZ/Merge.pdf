/**
 * TODO: AndiLeeb write doc for this function
 * @param file 
 * @returns 
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