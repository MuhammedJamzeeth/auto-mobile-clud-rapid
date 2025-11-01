import { Component, inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { VehicleListService } from '../../services/vehicle-list';
import { Vehicle } from '../models/vehicle.type';
import { SocketService } from '../../services/socket-service';
import { Subject, takeUntil } from 'rxjs';
import { ExportDialogComponent, ExportDialogData } from '../export-dialog/export-dialog';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './vehicle-list.html',
  styleUrls: ['./vehicle-list.scss'],
})
export class VehicleList implements OnInit, OnDestroy {
  private vehicleListService = inject(VehicleListService);
  private socketService = inject(SocketService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  @Output() exportStarted = new EventEmitter<void>();

  vehicles: Vehicle[] = [];
  page = 1;
  totalPages = 1;
  search = '';

  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'make',
    'carModel',
    'vin',
    'manufactured',
    'age',
    'actions',
  ];

  // editing state
  editId: number | null = null;
  editModel: Partial<Vehicle> = {};

  ngOnInit(): void {
    this.load(this.page);
    this.setupNotificationListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupNotificationListener(): void {
    // Listen for socket notifications to auto-refresh table when import/export completes
    this.socketService.onNotify((data: any) => {
      console.log('VehicleList received notification:', data);

      // Check if this is an import completion notification
      if (data?.type === 'import' && data?.status === 'completed') {
        console.log('Import completed - auto-refreshing vehicle table');
        // Wait a moment for backend to fully process, then refresh
        setTimeout(() => {
          this.load(this.page);
        }, 1000);
      }

      // Check if this is an export completion notification
      if (data?.type === 'export' && data?.status === 'completed') {
        console.log('Export completed:', data.message);
        // You could show a success notification here
      }

      if (data?.type === 'export' && data?.status === 'failed') {
        console.error('Export failed:', data.message);
        // You could show an error notification here
      }
    });
  }

  private load(page = 1) {
    const filter = this.search ? { carModel: this.search } : undefined;
    this.vehicleListService.loadVehicles(page, this.vehicleListService.limit, filter).subscribe({
      next: (res) => {
        const data = res?.data?.vehicles;
        if (data) {
          this.vehicles = data.vehicles || [];
          this.page = data.page || page;
          this.totalPages = data.totalPages || 1;
          console.log(`Loaded ${this.vehicles.length} vehicles for page ${this.page}`);
        }
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
      },
    });
  }

  // Public method to refresh the table (can be called from parent components)
  public refreshTable(): void {
    console.log('Manually refreshing vehicle table...');
    this.load(this.page);
  }

  searchVehicles() {
    this.page = 1;
    this.load(this.page);
  }

  clear() {
    this.search = '';
    this.searchVehicles();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.load(this.page);
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.load(this.page);
    }
  }

  startEdit(v: Vehicle) {
    this.editId = v.id;
    this.editModel = { ...v };
  }

  isEditing(v: Vehicle) {
    return this.editId === v.id;
  }

  saveEdit(v: Vehicle) {
    if (!this.editId) return;
    const updated = { ...v, ...this.editModel } as Vehicle;
    this.vehicleListService.updateVehicle(updated).subscribe({
      next: () => {
        this.load(this.page);
        this.editId = null;
        this.editModel = {};
      },
      error: (err) => console.error('Update error:', err),
    });
  }

  cancelEdit() {
    this.editId = null;
    this.editModel = {};
  }

  confirmDelete(v: Vehicle) {
    // basic confirmation; keep UX simple
    if (!confirm('Delete vehicle?')) return;
    this.vehicleListService.deleteVehicle(v.id).subscribe({
      next: () => this.load(this.page),
      error: (err) => console.error('Delete error:', err),
    });
  }

  getAgeChipClass(age: number): string {
    if (age <= 3) return 'age-new';
    if (age <= 7) return 'age-mid';
    return 'age-old';
  }

  openExportDialog(): void {
    const dialogData: ExportDialogData = {
      onExportStarted: () => {
        console.log('Export started - triggering right panel');
        this.exportStarted.emit();
      },
    };

    const dialogRef = this.dialog.open(ExportDialogComponent, {
      width: '500px',
      disableClose: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        console.log('Export completed successfully');
        // You could show a success message here
      }
    });
  }

  viewRecords(vehicle: Vehicle): void {
    // Navigate to vehicle details page with the VIN
    this.router.navigate(['/vehicle-details', vehicle.vin]);
  }
}
