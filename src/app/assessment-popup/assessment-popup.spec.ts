import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentPopup } from './assessment-popup';

describe('AssessmentPopup', () => {
  let component: AssessmentPopup;
  let fixture: ComponentFixture<AssessmentPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
