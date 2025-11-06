import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoaderService } from './loader-service';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class Loader implements OnInit { 
    loading: boolean = false;

  constructor(private loaderService: LoaderService,private cdRef: ChangeDetectorRef ) {
    this.loaderService.isLoading.subscribe((v) => {
      //console.log(v);
      this.loading = v;
      var loaderOBJ: any = document.getElementById("loaderBox");
      if (loaderOBJ) {
        if (this.loading) {
          loaderOBJ.style.display = "block";
        }
        else {
          loaderOBJ.style.display = "none";
          
        }
        this.cdRef.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    var loaderOBJ: any = document.getElementById("loaderBox");
    if (loaderOBJ) {
      if (this.loading) {
        loaderOBJ.style.display = "block";
      }
      else {
        loaderOBJ.style.display = "none";
      }
      this.cdRef.detectChanges();
    }    
  }
}
