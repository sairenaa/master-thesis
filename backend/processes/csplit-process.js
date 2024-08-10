"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsplitProcess = exports.csplitCommands = void 0;
const process_1 = require("./process");
const path_1 = require("path");
exports.csplitCommands = {
    prefix: "-f",
    keep: "-k",
    allFiles: "{*}"
};
class CsplitProcess extends process_1.Process {
    constructor(file) {
        super("csplit", file);
        // compilation unit prefix
        this.COMPILATION_UNIT_PREFIX = "cu";
        // regex for compilation unit
        this.REGEX_CU = this.COMPILATION_UNIT_PREFIX + "[0-9]+";
    }
    splitCompilationUnits(tempFolderPath) {
        return this.execProcess(this.Name, [
            exports.csplitCommands.prefix,
            (0, path_1.join)(tempFolderPath, this.COMPILATION_UNIT_PREFIX),
            exports.csplitCommands.keep,
            this.File,
            '\'' + "/Compilation/" + '\'',
            '\'' + exports.csplitCommands.allFiles + '\''
        ], process_1.Process.PATH);
    }
}
exports.CsplitProcess = CsplitProcess;
//# sourceMappingURL=csplit-process.js.map