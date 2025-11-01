import { Routes } from '@angular/router';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';

export const routes: Routes = [
  {
    path: 'vehicle-details',
    component: VehicleDetailsComponent,
  },
  {
    path: 'vehicle-details/:vin',
    component: VehicleDetailsComponent,
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
