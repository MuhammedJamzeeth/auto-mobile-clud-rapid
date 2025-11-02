import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecordsService, Record, Vehicle } from '../../services/records.service';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss'],
})
export class RecordsComponent implements OnInit {
  @Input() vin?: string;
  @Output() recordAdded = new EventEmitter<Record>();
  @Output() recordUpdated = new EventEmitter<Record>();
  @Output() recordDeleted = new EventEmitter<string>();
  @Output() vehicleLoaded = new EventEmitter<Vehicle>();

  vehicle?: Vehicle;
  records: Record[] = [];
  recordForm: FormGroup;
  isEditing = false;
  editingRecordId?: string;
  displayedColumns: string[] = ['serviceDate', 'serviceType', 'description', 'cost', 'actions'];

  serviceTypes = [
    'Oil Change',
    'Tire Rotation',
    'Brake Service',
    'Engine Tune-up',
    'Transmission Service',
    'Air Filter Replacement',
    'Battery Service',
    'Cooling System Service',
    'Electrical Repair',
    'Body Work',
    'Paint Service',
    'Interior Cleaning',
    'General Maintenance',
    'Emergency Repair',
    'Inspection',
    'Other',
  ];

  constructor(
    private fb: FormBuilder,
    private recordsService: RecordsService,
    private dialog: MatDialog
  ) {
    this.recordForm = this.fb.group({
      description: ['', [Validators.required]],
      serviceType: ['', [Validators.required]],
      cost: [''],
      serviceDate: [new Date(), [Validators.required]],
    });
  }

  ngOnInit() {
    if (this.vin) {
      this.loadVehicleWithRecords();
    }
  }

  /**
   * Load vehicle data along with its records using GraphQL Federation
   * This fetches data from both vehicle-service and record-service in a single query
   */
  loadVehicleWithRecords() {
    if (!this.vin) return;

    this.recordsService.getVehicleWithRecords(this.vin).subscribe({
      next: (result) => {
        if (result.data?.vehicleByVin) {
          this.vehicle = result.data.vehicleByVin;
          this.records = result.data.vehicleByVin.records || [];
          this.vehicleLoaded.emit(this.vehicle);
        }
      },
      error: (error) => {
        console.error('Error loading vehicle with records:', error);
      },
    });
  }

  onSubmit() {
    if (this.recordForm.valid && this.vin) {
      if (this.isEditing && this.editingRecordId) {
        this.updateRecord();
      } else {
        this.createRecord();
      }
    }
  }

  createRecord() {
    const formData = this.recordForm.value;

    const input = {
      vin: this.vin!,
      description: formData.description,
      serviceType: formData.serviceType,
      cost: formData.cost || null,
      serviceDate: formData.serviceDate,
    };

    this.recordsService.createRecord(input).subscribe({
      next: (result) => {
        if (result.data?.createRecord) {
          this.records.unshift(result.data.createRecord);
          this.recordAdded.emit(result.data.createRecord);
          this.resetForm();
        }
      },
      error: (error) => {
        console.error('Error creating record:', error);
      },
    });
  }

  updateRecord() {
    if (!this.editingRecordId) return;

    const formData = this.recordForm.value;

    const input = {
      id: parseInt(this.editingRecordId),
      description: formData.description,
      serviceType: formData.serviceType,
      cost: formData.cost || null,
      serviceDate: formData.serviceDate,
    };

    this.recordsService.updateRecord(input).subscribe({
      next: (result) => {
        if (result.data?.updateRecord) {
          const index = this.records.findIndex((r) => r.id === this.editingRecordId);
          if (index !== -1) {
            this.records[index] = result.data.updateRecord;
          }
          this.recordUpdated.emit(result.data.updateRecord);
          this.resetForm();
        }
      },
      error: (error) => {
        console.error('Error updating record:', error);
      },
    });
  }

  editRecord(record: Record) {
    this.isEditing = true;
    this.editingRecordId = record.id;
    this.recordForm.patchValue({
      description: record.description,
      serviceType: record.serviceType,
      cost: record.cost,
      serviceDate: new Date(record.serviceDate),
    });
  }

  deleteRecord(record: Record) {
    if (confirm('Are you sure you want to delete this service record?')) {
      this.recordsService.deleteRecord(parseInt(record.id)).subscribe({
        next: () => {
          this.records = this.records.filter((r) => r.id !== record.id);
          this.recordDeleted.emit(record.id);
        },
        error: (error) => {
          console.error('Error deleting record:', error);
        },
      });
    }
  }

  resetForm() {
    this.recordForm.reset({
      serviceDate: new Date(),
    });
    this.isEditing = false;
    this.editingRecordId = undefined;
  }

  cancelEdit() {
    this.resetForm();
  }
}
