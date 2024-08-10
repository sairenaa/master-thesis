import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { IpcService } from '../../ipc.service';
import { IpcChannels } from '../../../../backend/ipc-channels';
import { IpcMainEvent } from 'electron';
import { SwComponentsComponent } from '../sw-components/sw-components.component';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, SwComponentsComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  public elfLocation: string;
  public swComponentsLocation: string;
  public outputLocation: string;

  constructor(private ipc: IpcService,
              private zone: NgZone
  ) {
    this.elfLocation = "";
    this.swComponentsLocation = "";
    this.outputLocation = "";
  }

  ngOnInit() {
    this.ipc.on(IpcChannels.BROWSE_ELF_LOCATION_OK, this.onBrowseELFLocationOk.bind(this));
    this.ipc.on(IpcChannels.BROWSE_SW_COMPONENTS_LOCATION_OK, this.onBrowseSwComponentsLocationOk.bind(this));
    this.ipc.on(IpcChannels.BROWSE_OUTPUT_LOCATION_OK, this.onBrowseOutputLocationOk.bind(this));
  }

  //#region Button Event listeners
  onBrowseELFLocation(event: any) {
    this.ipc.send(IpcChannels.BROWSE_ELF_LOCATION);
  }

  onBrowseSwComponentsLocation(event: any) {
    this.ipc.send(IpcChannels.BROWSE_SW_COMPONENTS_LOCATION);
  }

  onBrowseOutputLocation(event: any) {
    this.ipc.send(IpcChannels.BROWSE_OUTPUT_LOCATION);
  }

  onAnalyze(event: any) {
    this.ipc.send(IpcChannels.ANALYZE_ELF, this.elfLocation, this.swComponentsLocation, this.outputLocation);
  }
  //#endregion

  private onBrowseELFLocationOk(event: IpcMainEvent, ...args: any[]) {
    this.zone.run(function(this: SideMenuComponent) {
      this.elfLocation = args[0];
    }.bind(this));
  }

  private onBrowseSwComponentsLocationOk(event: IpcMainEvent, ...args: any[]) {
    this.zone.run(function(this: SideMenuComponent) {
      this.swComponentsLocation = args[0];
    }.bind(this));
  }

  private onBrowseOutputLocationOk(event: IpcMainEvent, ...args: any[]) {
    this.zone.run(function(this: SideMenuComponent) {
      this.outputLocation = args[0];
    }.bind(this));
  }
}
