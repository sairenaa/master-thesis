import { Promise } from "bluebird";
import { Configuration } from "./configuration";
import { ReadelfProcess } from "./processes/readelf-process";
import { join } from "path";
import { Rabin2Process } from "./processes/rabin2-process";
import { Util } from "./util";
import { CsplitProcess } from "./processes/csplit-process";
import { DwarfParser } from "./parsers/dwarf-parser";
import { readdir } from "fs";
import { SwComponent } from "./sw-component";
import { SwComponentsParser } from "./parsers/sw-components-parser";
import { ProjectImage, XmlNode } from "./project-image";
import { Database } from "./database/database";

const DWARF_DEPTH_LEVEL = 2;
// compilation unit prefix
const COMPILATION_UNIT_PREFIX = "cu";
// regex for compilation unit
const REGEX_CU = COMPILATION_UNIT_PREFIX + "[0-9]+";

export class Analyzer {
    private configuration: Configuration;
    private tempFolderPath: string;
    private readelfProcess: ReadelfProcess;
    private dwarfInfoOutput: string;
    private csplitProcess: CsplitProcess;
    private rabin2Process: Rabin2Process;
    private symbols: any;
    private fileSymbolMap: any;
    private dwarfParser: DwarfParser;
    private swComponents: Array<SwComponent>;
    private swComponentsParser: SwComponentsParser;
    private projectImage: ProjectImage;
    private database: Database;

    constructor(configuration: Configuration, tempFolderPath: string) {
        this.configuration = configuration;
        this.tempFolderPath = tempFolderPath;
        this.readelfProcess = new ReadelfProcess(this.configuration.Elf);
        this.dwarfInfoOutput = join(this.configuration.Out, "temp", "dwarf_info.txt");
        this.csplitProcess = new CsplitProcess(this.dwarfInfoOutput);
        this.rabin2Process = new Rabin2Process(this.configuration.Elf);
        this.symbols = {};
        this.fileSymbolMap = {};
        this.dwarfParser = new DwarfParser(DWARF_DEPTH_LEVEL);
        this.swComponents = new Array<SwComponent>();
        this.swComponentsParser = new SwComponentsParser(this.configuration.SwComponents);
        this.projectImage = new ProjectImage();
        this.database = new Database();
    }

    get ProjectImage() {
        return this.projectImage;
    }

    /**
     * Get .dwarf_info section data using readelf
     * @returns Promise
     */
    public getDwarfInfo() {
        try {
            return this.readelfProcess.getDwarfInfoSection(DWARF_DEPTH_LEVEL, this.dwarfInfoOutput)
                    .then(this.csplitProcess.splitCompilationUnits.bind(this.csplitProcess, this.tempFolderPath));
        }
        catch(error) {
            console.log(error);
            return new Promise(function(resolve: Function, reject: Function) {
                reject(error);
            });
        }
    }

    /**
     * Get symbols using rabin2
     * @returns Promise
     */
    public getSymbols() {
        try {
            return this.rabin2Process.getSymbolsJson()
                    .then(function(this: Analyzer, symbols: any) {
                        // write symbols to the file
                        return Util.writeFile(join(this.tempFolderPath, "symbols.json"), JSON.stringify(symbols, null, 4));
                    }.bind(this))
                    .then(function(this: Analyzer) {
                        // read symbols.json
                        return Util.readFile(join(this.tempFolderPath, "symbols.json"), { encoding: "utf-8"})
                                .then(function(this: Analyzer, data: any) {
                                    return new Promise(function(this: Analyzer, resolve: Function, reject: Function) {
                                        this.symbols = JSON.parse(data);
                                        resolve();
                                    }.bind(this));
                                }.bind(this));
                    }.bind(this));
        }
        catch(error) {
            console.log(error);
            return new Promise(function(resolve: Function, reject: Function) {
                reject(error);
            });
        }
    }

    /**
     * Map symbols to files based on CU data and symbols information
     */
    private mapSymbolsToFiles() {
        this.fileSymbolMap = {};

        // iterate over parsed units from dwarf info
        for(let unitName in this.dwarfParser.ParsedUnits) {
            let unit = this.dwarfParser.ParsedUnits[unitName];

            // check each child of the compilation unit
            unit.Children.forEach(function(this: Analyzer, child: any) {
                if(child.tagType === this.dwarfParser.DW_TAG_COMPILE_UNIT) {
                    let file = child.name;

                    // init file entry in map if not exists
                    if(!this.fileSymbolMap[file]) {
                        this.fileSymbolMap[file] = [];
                    }

                    // add symbols that belong to this file based on their address range
                    this.symbols.symbols.forEach(function(this: Analyzer, symbol: any) {
                        if(symbol.size > 0 && this.isSymbolInRange(symbol, child)) {
                            this.fileSymbolMap[file].push(symbol);
                        }
                    }.bind(this));
                }
            }.bind(this));
        }
    }

    /**
     * Check if a symbol's address is within the range of a compilation unit's child
     * @param symbol Symbol to check
     * @param child Compilation unit child
     * @returns true if symbol is in range, false otherwise
     */
    private isSymbolInRange(symbol: any, child: any): boolean {
        let symbolAddress = symbol.vaddr;
        let lowAddress = Util.formatAddress(child.low_pc);
        let highAddress = Util.formatAddress(child.high_pc);

        // high address is interpreted as offset
        if(lowAddress > highAddress) {
           highAddress += lowAddress; 
        }

        return symbolAddress >= lowAddress && symbolAddress < highAddress;
    }

    /**
     * Parse compilation units
     * @returns Promise
     */
    public parseCompilationUnits() {
        return new Promise(function(this: Analyzer, resolve: Function, reject: Function) {
            readdir(this.tempFolderPath, (error, files) => {
                if(error) {
                    console.log("ERROR: Reading file structure");
                    reject(error);
                }
                const regexCompUnit = new RegExp(REGEX_CU);
                files = files.filter(e => regexCompUnit.test(e));
                // Remove the first file as it is only a string "Contents of the .debug_info section:"
                files.shift();
                this.parseAllCompilationUnits(files)
                    .then(() => resolve(true))
                    .catch(err => reject(err));
            });
        }.bind(this))
        .then(function(this: Analyzer) {
            return new Promise(function(this: Analyzer, resolve: Function, reject: Function) {
                return Util.writeFile(join(this.tempFolderPath, "parsedUnits.json"), JSON.stringify(this.dwarfParser.parsedUnits))
                    .then(function(this: Analyzer, data: any) {
                        this.dwarfParser.clearResources();
                        resolve(true);
                    }.bind(this))
                    .catch(function(error) {
                        reject(error);
                    });
            }.bind(this));
        }.bind(this))
        .then(function(this: Analyzer) {
            return new Promise(function(this: Analyzer, resolve: Function, reject: Function) {
                return Util.readFile(join(this.tempFolderPath, "parsedUnits.json"), { encoding: "utf-8" })
                    .then(function(this: Analyzer, data: any) {
                        this.dwarfParser.parsedUnits = JSON.parse(data);
                        resolve(true);
                    }.bind(this))
                    .catch(function(error) {
                        reject(error);
                    });
            }.bind(this));
        }.bind(this))
        .catch(function(error) {
            return new Promise(function(resolve: Function, reject: Function) {
                reject(error);
            });
        });
    }

    /**
     * Parse all compilation units
     * @param files Array of file names
     * @returns Promise
     */
    private parseAllCompilationUnits(files: string[]) {
        const promises = files.map((file, index) => {
            return new Promise(function(this: Analyzer, resolve: Function, reject: Function) {
                this.dwarfParser.parse(join(this.tempFolderPath, file), index, resolve, reject);
            }.bind(this));
        });

        return Promise.all(promises);
    }

    public initSwComponents() {
        return this.swComponentsParser.parseComponents()
                .then(function(this: Analyzer, components: Array<SwComponent>) {
                    this.swComponents = components;
                }.bind(this));
    }

    public generateProjectImage(): any {
        const xml = this.projectImage.createProjectImage(this.swComponents);

        this.mapSymbolsToFiles();

        this.swComponents.forEach(function(this: Analyzer, component: SwComponent) {
            let scwNode = this.projectImage.SWC.find((swc: any) => swc.getAttribute("name") === component.Name);
            let totalSize = 0;

            component.Files.forEach(function(this: Analyzer, file: any) {
                let symbols = this.fileSymbolMap[file] || [];

                symbols.forEach(function(symbol: any) {
                    let symbolNode = new XmlNode();
                    symbolNode.addAttribute("name", symbol.name);
                    symbolNode.addAttribute("filename", file);
                    symbolNode.addAttribute("size", symbol.size);
                    symbolNode.addAttribute("type", symbol.type);
                    symbolNode.addAttribute("address", Util.formatAddressToHex(symbol.vaddr));
                    symbolNode.addAttribute("scope", symbol.bind);

                    scwNode?.addSymbol(symbolNode);

                    totalSize += symbol.size;
                });
            }.bind(this));

            scwNode?.addAttribute("size", totalSize);
        }.bind(this));

        this.ProjectImage.addAttribute("date", new Date().toISOString());
        const projectImageXml = Util.createXml(this.projectImage);

        return Util.writeFile(join(this.configuration.Out, "project_image.xml"), projectImageXml)
            .then(function(this: Analyzer) {
                return this.database.saveProjectImage(this.projectImage, this.configuration.Elf);
            }.bind(this));
    }

    public getSwComponent(component: string, elfLocation: string) {
        return this.database.getComponentData(component, elfLocation);
    }
}