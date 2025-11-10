import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LearningGoalsComponent } from './learning-goals.component';
import { LearnerAiService } from '../services/learner-ai.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LearningGoalsComponent', () => {
  let component: LearningGoalsComponent;
  let fixture: ComponentFixture<LearningGoalsComponent>;
  let learnerAiServiceSpy: jasmine.SpyObj<LearnerAiService>;

  beforeEach(async () => {
    // Create spy for LearnerAiService
    const spy = jasmine.createSpyObj('LearnerAiService', ['getLearningGoals', 'saveLearningGoals']);
    
    await TestBed.configureTestingModule({
      imports: [LearningGoalsComponent, FormsModule],
      providers: [
        { provide: LearnerAiService, useValue: spy }
      ]
    }).compileComponents();

    learnerAiServiceSpy = TestBed.inject(LearnerAiService) as jasmine.SpyObj<LearnerAiService>;
    
    // Mock successful response for getLearningGoals
    learnerAiServiceSpy.getLearningGoals.and.returnValue(of({
      success: true,
      statusCode: 200,
      result: {
        learnerId: 1,
        careerPath: 'software-dev',
        targetRole: 'fullstack-dev',
        timeframe: '6-12',
        isJobSearching: true,
        skills: ['javascript', 'react', 'node'],
        timeCommitment: 'medium',
        learningStyle: 'visual',
        difficultyLevel: 'intermediate',
        objective: 'Become a full stack developer',
        wantsCertifications: true
      }
    }));
    
    // Mock successful response for saveLearningGoals
    learnerAiServiceSpy.saveLearningGoals.and.returnValue(of({
      success: true,
      statusCode: 200,
      result: true
    }));

    fixture = TestBed.createComponent(LearningGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load existing learning goals on init', () => {
    expect(learnerAiServiceSpy.getLearningGoals).toHaveBeenCalled();
    expect(component.goals.careerPath).toBe('software-dev');
    expect(component.goals.targetRole).toBe('fullstack-dev');
    expect(component.goals.skills).toContain('javascript');
    expect(component.selectedSkills.length).toBe(3);
  });

  it('should filter skills based on search input', () => {
    component.skillSearch = 'java';
    component.filterSkills();
    
    expect(component.filteredSkills.length).toBeLessThan(component.allSkills.length);
    expect(component.filteredSkills.some(skill => skill.name.toLowerCase().includes('java'))).toBeTrue();
  });

  it('should toggle skill selection', () => {
    const testSkill = component.allSkills[0];
    const initialLength = component.selectedSkills.length;
    
    // Add skill
    component.toggleSkill(testSkill);
    expect(component.selectedSkills.length).toBe(initialLength + 1);
    expect(component.isSkillSelected(testSkill.id)).toBeTrue();
    
    // Remove skill
    component.toggleSkill(testSkill);
    expect(component.selectedSkills.length).toBe(initialLength);
    expect(component.isSkillSelected(testSkill.id)).toBeFalse();
  });

  it('should reset form to defaults', () => {
    component.resetForm();
    
    expect(component.goals.careerPath).toBe('');
    expect(component.goals.targetRole).toBe('');
    expect(component.goals.skills.length).toBe(0);
    expect(component.selectedSkills.length).toBe(0);
  });

  it('should save learning goals', () => {
    component.saveGoals();
    
    expect(learnerAiServiceSpy.saveLearningGoals).toHaveBeenCalled();
    expect(component.isSaving).toBeFalse();
    expect(component.showSuccessNotification).toBeTrue();
  });

  it('should handle error when saving learning goals', () => {
    // Mock error response for saveLearningGoals
    learnerAiServiceSpy.saveLearningGoals.and.returnValue(throwError(() => new Error('Test error')));
    
    // Spy on console.error
    spyOn(console, 'error');
    
    component.saveGoals();
    
    expect(component.isSaving).toBeFalse();
    expect(console.error).toHaveBeenCalled();
  });

  it('should dismiss notification', () => {
    component.showSuccessNotification = true;
    component.dismissNotification();
    expect(component.showSuccessNotification).toBeFalse();
  });
});