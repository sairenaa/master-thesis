import { ChangeDetectorRef, Component } from '@angular/core'
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { SymbolsService } from '../../symbols-service';

interface Symbol {
  $: {
    name: string;
    scope: string;
    type: string;
    address: string;
    size: string;
    filename: string;
  };
}

@Component({
  selector: 'app-symbols',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, FormsModule],
  templateUrl: './symbols.component.html',
  styleUrl: './symbols.component.scss'
})
export class SymbolsComponent {
  displayedColumns = ['name', 'scope', 'type', 'address', 'size', 'file'];
  dataSource: Symbol[] = [];

  constructor(private symbolsService: SymbolsService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.symbolsService.fetch$.subscribe(this.onShowSymbols.bind(this));
  }

  ngOnInit() {

  }

  private onShowSymbols(symbols: any) {
      this.dataSource = symbols;
      this.changeDetectorRef.detectChanges();
  }

  getTotalSize(): number {
    let totalSize = 0;
    for (let element of this.dataSource) {
      totalSize += Number(element.$.size);
    }
    return totalSize;
  }
}
