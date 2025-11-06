import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // initial state: closed
  private sidebarOpen = new BehaviorSubject<boolean>(false);

  // observable for components to subscribe
  sidebarOpen$ = this.sidebarOpen.asObservable();

  toggleSidebar() {
    this.sidebarOpen.next(!this.sidebarOpen.value);
  }

  closeSidebar() {
    this.sidebarOpen.next(false);
  }

  openSidebar() {
    this.sidebarOpen.next(true);
  }
}
