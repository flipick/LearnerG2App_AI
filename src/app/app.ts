import { Component, HostListener, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { Dashboard } from './dashboard/dashboard';
import { Courses } from './courses/courses';
import { Assessments } from './assessments/assessments';
import { AiAssistant } from './ai-assistant/ai-assistant';
import { Achievements } from './achievements/achievements';
import { Profile } from './profile/profile';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ScormToXAPIFunctions } from './Scorm/scorm-to-xapifunctions';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,    
    CommonModule
  ],  
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('LMS G2');
  constructor(private scormToApiService:ScormToXAPIFunctions){}
  @HostListener('window:message', ['$event'])
  onPostMessage(event: MessageEvent) {
    // (Optional) Security check
    if (event.data?.action === 'READY?') {            
      event.source?.postMessage({ action: 'READY', status: true },{
          targetOrigin: "https://g2admin.flipick.com"
      });
      return;
    }
    
   this.dealWithObject(JSON.parse(event.data));
    event.source?.postMessage({ action: 'ACK', status: true },{
          targetOrigin: "https://g2admin.flipick.com"
      });
    console.log('Message received in AppComponent:', event.data);

    // 👉 You can now forward this to a service or signals
  }
  private dealWithObject=(data:any)=>
  {   
      if(data!=null){
          var action = data.Action || "NOACTION";
        action = action.toUpperCase();
        var from = data.From || "NOFROM";
        from = from.toUpperCase();
          switch (action) {
              case "SCORM":
                switch (data.ScormAction) {
                    case "SCORM_INITIALIZE":
                         this.scormToApiService.initializeAttempt();
                        break;

                    case "SCORM_TERMINATE":
                        this.scormToApiService.terminateAttempt();
                        break;

                    case "SCORM_SETVALUE":
                        this.scormToApiService.saveDataValue(data.Data.cmimodel, data.Data.cmidata);
                        break;

                    case "SCORM_COMMIT":
                        break;

                    case "SCORM_GETLASTERROR":
                        break;

                    case "SCORM_GETERRORSTRING":
                        break;

                    case "SCORM_GETDIAGNOSTIC":
                        break;

                    default:
                }

                break;
          }
      }
  }
}
