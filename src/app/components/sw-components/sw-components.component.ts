import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { IpcService } from '../../ipc.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { IpcChannels } from '../../../../backend/ipc-channels';
import { IpcMainEvent } from 'electron';
import { SymbolsService } from '../../symbols-service';
import { ComponentService } from '../../component-service';

@Component({
  selector: 'app-sw-components',
  standalone: true,
  imports: [CommonModule, MatListModule, FormsModule],
  templateUrl: './sw-components.component.html',
  styleUrl: './sw-components.component.scss'
})
export class SwComponentsComponent {
  components: Array<any>;
  selectedComponent: any;

  constructor(private ipc: IpcService,
              private zone: NgZone,
              private symbolsService: SymbolsService,
              private componentService: ComponentService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.components = new Array<any>();
    this.selectedComponent = null;
  }

  ngOnInit() {
    this.ipc.on(IpcChannels.GET_SW_COMPONENTS, this.onGetSwComponents.bind(this));
  }

  onSelectionChange(event: any) {
    this.symbolsService.sendSymbols(this.selectedComponent[0].SYMBOL);
    this.componentService.sendComponent(this.selectedComponent[0].$.name);
  }

  private onGetSwComponents(event: IpcMainEvent, ...args: any[]) {
    this.zone.run(function(this: SwComponentsComponent) {
      this.components = args[0].SWC;
      this.changeDetectorRef.detectChanges();
    }.bind(this));
  }
}
