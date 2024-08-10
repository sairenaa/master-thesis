import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { ContentWindowComponent } from '../content-window/content-window.component';

@Component({
  selector: 'app-main-window',
  standalone: true,
  imports: [CommonModule, SideMenuComponent, ContentWindowComponent],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.scss'
})
export class MainWindowComponent {

}
