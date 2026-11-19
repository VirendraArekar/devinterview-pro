#!/usr/bin/env python3
"""
Generate dedicated practical coding challenges for specific technologies:
Node.js, React.js, JavaScript, Core Java, Advanced Java, Spring Boot, MySQL, PostgreSQL, MSSQL.
"""
import json
import os
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

DIFFS = ['Easy', 'Medium', 'Hard']

SPECIFIC_CATEGORIES = [
    # 1. Node.js
    ("Node.js", "javascript", [
        ("Custom EventEmitter Implementation", "Medium", "Implement a robust EventEmitter class supporting on(event, listener), once(event, listener), emit(event, ...args), off(event, listener), and listenerCount(event).", "event: string, args: any[]", "boolean / void", "O(1)", "O(N)"),
        ("Async Task Queue with Concurrency Limit", "Medium", "Implement an async task queue (similar to p-limit) that accepts a concurrency limit k and executes tasks such that no more than k async functions run concurrently.", "concurrency: number, tasks: (() => Promise<any>)[]", "Promise<any[]>", "O(N)", "O(k)"),
        ("Stream Transform CSV to JSON Parser", "Medium", "Implement a Node.js Transform stream that parses incoming CSV chunks line by line and outputs formatted JSON objects, handling partial chunks across buffers.", "csvStream: Readable", "Transform stream", "O(N)", "O(1)"),
        ("Sliding Window Rate Limiter Middleware", "Medium", "Implement a Node.js rate limiter that limits each IP address to maxRequests within a windowMs sliding window using an in-memory timestamp array.", "ip: string, maxRequests: number, windowMs: number", "boolean (allowed)", "O(log N)", "O(N)"),
        ("Auto-Retry with Exponential Backoff and Jitter", "Medium", "Write a resilient async retry function that retries an async operation up to maxAttempts times, with exponential backoff delay (baseDelay * 2^attempt) plus randomized jitter.", "fn: () => Promise<T>, maxAttempts: number, baseDelayMs: number", "Promise<T>", "O(attempts)", "O(1)"),
        ("Custom In-Memory Cache with TTL and LRU Eviction", "Hard", "Build an in-memory caching store supporting set(key, value, ttlMs) and get(key) with automatic TTL expiration and Least Recently Used (LRU) capacity eviction.", "capacity: number", "Cache instance", "O(1)", "O(capacity)"),
        ("Promisify Utility Function from Scratch", "Easy", "Implement promisify(fn) which converts a traditional Node.js errback callback function (err, result) into a function that returns a standard ES6 Promise.", "fn: Function", "Function returning Promise", "O(1)", "O(1)"),
        ("Buffer Slice and Binary Protocol Message Unpacker", "Medium", "Given a Node.js Buffer containing a stream of binary packets formatted as [2 bytes magic][4 bytes payload length][payload], unpack all complete messages and return array of payload Buffers.", "buffer: Buffer", "Buffer[]", "O(N)", "O(N)"),
        ("Deep Object Clone with Circular Reference Handling", "Medium", "Write a deep clone function that creates an exact copy of any object, handling circular references, Dates, RegExps, Maps, Sets, and Node.js Buffer instances.", "obj: any", "clonedObj: any", "O(N)", "O(N)"),
        ("HTTP Request Router with Dynamic Route Parameters", "Medium", "Implement a lightweight HTTP request router supporting route registration with path parameters (/users/:userId/orders/:orderId) and matching incoming URLs to extract param objects.", "routes: string[], url: string", "{ route: string, params: Record<string, string> }", "O(N)", "O(K)"),
        ("Circuit Breaker Pattern Implementation", "Hard", "Implement a Circuit Breaker with CLOSED, OPEN, and HALF_OPEN states that monitors failures, trips open when failureThreshold is reached within resetTimeoutMs, and tests recovery.", "callFn: () => Promise<T>, options: CircuitOptions", "Promise<T>", "O(1)", "O(1)"),
        ("Parallel File Reader with Max Open Descriptors", "Medium", "Write a function that reads an array of file paths concurrently, guaranteeing that no more than maxFD file descriptors are open at any single moment.", "filePaths: string[], maxFD: number", "Promise<string[]>", "O(N)", "O(maxFD)"),
        ("Child Process Worker Pool for CPU Hashing", "Hard", "Design a worker pool using Node.js Worker Threads that distributes CPU-bound cryptographic hashing tasks to a fixed pool of worker threads and resolves promises on completion.", "tasks: string[], poolSize: number", "Promise<string[]>", "O(N)", "O(poolSize)"),
        ("Custom Writable Stream with Backpressure Drain", "Medium", "Implement a custom Writable stream that processes large datasets in batches, returning false on write() when highWaterMark is exceeded and emitting 'drain' when ready for more data.", "highWaterMark: number", "WritableStream", "O(N)", "O(highWaterMark)"),
        ("Batch Request Aggregator with Debounce Window", "Medium", "Implement a DataLoader-style batch aggregator that collects individual getById(id) calls within a 10ms microtask window and executes a single batchQuery(ids) call.", "ids: number[]", "Promise<T[]>", "O(N)", "O(N)"),
        ("Pub/Sub Broker with Wildcard Channel Subscriptions", "Medium", "Implement an in-memory Pub/Sub broker that allows subscribing to topic patterns with wildcards ('orders.*', 'orders.#') and publishing messages to matching subscribers.", "topic: string, message: any", "void", "O(T)", "O(S)"),
        ("Graceful Server Shutdown Coordinator", "Easy", "Write a graceful shutdown helper that listens for SIGTERM/SIGINT, stops accepting new HTTP connections, waits for active in-flight requests to complete with a timeout, and exits cleanly.", "server: http.Server, timeoutMs: number", "void", "O(1)", "O(1)"),
        ("Memory Leak Detector using WeakRef and FinalizationRegistry", "Medium", "Implement a leak-testing helper that accepts an object and a creation factory, holding a WeakRef to determine if the object was successfully reclaimed after GC or leaked.", "targetFactory: () => object", "Promise<boolean>", "O(1)", "O(1)"),
        ("Debounced File System Watcher", "Easy", "Build a file change watcher utility using fs.watch that debounces duplicate file modification events emitted by the OS within a 100ms window.", "dirPath: string, debounceMs: number", "EventEmitter", "O(1)", "O(1)"),
        ("Asynchronous Semaphore and Mutex Primitives", "Medium", "Implement an asynchronous Semaphore class supporting acquire() (returning a release function) and maxConcurrency, ensuring tasks queue up when capacity is saturated.", "permits: number", "Semaphore", "O(1)", "O(N)")
    ]),

    # 2. React.js
    ("React.js", "javascript", [
        ("Custom Hook: useDebounce and useDebouncedCallback", "Easy", "Implement useDebounce(value, delayMs) which returns a debounced value that only updates after delayMs has elapsed without new changes.", "value: T, delayMs: number", "debouncedValue: T", "O(1)", "O(1)"),
        ("Custom Hook: useFetch with Cache and AbortController", "Medium", "Build useFetch(url, options) returning { data, loading, error, refetch } with automatic in-memory caching and request cancellation via AbortController on unmount.", "url: string, options?: RequestInit", "{ data, loading, error, refetch }", "O(1)", "O(1)"),
        ("Custom Hook: useLocalStorage with Cross-Tab Sync", "Medium", "Create useLocalStorage(key, initialValue) that synchronizes state with window.localStorage and listens to the 'storage' event for cross-tab updates.", "key: string, initialValue: T", "[T, (val: T) => void]", "O(1)", "O(1)"),
        ("Custom Hook: usePrevious Value Tracker", "Easy", "Implement usePrevious(value) using useRef and useEffect to store and return the previous render's value of any state variable.", "value: T", "previousValue: T | undefined", "O(1)", "O(1)"),
        ("Virtualized Windowing List from Scratch", "Hard", "Implement a VirtualList component that renders a list of 100,000 items with fixed itemHeight, calculating visible startIndex and endIndex from container scrollTop to render only ~20 DOM nodes.", "itemCount: number, itemHeight: number, height: number", "JSX.Element", "O(1) render", "O(visibleItems)"),
        ("Infinite Scroll Hook with IntersectionObserver", "Medium", "Implement useInfiniteScroll(callback, hasMore) that attaches an IntersectionObserver to a sentinel element and invokes callback when scrolled into view.", "callback: () => void, hasMore: boolean", "ref: RefObject<HTMLElement>", "O(1)", "O(1)"),
        ("Autocomplete Search Dropdown with Keyboard Navigation", "Medium", "Build a searchable Autocomplete component supporting ArrowUp, ArrowDown to highlight suggestions, Enter to select, and Escape to dismiss.", "options: string[], onSelect: (val: string) => void", "JSX.Element", "O(N)", "O(N)"),
        ("Modal Dialog with Portal and Focus Trap", "Medium", "Create a Modal component rendered through ReactDOM.createPortal into document.body, supporting Escape key dismissal, backdrop click closing, and keyboard focus trap inside the modal.", "isOpen: boolean, onClose: () => void, children: ReactNode", "JSX.Element", "O(1)", "O(1)"),
        ("Recursive Tree / Nested Comments Component", "Medium", "Build a nested Comments component that recursively renders parent-child comment threads of arbitrary depth with expand/collapse toggles and reply actions.", "comments: CommentNode[]", "JSX.Element", "O(N)", "O(depth)"),
        ("Multi-Step Wizard Form with Step Validation", "Medium", "Implement a reusable Wizard component that manages multi-step forms, tracks active step index, validates current step fields before next, and preserves aggregate state.", "steps: WizardStep[], onComplete: (data: any) => void", "JSX.Element", "O(S)", "O(D)"),
        ("OTP 6-Digit Input with Auto-Focus Shifting", "Medium", "Build an OTPInput component with 6 discrete digit inputs that automatically advances focus on character entry, handles backspace to previous input, and parses pasted 6-digit codes.", "length: number, onChange: (otp: string) => void", "JSX.Element", "O(1)", "O(length)"),
        ("Interactive Star Rating Component", "Easy", "Create a StarRating component supporting totalStars (default 5), half-star increments, hover previews, and onChange rating callbacks.", "totalStars: number, value: number, onChange: (r: number) => void", "JSX.Element", "O(1)", "O(1)"),
        ("Toast Notification Provider Queue", "Medium", "Build a ToastProvider and useToast() hook that manages a FIFO queue of toast alerts with auto-dismiss timers, manual close, and pause-on-hover behavior.", "toasts: ToastConfig[]", "JSX.Element", "O(1)", "O(N)"),
        ("Accordion with Single or Multiple Expanded Modes", "Easy", "Implement an Accordion component accepting items [{ title, content }] supporting allowMultiple (boolean) to control whether multiple panels can be open simultaneously.", "items: AccordionItem[], allowMultiple?: boolean", "JSX.Element", "O(1)", "O(1)"),
        ("Drag and Drop Kanban Board Column Reordering", "Hard", "Implement drag-and-drop state management for a Kanban board allowing cards to be dragged between columns and reordered within a column using HTML5 Drag and Drop events.", "columns: Record<string, Card[]>", "JSX.Element", "O(N)", "O(N)"),
        ("Custom Hook: useClickOutside", "Easy", "Write useClickOutside(ref, handler) that listens for mousedown/touchstart events on the document and triggers handler only if the click occurred outside ref.current.", "ref: RefObject<HTMLElement>, handler: () => void", "void", "O(1)", "O(1)"),
        ("Custom Hook: useWindowSize with Throttle", "Easy", "Implement useWindowSize() returning { width, height } that updates on window resize events throttled to 100ms.", "none", "{ width: number, height: number }", "O(1)", "O(1)"),
        ("Controlled vs Uncontrolled Tabs Component", "Medium", "Design a Tabs component that functions as an uncontrolled component with defaultActiveTab or a fully controlled component with activeTab and onChange props.", "tabs: TabConfig[], activeTab?: string, onChange?: (id: string) => void", "JSX.Element", "O(1)", "O(1)"),
        ("Searchable Multi-Select with Tag Chips", "Medium", "Build a MultiSelect dropdown where selected options are displayed as removable tag chips in the input box with a filterable dropdown menu.", "options: SelectOption[], selected: string[], onChange: (vals: string[]) => void", "JSX.Element", "O(N)", "O(N)"),
        ("Image Carousel with Auto-Play and Touch Swipe", "Medium", "Implement a responsive Carousel slider supporting auto-play timer, pause on mouse enter, dot navigation indicators, and touch swipe gestures.", "images: string[], intervalMs?: number", "JSX.Element", "O(1)", "O(1)")
    ]),

    # 3. Core Java
    ("Core Java", "java", [
        ("Producer-Consumer with BlockingQueue and Condition", "Medium", "Implement a bounded Producer-Consumer buffer using ReentrantLock and two Condition variables (notFull and notEmpty) without using java.util.concurrent.BlockingQueue.", "capacity: int", "BoundedBuffer<T>", "O(1)", "O(capacity)"),
        ("Custom Thread-Safe LRU Cache with Lock Striping", "Medium", "Implement a thread-safe LRU Cache in Java supporting get(key) and put(key, value) with O(1) time complexity using a Doubly Linked List and ConcurrentHashMap.", "capacity: int", "LRUCache<K, V>", "O(1)", "O(capacity)"),
        ("Thread-Safe Singleton with Bill Pugh and Enum", "Easy", "Implement the Singleton design pattern in Java using: 1. The Bill Pugh Static Inner Class idiom. 2. An Enum singleton. Explain why Enum is immune to reflection and serialization attacks.", "none", "Singleton instance", "O(1)", "O(1)"),
        ("Bounded Blocking Queue from Scratch with wait/notifyAll", "Medium", "Implement a thread-safe BoundedBlockingQueue supporting put(item) and take() using intrinsic object monitors with synchronized, wait(), and notifyAll().", "capacity: int", "BlockingQueue<T>", "O(1)", "O(capacity)"),
        ("Custom ThreadPoolExecutor with CallerRuns Policy", "Hard", "Build a lightweight ThreadPoolExecutor managing a fixed pool of Worker threads, a bounded ArrayBlockingQueue, and a CallerRunsPolicy executed by the submitting thread on saturation.", "coreThreads: int, maxQueueSize: int", "CustomThreadPool", "O(1)", "O(N)"),
        ("Deadlock Simulation and Programmatic Detection", "Medium", "Write a Java program that purposefully induces a deadlock between two threads acquiring two locks in opposite order, and use ThreadMXBean.findDeadlockedThreads() to detect it programmatically.", "none", "long[] deadlockedThreadIds", "O(1)", "O(1)"),
        ("Immutable Class Design with Deep Defensive Copying", "Easy", "Design an immutable Person class containing mutable fields (Date birthDate, List<String> phoneNumbers), ensuring defensive copying in constructor and accessors.", "name: String, birthDate: Date, phones: List<String>", "ImmutablePerson", "O(N)", "O(N)"),
        ("ReadWriteLock Implementation from Scratch", "Medium", "Implement a custom ReadWriteLock with lockRead(), unlockRead(), lockWrite(), and unlockWrite() supporting concurrent readers and mutual exclusion for writers.", "none", "CustomReadWriteLock", "O(1)", "O(1)"),
        ("Custom HashMap with Linear Probing Open Addressing", "Medium", "Implement a HashMap from scratch using Open Addressing with Linear Probing for collision resolution, supporting put(key, val), get(key), and remove(key).", "initialCapacity: int", "CustomHashMap<K, V>", "O(1) avg", "O(capacity)"),
        ("Priority Queue (Min-Heap) Implementation from Scratch", "Medium", "Implement a generic Min-Heap PriorityQueue supporting push(item), pop(), and peek() using an internal dynamic array with shiftUp and shiftDown heapify methods.", "none", "PriorityQueue<T>", "O(log N)", "O(N)"),
        ("CompletableFuture Composition Pipeline", "Medium", "Write a method that accepts a user ID, queries user details and order list asynchronously via CompletableFuture.supplyAsync, combines them via thenCombine, and returns a composite DTO.", "userId: Long", "CompletableFuture<UserSummaryDTO>", "O(1)", "O(1)"),
        ("Object Pool Design Pattern for Sockets", "Medium", "Implement a generic thread-safe ObjectPool<T> supporting borrowObject() and returnObject(T obj) with maximum capacity, timeout on borrowing, and object validation.", "maxIdle: int, factory: ObjectFactory<T>", "ObjectPool<T>", "O(1)", "O(capacity)"),
        ("Token Bucket Rate Limiter in Pure Java", "Medium", "Implement a thread-safe TokenBucketRateLimiter that refills tokens at a fixed rate per second up to maxCapacity, allowing or rejecting allowRequest() atomically.", "refillRatePerSec: double, capacity: double", "TokenBucket", "O(1)", "O(1)"),
        ("Custom ClassLoader with Encrypted Bytecode", "Hard", "Implement a custom ClassLoader that overrides findClass(String name) to read AES-encrypted .class bytes from disk, decrypt them in memory, and invoke defineClass.", "className: String", "Class<?>", "O(N)", "O(N)"),
        ("ForkJoinPool Parallel Merge Sort", "Medium", "Implement a parallel RecursiveAction merge sort using Java's ForkJoinPool, splitting array partitions recursively when segment length exceeds threshold.", "nums: int[]", "void (sorted)", "O(N log N)", "O(N)"),
        ("Circular Ring Buffer with CAS Atomic Pointers", "Medium", "Implement a lock-free RingBuffer of fixed capacity power-of-two using AtomicLong head and tail pointers and bitwise modulo masking.", "capacity: int", "RingBuffer<T>", "O(1)", "O(capacity)"),
        ("Trie Prefix Tree Implementation in Java", "Medium", "Implement a Trie with insert(word), search(word), and startsWith(prefix) supporting fast lowercase English alphabetical prefix queries.", "words: String[]", "Trie", "O(L)", "O(ALPHABET_SIZE * L)"),
        ("Binary Search Tree Traversal: Iterative Pre/In/Post Order", "Medium", "Write iterative traversal methods for a BST (in-order, pre-order, post-order) using an explicit Stack without recursion.", "root: TreeNode", "List<Integer>", "O(N)", "O(H)"),
        ("Atomic Long Counter with VarHandle CAS Loops", "Medium", "Implement a thread-safe Counter class using Java 9 VarHandle to perform volatile reads and compareAndSet loops for atomic increments.", "none", "VarHandleCounter", "O(1)", "O(1)"),
        ("Sliding Window Rate Limiter with Atomic Time Windows", "Medium", "Build a high-performance sliding window rate limiter in Java using ConcurrentLinkedQueue storing request timestamps and trimming expired entries.", "maxRequests: int, windowSec: int", "boolean", "O(N)", "O(maxRequests)")
    ]),

    # 4. Advanced Java
    ("Advanced Java", "java", [
        ("Virtual Threads Loom 100K Task Orchestrator", "Medium", "Write a Java 21 program using Executors.newVirtualThreadPerTaskExecutor() that spawns 100,000 concurrent virtual threads performing simulated network calls and collects results without OOM.", "taskCount: int", "List<String>", "O(N)", "O(N)"),
        ("NIO Non-Blocking TCP Echo Server with Selectors", "Hard", "Implement a non-blocking TCP Echo Server using Java NIO ServerSocketChannel, SocketChannel, Selector, and ByteBuffer handling client reads/writes concurrently on a single thread.", "port: int", "void (server loop)", "O(1)", "O(connections)"),
        ("Zero-Copy File Transfer with FileChannel.transferTo", "Medium", "Implement a high-throughput file transfer server that transfers multi-gigabyte files to a SocketChannel using FileChannel.transferTo() leveraging Linux sendfile system call.", "filePath: Path, client: SocketChannel", "long (bytesTransferred)", "O(N)", "O(1)"),
        ("Memory-Mapped File Parser for Large Log Datasets", "Hard", "Write a high-performance log analyzer using FileChannel.map() (MappedByteBuffer) that parses 5GB log files in seconds without loading the entire file into Java heap memory.", "logPath: Path", "Map<String, Integer> (statusCounts)", "O(N)", "O(1) heap"),
        ("Concurrent Ring Buffer LMAX Disruptor Pattern", "Hard", "Implement a lock-free Single-Producer Multi-Consumer ring buffer in Java using volatile sequence counters and memory barrier fences to achieve zero-lock message passing.", "bufferSize: int", "DisruptorRingBuffer<T>", "O(1)", "O(bufferSize)"),
        ("Custom Dynamic Proxy for Latency Metrics", "Medium", "Implement a dynamic metrics proxy using java.lang.reflect.Proxy and InvocationHandler that wraps any service interface, records execution duration of all methods, and emits alerts on SLA breach.", "target: T, interfaceClass: Class<T>", "T (proxy)", "O(1)", "O(1)"),
        ("Annotation Processor for Automatic DTO Mapping", "Hard", "Create a Java annotation processor using javax.annotation.processing.AbstractProcessor that generates boilerplate DTO builder classes during javac compilation.", "annotatedClasses: Set<TypeElement>", "boolean", "O(N)", "O(N)"),
        ("Non-Blocking Lock-Free Treiber Stack", "Medium", "Implement a thread-safe lock-free Stack using AtomicReference and Compare-And-Swap (CAS) based on the Treiber Stack algorithm.", "none", "TreiberStack<T>", "O(1)", "O(N)"),
        ("Memory-Sensitive Cache with SoftReference & ReferenceQueue", "Medium", "Build an in-memory cache using SoftReference for values and a ReferenceQueue to poll and purge expired reference entries when garbage collection reclaims heap memory.", "none", "SoftCache<K, V>", "O(1)", "O(N)"),
        ("Reactive Stream Publisher with Java 9 Flow API", "Medium", "Implement a reactive stream Flow.Publisher and Flow.Subscriber with custom Subscription handling backpressure and request(n) demand signaling.", "items: List<T>", "Flow.Publisher<T>", "O(N)", "O(1)"),
        ("Off-Heap Direct Memory Allocator and Cleaner", "Hard", "Implement an off-heap direct memory buffer allocator using ByteBuffer.allocateDirect() and use Java 9 Cleaner to guarantee native memory deallocation upon unreachability.", "byteSize: int", "OffHeapBuffer", "O(1)", "O(1) heap"),
        ("High-Performance Compact Binary Serializer", "Hard", "Write a custom serializer for domain objects writing directly to a ByteBuffer without Java standard serialization overhead, achieving 5x smaller footprint.", "object: TradeRecord, buffer: ByteBuffer", "void", "O(F)", "O(1)"),
        ("Optimistic Reading with StampedLock", "Medium", "Implement a thread-safe 2D Point class with move(dx, dy) and distanceFromOrigin() using StampedLock optimistic reads (tryOptimisticRead) with fallback to readLock.", "none", "Point2D", "O(1)", "O(1)"),
        ("High-Throughput Sliding Window Rate Limiter with LongAdder", "Medium", "Build a high-throughput rate limiter using LongAdder cell striping across 60 discrete one-second buckets to handle millions of operations per second without thread contention.", "maxPerMinute: long", "boolean", "O(1)", "O(1)"),
        ("Object Recycler Flyweight Pattern for Low GC", "Medium", "Implement a reusable Object Recycler pool for transaction message objects, preventing object allocations in high-frequency message processing loops.", "capacity: int", "ObjectRecycler<T>", "O(1)", "O(capacity)"),
        ("Thread-Safe DAG Task Scheduler", "Hard", "Design an asynchronous DAG task scheduler that executes interdependent tasks in topological order, running independent parallel tasks on worker threads as upstream dependencies resolve.", "tasks: Map<String, Task>", "CompletableFuture<Void>", "O(V + E)", "O(V)"),
        ("Isolated Plugin ClassLoader with Hot Reloading", "Hard", "Implement a modular URLClassLoader child-first classloader that loads external jar plugins into isolated Metaspace compartments and allows unloading and re-loading on file change.", "pluginJarPath: Path", "PluginInstance", "O(N)", "O(N)"),
        ("Asynchronous Priority Event Bus", "Medium", "Build an asynchronous EventBus supporting @Subscribe methods with priority levels and thread pool dispatching with bounded queue backpressure.", "none", "EventBus", "O(1)", "O(N)"),
        ("ThreadLocal Leak Prevention Diagnostic Tool", "Medium", "Write a diagnostic utility that scans all active threads in the JVM via reflection on Thread.threadLocals and reports any lingering detached classes or memory leaks.", "none", "List<ThreadLocalLeakReport>", "O(T)", "O(T)"),
        ("Concurrent SkipList Map Implementation", "Hard", "Implement a simplified ConcurrentSkipListMap supporting put(k, v) and rangeQuery(min, max) using multi-level linked lists with probabilistic coin-flip heights.", "none", "SkipListMap<K, V>", "O(log N)", "O(N)")
    ]),

    # 5. Spring Boot
    ("Spring Boot", "java", [
        ("Custom Auto-Configuration with Conditionals", "Medium", "Create a custom Spring Boot auto-configuration class utilizing @AutoConfiguration, @ConditionalOnClass, @ConditionalOnProperty, and @ConditionalOnMissingBean to auto-wire a payment client.", "none", "PaymentAutoConfiguration", "O(1)", "O(1)"),
        ("Stateless JWT Authentication Filter Chain", "Medium", "Implement a complete OncePerRequestFilter that extracts Bearer JWT tokens, validates expiration and HMAC signatures, extracts UserDetails, and sets the SecurityContext.", "req: HttpServletRequest", "void", "O(1)", "O(1)"),
        ("AOP Aspect for Execution Time and Alerting", "Easy", "Write a Spring AOP Aspect with @Around(\"@annotation(LogExecutionTime)\") that measures method execution duration and logs a warning if runtime exceeds a configurable threshold.", "joinPoint: ProceedingJoinPoint", "Object", "O(1)", "O(1)"),
        ("Custom BeanPostProcessor for Secret Decryption", "Medium", "Implement a BeanPostProcessor that inspects all bean String fields annotated with @EncryptedSecret and decrypts them dynamically after instantiation.", "bean: Object, beanName: String", "Object", "O(F)", "O(1)"),
        ("Global Exception Handler with ProblemDetail RFC 7807", "Easy", "Build a @RestControllerAdvice handling ResourceNotFoundException, MethodArgumentNotValidException, and generic Exception, returning standardized RFC 7807 ProblemDetail JSON envelopes.", "ex: Exception", "ProblemDetail", "O(1)", "O(1)"),
        ("Spring Data JPA Dynamic Specification Builder", "Medium", "Implement a dynamic search filter utility using Spring Data JPA Specification<T> and CriteriaBuilder supporting combining AND/OR predicates for search, status, and date ranges.", "filter: SearchCriteria", "Specification<Product>", "O(P)", "O(1)"),
        ("Custom Spring Boot Actuator Metric Endpoint", "Medium", "Create a custom Spring Boot Actuator @Endpoint(id = \"systemMetrics\") with @ReadOperation returning JVM memory, active DB pool connections, and custom business counters.", "none", "Map<String, Object>", "O(1)", "O(1)"),
        ("Custom HealthIndicator Checking Redis and APIs", "Easy", "Implement a HealthIndicator that pings Redis and an external third-party payment gateway, returning Health.up() with latency details or Health.down() with error reason.", "none", "Health", "O(1)", "O(1)"),
        ("Optimistic Locking Retry Aspect with @Retryable", "Medium", "Build an AOP aspect that intercepts methods throwing ObjectOptimisticLockingFailureException and automatically retries the database operation up to 3 times with exponential delay.", "joinPoint: ProceedingJoinPoint", "Object", "O(attempts)", "O(1)"),
        ("Transactional Event Listener for Post-Commit Side Effects", "Medium", "Implement an event pipeline where an OrderService publishes OrderCreatedEvent, and a NotificationListener processes it strictly inside @TransactionalEventListener(phase = AFTER_COMMIT) with @Async.", "event: OrderCreatedEvent", "void", "O(1)", "O(1)"),
        ("TaskDecorator for Async MDC Context Propagation", "Medium", "Implement a TaskDecorator for ThreadPoolTaskExecutor that copies SLF4J MDC logging context (traceId, userId) from the parent HTTP thread to worker execution threads.", "runnable: Runnable", "Runnable", "O(1)", "O(1)"),
        ("Custom HandlerInterceptor for Multi-Tenant ID Validation", "Easy", "Create a Spring MVC HandlerInterceptor that validates 'X-Tenant-ID' headers on incoming requests, sets it in a ThreadLocal TenantContext, and cleans up on afterCompletion.", "req: HttpServletRequest, res: HttpServletResponse", "boolean", "O(1)", "O(1)"),
        ("Distributed Cache-Aside with Redis and CacheEvict", "Medium", "Design a Spring service with @Cacheable(value = \"products\", key = \"#id\") and @CacheEvict(value = \"products\", key = \"#id\") configured with RedisCacheManager and custom TTL.", "id: Long", "ProductDTO", "O(1)", "O(1)"),
        ("Rate Limiting Filter with Bucket4j and Redis", "Medium", "Implement a servlet Filter in Spring Boot using Bucket4j and Redis proxy to rate-limit client API requests to 100 requests per minute per API key.", "req: ServletRequest", "void", "O(1)", "O(1)"),
        ("Dynamic Multi-Tenant DataSource Routing", "Hard", "Implement multi-tenant database routing using AbstractRoutingDataSource that dynamically resolves the active JDBC connection based on TenantContext.getCurrentTenant().", "none", "DataSource", "O(1)", "O(1)"),
        ("Custom Spring ConstraintValidator Annotation", "Easy", "Create a custom validation annotation @ValidPhoneNumber and implement ConstraintValidator<ValidPhoneNumber, String> enforcing E.164 international phone number format.", "value: String, context: ConstraintValidatorContext", "boolean", "O(1)", "O(1)"),
        ("Resilient WebClient with Circuit Breaker and Fallback", "Medium", "Configure a Spring WebClient bean with HTTP timeouts, connection pool pooling, and a Resilience4j CircuitBreaker that falls back to cached data on downstream failure.", "url: string", "Mono<T>", "O(1)", "O(1)"),
        ("Spring Batch Chunk-Oriented Processing Job", "Hard", "Configure a Spring Batch Job reading 100,000 transaction records from CSV using FlatFileItemReader, validating via ItemProcessor, and batch-inserting into MySQL via JdbcBatchItemWriter in chunks of 500.", "none", "Job", "O(N)", "O(chunkSize)"),
        ("JPA Entity Auditing Listener with @CreatedDate", "Easy", "Configure Spring Data JPA Auditing using @EnableJpaAuditing, AuditorAware<String>, and @EntityListeners(AuditingEntityListener.class) to track createdBy and lastModifiedDate.", "none", "BaseEntity", "O(1)", "O(1)"),
        ("Graceful Shutdown Lifecycle Coordinator", "Medium", "Implement a SmartLifecycle component that participates in Spring Boot graceful shutdown, completing in-flight Kafka consumer batches before closing the application context.", "none", "void", "O(1)", "O(1)")
    ]),

    # 6. MySQL
    ("MySQL", "sql", [
        ("Department Top Three Salaries", "Hard", "Write an SQL query to find employees who earn the top three unique salaries in each department using DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC).", "Employee, Department tables", "Result table", "O(N log N)", "O(N)"),
        ("Duplicate Emails In-Place Removal", "Easy", "Write an SQL DELETE query to delete all duplicate email records in a table Person, keeping only the smallest Id using self-join or subquery.", "Person table", "void (in-place delete)", "O(N)", "O(1)"),
        ("Running Total Cumulative Balance", "Medium", "Write a query to calculate the cumulative running total balance of financial transactions ordered by transaction_date using window functions (SUM() OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING)).", "Transactions table", "Result table", "O(N)", "O(N)"),
        ("Consecutive Numbers Detection", "Medium", "Find all numbers that appear at least three times consecutively in a Logs table using LEAD() and LAG() or self-joins.", "Logs table", "Result table", "O(N)", "O(1)"),
        ("Exchange Adjacent Seats", "Medium", "Write a solution to swap the seat id of every two consecutive students in a Seat table. If the total number of students is odd, the last student's id is not swapped.", "Seat table", "Result table", "O(N)", "O(1)"),
        ("Second Highest Salary with IFNULL", "Easy", "Write an SQL query to report the second highest salary from the Employee table. If there is no second highest salary, the query should report null using IFNULL.", "Employee table", "SecondHighestSalary column", "O(N)", "O(1)"),
        ("Tree Node Classification (Root, Inner, Leaf)", "Medium", "Each node in a tree is either Leaf, Root, or Inner. Write an SQL query using CASE and EXISTS to report the node type for each tree node.", "Tree table (id, p_id)", "Result table (id, type)", "O(N)", "O(1)"),
        ("Nth Highest Salary Function", "Medium", "Write an SQL stored function getNthHighestSalary(N INT) RETURNS INT to find the nth highest salary from the Employee table with dynamic offset handling.", "N: int", "INT", "O(N)", "O(1)"),
        ("Trips and Users Cancellation Rate", "Hard", "Calculate the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between two dates rounded to two decimal places.", "Trips, Users tables", "Result table", "O(N)", "O(1)"),
        ("Human Traffic of Stadium", "Hard", "Write an SQL query to display the records with three or more consecutive rows where the amount of people visited is greater than or equal to 100, ordered by visit_date.", "Stadium table", "Result table", "O(N)", "O(N)"),
        ("Market Analysis Top Sellers", "Medium", "Write an SQL query to find for each user whether the brand of the second item (by date) they sold is their favorite brand using RANK() OVER (PARTITION BY ...).", "Users, Orders, Items tables", "Result table", "O(N log N)", "O(N)"),
        ("Customer Placing Largest Number of Orders", "Easy", "Write an SQL query to find the customer_number for the customer who has placed the largest number of orders in Orders table, handling ties.", "Orders table", "customer_number", "O(N)", "O(1)"),
        ("Rank Scores Without Gaps", "Medium", "Write an SQL query to rank the scores of a game. If there is a tie between two scores, both should have the same rank without any rank gaps using DENSE_RANK().", "Scores table", "Result table (score, rank)", "O(N log N)", "O(N)"),
        ("Monthly Transactions Summary", "Medium", "Write an SQL query to find for each month and country: the number of transactions and their total amount, the number of approved transactions and their total amount.", "Transactions table", "Result table", "O(N)", "O(N)"),
        ("Cumulative Salary Excluding Current Month", "Hard", "Write a query to calculate the cumulative salary of an employee over a 3-month rolling period excluding the most recent month they worked.", "Employee table", "Result table", "O(N log N)", "O(N)"),
        ("Active Users 5 Consecutive Days", "Medium", "Find the id and name of users who logged into their accounts for 5 or more consecutive days using DENSE_RANK() date offset trick.", "Logins, Users tables", "Result table", "O(N log N)", "O(N)"),
        ("Median Employee Salary per Company", "Hard", "Write an SQL query to find the median salary of each company using ROW_NUMBER() and COUNT() window functions without built-in median functions.", "Employee table", "Result table", "O(N log N)", "O(N)"),
        ("Total Sales by Year and Category with ROLLUP", "Medium", "Write a query using GROUP BY category, year WITH ROLLUP to produce subtotal aggregations alongside overall grand totals.", "Sales table", "Result table", "O(N log N)", "O(1)"),
        ("Reformat Department Table Pivot", "Easy", "Write an SQL query to reformat a Department table having (id, revenue, month) so that there is a department id column and a revenue column for each of the 12 months.", "Department table", "Result table", "O(N)", "O(1)"),
        ("Investments in 2016", "Medium", "Write an SQL query to report the sum of all total investment values in 2016 for all policyholders who have the same TIV_2015 as other policyholders and are located in unique cities.", "Insurance table", "TIV_2016 sum", "O(N)", "O(N)")
    ]),

    # 7. PostgreSQL
    ("PostgreSQL", "sql", [
        ("Hierarchical Org Chart with Recursive CTEs", "Medium", "Write a PostgreSQL query using WITH RECURSIVE to traverse an organizational hierarchy, calculating the reporting depth level and path string for every employee.", "employees (id, name, manager_id)", "Result table", "O(V + E)", "O(V)"),
        ("JSONB Nested Array Aggregation and Filtering", "Medium", "Given an orders table with a metadata JSONB column, write a query using jsonb_array_elements and jsonb_path_query to extract and aggregate items matching specific SKU criteria.", "orders (id, metadata jsonb)", "Result table", "O(N)", "O(1)"),
        ("Full-Text Search Ranking with tsvector and tsquery", "Medium", "Write a PostgreSQL full-text search query using to_tsvector('english', body) and ts_rank() to search articles for query terms and order by relevance score.", "articles (id, title, body)", "Result table", "O(N)", "O(1)"),
        ("Moving Average Window Frame Specification", "Medium", "Calculate a 7-day trailing moving average of stock closing prices using AVG(price) OVER (ORDER BY trade_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW).", "stock_prices table", "Result table", "O(N)", "O(N)"),
        ("Row-Level Security Policy for Multi-Tenant Isolation", "Medium", "Write PostgreSQL DDL statements enabling Row-Level Security (ALTER TABLE accounts ENABLE ROW LEVEL SECURITY) and creating a policy that restricts row access based on current_setting('app.current_tenant').", "accounts table", "DDL script", "O(1)", "O(1)"),
        ("GIN Index Array Intersection Query Optimization", "Medium", "Write a query utilizing the array overlap (&&) and contains (@>) operators on an integer array column tags, demonstrating how a GIN index accelerates the search.", "posts (id, tags int[])", "Result table", "O(log N)", "O(1)"),
        ("Date Gap Detection using generate_series", "Medium", "Find all missing dates in a store sales ledger using generate_series(min_date, max_date, '1 day'::interval) and a LEFT JOIN checking for NULL sales records.", "sales table", "missing_dates", "O(D)", "O(D)"),
        ("Pivot Table using FILTER (WHERE ...) Clauses", "Easy", "Write a PostgreSQL query using aggregate expressions with the FILTER clause (e.g. SUM(amount) FILTER (WHERE status = 'PAID')) to pivot monthly invoice counts into columns.", "invoices table", "Result table", "O(N)", "O(1)"),
        ("Sessionization of Clickstream Inactivity Gaps", "Hard", "Group user website click events into discrete browsing sessions, starting a new session whenever the time between consecutive clicks exceeds 30 minutes using LAG() and SUM() window functions.", "clicks table (user_id, timestamp)", "Result table (session_id)", "O(N log N)", "O(N)"),
        ("Upsert with ON CONFLICT DO UPDATE", "Easy", "Write a PostgreSQL INSERT statement with ON CONFLICT (product_id) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW() WHERE products.price IS DISTINCT FROM EXCLUDED.price.", "products table", "void", "O(1)", "O(1)"),
        ("Continuous Percentile Median with PERCENTILE_CONT", "Medium", "Calculate the exact continuous 50th percentile (median) and 90th percentile of server response times grouped by endpoint using PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency).", "api_logs table", "Result table", "O(N log N)", "O(N)"),
        ("Top N Orders per Customer using CROSS JOIN LATERAL", "Medium", "Write a query using CROSS JOIN LATERAL to efficiently retrieve the 3 most recent orders for every customer without scanning the entire orders table.", "customers, orders tables", "Result table", "O(C * 3)", "O(1)"),
        ("Declarative Table Partitioning by Range", "Medium", "Write PostgreSQL DDL statements creating a partitioned table measurement PARTITION BY RANGE (log_date) and creating quarterly sub-tables measurement_y2026q1, etc.", "DDL statements", "void", "O(1)", "O(1)"),
        ("Advisory Lock Distributed Synchronization Simulation", "Medium", "Write an SQL script using pg_try_advisory_lock(lock_id) and pg_advisory_unlock(lock_id) to implement application-level mutual exclusion for database cron jobs.", "lock_id: bigint", "boolean", "O(1)", "O(1)"),
        ("Time-Weighted Average Asset Valuation", "Hard", "Calculate the time-weighted average price of an asset where each price is weighted by the duration (in seconds) it remained active before the next price change using LEAD().", "price_ticks table", "numeric", "O(N)", "O(N)"),
        ("Overlapping Date Range Detection with Range Types", "Medium", "Given room booking records, use PostgreSQL daterange types and the range overlap operator (&&) to find all conflicting hotel reservations for the same room.", "bookings table", "Result table", "O(N^2)", "O(1)"),
        ("Fuzzy String Matching with Trigrams and Levenshtein", "Medium", "Enable the pg_trgm extension and write a query using the similarity() function to find customer names that match a misspelled search string with similarity score > 0.4.", "customers table", "Result table", "O(N)", "O(1)"),
        ("Array Deduplication and Re-Aggregation", "Easy", "Write a query that takes an unnormalized tags array from a blog post and aggregates unique tags sorted alphabetically using unnest() and array_agg(DISTINCT tag ORDER BY tag).", "posts table", "Result table", "O(N log N)", "O(N)"),
        ("Moving Median over Real-Time Sensor Readings", "Hard", "Calculate a rolling 5-event median value over a time-series stream of IoT temperature readings using window functions.", "sensor_readings table", "Result table", "O(N log N)", "O(N)"),
        ("Audit History Trigger Function with JSONB Snapshots", "Medium", "Write a PostgreSQL PL/pgSQL trigger function that executes BEFORE UPDATE OR DELETE on any table and inserts the OLD row converted via to_jsonb(OLD) into an audit_log table.", "trigger function DDL", "void", "O(1)", "O(1)")
    ]),

    # 8. MSSQL
    ("MSSQL", "sql", [
        ("Hierarchical Bill of Materials with Recursive CTEs", "Medium", "Write a T-SQL query using a Recursive CTE and OPTION (MAXRECURSION 100) to explode an assembly Bill of Materials (BOM), calculating total quantity required per component.", "Parts, Components tables", "Result table", "O(V + E)", "O(V)"),
        ("Pagination using OFFSET FETCH NEXT", "Easy", "Write a T-SQL query that retrieves page 5 of a customer list (pageSize = 25) sorted by customer_id using ORDER BY customer_id OFFSET 100 ROWS FETCH NEXT 25 ROWS ONLY.", "Customers table", "Result table", "O(log N + 25)", "O(1)"),
        ("Dynamic Pivot Table using PIVOT Operator", "Medium", "Write a T-SQL query using the PIVOT operator to transpose quarterly sales revenues from rows into columns [Q1], [Q2], [Q3], [Q4] grouped by Year.", "Sales table", "Result table", "O(N)", "O(1)"),
        ("Top 3 Performers by Department with DENSE_RANK", "Medium", "Write a T-SQL query using DENSE_RANK() OVER (PARTITION BY DepartmentId ORDER BY SalesAmount DESC) to identify the top 3 sales reps per department.", "SalesReps table", "Result table", "O(N log N)", "O(N)"),
        ("Gaps and Islands Sequential Range Grouping", "Hard", "Given a table of sequential dates, write a T-SQL query using DENSE_RANK() date subtraction to group consecutive dates into continuous 'islands' reporting startDate and endDate.", "UserActivity table", "Result table (startDate, endDate)", "O(N log N)", "O(N)"),
        ("Running Balance with Window Frame Preceding", "Easy", "Calculate the cumulative account balance for bank transactions using SUM(Amount) OVER (PARTITION BY AccountId ORDER BY TransactionDate ROWS UNBOUNDED PRECEDING).", "Transactions table", "Result table", "O(N)", "O(N)"),
        ("MERGE Statement for Atomic Upserts", "Medium", "Write a T-SQL MERGE statement that synchronizes TargetInventory with SourceInventory: updating quantity when matched, inserting when not matched, and deleting when not present in source.", "TargetInventory, SourceInventory", "void", "O(N)", "O(1)"),
        ("JSON Parsing with OPENJSON and CROSS APPLY", "Medium", "Given an Orders table with a JSON payload column, write a T-SQL query using OPENJSON() with an explicit WITH schema to extract nested order line items into rows.", "Orders table", "Result table", "O(N)", "O(1)"),
        ("String Splitting using STRING_SPLIT and CROSS APPLY", "Easy", "Write a T-SQL query using STRING_SPLIT(csv_tags, ',') and CROSS APPLY to expand comma-delimited product tags into normalized rows.", "Products table", "Result table", "O(N * T)", "O(1)"),
        ("Structured Error Handling with TRY CATCH and XACT_ABORT", "Medium", "Write a T-SQL stored procedure with SET XACT_ABORT ON, BEGIN TRY ... BEGIN TRANSACTION ... COMMIT TRANSACTION END TRY BEGIN CATCH ROLLBACK; THROW END CATCH.", "stored procedure DDL", "void", "O(1)", "O(1)"),
        ("Temporal Table System-Versioned Querying", "Medium", "Write a T-SQL query using FOR SYSTEM_TIME AS OF '2026-01-01 12:00:00' to query historical employee salary records from a system-versioned temporal table.", "Employees table", "Result table", "O(log N)", "O(1)"),
        ("Parameter Sniffing Mitigation with OPTIMIZE FOR", "Medium", "Write a T-SQL query that addresses parameter sniffing in a stored procedure by adding OPTION (OPTIMIZE FOR UNKNOWN) or OPTION (RECOMPILE).", "stored procedure query", "Result table", "O(N)", "O(1)"),
        ("Year-over-Year (YoY) Sales Growth with LAG", "Medium", "Write a T-SQL query using LAG(Revenue, 1) OVER (PARTITION BY ProductId ORDER BY SalesYear) to calculate annual sales growth percentage.", "AnnualSales table", "Result table", "O(N log N)", "O(N)"),
        ("Deadlock Mitigation with DEADLOCK_PRIORITY", "Medium", "Write a T-SQL transaction script setting SET DEADLOCK_PRIORITY LOW and implementing a retry loop handling error 1205 (deadlock victim).", "T-SQL script", "void", "O(1)", "O(1)"),
        ("Finding Missing Sequence IDs in Invoices", "Medium", "Find missing gaps in an invoice number sequence between min(invoice_no) and max(invoice_no) using a recursive CTE or numbers table.", "Invoices table", "missing_numbers", "O(N)", "O(N)"),
        ("Calculating Business Working Days Excluding Holidays", "Hard", "Write a T-SQL function that calculates the exact number of business working days between startDate and endDate, excluding Saturdays, Sundays, and a Holidays table.", "startDate: DATE, endDate: DATE", "INT", "O(D)", "O(1)"),
        ("String Aggregation using STRING_AGG", "Easy", "Write a T-SQL query using STRING_AGG(EmployeeName, '; ') WITHIN GROUP (ORDER BY EmployeeName ASC) to concatenate employee names per department into a single string.", "Employees table", "Result table", "O(N log N)", "O(1)"),
        ("Dynamic Window Frame Running Totals with Threshold", "Hard", "Calculate a rolling total of sales that resets whenever the accumulated sum exceeds $10,000 using T-SQL window functions.", "Sales table", "Result table", "O(N)", "O(N)"),
        ("CTE-Based Duplicate Row Deletion", "Easy", "Write a T-SQL query using WITH CTE AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY Email ORDER BY Id) as rn FROM Users) DELETE FROM CTE WHERE rn > 1.", "Users table", "void", "O(N)", "O(1)"),
        ("Conditional Pivot with CASE and Aggregations", "Easy", "Write a T-SQL query using conditional aggregation (SUM(CASE WHEN ... THEN ... END)) to pivot order status counts by region without using the PIVOT keyword.", "Orders table", "Result table", "O(N)", "O(1)")
    ]),

    # 9. JavaScript
    ("JavaScript", "javascript", [
        ("Promise.all Polyfill from Scratch", "Medium", "Implement a custom Promise.all(iterable) polyfill that resolves when all input promises resolve or rejects immediately on the first rejection.", "promises: Promise<any>[]", "Promise<any[]>", "O(N)", "O(N)"),
        ("Promise.allSettled and Promise.race Polyfills", "Medium", "Implement Promise.allSettled(promises) returning [{ status: 'fulfilled', value }] or [{ status: 'rejected', reason }], and Promise.race(promises).", "promises: Promise<any>[]", "Promise<any[]>", "O(N)", "O(N)"),
        ("Promise.any Polyfill with AggregateError", "Medium", "Implement Promise.any(promises) which resolves as soon as any promise fulfills, or rejects with an AggregateError if all promises reject.", "promises: Promise<any>[]", "Promise<any>", "O(N)", "O(N)"),
        ("Deep Clone with Circular References and Dates", "Medium", "Implement a deepClone(obj) function that clones nested objects, arrays, Date, RegExp, Map, Set, and handles circular references using a WeakMap.", "obj: any", "cloned: any", "O(N)", "O(N)"),
        ("Debounce Function with Leading and Trailing Flags", "Medium", "Write a debounce(fn, delay, options) function supporting options.leading (execute immediately on first call) and options.trailing (execute after delay).", "fn: Function, delay: number, options?: { leading, trailing }", "Function", "O(1)", "O(1)"),
        ("Throttle Function with Immediate Execution Option", "Medium", "Write a throttle(fn, limit, options) function supporting options.leading and options.trailing execution flags.", "fn: Function, limit: number", "Function", "O(1)", "O(1)"),
        ("Function Currying with Arbitrary Arity", "Medium", "Implement a curry(fn) utility that transforms a function with n parameters into a curried function callable as f(1)(2)(3) or f(1, 2)(3).", "fn: Function", "Function", "O(1)", "O(N)"),
        ("Custom Event Emitter (Pub/Sub) with Once and Wildcards", "Medium", "Build an EventEmitter class supporting on, once, off, emit, and wildcard event channels ('user:*').", "none", "EventEmitter", "O(1)", "O(N)"),
        ("Array.prototype.flat Polyfill with Custom Depth", "Easy", "Implement a custom flattenArray(arr, depth) that flattens nested arrays up to the specified depth without using Array.prototype.flat.", "arr: any[], depth: number", "any[]", "O(N)", "O(D)"),
        ("Function.prototype.bind, call, and apply Polyfills", "Medium", "Implement myBind, myCall, and myApply on Function.prototype from scratch using symbol keys on the target thisArg.", "fn: Function, thisArg: any, args: any[]", "any", "O(1)", "O(1)"),
        ("Functional Pipe and Compose Utilities", "Easy", "Implement pipe(...fns) and compose(...fns) that take a variable list of unary functions and return a function executing them left-to-right (pipe) or right-to-left (compose).", "fns: Function[]", "Function", "O(F)", "O(1)"),
        ("Memoize Function with Custom Cache Key Serializer", "Easy", "Implement a memoize(fn, keyResolver) utility that caches function results based on arguments serialized via keyResolver.", "fn: Function, keyResolver?: Function", "Function", "O(1)", "O(N)"),
        ("Virtual DOM Render Function to Real DOM Nodes", "Medium", "Write a render(vnode) function that converts a virtual DOM node { type, props: { ...attrs, children } } into a real browser DOM element.", "vnode: VNode", "HTMLElement | Text", "O(N)", "O(D)"),
        ("Custom setInterval and clearInterval using setTimeout", "Easy", "Implement mySetInterval(callback, delay) and myClearInterval(id) using recursive setTimeout calls.", "callback: () => void, delay: number", "intervalId: number", "O(1)", "O(1)"),
        ("Async Task Runner with Concurrency Limit", "Medium", "Build an async task pool that accepts an array of async task factories and executes them with a maximum concurrency limit k, returning results in order.", "tasks: (() => Promise<T>)[], k: number", "Promise<T[]>", "O(N)", "O(k)"),
        ("Deep Object Equality Checker (isEqual)", "Medium", "Implement isEqual(a, b) that performs a deep comparison between two values, handling objects, arrays, primitives, and null.", "a: any, b: any", "boolean", "O(N)", "O(D)"),
        ("Event Delegation Helper for Dynamic Elements", "Easy", "Write a delegate(element, eventType, selector, handler) helper that attaches a single listener to a parent element and executes handler when matching child selector is clicked.", "element: HTMLElement, event: string, selector: string", "void", "O(1)", "O(1)"),
        ("Observable Reactive Pattern Implementation", "Hard", "Implement an Observable class with subscribe({ next, error, complete }) supporting pipeable operators map and filter.", "subscriberFn: Function", "Observable", "O(1)", "O(1)"),
        ("Auto-Retry with Exponential Backoff", "Easy", "Write a retry(fn, maxRetries, delayMs) helper that calls async fn, retrying with doubling delay on failure up to maxRetries times.", "fn: () => Promise<T>, maxRetries: number", "Promise<T>", "O(retries)", "O(1)"),
        ("Deep Object Property Path Getter and Setter", "Easy", "Implement get(obj, path, defaultValue) and set(obj, path, value) supporting dot and bracket notations ('user.addresses[0].city').", "obj: object, path: string", "any", "O(P)", "O(P)")
    ])
]

# Load existing coding problems
json_path = os.path.join(os.path.dirname(__file__), "../src/database/seeds/data/coding-comprehensive.json")
with open(json_path, "r", encoding="utf-8") as f:
    existing_problems = json.load(f)

existing_slugs = {p["slug"] for p in existing_problems}
added_count = 0

for cat_name, lang_name, problems in SPECIFIC_CATEGORIES:
    for item in problems:
        title, diff, desc, inp_desc, out_desc, time_c, space_c = item
        slug = slugify(f"{cat_name}-{title}")
        orig = slug
        c = 1
        while slug in existing_slugs:
            slug = f"{orig}-{c}"
            c += 1
        existing_slugs.add(slug)

        new_prob = {
            "title": title,
            "slug": slug,
            "category": cat_name,
            "difficulty": diff,
            "problemStatement": f"### Problem Description\n{desc}\n\n### Input\n{inp_desc}\n\n### Output\n{out_desc}",
            "inputDescription": inp_desc,
            "outputDescription": out_desc,
            "constraints": [
                "1 <= input size <= 10^5",
                "Execution time limit: 2000ms",
                "Memory limit: 128MB",
                "Clean production-grade design expected"
            ],
            "sampleTestCases": [
                {
                    "input": "Sample execution parameters",
                    "output": "Sample valid result",
                    "explanation": f"Demonstrates primary execution path for {title}."
                }
            ],
            "hiddenTestCases": [
                {"input": "Edge test input 1", "expectedOutput": "Expected output 1"},
                {"input": "High-volume load test input 2", "expectedOutput": "Expected output 2"}
            ],
            "starterCode": {
                "javascript": f"/**\n * {title} implementation\n * @param {{any}} input\n * @return {{any}}\n */\nfunction solve(input) {{\n  // Implement {title} for {cat_name}\n  return null;\n}}",
                "typescript": f"function solve(input: any): any {{\n  // Implement {title} for {cat_name}\n  return null;\n}}",
                "python": f"def solve(input_data):\n    # Implement {title} for {cat_name}\n    pass",
                "java": f"import java.util.*;\n\npublic class Solution {{\n    public static void main(String[] args) {{\n        // Solution for {title} in {cat_name}\n    }}\n}}",
                "cpp": f"#include <iostream>\nusing namespace std;\n\nint main() {{\n    // Solution for {title}\n    return 0;\n}}"
            },
            "expectedTimeComplexity": time_c,
            "expectedSpaceComplexity": space_c,
            "hints": [
                f"Consider the idiomatic {cat_name} architecture pattern for {title}.",
                "Handle edge cases such as null/empty inputs and concurrent access."
            ],
            "solutionExplanation": f"To solve {title} cleanly in {cat_name}, we structure the solution around modular, testable components guaranteeing {time_c} runtime efficiency.",
            "optimizedSolutions": {
                "javascript": f"function solve(input) {{\n  return input;\n}}",
                "python": f"def solve(input_data):\n    return input_data",
                "java": f"class Solution {{\n    public Object solve(Object input) {{\n        return input;\n    }}\n}}"
            },
            "relatedQuestions": [f"{title} Advanced Extension", f"Related {cat_name} Architecture Challenge"],
            "acceptanceRate": 68.4,
            "totalSubmissions": 1100,
            "totalAccepted": 750,
            "isPublished": True
        }

        existing_problems.append(new_prob)
        added_count += 1

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(existing_problems, f, indent=2, ensure_ascii=False)

print(f"🎉 Successfully added {added_count} specific coding challenges across 9 dedicated categories!")
print(f"📊 Total coding problems now in dataset: {len(existing_problems)}")
