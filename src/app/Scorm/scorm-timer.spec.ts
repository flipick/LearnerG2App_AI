import { TestBed } from '@angular/core/testing';

import { ScormTimer } from './scorm-timer';

describe('ScormTimer', () => {
  let service: ScormTimer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScormTimer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
