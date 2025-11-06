import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostMessageService {
   private messageSubject = new Subject<MessageEvent>();
  private messageHandler = (event: MessageEvent) => {
    // ✅ You can add origin check here for security
    // if (event.origin !== 'https://trusted-domain.com') return;

    //this.messageSubject.next(event);
  };

  constructor() {
    //window.addEventListener('message', this.messageHandler);
  }

  ngOnDestroy(): void {
   // window.removeEventListener('message', this.messageHandler);
    //this.messageSubject.complete();
  }

  /**
   * Get observable to listen for incoming messages
   */
  get messages$(): Observable<MessageEvent> {
    return this.messageSubject.asObservable();
  }

  /**
   * Send message to target window (iframe or parent)
   */
  sendMessage(targetWindow: Window, message: any, targetOrigin: string = '*') {
    targetWindow.postMessage(message, targetOrigin);
  }
}
