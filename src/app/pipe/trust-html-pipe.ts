import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'trustHtml'
})
export class TrustHtmlPipe implements PipeTransform {
  constructor(private sanitizer:DomSanitizer){}
  transform(value: any,type?:string): unknown {
    switch(type){
       case 'url':
          return this.sanitizer.bypassSecurityTrustResourceUrl(value);
        break;
      default:
         return this.sanitizer.bypassSecurityTrustHtml(value);
        break;
    }
  }

}
