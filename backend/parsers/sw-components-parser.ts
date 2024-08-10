import { SwComponent } from "../sw-component";
import { Util } from "../util";

export class SwComponentsParser {
    private file: string;

    constructor(file: string) {
        this.file = file;
    }

    /**
     * Load and parse software components JSON file
     * @returns Promise
     */
    public parseComponents() {
        return Util.readFile(this.file, { encoding: "utf-8" })
                .then(function(data: any) {
                    const jsonData = JSON.parse(data);

                    return jsonData.components.map((component: any) => new SwComponent(component.name, component.files));
                })
                .catch(function(error) {
                    console.log("Error parsing components");
                    throw error;
                });
    }
}