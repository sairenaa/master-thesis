"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadelfProcess = void 0;
const process_1 = require("./process");
const fs_1 = require("fs");
const bluebird_1 = require("bluebird");
const readelfCommands = {
    // dump debug section
    debug_dump: "--debug-dump",
    // limit the dump to n children in depth
    // NOTE: used only with .debug_info section
    dwarf_depth: "--dwarf-depth"
};
const debugSections = {
    info: "info"
};
class ReadelfProcess extends process_1.Process {
    constructor(file) {
        super("readelf", file);
    }
    /**
     * Get dwarf .debug_info section
     * @param depth Node depth
     * @param output Path to output
     */
    getDwarfInfoSection(depth, output) {
        this.output = output;
        this.stream = (0, fs_1.createWriteStream)(output, { flags: 'a' });
        let promise = new bluebird_1.Promise(function (resolve, reject) { resolve(); });
        promise = promise.then(function () {
            return this.spawnProcess(this.Name, [
                this.File,
                readelfCommands.debug_dump + "=" + debugSections.info,
                readelfCommands.dwarf_depth + "=" + depth
            ], process_1.Process.PATH, {}, this.stdOut.bind(this), undefined, this.close.bind(this));
        }.bind(this));
        promise = promise.then(function () {
            return this.output;
        }.bind(this));
        return promise;
    }
    stdOut(data) {
        const content = Buffer.from(data).toString("utf-8");
        this.stream.write(content);
    }
    close(code) {
        this.stream.end();
    }
}
exports.ReadelfProcess = ReadelfProcess;
//# sourceMappingURL=readelf-process.js.map