import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Sidebar],
  templateUrl: './content.html',
  styleUrls: ['./content.css']
})
export class Content {
  // This component just serves as a wrapper for the header, sidebar, and main content
}