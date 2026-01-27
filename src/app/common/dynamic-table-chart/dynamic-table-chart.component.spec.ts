import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTableChartComponent } from './dynamic-table-chart.component';

describe('DynamicTableChartComponent', () => {
  let component: DynamicTableChartComponent;
  let fixture: ComponentFixture<DynamicTableChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicTableChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTableChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
