import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { format } from 'url';
import { AppEventhHandler } from './backend/app-event-handler';
import { Configuration } from './backend/configuration';

class Main {
    private mainWindow: any;
    private appEventhHandler!: AppEventhHandler;
    private configuration!: Configuration;

    public init() {
        app.on('ready', this.onReady.bind(this));
        app.on('window-all-closed', this.onWindowAllClosed.bind(this));
        app.on('activate', this.onActivate.bind(this));
    }

    //#region Event Listeners
    private onReady() {
        this.createWindow();
        this.configuration = new Configuration();
        this.appEventhHandler = new AppEventhHandler(this.mainWindow, this.configuration);
    }

    private onWindowAllClosed() {
        if(process.platform !== 'darwin') {
            app.quit();
        }
    }

    private onActivate() {
        if(this.mainWindow === null) {
            this.createWindow();
        }
    }
    //#endregion

    private createWindow() {
        this.mainWindow = new BrowserWindow({
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

        this.mainWindow.loadURL(
            format({
                pathname: join(__dirname, '/dist/index.html'),
                protocol: "file:",
                slashes: true
            })
        );
        // open DevTools for debug purpose
        this.mainWindow.webContents.openDevTools();
    }
}

(new Main()).init();