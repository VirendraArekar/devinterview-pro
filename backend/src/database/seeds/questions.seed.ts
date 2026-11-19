import { DifficultyLevel } from '../entities/question.entity';

export const initialQuestionsSeed = [
  // ==================== JAVA ====================
  {
    title: 'How does HashMap work internally in Java 8+ and how was the treeification implemented?',
    slug: 'java-hashmap-internal-implementation-treeification',
    category: 'Java',
    subcategory: 'Collections Framework',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'In Java 8+, HashMap is an array of Node buckets (transient Node<K,V>[] table) indexed by hash(key) & (n - 1). When collisions occur, entries are stored in a linked list. If the bucket collision count exceeds TREEIFY_THRESHOLD (8) and table capacity is >= 64 (MIN_TREEIFY_CAPACITY), the linked list transforms into a Red-Black Tree (TreeNode), reducing worst-case search complexity from O(n) to O(log n). It untreeifies back to a linked list if the node count drops to 6.',
    detailedExplanation:
      'Prior to Java 8, hash collisions could cause malicious or poorly hashed keys to degrade HashMap operations to O(n) linked lists, leading to Denial of Service (DoS) vulnerability. Java 8 introduced balanced Red-Black trees in place of linear lists.\n\nKey constants in HashMap:\n- DEFAULT_INITIAL_CAPACITY = 16 (always a power of 2)\n- MAXIMUM_CAPACITY = 1 << 30\n- DEFAULT_LOAD_FACTOR = 0.75f\n- TREEIFY_THRESHOLD = 8\n- UNTREEIFY_THRESHOLD = 6\n- MIN_TREEIFY_CAPACITY = 64\n\nThe hashing algorithm applies key.hashCode() ^ (h >>> 16) to spread high bits to low bits before modulo bitmasking (n-1 & hash). During resizing (when size > threshold), capacities double, and elements either stay at current index or move by oldCapacity offset without re-calculating costly hash values.',
    realWorldExample:
      'In high-throughput e-commerce microservices, user session caches or cart aggregates using custom Object keys without uniform hashCode distributions would suffer massive latency spikes if hash collisions created 50+ element linked lists. Red-Black trees guarantee predictable microsecond latencies even under adversarial hash collisions.',
    implementationExample:
      '// Proper custom Key implementation ensuring contract compliance\npublic final class AccountKey {\n    private final String accountId;\n    private final String tenantId;\n\n    public AccountKey(String accountId, String tenantId) {\n        this.accountId = Objects.requireNonNull(accountId);\n        this.tenantId = Objects.requireNonNull(tenantId);\n    }\n\n    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true;\n        if (!(o instanceof AccountKey)) return false;\n        AccountKey that = (AccountKey) o;\n        return accountId.equals(that.accountId) && tenantId.equals(that.tenantId);\n    }\n\n    @Override\n    public int hashCode() {\n        return Objects.hash(accountId, tenantId);\n    }\n}',
    codeSnippet:
      '// Java 8 HashMap putVal treeification check snippet\nif (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st\n    treeifyBin(tab, hash);\n\n// treeifyBin verifies minimum capacity before converting\nif (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)\n    resize();\nelse if ((e = tab[index = (n - 1) & hash]) != null) {\n    TreeNode<K,V> hd = null, tl = null;\n    do {\n        TreeNode<K,V> p = replacementTreeNode(e, null);\n        // construct TreeNode tree structure...\n    } while ((e = e.next) != null);\n}',
    codeLanguage: 'java',
    commonMistakes: [
      'Believing treeification occurs immediately when 8 collisions occur even if capacity is 16 (it simply resizes table if table.length < 64).',
      'Thinking HashMap allows multiple null keys (it allows exactly one null key, stored at index 0).',
      'Assuming ConcurrentHashMap and HashMap share identical treeification mechanisms (ConcurrentHashMap uses synchronized bucket heads and ForwardingNodes during transfer).',
      'Modifying mutable key fields after inserting into HashMap, corrupting bucket lookup.',
    ],
    followUpQuestions: [
      'What happens during resizing in HashMap? How does Java 8 avoid re-evaluating the hash code?',
      'Why does HashMap enforce power-of-two capacities (n & (n-1) == 0)?',
      'Compare HashMap vs ConcurrentHashMap vs Collections.synchronizedMap.',
    ],
    interviewTips: [
      'Write down the bitmask formula index = (n - 1) & hash and explain why bitwise AND is orders of magnitude faster than modulo %.',
      'Explicitly cite TREEIFY_THRESHOLD (8) and UNTREEIFY_THRESHOLD (6) and explain the hysteresis gap (avoids thrashing between Tree and List).',
    ],
    tags: ['Java', 'Collections', 'HashMap', 'Internal Architecture', 'Data Structures'],
  },
  {
    title: 'How does ConcurrentHashMap achieve lock striping and thread safety in Java 8+?',
    slug: 'java-concurrenthashmap-locking-mechanisms',
    category: 'Java',
    subcategory: 'Concurrency & Multithreading',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'In Java 8+, ConcurrentHashMap discarded Java 7 Segment locks in favor of CAS (Compare-And-Swap) for empty bucket insertions and synchronized on the first node of the collision bin. Reads (get) are completely non-blocking and lock-free using volatile memory reads on node value and next pointers. Resizing is coordinated concurrently using ForwardingNodes (MOVED hash -1).',
    detailedExplanation:
      'Java 7 utilized 16 Segment arrays (ReentrantLocks) allowing at most 16 concurrent write threads. Java 8 achieves fine-grained per-bucket synchronization:\n1. On put(k, v): If the target bucket tab[(n - 1) & hash] is null, it uses Unsafe/VarHandle CAS (casTabAt) without locking.\n2. If bucket is non-null, it synchronizes on the bucket head node: synchronized(f).\n3. During rehashing/resizing, multiple threads help transfer nodes concurrently. Bucket heads are swapped with a special ForwardingNode pointing to the new table.\n4. Size estimation uses LongAdder-like CounterCell striping to prevent thread contention on a single volatile counter variable.',
    realWorldExample:
      'Used in real-time order matching engines and distributed state caches where thousands of concurrent trading requests update distinct instrument symbols simultaneously. Lock striping ensures zero contention across independent instrument keys.',
    implementationExample:
      '// High-throughput thread-safe counter using ConcurrentHashMap\nConcurrentMap<String, LongAdder> metricCounters = new ConcurrentHashMap<>();\npublic void recordEvent(String metricName) {\n    metricCounters.computeIfAbsent(metricName, k -> new LongAdder()).increment();\n}',
    codeSnippet:
      '// Concept snippet of Java 8 ConcurrentHashMap putVal:\nfor (Node<K,V>[] tab = table;;) {\n    Node<K,V> f; int n, i, fh;\n    if (tab == null || (n = tab.length) == 0)\n        tab = initTable();\n    else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {\n        if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))\n            break; // Lock-free insertion succeeded\n    }\n    else if ((fh = f.hash) == MOVED)\n        tab = helpTransfer(tab, f); // Concurrent resizing assistance\n    else {\n        synchronized (f) { // Lock only the bucket head\n            // insert into linked list or RedBlackTree...\n        }\n    }\n}',
    codeLanguage: 'java',
    commonMistakes: [
      'Assuming ConcurrentHashMap allows null keys or null values (both throw NullPointerException to prevent ambiguity in concurrent get vs containsKey).',
      'Thinking get() requires synchronization (reads are lock-free).',
      'Using putIfAbsent incorrectly when computing expensive fallback values (prefer computeIfAbsent which is atomic).',
    ],
    followUpQuestions: [
      'Why does ConcurrentHashMap reject null keys and null values while HashMap permits null key?',
      'How does size() method work in ConcurrentHashMap under high write concurrency?',
      'What are Virtual Threads (Project Loom) in Java 21 and how do they impact thread pooling?',
    ],
    interviewTips: [
      'Mention that CAS is used when bucket is null, and synchronized(headNode) is used when colliding. Interviewers love this distinction.',
    ],
    tags: ['Java', 'Multithreading', 'ConcurrentHashMap', 'CAS', 'Memory Model'],
  },
  {
    title: 'Explain JVM Garbage Collectors: G1 GC vs ZGC vs Shenandoah and GC Tuning Strategies',
    slug: 'jvm-garbage-collection-g1gc-zgc-tuning',
    category: 'Java',
    subcategory: 'JVM Architecture & Memory',
    difficulty: DifficultyLevel.SENIOR,
    experienceLevel: '8–12 Years',
    targetCompensation: '₹30–35 LPA',
    shortAnswer:
      'G1 GC divides the heap into equal-sized regions (1MB to 32MB) and collects regions with the highest garbage first within a target pause time (-XX:MaxGCPauseMillis=200). ZGC (Java 15+ production) and Shenandoah are concurrent, low-pause collectors maintaining sub-millisecond pauses across multi-terabyte heaps by performing marking, relocation, and reference updates concurrently with application threads using load barriers and colored pointers.',
    detailedExplanation:
      'JVM Heap layout consists of Young Generation (Eden + Survivor S0/S1) and Old Generation, with Metaspace in native memory. \n\nG1 GC:\n- Incremental generational region-based collector.\n- Humongous objects (>50% region size) allocated in contiguous regions.\n- Remembered Sets (R-Sets) track cross-region object references to allow independent region evacuation.\n\nZGC (Z Garbage Collector):\n- Non-contiguous single-generation (Generational ZGC added in Java 21).\n- Colored Pointers: Uses reference metadata bits (Marked0, Marked1, Remapped).\n- Load Barriers: When application thread accesses an object reference that is being relocated, the load barrier immediately fixes the pointer and updates the reference in place without stop-the-world pauses.',
    realWorldExample:
      'In a high-frequency payment processing switch handling 20,000 TPS, G1 GC pause spikes of 250ms would breach client SLA timeouts and trigger payment retries. Migrating to ZGC reduced p99 GC pause times from 180ms down to 0.8ms, completely eliminating GC-induced timeout cascades.',
    implementationExample:
      '# Recommended JVM Options for Production Spring Boot Microservice on Java 17/21:\njava -XX:+UseZGC \\\n     -XX:+ZGenerational \\\n     -Xms8g -Xmx8g \\\n     -XX:+AlwaysPreTouch \\\n     -XX:+HeapDumpOnOutOfMemoryError \\\n     -XX:HeapDumpPath=/var/log/oom-dump.hprof \\\n     -Xlog:gc*,gc+phases=debug:file=/var/log/gc.log:time,uptime,pid:filecount=5,filesize=50M \\\n     -jar payment-service.jar',
    codeSnippet:
      '// Triggering memory diagnostics programmatically via MXBean\nMemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();\nMemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();\nSystem.out.printf("Used Heap: %d MB / Max: %d MB%n", \n    heapUsage.getUsed() / (1024 * 1024), \n    heapUsage.getMax() / (1024 * 1024));',
    codeLanguage: 'java',
    commonMistakes: [
      'Assuming System.gc() immediately runs full GC (it is just a suggestion and can be disabled via -XX:+DisableExplicitGC).',
      'Setting -Xms lower than -Xmx in production (leads to OS heap resizing latency overhead; always set -Xms == -Xmx).',
      'Not enabling -XX:+AlwaysPreTouch in latency-sensitive containers.',
    ],
    followUpQuestions: [
      'What causes "OutOfMemoryError: Metaspace" and how does Metaspace differ from PermGen?',
      'How do you diagnose a memory leak in production using heap dumps and Eclipse MAT?',
      'What is Safepoint in JVM and how can Safepoint bias affect pause times?',
    ],
    interviewTips: [
      'Differentiate between G1 (throughput/bounded pause trade-off) and ZGC (ultra-low latency <1ms).',
      'Mention Generational ZGC introduced in Java 21 as state-of-the-art.',
    ],
    tags: ['Java', 'JVM', 'Garbage Collection', 'ZGC', 'Performance Tuning'],
  },

  // ==================== SPRING BOOT ====================
  {
    title: 'How does Spring Boot Auto-Configuration work internally? (@EnableAutoConfiguration & Conditional)',
    slug: 'spring-boot-auto-configuration-internals',
    category: 'Spring Boot',
    subcategory: 'Core Architecture',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      '@SpringBootApplication incorporates @EnableAutoConfiguration, which imports AutoConfigurationImportSelector. This reads configuration candidates declared in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports (or spring.factories in older versions). Each candidate is evaluated against conditional annotations like @ConditionalOnClass, @ConditionalOnMissingBean, and @ConditionalOnProperty before beans are instantiated.',
    detailedExplanation:
      'Spring Boot bootstrap sequence:\n1. SpringApplication.run() initializes Environment and ApplicationContext.\n2. AutoConfigurationImportSelector gathers candidate classes via SpringFactoriesLoader / import declarations.\n3. Candidate filtering: @Conditional annotations are evaluated:\n   - @ConditionalOnClass: verifies classes are present on classpath.\n   - @ConditionalOnMissingBean: only creates default bean if developer hasn\'t supplied their own.\n   - @ConditionalOnProperty: checks configuration flags in application.yml.\n4. Ordering: Auto-configurations declare order using @AutoConfigureBefore, @AutoConfigureAfter, or @AutoConfigureOrder.\n5. Developers can inspect which configurations evaluated to true/false by launching with --debug to generate the ConditionsEvaluationReport.',
    realWorldExample:
      'When adding spring-boot-starter-data-redis to pom.xml, Spring Boot automatically registers RedisConnectionFactory and RedisTemplate. If you declare your own custom @Bean RedisTemplate in a @Configuration class, @ConditionalOnMissingBean(RedisTemplate.class) skips default instantiation and uses your custom bean seamlessly.',
    implementationExample:
      '@Configuration\n@ConditionalOnClass(DataSource.class)\n@ConditionalOnProperty(prefix = "app.audit", name = "enabled", havingValue = "true", matchIfMissing = true)\npublic class AuditAutoConfiguration {\n\n    @Bean\n    @ConditionalOnMissingBean(AuditService.class)\n    public AuditService defaultAuditService(DataSource dataSource) {\n        return new DatabaseAuditServiceImpl(dataSource);\n    }\n}',
    codeSnippet:
      '// Spring Boot 3+ META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\norg.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration\norg.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration\norg.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration\norg.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration',
    codeLanguage: 'java',
    commonMistakes: [
      'Confusing @ComponentScan (scans developer code packages) with @EnableAutoConfiguration (loads framework configurations from external jars).',
      'Assuming your custom bean is ignored if auto-configuration runs before it (user configuration always has higher precedence).',
    ],
    followUpQuestions: [
      'How does Spring Boot 3 differ in loading auto-configuration compared to Spring Boot 2 (spring.factories vs AutoConfiguration.imports)?',
      'How would you write a custom starter library for your enterprise team?',
    ],
    interviewTips: [
      'Mention how to troubleshoot auto-configuration issues using the --debug command line flag or Actuator /beans and /conditions endpoints.',
    ],
    tags: ['Spring Boot', 'AutoConfiguration', 'Spring Core', 'Dependency Injection'],
  },
  {
    title: 'Explain Spring Transaction Management (@Transactional), Propagation Levels, and Rollback Pitfalls',
    slug: 'spring-transactional-propagation-rollback-pitfalls',
    category: 'Spring Boot',
    subcategory: 'Data & Persistence',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      '@Transactional works via Spring AOP dynamic proxies (JDK dynamic proxy or CGLIB). By default, transactions roll back only for unchecked exceptions (RuntimeException and Error), NOT checked exceptions (Exception). Self-invocation within the same bean bypasses the proxy and silently fails to execute inside a transactional context unless self-injected or AspectJ bytecode weaving is used.',
    detailedExplanation:
      'Key aspects of Spring Transactions:\n\n1. Propagation types:\n- REQUIRED (default): Joins existing transaction or creates a new one.\n- REQUIRES_NEW: Suspends existing transaction and runs inside an independent transaction.\n- NESTED: Creates a JDBC savepoint within existing transaction; inner rollback only rolls back to savepoint.\n- SUPPORTS, MANDATORY, NOT_SUPPORTED, NEVER.\n\n2. Rollback rules:\n- @Transactional(rollbackFor = Exception.class) is required to ensure checked exceptions trigger database rollbacks.\n\n3. Proxy Pitfall (Self-invocation):\nCalling a @Transactional method from another method within the same class (this.methodB()) executes directly on the target instance, not through the proxy interceptor (TransactionInterceptor), resulting in no transaction boundary.',
    realWorldExample:
      'In a banking fund transfer application: debitAccount() and creditAccount() must execute atomically. If debit succeeds but an external notification service throws an IOException (checked), without rollbackFor = Exception.class the debit commits permanently while transfer fails, creating critical accounting discrepancy.',
    implementationExample:
      '@Service\npublic class PaymentServiceImpl implements PaymentService {\n    \n    @Autowired\n    private AccountRepository accountRepo;\n    @Autowired\n    private AuditService auditService;\n\n    @Override\n    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)\n    public void processTransfer(Long fromId, Long toId, BigDecimal amount) throws PaymentException {\n        accountRepo.debit(fromId, amount);\n        accountRepo.credit(toId, amount);\n        \n        // REQUIRES_NEW ensures audit log persists even if subsequent steps fail\n        auditService.recordAuditLog(fromId, toId, amount);\n    }\n}',
    codeSnippet:
      '// Common proxy trap:\npublic void initiateTransfer() {\n    // THIS BYPASSES PROXY -> NO TRANSACTION IS STARTED!\n    this.executePayment(); \n}\n\n@Transactional\npublic void executePayment() {\n    // DB operations here run without transaction context\n}',
    codeLanguage: 'java',
    commonMistakes: [
      'Marking private or protected methods with @Transactional (Spring proxies only intercept public methods by default).',
      'Forgetting rollbackFor = Exception.class when throwing checked business exceptions.',
      'Catching exceptions inside try-catch and not re-throwing them, preventing TransactionInterceptor from knowing a rollback is required.',
    ],
    followUpQuestions: [
      'How does REQUIRES_NEW differ from NESTED in terms of DB connections and commit boundaries?',
      'What is transaction isolation level and how do you prevent phantom reads in MySQL InnoDB?',
    ],
    interviewTips: [
      'Draw the proxy interceptor chain in your answer: Caller -> CGLIB Proxy -> TransactionInterceptor -> Target Bean.',
    ],
    tags: ['Spring Boot', 'Spring Data JPA', 'Transactions', 'AOP', 'Architecture'],
  },

  // ==================== REACT.JS ====================
  {
    title: 'Explain React Reconciliation, Fiber Architecture, and how React 18 Concurrent Mode works',
    slug: 'react-reconciliation-fiber-concurrent-mode',
    category: 'React.js',
    subcategory: 'Core Architecture',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'React Fiber is a reimplementation of the reconciliation engine that represents the component tree as a linked list of Fiber nodes (child, sibling, return). Unlike the legacy stack reconciler which blocked the main thread until the entire tree rendered, Fiber breaks rendering into interruptible units of work. React 18 Concurrent Mode leverages Fiber to prioritize urgent updates (typing, clicking) over non-urgent updates (list filtering, transitions) using startTransition and useDeferredValue.',
    detailedExplanation:
      'Two phases of React rendering:\n1. Render / Reconciliation Phase (Asynchronous & interruptible):\n- Builds the workInProgress fiber tree by comparing against current fiber tree (Diffing algorithm).\n- Checks component keys, types, and props.\n- Work can be paused or aborted by React scheduler if a higher-priority browser task arrives.\n2. Commit Phase (Synchronous & non-interruptible):\n- Flushes DOM mutations, runs useLayoutEffect synchronously, then runs useEffect asynchronously after paint.\n\nReact 18 Concurrent Features:\n- Automatic Batching: Batches state updates inside promises, timeouts, and native event handlers.\n- Transitions: startTransition(() => setFilteredList(data)) tells React this update can yield to user input.\n- Suspense on the client & streaming SSR on the server.',
    realWorldExample:
      'In a high-frequency financial trading terminal with a live search input and 5,000 table rows: typing into the search input without Concurrent Mode would stutter because rendering 5,000 table nodes freezes the main thread. Wrapping the table update in startTransition keeps keyboard typing at 60 FPS while background rendering the table.',
    implementationExample:
      'import React, { useState, useTransition, useDeferredValue } from "react";\n\nexport function StockDashboard({ stockData }: { stockData: Stock[] }) {\n  const [query, setQuery] = useState("");\n  const [isPending, startTransition] = useTransition();\n  const deferredQuery = useDeferredValue(query);\n\n  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {\n    // Urgent update: input field responds immediately\n    setQuery(e.target.value);\n  };\n\n  return (\n    <div>\n      <input value={query} onChange={handleSearch} placeholder="Search ticker..." />\n      {isPending && <span className="spinner">Updating data...</span>}\n      <StockTable filter={deferredQuery} items={stockData} />\n    </div>\n  );\n}',
    codeSnippet:
      '// Fiber node linked-list structure representation\ntype Fiber = {\n  tag: WorkTag,\n  key: null | string,\n  type: any,\n  stateNode: any, // DOM node instance\n  child: Fiber | null,\n  sibling: Fiber | null,\n  return: Fiber | null, // parent\n  memoizedState: any, // Hook linked-list state\n  flags: Flags, // Effect flags (Placement, Update, Deletion)\n};',
    codeLanguage: 'typescript',
    commonMistakes: [
      'Using array index as key when items can be inserted, deleted, or reordered (causes component state corruption and unnecessary DOM re-creation).',
      'Believing useEffect runs before DOM paint (useLayoutEffect runs before paint; useEffect runs after paint).',
      'Overusing useMemo everywhere (memoization has memory and comparison overhead; only use when computation is demonstrably expensive).',
    ],
    followUpQuestions: [
      'What is the difference between useMemo, useCallback, and React.memo?',
      'Why can Hooks only be called at the top level of a component?',
      'How does React Server Components (RSC) eliminate bundle size overhead for static dependencies?',
    ],
    interviewTips: [
      'Differentiate between Render phase (can be paused/restarted) and Commit phase (synchronously updates DOM).',
    ],
    tags: ['React.js', 'Fiber', 'Concurrent Mode', 'Reconciliation', 'Performance'],
  },
  {
    title: 'Deep Dive: useEffect vs useLayoutEffect vs useInsertionEffect with Execution Lifecycle',
    slug: 'react-useeffect-vs-uselayouteffect-lifecycle',
    category: 'React.js',
    subcategory: 'Hooks & State',
    difficulty: DifficultyLevel.INTERMEDIATE,
    experienceLevel: '3–5 Years',
    targetCompensation: '₹20–25 LPA',
    shortAnswer:
      'useEffect fires asynchronously after the browser paints the screen, making it non-blocking for data fetching and subscriptions. useLayoutEffect fires synchronously after DOM mutation but before the browser paints, ideal for measuring DOM dimensions or synchronous mutations to prevent visual layout flicker. useInsertionEffect fires before all DOM mutations, designed strictly for CSS-in-JS libraries (like Emotion/styled-components) to inject styles.',
    detailedExplanation:
      'Execution order during a component render commit:\n1. React calculates DOM mutations during Render phase.\n2. DOM tree is updated in memory.\n3. useInsertionEffect cleanup & execution runs (injecting <style> tags).\n4. React mutates the actual DOM.\n5. useLayoutEffect cleanup & execution runs synchronously.\n6. Browser paints pixels on screen (Layout -> Paint -> Composite).\n7. useEffect cleanup & execution runs asynchronously in next task queue.',
    realWorldExample:
      'Building an auto-positioning tooltip or popover: If you calculate tooltip coordinates inside useEffect, the tooltip first renders in default position, user sees a 1-frame visual jump/flicker, and then moves. Doing the calculation inside useLayoutEffect ensures coordinates are adjusted before pixels appear on screen, eliminating flicker.',
    implementationExample:
      'import { useState, useLayoutEffect, useRef } from "react";\n\nexport function TooltipTarget({ text }: { text: string }) {\n  const [coords, setCoords] = useState({ x: 0, y: 0 });\n  const ref = useRef<HTMLDivElement>(null);\n\n  useLayoutEffect(() => {\n    if (ref.current) {\n      const rect = ref.current.getBoundingClientRect();\n      setCoords({ x: rect.left, y: rect.bottom + 8 });\n    }\n  }, []);\n\n  return <div ref={ref}>{text}</div>;\n}',
    codeSnippet:
      '// Hook order comparison:\nuseInsertionEffect(() => {\n  // 1. Injects styles before DOM changes\n}, []);\n\nuseLayoutEffect(() => {\n  // 2. Read layout, mutate DOM before paint (blocks paint)\n}, []);\n\nuseEffect(() => {\n  // 3. Data fetching, logging, timers (runs after paint)\n}, []);',
    codeLanguage: 'typescript',
    commonMistakes: [
      'Using useLayoutEffect for data fetching, causing main-thread paint blockage.',
      'Omitting dependencies in useEffect dependency array or disabling eslint-plugin-react-hooks rules.',
      'Not returning a cleanup function for WebSockets or interval timers, causing memory leaks.',
    ],
    followUpQuestions: [
      'What causes stale closures in useEffect and how do you resolve them?',
      'Why does React 18 in StrictMode run effects twice in development mode?',
    ],
    interviewTips: [
      'Clearly state: "99% of the time, use useEffect. Only reach for useLayoutEffect if you need to measure DOM or prevent visual flicker before paint."',
    ],
    tags: ['React.js', 'Hooks', 'Lifecycle', 'useLayoutEffect', 'Frontend'],
  },

  // ==================== NODE.JS & NESTJS ====================
  {
    title: 'Explain Node.js Event Loop Architecture: Phases, Microtasks vs Macrotasks, and libuv',
    slug: 'nodejs-event-loop-libuv-phases-microtasks',
    category: 'Node.js',
    subcategory: 'Runtime Internals',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'The Node.js Event Loop is powered by libuv and consists of 6 phases: Timers (setTimeout/setInterval), Pending I/O callbacks, Idle/Prepare, Poll (incoming connections & data), Check (setImmediate), and Close callbacks. Between every phase and every single callback, Node drains the Microtask queues: process.nextTick queue (highest priority) followed by Promise jobs.',
    detailedExplanation:
      'Event loop phases breakdown:\n1. Timers: executes callbacks scheduled by setTimeout and setInterval.\n2. Pending Callbacks: executes I/O callbacks deferred to next loop iteration.\n3. Idle, Prepare: internal libuv use only.\n4. Poll: retrieves new I/O events (sockets, files). If poll queue is empty, loop blocks here waiting for I/O unless timers or setImmediate callbacks are scheduled.\n5. Check: executes setImmediate() callbacks.\n6. Close Callbacks: socket.on("close"), cleanup handlers.\n\nMicrotask Queues:\n- process.nextTick: runs immediately after current operation completes, before promise resolution.\n- Promise reactions (.then, .catch, async/await).\nStarvation warning: Recursive calls to process.nextTick will starve the event loop by preventing it from ever reaching the Poll phase!',
    realWorldExample:
      'In a high-volume payment webhook receiver processing 10,000 RPS: CPU-intensive payload signature verification (like cryptographic RSA decryption) on the main event loop thread will block the Poll phase, causing incoming TCP sockets to backlog and time out. Offloading cryptography to libuv thread pool (via crypto.pbkdf2) or Worker Threads prevents event loop starvation.',
    implementationExample:
      '// Understanding execution order output:\nconsole.log("1: Synchronous");\n\nsetTimeout(() => console.log("5: Timeout (Macrotask)"), 0);\nsetImmediate(() => console.log("6: Immediate (Check phase)"));\n\nPromise.resolve().then(() => console.log("3: Promise microtask"));\nprocess.nextTick(() => console.log("2: nextTick microtask"));\n\nconsole.log("4: End Synchronous");\n// Output:\n// 1 -> 4 -> 2 -> 3 -> 5 -> 6 (or 6 -> 5 depending on poll phase timing)',
    codeSnippet:
      '// Scaling CPU tasks in Node.js via worker_threads:\nimport { Worker, isMainThread, parentPort, workerData } from "worker_threads";\n\nif (isMainThread) {\n  export function runCpuBoundTask(data: any): Promise<any> {\n    return new Promise((resolve, reject) => {\n      const worker = new Worker(__filename, { workerData: data });\n      worker.on("message", resolve);\n      worker.on("error", reject);\n    });\n  }\n} else {\n  // Executed on worker thread without blocking main Event Loop\n  const result = heavyCalculation(workerData);\n  parentPort?.postMessage(result);\n}',
    codeLanguage: 'typescript',
    commonMistakes: [
      'Assuming Node.js is completely single-threaded (libuv provides a multi-threaded C threadpool, default 4 threads, configurable via UV_THREADPOOL_SIZE).',
      'Confusing setTimeout(fn, 0) with setImmediate(fn). In an I/O cycle, setImmediate always executes before setTimeout.',
      'Using synchronous file operations (fs.readFileSync) in request handlers in production.',
    ],
    followUpQuestions: [
      'How does UV_THREADPOOL_SIZE affect file I/O, DNS lookup, and cryptographic operations?',
      'How does Node.js Cluster module differ from Worker Threads?',
    ],
    interviewTips: [
      'List the exact sequence: Synchronous code -> process.nextTick -> Promise Microtasks -> Timers -> Check phase.',
    ],
    tags: ['Node.js', 'Event Loop', 'libuv', 'Microtasks', 'Performance'],
  },
  {
    title: 'Explain NestJS Request Lifecycle: Middleware vs Guards vs Interceptors vs Pipes vs Filters',
    slug: 'nestjs-request-lifecycle-guards-pipes-interceptors',
    category: 'NestJS',
    subcategory: 'Architecture & DI',
    difficulty: DifficultyLevel.INTERMEDIATE,
    experienceLevel: '3–5 Years',
    targetCompensation: '₹20–25 LPA',
    shortAnswer:
      'The NestJS request pipeline executes in strict chronological order: 1. Middleware -> 2. Guards (authentication/roles) -> 3. Interceptors (pre-controller) -> 4. Pipes (validation/transformation) -> 5. Controller Handler -> 6. Interceptors (post-controller response mapping) -> 7. Exception Filters (if an unhandled error is thrown).',
    detailedExplanation:
      'Step-by-step lifecycle:\n1. Globally bound middleware -> Module-bound middleware (standard Express req, res, next).\n2. Guards: return boolean or Observable<boolean>. Evaluates whether request has permission to proceed (e.g. JWT validation, Role permissions).\n3. Interceptors (Pre): CallExecutionHook. Can mutate request parameters or start timers.\n4. Pipes: transform input payloads and validate via class-validator/Zod. Throws BadRequestException on validation failure.\n5. Controller handler executes business logic.\n6. Interceptors (Post): tap into RxJS Observable stream to format response payloads, cache responses, or log round-trip latency.\n7. Exception Filters: catch any uncaught exceptions thrown at any stage and format custom JSON error contracts.',
    realWorldExample:
      'In a multi-tenant SaaS API: A Middleware extracts Tenant-ID header; a Guard validates the JWT claims match tenant boundaries; a Pipe validates user profile DTO; the Controller executes update; an Interceptor masks sensitive user data (passwords, PII) from the returned response; an ExceptionFilter catches database constraint errors and returns clean 409 Conflict messages.',
    implementationExample:
      '@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles(UserRole.ADMIN)\n@UseInterceptors(TransformResponseInterceptor, LoggingInterceptor)\n@UseFilters(HttpExceptionFilter)\n@Post("users")\nasync createUser(@Body(new ValidationPipe({ whitelist: true })) dto: CreateUserDto) {\n  return this.usersService.create(dto);\n}',
    codeSnippet:
      '// Logging Interceptor demonstrating Pre and Post lifecycle:\n@Injectable()\nexport class LoggingInterceptor implements NestInterceptor {\n  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n    const now = Date.now();\n    const req = context.switchToHttp().getRequest();\n    \n    // Pre-controller logic\n    return next.handle().pipe(\n      // Post-controller logic\n      tap(() => console.log(`${req.method} ${req.url} [${Date.now() - now}ms]`))\n    );\n  }\n}',
    codeLanguage: 'typescript',
    commonMistakes: [
      'Placing authentication logic in Middleware instead of Guards (Guards have access to ExecutionContext and reflector metadata).',
      'Forgetting that Interceptors wrap the entire response lifecycle using RxJS Observables.',
      'Not applying ValidationPipe({ whitelist: true }), allowing malicious unexpected properties to bypass validation.',
    ],
    followUpQuestions: [
      'What are the three dependency injection scopes in NestJS (DEFAULT, REQUEST, TRANSIENT) and what are their performance implications?',
      'How does ExecutionContext differ from ArgumentsHost?',
    ],
    interviewTips: [
      'Draw the funnel diagram: Request -> Middleware -> Guard -> Interceptor (pre) -> Pipe -> Controller -> Interceptor (post) -> Filter -> Response.',
    ],
    tags: ['NestJS', 'Request Lifecycle', 'Guards', 'Interceptors', 'Pipes'],
  },

  // ==================== DATABASES ====================
  {
    title: 'MySQL B+ Tree Indexing Internals: Clustered vs Secondary Indexes and Composite Index Prefix Rule',
    slug: 'mysql-b-plus-tree-indexing-clustered-secondary',
    category: 'MySQL',
    subcategory: 'Performance & Optimization',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'In MySQL InnoDB, tables are organized as Clustered Indexes based on Primary Key, where leaf nodes store the complete row data. Secondary indexes store the indexed column(s) plus the primary key pointer at their leaf nodes. Queries looking up non-indexed columns via a secondary index require a secondary lookup ("Bookmark Lookup") back into the clustered index, unless satisfied by a Covering Index. Composite indexes strictly obey the Leftmost Prefix Rule.',
    detailedExplanation:
      'InnoDB storage mechanics:\n- Page size is 16KB by default. Leaf nodes are double linked for fast range scans.\n- Clustered Index: guarantees rows are physically ordered by Primary Key on disk.\n- Secondary Index: leaf node contains (secondary_key_value, primary_key_value). Lookups perform B+ Tree search on secondary index, then secondary B+ Tree search on clustered index.\n- Covering Index: When all SELECT columns exist in the secondary index, InnoDB satisfies the query directly from index pages without touching table data (Using index in EXPLAIN).\n- Leftmost Prefix Rule: An index on (a, b, c) accelerates queries filtering on (a), (a, b), and (a, b, c). It CANNOT be used for queries filtering only on (b) or (c) without (a).',
    realWorldExample:
      'In an order management database with 50M rows: SELECT order_id, status FROM orders WHERE user_id = 123 AND order_date >= "2026-01-01". Creating an index on (user_id, order_date, status) is a covering index that drops query latency from 3.2 seconds (table scan + disk I/O) down to 2 milliseconds (RAM index range scan).',
    implementationExample:
      '-- Good covering composite index\nCREATE INDEX idx_user_orders ON orders (user_id, created_at, status);\n\n-- Optimized Query utilizing Leftmost Prefix & Covering Index\nEXPLAIN SELECT status, created_at \nFROM orders \nWHERE user_id = 9843 \n  AND created_at >= "2026-01-01" \nORDER BY created_at DESC;\n-- Output Extra shows: "Using where; Using index" (Zero bookmark lookups!)',
    codeSnippet:
      '-- Query that violates Leftmost Prefix Rule (Cannot use index efficiently):\nSELECT * FROM orders WHERE created_at >= "2026-01-01"; -- misses user_id!\n\n-- Query that partially uses index:\nSELECT * FROM orders WHERE user_id = 9843 AND status = "DELIVERED"; -- uses user_id only, skips created_at',
    codeLanguage: 'sql',
    commonMistakes: [
      'Assuming adding indexes on individual columns (index on a, index on b) is as effective as a composite index (MySQL can only use one index per table in most queries via Index Merge).',
      'Using UUID strings as Primary Keys in InnoDB (causes random disk page splits, low buffer pool cache efficiency, and bloated secondary indexes).',
      'Using functions on indexed columns (WHERE YEAR(created_at) = 2026 prevents index seek).',
    ],
    followUpQuestions: [
      'Why does B+ Tree have advantage over B Tree for relational databases?',
      'What are MySQL Isolation Levels (READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE) and how does MVCC work?',
      'How do you identify and resolve Deadlocks in MySQL?',
    ],
    interviewTips: [
      'Highlight the difference between B Tree (data stored in all nodes) and B+ Tree (data strictly in leaf nodes, linked list leaves for sequential range scans).',
    ],
    tags: ['MySQL', 'Indexing', 'B+ Tree', 'Query Optimization', 'Database Internals'],
  },
  {
    title: 'Redis Internals: Data Structures, Persistence (RDB vs AOF), and Distributed Locks via Redlock',
    slug: 'redis-data-structures-persistence-distributed-locks',
    category: 'Redis',
    subcategory: 'Caching & In-Memory Systems',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'Redis is an in-memory single-threaded event-driven key-value store using I/O multiplexing (epoll/kqueue). It supports Strings, Hashes, Lists, Sets, Sorted Sets (SkipList), HyperLogLog, and Bitmaps. Persistence options are RDB (point-in-time snapshot via fork) and AOF (append-only log with fsync policies). Distributed locks are acquired using SET resource_name my_random_value NX PX 30000 and released via Lua scripts checking token equality.',
    detailedExplanation:
      'Redis Core Architecture:\n- Single-threaded command execution guarantees atomic operations without mutex contention.\n- Data structures: Strings (SDS - Simple Dynamic String), Hashes (ziplist/hashtable), Sorted Sets (SkipList + HashTable achieving O(log N) score lookups).\n- Persistence:\n  * RDB: Periodic snapshots written via background fork (bgsave). Compact, fast restart, but risks losing recent minutes of data.\n  * AOF: Logs every write command. Policies: appendfsync always, everysec (recommended 1s data loss window), no.\n- Distributed Locking:\n  A safe lock requires: 1. Mutex (NX), 2. Timeout (PX to prevent deadlocks if holder crashes), 3. Unique client identifier to prevent releasing another client\'s expired lock.\n  Lua script for release: if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end.',
    realWorldExample:
      'Flash sale inventory reservation: 10,000 users attempting to purchase 50 available tickets simultaneously. Executing a Lua script directly inside Redis decrements stock atomically in <1ms without database roundtrips, eliminating race conditions and overselling completely.',
    implementationExample:
      '// Safe Distributed Lock acquisition in TypeScript/Node.js\nasync function acquireLock(redis: Redis, lockKey: string, lockValue: string, ttlMs: number): Promise<boolean> {\n  const result = await redis.set(lockKey, lockValue, "PX", ttlMs, "NX");\n  return result === "OK";\n}\n\nasync function releaseLock(redis: Redis, lockKey: string, lockValue: string): Promise<boolean> {\n  const luaScript = `\n    if redis.call("get", KEYS[1]) == ARGV[1] then\n      return redis.call("del", KEYS[1])\n    else\n      return 0\n    end\n  `;\n  const res = await redis.eval(luaScript, 1, lockKey, lockValue);\n  return res === 1;\n}',
    codeSnippet:
      '// Flash sale atomic decrement Lua script\nlocal stock = tonumber(redis.call("get", KEYS[1]))\nif stock and stock > 0 then\n    redis.call("decr", KEYS[1])\n    return 1 -- Success\nelse\n    return 0 -- Out of stock\nend',
    codeLanguage: 'lua',
    commonMistakes: [
      'Releasing distributed locks with simple DEL lock_key instead of Lua script (causes race where an expired lock held by another process is erroneously deleted).',
      'Using KEYS * in production (blocks the single-threaded event loop; always use SCAN).',
      'Not setting TTL on cache keys, leading to memory exhaustion (OOM).',
    ],
    followUpQuestions: [
      'What are Redis Cache Eviction policies (volatile-lru, allkeys-lru, allkeys-lfu)?',
      'What is Cache Avalanche vs Cache Breakdown vs Cache Penetration and how do you protect against each?',
      'How does Redis Sentinel provide high availability and how does Redis Cluster shard data (16384 hash slots)?',
    ],
    interviewTips: [
      'Always emphasize the Lua script for releasing distributed locks to prove senior credibility.',
    ],
    tags: ['Redis', 'Caching', 'Distributed Systems', 'Distributed Lock', 'NoSQL'],
  },

  // ==================== APACHE KAFKA & DISTRIBUTED SYSTEMS ====================
  {
    title: 'Apache Kafka Architecture: Consumer Groups, Rebalance Protocol, and Exactly-Once Semantics (EOS)',
    slug: 'kafka-architecture-consumer-groups-rebalance-eos',
    category: 'Apache Kafka',
    subcategory: 'Messaging & Event Streaming',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'Kafka is a distributed append-only commit log partitioned for horizontal scalability. Topics are divided into partitions distributed across broker clusters with leader-follower ISR (In-Sync Replicas). Consumer Groups allow parallel consumption where each partition is assigned to exactly one consumer in the group. Exactly-Once Semantics (EOS) is achieved via idempotent producers (PID + sequence numbers) and two-phase commit transactional coordinators for read-process-write streams.',
    detailedExplanation:
      'Core Kafka concepts:\n1. Partitions & Offsets: Partitions are ordered, immutable sequence of records. Producers determine partition via hash(key) % num_partitions or custom partitioner.\n2. ISR (In-Sync Replicas) & acks=all: Producer waits for leader and all synchronized followers to write message before returning success.\n3. Consumer Rebalance Protocol:\n   - Eager Rebalance: pauses all consumers, revokes all partitions, re-assigns from scratch (causes stop-the-world latency).\n   - Cooperative Sticky Assignor (KIP-429): rebalances incrementally without stopping consumers whose partitions didn\'t change.\n4. Exactly-Once Semantics (EOS):\n   - Idempotent Producer (enable.idempotence=true): Broker tracks ProducerId (PID) and Monotonic Sequence Number per partition, deduplicating retries.\n   - Transactional API (sendOffsetsToTransaction): coordinates state updates and outgoing messages across Kafka and state stores using Transaction Coordinator and Marker records.',
    realWorldExample:
      'In a financial payment ledger: Consuming a payment authorization event, updating account balance, and publishing an payment_settled event must happen exactly once. If the service crashes mid-processing, Kafka transactions ensure either both the offset commit and the outgoing event commit atomically, or neither does, preventing double deductions.',
    implementationExample:
      '// Spring Boot Kafka Producer Configuration for High Reliability & Idempotency\n@Configuration\npublic class KafkaProducerConfig {\n    @Bean\n    public ProducerFactory<String, PaymentEvent> producerFactory() {\n        Map<String, Object> config = new HashMap<>();\n        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka:9092");\n        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");\n        config.put(ProducerConfig.ACKS_CONFIG, "all");\n        config.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);\n        config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);\n        config.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "tx-payment-service-1");\n        return new DefaultKafkaProducerFactory<>(config);\n    }\n}',
    codeSnippet:
      '// Kafka Transactional Read-Process-Write workflow:\nproducer.initTransactions();\ntry {\n  producer.beginTransaction();\n  for (ConsumerRecord<String, Order> record : records) {\n    EnrichedOrder enriched = process(record.value());\n    producer.send(new ProducerRecord<>("enriched-orders", record.key(), enriched));\n  }\n  // Commit consumer offsets and producer messages atomically\n  producer.sendOffsetsToTransaction(currentOffsets, consumerGroupId);\n  producer.commitTransaction();\n} catch (Exception e) {\n  producer.abortTransaction();\n}',
    codeLanguage: 'java',
    commonMistakes: [
      'Assuming Kafka deletes messages once consumed (messages are retained based on retention.ms or retention.bytes regardless of consumption).',
      'Configuring more consumers in a group than total topic partitions (excess consumers sit idle doing zero work).',
      'Calling thread-blocking external APIs inside a Kafka listener loop without adjusting max.poll.interval.ms, causing Kafka to think the consumer died and triggering repeated rebalance storms.',
    ],
    followUpQuestions: [
      'What causes a Consumer Rebalance Storm and how does Cooperative Sticky Assignor resolve it?',
      'How do you design a Dead Letter Queue (DLQ) and exponential backoff retry strategy with Kafka?',
      'What is log compaction and when should it be used instead of time-based retention?',
    ],
    interviewTips: [
      'State: "Partitions are the unit of parallelism in Kafka." This proves you understand scalability limits.',
    ],
    tags: ['Apache Kafka', 'Distributed Systems', 'Event Streaming', 'Messaging', 'System Design'],
  },
  {
    title: 'Distributed Transactions: Two-Phase Commit (2PC) vs Saga Pattern (Choreography vs Orchestration)',
    slug: 'distributed-transactions-2pc-saga-pattern',
    category: 'Distributed Systems',
    subcategory: 'Architecture Patterns',
    difficulty: DifficultyLevel.SENIOR,
    experienceLevel: '8–12 Years',
    targetCompensation: '₹30–35 LPA',
    shortAnswer:
      'In distributed microservices with private databases, Two-Phase Commit (2PC) is a synchronous blocking protocol (Prepare + Commit) that causes severe latency, single-point-of-failure at coordinator, and database lock contention. The Saga Pattern decomposes a distributed transaction into a series of local transactions with compensating transactions for rollbacks, executed either via Choreography (events/Kafka) or Orchestration (central state machine like Temporal/Camunda).',
    detailedExplanation:
      'Comparing 2PC vs Saga:\n\n1. Two-Phase Commit (2PC):\n- Phase 1 (Prepare): Coordinator asks all resource managers (DBs) to prepare and hold row locks.\n- Phase 2 (Commit): If all vote YES, coordinator sends COMMIT. If any vote NO, sends ROLLBACK.\n- Downside: Blocks DB connections; anti-pattern for microservices and cloud networks.\n\n2. Saga Pattern:\n- Local transactions commit immediately in their respective databases.\n- If step 3 fails (e.g. Payment Declined), compensating transactions C2 and C1 are executed backwards (e.g. Unreserve Inventory, Cancel Order).\n- Choreography: Services publish domain events to Kafka. Service B listens to Service A event. Pros: Decoupled, simple. Cons: Hard to trace complex flows, cyclic dependencies.\n- Orchestration: A central orchestrator service invokes endpoints and manages state transitions. Pros: Clear visibility, easy timeout handling. Cons: Additional service to manage.',
    realWorldExample:
      'Uber ride booking saga: 1. Customer requests ride -> 2. Find driver -> 3. Reserve ride -> 4. Pre-authorize card. If credit card authorization fails, compensating transaction notifies Driver Service to unreserve driver and status changes to PAYMENT_FAILED.',
    implementationExample:
      '// Orchestrator State Machine Definition\npublic class OrderSagaOrchestrator {\n    public void executeSaga(Order order) {\n        try {\n            inventoryService.reserve(order);\n            paymentService.charge(order);\n            shippingService.schedule(order);\n        } catch (PaymentFailedException e) {\n            // Compensating transaction\n            inventoryService.cancelReservation(order);\n            orderRepository.updateStatus(order.getId(), OrderStatus.FAILED);\n        }\n    }\n}',
    codeSnippet:
      '// Saga Event Structure for Choreography\n{\n  "sagaId": "saga_9843a01",\n  "eventType": "INVENTORY_RESERVED",\n  "timestamp": 1774092000000,\n  "payload": {\n    "orderId": 40192,\n    "sku": "MACBOOK-PRO-16",\n    "quantity": 1\n  }\n}',
    codeLanguage: 'json',
    commonMistakes: [
      'Assuming compensating transactions are identical to DB rollback (compensating transaction is a forward compensating action, e.g. a refund, not an undo of history).',
      'Ignoring semantic anomalies in Saga (Dirty Reads / Non-repeatable reads since local transactions commit before saga finishes).',
      'Not designing compensating transactions to be idempotent (network retries can send compensation multiple times).',
    ],
    followUpQuestions: [
      'How do you handle idempotency in compensating transactions when network retries occur?',
      'What is the Outbox Pattern and why is it critical when publishing Kafka events from a database transaction?',
      'Explain CQRS (Command Query Responsibility Segregation) and when to use it with Event Sourcing.',
    ],
    interviewTips: [
      'Mention the Transactional Outbox Pattern to bridge database write and Kafka event emission safely.',
    ],
    tags: ['Distributed Systems', 'Saga Pattern', 'Microservices', 'System Design', 'Transactions'],
  },

  // ==================== DEVOPS & DOCKER / KUBERNETES ====================
  {
    title: 'Docker Architecture, Multi-Stage Builds, Container Security, and Image Optimization',
    slug: 'docker-multi-stage-builds-security-optimization',
    category: 'Docker',
    subcategory: 'Containerization',
    difficulty: DifficultyLevel.INTERMEDIATE,
    experienceLevel: '3–5 Years',
    targetCompensation: '₹20–25 LPA',
    shortAnswer:
      'Docker uses Linux namespaces (pid, net, ipc, mnt, uts) for isolation, cgroups for resource constraints (CPU, memory), and UnionFS (overlay2) for layered copy-on-write filesystems. Multi-stage builds separate the compile environment (JDK, Node build tools) from the lightweight runtime image (JRE, Alpine, Distroless), shrinking image sizes from 1.2GB to 80MB while eliminating compiler vulnerabilities and build secrets.',
    detailedExplanation:
      'Key best practices for production Dockerfiles:\n1. Multi-Stage Build: Stage 1 compiles artifacts; Stage 2 copies only compiled output into a lean runtime base.\n2. Non-root user: Containers must never run as root (USER appuser) to mitigate container breakout attacks.\n3. Layer Caching: Copy package.json / pom.xml first and run dependency install before copying source code, avoiding cache busting on every code edit.\n4. Distroless / Alpine base: Google Distroless contains only application and runtime dependencies without package managers or shell binaries (sh/bash), neutralizing common CVE attack vectors.\n5. Explicit tags: Never use :latest in production; pin to sha256 digests or specific semantic versions.',
    realWorldExample:
      'A Spring Boot microservice image built with a monolithic Dockerfile was 850MB and contained 47 high-severity CVEs from Debian packages. Rewriting into a multi-stage Dockerfile utilizing eclipse-temurin:21-jre-alpine and a non-privileged user dropped image size to 140MB and reduced CVE count to 0.',
    implementationExample:
      '# Stage 1: Build & Package\nFROM eclipse-temurin:21-jdk-alpine AS builder\nWORKDIR /build\nCOPY gradlew build.gradle settings.gradle ./\nCOPY gradle ./gradle\nRUN ./gradlew dependencies --no-daemon\nCOPY src ./src\nRUN ./gradlew bootJar --no-daemon -x test\n\n# Stage 2: Minimal Secure Runtime\nFROM eclipse-temurin:21-jre-alpine\nWORKDIR /app\nRUN addgroup -S appgroup && adduser -S appuser -G appgroup\nCOPY --from=builder /build/build/libs/*.jar app.jar\nUSER appuser\nEXPOSE 8080\nENTRYPOINT ["java", "-XX:+UseZGC", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]',
    codeSnippet:
      '# Docker resource constraints execution\ndocker run -d \\\n  --name payment-service \\\n  --cpus="1.5" \\\n  --memory="1024m" \\\n  --memory-swap="1024m" \\\n  --pids-limit=100 \\\n  --security-opt=no-new-privileges:true \\\n  payment-service:v1.0.0',
    codeLanguage: 'dockerfile',
    commonMistakes: [
      'Running containers as the default root user (a vulnerability in container runtime allows host takeover).',
      'Putting sensitive API keys or credentials in Dockerfile ENV instructions (persisted in image history; use BuildKit secrets instead).',
      'Not specifying --memory-swap equal to --memory, causing unintended disk swapping.',
    ],
    followUpQuestions: [
      'How does Docker overlay2 storage driver manage copy-on-write operations?',
      'How do you scan Docker images for vulnerabilities in CI/CD using Trivy or Snyk?',
    ],
    interviewTips: [
      'Demonstrate security consciousness by emphasizing: non-root user, distroless images, and layer cache ordering.',
    ],
    tags: ['Docker', 'DevOps', 'Containers', 'Security', 'CI/CD'],
  },
  {
    title: 'Kubernetes Architecture: Pod Lifecycle, Deployments, Services, Ingress, and Rolling Updates',
    slug: 'kubernetes-architecture-deployments-services-ingress',
    category: 'Kubernetes',
    subcategory: 'Container Orchestration',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'Kubernetes is organized into Control Plane (kube-apiserver, etcd, kube-scheduler, kube-controller-manager) and Worker Nodes (kubelet, kube-proxy, container runtime). A Pod is the smallest deployable unit. Deployments manage ReplicaSets for declarative zero-downtime rolling updates. Services provide stable virtual IPs and load balancing across dynamic pod IPs. Ingress manages HTTP/S routing from outside cluster to internal Services.',
    detailedExplanation:
      'Key components & flow:\n1. Control Plane:\n   - kube-apiserver: REST entrypoint for all cluster state modifications.\n   - etcd: highly consistent distributed key-value store storing desired cluster state.\n   - kube-scheduler: assigns newly created Pods to optimal worker nodes based on resource requests/limits, affinities, and taints.\n   - kube-controller-manager: reconciles current state with desired state.\n2. Worker Node:\n   - kubelet: agent communicating with API server, ensures containers described in PodSpecs are running and healthy.\n   - kube-proxy: maintains network rules (iptables/IPVS) on nodes for Service IP routing.\n3. Probes:\n   - Liveness Probe: detects deadlock/crashes; restarts container if fails.\n   - Readiness Probe: detects if pod is ready to accept traffic; removes from Service endpoints if fails.\n   - Startup Probe: protects slow-starting apps (like large Spring Boot apps) from premature liveness kills.\n4. Zero-Downtime Rolling Update:\n   Deployment creates a new ReplicaSet, incrementally spawns new pods while waiting for readiness probes, then downsizes old ReplicaSet pods.',
    realWorldExample:
      'During a production release, without readiness probes, traffic immediately hits newly started pods while the Spring Boot context is still loading (taking 25 seconds). Users experience 502 Bad Gateway errors. Adding a Readiness Probe with httpGet /actuator/health ensures kube-proxy routes traffic only when the app is 100% warm.',
    implementationExample:
      'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: order-service\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0\n  template:\n    metadata:\n      labels:\n        app: order-service\n    spec:\n      containers:\n      - name: order-service\n        image: registry.company.com/order-service:1.2.0\n        resources:\n          requests:\n            memory: "512Mi"\n            cpu: "250m"\n          limits:\n            memory: "1024Mi"\n            cpu: "1000m"\n        readinessProbe:\n          httpGet:\n            path: /actuator/health/readiness\n            port: 8080\n          initialDelaySeconds: 15\n          periodSeconds: 5\n        livenessProbe:\n          httpGet:\n            path: /actuator/health/liveness\n            port: 8080\n          initialDelaySeconds: 30\n          periodSeconds: 10',
    codeSnippet:
      '# Check rollout status and history\nkubectl rollout status deployment/order-service\nkubectl rollout history deployment/order-service\nkubectl rollout undo deployment/order-service --to-revision=2',
    codeLanguage: 'yaml',
    commonMistakes: [
      'Setting liveness probe to check external dependencies (DB/Redis) instead of container health (if DB goes down, all pods restart simultaneously, exacerbating DB outage).',
      'Not defining resource requests and limits (leads to noisy neighbor problems and OOMKilled evictions).',
      'Using NodePort in production instead of Ingress Controller with TLS termination.',
    ],
    followUpQuestions: [
      'What is Horizontal Pod Autoscaler (HPA) and how does it scale based on custom metrics like Kafka consumer lag?',
      'How does etcd achieve consensus using Raft and why must it have an odd number of nodes?',
      'What is the difference between ConfigMap and Secret and how are they mounted into pods?',
    ],
    interviewTips: [
      'Never confuse liveness (should I restart container?) with readiness (should I send incoming network traffic to this pod?).',
    ],
    tags: ['Kubernetes', 'DevOps', 'Cloud', 'Container Orchestration', 'Microservices'],
  },

  // ==================== NEXT.JS ====================
  {
    title: 'Next.js App Router Architecture: Server Components, Client Components, Server Actions, and Caching',
    slug: 'nextjs-app-router-server-components-caching',
    category: 'Next.js',
    subcategory: 'Full-Stack Architecture',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹25–30 LPA',
    shortAnswer:
      'Next.js App Router adopts React Server Components (RSC) by default. Server Components render exclusively on the server, streaming HTML and serialized flight data without shipping JavaScript bundles to the browser. Components needing client interactivity (useState, onClick) declare "use client". Server Actions provide RPC-style type-safe server mutations without boilerplate REST endpoints. Next.js employs a 4-tier caching model: Request Memoization, Data Cache, Full Route Cache, and Router Cache.',
    detailedExplanation:
      'Deep architectural aspects:\n1. Server vs Client Component boundaries:\n- Server Components can directly query databases, use server secrets, and reduce client bundle.\n- Client Components ("use client") render on client and server during SSR, but bundle their JS to client.\n2. Server Actions ("use server"):\nCan be invoked from form action or transition hooks. Next.js handles serialization, CSRF, and revalidates cache tags via revalidateTag() or revalidatePath().\n3. 4 Caching Tiers in Next.js:\n- Request Memoization: deduplicates identical GET fetch requests within a single React render cycle.\n- Data Cache: persistent cache across requests/deployments (fetch(url, { next: { revalidate: 3600 } })).\n- Full Route Cache: static HTML & RSC payload cached on server at build time.\n- Router Cache: client-side in-memory cache of visited route segments.',
    realWorldExample:
      'In an e-commerce catalog page with product descriptions and customer reviews: Fetching products directly inside a Server Component eliminates shipping the Prisma DB client or markdown parser to browser bundles, cutting page JS payload by 60% and delivering near-instant LCP.',
    implementationExample:
      '// app/products/[id]/page.tsx (Server Component)\nimport { db } from "@/lib/db";\nimport { AddToCartButton } from "./AddToCartButton"; // Client Component\n\nexport default async function ProductPage({ params }: { params: { id: string } }) {\n  // Direct server database query - Zero client bundle cost!\n  const product = await db.product.findUnique({ where: { id: params.id } });\n  if (!product) return <div>Not Found</div>;\n\n  async function addToCartAction() {\n    "use server";\n    await db.cart.add({ productId: product.id });\n  }\n\n  return (\n    <main>\n      <h1>{product.name}</h1>\n      <p>{product.price}</p>\n      <AddToCartButton onAdd={addToCartAction} />\n    </main>\n  );\n}',
    codeSnippet:
      '// Granular cache invalidation with On-Demand Revalidation:\nimport { revalidateTag } from "next/cache";\n\nexport async function updateProductStock(productId: string, stock: number) {\n  "use server";\n  await db.product.update({ where: { id: productId }, data: { stock } });\n  revalidateTag(`product-${productId}`); // Evicts only this product from Data Cache\n}',
    codeLanguage: 'typescript',
    commonMistakes: [
      'Assuming "use client" means the component executes only on client (it is still rendered to HTML on server during SSR).',
      'Importing server-only utilities (like secret DB keys) into client components (use server-only package to catch leaks at compile time).',
      'Misunderstanding Next.js aggressive caching in production vs dev mode.',
    ],
    followUpQuestions: [
      'How does Streaming SSR with Suspense improve TTFB and First Contentful Paint?',
      'How do Next.js Middleware and Edge Runtime differ from Node.js runtime?',
    ],
    interviewTips: [
      'Always emphasize that Server Components reduce the JavaScript bundle sent to the client browser to zero for that component.',
    ],
    tags: ['Next.js', 'React Server Components', 'Server Actions', 'Caching', 'SSR'],
  },

  // ==================== SQL ====================
  {
    title: 'SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG) and Common Table Expressions (CTEs)',
    slug: 'sql-window-functions-ctes-optimization',
    category: 'SQL',
    subcategory: 'Complex Querying & Analytics',
    difficulty: DifficultyLevel.ADVANCED,
    experienceLevel: '5–8 Years',
    targetCompensation: '₹20–25 LPA',
    shortAnswer:
      'Window functions perform calculations across a set of table rows related to the current row without collapsing rows into a single summary row like GROUP BY. OVER (PARTITION BY ... ORDER BY ...) defines the window frame. ROW_NUMBER generates unique sequential integers; RANK leaves gaps for ties (1, 2, 2, 4); DENSE_RANK leaves no gaps (1, 2, 2, 3). Common Table Expressions (WITH cte AS (...)) provide modular, readable subqueries and enable recursion.',
    detailedExplanation:
      'Window function syntax breakdown:\nFUNCTION() OVER (\n  PARTITION BY partition_column\n  ORDER BY sort_column\n  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n)\n\nKey functions:\n- Ranking: ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(n).\n- Value offsets: LEAD(col, offset) accesses subsequent row without self-join; LAG(col, offset) accesses preceding row.\n- Aggregates over window: SUM(amount) OVER (PARTITION BY user_id ORDER BY trans_date) creates a running balance.\n\nRecursive CTEs:\nWITH RECURSIVE Hierarchy AS (\n  SELECT emp_id, manager_id, 1 as level FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.emp_id, e.manager_id, h.level + 1 FROM employees e JOIN Hierarchy h ON e.manager_id = h.emp_id\n)',
    realWorldExample:
      'Finding the top 3 highest-earning employees in each department: Using traditional SQL requires complex correlated subqueries. With DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC), it is solved cleanly in a single scan.',
    implementationExample:
      '-- Top 3 earners per department query\nWITH RankedSalaries AS (\n  SELECT \n    emp_id,\n    dept_id,\n    salary,\n    DENSE_RANK() OVER (\n      PARTITION BY dept_id \n      ORDER BY salary DESC\n    ) as salary_rank\n  FROM employees\n)\nSELECT emp_id, dept_id, salary\nFROM RankedSalaries\nWHERE salary_rank <= 3;',
    codeSnippet:
      '-- Calculating month-over-month growth with LAG:\nSELECT \n  month,\n  revenue,\n  LAG(revenue, 1) OVER (ORDER BY month) as prev_month_revenue,\n  ROUND(((revenue - LAG(revenue, 1) OVER (ORDER BY month)) / LAG(revenue, 1) OVER (ORDER BY month)) * 100, 2) as mom_growth_pct\nFROM monthly_sales;',
    codeLanguage: 'sql',
    commonMistakes: [
      'Using window functions in WHERE or HAVING clauses (window functions execute after WHERE/HAVING and GROUP BY; they must be wrapped in a CTE or subquery).',
      'Confusing RANK() with DENSE_RANK() when dealing with ties.',
      'Omitting the ORDER BY inside OVER clause when running running-total aggregates (turns running total into grand total).',
    ],
    followUpQuestions: [
      'What is the physical execution order of an SQL query (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> WINDOW -> ORDER BY -> LIMIT)?',
      'What are SQL Isolation levels and how do you diagnose lock wait timeouts?',
    ],
    interviewTips: [
      'State the query execution order: WHERE filters before Window functions execute, which is why CTEs are mandatory for filtering by rank.',
    ],
    tags: ['SQL', 'Window Functions', 'Analytics', 'Database', 'CTE'],
  },
];
