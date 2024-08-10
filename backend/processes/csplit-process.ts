import { Process } from "./process";
import { join } from "path";

export const csplitCommands = {
    prefix : "-f",
    keep : "-k",
    allFiles : "{*}"
}

export class CsplitProcess extends Process {
    // compilation unit prefix
    private readonly COMPILATION_UNIT_PREFIX = "cu";
    // regex for compilation unit
    private readonly REGEX_CU = this.COMPILATION_UNIT_PREFIX + "[0-9]+";

    constructor(file: string) {
        super("csplit", file);
    }

    public splitCompilationUnits(tempFolderPath: string) {
        return this.execProcess(
            this.Name,
            [
                csplitCommands.prefix,
                join(tempFolderPath, this.COMPILATION_UNIT_PREFIX),
                csplitCommands.keep,
                this.File,
                '\'' + "/Compilation/" + '\'',
                '\'' + csplitCommands.allFiles + '\''
            ],
            Process.PATH
        );
    }
}