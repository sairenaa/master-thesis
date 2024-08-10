import { SwComponent } from "./sw-component";
import { Util } from "./util";

export class XmlNode {
    public $: any;

    public addAttribute(name: string, value: any) {
        if(this.$ === undefined) {
            this.$ = {};
        }

        this.$[name] = value;
    }

    public getAttribute(name: string) {
        return this.$[name];
    }
}

export class SoftwareComponentNode extends XmlNode {
    public SYMBOL: Array<XmlNode>;

    constructor() {
        super();
        this.SYMBOL = new Array<XmlNode>();
    }

    public addSymbol(symbol: XmlNode) {
        this.SYMBOL.push(symbol);
    }
}

export class ProjectImage extends XmlNode {
    public SWC: Array<SoftwareComponentNode>;

    constructor() {
        super();
        this.SWC = new Array<SoftwareComponentNode>();
    }
    
    public addSoftwareComponentNode(softwareComponentNode: SoftwareComponentNode) {
        this.SWC.push(softwareComponentNode);
    }

    public createProjectImage(components: Array<SwComponent>): any {
        for(let i = 0; i < components.length; i++) {
            let component = components[i];
            let swcNode = new SoftwareComponentNode();

            swcNode.addAttribute("name", component.Name);

            this.addSoftwareComponentNode(swcNode);
        }

        const xml = this.generateXml();

        return xml;
    }

    private generateXml(): any {
        return Util.createXml(this);
    }
}