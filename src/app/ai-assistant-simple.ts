import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-assistant-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; height: 100%;">
      <h2>AI Assistant</h2>
      <p>Ask anything or get help with your courses</p>
      
      <div style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: white; min-height: 300px;">
        <p>Hello! I'm your AI assistant. How can I help you today?</p>
        
        <div style="margin-top: 20px;">
          <input type="text" placeholder="Type your message..." 
                 style="width: 80%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                 [(ngModel)]="message">
          <button style="margin-left: 10px; padding: 10px 15px; background-color: #1FB8CD; color: white; border: none; border-radius: 4px; cursor: pointer;"
                  (click)="sendMessage()">Send</button>
        </div>
      </div>
    </div>
  `
})
export class AiAssistantSimple {
  message = '';
  
  sendMessage(): void {
    if (this.message.trim()) {
      console.log('Message sent:', this.message);
      this.message = '';
      // In a real implementation, this would call a service to send the message
    }
  }
}