import { readFileAsync } from "./fileUtils";

/**
 * TODO: AndiLeeb write documentation for this function
 */
export class LoadedFile {
    public constructor(file: File) {
        this.fileName = file.name;
        this.mimeType = file.type;
        this.file = file;
    }

    public readonly fileName: string;
    public readonly mimeType: string;
    private readonly file: File;
    private bytes: ArrayBuffer | null | undefined;
    private stringContent: string | undefined;

    public async getBytesAsync(): Promise<ArrayBuffer | null> {
        if (this.bytes) {
            return this.bytes;
        }

        this.bytes = await readFileAsync(this.file);
        return this.bytes;
    }

    public async getAsStringAsync(): Promise<string> {
        if (this.stringContent) {
            return this.stringContent;
        }

        this.stringContent = await this.file.text();
        return this.stringContent;
    }
}