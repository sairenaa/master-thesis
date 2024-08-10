import { Component } from '@angular/core';
import { IpcService } from '../../ipc.service';
import { IpcChannels } from '../../../../backend/ipc-channels';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [],
  templateUrl: './title-bar.component.html',
  styleUrl: './title-bar.component.scss'
})
export class TitleBarComponent {

  constructor(private ipc: IpcService){}

  onAppMinimize(){
    this.ipc.send(IpcChannels.APP_MINIMIZE, []);
  }

  onAppMaximize(){
    this.ipc.send(IpcChannels.APP_MAXIMIZE, []);
  }

  onAppClose(){
    this.ipc.send(IpcChannels.APP_CLOSE, []);
  }
}
