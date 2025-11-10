import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { set } from '../utility/sessionStorage';
import { AuthService } from '../services/auth-service';
import { ChangeDetectorRef } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  signInForm!: FormGroup;
  errorMessage: boolean = false;
  submitted: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  progressValue: number = 0;
  isDarkMode: boolean = false;
  
  private destroy$ = new Subject<void>();
  
  get f(): { [key: string]: AbstractControl } {
    return this.signInForm.controls;
  }
  
  constructor(
    private fb: FormBuilder,
    private route: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    // Check system preference for dark mode
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Listen for theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.isDarkMode = e.matches;
      this.cd.detectChanges();
    });
  }
  
  ngOnInit(): void {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  simulateLoading(): void {
    this.progressValue = 0;
    this.isLoading = true;
    
    interval(30)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.progressValue < 90) {
          this.progressValue += 5;
          this.cd.detectChanges();
        }
      });
  }
  
  completeLoading(): void {
    this.progressValue = 100;
    setTimeout(() => {
      this.isLoading = false;
      this.cd.detectChanges();
    }, 300);
  }
  
  submitForm(e: any): void {
    e.preventDefault();
    this.submitted = true;
    this.errorMessage = false;
    
    if (this.signInForm.invalid) {
      return;
    }
    
    this.simulateLoading();
    
    if (this.signInForm.get("username")?.value) {
      const credentials = {
        Email: this.signInForm.get("username")?.value,
        Password: this.signInForm.get("password")?.value
      };
      
      this.authService.login(credentials).subscribe({
        next: (data) => {
          if (data.success) {
            this.completeLoading();
            setTimeout(() => {
              this.route.navigateByUrl('/dashboard');
            }, 300);
          } else {
            this.completeLoading();
            this.errorMessage = true;
          }
        },
        error: (err) => {
          this.completeLoading();
          console.log("Login failed: ", err);
          this.errorMessage = true;
          this.cd.detectChanges();
        }
      });
    }
  }
}