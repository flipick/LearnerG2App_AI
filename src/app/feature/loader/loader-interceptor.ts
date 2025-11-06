import { HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from './loader-service';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor {
    private requests: HttpRequest<any>[] = [];
  constructor(private loaderService:LoaderService) { }
  
  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    
      this.loaderService.isLoading.next(this.requests.length > 0);
    
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
  {
    
      this.requests.push(req);
    
     this.loaderService.isLoading.next(true);
   
    return new Observable<HttpEvent<any>>((observer: any) => {
      const subscription = next.handle(req).subscribe({
        next:(event)=>{
           if (event instanceof HttpResponse) {
              this.removeRequest(req);
              observer.next(event);
            }
        },
        error:(err)=>{
          this.removeRequest(req);
            
            observer.error(err);
        },
        complete:()=>{
          this.removeRequest(req);
            observer.complete();
        }
      });
      return () => {
        this.removeRequest(req);
        subscription.unsubscribe();
      };

      //   .subscribe(
      //     event => {
      //       if (event instanceof HttpResponse) {
      //         this.removeRequest(req);
      //         observer.next(event);
      //       }
      //     },
      //     err => {
      //       //alert('error' + err);
      //       this.removeRequest(req);
      //       observer.error(err);
      //     },
      //     () => {
      //       this.removeRequest(req);
      //       observer.complete();
      //     });
      // // remove request from queue when cancelled
      // return () => {
      //   this.removeRequest(req);
      //   subscription.unsubscribe();
      // };
    });
  }
}
