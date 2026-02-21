import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysticComponent } from './analystic.component';

describe('AnalysticComponent', () => {
  let component: AnalysticComponent;
  let fixture: ComponentFixture<AnalysticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysticComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnalysticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
