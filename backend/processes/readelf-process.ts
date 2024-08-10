import { Process } from "./process";
import { WriteStream, createWriteStream } from "fs";
import { Promise } from "bluebird";

const readelfCommands = {
    // dump debug section
    debug_dump: "--debug-dump",
    // limit the dump to n children in depth
    // NOTE: used only with .debug_info section
    dwarf_depth: "--dwarf-depth"
}

const debugSections = {
    info: "info"
}

export class ReadelfProcess extends Process {
    private output!: string;
    private stream!: WriteStream;

    constructor(file: string) {
        super("readelf", file);
    }

    /**
     * Get dwarf .debug_info section
     * @param depth Node depth
     * @param output Path to output
     */
    public getDwarfInfoSection(depth: number, output: string) {
        this.output = output;
        this.stream = createWriteStream(output, {flags: 'a'});

        let promise = new Promise(function(resolve: Function, reject: Function) { resolve(); });

        promise = promise.then(function(this: ReadelfProcess) {
            return this.spawnProcess(
                this.Name,
                [
                    this.File,
                    readelfCommands.debug_dump + "=" + debugSections.info,
                    readelfCommands.dwarf_depth + "=" + depth
                ],
                Process.PATH,
                {},
                this.stdOut.bind(this),
                undefined,
                this.close.bind(this)
            );
        }.bind(this));

        promise = promise.then(function(this: ReadelfProcess) {
            return this.output;
        }.bind(this));

        return promise;
    }

    private stdOut(data: any) {
        const content = Buffer.from(data).toString("utf-8");
        this.stream.write(content);
    }

    private close(code: any) {
        this.stream.end();
    }
}