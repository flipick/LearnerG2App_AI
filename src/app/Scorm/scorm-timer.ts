import { Injectable } from '@angular/core';
import { CourseState } from '../services/course-state';

@Injectable({
  providedIn: 'root'
})
export class ScormTimer {

    constructor(private courseStateService:CourseState){}
    startTimer() {
        var start = 0;
        start = new Date().getTime();
        return start;
    }

    endTimer () {
        var startTime = parseFloat(JSON.parse(window.localStorage.getItem("ScormStartTimer:" + this.courseStateService.getCourseInfo()?.id) ?? ''));
        var end = 0;
        end = new Date().getTime();
        var millsec = end - startTime;
        return millsec / 1000 // return seconds
    }

    
}
