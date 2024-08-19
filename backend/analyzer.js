"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyzer = void 0;
const bluebird_1 = require("bluebird");
const readelf_process_1 = require("./processes/readelf-process");
const path_1 = require("path");
const rabin2_process_1 = require("./processes/rabin2-process");
const util_1 = require("./util");
const csplit_process_1 = require("./processes/csplit-process");
const dwarf_parser_1 = require("./parsers/dwarf-parser");
const fs_1 = require("fs");
const sw_components_parser_1 = require("./parsers/sw-components-parser");
const project_image_1 = require("./project-image");
const database_1 = require("./database/database");
const DWARF_DEPTH_LEVEL = 2;
// compilation unit prefix
const COMPILATION_UNIT_PREFIX = "cu";
// regex for compilation unit
const REGEX_CU = COMPILATION_UNIT_PREFIX + "[0-9]+";
class Analyzer {
    constructor(configuration, tempFolderPath) {
        this.configuration = configuration;
        this.tempFolderPath = tempFolderPath;
        this.readelfProcess = new readelf_process_1.ReadelfProcess(this.configuration.Elf);
        this.dwarfInfoOutput = (0, path_1.join)(this.configuration.Out, "temp", "dwarf_info.txt");
        this.csplitProcess = new csplit_process_1.CsplitProcess(this.dwarfInfoOutput);
        this.rabin2Process = new rabin2_process_1.Rabin2Process(this.configuration.Elf);
        this.symbols = {};
        this.fileSymbolMap = {};
        this.dwarfParser = new dwarf_parser_1.DwarfParser(DWARF_DEPTH_LEVEL);
        this.swComponents = new Array();
        this.swComponentsParser = new sw_components_parser_1.SwComponentsParser(this.configuration.SwComponents);
        this.projectImage = new project_image_1.ProjectImage();
        this.database = new database_1.Database();
    }
    get ProjectImage() {
        return this.projectImage;
    }
    /**
     * Get .dwarf_info section data using readelf
     * @returns Promise
     */
    getDwarfInfo() {
        try {
            return this.readelfProcess.getDwarfInfoSection(DWARF_DEPTH_LEVEL, this.dwarfInfoOutput)
                .then(this.csplitProcess.splitCompilationUnits.bind(this.csplitProcess, this.tempFolderPath));
        }
        catch (error) {
            console.log(error);
            return new bluebird_1.Promise(function (resolve, reject) {
                reject(error);
            });
        }
    }
    /**
     * Get symbols using rabin2
     * @returns Promise
     */
    getSymbols() {
        try {
            return this.rabin2Process.getSymbolsJson()
                .then(function (symbols) {
                // write symbols to the file
                return util_1.Util.writeFile((0, path_1.join)(this.tempFolderPath, "symbols.json"), JSON.stringify(symbols, null, 4));
            }.bind(this))
                .then(function () {
                // read symbols.json
                return util_1.Util.readFile((0, path_1.join)(this.tempFolderPath, "symbols.json"), { encoding: "utf-8" })
                    .then(function (data) {
                    return new bluebird_1.Promise(function (resolve, reject) {
                        this.symbols = JSON.parse(data);
                        resolve();
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }
        catch (error) {
            console.log(error);
            return new bluebird_1.Promise(function (resolve, reject) {
                reject(error);
            });
        }
    }
    /**
     * Map symbols to files based on CU data and symbols information
     */
    mapSymbolsToFiles() {
        this.fileSymbolMap = {};
        // iterate over parsed units from dwarf info
        for (let unitName in this.dwarfParser.ParsedUnits) {
            let unit = this.dwarfParser.ParsedUnits[unitName];
            let fileName = "";
            // find the file name from the compilation unit
            unit.Children.forEach(function (child) {
                if (child.tagType === this.dwarfParser.DW_TAG_COMPILE_UNIT) {
                    fileName = child.name;
                    // init file entry in map if not exists
                    if (!this.fileSymbolMap[fileName]) {
                        this.fileSymbolMap[fileName] = [];
                    }
                }
            }.bind(this));
            // map symbols to correct file
            unit.Children.forEach(function (child) {
                // add symbols that belong to this file based on their address range
                if (child.tagType !== this.dwarfParser.DW_TAG_COMPILE_UNIT) {
                    this.symbols.symbols.forEach(function (symbol) {
                        if (symbol.size > 0 && this.isSymbolInRange(symbol, child)) {
                            this.fileSymbolMap[fileName].push(symbol);
                        }
                        // check for variables
                        if (symbol.type === "OBJ" && this.isVariableInChild(symbol, child)) {
                            this.fileSymbolMap[fileName].push(symbol);
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
    isSymbolInRange(symbol, child) {
        let symbolAddress = symbol.vaddr;
        let lowAddress = util_1.Util.formatAddress(child.low_pc);
        let highAddress = util_1.Util.formatAddress(child.high_pc);
        // high address is interpreted as offset
        if (lowAddress > highAddress) {
            highAddress += lowAddress;
        }
        return symbolAddress >= lowAddress && symbolAddress < highAddress;
    }
    isVariableInChild(symbol, child) {
        if (child.tagType === this.dwarfParser.DW_TAG_VARIABLE && child.location) {
            return symbol.vaddr === util_1.Util.formatAddress(child.location);
        }
        return false;
    }
    /**
     * Parse compilation units
     * @returns Promise
     */
    parseCompilationUnits() {
        return new bluebird_1.Promise(function (resolve, reject) {
            (0, fs_1.readdir)(this.tempFolderPath, (error, files) => {
                if (error) {
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
            .then(function () {
            return new bluebird_1.Promise(function (resolve, reject) {
                return util_1.Util.writeFile((0, path_1.join)(this.tempFolderPath, "parsedUnits.json"), JSON.stringify(this.dwarfParser.parsedUnits))
                    .then(function (data) {
                    this.dwarfParser.clearResources();
                    resolve(true);
                }.bind(this))
                    .catch(function (error) {
                    reject(error);
                });
            }.bind(this));
        }.bind(this))
            .then(function () {
            return new bluebird_1.Promise(function (resolve, reject) {
                return util_1.Util.readFile((0, path_1.join)(this.tempFolderPath, "parsedUnits.json"), { encoding: "utf-8" })
                    .then(function (data) {
                    this.dwarfParser.parsedUnits = JSON.parse(data);
                    resolve(true);
                }.bind(this))
                    .catch(function (error) {
                    reject(error);
                });
            }.bind(this));
        }.bind(this))
            .catch(function (error) {
            return new bluebird_1.Promise(function (resolve, reject) {
                reject(error);
            });
        });
    }
    /**
     * Parse all compilation units
     * @param files Array of file names
     * @returns Promise
     */
    parseAllCompilationUnits(files) {
        const promises = files.map((file, index) => {
            return new bluebird_1.Promise(function (resolve, reject) {
                this.dwarfParser.parse((0, path_1.join)(this.tempFolderPath, file), index, resolve, reject);
            }.bind(this));
        });
        return bluebird_1.Promise.all(promises);
    }
    initSwComponents() {
        return this.swComponentsParser.parseComponents()
            .then(function (components) {
            this.swComponents = components;
        }.bind(this));
    }
    generateProjectImage() {
        const xml = this.projectImage.createProjectImage(this.swComponents);
        this.mapSymbolsToFiles();
        this.swComponents.forEach(function (component) {
            let scwNode = this.projectImage.SWC.find((swc) => swc.getAttribute("name") === component.Name);
            let totalSize = 0;
            component.Files.forEach(function (file) {
                let symbols = this.fileSymbolMap[file] || [];
                symbols.forEach(function (symbol) {
                    let symbolNode = new project_image_1.XmlNode();
                    symbolNode.addAttribute("name", symbol.name);
                    symbolNode.addAttribute("filename", file);
                    symbolNode.addAttribute("size", symbol.size);
                    symbolNode.addAttribute("type", symbol.type);
                    symbolNode.addAttribute("address", util_1.Util.formatAddressToHex(symbol.vaddr));
                    symbolNode.addAttribute("scope", symbol.bind);
                    scwNode === null || scwNode === void 0 ? void 0 : scwNode.addSymbol(symbolNode);
                    totalSize += symbol.size;
                });
            }.bind(this));
            scwNode === null || scwNode === void 0 ? void 0 : scwNode.addAttribute("size", totalSize);
        }.bind(this));
        this.ProjectImage.addAttribute("date", new Date().toISOString());
        const projectImageXml = util_1.Util.createXml(this.projectImage);
        return util_1.Util.writeFile((0, path_1.join)(this.configuration.Out, "project_image.xml"), projectImageXml)
            .then(function () {
            return this.database.saveProjectImage(this.projectImage, this.configuration.Elf);
        }.bind(this));
    }
    getSwComponent(component, elfLocation) {
        return this.database.getComponentData(component, elfLocation);
    }
}
exports.Analyzer = Analyzer;
//# sourceMappingURL=analyzer.js.map