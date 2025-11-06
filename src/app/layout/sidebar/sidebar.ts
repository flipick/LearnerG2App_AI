import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../sidebar-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
   standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  open$: Observable<boolean>;

  constructor(private sidebarService: SidebarService) {
    this.open$ = this.sidebarService.sidebarOpen$;
  }

  ngOnInit(): void {}
}
