import { TestBed } from '@angular/core/testing';

import { XAPI } from './xapi';

describe('XAPI', () => {
  let service: XAPI;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XAPI);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
