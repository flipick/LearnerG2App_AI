import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { get } from '../../utility/sessionStorage';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { SidebarService } from '../sidebar-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit{
  isDropdownOpen = false;
  hovering = false; // keeps menu open while pointer is over menu area
  authValue:any;
  userInitials:any;
  @ViewChild('dropdownRoot', { static: true }) dropdownRoot!: ElementRef;
  constructor(private authService:AuthService,private router:Router,private sidebarService: SidebarService){}
  ngOnInit(): void {
    this.authValue=this.authService.user;//get("AuthValue");

    this.userInitials=this.authService.user?.name.substr(0,2).toUpperCase();// this.authValue.userName.substr(0,2).toUpperCase();
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Close on outside click
  @HostListener('document:click', ['$event'])
  handleClickOutside(ev: Event) {
    if (!this.dropdownRoot?.nativeElement.contains(ev.target)) {
      this.closeDropdown();
    }
  }
  Logout(){
     this.authService.logOut();
  }
   
}
