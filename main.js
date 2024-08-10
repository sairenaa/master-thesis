"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const url_1 = require("url");
const app_event_handler_1 = require("./backend/app-event-handler");
const configuration_1 = require("./backend/configuration");
class Main {
    init() {
        electron_1.app.on('ready', this.onReady.bind(this));
        electron_1.app.on('window-all-closed', this.onWindowAllClosed.bind(this));
        electron_1.app.on('activate', this.onActivate.bind(this));
    }
    //#region Event Listeners
    onReady() {
        this.createWindow();
        this.configuration = new configuration_1.Configuration();
        this.appEventhHandler = new app_event_handler_1.AppEventhHandler(this.mainWindow, this.configuration);
    }
    onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    }
    onActivate() {
        if (this.mainWindow === null) {
            this.createWindow();
        }
    }
    //#endregion
    createWindow() {
        this.mainWindow = new electron_1.BrowserWindow({
            width: 800,
            height: 600,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        // center window
        this.mainWindow.center();
        // maximize
        this.mainWindow.maximize();
        // remove menu
        // this.mainWindow.removeMenu();
        this.mainWindow.loadURL((0, url_1.format)({
            pathname: (0, path_1.join)(__dirname, '/dist/index.html'),
            protocol: "file:",
            slashes: true
        }));
        // open DevTools for debug purpose
        this.mainWindow.webContents.openDevTools();
    }
}
(new Main()).init();
//# sourceMappingURL=main.js.map