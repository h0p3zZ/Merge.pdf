/**
 * TODO: MichiFab document why this exists
 */
export class PageEntry {
    private pageEntry: string;
    private pageCount: number;
    private pageStart: number;
    private pageEnd: number;

    constructor(pageEntry: string, pageCount: number) {
        this.pageEntry = pageEntry;
        this.pageCount = pageCount;

        if (pageEntry === '') {
            throw new Error("Invalid: page string is empty");
        }
        if (pageEntry.endsWith("-"))
            throw new Error("Invalid: no end page defined");

        this.pageStart = this.initPageStart();
        this.pageEnd = this.initPageEnd();

        if (this.pageStart > this.pageCount || this.pageEnd > this.pageCount)
            throw new Error("Invalid: index out of bounds");
        if (this.pageStart > this.pageEnd)
            throw new Error("Invalid: start index greater than end index");
    }

    public async getPageStart(): Promise<number> {
        return this.pageStart;
    }

    public async getPageEnd(): Promise<number> {
        return this.pageEnd;
    }

    private initPageStart(): number {
        let arr = this.pageEntry.split('-');

        if (isNaN(parseInt(arr[0])))
            throw new Error("Invalid: page start not a number");
        return parseInt(arr[0]);
    }

    private initPageEnd(): number {
        let arr = this.pageEntry.split('-');
        return isNaN(parseInt(arr[1])) ? this.initPageStart() : parseInt(arr[1]);
    }
}