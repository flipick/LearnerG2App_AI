import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LearnerAiService, ApiResponse, LearningGoals } from '../services/learner-ai.service';

// Interfaces
interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  iconColor: string;
}

interface CareerPath {
  id: string;
  name: string;
}

interface TargetRole {
  id: string;
  name: string;
}

@Component({
  selector: 'app-learning-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learning-goals.component.html',
  styleUrls: ['./learning-goals.component.css']
})
export class LearningGoalsComponent implements OnInit {
  // Properties
  goals: LearningGoals = {
    learnerId: 0,
    careerPath: '',
    targetRole: '',
    timeframe: '',
    isJobSearching: false,
    skills: [],
    timeCommitment: 'medium',
    learningStyle: 'visual',
    difficultyLevel: 'beginner',
    objective: '',
    wantsCertifications: false
  };

  // Mock data
  careerPaths: CareerPath[] = [
    { id: 'software-dev', name: 'Software Development' },
    { id: 'data-science', name: 'Data Science & Analytics' },
    { id: 'cloud-computing', name: 'Cloud Computing' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'product-management', name: 'Product Management' },
    { id: 'ux-design', name: 'UX/UI Design' }
  ];

  targetRoles: TargetRole[] = [
    { id: 'frontend-dev', name: 'Frontend Developer' },
    { id: 'backend-dev', name: 'Backend Developer' },
    { id: 'fullstack-dev', name: 'Full Stack Developer' },
    { id: 'data-analyst', name: 'Data Analyst' },
    { id: 'data-scientist', name: 'Data Scientist' },
    { id: 'ml-engineer', name: 'Machine Learning Engineer' },
    { id: 'cloud-architect', name: 'Cloud Architect' },
    { id: 'devops-engineer', name: 'DevOps Engineer' },
    { id: 'security-analyst', name: 'Security Analyst' },
    { id: 'product-manager', name: 'Product Manager' },
    { id: 'ux-designer', name: 'UX Designer' },
    { id: 'ui-designer', name: 'UI Designer' }
  ];

  allSkills: Skill[] = [
    // Technical skills
    { id: 'javascript', name: 'JavaScript', category: 'technical', iconColor: '#F7DF1E' },
    { id: 'python', name: 'Python', category: 'technical', iconColor: '#3776AB' },
    { id: 'java', name: 'Java', category: 'technical', iconColor: '#007396' },
    { id: 'csharp', name: 'C#', category: 'technical', iconColor: '#239120' },
    { id: 'react', name: 'React', category: 'technical', iconColor: '#61DAFB' },
    { id: 'angular', name: 'Angular', category: 'technical', iconColor: '#DD0031' },
    { id: 'vue', name: 'Vue.js', category: 'technical', iconColor: '#4FC08D' },
    { id: 'node', name: 'Node.js', category: 'technical', iconColor: '#339933' },
    { id: 'aws', name: 'AWS', category: 'technical', iconColor: '#FF9900' },
    { id: 'azure', name: 'Azure', category: 'technical', iconColor: '#0078D4' },
    { id: 'sql', name: 'SQL', category: 'technical', iconColor: '#4479A1' },
    { id: 'nosql', name: 'NoSQL', category: 'technical', iconColor: '#4DB33D' },
    { id: 'docker', name: 'Docker', category: 'technical', iconColor: '#2496ED' },
    { id: 'kubernetes', name: 'Kubernetes', category: 'technical', iconColor: '#326CE5' },
    
    // Soft skills
    { id: 'communication', name: 'Communication', category: 'soft', iconColor: '#10B981' },
    { id: 'teamwork', name: 'Teamwork', category: 'soft', iconColor: '#10B981' },
    { id: 'problem-solving', name: 'Problem Solving', category: 'soft', iconColor: '#10B981' },
    { id: 'critical-thinking', name: 'Critical Thinking', category: 'soft', iconColor: '#10B981' },
    { id: 'time-management', name: 'Time Management', category: 'soft', iconColor: '#10B981' },
    { id: 'leadership', name: 'Leadership', category: 'soft', iconColor: '#10B981' },
    
    // Domain skills
    { id: 'finance', name: 'Finance', category: 'domain', iconColor: '#6366F1' },
    { id: 'healthcare', name: 'Healthcare', category: 'domain', iconColor: '#6366F1' },
    { id: 'ecommerce', name: 'E-commerce', category: 'domain', iconColor: '#6366F1' },
    { id: 'edtech', name: 'EdTech', category: 'domain', iconColor: '#6366F1' },
    { id: 'gaming', name: 'Gaming', category: 'domain', iconColor: '#6366F1' }
  ];

  // UI state
  filteredSkills: Skill[] = [];
  selectedSkills: Skill[] = [];
  skillSearch: string = '';
  isSaving: boolean = false;
  showSuccessNotification: boolean = false;

  constructor(
    private learnerAiService: LearnerAiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.filteredSkills = [...this.allSkills];
    
    // Attempt to load existing goals if they exist
    this.loadExistingGoals();
  }

  /**
   * Loads existing learning goals for the user
   */
  loadExistingGoals(): void {
    // Get user ID from auth service (replace with your auth mechanism)
    const userId = 1; // Mock user ID

    this.learnerAiService.getLearningGoals(userId).subscribe({
      next: (response: ApiResponse<LearningGoals>) => {
        if (response.success && response.result) {
          this.goals = response.result;
          
          // Update selected skills based on loaded goals
          this.selectedSkills = this.allSkills.filter(skill => 
            this.goals.skills.includes(skill.id)
          );
        }
      },
      error: (error: Error) => {
        console.error('Error loading learning goals', error);
        // We'll just use the default goals if loading fails
      }
    });
  }

  /**
   * Filter skills based on search input
   */
  filterSkills(): void {
    if (!this.skillSearch.trim()) {
      this.filteredSkills = [...this.allSkills];
      return;
    }

    const searchLower = this.skillSearch.toLowerCase();
    this.filteredSkills = this.allSkills.filter(skill => 
      skill.name.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Check if a skill is currently selected
   */
  isSkillSelected(skillId: string): boolean {
    return this.selectedSkills.some(skill => skill.id === skillId);
  }

  /**
   * Toggle skill selection
   */
  toggleSkill(skill: Skill): void {
    if (this.isSkillSelected(skill.id)) {
      this.removeSkill(skill);
    } else {
      this.selectedSkills.push(skill);
      this.goals.skills = this.selectedSkills.map(s => s.id);
    }
  }

  /**
   * Remove a skill from the selected list
   */
  removeSkill(skill: Skill): void {
    this.selectedSkills = this.selectedSkills.filter(s => s.id !== skill.id);
    this.goals.skills = this.selectedSkills.map(s => s.id);
  }

  /**
   * Reset form to defaults
   */
  resetForm(): void {
    this.goals = {
      learnerId: 0,
      careerPath: '',
      targetRole: '',
      timeframe: '',
      isJobSearching: false,
      skills: [],
      timeCommitment: 'medium',
      learningStyle: 'visual',
      difficultyLevel: 'beginner',
      objective: '',
      wantsCertifications: false
    };
    
    this.selectedSkills = [];
    this.skillSearch = '';
    this.filterSkills();
  }

  /**
   * Save learning goals
   */
  saveGoals(): void {
    // Get user ID from auth service (replace with your auth mechanism)
    const userId = 1; // Mock user ID
    this.goals.learnerId = userId;

    this.isSaving = true;

    // Save to API
    this.learnerAiService.saveLearningGoals(this.goals).subscribe({
      next: (response: ApiResponse<boolean>) => {
        this.isSaving = false;
        
        if (response.success) {
          // Show success notification
          this.showSuccessNotification = true;
          
          // After 5 seconds, hide the notification
          setTimeout(() => {
            this.showSuccessNotification = false;
          }, 5000);
        }
      },
      error: (error: Error) => {
        this.isSaving = false;
        console.error('Error saving learning goals', error);
        // Handle error (show error notification, etc.)
      }
    });
  }

  /**
   * Dismiss notification
   */
  dismissNotification(): void {
    this.showSuccessNotification = false;
  }
}