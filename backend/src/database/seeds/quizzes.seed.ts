import { QuizQuestionType } from '../entities/quiz-question.entity';

export const initialQuizzesSeed = [
  // 1. Java & JVM Senior Assessment
  {
    quiz: {
      title: 'Java 17/21 & JVM Concurrency Master Quiz',
      slug: 'java-jvm-concurrency-master-quiz',
      category: 'Java',
      difficulty: 'Advanced',
      durationMinutes: 15,
      totalQuestions: 5,
      passingScore: 70,
      negativeMarkingRatio: 0.25,
      isPublished: true,
    },
    questions: [
      {
        questionText:
          'What is the output of the following Java code snippet demonstrating String pool intern behavior?',
        type: QuizQuestionType.OUTPUT_PREDICTION,
        codeSnippet: `String s1 = new String("dev");
String s2 = s1.intern();
String s3 = "dev";

System.out.println((s1 == s2) + " " + (s2 == s3));`,
        codeLanguage: 'java',
        options: [
          { id: 'A', text: 'false true' },
          { id: 'B', text: 'true true' },
          { id: 'C', text: 'false false' },
          { id: 'D', text: 'true false' },
        ],
        correctAnswers: ['A'],
        explanation:
          'new String("dev") creates a new object in Heap memory, so s1 refers to the heap instance. s1.intern() returns the canonical string representation from the String Constant Pool. s3 refers directly to the pool constant. Thus s1 == s2 is false (different references), while s2 == s3 is true (both point to the pool reference).',
        points: 1,
      },
      {
        questionText:
          'Which of the following statements regarding Virtual Threads (Project Loom) in Java 21 are TRUE? (Select all that apply)',
        type: QuizQuestionType.MULTIPLE_SELECT,
        codeSnippet: `Thread.startVirtualThread(() -> {
    // Virtual thread workload
});`,
        codeLanguage: 'java',
        options: [
          { id: 'A', text: 'Virtual threads are lightweight threads managed by the JVM rather than the OS kernel.' },
          { id: 'B', text: 'Virtual threads eliminate the need for ThreadPoolExecutor when handling high-concurrency blocking I/O.' },
          { id: 'C', text: 'Virtual threads should be pooled using Executors.newFixedThreadPool(100) for performance.' },
          { id: 'D', text: 'When a virtual thread blocks on blocking I/O (e.g. Socket read), the JVM unmounts it from the carrier OS thread.' },
        ],
        correctAnswers: ['A', 'B', 'D'],
        explanation:
          'A, B, and D are correct. C is false because Virtual Threads are so lightweight (sub-kilobyte memory footprint) that they are meant to be spawned per-task and NEVER pooled.',
        points: 2,
      },
      {
        questionText:
          'Identify the bug causing an infinite loop / deadlocks in this double-checked locking singleton implementation:',
        type: QuizQuestionType.FIND_THE_BUG,
        codeSnippet: `public class ConnectionPool {
    private static ConnectionPool instance; // BUG HERE

    public static ConnectionPool getInstance() {
        if (instance == null) {
            synchronized (ConnectionPool.class) {
                if (instance == null) {
                    instance = new ConnectionPool();
                }
            }
        }
        return instance;
    }
}`,
        codeLanguage: 'java',
        options: [
          { id: 'A', text: 'The instance variable lacks the "volatile" keyword, allowing instruction reordering to expose a partially constructed object to other threads.' },
          { id: 'B', text: 'The synchronized block should lock on "this" instead of ConnectionPool.class.' },
          { id: 'C', text: 'The second if (instance == null) check is redundant and causes Deadlock.' },
          { id: 'D', text: 'getInstance() must be synchronized.' },
        ],
        correctAnswers: ['A'],
        explanation:
          'Without the "volatile" keyword, the JVM compiler and CPU can reorder instructions (allocating memory, assigning reference to instance, then calling constructor). Another thread could observe instance != null before constructor completes, accessing corrupted state.',
        points: 1,
      },
      {
        questionText:
          'In Java, ConcurrentHashMap allows a null key and multiple null values.',
        type: QuizQuestionType.TRUE_FALSE,
        codeSnippet: null,
        codeLanguage: null,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' },
        ],
        correctAnswers: ['B'],
        explanation:
          'False! ConcurrentHashMap throws NullPointerException if either the key or the value is null. This avoids ambiguity in concurrent multi-threaded scenarios where map.get(key) returning null could mean either the key is not present or the key maps to null.',
        points: 1,
      },
      {
        questionText:
          'What is the time complexity of searching an element in a Java 8 HashMap where all keys hash to the same bucket and the bucket contains 100 elements?',
        type: QuizQuestionType.MULTIPLE_CHOICE,
        codeSnippet: null,
        codeLanguage: null,
        options: [
          { id: 'A', text: 'O(log N)' },
          { id: 'B', text: 'O(N)' },
          { id: 'C', text: 'O(1)' },
          { id: 'D', text: 'O(N log N)' },
        ],
        correctAnswers: ['A'],
        explanation:
          'Because the bucket count (100) exceeds TREEIFY_THRESHOLD (8) and the table capacity is >= 64, Java 8 converts the collided bucket into a balanced Red-Black Tree, yielding O(log N) search complexity instead of O(N) linear list.',
        points: 1,
      },
    ],
  },

  // 2. React.js & Modern Frontend Architecture Quiz
  {
    quiz: {
      title: 'React 18 & Frontend Architecture Mastery',
      slug: 'react-18-frontend-mastery-quiz',
      category: 'React.js',
      difficulty: 'Intermediate',
      durationMinutes: 12,
      totalQuestions: 4,
      passingScore: 75,
      negativeMarkingRatio: 0.25,
      isPublished: true,
    },
    questions: [
      {
        questionText: 'What will be logged to the console when the button is clicked twice in React 18?',
        type: QuizQuestionType.OUTPUT_PREDICTION,
        codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    console.log(count);
  };

  return <button onClick={handleClick}>Click</button>;
}`,
        codeLanguage: 'javascript',
        options: [
          { id: 'A', text: '0 on first click, 1 on second click' },
          { id: 'B', text: '2 on first click, 4 on second click' },
          { id: 'C', text: '1 on first click, 2 on second click' },
          { id: 'D', text: '0 on first click, 0 on second click' },
        ],
        correctAnswers: ['A'],
        explanation:
          'State updates within the same render cycle use the captured closure value of count. Both setCount(count + 1) resolve to setCount(0 + 1). The console.log(count) still prints the state from the current render (0). On the second click, count is 1, so it logs 1.',
        points: 1,
      },
      {
        questionText:
          'Which hook should you use to synchronously measure DOM layout and update coordinates before browser paint to prevent visual flicker?',
        type: QuizQuestionType.MULTIPLE_CHOICE,
        codeSnippet: null,
        codeLanguage: null,
        options: [
          { id: 'A', text: 'useLayoutEffect' },
          { id: 'B', text: 'useEffect' },
          { id: 'C', text: 'useInsertionEffect' },
          { id: 'D', text: 'useImperativeHandle' },
        ],
        correctAnswers: ['A'],
        explanation:
          'useLayoutEffect runs synchronously after DOM mutations but before the browser paints pixels on screen, ensuring measurements and coordinate updates execute without layout shifts.',
        points: 1,
      },
      {
        questionText:
          'React 18 Automatic Batching applies to state updates triggered inside which of the following? (Select all that apply)',
        type: QuizQuestionType.MULTIPLE_SELECT,
        codeSnippet: null,
        codeLanguage: null,
        options: [
          { id: 'A', text: 'React synthetic event handlers (e.g. onClick)' },
          { id: 'B', text: 'Promises (e.g. fetch().then())' },
          { id: 'C', text: 'setTimeout / setInterval timers' },
          { id: 'D', text: 'Native DOM event listeners (e.g. window.addEventListener)' },
        ],
        correctAnswers: ['A', 'B', 'C', 'D'],
        explanation:
          'React 18 introduces automatic batching across ALL execution contexts: React event handlers, asynchronous promises, timers, and native event handlers.',
        points: 2,
      },
      {
        questionText:
          'In SQL, what is the output of the query below when finding salaries greater than the department average?',
        type: QuizQuestionType.SQL_QUERY,
        codeSnippet: `SELECT emp_id, salary, 
  AVG(salary) OVER(PARTITION BY dept_id) as dept_avg
FROM employees;`,
        codeLanguage: 'sql',
        options: [
          { id: 'A', text: 'Returns every employee row alongside the average salary of their respective department.' },
          { id: 'B', text: 'Collapses the result into one row per department with average salary.' },
          { id: 'C', text: 'Throws a syntax error because GROUP BY is missing.' },
          { id: 'D', text: 'Returns the overall company average salary on each row.' },
        ],
        correctAnswers: ['A'],
        explanation:
          'Window functions with OVER(PARTITION BY dept_id) calculate aggregate values across partition windows without collapsing individual employee records.',
        points: 1,
      },
    ],
  },
];
