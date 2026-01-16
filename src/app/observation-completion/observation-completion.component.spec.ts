import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationCompletionComponent } from './observation-completion.component';

describe('ObservationCompletionComponent', () => {
  let component: ObservationCompletionComponent;
  let fixture: ComponentFixture<ObservationCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservationCompletionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
