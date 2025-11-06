export interface XApiVerb {
  id: string;
  display: { [lang: string]: string };
}

export interface XApiActivityType {
  id: string;
}

export interface XApiActor {
  name: string;
  mbox: string; // must be in 'mailto:...' format
}

export interface XApiDefinition {
  name: { [lang: string]: string };
  type: XApiActivityType;
}

export interface XApiObject {
  id: string;
  objectType: 'Activity';
  definition: XApiDefinition;
}

export interface XApiStatement {
  actor: XApiActor;
  verb: XApiVerb;
  object: XApiObject;
}

export interface IScore {
  scaled: number | null;
  raw: number | null;
  min: number | null;
  max: number | null;
}

export interface IActivityResult {
  completion: boolean | null;
  success: boolean;
  duration: string | null;
  response: string | null;
  score: IScore;
}