export class Configuration {
    static readonly TEMP = "temp";
    
    private elf: string;
    private swComponents: string;
    private output: string;

    //#region Getters
    get Elf() {
        return this.elf;
    }

    get SwComponents() {
        return this.swComponents;
    }

    get Out() {
        return this.output;
    }
    //#endregion

    constructor() {
        this.elf = "";
        this.swComponents = "";
        this.output = "";
    }

    public init(elf: string, swComponents: string, output: string) {
        this.elf = elf;
        this.swComponents = swComponents;
        this.output = output;
    }
}