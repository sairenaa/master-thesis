"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const bluebird_1 = require("bluebird");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const string_decoder_1 = require("string_decoder");
const make_dir_1 = __importDefault(require("make-dir"));
const xml2js_1 = __importDefault(require("xml2js"));
class Util {
    /**
     * Clear all content from the folder
     * @param folder Folder
     */
    static emptyFolder(folder) {
        return new bluebird_1.Promise(function (resolve, reject) {
            (0, fs_1.readdir)(folder, (error, files) => {
                if (error) {
                    console.log("Error clearing folder: " + folder);
                    reject(error);
                }
                return Util.deleteFiles(folder, files)
                    .then(function () {
                    console.log("Files in folder: " + folder + " deleted");
                    return resolve();
                })
                    .catch(function (error) {
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
    static deleteFiles(folder, files) {
        let promises = new Array();
        files.forEach(function (file, index) {
            promises.push(new bluebird_1.Promise(function (resolve, reject) {
                (0, fs_1.unlink)((0, path_1.join)(folder, file), function (error) {
                    if (error) {
                        console.log("Error deleting files from folder: " + folder);
                        reject(error);
                    }
                    resolve();
                });
            }));
        });
        return bluebird_1.Promise.all(promises);
    }
    /**
     * Create folder
     * @param folder Folder to be created (path)
     * @returns Promise
     */
    static createFolder(folder) {
        return new bluebird_1.Promise(function (resolve, reject) {
            (0, make_dir_1.default)(folder)
                .then(function (path) {
                console.log("Directory created at: " + path);
                resolve();
            })
                .catch(function (error) {
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
    static checkPathSync(path) {
        return (0, fs_1.existsSync)(path);
    }
    /**
     * Converts a buffer containing JSON data to an object
     * @param jsonBuffer Buffer containing JSON data from process output
     * @returns Parsed object
     */
    static bufferToJson(jsonBuffer) {
        let decoder = new string_decoder_1.StringDecoder();
        let decodedBuffer = decoder.write(jsonBuffer);
        return JSON.parse(decodedBuffer);
    }
    /**
     * Writes content to a file asynchronously
     * @param filename Name of the file
     * @param fileContent Content to be written to the file
     * @returns Promise that resolves when the file is written
     */
    static writeFile(filename, fileContent) {
        return (0, promises_1.writeFile)(filename, fileContent)
            .then(function () {
            console.log("File " + filename + " saved");
        })
            .catch(function (error) {
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
    static readFile(filename, options) {
        return (0, promises_1.readFile)(filename, options)
            .then(function (data) {
            return data;
        })
            .catch(function (error) {
            console.log(error);
            throw error;
        });
    }
    /**
     * Transform object to xml
     * @param object Object to be transformed to xml
     * @returns xml object
     */
    static createXml(object) {
        const builder = new xml2js_1.default.Builder();
        const xml = builder.buildObject({ ProjectImage: object });
        return xml;
    }
    static formatAddressToHex(address) {
        return '0x' + address.toString(16);
    }
    static formatAddress(address) {
        if (typeof address === 'string') {
            if (address.startsWith('0x')) {
                return parseInt(address, 16);
            }
            else {
                return parseInt('0x' + address, 16);
            }
        }
        return Number(address);
    }
}
exports.Util = Util;
//# sourceMappingURL=util.js.map