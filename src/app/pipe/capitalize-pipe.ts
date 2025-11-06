import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string, mode:'first' | 'words' = 'first'): unknown {
    if(!value) return '';
    
    if(mode == 'words' && value.indexOf("-")>-1){
        return value.split('-').map(word=>word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    else if(mode == 'words' && value.indexOf(" ")>-1){
      return value.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    
    
    return value.charAt(0).toUpperCase() + value.slice(1);

  }

}
