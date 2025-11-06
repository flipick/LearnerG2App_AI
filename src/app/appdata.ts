export const appData = {
    "branding": {
      "primary": "#444ce7",
      "primary_light": "#849bff",
      "text": "#000000",
      "border": "#aaabab",
      "dark_gray": "#545454",
      "muted": "#7b8fa2"
    },
    "courses": [
      {
        "id": 1,
        "title": "Advanced JavaScript Mastery",
        "thumbnail": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=60",
        "objectives": ["Understand modern ES features", "Apply advanced patterns", "Optimise performance"],
        "status": "in-progress",
        "progress": 35
      },
      {
        "id": 2,
        "title": "Data Science Fundamentals",
        "thumbnail": "https://images.unsplash.com/photo-1559027615-c913d3ae5e0d?auto=format&fit=crop&w=600&q=60",
        "objectives": ["Python for data", "Statistics basics", "Intro ML"],
        "status": "not-started",
        "progress": 0
      },
      {
        "id": 3,
        "title": "Leadership & Communication",
        "thumbnail": "https://images.unsplash.com/photo-1516627149106-1ff5e000cbd1?auto=format&fit=crop&w=600&q=60",
        "objectives": ["Leadership styles", "Emotional intelligence", "Effective feedback"],
        "status": "completed",
        "progress": 100
      }
    ],
    "assessments": [
      {
        "id": 1,
        "title": "JS Mastery Quiz",
        "courseId": 1,
        "type": "MCQ",
        "status": "not-started",
        "bestScore": 0,
        "questions": [
          {"q": "Which keyword declares a constant in JavaScript?", "options": ["var","let","const","constant"], "answer": 2},
          {"q": "What method converts JSON string to object?", "options": ["JSON.parse","JSON.stringify","JSON.convert","JSON.toObject"], "answer": 0}
        ]
      }
    ],
    "badges": [
      {"id":1, "title":"JavaScript Pro","icon":"🟦","criteria":"Complete JS course and quiz","earned":false,"date":null}
    ],
    "knowledgeBase": [
      {"title":"JavaScript const","content":"The const keyword creates a read-only reference to a value."},
      {"title":"ES6 Modules","content":"Modules allow you to break up code into separate files."},
      {"title":"Python Lists","content":"Lists are mutable sequences used to store collections of items."}
    ]
  };