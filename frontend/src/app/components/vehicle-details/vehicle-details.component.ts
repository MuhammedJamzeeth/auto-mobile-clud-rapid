import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { RecordsComponent } from '../records/records.component';

export interface Vehicle {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  carMake: string;
  carModel: string;
  vin: string;
  manufacturedDate: string;
  ageOfVehicle: number;
  records?: any[];
}

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    RecordsComponent,
  ],
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.scss'],
})
export class VehicleDetailsComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:4040/graphql';
  vehicle?: Vehicle;
  allVehicles: Vehicle[] = [];
  searchForm: FormGroup;
  isLoading = false;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      selectedVin: [''],
      enteredVin: [''],
    });
  }

  ngOnInit() {
    // Load all vehicles for dropdown
    this.loadAllVehicles();

    // Check if VIN is provided in route
    const vin = this.route.snapshot.paramMap.get('vin');
    if (vin) {
      this.loadVehicleByVin(vin);
      this.searchForm.patchValue({ enteredVin: vin });
    }
  }

  loadAllVehicles() {
    const query = `
      query GetAllVehicles {
        vehicles {
          vehicles {
            id
            firstName
            lastName
            carMake
            carModel
            vin
          }
        }
      }
    `;

    this.http.post<any>(this.apiUrl, { query }).subscribe({
      next: (result) => {
        if (result.data?.vehicles?.vehicles) {
          this.allVehicles = result.data.vehicles.vehicles;
        }
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.error = 'Failed to load vehicles';
      },
    });
  }

  loadVehicleByVin(vin: string) {
    if (!vin.trim()) return;

    this.isLoading = true;
    this.error = undefined;

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

    this.http
      .post<any>(this.apiUrl, {
        query,
        variables: { vin: vin.trim() },
      })
      .subscribe({
        next: (result) => {
          if (result.data?.vehicleByVin) {
            this.vehicle = result.data.vehicleByVin;
          } else {
            this.error = 'Vehicle not found';
            this.vehicle = undefined;
          }
          this.isLoading = false;

          // Update URL without reloading the component
          this.router.navigate(['/vehicle-details', vin], { replaceUrl: true });
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
          this.error = 'Vehicle not found or failed to load vehicle data';
          this.vehicle = undefined;
          this.isLoading = false;
        },
      });
  }

  onVinSearch() {
    const enteredVin = this.searchForm.get('enteredVin')?.value;
    if (enteredVin) {
      this.loadVehicleByVin(enteredVin);
    }
  }

  onVehicleSelect() {
    const selectedVin = this.searchForm.get('selectedVin')?.value;
    if (selectedVin) {
      this.searchForm.patchValue({ enteredVin: selectedVin });
      this.loadVehicleByVin(selectedVin);
    }
  }

  clearSearch() {
    this.searchForm.reset();
    this.vehicle = undefined;
    this.error = undefined;
    this.router.navigate(['/vehicle-details'], { replaceUrl: true });
  }

  onRecordAdded(record: any) {
    // Refresh vehicle data to show new record
    if (this.vehicle) {
      this.loadVehicleByVin(this.vehicle.vin);
    }
  }

  onRecordUpdated(record: any) {
    // Refresh vehicle data to show updated record
    if (this.vehicle) {
      this.loadVehicleByVin(this.vehicle.vin);
    }
  }

  onRecordDeleted(recordId: string) {
    // Remove record from local data without full refresh
    if (this.vehicle?.records) {
      this.vehicle.records = this.vehicle.records.filter((r) => r.id !== recordId);
    }
  }

  getVehicleDisplayName(vehicle: Vehicle): string {
    return `${vehicle.carMake} ${vehicle.carModel} - ${vehicle.firstName} ${vehicle.lastName} (${vehicle.vin})`;
  }
}
