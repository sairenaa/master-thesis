import { IpcRenderer } from 'electron';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IpcService {

    private ipcRenderer: IpcRenderer;

    constructor(){
        if(!window || !window.process || !window.require){
            throw new Error('Unable to require renderer process!');
        }

        this.ipcRenderer = window.require('electron').ipcRenderer;
    }

    /**
     * Listens to channel, when a new message arrives listener would be called
     * with listener(event, args...)
     * @param channel 
     * @param listener 
     */
    public on(channel: string, listener: any): void {
        if(!this.ipcRenderer){
            throw new Error('IpcRenderer is not available!');
        }

        this.ipcRenderer.on(channel, listener);
    }

    /**
     * Removes listener from the listener array for the specified channel
     * @param channel 
     * @param listener 
     */
    public removeListener(channel: string, listener: any): void {
        if(!this.ipcRenderer){
            throw new Error('IpcRenderer is not available!');
        }

        this.ipcRenderer.removeListener(channel, listener);
    }

    /**
     * Send an async message to the main process via channel, along with args
     * @param channel 
     * @param args 
     */
    public send(channel: string, ...args: any[]): void {
        if(!this.ipcRenderer){
            throw new Error('IpcRenderer is not available!');
        }

        this.ipcRenderer.send(channel, ...args);
    }
}