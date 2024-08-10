import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwComponentsComponent } from './sw-components.component';

describe('SwComponentsComponent', () => {
  let component: SwComponentsComponent;
  let fixture: ComponentFixture<SwComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwComponentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SwComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
