import { Injectable } from '@angular/core';
import { CourseInfo } from '../models/course.state';

@Injectable({
  providedIn: 'root'
})
export class CourseState {
    private courseInfo: CourseInfo | null = null;
  private readonly storageKey = 'courseInfo';

  constructor() {
    // Load from sessionStorage if available
    const saved = sessionStorage.getItem(this.storageKey);
    if (saved) {
      this.courseInfo = JSON.parse(saved);
    }
  }

  setCourseInfo(id: number, name: string,courseType:string): void {
    this.courseInfo = { id, name,courseType };
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.courseInfo));
  }

  getCourseInfo(): CourseInfo | null {
    return this.courseInfo;
  }

  clearCourseInfo(): void {
    this.courseInfo = null;
    sessionStorage.removeItem(this.storageKey);
  }
}
