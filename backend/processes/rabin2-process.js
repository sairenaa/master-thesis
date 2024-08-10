"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rabin2Process = exports.rabin2Commands = void 0;
const util_1 = require("../util");
const process_1 = require("./process");
const bluebird_1 = require("bluebird");
exports.rabin2Commands = {
    symbols: "-s", // symbols  
    outInJson: "-j", // output in json
};
class Rabin2Process extends process_1.Process {
    constructor(file) {
        super("rabin2", file);
        this.MAX_BUFFER = 1024 * 1024 * 4096;
    }
    getSymbolsJson() {
        return this.execProcess(this.Name, [
            exports.rabin2Commands.symbols,
            exports.rabin2Commands.outInJson
        ], process_1.Process.PATH, this.File, {
            maxBuffer: this.MAX_BUFFER
        })
            .then(function (data) {
            return new bluebird_1.Promise(function (resolve, reject) {
                let symbolsJson = util_1.Util.bufferToJson(data.stdout);
                resolve(symbolsJson);
            });
        }.bind(this))
            .catch(function (error) {
            return new bluebird_1.Promise(function (resolve, reject) {
                console.log("Error getting symbols: " + error);
                reject(error);
            });
        });
    }
}
exports.Rabin2Process = Rabin2Process;
//# sourceMappingURL=rabin2-process.js.map