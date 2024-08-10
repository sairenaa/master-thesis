"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
class Configuration {
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
    init(elf, swComponents, output) {
        this.elf = elf;
        this.swComponents = swComponents;
        this.output = output;
    }
}
exports.Configuration = Configuration;
Configuration.TEMP = "temp";
//# sourceMappingURL=configuration.js.map