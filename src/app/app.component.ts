import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { MainWindowComponent } from './components/main-window/main-window.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TitleBarComponent, MainWindowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ELFAnalyzer';
}
