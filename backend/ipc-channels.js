"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcChannels = void 0;
var IpcChannels;
(function (IpcChannels) {
    //#region Application level channels
    // minimize application F->B
    IpcChannels["APP_MINIMIZE"] = "app-minimize";
    // maximize application F->B
    IpcChannels["APP_MAXIMIZE"] = "app-maximize";
    // close application F->B
    IpcChannels["APP_CLOSE"] = "app-close";
    //#endregion
    //#region Side Menu channels
    // browse elf location F->B
    IpcChannels["BROWSE_ELF_LOCATION"] = "browse-elf-location";
    // ok in browsing elf location B->F
    IpcChannels["BROWSE_ELF_LOCATION_OK"] = "browse-elf-location-ok";
    // browse software components location F->B
    IpcChannels["BROWSE_SW_COMPONENTS_LOCATION"] = "browse-sw-components-location";
    // ok in browsing software components location B->F
    IpcChannels["BROWSE_SW_COMPONENTS_LOCATION_OK"] = "browse-sw-components-location-ok";
    // browse output location F->B
    IpcChannels["BROWSE_OUTPUT_LOCATION"] = "browse-output-location";
    // ok in browsing output location B->F
    IpcChannels["BROWSE_OUTPUT_LOCATION_OK"] = "browse-output-location-ok";
    // analyze elf file F->B
    IpcChannels["ANALYZE_ELF"] = "analyze-elf";
    // ok in analyzing elf file B-> F
    IpcChannels["ANALYZE_ELF_OK"] = "analyze-elf-ok";
    // error in analyzing elf file B->F
    IpcChannels["ANALYZE_ELF_ERROR"] = "analyze-elf-error";
    //#endregion
    // get software components B->F
    IpcChannels["GET_SW_COMPONENTS"] = "get-sw-components";
    // get software component data from database F->B
    IpcChannels["GET_SW_COMPONENT_FROM_DB"] = "get-sw-component-from-db";
    // ok in getting software component data from database B->F
    IpcChannels["GET_SW_COMPONENT_FROM_DB_OK"] = "get-sw-component-from-db-ok";
})(IpcChannels || (exports.IpcChannels = IpcChannels = {}));
//# sourceMappingURL=ipc-channels.js.map