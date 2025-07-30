import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CoursesService } from '../shared/services/courses/courses.service';

import { SectorComponent } from './sector.component';

describe('CoursesComponent', () => {
  let component: SectorComponent;
  let fixture: ComponentFixture<SectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectorComponent ],
      providers: [
        {
          provide: CoursesService,
          useValue: jasmine.createSpyObj('CoursesService', ['getAllCourses', 'updateCourse', 'createCourse', 'deleteCourse'])
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
