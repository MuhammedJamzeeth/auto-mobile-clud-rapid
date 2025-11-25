import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehicle } from '../components/models/vehicle.type';

@Injectable({
  providedIn: 'root',
})
export class VehicleListService {
  http = inject(HttpClient);
  vehicles: Vehicle[] = [];
  page = 1;
  limit = 100;
  total = 0;
  totalPages = 1;
  search = '';
  private readonly apiUrl = 'http://localhost:4040/graphql';

  loadVehicles(
    page: number = this.page,
    limit: number = this.limit,
    filter?: any
  ): Observable<any> {
    const query = `query Vehicles($page:Int,$limit:Int,$filter:VehicleFilterDto){ vehicles(page:$page, limit:$limit, filter:$filter){ vehicles{ id firstName lastName email carMake carModel vin manufacturedDate ageOfVehicle } total page totalPages } }`;
    const variables: any = { page, limit };
    if (filter) variables.filter = filter;
    return this.http.post<any>(this.apiUrl, { query, variables });
  }

  updateVehicle(vehicle: Vehicle): Observable<any> {
    const mutation = `mutation UpdateVehicle($id:Int! ,$input: UpdateVehicleDto!){ updateVehicle(id:$id, updateVehicleInput:$input){ id } }`;
    // Build input object - keep the same fields as the Vehicle type
    const input = {
      firstName: vehicle.firstName,
      lastName: vehicle.lastName,
      email: vehicle.email,
      carMake: vehicle.carMake,
      carModel: vehicle.carModel,
      vin: vehicle.vin,
      manufacturedDate: vehicle.manufacturedDate,
      // ageOfVehicle: vehicle.ageOfVehicle,
    };
    const id = Number(vehicle.id);
    const variables = { id, input };
    return this.http.post<any>(this.apiUrl, { query: mutation, variables });
  }

  deleteVehicle(id: number): Observable<any> {
    const mutation = `mutation RemoveVehicle($id:Int!){ removeVehicle(id:$id){ message } }`;
    const variables = { id: Number(id) };
    return this.http.post<any>(this.apiUrl, { query: mutation, variables });
  }
}
