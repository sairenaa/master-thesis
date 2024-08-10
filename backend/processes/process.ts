import { join } from "path";
import { promisify } from 'util';
import { Promise } from 'bluebird';
import { ChildProcess, spawn, execFile } from "child_process";

export class Process {
    static readonly PATH = join(__dirname, '..', '..', "bin");

    private name: string;
    private file: string;
    private execs: ChildProcess[];

    /**
     * Constructor
     * @param name Name of the process
     * @param file Path to the file
     */
    constructor(name: string, file: string) {
        this.name = name;
        this.file = file;
        this.execs = new Array<ChildProcess>();
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
    public spawnProcess(binary: string,
                        commands: Array<string>,
                        binaryPath: string,
                        options?: any,
                        stdOutCallback?: Function,
                        stdErrCallback?: Function,                                 
                        closeCallback?: Function,
                        errCallback?: Function) {
        return new Promise(function(this: Process, resolve: Function, reject: Function) {
            let s = spawn(join(binaryPath, binary), commands, options);
            this.execs.push(s);

            // stdout event
            if(stdOutCallback) {
                s.stdout.on('data', (data) => {
                    stdOutCallback(data);
                });
            }
            // stderr event
            if(stdErrCallback) {
                s.stderr.on('data', (data) => {
                    stdErrCallback(data);
                });
            }
            // close event
            s.on('close', (code) => {
                if(closeCallback) {
                    closeCallback(code);
                }

                resolve();
            });
            // error event
            s.on('error', (err) => {
                if(errCallback) {
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
    public execProcess(binary: string, commands: Array<string>, binaryPath: string, filePath?: string, options?: any) {
        let args = commands;

        if(filePath) {
            args.push(filePath);
        }

        const execFilePromise = promisify(execFile);
        let runningProcess = execFilePromise(join(binaryPath, binary), args, options);

        this.execs.push(runningProcess.child);

        return runningProcess;
    }
}