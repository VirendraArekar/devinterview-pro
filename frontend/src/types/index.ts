export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MENTOR';
  experienceLevel: string;
  targetCompensation: string;
  bio?: string;
  avatar?: string;
  dailyStreak: number;
  lastActiveDate?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Question {
  id: number;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Senior / Architect';
  experienceLevel: string;
  targetCompensation: string;
  shortAnswer: string;
  detailedExplanation: string;
  realWorldExample: string;
  implementationExample: string;
  codeSnippet?: string;
  codeLanguage?: string;
  commonMistakes?: string[];
  followUpQuestions?: string[];
  interviewTips?: string[];
  tags?: string[];
  viewsCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface CodingProblem {
  id: number;
  title: string;
  slug: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problemStatement: string;
  inputDescription: string;
  outputDescription: string;
  constraints?: string[];
  sampleTestCases: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  hiddenTestCases?: {
    input: string;
    expectedOutput: string;
  }[];
  starterCode: {
    java?: string;
    javascript?: string;
    typescript?: string;
    python?: string;
    cpp?: string;
    c?: string;
  };
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  hints?: string[];
  solutionExplanation?: string;
  optimizedSolutions?: Record<string, string>;
  relatedQuestions?: string[];
  acceptanceRate: number;
  totalSubmissions: number;
  totalAccepted: number;
}

export interface ExecutionTestCaseResult {
  testIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtimeMs: number;
  error?: string;
}

export interface ExecutionResult {
  status:
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Compilation Error'
    | 'Runtime Error';
  passed: boolean;
  testCasesPassed: number;
  totalTestCases: number;
  runtimeMs: number;
  memoryKb: number;
  testResults: ExecutionTestCaseResult[];
  compilationOutput?: string;
  runtimeOutput?: string;
  submissionId?: number;
}

export interface SystemDesignTopic {
  id: number;
  title: string;
  slug: string;
  type: string;
  summary: string;
  difficulty: string;
  experienceLevel: string;
  functionalRequirements?: string[];
  nonFunctionalRequirements?: string[];
  capacityEstimation?: {
    dau?: string;
    qps?: string;
    peakQps?: string;
    storagePerDay?: string;
    storage5Years?: string;
    networkBandwidth?: string;
    notes?: string;
  };
  architectureDiagram?: {
    type: string;
    content: string;
    layers: {
      name: string;
      components: string[];
      description: string;
    }[];
  };
  databaseSchema?: {
    type: string;
    tables: {
      tableName: string;
      primaryKey: string;
      columns: { name: string; type: string; desc: string }[];
      partitionKey?: string;
    }[];
    notes?: string;
  };
  apiDesign?: {
    endpoint: string;
    method: string;
    description: string;
    requestBody?: string;
    responseBody?: string;
  }[];
  componentBreakdown?: {
    name: string;
    role: string;
    techStack: string;
    scalabilityNotes: string;
  }[];
  scalingStrategy?: string[];
  bottlenecks?: string[];
  failureScenarios?: {
    scenario: string;
    impact: string;
    mitigation: string;
  }[];
  securityConsiderations?: string[];
  tradeOffs?: {
    choiceA: string;
    choiceB: string;
    selected: string;
    justification: string;
  }[];
  interviewExplanation?: string;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  type:
    | 'multiple_choice'
    | 'multiple_select'
    | 'true_false'
    | 'output_prediction'
    | 'find_the_bug'
    | 'sql_query';
  codeSnippet?: string;
  codeLanguage?: string;
  options: { id: string; text: string }[];
  correctAnswers?: string[];
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: number;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  negativeMarkingRatio: number;
}

export interface MockInterview {
  id: number;
  userId: number;
  title: string;
  roleCategory: string;
  experienceLevel: string;
  difficulty: string;
  durationMinutes: number;
  totalQuestions: number;
  status: 'In Progress' | 'Completed' | 'Abandoned';
  score?: number;
  feedbackSummary?: string;
  weakTopics?: string[];
  strongTopics?: string[];
  questionIds: number[];
  startedAt: string;
  completedAt?: string;
}

export interface MockInterviewAnswer {
  id: number;
  mockInterviewId: number;
  questionId: number;
  questionTitle: string;
  userAnswer: string;
  score: number;
  aiFeedback: string;
  strengths: string[];
  improvements: string[];
}
