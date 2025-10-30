import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleListService } from '../../services/vehicle-list';
import { Vehicle } from '../models/vehicle.type';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-list.html',
  styleUrls: ['./vehicle-list.scss'],
})
export class VehicleList implements OnInit {
  private vehicleListService = inject(VehicleListService);

  vehicles: Vehicle[] = [];
  page = 1;
  totalPages = 1;
  search = '';

  // editing state
  editId: number | null = null;
  editModel: Partial<Vehicle> = {};

  ngOnInit(): void {
    this.load(this.page);
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
        }
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
      },
    });
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
}
