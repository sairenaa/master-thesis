"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEventhHandler = void 0;
const electron_1 = require("electron");
const ipc_channels_1 = require("./ipc-channels");
const analyzer_1 = require("./analyzer");
const path_1 = require("path");
const util_1 = require("./util");
class AppEventhHandler {
    get Window() {
        return this.window;
    }
    set Window(value) {
        this.window = value;
    }
    constructor(window, configuration) {
        this.window = window;
        this.configuration = configuration;
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.APP_MINIMIZE, this.onAppMinimize.bind(this));
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.APP_MAXIMIZE, this.onAppMaximize.bind(this));
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.APP_CLOSE, this.onAppClose.bind(this));
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.BROWSE_ELF_LOCATION, this.onBrowseELFLocation.bind(this));
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.BROWSE_SW_COMPONENTS_LOCATION, this.onBrowseSwComponentsLocation.bind(this));
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.BROWSE_OUTPUT_LOCATION, this.onBrowseOutputLocation.bind(this));
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.ANALYZE_ELF, this.onAnalyzeELF.bind(this));
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.GET_SW_COMPONENT_FROM_DB, this.onGetSwComponentFromDb.bind(this));
    }
    //#region Application callbacks
    onAppMinimize(event, ...args) {
        this.Window.minimize();
    }
    onAppMaximize(event, ...args) {
        this.Window.isMaximized() ? this.Window.unmaximize() : this.Window.maximize();
    }
    onAppClose(event, ...args) {
        this.Window.close();
    }
    //#endregion
    //#region Side Menu callbacks
    onBrowseELFLocation(event, ...args) {
        electron_1.dialog.showOpenDialog(this.Window, {
            properties: ['openFile'],
            title: "Open ELF File"
        })
            .then(function (result) {
            if (result !== undefined && result.filePaths.length > 0) {
                this.Window.webContents.send(ipc_channels_1.IpcChannels.BROWSE_ELF_LOCATION_OK, result.filePaths[0]);
            }
        }.bind(this));
    }
    onBrowseSwComponentsLocation(event, ...args) {
        electron_1.dialog.showOpenDialog(this.Window, {
            properties: ['openFile'],
            title: "Open Software Components File",
            filters: [{
                    name: "JSON Files",
                    extensions: ["json"]
                }]
        })
            .then(function (result) {
            if (result !== undefined && result.filePaths.length > 0) {
                this.Window.webContents.send(ipc_channels_1.IpcChannels.BROWSE_SW_COMPONENTS_LOCATION_OK, result.filePaths[0]);
            }
        }.bind(this));
    }
    onBrowseOutputLocation(event, ...args) {
        electron_1.dialog.showOpenDialog(this.Window, {
            properties: ["openDirectory"],
            title: "Open Output Location"
        })
            .then(function (result) {
            if (result !== undefined && result.filePaths.length > 0) {
                this.Window.webContents.send(ipc_channels_1.IpcChannels.BROWSE_OUTPUT_LOCATION_OK, result.filePaths[0]);
            }
        }.bind(this));
    }
    onAnalyzeELF(event, ...args) {
        const elfLocation = args[0];
        const swComponentsLocation = args[1];
        const outputLocation = args[2];
        let tempFolderPath;
        let promise = new Promise(function (resolve, reject) { resolve(); });
        if (!util_1.Util.checkPathSync(elfLocation) || !util_1.Util.checkPathSync(swComponentsLocation) || !util_1.Util.checkPathSync(outputLocation)) {
            console.log("Error: Check input paths");
        }
        else {
            // init Configuration object
            this.configuration.init(elfLocation, swComponentsLocation, outputLocation);
            // set temp path
            tempFolderPath = (0, path_1.join)(this.configuration.Out, "temp");
            // init Analyzer object
            this.analyzer = new analyzer_1.Analyzer(this.configuration, tempFolderPath);
            // clear temp folder if exists
            if (util_1.Util.checkPathSync(tempFolderPath)) {
                promise = promise.then(function () {
                    return util_1.Util.emptyFolder(tempFolderPath);
                });
            }
            // otherwise create temp folder
            else {
                promise = promise.then(function () {
                    return util_1.Util.createFolder(tempFolderPath);
                });
            }
            // extract dwarf info
            promise = promise.then(function () {
                return this.analyzer.getDwarfInfo();
            }.bind(this));
            // get symbols
            promise = promise.then(function () {
                return this.analyzer.getSymbols();
            }.bind(this));
            // parse dwarf information
            promise = promise.then(function () {
                return this.analyzer.parseCompilationUnits();
            }.bind(this));
            // parse and init software components
            promise = promise.then(function () {
                return this.analyzer.initSwComponents();
            }.bind(this));
            // generate project image
            promise = promise.then(function () {
                return this.analyzer.generateProjectImage();
            }.bind(this));
            // send object to frontend
            promise = promise.then(function () {
                return new Promise(function (resolve, reject) {
                    this.Window.webContents.send(ipc_channels_1.IpcChannels.GET_SW_COMPONENTS, this.analyzer.ProjectImage);
                    resolve();
                }.bind(this));
            }.bind(this));
            promise = promise.catch(function (error) {
                console.log(error);
            });
        }
    }
    //#endregion
    onGetSwComponentFromDb(event, ...args) {
        const component = args[0];
        return this.analyzer.getSwComponent(component, this.configuration.Elf)
            .then(function (result) {
            return new Promise(function (resolve, reject) {
                this.Window.webContents.send(ipc_channels_1.IpcChannels.GET_SW_COMPONENT_FROM_DB_OK, result);
                resolve();
            }.bind(this));
        }.bind(this));
    }
}
exports.AppEventhHandler = AppEventhHandler;
//# sourceMappingURL=app-event-handler.js.map