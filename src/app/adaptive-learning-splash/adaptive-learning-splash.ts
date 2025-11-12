import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adaptive-learning-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adaptive-learning-splash.html',
  styleUrl: './adaptive-learning-splash.css'
})
export class AdaptiveLearningSplash {
  @Output() close = new EventEmitter<void>();
  
  closeAndDontShowAgain(): void {
    localStorage.setItem('hideAdaptiveLearningIntro', 'true');
    this.close.emit();
  }
  
  closeOnly(): void {
    this.close.emit();
  }
}