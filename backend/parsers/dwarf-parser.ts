import * as fs from 'fs';
import byline from 'byline';

const regexUnit = new RegExp("Compilation Unit @ offset");
const regexUnitOffset = new RegExp(/0x[0-9abcdef]+:/);
const regexAddr = new RegExp(/<[0-9abcdef]+>/);
const regexLevel = new RegExp(/<[0-9]+><[0-9abcdef]+>/);
const regexProp = new RegExp(/^<[0-9abcdef]+>:?\s+([a-zA-z]+)/);
const regexNum = new RegExp(/^[0-9]+/);
const regexTag = new RegExp(/([a-zA-Z_]+)/);

export class DwarfParser {
    public readonly DW_TAG_VARIABLE = "DW_TAG_variable";
    public readonly DW_TAG_SUBPROGRAM = "DW_TAG_subprogram";
    public readonly DW_TAG_COMPILE_UNIT = "DW_TAG_compile_unit";

    private depth: number;
    public parsedUnits: any;

    /**
     * Constructor for DwarfParser
     * @param depth - depth level for parsing
     * NOTE: depth level specified is excluded from parsing, example depth = 2, only levels: 0, 1 
     */
    constructor(depth: number) {
        this.depth = depth;
        this.parsedUnits = {};
    }

    //#region Getters/Setters
    get Depth() {
        return this.depth;
    }

    get ParsedUnits() {
        return this.parsedUnits;
    }

    set ParsedUnits(value) {
        this.parsedUnits = value;
    }
    //#endregion

    /**
     * Clear resources by resetting parsedUnits
     */
    public clearResources() {
        this.parsedUnits = null;
        this.parsedUnits = {};
    }

    /**
     * Parse a compilation unit file
     * @param unit Unit filename with path
     * @param index Unit index
     * @param resolve Resolve Promise function
     * @param reject Reject Promise function
     * @returns json object structure of the file
     */
    public parse(unit: string, index: number, resolve: any, reject: any) {
        const stream = byline(fs.createReadStream(unit, { encoding: 'ascii' }));
        stream.on('data', this.processLine.bind(this, unit));
        stream.on('end', this.compilationUnitParsed.bind(this, resolve, unit, stream));
    }

    /**
     * Creates and hashes a new object
     * @param unitName - Object name
     */
    private addNewObject(unitName: string): void {
        const o = { Children: [] };
        this.parsedUnits[unitName] = o;
    }

    /**
     * Process a single line from the stream
     * @param unit Unit filename with path
     * @param line Line from the stream
     */
    private processLine(unit: string, line: string) {
        line = line.trim();
        const unitParts = unit.split("\\");
        const unitName = unitParts[unitParts.length - 1];
        
        if(this.parsedUnits[unitName] === undefined) {
            this.addNewObject(unitName);
        }
    
        if(!regexAddr.test(line)) {
            this.parseHeader(line, unitName);
        }
        else {
            try {
                const level = this.checkForNewObject(line, unitName);
                if(level === -1) {
                    let o = this.parsedUnits[unitName].Children.slice(-1)[0];
                    if(o) {
                        let arr = line.split(':');
                        if(arr[0] === null || arr === null || arr === undefined) {
                            console.log("ERROR: arr out of range!");
                        }
                        else {
                            let resProp = regexProp.exec(arr[0]);
                            let prop = resProp![1].replace("DW_AT_", "");
                            let value = arr[arr.length - 1].trim();
    
                            // Remove any trailing characters like ")" from the value
                            if(prop === "location" && value.endsWith(")")) {
                                value = value.slice(0, -1);
                            }
    
                            o[prop] = value;
                        }
                    }
                }
            }
            catch(error) {
                console.log(error);
            }
        }
    }

    /**
     * Callback when line by line parsing is finished
     * @param resolve Resolve promise
     * @param unit Unit filename with path
     * @param stream Readstream of the unit
     */
    private compilationUnitParsed(resolve: Function, unit: string, stream: any) {
        const unitParts = unit.split("\\");
        const unitName = unitParts[unitParts.length - 1];
        const o = this.parsedUnits[unitName];
        o.Children = o.Children.filter((tag: any) => tag.tagType === this.DW_TAG_VARIABLE || tag.tagType === this.DW_TAG_SUBPROGRAM || tag.tagType === this.DW_TAG_COMPILE_UNIT);
        resolve(true);
    }

    /**
     * Check and add a new object 
     * @param line Line from the stream
     * @param unitName Unit filename
     * @returns Object's level, -1 if there is no level mark, -2 if there is a mismatch in level depth
     */
    private checkForNewObject(line: string, unitName: string) {
        let level = -1;
        const m = regexLevel.exec(line);
        if (m !== null && m[0]) {
            const arr = m[0].split(">");
            level = parseInt(arr[0].slice(1));
            if (level < this.depth) {
                const a = line.split(":")[2].trim();
                const abbrevNumber = parseInt(regexNum.exec(a)![0]);
                if (abbrevNumber > 0) {
                    const tag = regexTag.exec(a)![1];
                    let o = {
                        offset: "0x" + arr[1].slice(1),
                        level: level,
                        tagType: tag,
                        abbrevNumber: abbrevNumber
                    };
                    this.parsedUnits[unitName].Children.push(o);
                } else {
                    level = -2;
                }
            } else {
                level = -2;
            }
        }
        return level;
    }

    /**
     * Parse Compilation Unit header information and add data to the specified unit
     * @param line Line content
     * @param unitName Unit filename
     */
    private parseHeader(line: string, unitName: string) {
        if(regexUnit.test(line)) {
            const res = regexUnitOffset.exec(line);
            this.parsedUnits[unitName].Offset = res![0].slice(0, -1);
        } 
        else {
            const arr = line.split(":");
            const prop = arr[0].trim().replace(" ", "_");
            this.parsedUnits[unitName][prop] = arr[1].trim();
        }
    }
}
