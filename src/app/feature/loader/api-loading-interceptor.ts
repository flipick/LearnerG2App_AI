import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { LoaderService } from "./loader-service";
import { Observable } from "rxjs";
import { Loader } from "./loader";
import { inject } from "@angular/core";
import { AuthService } from "../../services/auth-service";

const requests: HttpRequest<any>[] = [];
export const apiLoadingInterceptor:HttpInterceptorFn=(req,next)=>{
     const loaderService=inject(LoaderService);
     const authService=inject(AuthService);
     requests.push(req);
    
     loaderService.isLoading.next(true);
   
    return new Observable<HttpEvent<any>>((observer: any) => {
      const subscription = next(req).subscribe({
        next:(event)=>{
           if (event instanceof HttpResponse) {
              removeRequest(req,loaderService);
              observer.next(event);
            }
        },
        error:(err)=>{
          removeRequest(req, loaderService);  
          if(err.status == 401){
             authService.logOut();
          }        
          observer.error(err);
        },
        complete:()=>{
          removeRequest(req,loaderService);
            observer.complete();
        }
      });
      return () => {
        removeRequest(req,loaderService);
        subscription.unsubscribe();
      };

      
    });
}

  
  
function removeRequest(req: HttpRequest<any>,loaderService:LoaderService) {
    const i = requests.indexOf(req);
    if (i >= 0) {
      requests.splice(i, 1);
    }
    
      loaderService.isLoading.next(requests.length > 0);
    
  }