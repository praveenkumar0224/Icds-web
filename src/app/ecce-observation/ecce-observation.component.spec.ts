import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcceObservationComponent } from './ecce-observation.component';

describe('EcceObservationComponent', () => {
  let component: EcceObservationComponent;
  let fixture: ComponentFixture<EcceObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcceObservationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcceObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});