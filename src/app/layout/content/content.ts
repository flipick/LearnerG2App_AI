import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { Loader } from '../../feature/loader/loader';
import { SidebarService } from '../sidebar-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-content',
  imports: [RouterOutlet,CommonModule,Header,Sidebar,Loader],
  templateUrl: './content.html',
  styleUrl: './content.css'
})
export class Content {
  sidebarOpen$: Observable<boolean>;

  constructor(private sidebarService: SidebarService) {
    this.sidebarOpen$ = this.sidebarService.sidebarOpen$;
  }
}
