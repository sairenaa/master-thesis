export enum IpcChannels {
  //#region Application level channels
  // minimize application F->B
  APP_MINIMIZE = 'app-minimize',
  // maximize application F->B
  APP_MAXIMIZE = 'app-maximize',
  // close application F->B
  APP_CLOSE = 'app-close',
  //#endregion

  //#region Side Menu channels
  // browse elf location F->B
  BROWSE_ELF_LOCATION = 'browse-elf-location',
  // ok in browsing elf location B->F
  BROWSE_ELF_LOCATION_OK = 'browse-elf-location-ok',
  // browse software components location F->B
  BROWSE_SW_COMPONENTS_LOCATION = 'browse-sw-components-location',
  // ok in browsing software components location B->F
  BROWSE_SW_COMPONENTS_LOCATION_OK = 'browse-sw-components-location-ok',
  // browse output location F->B
  BROWSE_OUTPUT_LOCATION = 'browse-output-location',
  // ok in browsing output location B->F
  BROWSE_OUTPUT_LOCATION_OK = 'browse-output-location-ok',
  // analyze elf file F->B
  ANALYZE_ELF = 'analyze-elf',
  // ok in analyzing elf file B-> F
  ANALYZE_ELF_OK = 'analyze-elf-ok',
  // error in analyzing elf file B->F
  ANALYZE_ELF_ERROR = 'analyze-elf-error',
  //#endregion

  // get software components B->F
  GET_SW_COMPONENTS = 'get-sw-components',

  // get software component data from database F->B
  GET_SW_COMPONENT_FROM_DB = 'get-sw-component-from-db',
  // ok in getting software component data from database B->F
  GET_SW_COMPONENT_FROM_DB_OK = 'get-sw-component-from-db-ok'
}