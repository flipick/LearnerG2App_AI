import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { set } from '../utility/sessionStorage';
import { AuthService } from '../services/auth-service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  //signInForm: any = FormGroup;
  signInForm!: FormGroup;
  errorMessage: any = false;  

  get f(): { [key: string]: AbstractControl } {
    return this.signInForm.controls
  }
  submitted:any=false;
  constructor(private fb:FormBuilder,
              private route:Router,
              private authService:AuthService,
              private cd: ChangeDetectorRef){

  }
  ngOnInit(): void {
    this.signInForm=this.fb.group({
      username:['',Validators.required],
      password:['',Validators.required]
    });
  }
   
  submitForm(e:any){
    this.submitted = true;
    this.errorMessage = false;

    if (this.signInForm.invalid) {
      return;
    }

    if(this.signInForm.get("username")?.value){
       var obj={
           Email:this.signInForm.get("username")?.value,    
           Password:this.signInForm.get("password")?.value

       }
       this.authService.login(obj).subscribe({
          next:(data)=>{             
              if (data.success) {
                //this.authService.updateLoginTime(obj).subscribe();
                this.route.navigateByUrl('/dashboard');
              } else {
                this.errorMessage=true;
              }
          },
          error:(err)=>{
             console.log("Login failed: ", err);
             this.errorMessage=true;
            this.cd.detectChanges(); 
          }
       });     
    }
  }
}
