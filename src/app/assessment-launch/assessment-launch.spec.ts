import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentLaunch } from './assessment-launch';

describe('AssessmentLaunch', () => {
  let component: AssessmentLaunch;
  let fixture: ComponentFixture<AssessmentLaunch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentLaunch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentLaunch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
