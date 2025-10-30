import { Component, signal } from '@angular/core';
import { Upload } from './components/upload/upload';
import { Notification } from './components/notification/notification';
import { ConnectionStatus } from './components/connection-status/connection-status';
import { VehicleList } from "./components/vehicle-list/vehicle-list";

@Component({
  selector: 'app-root',
  imports: [Upload, Notification, ConnectionStatus, VehicleList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
}
