import { BrowserWindow, dialog, ipcMain, IpcMainEvent } from "electron";
import { IpcChannels } from "./ipc-channels";
import { Configuration } from "./configuration";
import { Analyzer } from "./analyzer";
import { join } from "path";
import { Util } from "./util";

export class AppEventhHandler {
    private window: BrowserWindow;
    private configuration: Configuration;
    private analyzer!: Analyzer;

    get Window() {
        return this.window;
    }

    set Window(value: BrowserWindow) {
        this.window = value;
    }

    constructor(window: BrowserWindow, configuration: Configuration) {
        this.window = window;
        this.configuration = configuration;

        ipcMain.on(IpcChannels.APP_MINIMIZE, this.onAppMinimize.bind(this));
        ipcMain.on(IpcChannels.APP_MAXIMIZE, this.onAppMaximize.bind(this));
        ipcMain.on(IpcChannels.APP_CLOSE, this.onAppClose.bind(this));
        ipcMain.on(IpcChannels.BROWSE_ELF_LOCATION, this.onBrowseELFLocation.bind(this));
        ipcMain.on(IpcChannels.BROWSE_SW_COMPONENTS_LOCATION, this.onBrowseSwComponentsLocation.bind(this));
        ipcMain.on(IpcChannels.BROWSE_OUTPUT_LOCATION, this.onBrowseOutputLocation.bind(this));
        ipcMain.on(IpcChannels.ANALYZE_ELF, this.onAnalyzeELF.bind(this));
        ipcMain.on(IpcChannels.GET_SW_COMPONENT_FROM_DB, this.onGetSwComponentFromDb.bind(this));
    }

    //#region Application callbacks
    private onAppMinimize(event: IpcMainEvent, ...args: any[]){
        this.Window.minimize();
    }

    private onAppMaximize(event: IpcMainEvent, ...args: any[]){
        this.Window.isMaximized() ? this.Window.unmaximize() : this.Window.maximize();
    }

    private onAppClose(event: IpcMainEvent, ...args: any[]){
        this.Window.close();
    }
    //#endregion

    //#region Side Menu callbacks
    private onBrowseELFLocation(event: IpcMainEvent, ...args: any) {
        dialog.showOpenDialog(this.Window, {
            properties: ['openFile'],
            title: "Open ELF File"
        })
        .then(function(this: AppEventhHandler, result: any){
            if(result !== undefined && result.filePaths.length > 0) {
                this.Window.webContents.send(IpcChannels.BROWSE_ELF_LOCATION_OK, result.filePaths[0]);
            }
        }.bind(this));
    }

    private onBrowseSwComponentsLocation(event: IpcMainEvent, ...args: any) {
        dialog.showOpenDialog(this.Window, {
            properties: ['openFile'],
            title: "Open Software Components File",
            filters: [{
                name: "JSON Files",
                extensions: ["json"]
            }]
        })
        .then(function(this: AppEventhHandler, result: any){
            if(result !== undefined && result.filePaths.length > 0) {
                this.Window.webContents.send(IpcChannels.BROWSE_SW_COMPONENTS_LOCATION_OK, result.filePaths[0]);
            }
        }.bind(this));
    }

    private onBrowseOutputLocation(event: IpcMainEvent, ...args: any) {
        dialog.showOpenDialog(this.Window, {
            properties: ["openDirectory"],
            title: "Open Output Location"
        })
        .then(function(this: AppEventhHandler, result: any) {
            if(result !== undefined && result.filePaths.length > 0) {
                this.Window.webContents.send(IpcChannels.BROWSE_OUTPUT_LOCATION_OK, result.filePaths[0]);
            }
        }.bind(this));
    }

    private onAnalyzeELF(event: IpcMainEvent, ...args: any) {
        const elfLocation = args[0];
        const swComponentsLocation = args[1];
        const outputLocation = args[2];
        let tempFolderPath: string;
        let promise = new Promise(function(resolve: Function, reject: Function) { resolve(); });
        
        if(!Util.checkPathSync(elfLocation) || !Util.checkPathSync(swComponentsLocation) || !Util.checkPathSync(outputLocation)) {
            console.log("Error: Check input paths");
        }
        else {
            // init Configuration object
            this.configuration.init(elfLocation, swComponentsLocation, outputLocation);
            // set temp path
            tempFolderPath = join(this.configuration.Out, "temp");
            // init Analyzer object
            this.analyzer = new Analyzer(this.configuration, tempFolderPath);
    
            // clear temp folder if exists
            if(Util.checkPathSync(tempFolderPath)) {
                promise = promise.then(function() {
                    return Util.emptyFolder(tempFolderPath);
                });
            }
            // otherwise create temp folder
            else {
                promise = promise.then(function() {
                    return Util.createFolder(tempFolderPath);
                });
            }
    
            // extract dwarf info
            promise = promise.then(function(this: AppEventhHandler) {
                return this.analyzer.getDwarfInfo();
            }.bind(this));
    
            // get symbols
            promise = promise.then(function(this: AppEventhHandler) {
                return this.analyzer.getSymbols();
            }.bind(this));
    
            // parse dwarf information
            promise = promise.then(function(this: AppEventhHandler) {
                return this.analyzer.parseCompilationUnits();
            }.bind(this));
    
            // parse and init software components
            promise = promise.then(function(this: AppEventhHandler) {
                return this.analyzer.initSwComponents();
            }.bind(this));
    
            // generate project image
            promise = promise.then(function(this: AppEventhHandler) {
                return this.analyzer.generateProjectImage();
            }.bind(this));
    
            // send object to frontend
            promise = promise.then(function(this: AppEventhHandler) {
                return new Promise(function(this: AppEventhHandler, resolve: Function, reject: Function) {
                    this.Window.webContents.send(IpcChannels.GET_SW_COMPONENTS, this.analyzer.ProjectImage);
                    resolve();
                }.bind(this));
            }.bind(this));
    
            promise = promise.catch(function(error) {
                console.log(error);
            });
        }
    }
    //#endregion

    private onGetSwComponentFromDb(event: IpcMainEvent, ...args: any) {
        const component = args[0];

        return this.analyzer.getSwComponent(component, this.configuration.Elf)
                .then(function(this: AppEventhHandler, result: any) {
                    return new Promise(function(this: AppEventhHandler, resolve: Function, reject: Function) {
                        this.Window.webContents.send(IpcChannels.GET_SW_COMPONENT_FROM_DB_OK, result);
                        resolve();
                    }.bind(this))
                }.bind(this));
    }
}