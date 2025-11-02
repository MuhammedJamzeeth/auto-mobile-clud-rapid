import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Record {
  id: string;
  vin: string;
  description: string;
  serviceType: string;
  cost?: string;
  serviceDate: Date;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  vin: string;
  firstName: string;
  lastName: string;
  email: string;
  carMake: string;
  carModel: string;
  manufacturedDate: string;
  ageOfVehicle: number;
  records?: Record[];
}

export interface CreateRecordInput {
  vin: string;
  description: string;
  serviceType: string;
  cost?: string;
  serviceDate: Date;
}

export interface UpdateRecordInput {
  id: number;
  description?: string;
  serviceType?: string;
  cost?: string;
  serviceDate?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class RecordsService {
  private readonly apiUrl = 'http://localhost:4040/graphql';

  constructor(private http: HttpClient) {}

  /**
   * Fetch vehicle data along with its records using GraphQL Federation
   * This uses the federation query that combines data from vehicle-service and record-service
   */
  getVehicleWithRecords(vin: string): Observable<any> {
    const query = `
      query GetVehicleWithRecords($vin: String!) {
        vehicleByVin(vin: $vin) {
          id
          firstName
          lastName
          email
          carMake
          carModel
          vin
          manufacturedDate
          ageOfVehicle
          records {
            id
            description
            serviceType
            cost
            serviceDate
            createdAt
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: { vin },
    });
  }

  createRecord(input: CreateRecordInput): Observable<any> {
    const mutation = `
      mutation CreateRecord($input: CreateRecordInput!) {
        createRecord(createRecordInput: $input) {
          id
          vin
          description
          serviceType
          cost
          serviceDate
          createdAt
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query: mutation,
      variables: { input },
    });
  }

  updateRecord(input: UpdateRecordInput): Observable<any> {
    const mutation = `
      mutation UpdateRecord($input: UpdateRecordInput!) {
        updateRecord(updateRecordInput: $input) {
          id
          vin
          description
          serviceType
          cost
          serviceDate
          createdAt
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query: mutation,
      variables: { input },
    });
  }

  deleteRecord(id: number): Observable<any> {
    const mutation = `
      mutation DeleteRecord($id: Int!) {
        removeRecord(id: $id) {
          id
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query: mutation,
      variables: { id },
    });
  }
}
