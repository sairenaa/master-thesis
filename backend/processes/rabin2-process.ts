import { Util } from "../util";
import { Process } from "./process";
import { Promise } from "bluebird";

export const rabin2Commands = {
    symbols : "-s",         // symbols  
    outInJson: "-j",        // output in json
 }

export class Rabin2Process extends Process {
    readonly MAX_BUFFER = 1024 * 1024 * 4096;

    constructor(file: string) {
        super("rabin2", file);
    }

    public getSymbolsJson() {
        return this.execProcess(
            this.Name, 
            [
                rabin2Commands.symbols,
                rabin2Commands.outInJson
            ],
            Process.PATH,
            this.File,
            {
                maxBuffer: this.MAX_BUFFER
            }
        )
        .then(function(data: any) {
            return new Promise(function(resolve: Function, reject: Function) {
                let symbolsJson = Util.bufferToJson(data.stdout);

                resolve(symbolsJson);
            });
        }.bind(this))
        .catch(function(error) {
            return new Promise(function(resolve: Function, reject: Function) {
                console.log("Error getting symbols: " + error);

                reject(error);
            });
        });
    }
}