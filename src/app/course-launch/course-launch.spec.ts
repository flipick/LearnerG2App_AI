import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseLaunch } from './course-launch';

describe('CourseLaunch', () => {
  let component: CourseLaunch;
  let fixture: ComponentFixture<CourseLaunch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseLaunch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseLaunch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
