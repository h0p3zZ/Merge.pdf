import { readFileAsync } from "./fileUtils";

/**
 * Represents a file from the local filesystem along with its (lazily loaded) content.
 */
export class LoadedFile {
    /**
     * Creates a LoadedFile object.
     * @param file The file to represent.
     */
    public constructor(file: File) {
        this.fileName = file.name;
        this.mimeType = file.type;
        this.file = file;
    }

    /**
     * The name of the file.
     */
    public readonly fileName: string;
    /**
     * The MIME type of the file.
     */
    public readonly mimeType: string;

    private readonly file: File;
    private bytes: ArrayBuffer | null | undefined;
    private stringContent: string | undefined;

    /**
     * The file's content as bytes or null in case of an error.
     * @returns A promise for the file's content as bytes, lazily loaded.
     */
    public async getBytesAsync(): Promise<ArrayBuffer | null> {
        if (this.bytes) {
            return this.bytes;
        }

        this.bytes = await readFileAsync(this.file);
        return this.bytes;
    }

    /**
     * The file's content as a string.
     * @returns A promise for the file's content as a string, lazily loaded.
     */
    public async getAsStringAsync(): Promise<string> {
        if (this.stringContent) {
            return this.stringContent;
        }

        this.stringContent = await this.file.text();
        return this.stringContent;
    }
}