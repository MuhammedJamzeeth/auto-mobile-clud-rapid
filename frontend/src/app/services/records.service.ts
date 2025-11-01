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

  getRecordsByVin(vin: string): Observable<any> {
    const query = `
      query GetRecordsByVin($vin: String!) {
        recordsByVin(vin: $vin) {
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

  getAllRecords(): Observable<any> {
    const query = `
      query GetAllRecords {
        records {
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

    return this.http.post<any>(this.apiUrl, { query });
  }
}
