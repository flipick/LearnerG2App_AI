import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AiAssistant } from './ai-assistant';
import { ChatService } from '../services/chat-service';
import { AuthService } from '../services/auth-service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';

describe('AiAssistant', () => {
  let component: AiAssistant;
  let fixture: ComponentFixture<AiAssistant>;
  let chatService: jasmine.SpyObj<ChatService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const chatServiceSpy = jasmine.createSpyObj('ChatService', ['getQueryResponseBySource']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], { 
      'user': { 
        tenantId: '1', 
        learnerId: '1' 
      } 
    });

    await TestBed.configureTestingModule({
      imports: [
        AiAssistant,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistant);
    component = fixture.componentInstance;
    chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    // Mock DOM methods not available in test environment
    global.URL.createObjectURL = jasmine.createSpy().and.returnValue('mock-url');
    
    // Mock scrollToBottom as the chatContainer might not be available in tests
    spyOn(component, 'scrollToBottom').and.callThrough();
    
    // Initialize component
    component.chatContainer = {
      nativeElement: {
        scrollTop: 0,
        scrollHeight: 100
      }
    } as ElementRef;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with a welcome message', () => {
    expect(component.chatHistory().length).toBe(1);
    expect(component.chatHistory()[0].type).toBe('assistant');
    expect(component.chatHistory()[0].content).toContain('Hello!');
  });

  it('should not send empty messages', () => {
    // Set empty input
    component.inputText.set('');
    
    // Try to send message
    component.sendMessage();
    
    // Expect no change in chat history and no service call
    expect(component.chatHistory().length).toBe(1);
    expect(chatService.getQueryResponseBySource).not.toHaveBeenCalled();
  });

  it('should add user message and call chat service when sending a message', () => {
    // Setup mock response
    const mockResponse = { 
      success: true, 
      result: { queryResult: 'I am the AI assistant response' } 
    };
    chatService.getQueryResponseBySource.and.returnValue(of(mockResponse));
    
    // Set input and send message
    component.inputText.set('Test message');
    component.sendMessage();
    
    // Verify user message added
    expect(component.chatHistory().length).toBe(2);
    expect(component.chatHistory()[1].type).toBe('user');
    expect(component.chatHistory()[1].content).toBe('Test message');
    
    // Verify service called
    expect(chatService.getQueryResponseBySource).toHaveBeenCalled();
    
    // Verify input cleared and loading set
    expect(component.inputText()).toBe('');
    expect(component.isLoading()).toBe(true);
    
    // Simulate response arriving
    fixture.detectChanges();
    
    // Verify assistant response added
    expect(component.chatHistory().length).toBe(3);
    expect(component.chatHistory()[2].type).toBe('assistant');
    expect(component.chatHistory()[2].content).toBe('I am the AI assistant response');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle error responses', () => {
    // Setup error response
    const errorResponse = { 
      success: false, 
      isValidationError: true,
      errorMessage: 'Invalid request'
    };
    chatService.getQueryResponseBySource.and.returnValue(of(errorResponse));
    
    // Send message
    component.inputText.set('Test message');
    component.sendMessage();
    
    // Simulate response
    fixture.detectChanges();
    
    // Verify error handling
    expect(component.errorMessage()).toBe('Invalid request');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle network errors', () => {
    // Setup network error
    chatService.getQueryResponseBySource.and.returnValue(throwError(() => new Error('Network failure')));
    
    // Send message
    component.inputText.set('Test message');
    component.sendMessage();
    
    // Simulate error
    fixture.detectChanges();
    
    // Verify error handling
    expect(component.errorMessage()).toBe('Network failure');
    expect(component.isLoading()).toBe(false);
  });

  it('should change AI model when selected', () => {
    // Initial default model
    expect(component.selectedModel()).toBe('default');
    
    // Change model
    component.changeModel('advanced');
    
    // Verify model changed
    expect(component.selectedModel()).toBe('advanced');
    
    // Verify model change notification in chat
    expect(component.chatHistory()[1].type).toBe('assistant');
    expect(component.chatHistory()[1].content).toContain('Advanced AI');
  });

  it('should clear chat history except welcome message when clearing chat', () => {
    // Add some messages
    component.chatHistory.update(history => [
      ...history,
      { 
        id: 'test1', 
        type: 'user', 
        content: 'Hello', 
        timestamp: new Date(),
        status: 'sent'
      },
      { 
        id: 'test2', 
        type: 'assistant', 
        content: 'Hi there', 
        timestamp: new Date(),
        status: 'sent'
      }
    ]);
    
    expect(component.chatHistory().length).toBe(3);
    
    // Clear chat
    component.clearChat();
    
    // Verify only welcome message remains
    expect(component.chatHistory().length).toBe(1);
    expect(component.chatHistory()[0].type).toBe('assistant');
    expect(component.chatHistory()[0].content).toContain('Hello!');
  });

  it('should detect code snippets', () => {
    // Test code detection
    const regularText = 'This is just a regular message with no code.';
    const javascriptCode = 'function hello() { console.log("Hello, world!"); }';
    const pythonCode = 'def greet():\n    print("Hello, world!")';
    const markdownCode = '```javascript\nconst name = "Claude";\nconsole.log(`Hello, ${name}!`);\n```';
    
    expect(component.detectCodeSnippet(regularText)).toBeFalse();
    expect(component.detectCodeSnippet(javascriptCode)).toBeTrue();
    expect(component.detectCodeSnippet(pythonCode)).toBeTrue();
    expect(component.detectCodeSnippet(markdownCode)).toBeTrue();
  });

  it('should format time correctly', () => {
    const testDate = new Date(2023, 5, 15, 14, 30); // June 15, 2023, 2:30 PM
    const formattedTime = component.formatTime(testDate);
    
    // This will depend on the user's locale, but we can check basic format
    expect(formattedTime).toMatch(/^\d{1,2}:\d{2}(?: [AP]M)?$/);
  });

  it('should format date correctly', () => {
    // Create dates for testing
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Check formatting
    expect(component.formatDate(today)).toBe('Today');
    expect(component.formatDate(yesterday)).toBe('Yesterday');
    expect(component.formatDate(lastWeek)).not.toBe('Today');
    expect(component.formatDate(lastWeek)).not.toBe('Yesterday');
  });

  it('should determine when to show date headers correctly', () => {
    // Create test messages with different dates
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    component.chatHistory.set([
      {
        id: 'msg1',
        type: 'assistant',
        content: 'Hello!',
        timestamp: yesterday,
        status: 'sent'
      },
      {
        id: 'msg2',
        type: 'user',
        content: 'Hi there',
        timestamp: yesterday,
        status: 'sent'
      },
      {
        id: 'msg3',
        type: 'assistant',
        content: 'How can I help?',
        timestamp: today,
        status: 'sent'
      }
    ]);
    
    // First message should always show date header
    expect(component.shouldShowDateHeader(0)).toBeTrue();
    
    // Second message (same day as first) should not show date header
    expect(component.shouldShowDateHeader(1)).toBeFalse();
    
    // Third message (different day) should show date header
    expect(component.shouldShowDateHeader(2)).toBeTrue();
  });

  it('should determine when to group messages correctly', () => {
    // Create test messages for grouping
    const baseTime = new Date();
    const time1 = new Date(baseTime);
    const time2 = new Date(baseTime.getTime() + 2 * 60 * 1000); // 2 minutes later
    const time3 = new Date(baseTime.getTime() + 10 * 60 * 1000); // 10 minutes later
    
    component.chatHistory.set([
      {
        id: 'msg1',
        type: 'user',
        content: 'First message',
        timestamp: time1,
        status: 'sent'
      },
      {
        id: 'msg2',
        type: 'user',
        content: 'Second message (same user, 2 min later)',
        timestamp: time2,
        status: 'sent'
      },
      {
        id: 'msg3',
        type: 'assistant',
        content: 'Assistant response',
        timestamp: time2,
        status: 'sent'
      },
      {
        id: 'msg4',
        type: 'user',
        content: 'User response (10 min later)',
        timestamp: time3,
        status: 'sent'
      }
    ]);
    
    // First message should never be grouped
    expect(component.shouldGroupWithPrevious(0)).toBeFalse();
    
    // Second message (same user, within 5 min) should be grouped
    expect(component.shouldGroupWithPrevious(1)).toBeTrue();
    
    // Third message (different user) should not be grouped
    expect(component.shouldGroupWithPrevious(2)).toBeFalse();
    
    // Fourth message (same user as first two, but after 5 min) should not be grouped
    expect(component.shouldGroupWithPrevious(3)).toBeFalse();
  });

  it('should toggle settings panel', () => {
    // Initially closed
    expect(component.showSettings()).toBeFalse();
    
    // Toggle open
    component.toggleSettings();
    expect(component.showSettings()).toBeTrue();
    
    // Toggle closed
    component.toggleSettings();
    expect(component.showSettings()).toBeFalse();
  });
});