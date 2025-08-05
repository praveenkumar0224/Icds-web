import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockChartComponent } from './block-chart.component';

describe('BlockChartComponent', () => {
  let component: BlockChartComponent;
  let fixture: ComponentFixture<BlockChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
