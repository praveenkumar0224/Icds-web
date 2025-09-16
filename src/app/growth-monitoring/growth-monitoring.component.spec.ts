import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowthMonitoringComponent } from './growth-monitoring.component';

describe('GrowthMonitoringComponent', () => {
  let component: GrowthMonitoringComponent;
  let fixture: ComponentFixture<GrowthMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrowthMonitoringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrowthMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
