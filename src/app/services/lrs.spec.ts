import { TestBed } from '@angular/core/testing';

import { LRS } from './lrs';

describe('LRS', () => {
  let service: LRS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LRS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
