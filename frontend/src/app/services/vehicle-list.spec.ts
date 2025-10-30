import { TestBed } from '@angular/core/testing';

import { VehicleListService } from './vehicle-list';

describe('VehicleListService', () => {
  let service: VehicleListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
