import { TestBed } from '@angular/core/testing';

import { ADL } from './adl';

describe('ADL', () => {
  let service: ADL;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ADL);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
