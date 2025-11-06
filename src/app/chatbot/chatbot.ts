import { Component, OnInit, signal } from '@angular/core';
import { ChatService } from '../services/chat-service';
import { AuthService } from '../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot implements OnInit {
  // Signals for state management
  queryText = signal<string>(''); 
  messages =signal<{ type: 'user' | 'bot'; text: string }[]>([]);

  constructor(private chatService: ChatService, private authService: AuthService) {

  }
  ngOnInit(): void {
    this.messages.set([]);
  }

  query() {
    if (!this.queryText().trim()) return;
    this.messages.update(msgs => [...msgs, { type: 'user', text: this.queryText() }]);
    //this.messages().push({ type: 'user', text: this.queryText() });
    var param = {
      tenantId: this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0,
      search: this.queryText(),
      custom_gpt_projectid: "",
      tags: [],
      learnerId:this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0,
    };
    this.chatService.getQueryResponseBySource(param).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.messages.update(msgs => [...msgs, { type: 'bot', text: response.result.queryResult }]);

          setTimeout(() => {
            var messageSendList: any = document.getElementsByClassName("prompt-send");
            if (messageSendList.length > 0) {
              document.getElementsByClassName("prompt-send")[messageSendList.length - 1].scrollIntoView();
            }
          }, 200);
          //this.messages().push({ type: 'bot', text: response.result.queryResult });
        }
        else if (response.isValidationError) {
          console.log("Error occured");
        }
      },
      error: (error) => {
        console.log(error.message || 'Unknown error occurred');        
      }
    });

    this.queryText.set(''); // clear input
  }
}
