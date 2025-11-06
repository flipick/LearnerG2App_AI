import { TestBed } from '@angular/core/testing';

import { ScormToXAPIFunctions } from './scorm-to-xapifunctions';

describe('ScormToXAPIFunctions', () => {
  let service: ScormToXAPIFunctions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScormToXAPIFunctions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
