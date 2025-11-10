import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../services/chat-service';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-ai-assistant-standalone',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="ai-assistant-container">
      <div class="assistant-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2>AI Assistant</h2>
            <p>Ask anything or get help with your courses</p>
          </div>
          <div class="model-selector">
            <button type="button" (click)="toggleModelDropdown($event)" class="model-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              AI Model
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div id="model-dropdown-menu" class="model-dropdown" style="display: none;">
              <div>
                <button *ngFor="let model of modelOptions()" 
                        (click)="changeModel(model.id)" 
                        class="model-option"
                        [class.selected]="selectedModel() === model.id">
                  {{ model.name }}
                </button>
                <div class="model-divider"></div>
                <button (click)="clearChat()" class="model-option" style="color: #ef4444;">
                  Clear conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="chat-container">
        <div *ngFor="let message of chatHistory()" class="message-row" [class.user]="message.type === 'user'">
          <div *ngIf="message.type === 'assistant'" class="avatar assistant">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <div class="message-content" [class.order-first]="message.type === 'user'">
            <div class="message-bubble" [class.assistant-message]="message.type === 'assistant'" [class.user-message]="message.type === 'user'">
              <div [innerHTML]="message.content"></div>
            </div>
            <div class="message-time" [class.user-message-time]="message.type === 'user'">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
          
          <div *ngIf="message.type === 'user'" class="avatar user">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div *ngIf="isLoading()" class="message-row">
          <div class="avatar assistant">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="message-content">
            <div class="message-bubble assistant-message">
              <div class="loading-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="errorMessage()" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="#ef4444">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>
            {{ errorMessage() }}
          </div>
        </div>
      </div>
      
      <div class="input-area">
        <form (submit)="$event.preventDefault(); sendMessage();" class="input-form">
          <input
            type="text"
            [(ngModel)]="inputText"
            name="message"
            placeholder="Type your message..."
            class="input-field"
            [disabled]="isLoading()"
          />
          <button
            type="submit"
            class="send-button"
            [disabled]="isLoading() || !inputText().trim()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <div class="input-footer">
          <span>Powered by {{ selectedModel() === 'advanced' ? 'GPT-4' : selectedModel() === 'code' ? 'GPT-4 for Code' : 'AI Assistant' }}</span>
          <button class="clear-button" (click)="clearChat()">Clear chat</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-assistant-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .assistant-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      background-color: #f9fafb;
    }

    .assistant-header h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text-primary, #111827);
    }

    .assistant-header p {
      font-size: 14px;
      color: var(--text-secondary, #4b5563);
      margin: 0;
    }

    .model-selector {
      position: relative;
      display: inline-block;
    }

    .model-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, #111827);
      background-color: white;
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 6px;
      cursor: pointer;
    }

    .model-button:hover {
      background-color: #f9fafb;
    }

    .model-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      width: 220px;
      margin-top: 8px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;
      overflow: hidden;
    }

    .model-option {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px 16px;
      font-size: 14px;
      cursor: pointer;
      border: none;
      background: none;
    }

    .model-option:hover {
      background-color: #f9fafb;
    }

    .model-option.selected {
      background-color: #e6f7fa;
    }

    .model-divider {
      height: 1px;
      background-color: var(--border-color, #e5e7eb);
      margin: 4px 0;
    }

    #chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .message-row.user {
      justify-content: flex-end;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .avatar.assistant {
      background-color: var(--primary-color, #1FB8CD);
      color: white;
    }

    .avatar.user {
      background-color: #e5e7eb;
      color: #4b5563;
      margin-left: 12px;
      margin-right: 0;
    }

    .message-content {
      max-width: 75%;
      position: relative;
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: 12px;
      position: relative;
    }

    .assistant-message {
      background-color: #f9fafb;
      color: var(--text-primary, #111827);
      border-top-left-radius: 4px;
    }

    .user-message {
      background-color: var(--primary-color, #1FB8CD);
      color: white;
      border-top-right-radius: 4px;
    }

    .message-time {
      font-size: 12px;
      color: var(--text-secondary, #4b5563);
      margin-top: 4px;
    }

    .user-message-time {
      text-align: right;
    }

    .loading-dots {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #9ca3af;
      animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 0.5;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .error-message {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
      padding: 12px;
      border-radius: 4px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .input-area {
      padding: 16px;
      background-color: #f9fafb;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .input-form {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .input-field {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-field:focus {
      border-color: var(--primary-color, #1FB8CD);
    }

    .send-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--primary-color, #1FB8CD);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .send-button:hover {
      background-color: var(--primary-hover, #17a2b8);
    }

    .send-button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    .input-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-secondary, #4b5563);
    }

    .clear-button {
      color: var(--primary-color, #1FB8CD);
      border: none;
      background: none;
      padding: 0;
      cursor: pointer;
      font-size: 12px;
    }

    .clear-button:hover {
      text-decoration: underline;
    }
  `]
})
export class AiAssistantStandaloneComponent implements OnInit {
  // Signals for state management
  inputText = signal<string>('');
  chatHistory = signal<{ type: 'user' | 'assistant'; content: string; timestamp: Date }[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  
  // Model options
  modelOptions = signal<{id: string, name: string}[]>([
    { id: 'default', name: 'Standard Assistant' },
    { id: 'advanced', name: 'Advanced AI (GPT-4)' },
    { id: 'code', name: 'Code Assistant' }
  ]);
  selectedModel = signal<string>('default');

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit(): void {
    this.initializeChat();
    
    // Add click listener to close dropdown when clicking outside
    document.addEventListener('click', (event: any) => {
      const menuButton = document.getElementById('model-menu-button');
      const dropdownMenu = document.getElementById('model-dropdown-menu');
      
      if (menuButton && dropdownMenu && 
          !menuButton.contains(event.target) && 
          !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
      }
    });
  }

  initializeChat(): void {
    this.chatHistory.set([{
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }]);
  }

  sendMessage(): void {
    const userInput = this.inputText().trim();
    if (!userInput) return;

    // Add user message to chat
    this.chatHistory.update(history => [
      ...history, 
      { type: 'user', content: userInput, timestamp: new Date() }
    ]);
    
    // Clear input and show loading state
    this.inputText.set('');
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);
    
    // Prepare request parameters
    const requestParams = {
      tenantId: this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0,
      search: userInput,
      custom_gpt_projectid: this.selectedModel(),
      tags: [],
      learnerId: this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0,
    };

    // Send request to service
    this.chatService.getQueryResponseBySource(requestParams).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        
        if (response && response.success) {
          // Add assistant response to chat
          this.chatHistory.update(history => [
            ...history,
            { type: 'assistant', content: response.result.queryResult, timestamp: new Date() }
          ]);
          
          // Scroll to the latest message
          setTimeout(() => this.scrollToBottom(), 100);
        } else if (response.isValidationError) {
          this.errorMessage.set(response.errorMessage || 'An error occurred with your request');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Unable to connect to the AI service');
        console.error('Error in AI request:', error);
      }
    });
  }

  scrollToBottom(): void {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  changeModel(modelId: string): void {
    this.selectedModel.set(modelId);
    this.toggleModelDropdown();
  }

  clearChat(): void {
    this.initializeChat();
    const dropdownMenu = document.getElementById('model-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.style.display = 'none';
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  toggleModelDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const dropdownMenu = document.getElementById('model-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    }
  }
}