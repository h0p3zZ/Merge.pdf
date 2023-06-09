/**
 * Class used to process a part of the export String used
 * for file splitting, checks said string vor validity
 * and throws Errors for invalid strings
 */
export class PageEntry {
    private pageEntry: string;
    private pageCount: number;
    private pageStart: number;
    private pageEnd: number;

    /**
     * @param pageEntry String in integer-interval-notation to determine pages to export
     * @param pageCount Number of pages in the source document
     * @throws Error when empty string is passed
     * @throws Error when range string has no identifiable end
     * @throws Error when pages numbered higher than last page are entered
     * @throws Error when start index of range is higher than end index of range
     * @summary Create new PageEntry
     */
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

    /**
     * @returns Number of first page of range to be exported
     */
    public async getPageStart(): Promise<number> {
        return this.pageStart;
    }

    /**
     * @returns Number of last page of range to be exported
     */
    public async getPageEnd(): Promise<number> {
        return this.pageEnd;
    }

    /**
     * @returns Number of first page of range to be exported
     * @throws Error when value that is extracted is not a number
     * @summary Private helper method to initally get number of start page and check whether the number passed is valid
     */
    private initPageStart(): number {
        let arr = this.pageEntry.split('-');

        if (isNaN(parseInt(arr[0])))
            throw new Error("Invalid: page start not a number");
        return parseInt(arr[0]);
    }

    /**
     * @returns Number of last page of range to be exported if specified, number of first page otherwise
     * @summary Private helper method to initially get number of end page provided that it is specified
     */
    private initPageEnd(): number {
        let arr = this.pageEntry.split('-');
        return isNaN(parseInt(arr[1])) ? this.initPageStart() : parseInt(arr[1]);
    }
}