import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopUpConfig } from './popup.config.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup {
  @Input() isShowPopup: boolean = false;
  @Input() config: PopUpConfig=new PopUpConfig();
  @Output() CloseEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() saveButtonName: string = 'Save';
  @Input() closeButtonName: string = 'Cancel';
  @Output() ReturnMessage: EventEmitter<string> = new EventEmitter<string>();
  @Output() CloseInnerPopupEvent:EventEmitter<any>=new EventEmitter<any>();
  constructor() { }  
  ngOnChanges(changes: any): void {}
  ngOnInit(): void {  } 

  close() {
    this.CloseInnerPopupEvent.next(true);
    this.config.isShowLeft = false;
    this.config.isShowPopup = false;
    var modalObj:any=document.getElementsByClassName("modal")[0];
    modalObj.style.display="!important none";
    this.CloseEvent.next(true);
    
  }
  public open(config: PopUpConfig) {
    this.config = config;
    if(config.isShowPopup){
      var modalObj:any=document.getElementsByClassName("modal")[0];
      modalObj.style.display="!important block";
    }
    else{
      var modalObj:any=document.getElementsByClassName("modal")[0];
      modalObj.style.display="!important none";
    }
  } 
  getReturnMessage(evt: any) {
    this.ReturnMessage.next(evt);
  }
}
