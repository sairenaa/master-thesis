export class SwComponent {
    private name: string;
    private files: Array<string>;

    constructor(name: string, files: Array<string>) {
        this.name = name;
        this.files = files;
    }

    get Name() {
        return this.name;
    }

    get Files() {
        return this.files;
    }
}