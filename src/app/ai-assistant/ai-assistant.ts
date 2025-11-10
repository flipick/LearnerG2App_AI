import { Component, OnInit, signal, inject, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../services/chat-service';
import { AuthService } from '../services/auth-service';
import { VertexRagService } from '../services/vertex-rag.service';
import { Observable, of, forkJoin } from 'rxjs';

// Define speech recognition type to avoid TypeScript errors
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

// Define message types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  model?: string;
  attachments?: FileAttachment[];
  isCode?: boolean;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  content: string | ArrayBuffer | null;
  url?: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="ai-assistant-container">
      <!-- Header with title and model selector -->
      <div class="assistant-header">
        <div class="header-content">
          <div class="header-title">
            <h2>AI Assistant</h2>
            <p>Ask anything or get help with your courses</p>
          </div>
          
          <!-- AI Model selector -->
          <div class="header-actions">
            <!-- Settings button -->
            <button id="settings-button" (click)="toggleSettings()" class="action-button" title="Settings">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Model selector dropdown -->
            <div class="model-selector">
              <button type="button" id="model-menu-button" class="model-button" (click)="toggleModelDropdown($event)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                <span>AI Model</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="currentColor" class="caret-icon">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <div id="model-dropdown-menu" class="model-dropdown" style="display: none;">
                <div class="dropdown-content">
                  <button 
                    *ngFor="let model of modelOptions()" 
                    (click)="changeModel(model.id)" 
                    class="model-option" 
                    [class.selected]="selectedModel() === model.id"
                  >
                    <div class="model-option-content">
                      <div class="model-name">{{ model.name }}</div>
                      <div class="model-description">{{ model.description }}</div>
                    </div>
                  </button>
                  <div class="model-divider"></div>
                  <button (click)="clearChat()" class="action-option danger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Clear conversation</span>
                  </button>
                  <button (click)="downloadChatHistory()" class="action-option">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <span>Download chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Settings panel (hidden by default) -->
      <div id="settings-panel" class="settings-panel" *ngIf="showSettings()">
        <h3>Settings</h3>
        <div class="settings-section">
          <h4>AI Model</h4>
          <div class="settings-option" *ngFor="let model of modelOptions()">
            <label>
              <input 
                type="radio" 
                name="aiModel" 
                [value]="model.id" 
                [checked]="selectedModel() === model.id"
                (change)="changeModel(model.id)"
              />
              <div class="option-details">
                <span class="option-name">{{ model.name }}</span>
                <span class="option-description">{{ model.description }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Messages Container -->
      <div #chatContainer id="chat-container" class="chat-container">
        <!-- Date headers and messages -->
        <ng-container *ngFor="let message of chatHistory(); let i = index;">
          <!-- Date separator -->
          <div class="date-separator" *ngIf="shouldShowDateHeader(i)">
            <span>{{ formatDate(message.timestamp) }}</span>
          </div>
          
          <!-- Message -->
          <div class="message-row" 
              [class.user]="message.type === 'user'" 
              [class.assistant]="message.type === 'assistant'"
              [class.grouped]="shouldGroupWithPrevious(i)">
            
            <!-- Assistant avatar -->
            <div class="avatar assistant-avatar" *ngIf="message.type === 'assistant' && !shouldGroupWithPrevious(i)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <!-- Message content -->
            <div class="message-content" [class.with-attachments]="message.attachments?.length">
              <!-- Attachments -->
              <div class="attachments-container" *ngIf="message.attachments?.length">
                <div class="attachment" *ngFor="let attachment of message.attachments">
                  <!-- Image attachment preview -->
                  <div class="attachment-preview" *ngIf="attachment.type.startsWith('image/')">
                    <img [src]="attachment.url" [alt]="attachment.name" />
                  </div>
                  
                  <!-- Document attachment -->
                  <div class="attachment-icon" *ngIf="!attachment.type.startsWith('image/')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="attachment-info">
                    <div class="attachment-name">{{ attachment.name }}</div>
                    <div class="attachment-size">{{ (attachment.size / 1024).toFixed(1) }} KB</div>
                  </div>
                </div>
              </div>
              
              <!-- Message bubble -->
              <div class="message-bubble" 
                  [class.assistant-message]="message.type === 'assistant'" 
                  [class.user-message]="message.type === 'user'"
                  [class.code-message]="message.isCode">
                
                <!-- Loading animation for sending message -->
                <div class="loading-dots" *ngIf="message.status === 'sending'">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
                
                <!-- Message text content -->
                <div class="message-text" *ngIf="message.status !== 'sending'" [innerHTML]="message.isCode ? formatCode(message.content) : message.content"></div>
                
                <!-- Error indicator -->
                <div class="message-error" *ngIf="message.status === 'error'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span>Error sending message. Tap to retry.</span>
                </div>
                
                <!-- Message actions -->
                <div class="message-actions" *ngIf="message.status === 'sent'">
                  <button class="action-icon" (click)="copyToClipboard(message.content)" title="Copy to clipboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Message timestamp -->
              <div class="message-time" [class.user-time]="message.type === 'user'">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
            
            <!-- User avatar -->
            <div class="avatar user-avatar" *ngIf="message.type === 'user' && !shouldGroupWithPrevious(i)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </ng-container>
        
        <!-- Loading indicator -->
        <div class="message-row assistant" *ngIf="isLoading()">
          <div class="avatar assistant-avatar">
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
        
        <!-- Error message -->
        <div class="error-message" *ngIf="errorMessage()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ errorMessage() }}</span>
          <button class="dismiss-error" (click)="errorMessage.set(null)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Input Area -->
      <div class="input-area">
        <!-- Selected files display -->
        <div class="selected-files" *ngIf="selectedFiles().length > 0">
          <div class="selected-file" *ngFor="let file of selectedFiles(); let i = index">
            <div class="file-icon" [ngClass]="{'image-file': file.type.startsWith('image/')}">
              <svg *ngIf="!file.type.startsWith('image/')" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="file-name">{{ file.name }}</div>
            <button class="remove-file" (click)="removeFile(i)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Input form -->
        <form (submit)="$event.preventDefault(); sendMessage();" class="input-form">
          <!-- File input -->
          <input 
            #fileInput
            type="file" 
            id="file-input" 
            class="file-input" 
            (change)="handleFileSelection($event)"
            multiple
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/json,text/javascript,text/html,text/css"
          />
          
          <!-- File attachment button -->
          <button 
            type="button" 
            class="attachment-button" 
            (click)="fileInput.click()" 
            [disabled]="isLoading()"
            title="Attach file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Emoji button -->
          <button 
            type="button" 
            class="emoji-button" 
            (click)="toggleEmojiPicker($event)" 
            [disabled]="isLoading()"
            title="Add emoji"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Emoji picker -->
          <div class="emoji-picker" *ngIf="showEmojiPicker()">
            <div class="emoji-grid">
              <button 
                type="button" 
                *ngFor="let emoji of ['😊', '👍', '❤️', '🎉', '🤔', '😂', '🙏', '👏', '🔥', '⭐', '✅', '🚀', '💡', '📝', '👀', '💪', '🙌', '👋', '🤝', '👌']" 
                class="emoji"
                (click)="addEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
          
          <!-- Text input -->
          <input
            type="text"
            [(ngModel)]="inputText"
            name="message"
            [placeholder]="getPlaceholderText()"
            class="input-field"
            [class.listening]="isListening()"
            [disabled]="isLoading()"
          />
          
          <!-- Voice input button (if supported) -->
          <button 
            *ngIf="speechSupported" 
            type="button" 
            class="voice-button" 
            [class.active]="isListening()" 
            (click)="toggleVoiceInput()"
            [disabled]="isLoading()"
            title="Voice input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Send button -->
          <button
            type="submit"
            class="send-button"
            [disabled]="isLoading() || (!inputText().trim() && selectedFiles().length === 0)"
            title="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        
        <!-- Input footer -->
        <div class="input-footer">
          <div class="powered-by">
            Powered by {{ selectedModel() === 'advanced' ? 'GPT-4' : selectedModel() === 'code' ? 'GPT-4 for Code' : selectedModel() === 'rag' ? 'Vertex RAG' : 'AI Assistant' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* AI Assistant Container */
    .ai-assistant-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      color: #111827;
    }

    /* Header */
    .assistant-header {
      padding: 16px;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      z-index: 10;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-title h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #111827;
    }

    .header-title p {
      font-size: 14px;
      color: #4b5563;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    /* Settings */
    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background-color: transparent;
      border: 1px solid #e5e7eb;
      color: #4b5563;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }

    .action-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #111827;
    }

    .settings-panel {
      padding: 16px;
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
    }

    .settings-panel h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }

    .settings-section {
      margin-bottom: 16px;
    }

    .settings-section h4 {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 12px 0;
      color: #4b5563;
    }

    .settings-option {
      margin-bottom: 8px;
    }

    .settings-option label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .settings-option input {
      margin-right: 12px;
    }

    .option-details {
      display: flex;
      flex-direction: column;
    }

    .option-name {
      font-size: 14px;
      font-weight: 500;
    }

    .option-description {
      font-size: 12px;
      color: #4b5563;
    }

    /* Model Selector */
    .model-selector {
      position: relative;
    }

    .model-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      height: 36px;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .model-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .caret-icon {
      margin-left: 4px;
    }

    .model-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      margin-top: 8px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 240px;
      z-index: 1000;
      overflow: hidden;
      animation: fadeIn 0.2s ease;
    }

    .dropdown-content {
      padding: 8px 0;
    }

    .model-option {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px 16px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .model-option:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .model-option.selected {
      background-color: rgba(31, 184, 205, 0.1);
    }

    .model-option-content {
      display: flex;
      flex-direction: column;
    }

    .model-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }

    .model-description {
      font-size: 12px;
      color: #4b5563;
      margin-top: 2px;
    }

    .model-divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 8px 0;
    }

    .action-option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      padding: 10px 16px;
      border: none;
      background: none;
      font-size: 14px;
      color: #111827;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .action-option:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .action-option.danger {
      color: #ef4444;
    }

    .action-option.danger:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }

    /* Chat Container */
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      scrollbar-width: thin;
      scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
    }

    .chat-container::-webkit-scrollbar {
      width: 6px;
    }

    .chat-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-container::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 3px;
    }

    /* Date Separator */
    .date-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 16px 0;
      color: #4b5563;
      font-size: 12px;
    }

    .date-separator span {
      background-color: white;
      padding: 0 12px;
      position: relative;
      z-index: 1;
    }

    .date-separator::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #e5e7eb;
      z-index: 0;
    }

    /* Message Row */
    .message-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }

    .message-row.user {
      justify-content: flex-end;
    }

    .message-row.grouped {
      margin-top: -8px;
    }

    /* Avatars */
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .assistant-avatar {
      background-color: #1FB8CD;
      color: white;
      margin-right: 12px;
    }

    .user-avatar {
      background-color: #e5e7eb;
      color: #4b5563;
      margin-left: 12px;
    }

    /* Message Content */
    .message-content {
      max-width: 75%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .message-content.with-attachments {
      max-width: 350px;
    }

    /* Attachments */
    .attachments-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    .attachment {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 6px;
      overflow: hidden;
    }

    .attachment-preview {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      overflow: hidden;
    }

    .attachment-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .attachment-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4b5563;
    }

    .attachment-info {
      flex: 1;
      min-width: 0;
    }

    .attachment-name {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .attachment-size {
      font-size: 11px;
      color: #4b5563;
    }

    /* Message Bubble */
    .message-bubble {
      padding: 12px 16px;
      border-radius: 12px;
      position: relative;
      transition: all 0.2s;
      max-width: 100%;
    }

    .message-bubble:hover {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .assistant-message {
      background-color: #f9fafb;
      color: #111827;
      border-top-left-radius: 4px;
    }

    .user-message {
      background-color: #1FB8CD;
      color: white;
      border-top-right-radius: 4px;
    }

    .code-message {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      white-space: pre-wrap;
    }

    .message-text {
      word-break: break-word;
    }

    /* Code blocks */
    .message-text pre {
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .message-text code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.9em;
    }

    .user-message pre {
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Loading dots */
    .loading-dots {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
      opacity: 0.6;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) {
      animation-delay: -0.32s;
    }

    .dot:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% { 
        transform: scale(0);
      } 
      40% { 
        transform: scale(1.0);
      }
    }

    /* Error indicator */
    .message-error {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #ef4444;
      margin-top: 8px;
    }

    /* Message Actions */
    .message-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      transition: opacity 0.2s;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 4px;
      display: flex;
      overflow: hidden;
    }

    .message-bubble:hover .message-actions {
      opacity: 1;
    }

    .action-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: #4b5563;
      cursor: pointer;
      transition: color 0.2s, background-color 0.2s;
    }

    .action-icon:hover {
      color: #111827;
      background-color: rgba(0, 0, 0, 0.05);
    }

    /* Time stamp */
    .message-time {
      font-size: 11px;
      color: #4b5563;
      margin-top: 4px;
    }

    .user-time {
      text-align: right;
    }

    /* Error Message */
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #fee2e2;
      border-radius: 8px;
      color: #991b1b;
      margin-bottom: 16px;
      font-size: 14px;
      animation: fadeIn 0.3s ease;
    }

    .dismiss-error {
      margin-left: auto;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #991b1b;
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .dismiss-error:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    /* Input Area */
    .input-area {
      padding: 16px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    /* Selected files */
    .selected-files {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .selected-file {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 13px;
    }

    .file-icon {
      color: #4b5563;
    }

    .file-name {
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .remove-file {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: none;
      cursor: pointer;
      color: #4b5563;
      transition: color 0.2s;
    }

    .remove-file:hover {
      color: #ef4444;
    }

    /* Input form */
    .input-form {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    /* Hidden file input */
    .file-input {
      display: none;
    }

    /* Buttons */
    .attachment-button,
    .emoji-button,
    .voice-button {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: none;
      color: #4b5563;
      cursor: pointer;
      transition: color 0.2s;
      border-radius: 50%;
    }

    .attachment-button:hover,
    .emoji-button:hover,
    .voice-button:hover {
      color: #1FB8CD;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .voice-button.active {
      color: #1FB8CD;
      background-color: rgba(31, 184, 205, 0.1);
    }

    .attachment-button:disabled,
    .emoji-button:disabled,
    .voice-button:disabled {
      color: rgba(75, 85, 99, 0.5);
      cursor: not-allowed;
    }

    /* Emoji picker */
    .emoji-picker {
      position: absolute;
      bottom: 48px;
      left: 36px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 8px;
      z-index: 10;
      animation: fadeIn 0.2s ease;
    }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .emoji {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 4px;
      font-size: 20px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .emoji:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    /* Input field */
    .input-field {
      flex: 1;
      height: 40px;
      padding: 0 12px;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      font-size: 14px;
      background-color: white;
      color: #111827;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-field:focus {
      outline: none;
      border-color: #1FB8CD;
      box-shadow: 0 0 0 2px rgba(31, 184, 205, 0.2);
    }

    .input-field:disabled {
      background-color: rgba(229, 231, 235, 0.5);
      cursor: not-allowed;
    }

    .input-field.listening {
      border-color: #1FB8CD;
      box-shadow: 0 0 0 2px rgba(31, 184, 205, 0.2);
      animation: pulse 2s infinite;
    }

    /* Send button */
    .send-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #1FB8CD;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }

    .send-button:hover {
      background-color: #17a2b8;
    }

    .send-button:active {
      transform: scale(0.95);
    }

    .send-button:disabled {
      background-color: rgba(156, 163, 175, 0.5);
      cursor: not-allowed;
    }

    /* Input footer */
    .input-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      padding: 0 12px;
    }

    .powered-by {
      font-size: 12px;
      color: #4b5563;
    }

    /* Notification */
    .assistant-notification {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
      z-index: 1000;
    }

    .assistant-notification.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(31, 184, 205, 0.4);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(31, 184, 205, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(31, 184, 205, 0);
      }
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
      .message-content {
        max-width: 85%;
      }
      
      .model-button span {
        display: none;
      }
    }
  `]
})
export class AiAssistant implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chatContainer') chatContainer: ElementRef | undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  
  // Services
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private vertexRagService = inject(VertexRagService);
  
  // State signals
  inputText = signal<string>('');
  chatHistory = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isListening = signal<boolean>(false);
  showEmojiPicker = signal<boolean>(false);
  selectedFiles = signal<File[]>([]);
  showSettings = signal<boolean>(false);
  
  // Model options
  modelOptions = signal<{id: string, name: string, description: string}[]>([
    { id: 'default', name: 'Standard Assistant', description: 'General-purpose AI for everyday questions' },
    { id: 'advanced', name: 'Advanced AI (GPT-4)', description: 'More powerful AI for complex tasks' },
    { id: 'code', name: 'Code Assistant', description: 'Specialized for programming help' },
    { id: 'rag', name: 'RAG Assistant', description: 'Answer questions about your documents' }
  ]);
  selectedModel = signal<string>('default');
  
  // Speech recognition
  recognition: SpeechRecognition | null = null;
  speechSupported = false;
  
  // Session tracking
  sessionId = this.generateSessionId();
  
  // Lifecycle hooks
  constructor() {
    // Check if speech recognition is supported
    const speechWindow = window as SpeechRecognitionWindow;
    if (speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition) {
      this.speechSupported = true;
      
      // Initialize speech recognition
      const SpeechRecognitionConstructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        this.recognition = new SpeechRecognitionConstructor();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          this.inputText.set(transcript);
          this.isListening.set(false);
        };
        
        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          this.isListening.set(false);
        };
        
        this.recognition.onend = () => {
          this.isListening.set(false);
        };
      }
    }
  }

  ngOnInit(): void {
    console.log("AI Assistant initializing...");
    
    // Load saved chat history from localStorage
    this.loadChatHistory();
    
    // If no chat history, initialize with greeting
    if (this.chatHistory().length === 0) {
      this.initializeChat();
    }
    
    // Load saved model preference
    const savedModel = localStorage.getItem('aiAssistantModel');
    if (savedModel) {
      this.selectedModel.set(savedModel);
    }
    
    // Add click listener to close dropdowns when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    console.log("AI Assistant initialized with model:", this.selectedModel());
  }
  
  ngAfterViewInit(): void {
    this.scrollToBottom();
  }
  
  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    
    // Stop speech recognition if active
    if (this.isListening()) {
      this.recognition?.stop();
    }
  }
  
  // Initialize chat with greeting
  initializeChat(): void {
    this.chatHistory.set([{
      id: this.generateMessageId(),
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
      status: 'sent'
    }]);
    this.saveChatHistory();
  }
  
  // Handle outside clicks for dropdowns
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Close model dropdown if open
    const modelButton = document.getElementById('model-menu-button');
    const modelDropdown = document.getElementById('model-dropdown-menu');
    
    if (modelDropdown && 
        modelButton && 
        !modelButton.contains(target) && 
        !modelDropdown.contains(target)) {
      modelDropdown.style.display = 'none';
    }
    
    // Close emoji picker if open
    if (this.showEmojiPicker() && !target.closest('.emoji-picker')) {
      this.showEmojiPicker.set(false);
    }
    
    // Close settings panel if open
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    
    if (settingsPanel && 
        settingsButton && 
        !settingsButton.contains(target) && 
        !settingsPanel.contains(target)) {
      this.showSettings.set(false);
    }
  }
  
  // Send message
  sendMessage(): void {
    console.log("AI Assistant: sendMessage called");
    const userInput = this.inputText().trim();
    
    console.log("AI Assistant: userInput:", userInput);
    console.log("AI Assistant: selectedFiles length:", this.selectedFiles().length);
    
    if (!userInput && this.selectedFiles().length === 0) {
      console.log("AI Assistant: No input or files, returning");
      return;
    }
    
    // Create message ID
    const messageId = this.generateMessageId();
    console.log("AI Assistant: Generated messageId:", messageId);
    
    // Process files if any
    const attachments: FileAttachment[] = [];
    
    if (this.selectedFiles().length > 0) {
      console.log("AI Assistant: Processing selected files:", this.selectedFiles().map(f => f.name));
      
      for (const file of this.selectedFiles()) {
        console.log("AI Assistant: Processing file:", file.name);
        const reader = new FileReader();
        
        reader.onload = (e) => {
          console.log("AI Assistant: File read complete for:", file.name);
          const attachment: FileAttachment = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: e.target?.result || null,
            url: URL.createObjectURL(file)
          };
          
          attachments.push(attachment);
          console.log("AI Assistant: Attachment added, current count:", attachments.length);
          
          // If all files are processed, add the message to chat
          if (attachments.length === this.selectedFiles().length) {
            console.log("AI Assistant: All files processed, adding message to chat");
            this.addUserMessage(messageId, userInput, attachments);
          }
        };
        
        console.log("AI Assistant: Starting file read for:", file.name);
        reader.readAsDataURL(file);
      }
    } else {
      // If no files, just add the text message
      console.log("AI Assistant: No files, adding text message directly");
      this.addUserMessage(messageId, userInput);
    }
  }
  
  // Add user message to chat
  addUserMessage(messageId: string, content: string, attachments: FileAttachment[] = []): void {
    console.log("AI Assistant: addUserMessage called");
    console.log("AI Assistant: messageId:", messageId);
    console.log("AI Assistant: content:", content);
    console.log("AI Assistant: attachments length:", attachments.length);
    
    // Detect if message contains code
    const isCode = this.detectCodeSnippet(content);
    
    // Add user message to chat history
    this.chatHistory.update(history => [
      ...history, 
      { 
        id: messageId, 
        type: 'user', 
        content, 
        timestamp: new Date(), 
        status: 'sending',
        attachments,
        isCode
      }
    ]);
    
    console.log("AI Assistant: User message added to chat history");
    
    // Save chat history
    this.saveChatHistory();
    
    // Store selectedFiles before clearing
    const filesToProcess = [...this.selectedFiles()];
    console.log("AI Assistant: Saved files to process:", filesToProcess.map(f => f.name));
    
    // Clear input and selected files
    this.inputText.set('');
    
    console.log("AI Assistant: Before clearing - selectedFiles length:", this.selectedFiles().length);
    this.selectedFiles.set([]);
    console.log("AI Assistant: After clearing - selectedFiles length:", this.selectedFiles().length);
    
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    
    // Show loading state
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);
    
    // If using RAG model, use the Vertex RAG service
    console.log("AI Assistant: Current model:", this.selectedModel());
    if (this.selectedModel() === 'rag') {
      console.log("AI Assistant: Using RAG model, processing with Vertex RAG");
      
      // Modified to use saved files
      this.processWithRag(messageId, content, attachments, filesToProcess);
      return; // Skip the regular LMS API call
    }
    
    // For other models, use the regular chat service
    // Prepare request parameters
    const requestParams = {
      tenantId: this.authService.user?.tenantId ? parseInt(this.authService.user.tenantId) : 0,
      search: content,
      custom_gpt_projectid: this.selectedModel(),
      tags: [],
      learnerId: this.authService.user?.learnerId ? parseInt(this.authService.user.learnerId) : 0,
      sessionId: this.sessionId,
      attachments: attachments.map(a => ({
        name: a.name,
        type: a.type,
        content: a.content
      }))
    };

    // Update message status to sent
    this.updateMessageStatus(messageId, 'sent');

    console.log("AI Assistant: Sending request to ChatService");
    // Send request to service
    this.chatService.getQueryResponseBySource(requestParams).subscribe({
      next: (response: any) => {
        console.log("AI Assistant: Received response from ChatService:", response);
        this.isLoading.set(false);
        
        if (response && response.success) {
          // Process response for code snippets
          const responseContent = response.result.queryResult;
          const isCode = this.detectCodeSnippet(responseContent);
          
          // Add assistant response to chat
          this.chatHistory.update(history => [
            ...history,
            { 
              id: this.generateMessageId(), 
              type: 'assistant', 
              content: responseContent, 
              timestamp: new Date(),
              status: 'sent',
              model: this.selectedModel(),
              isCode
            }
          ]);
          
          // Save chat history
          this.saveChatHistory();
          
          // Scroll to the latest message
          setTimeout(() => this.scrollToBottom(), 100);
        } else if (response.isValidationError) {
          this.errorMessage.set(response.errorMessage || 'An error occurred with your request');
          this.updateMessageStatus(messageId, 'error');
        }
      },
      error: (error) => {
        console.error("AI Assistant: Error from ChatService:", error);
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Unable to connect to the AI service');
        console.error('Error in AI request:', error);
        this.updateMessageStatus(messageId, 'error');
      }
    });
  }

  // Process with Vertex RAG - Modified to accept saved files
  private processWithRag(messageId: string, query: string, attachments: FileAttachment[] = [], filesToUpload: File[] = []): void {
    console.log("AI Assistant: processWithRag called");
    console.log("AI Assistant: messageId:", messageId);
    console.log("AI Assistant: query:", query);
    console.log("AI Assistant: attachments length:", attachments.length);
    console.log("AI Assistant: filesToUpload length:", filesToUpload.length);
    
    // Update message status to sent
    this.updateMessageStatus(messageId, 'sent');
    
    // Process file uploads first if any
    if (filesToUpload.length > 0) {
      console.log("AI Assistant: Uploading files to RAG server");
      
      const fileUploads = filesToUpload.map(file => {
        console.log("AI Assistant: Creating upload observable for file:", file.name);
        return this.vertexRagService.uploadDocument(file);
      });
      
      console.log("AI Assistant: Created upload observables, count:", fileUploads.length);
      
      // After all files are uploaded, query the RAG system
      forkJoin(fileUploads).subscribe({
        next: (uploadResults) => {
          console.log("AI Assistant: All files uploaded successfully:", uploadResults);
          
          // Add confirmation message about uploads
          this.chatHistory.update(history => [
            ...history,
            { 
              id: this.generateMessageId(), 
              type: 'assistant', 
              content: `I've processed ${filesToUpload.length} document(s). I can now answer questions about them.`, 
              timestamp: new Date(),
              status: 'sent',
              model: 'rag'
            }
          ]);
          
          console.log("AI Assistant: Added confirmation message to chat");
          this.saveChatHistory();
          
          // Now query the RAG system if there's a query
          if (query) {
            console.log("AI Assistant: Query exists, sending to RAG system:", query);
            this.queryRagSystem(query);
          } else {
            console.log("AI Assistant: No query to process, setting isLoading to false");
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          console.error("AI Assistant: Error uploading files:", error);
          this.handleRagError(error, messageId);
        }
      });
    } else if (query) {
      // Just query the RAG system if no files
      console.log("AI Assistant: No files to upload, sending query directly:", query);
      this.queryRagSystem(query);
    } else {
      console.log("AI Assistant: No files or query, setting isLoading to false");
      this.isLoading.set(false);
    }
  }

  // Query the RAG system
  private queryRagSystem(query: string): void {
    console.log("AI Assistant: queryRagSystem called with query:", query);
    
    this.vertexRagService.queryRag(query).subscribe({
      next: (response) => {
        console.log("AI Assistant: Received response from RAG system:", response);
        this.isLoading.set(false);
        
        if (response && response.answer) {
          // Add assistant response to chat
          this.chatHistory.update(history => [
            ...history,
            { 
              id: this.generateMessageId(), 
              type: 'assistant', 
              content: response.answer, 
              timestamp: new Date(),
              status: 'sent',
              model: 'rag'
            }
          ]);
          
          // Save chat history and scroll to bottom
          this.saveChatHistory();
          setTimeout(() => this.scrollToBottom(), 100);
        } else {
          // Handle case where response exists but doesn't have 'answer' property
          console.warn("AI Assistant: Response doesn't contain 'answer' property:", response);
          this.chatHistory.update(history => [
            ...history,
            { 
              id: this.generateMessageId(), 
              type: 'assistant', 
              content: 'Received a response but no answer was provided.', 
              timestamp: new Date(),
              status: 'sent',
              model: 'rag'
            }
          ]);
          
          this.saveChatHistory();
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: (error) => {
        console.error("AI Assistant: Error in RAG query:", error);
        this.handleRagError(error, this.generateMessageId());
      }
    });
  }

  // Handle RAG errors
  private handleRagError(error: any, messageId: string): void {
    console.error("AI Assistant: handleRagError called with error:", error);
    this.isLoading.set(false);
    
    // Add a more user-friendly error message to the chat
    this.chatHistory.update(history => [
      ...history,
      { 
        id: this.generateMessageId(), 
        type: 'assistant', 
        content: 'Sorry, I couldn\'t connect to the RAG server. Please check if the server is running on http://localhost:3000.', 
        timestamp: new Date(),
        status: 'sent',
        model: 'rag'
      }
    ]);
    
    this.errorMessage.set('Error connecting to the RAG service.');
    this.saveChatHistory();
    setTimeout(() => this.scrollToBottom(), 100);
  }
  
  // Handle file selection
  handleFileSelection(event: Event): void {
    console.log("AI Assistant: File selection triggered");
    const input = event.target as HTMLInputElement;
    if (input.files) {
      console.log("AI Assistant: Files selected:", Array.from(input.files).map(f => f.name));
      this.selectedFiles.set(Array.from(input.files));
      console.log("AI Assistant: selectedFiles signal updated, length:", this.selectedFiles().length);
    }
  }
  
  // Update message status
  updateMessageStatus(messageId: string, status: 'sending' | 'sent' | 'error'): void {
    this.chatHistory.update(history => 
      history.map(msg => 
        msg.id === messageId 
          ? { ...msg, status } 
          : msg
      )
    );
    this.saveChatHistory();
  }
  
  // Detect code snippets in text
  detectCodeSnippet(text: string): boolean {
    // Basic detection for code blocks
    const codePatterns = [
      /```[\s\S]*?```/g, // Markdown code blocks
      /<code>[\s\S]*?<\/code>/g, // HTML code tags
      /function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?}/g, // JavaScript functions
      /class\s+\w+\s*{[\s\S]*?}/g, // Class definitions
      /import\s+.*from\s+['"].*['"]/g, // ES6 imports
      /const\s+\w+\s*=\s*\([^)]*\)\s*=>/g, // Arrow functions
      /def\s+\w+\s*\([^)]*\):/g, // Python functions
      /public\s+\w+\s+\w+\s*\([^)]*\)\s*{/g, // Java/C# methods
    ];
    
    return codePatterns.some(pattern => pattern.test(text));
  }
  
  // Toggle model dropdown
  toggleModelDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const dropdownMenu = document.getElementById('model-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    }
  }
  
  // Change AI model
  changeModel(modelId: string): void {
    console.log("AI Assistant: Changing model to:", modelId);
    this.selectedModel.set(modelId);
    this.toggleModelDropdown();
    
    // Save preference
    localStorage.setItem('aiAssistantModel', modelId);
    
    // Notify user of model change
    this.chatHistory.update(history => [
      ...history,
      { 
        id: this.generateMessageId(), 
        type: 'assistant', 
        content: `Model switched to ${this.getModelNameById(modelId)}`, 
        timestamp: new Date(),
        status: 'sent'
      }
    ]);
    
    this.saveChatHistory();
    this.scrollToBottom();
  }
  
  // Get model name by ID
  getModelNameById(modelId: string): string {
    const model = this.modelOptions().find(m => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  }
  
  // Toggle settings panel
  toggleSettings(): void {
    this.showSettings.update(value => !value);
  }
  
  // Clear chat
  clearChat(): void {
    this.chatHistory.set([]);
    this.initializeChat();
    
    // Close dropdown if open
    const dropdownMenu = document.getElementById('model-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.style.display = 'none';
    }
    
    this.scrollToBottom();
  }
  
  // Toggle emoji picker
  toggleEmojiPicker(event: Event): void {
    event.stopPropagation();
    this.showEmojiPicker.update(value => !value);
  }
  
  // Add emoji to input
  addEmoji(emoji: string): void {
    this.inputText.update(text => text + emoji);
    this.showEmojiPicker.set(false);
  }
  
  // Toggle voice input
  toggleVoiceInput(): void {
    if (!this.speechSupported || !this.recognition) return;
    
    if (this.isListening()) {
      this.recognition.stop();
      this.isListening.set(false);
    } else {
      this.recognition.start();
      this.isListening.set(true);
    }
  }
  
  // Remove selected file
  removeFile(index: number): void {
    console.log("AI Assistant: Removing file at index:", index);
    this.selectedFiles.update(files => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      console.log("AI Assistant: Files after removal:", newFiles.map(f => f.name));
      return newFiles;
    });
    
    // Reset file input if all files are removed
    if (this.selectedFiles().length === 0 && this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  // Format code for display
  formatCode(code: string): string {
    // Simple formatter - in a real implementation, you might use a syntax highlighter library
    return code;
  }
  
  // Save chat history to localStorage
  saveChatHistory(): void {
    try {
      localStorage.setItem('aiAssistantChatHistory', JSON.stringify(this.chatHistory()));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
  
  // Load chat history from localStorage
  loadChatHistory(): void {
    try {
      const savedHistory = localStorage.getItem('aiAssistantChatHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string dates back to Date objects
        const history = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        this.chatHistory.set(history);
        console.log("AI Assistant: Loaded chat history, messages:", history.length);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // If error, initialize with empty chat
      this.initializeChat();
    }
  }
  
  // Download chat history
  downloadChatHistory(): void {
    const history = this.chatHistory();
    
    // Format chat as text
    let chatText = 'AI Assistant Chat History\n';
    chatText += `Downloaded: ${new Date().toLocaleString()}\n\n`;
    
    history.forEach(msg => {
      const sender = msg.type === 'user' ? 'You' : 'AI Assistant';
      const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = msg.timestamp.toLocaleDateString();
      
      chatText += `[${date} ${time}] ${sender}:\n${msg.content}\n\n`;
    });
    
    // Create download
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-assistant-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  // Copy message to clipboard
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        // Show success notification
        this.showNotification('Copied to clipboard');
      },
      (err) => {
        console.error('Error copying text:', err);
      }
    );
  }
  
  // Show notification
  showNotification(message: string, duration: number = 2000): void {
    const notification = document.createElement('div');
    notification.className = 'assistant-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove notification after duration
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }
  
  // Scroll to bottom of chat
  scrollToBottom(): void {
    if (this.chatContainer) {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
  
  // Generate unique message ID
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Generate unique session ID
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Get text to display in input field
  getPlaceholderText(): string {
    if (this.isListening()) {
      return 'Listening...';
    } else if (this.selectedFiles().length > 0) {
      return `${this.selectedFiles().length} file(s) selected. Add a message or press Send.`;
    } else if (this.selectedModel() === 'rag') {
      return 'Upload documents or ask questions about uploaded content...';
    } else {
      return 'Type your message...';
    }
  }
  
  // Helper method to format timestamps
  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Format date for grouping messages
  formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
  
  // Check if message should show date header
  shouldShowDateHeader(index: number): boolean {
    if (index === 0) return true;
    
    const current = this.chatHistory()[index].timestamp;
    const previous = this.chatHistory()[index - 1].timestamp;
    
    return current.toDateString() !== previous.toDateString();
  }
  
  // Check if message should be grouped with previous
  shouldGroupWithPrevious(index: number): boolean {
    if (index === 0) return false;
    
    const current = this.chatHistory()[index];
    const previous = this.chatHistory()[index - 1];
    
    // Group if same sender and within 5 minutes
    return current.type === previous.type &&
           (current.timestamp.getTime() - previous.timestamp.getTime() < 5 * 60 * 1000);
  }
}