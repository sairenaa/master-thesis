import { Component } from '@angular/core';
import { SymbolsComponent } from '../symbols/symbols.component';
import { GraphComponent } from '../graph/graph.component';

@Component({
  selector: 'app-content-window',
  standalone: true,
  imports: [SymbolsComponent, GraphComponent],
  templateUrl: './content-window.component.html',
  styleUrl: './content-window.component.scss'
})
export class ContentWindowComponent {

}
