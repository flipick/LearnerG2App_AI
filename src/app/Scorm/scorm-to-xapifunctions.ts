import { Injectable } from '@angular/core';
import { CourseState } from '../services/course-state';
import { concat } from 'rxjs';
import { UserState } from '../services/user-state';
import { XApiVerb,IActivityResult } from '../models/xapi.model';
import { XAPI } from './xapi';
import { ScormTimer } from './scorm-timer';
import { secondsToIsoDuration } from '../utility/time.utils';
import { LRS } from '../services/lrs';


@Injectable({
  providedIn: 'root'
})
export class ScormToXAPIFunctions {
  scormLaunchData:any="";
  scormLaunchDataJSON:any={};
  scormVersionConfig:any={};
  config = {
    courseId: "https://6ZzgTlHHxSK_",
    lmsHomePage: "https://6ZzgTlHHxSK_",
    isScorm2004: false,
    activityId: "https://example.com/scorm/",
    groupingContextActivity: {}
  };
  exitSetToSuspend:boolean = false;

  constructor(private courseStateService: CourseState,
    private userStateService: UserState, 
    private xpiService: XAPI,
    private scormTimer:ScormTimer,
    private lrsService:LRS) {
    this.config.courseId = this.config.courseId.concat(this.courseStateService.getCourseInfo()?.id?.toString() ?? '');
    this.config.activityId = this.config.activityId.concat(this.courseStateService.getCourseInfo()?.id?.toString() ?? '') + "/";
    this.config.lmsHomePage = this.config.lmsHomePage.concat(this.userStateService.getCurrentUser()?.email?.toString() ?? '') + "/";
  }
  private getAgent() {
    // Replace with actual logic for getting agent (user) info
    var agent = {
      account: {
        homePage: this.config.lmsHomePage,
        name: this.userStateService.getCurrentUser()?.name
      },
      name: this.userStateService.getCurrentUser()?.name,
      mbox: this.userStateService.getCurrentUser()?.email
    };
    return agent;
  }

  private configureXAPIData() {
        // get configuration information from the LMS
        this.scormLaunchData = this.retrieveDataValue("cmi.launch_data");
        this.scormLaunchDataJSON = JSON.parse(this.scormLaunchData); // todo: confirm launch data exists, if not default values
        // set local config object with launch data information
        //config.lrs.endpoint = scormLaunchDataJSON.lrs.endpoint;
        //config.lrs.user = scormLaunchDataJSON.lrs.user;
        //config.lrs.password = scormLaunchDataJSON.lrs.password;

        this.config.courseId = this.scormLaunchDataJSON.courseId;
        this.config.lmsHomePage = this.scormLaunchDataJSON.lmsHomePage;
        this.config.isScorm2004 = this.scormLaunchDataJSON.isScorm2004;
        this.config.activityId = this.scormLaunchDataJSON.activityId;
        this.config.groupingContextActivity = this.scormLaunchDataJSON.groupingContextActivity; // setup SCORM object based on configuration

        this.scormVersionConfig = {
            learnerIdElement: this.config.isScorm2004 ? "cmi.learner_id" : "cmi.core.student_id",
            entryElement: this.config.isScorm2004 == true ? "cmi.entry" : "cmi.core.entry",
            exitElement: this.config.isScorm2004 ? "cmi.exit" : "cmi.core.exit",
            successElement: this.config.isScorm2004 ? "cmi.success_status" : "cmi.core.lesson_status",
            completionElement: this.config.isScorm2004 ? "cmi.completion_status" : "cmi.core.lesson_status",
            scoreRawElement: this.config.isScorm2004 ? "cmi.score.raw" : "cmi.core.score.raw",
            scoreMinElement: this.config.isScorm2004 ? "cmi.score.min" : "cmi.core.score.min",
            scoreMaxElement: this.config.isScorm2004 ? "cmi.score.max" : "cmi.core.score.max",
            scoreScaledElement: this.config.isScorm2004 ? "cmi.score.scaled" : "cmi.core.score.raw",
            languageElement: this.config.isScorm2004 ? "cmi.learner_preference.language" : "cmi.student_preference.language",
            audioLevelElement: this.config.isScorm2004 ? "cmi.learner_preference.audio_level" : "cmi.student_preference.audio",
            deliverySpeedElement: this.config.isScorm2004 ? "cmi.learner_preference.delivery_speed" : "cmi.student_preference.speed",
            audioCaptioningElement: this.config.isScorm2004 ? "cmi.learner_preference.audio_captioning" : "cmi.student_preference.text",
            completionThresholdElement: this.config.isScorm2004 ? "cmi.completion_threshold" : "",
            launchDataElement: "cmi.launch_data",
            suspendDataElement: "cmi.suspend_data",
            courseNameDataElement: "cmi.course_name",
            maxTimeAllowedElement: this.config.isScorm2004 ? "cmi.max_time_allowed" : "cmi.student_data.max_time_allowed",
            scaledPassingScoreElement: this.config.isScorm2004 ? "cmi.scaled_passing_score" : "cmi.student_data.mastery_score",
            timeLimitActionElement: this.config.isScorm2004 ? "cmi.time_limit_action" : "cmi.student_data.time_limit_action",
            locationElement: this.config.isScorm2004 ? "cmi.location" : "cmi.core.lesson_location",
            creditElement: this.config.isScorm2004 ? "cmi.credit" : "cmi.core.credit",
            modeElement: this.config.isScorm2004 ? "cmi.mode" : "cmi.core.lesson_mode",
            totalTimeElement: this.config.isScorm2004 ? "cmi.total_time" : "cmi.core.total_time",
            sessionTimeElement: this.config.isScorm2004 ? "cmi.session_time" : "cmi.core.session_time"
        };
    };
  private adjustFinishStatementForResume()
  {

  }
  private generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + window.crypto.getRandomValues(new Uint32Array(10))[0] * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : r & 0x7 | 0x8).toString(16);
        });
        return uuid;
    };
  retrieveDataValue(requestName:any) {
        if (requestName === "cmi.launch_data") {
            return this.scormLaunchDataJSON = JSON.stringify(this.config);
        } else if (requestName === this.scormVersionConfig.learnerIdElement) {
            return this.userStateService.getCurrentUser()?.name;
        } else if (requestName === this.scormVersionConfig.launchDataElement) {
            return "en-US";
        } else if (requestName === this.scormVersionConfig.audioLevelElement) {
            return 5;
        } else if (requestName === this.scormVersionConfig.audioCaptioningElement) {
            return 0; //(-1[off], 0[no change], 1[on])
        } else if (requestName === this.scormVersionConfig.deliverySpeedElement) {
            return 0;
        } else if (requestName === this.scormVersionConfig.modeElement) {
            return "normal";
        } else if (requestName === this.scormVersionConfig.courseNameDataElement) {
            return this.courseStateService.getCourseInfo()?.name;
        } else if (requestName === this.scormVersionConfig.maxTimeAllowedElement) {
            return "00:0:00";
        } else if (requestName === this.scormVersionConfig.scaledPassingScoreElement) {
            return "30";
        } else if (requestName === this.scormVersionConfig.timeLimitActionElement) {
            return "exit, message";
        } else if (requestName === this.scormVersionConfig.suspendDataElement) {
            return localStorage.getItem("suspend_data");
        } else if (requestName === this.scormVersionConfig.locationElement) {
            return "";
        } else {
            return "";
        }
    }

  getBaseStatement() {
    const resultObj: IActivityResult = {
        completion: null,
        success: false,
        duration: null,
        response: null,
        score: {
          scaled: null,
          raw: null,
          min: null,
          max: null
        }
      };
    return {
      actor: this.getAgent(),
      verb: {},
      object: {
        id: this.config.activityId,
        definition: {
          type: this.xpiService.getActivityType().lesson,
          name: {}
        },
        objectType: "Activity"
      },
      context: {
        contextActivities: {
          grouping: [{
            id: "",
            objectType: "Activity",
            definition: {
              type: this.xpiService.getActivityType().attempt
            }
          }, {
            id: this.config.courseId,
            objectType: "Activity",
            definition: {
              type: this.xpiService.getActivityType().course
            }
          }],
          category: [{
            id: "https://w3id.org/xapi/scorm"
          }]
        }
      },
      result: resultObj
    };
  };

  getInteractionsBaseStatement() {
    const resultObj: IActivityResult = {
        completion: null,
        success: false,
        duration: null,
        response: null,
        score: {
          scaled: null,
          raw: null,
          min: null,
          max: null
        }
      };
    return {
      actor: this.getAgent(),
      verb: this.xpiService.getVerb().responded,
      object: {
        objectType: "Activity",
        id: "",
        definition: {
          name: {},
          description: {},
          type: this.xpiService.getActivityType().cmiInteraction,
          interactionType: "",
          correctResponsesPattern: [],
          choices:[],
          scale:[],
          source:[],
          target:[],
          steps:[]
        }
      },
      context: {
        contextActivities: {
          parent: [{
            id: this.config.activityId,
            objectType: "Activity",
            definition: {
              type: this.xpiService.getActivityType().lesson
            }
          }],
          grouping: [{
            id: "",
            objectType: "Activity",
            definition: {
              type: this.xpiService.getActivityType().attempt
            }
          }, {
            id: this.config.courseId,
            objectType: "Activity",
            definition: {
              type: this.xpiService.getActivityType().course
            }
          }],
          category: [{
            id: "https://w3id.org/xapi/scorm"
          }]
        }
      },
      result: resultObj,
      timestamp: null
    };
  };

  getVoidedBaseStatement() {
    return {
      actor: this.getAgent(),
      verb: {},
      object: {
        objectType: "StatementRef",
        id: ""
      }
    };
  };
  private sendSimpleStatement(verb:any) {
        var stmt = this.getBaseStatement();
        stmt.verb = verb;
        var definition_name = this.retrieveDataValue(this.scormVersionConfig.courseNameDataElement);
        //stmt.object.id = this.getInteractionIri();
        stmt.object.definition.name = {
            "en-US": definition_name
        };
        stmt.context.contextActivities.grouping[0].id = window.localStorage[this.config.activityId]; // set the context activity from the manifest/launch_data to group together
        // for an event
        //if (config.groupingContextActivity) {
        //    stmt.context.contextActivities.grouping.push(config.groupingContextActivity);
        //}
        
        if (stmt.verb == this.xpiService.getVerb().completed) {
            var timeInSec = this.scormTimer.endTimer();
            var iso801Time = secondsToIsoDuration(timeInSec); //add duration         

            stmt.result.duration =iso801Time ?? null;
            var score = JSON.parse(localStorage.getItem("score:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id) ?? '');
            var PassOrFail = JSON.parse(localStorage.getItem("success:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id) ?? '');
            localStorage.removeItem("score:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id);
            localStorage.removeItem("success:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id);

            if (PassOrFail != null) {
                if (PassOrFail == "failed") {
                    return;
                }

                var success = PassOrFail == "passed" ? true : false;

                if (PassOrFail == "passed" && score != null) {
                    stmt.result.score.scaled = score;
                }

                stmt.result.success = success;
            }
        }

        var response = this.sendStatement(stmt);
    };
  private sendStatement(stmt:any) {
        // if (ADL && ADL.XAPIWrapper && ADL.XAPIWrapper.sendStatement) {
        //     ADL.XAPIWrapper.sendStatement(stmt);
        // }

        //stmt.object.id = stmt.object.id + WebConfigData.CourseId + "/" + subtopic.SubTopicId;
        //sessionStorage.setItem("subTopicActivityId_" + WebConfigData.CourseId, stmt.object.id = stmt.object.id + WebConfigData.CourseId + "/" + subtopic.SubTopicId);

        var isStatementCompleted = false;
        var slidName="";
        var slideCount=0;
        if (stmt.verb.id == this.xpiService.getVerb().completed.id) {
            isStatementCompleted = true;
        }        
        if(stmt.verb.id == this.xpiService.getVerb().experienced.id){

            var timeInSec = this.scormTimer.endTimer();
            var iso801Time = secondsToIsoDuration(timeInSec);
            stmt.result.duration =iso801Time ?? null; 
            var suspend_data:any=window.localStorage.getItem(`suspend_data:${this.courseStateService.getCourseInfo()?.id}_${this.userStateService.getCurrentUser()?.learnerId?.toString()}`);
            var visitedSlidesObj=JSON.parse(suspend_data);
            var oVisitedSlides=visitedSlidesObj ? visitedSlidesObj.visitedSlides : [];
            slidName=oVisitedSlides.length>0 ? oVisitedSlides[oVisitedSlides.length-1] : "";
            var slideNo= parseInt(slidName.split("_")[1])+1;
            stmt.object.id=`${stmt.object.id}${slideNo}`;
            slideCount=parseInt(visitedSlidesObj.totalSlides);
        }
        var payload={
          
             LearnerId:parseInt(this.userStateService.getCurrentUser()?.learnerId || '0'),
             TenantId:parseInt(this.userStateService.getCurrentUser()?.tenantId?.toString() || '0'),
             CourseId:parseInt(this.courseStateService.getCourseInfo()?.id?.toString() ?? '0'),
             CourseType:this.courseStateService.getCourseInfo()?.courseType?.toString(),
             CourseName:slidName ? slidName : this.courseStateService.getCourseInfo()?.name?.toString(),
             Statement:stmt,
             SlideCount:slideCount
         }
        this.lrsService.sendStatement(payload).subscribe({
          next:(data)=>{

          }
        });
        
    }
    private getInteractionIri(interactionId:any="") {
        //return config.activityId + "/interactions/" + encodeURIComponent(interactionId);
        var subTopicActivityId = sessionStorage.getItem("subTopicActivityId_" + this.courseStateService.getCourseInfo()?.id);

        return this.config.activityId + subTopicActivityId;
    };
  private configureAttemptContextActivityID(cmiEntryValue:any) {
        // window.localStorage[config.activityId] uses activity id to return the most recent
        // attempt
        if (cmiEntryValue == "resume") {
            if (window.localStorage[this.config.activityId] == null) {
                window.localStorage[this.config.activityId] = this.config.activityId + "?attemptId=" + this.generateUUID();
            } // send a resume statement


            this.resumeAttempt();
        } else {
            window.localStorage[this.config.activityId] = this.config.activityId + "?attemptId=" + this.generateUUID(); // update the activity state with the new attempt IRI

            //setActivityState();
        }
    };
  
  private resumeAttempt() {
        this.sendSimpleStatement(this.xpiService.getVerb().resumed);
    };
  private setInteraction(name:string, value:any) {
        // key for interactions in local storage is scoped to an attempt
        var interactionsKey = window.localStorage[this.config.activityId] + "_interactions"; // get the interactions from local storage

        var cachedInteractionsStr:any = window.localStorage.getItem(interactionsKey);
        var cachedInteractions:any = [];

        if (cachedInteractions != null) {
            cachedInteractions = JSON.parse(cachedInteractionsStr);
        } // figure out what the set value was in the SCORM call


        var elementArray = name.split(".");
        var intIndex = elementArray[2];
        var subElement = elementArray[3];

        if (subElement == "id") {
            // its a new interaction.  Set it in local storage
            var newInteraction = {
                index: intIndex,
                id: value,
                type: "",
                learner_response: "",
                result: {
                    success: null,
                    response: null
                },
                description: "",
                correctResponses: [],
                duration: ""
            };

            if (cachedInteractions != null) {
                // this is not the first interaction set
                cachedInteractions.push(newInteraction); // push to local storage

                window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
            } else {
                // this is the first interaction set
                window.localStorage.setItem(interactionsKey, JSON.stringify([newInteraction]));
            }
        } else if (subElement == "type") {
            // find interaction with the same index and set type in JSON array
            for (var i = 0; i < cachedInteractions.length; i++) {
                if (cachedInteractions[i].index == intIndex) {
                    // found matching index so update this object's type
                    cachedInteractions[i].type = value; // update local storage

                    window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
                    break;
                }
            }
        } else if (subElement == "learner_response" || subElement == "student_response") {
            // find interaction with the same index and set type in JSON array
            for (var i = 0; i < cachedInteractions.length; i++) {
                if (cachedInteractions[i].index == intIndex) {
                    // found matching index so update this object's type
                    cachedInteractions[i].learner_response = value;
                    cachedInteractions[i].result.response = value;
                    window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
                }
            }
        } else if (subElement == "result") {
            for (var i = 0; i < cachedInteractions.length; i++) {
                if (cachedInteractions[i].index == intIndex) {
                    // found matching index so update this object's type
                    var isCorrect = value == "correct" ? true : false;
                    cachedInteractions[i].result.success = isCorrect; // update local storage

                    window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
                    break;
                }
            }
        } else if (subElement.indexOf("correct_responses") != -1) {
            // get any type specific JSON that an LRS *may* require
            for (var i = 0; i < cachedInteractions.length; i++) {
                if (cachedInteractions[i].index == intIndex) {
                    cachedInteractions[i].correctResponses = value;
                    window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
                    break;
                }
            }
        } else if (subElement == "description") {
            // find interaction with the same index and set type in JSON array
            for (var i = 0; i < cachedInteractions.length; i++) {
                if (cachedInteractions[i].index == intIndex) {
                    // found matching index so update this object's type
                    cachedInteractions[i].description = value; // update local storage

                    window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
                    break;
                }
            }
        } else if (subElement == "weighting") {//alert("weighting")
            //alert(JSON.stringify(value))
            //todo
        } else if (subElement == "latency") {
            for (var i = 0; i < cachedInteractions.length; i++) {
                if (cachedInteractions[i].index == intIndex) {
                    cachedInteractions[i].duration = value;
                    window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
                    break;
                }
            }
        } else if (subElement == "timestamp" || subElement == "time") {
            for (var i = 0; i < cachedInteractions.length; i++) {
                if (cachedInteractions[i].index == intIndex) {
                    // Send xAPI Statement
                    // Note: this implementation
                    var stmt = this.getInteractionsBaseStatement();
                    stmt.timestamp = value ?? null;
                    stmt.object.id = this.getInteractionIri(cachedInteractions[i].id);
                    stmt.context.contextActivities.grouping[0].id = window.localStorage[this.config.activityId]; // set the context activity from the manifest/launch_data to group together for an event
                    //if (config.groupingContextActivity) {
                    //    stmt.context.contextActivities.grouping.push(config.groupingContextActivity);
                    //}
                    // set the learner's response

                    stmt.result = cachedInteractions[i].result;
                    stmt.result.duration = cachedInteractions[i].duration; // todo: shouldn't assume en-US - implement with default if not specified, or use what was sent

                    if (this.config.isScorm2004) {                        
                        stmt.object.definition.description = {
                            "en-US": cachedInteractions[i].description
                        };
                    } // set the specific interaction type


                    stmt.object.definition.interactionType = cachedInteractions[i].type || "choice";

                    switch (cachedInteractions[i].type) {
                        case "choice":
                            stmt.object.definition.choices = [];
                            stmt.object.definition.choices = cachedInteractions[i].correctResponses;
                            stmt.object.definition.correctResponsesPattern = cachedInteractions[i].correctResponses;
                            break;

                        case "likert":
                            stmt.object.definition.scale = [];
                            stmt.object.definition.scale = cachedInteractions[i].correctResponses;
                            stmt.object.definition.correctResponsesPattern = cachedInteractions[i].correctResponses;
                            break;

                        case "matching":
                            stmt.object.definition.source = [];
                            stmt.object.definition.target = [];
                            stmt.object.definition.source = cachedInteractions[i].correctResponses;
                            stmt.object.definition.target = cachedInteractions[i].correctResponses;
                            stmt.object.definition.correctResponsesPattern = cachedInteractions[i].correctResponses;
                            stmt.object.definition.correctResponsesPattern = cachedInteractions[i].correctResponses;
                            break;

                        case "performance":
                            stmt.object.definition.steps = [];
                            stmt.object.definition.steps = cachedInteractions[i].correctResponses;
                            stmt.object.definition.correctResponsesPattern = cachedInteractions[i].correctResponses;
                            break;

                        case "sequencing":
                            stmt.object.definition.choices = [];
                            stmt.object.definition.choices = cachedInteractions[i].correctResponses;
                            stmt.object.definition.correctResponsesPattern = cachedInteractions[i].correctResponses;
                            break;

                        default:
                            break;
                    } // todo: make the subelement that you send stmt on configurable
                    // send statement                    


                    var response = this.sendStatement(stmt); // remove interaction from local storage array so its not processed again

                    cachedInteractions.splice(i, 1);
                    window.localStorage.setItem(interactionsKey, JSON.stringify(cachedInteractions));
                    break;
                }
            }
        }
    };
    private setRawScore(value:any) {
        // For scorm 1.2, must divide raw by 100
        var score = this.config.isScorm2004 ? parseFloat(value) : parseFloat(value) / 100;
        localStorage.setItem("score:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id, JSON.stringify(value));
        return;
        var stmt = this.getBaseStatement();
        stmt.verb = this.xpiService.getVerb().scored;
        stmt.context.contextActivities.grouping[0].id = window.localStorage[this.config.activityId]; // set the context activity from the manifest/launch_data to group together
        // for an event
        //if (config.groupingContextActivity) {
        //    stmt.context.contextActivities.grouping.push(config.groupingContextActivity);
        //}
        // todo: add error handling if value is not a valid scaled score
        //stmt.result = {
        //    score: {
        //        scaled: score
        //    }
        //};

        stmt.result.score.scaled = score;
        var response = this.sendStatement(stmt);
    };
    private setSuccess(value:any) {
        // if SCORM 1.2, these could be complete/incomplete        
        if (value == "passed" || value == "failed") {
            this.setPassFailedInLocaleStorage(value);
        } else if (value == "complete" || value == "incomplete") {
            this.sendSimpleStatement(this.xpiService.getVerbByKey(value));
        } //if (value == "passed" || value == "failed" || value == "complete" || value == "incomplete") 
        //    sendSimpleStatement(ADL.verbs[value]);

    };
    private setPassFailedInLocaleStorage(value:any) {
        localStorage.setItem("success:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id, JSON.stringify(value));
    };
    private setComplete(value:any) {
        var suspend_data:any=window.localStorage.getItem(`suspend_data:${this.courseStateService.getCourseInfo()?.id}_${this.userStateService.getCurrentUser()?.learnerId?.toString()}`);
        var visitedSlidesObj=JSON.parse(suspend_data);                
        if(value=="incomplete" && visitedSlidesObj!=null && visitedSlidesObj.totalSlides>0){
           this.sendSimpleStatement(this.xpiService.getVerb().experienced);
        }
        if (value == "completed") {
            this.sendSimpleStatement(this.xpiService.getVerb().completed);
        }
    };
    private setScore(value:any) {
        // For scorm 1.2, must divide raw by 100
        var score = this.config.isScorm2004 ? parseFloat(value) : parseFloat(value) / 100; //localStorage.setItem("score:" + UserInfoData.UserId + ":" + UserInfoData.CourseId, JSON.stringify(value));

        return;
        var stmt = this.getBaseStatement();
        stmt.verb = this.xpiService.getVerb().scored;
        stmt.context.contextActivities.grouping[0].id = window.localStorage[this.config.activityId]; // set the context activity from the manifest/launch_data to group together
        // for an event
        //if (config.groupingContextActivity) {
        //    stmt.context.contextActivities.grouping.push(config.groupingContextActivity);
        //}
        // todo: add error handling if value is not a valid scaled score
        //stmt.result = {
        //    score: {
        //        scaled: score
        //    }
        //};

        stmt.result.score.scaled = score;
        var response = this.sendStatement(stmt);
    };
    terminateAttempt() {
        //sendSimpleStatement(ADL.verbs.terminated);
        var stmt = this.getBaseStatement(); // get the exit and use appropriate verb

        var stopVerb = this.exitSetToSuspend ? this.xpiService.getVerb().suspended : this.xpiService.getVerb().terminated;
        stmt.verb = stopVerb; // window.localStorage[activity] uses activity id to return the most recent
        // attempt

        stmt.context.contextActivities.grouping[0].id = window.localStorage[this.config.activityId]; // set the context activity from the manifest/launch_data to group together
        // for an event
        //if (config.groupingContextActivity) {
        //    stmt.context.contextActivities.grouping.push(config.groupingContextActivity);
        //}

        var stmtWithResult = this.getStmtWithResult(stmt);
        var response = this.sendStatement(stmtWithResult);
        window.localStorage.removeItem("learnerId");
    };
     getStmtWithResult(baseStatement:any) {
        var success:any = this.retrieveDataValue(this.scormVersionConfig.successElement);
        var completion:any = this.retrieveDataValue(this.scormVersionConfig.completionElement);
        var scoreScaled:any = this.retrieveDataValue(this.scormVersionConfig.scoreScaledElement);
        var scoreRaw:any = this.retrieveDataValue(this.scormVersionConfig.scoreRawElement);
        var scoreMin:any = this.retrieveDataValue(this.scormVersionConfig.scoreMinElement);
        var scoreMax:any = this.retrieveDataValue(this.scormVersionConfig.scoreMaxElement);
        var resultSet = false;
        var resultJson:any = {};
        var scoreSet = false;
        var scoreJson:any = {}; // create all of the statement json 
        // set success if known

        if (success == "passed") {
            resultSet = true;
            resultJson.success = true;
        } else if (success == "failed") {
            resultSet = true;
            resultJson.success = false;
        } // set completion if known


        if (completion == "completed") {
            resultSet = true;
            resultJson.completion = true;
        } else if (completion == "incomplete") {
            resultSet = true;
            resultJson.completion = false;
        } // set scaled score if set by sco


        if (scoreScaled != undefined && scoreScaled != "") {
            scoreSet = true;
            resultSet = true;
            scoreJson.scaled = parseFloat(scoreScaled.toString() || '0');
        } // set raw score if set by sco


        if (scoreRaw != undefined && scoreRaw != "") {
            scoreSet = true;
            resultSet = true;
            scoreJson.raw = parseFloat(scoreRaw); // if SCORM 1.2, use raw score / 100 for scaled score

            if (!this.config.isScorm2004) {
                scoreJson.scaled = parseFloat(scoreRaw) / 100;
            }
        } // set min score if set by sco


        if (scoreMin != undefined && scoreMin != "") {
            scoreSet = true;
            resultSet = true;
            scoreJson.min = parseFloat(scoreMin);
        } // set max score if set by sco


        if (scoreMax != undefined && scoreMax != "") {
            scoreSet = true;
            resultSet = true;
            scoreJson.max = parseFloat(scoreMax);
        } // set the score object in with the rest of the result object


        if (scoreSet) {
            resultJson.score = scoreJson;
        } // add result to the base statement


        if (resultSet) {
            baseStatement.result = resultJson;
        }

        return baseStatement;
    }; // This function is used to set agent data based on SCORM learner prefs
  initializeAttempt() {
    localStorage.removeItem("score:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id);
    localStorage.removeItem("success:" + this.userStateService.getCurrentUser()?.learnerId + ":" + this.courseStateService.getCourseInfo()?.id); // configure SCORM version and data elements, get launch data from lms, etc

    this.configureXAPIData(); // deprecated - set the agent profile information based on LMS learner_prefernces
    //setAgentProfile();
    // todo: add error handling to SCORM call
    // Determine whether this is a new or resumed attempt (based on cmi.entry)

    var entry = this.retrieveDataValue(this.scormVersionConfig.entryElement);
    var isResumed = entry == "resume"; // if "resume", determine if the user issued a suspend sequencing nav 
    // request and a terminate was called instead of a suspend and if so, fix

    if (isResumed) {
      this.adjustFinishStatementForResume();
    } // set the attempt context activity based on the SCOs state


    this.configureAttemptContextActivityID(entry); // Set activity profile info and attempt state every initialize
    // todo: these cause acceptable errors.  ensure they are not written to console

    //this.setActivityProfile();
    //this.setAttemptState(); // Set the appropriate verb based on resumed or new attempt

    var startVerb = isResumed ? this.xpiService.getVerb().resumed : this.xpiService.getVerb().initialized; // Execute the statement

    this.sendSimpleStatement(startVerb);
  };
  saveDataValue(name:string, value:string) {
        var isInteraction = name.indexOf("cmi.interactions") > -1; //isInteraction = true;

        if (isInteraction) {
            this.setInteraction(name, value);
        } else {
            // Handle only non-array scorm data model elements  
            switch (name) {
                case this.scormVersionConfig.scoreScaledElement:
                    this.setScore(value);
                    break;

                case this.scormVersionConfig.scoreRawElement:
                    this.setRawScore(value);
                    break;

                case this.scormVersionConfig.completionElement:
                    this.setComplete(value);
                    break;

                case this.scormVersionConfig.successElement:
                    this.setSuccess(value);
                    break;

                case this.scormVersionConfig.suspendDataElement:
                    window.localStorage.setItem("ScormStartTimer:" + this.courseStateService.getCourseInfo()?.id,this.scormTimer.startTimer().toString());
                    window.localStorage.setItem(`suspend_data:${this.courseStateService.getCourseInfo()?.id}_${this.userStateService.getCurrentUser()?.learnerId?.toString()}`, JSON.stringify(value));
                    break;

                case this.scormVersionConfig.sessionTimeElement:
                    window.localStorage.setItem("session_time" + ":" + this.courseStateService.getCourseInfo()?.id, JSON.stringify(value));
                    break;

                case this.scormVersionConfig.exitElement:
                    this.exitSetToSuspend = value == "suspend";
                    break;

                default:
                    break;
            }
        }
    };
}
