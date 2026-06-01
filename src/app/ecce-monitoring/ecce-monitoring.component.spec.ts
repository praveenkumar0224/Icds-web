import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcceMonitoringComponent } from './ecce-monitoring.component';

describe('EcceMonitoringComponent', () => {
  let component: EcceMonitoringComponent;
  let fixture: ComponentFixture<EcceMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcceMonitoringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcceMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
