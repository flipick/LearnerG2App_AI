import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  user: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.user;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  toggleSidebar(): void {
    document.querySelector('.sidebar')?.classList.toggle('collapsed');
    document.querySelector('.main-content')?.classList.toggle('expanded');
  }

  logout(): void {
    // Implement logout functionality
    this.authService.logOut();
    this.router.navigate(['/login']);
  }
}