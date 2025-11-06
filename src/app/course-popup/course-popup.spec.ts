import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePopup } from './course-popup';

describe('CoursePopup', () => {
  let component: CoursePopup;
  let fixture: ComponentFixture<CoursePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
