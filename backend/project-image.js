"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectImage = exports.SoftwareComponentNode = exports.XmlNode = void 0;
const util_1 = require("./util");
class XmlNode {
    addAttribute(name, value) {
        if (this.$ === undefined) {
            this.$ = {};
        }
        this.$[name] = value;
    }
    getAttribute(name) {
        return this.$[name];
    }
}
exports.XmlNode = XmlNode;
class SoftwareComponentNode extends XmlNode {
    constructor() {
        super();
        this.SYMBOL = new Array();
    }
    addSymbol(symbol) {
        this.SYMBOL.push(symbol);
    }
}
exports.SoftwareComponentNode = SoftwareComponentNode;
class ProjectImage extends XmlNode {
    constructor() {
        super();
        this.SWC = new Array();
    }
    addSoftwareComponentNode(softwareComponentNode) {
        this.SWC.push(softwareComponentNode);
    }
    createProjectImage(components) {
        for (let i = 0; i < components.length; i++) {
            let component = components[i];
            let swcNode = new SoftwareComponentNode();
            swcNode.addAttribute("name", component.Name);
            this.addSoftwareComponentNode(swcNode);
        }
        const xml = this.generateXml();
        return xml;
    }
    generateXml() {
        return util_1.Util.createXml(this);
    }
}
exports.ProjectImage = ProjectImage;
//# sourceMappingURL=project-image.js.map