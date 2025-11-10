import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AiAssistant } from './ai-assistant';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AiAssistant
  ],
  exports: [
    AiAssistant
  ]
})
export class AiAssistantModule { }