import { Promise } from "bluebird";
import { readdir, unlink, existsSync } from "fs";
import { writeFile, readFile } from 'fs/promises';
import { join } from "path";
import { StringDecoder } from 'string_decoder';
import makeDir from "make-dir";
import xml2js from "xml2js";

export class Util {
    
    /**
     * Clear all content from the folder
     * @param folder Folder
     */
    public static emptyFolder(folder: string) {
        return new Promise(function(resolve: Function, reject: Function) {
            readdir(folder, (error, files) => {
                if(error) {
                    console.log("Error clearing folder: " + folder);
                    reject(error);
                }

                return Util.deleteFiles(folder, files)
                            .then(function() {
                                console.log("Files in folder: " + folder + " deleted");
                                return resolve();
                            })
                            .catch(function(error) {
                                console.log("Error deleting files in folder: " + folder);
                                return reject(error);
                            });
            });
        });
    }

    /**
     * Delete all files/folders from specified folder
     * @param folder Folder
     * @param files List of files/folders to be deleted
     */
    private static deleteFiles(folder: string, files: any) {
        let promises = new Array<any>();

        files.forEach(function(file: any, index: number) {
            promises.push(new Promise(function(resolve: Function, reject: Function) {
                unlink(join(folder, file), function(error) {
                    if(error) {
                        console.log("Error deleting files from folder: " + folder);
                        reject(error);
                    }

                    resolve();
                });
            }));
        });

        return Promise.all(promises);
    }

    /**
     * Create folder
     * @param folder Folder to be created (path)
     * @returns Promise
     */
    public static createFolder(folder: string) {
        return new Promise(function(resolve: Function, reject: Function) {
            makeDir(folder)
                .then(function(path) {
                    console.log("Directory created at: " + path);
                    resolve();
                })
                .catch(function(error) {
                    console.log("Error creating directory: " + error);
                    reject(error);
                });
        });
    }

    /**
     * Check if file/folder exists
     * @param path Path to file/folder
     * @returns true if file/folder exists, false otherwise
     */
    public static checkPathSync(path: string): boolean {
        return existsSync(path);
    }

    /**
     * Converts a buffer containing JSON data to an object
     * @param jsonBuffer Buffer containing JSON data from process output
     * @returns Parsed object
     */
    public static bufferToJson(jsonBuffer: any) {
        let decoder = new StringDecoder();
        let decodedBuffer = decoder.write(jsonBuffer);

        return JSON.parse(decodedBuffer);
    }

    /**
     * Writes content to a file asynchronously
     * @param filename Name of the file
     * @param fileContent Content to be written to the file
     * @returns Promise that resolves when the file is written
     */
    public static writeFile(filename: string, fileContent: any) {
        return writeFile(filename, fileContent)
            .then(function() {
                console.log("File " + filename + " saved");
            })
            .catch(function(error) {
                console.log(error);
                throw error;
            });
    }

    /**
     * Reads content from a file asynchronously
     * @param filename Name of the file
     * @param options Options for reading the file
     * @returns Promise that resolves with the file content
     */
    public static readFile(filename: string, options: any) {
        return readFile(filename, options)
        .then(function(data) {
            return data;
        })
        .catch(function(error) {
            console.log(error);
            throw error;
        });
    }

    /**
     * Transform object to xml
     * @param object Object to be transformed to xml
     * @returns xml object
     */
    public static createXml(object: any): any {
        const builder = new xml2js.Builder();
        const xml = builder.buildObject({ProjectImage: object});

        return xml;
    }

    public static formatAddressToHex(address: number): string {
        return '0x' + address.toString(16);
    }

    public static formatAddress(address: string | number): number {
        if(typeof address === 'string') {
            if(address.startsWith('0x')) {
                return parseInt(address, 16);
            }
            else {
                return parseInt('0x' + address, 16);
            }
        }

        return Number(address);
    }
    
}