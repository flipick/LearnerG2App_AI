import { Routes } from '@angular/router';
import { Header } from './layout/header/header';
import { Dashboard } from './dashboard/dashboard';
import { Courses } from './courses/courses';
import { Assessments } from './assessments/assessments';
import { AiAssistant } from './ai-assistant/ai-assistant';
import { Achievements } from './achievements/achievements';
import { Profile } from './profile/profile';
import { Login } from './login/login';
import { Content } from './layout/content/content';
import { authGuard } from './services/auth-guard';
import { CourseLaunch } from './course-launch/course-launch';
import { AssessmentLaunch } from './assessment-launch/assessment-launch';

export const routes: Routes = [    
    {path: 'login', loadComponent: () => import('./login/login').then(m => m.Login)},
    {path: '',
        component:Content,
        children: [
            { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard), data: { title: 'Dashboard' } },
            { path: 'courses', loadComponent: () => import('./courses/courses').then(m => m.Courses), data: { title: 'Courses' } },
            { path: 'course-launch', loadComponent: () => import('./course-launch/course-launch').then(m => m.CourseLaunch), data: { title: 'CouresLaunch' } },
            { path: 'package-courses', loadComponent:() => import('./package-courses/package-courses').then(m => m.PackageCourses), data: { title: 'PackageCourses' } },
            { path: 'assessments', component: Assessments, data: { title: 'Assessments' } },
            { path: 'assistant', component: AiAssistant, data: { title: 'AI Assistant' } },
            { path: 'achievements', component: Achievements, data: { title: 'Achievements' } },
            { path: 'profile', component: Profile, data: { title: 'Profile' } },
            {path:'assessment-launch',component:AssessmentLaunch,data:{title:'assessment-launch'}},  // Added comma here
            { path: 'learning-goals', loadComponent: () => import('./learning-goals/learning-goals.component').then(m => m.LearningGoalsComponent), data: { title: 'Learning Goals' } }
        ],
        canActivate:[authGuard]
    }
];