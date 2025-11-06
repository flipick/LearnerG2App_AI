import { Injectable } from '@angular/core';
import { XApiVerb } from '../models/xapi.model';

type VerbKey = keyof ReturnType<XAPI['getVerb']>;
@Injectable({
  providedIn: 'root'
})
export class XAPI {
  
  getVerb() {
    return {
      abandoned: {
        "id": "https://w3id.org/xapi/adl/verbs/abandoned",
        "display": {
          "en-US": "abandoned"
        }
      },
      answered: {
        "id": "https://adlnet.gov/expapi/verbs/answered",
        "display": {
          "en-US": "answered"
        }
      },
      asked: {
        "id": "https://adlnet.gov/expapi/verbs/asked",
        "display": {
          "en-US": "asked"
        }
      },
      attempted: {
        "id": "https://adlnet.gov/expapi/verbs/attempted",
        "display": {
          "en-US": "attempted"
        }
      },
      attended: {
        "id": "https://adlnet.gov/expapi/verbs/attended",
        "display": {
          "en-US": "attended"
        }
      },
      commented: {
        "id": "https://adlnet.gov/expapi/verbs/commented",
        "display": {
          "en-US": "commented"
        }
      },
      completed: {
        "id": "https://adlnet.gov/expapi/verbs/completed",
        "display": {
          "en-US": "completed"
        }
      },
      exited: {
        "id": "https://adlnet.gov/expapi/verbs/exited",
        "display": {
          "en-US": "exited"
        }
      },
      experienced: {
        "id": "https://adlnet.gov/expapi/verbs/experienced",
        "display": {
          "en-US": "experienced"
        }
      },
      failed: {
        "id": "https://adlnet.gov/expapi/verbs/failed",
        "display": {
          "en-US": "failed"
        }
      },
      imported: {
        "id": "https://adlnet.gov/expapi/verbs/imported",
        "display": {
          "en-US": "imported"
        }
      },
      initialized: {
        "id": "https://adlnet.gov/expapi/verbs/initialized",
        "display": {
          "en-US": "initialized"
        }
      },
      interacted: {
        "id": "https://adlnet.gov/expapi/verbs/interacted",
        "display": {
          "en-US": "interacted"
        }
      },
      launched: {
        "id": "https://adlnet.gov/expapi/verbs/launched",
        "display": {
          "en-US": "launched"
        }
      },
      mastered: {
        "id": "https://adlnet.gov/expapi/verbs/mastered",
        "display": {
          "en-US": "mastered"
        }
      },
      passed: {
        "id": "https://adlnet.gov/expapi/verbs/passed",
        "display": {
          "en-US": "passed"
        }
      },
      preferred: {
        "id": "https://adlnet.gov/expapi/verbs/preferred",
        "display": {
          "en-US": "preferred"
        }
      },
      progressed: {
        "id": "https://adlnet.gov/expapi/verbs/progressed",
        "display": {
          "en-US": "progressed"
        }
      },
      registered: {
        "id": "https://adlnet.gov/expapi/verbs/registered",
        "display": {
          "en-US": "registered"
        }
      },
      responded: {
        "id": "https://adlnet.gov/expapi/verbs/responded",
        "display": {
          "en-US": "responded"
        }
      },
      resumed: {
        "id": "https://adlnet.gov/expapi/verbs/resumed",
        "display": {
          "en-US": "resumed"
        }
      },
      satisfied: {
        "id": "https://w3id.org/xapi/adl/verbs/satisfied",
        "display": {
          "en-US": "satisfied"
        }
      },
      scored: {
        "id": "https://adlnet.gov/expapi/verbs/scored",
        "display": {
          "en-US": "scored"
        }
      },
      shared: {
        "id": "https://adlnet.gov/expapi/verbs/shared",
        "display": {
          "en-US": "shared"
        }
      },
      suspended: {
        "id": "https://adlnet.gov/expapi/verbs/suspended",
        "display": {
          "en-US": "suspended"
        }
      },
      terminated: {
        "id": "https://adlnet.gov/expapi/verbs/terminated",
        "display": {
          "en-US": "terminated"
        }
      },
      voided: {
        "id": "https://adlnet.gov/expapi/verbs/voided",
        "display": {
          "en-US": "voided"
        }
      },
      waived: {
        "id": "https://w3id.org/xapi/adl/verbs/waived",
        "display": {
          "en-US": "waived"
        }
      }
    };
  }
  getVerbByKey(key:VerbKey):XApiVerb{
      return this.getVerb()[key];
  }
  getActivityType() {
    return {
      assessment: "https://adlnet.gov/expapi/activities/assessment",
      attempt: "https://adlnet.gov/expapi/activities/attempt",
      course: "https://adlnet.gov/expapi/activities/course",
      file: "https://adlnet.gov/expapi/activities/file",
      cmiInteraction: "https://adlnet.gov/expapi/activities/cmi.interaction",
      interaction: "https://adlnet.gov/expapi/activities/interaction",
      lesson: "https://adlnet.gov/expapi/activities/lesson",
      link: "https://adlnet.gov/expapi/activities/link",
      media: "https://adlnet.gov/expapi/activities/media",
      meeting: "https://adlnet.gov/expapi/activities/meeting",
      module: "https://adlnet.gov/expapi/activities/module",
      objective: "https://adlnet.gov/expapi/activities/objective",
      performance: "https://adlnet.gov/expapi/activities/performance",
      profile: "https://adlnet.gov/expapi/activities/profile",
      question: "https://adlnet.gov/expapi/activities/question",
      simulation: "https://adlnet.gov/expapi/activities/simulation"
    };
  }
}
