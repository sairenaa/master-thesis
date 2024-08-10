"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Process = void 0;
const path_1 = require("path");
const util_1 = require("util");
const bluebird_1 = require("bluebird");
const child_process_1 = require("child_process");
class Process {
    /**
     * Constructor
     * @param name Name of the process
     * @param file Path to the file
     */
    constructor(name, file) {
        this.name = name;
        this.file = file;
        this.execs = new Array();
    }
    //#region Getters
    get Name() {
        return this.name;
    }
    get File() {
        return this.file;
    }
    //#endregion
    /**
     * Spawns a new process with the given binary and commands
     * @param binary Binary to be executed
     * @param commands Commands to run the process
     * @param binaryPath Path to the process binaries
     * @param options Additional options for the process
     * @param stdOutCallback Callback function for handling stdout data
     * @param stdErrCallback Callback function for handling stderr data
     * @param closeCallback Callback function for handling process close event
     * @param errCallback Callback function for handling errors
     * @returns Promise
     */
    spawnProcess(binary, commands, binaryPath, options, stdOutCallback, stdErrCallback, closeCallback, errCallback) {
        return new bluebird_1.Promise(function (resolve, reject) {
            let s = (0, child_process_1.spawn)((0, path_1.join)(binaryPath, binary), commands, options);
            this.execs.push(s);
            // stdout event
            if (stdOutCallback) {
                s.stdout.on('data', (data) => {
                    stdOutCallback(data);
                });
            }
            // stderr event
            if (stdErrCallback) {
                s.stderr.on('data', (data) => {
                    stdErrCallback(data);
                });
            }
            // close event
            s.on('close', (code) => {
                if (closeCallback) {
                    closeCallback(code);
                }
                resolve();
            });
            // error event
            s.on('error', (err) => {
                if (errCallback) {
                    errCallback();
                }
                else {
                    console.log(err);
                }
                reject();
            });
        }.bind(this));
    }
    /**
     * Execute process as child process
     * @param binary Binary to be executed
     * @param commands Commands to run the process
     * @param binaryPath Path to the process binaries
     * @param filePath Path to the file
     * @param options Additional options for the process
     * @returns Promise
     */
    execProcess(binary, commands, binaryPath, filePath, options) {
        let args = commands;
        if (filePath) {
            args.push(filePath);
        }
        const execFilePromise = (0, util_1.promisify)(child_process_1.execFile);
        let runningProcess = execFilePromise((0, path_1.join)(binaryPath, binary), args, options);
        this.execs.push(runningProcess.child);
        return runningProcess;
    }
}
exports.Process = Process;
Process.PATH = (0, path_1.join)(__dirname, '..', '..', "bin");
//# sourceMappingURL=process.js.map