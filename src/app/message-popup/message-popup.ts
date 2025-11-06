import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-popup',
  imports: [CommonModule],
  templateUrl: './message-popup.html',
  styleUrl: './message-popup.css'
})
export class MessagePopup implements OnInit {
  @Output() CloseEvent: any = new EventEmitter();
  message=signal<string>("");
  constructor(private eventEmitterService:EventEmitterService){}
  ngOnInit(): void {
    this.eventEmitterService.invokeMessagePopup.subscribe((data)=>{
       this.message.set(data);
    })
  }

  close(){
    this.CloseEvent.next(true);
  }
}
