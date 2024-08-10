"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwComponentsParser = void 0;
const sw_component_1 = require("../sw-component");
const util_1 = require("../util");
class SwComponentsParser {
    constructor(file) {
        this.file = file;
    }
    /**
     * Load and parse software components JSON file
     * @returns Promise
     */
    parseComponents() {
        return util_1.Util.readFile(this.file, { encoding: "utf-8" })
            .then(function (data) {
            const jsonData = JSON.parse(data);
            return jsonData.components.map((component) => new sw_component_1.SwComponent(component.name, component.files));
        })
            .catch(function (error) {
            console.log("Error parsing components");
            throw error;
        });
    }
}
exports.SwComponentsParser = SwComponentsParser;
//# sourceMappingURL=sw-components-parser.js.map