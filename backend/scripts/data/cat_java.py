"""
Java & Spring Ecosystem Category Data: Java, Spring Boot, Spring Framework, Hibernate, Spring Security, JPA
"""

JAVA_ECOSYSTEM = [
    {
        "category": "Java",
        "subcategory": "Core Java & JVM Concurrency",
        "lang": "java",
        "questions": [
            {
                "title": "How does HashMap work internally in Java 8+ and how was treeification implemented?",
                "shortAnswer": "HashMap uses an array of Node buckets indexed by (n-1)&hash. If collisions in a bucket reach TREEIFY_THRESHOLD (8) and table capacity >= 64, it transforms into a Red-Black Tree (TreeNode), reducing worst-case lookup from O(n) to O(log n).",
                "detailedExplanation": "In Java 8, hash collisions degrade to balanced Red-Black trees rather than linear linked lists to prevent Hash Collision DoS attacks. The table resizes when size > capacity * loadFactor (default 0.75). During resizing, elements either stay at their current index or move by oldCapacity using bitwise checks without re-hashing.",
                "realWorldExample": "High-throughput caches in e-commerce microservices with thousands of customer key lookups where hash collisions would otherwise spike CPU usage to 100%.",
                "implementationExample": "public class UserCache {\n    private final Map<String, User> cache = new HashMap<>(128, 0.75f);\n    public User get(String id) { return cache.get(id); }\n}",
                "codeSnippet": "if (binCount >= TREEIFY_THRESHOLD - 1) treeifyBin(tab, hash);",
                "commonMistakes": ["Thinking treeification occurs at 8 elements even when table capacity is under 64.", "Using mutable keys whose hashCode changes after insertion."],
                "followUpQuestions": ["Why is table capacity always a power of 2?", "What happens to the tree during untreeification (threshold 6)?"],
                "interviewTips": ["Highlight the bitmask formula: index = (n - 1) & hash.", "Explain the hysteresis gap between 8 (treeify) and 6 (untreeify)."]
            },
            {
                "title": "How does ConcurrentHashMap achieve lock striping and thread safety in Java 8+?",
                "shortAnswer": "Java 8+ ConcurrentHashMap replaced Java 7 Segments with lock-free CAS on empty bucket insertion and synchronized locking on individual bucket heads. Reads are completely lock-free via volatile pointers.",
                "detailedExplanation": "Reads (get) never block because Node values and next pointers are volatile. For writes (put): 1. If bucket is empty, CAS (casTabAt) inserts the node. 2. If bucket is populated, synchronized(headNode) locks only that bucket. Resizing is collaborative across threads using ForwardingNodes. CounterCell striping handles size counting without contention.",
                "realWorldExample": "Financial trading order books and real-time gaming state servers where hundreds of threads update distinct key partitions simultaneously with zero lock contention.",
                "implementationExample": "ConcurrentMap<String, LongAdder> metrics = new ConcurrentHashMap<>();\npublic void record(String metric) { metrics.computeIfAbsent(metric, k -> new LongAdder()).increment(); }",
                "codeSnippet": "if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value))) break;\nelse synchronized (f) { /* insert in bucket */ }",
                "commonMistakes": ["Assuming ConcurrentHashMap allows null keys or values (throws NPE).", "Using putIfAbsent when computeIfAbsent is required for atomicity."],
                "followUpQuestions": ["Why are null keys disallowed in ConcurrentHashMap?", "What is a ForwardingNode during concurrent table resizing?"],
                "interviewTips": ["Point out that CAS avoids kernel lock context switches for empty buckets.", "Mention LongAdder striping for concurrent size calculations."]
            },
            {
                "title": "Compare JVM Garbage Collectors: G1GC vs ZGC vs Shenandoah.",
                "shortAnswer": "G1GC is a regionalized generational collector balancing throughput and pause targets (-XX:MaxGCPauseMillis). ZGC and Shenandoah are concurrent low-latency collectors with sub-millisecond pause times regardless of heap size.",
                "detailedExplanation": "G1 divides the heap into 2048 regions (Eden, Survivor, Old) and collects highest garbage yield regions first. ZGC uses Colored Pointers (reference bits encoding GC metadata) and Load Barriers to relocate objects concurrently without stopping application threads. Shenandoah uses Brooks Pointers / Load-Reference Barriers for concurrent compaction.",
                "realWorldExample": "Large-scale banking systems with 64GB+ heaps where G1GC pause spikes of 250ms cause client connection drops, whereas ZGC achieves <1ms pause times.",
                "implementationExample": "// JVM arguments for low-latency Java 21 service\n// java -XX:+UseZGC -XX:+ZGenerational -Xms32g -Xmx32g -jar trading-service.jar",
                "codeSnippet": "for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {\n    System.out.println(\"Active GC: \" + gc.getName());\n}",
                "commonMistakes": ["Assuming ZGC has higher throughput than Parallel GC (it trades some throughput for zero pause times).", "Setting MaxGCPauseMillis unrealistically low with G1GC."],
                "followUpQuestions": ["How do Load Barriers work in ZGC?", "What is Generational ZGC in Java 21?"],
                "interviewTips": ["Highlight that ZGC pauses do not scale with heap size (16MB to 16TB).", "Explain colored pointer bits in 64-bit architectures."]
            },
            {
                "title": "Explain ThreadPoolExecutor architecture, queue sizing, and rejection policies.",
                "shortAnswer": "ThreadPoolExecutor manages corePoolSize, maximumPoolSize, and a BlockingQueue. When tasks exceed core threads, they enqueue; when the queue fills, extra threads spawn up to max. If max threads are busy and queue is full, RejectedExecutionHandler triggers.",
                "detailedExplanation": "Four built-in rejection policies: 1. AbortPolicy (throws RejectedExecutionException). 2. CallerRunsPolicy (calling thread executes task, creating natural backpressure). 3. DiscardPolicy (silently drops task). 4. DiscardOldestPolicy (drops oldest unhandled task).",
                "realWorldExample": "Payment webhook ingestion where sudden traffic spikes must not trigger OutOfMemoryError; CallerRunsPolicy throttles incoming HTTP request producers naturally.",
                "implementationExample": "ThreadPoolExecutor executor = new ThreadPoolExecutor(4, 16, 60L, TimeUnit.SECONDS,\n    new ArrayBlockingQueue<>(1000),\n    new ThreadFactoryBuilder().setNameFormat(\"async-%d\").build(),\n    new ThreadPoolExecutor.CallerRunsPolicy());",
                "codeSnippet": "executor.submit(() -> processPayment(payment));\nexecutor.shutdown();\nif (!executor.awaitTermination(30, TimeUnit.SECONDS)) executor.shutdownNow();",
                "commonMistakes": ["Using Executors.newFixedThreadPool() which uses unbounded LinkedBlockingQueue causing OOM.", "Forgetting to gracefully shut down executors."],
                "followUpQuestions": ["What is the difference between execute() and submit()?", "How does SynchronousQueue behave inside ThreadPoolExecutor?"],
                "interviewTips": ["Always recommend bounded queues and CallerRunsPolicy for production resilience.", "Explain why Executors utility class is avoided in high-volume production systems."]
            },
            {
                "title": "How does CompletableFuture enable non-blocking asynchronous programming?",
                "shortAnswer": "CompletableFuture implements Future and CompletionStage, enabling functional composition of asynchronous tasks using thenApply (map), thenCompose (flat-map), and thenCombine (merge). Exception handling is handled via exceptionally and handle.",
                "detailedExplanation": "CompletableFuture runs tasks asynchronously via an explicit Executor or ForkJoinPool.commonPool(). unlike Future.get() which blocks the calling thread, CompletionStage callbacks execute reactively when upstream computations complete. allOf() waits for multiple futures in parallel.",
                "realWorldExample": "Aggregating a user dashboard by concurrently querying User Profile, Order History, and Loyalty Points microservices within a 150ms budget.",
                "implementationExample": "CompletableFuture<User> uF = CompletableFuture.supplyAsync(() -> userService.get(id), pool);\nCompletableFuture<Orders> oF = CompletableFuture.supplyAsync(() -> orderService.get(id), pool);\nCompletableFuture<Dashboard> dF = uF.thenCombine(oF, (u, o) -> new Dashboard(u, o));",
                "codeSnippet": "CompletableFuture.allOf(futureA, futureB).thenAccept(v -> logger.info(\"All completed\"));",
                "commonMistakes": ["Calling .get() or .join() prematurely inside async chains, destroying non-blocking benefits.", "Not passing a dedicated ThreadPool to supplyAsync, starving common ForkJoinPool."],
                "followUpQuestions": ["What is the difference between thenApply and thenCompose?", "How does exceptionally() differ from handle()?"],
                "interviewTips": ["Show how thenCompose prevents nested CompletableFuture<CompletableFuture<T>>.", "Highlight pass-through of custom ThreadPool to async methods."]
            },
            {
                "title": "What are Virtual Threads in Java 21 and what causes Carrier Thread Pinning?",
                "shortAnswer": "Virtual Threads (Project Loom) are lightweight user-mode threads managed by the JVM over OS carrier threads. Pinning occurs when a virtual thread blocks inside a synchronized block or native method, preventing JVM unmounting.",
                "detailedExplanation": "Platform threads consume 1MB OS stack memory; virtual threads use dynamic heap memory (~few KB). When a virtual thread performs blocking I/O, JVM unmounts its continuation to the heap and reassigns the carrier thread. Pinning prevents unmounting, stalling the OS carrier thread.",
                "realWorldExample": "High-throughput web APIs handling 100,000 concurrent long-polling HTTP connections without running out of OS thread handles or using complex reactive frameworks.",
                "implementationExample": "try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 10_000).forEach(i -> executor.submit(() -> doBlockingIo(i)));\n}",
                "codeSnippet": "Thread vThread = Thread.ofVirtual().name(\"v-worker-\", 0).start(() -> handleRequest());",
                "commonMistakes": ["Pooling virtual threads (virtual threads are cheap and should be created per task, never pooled).", "Using synchronized instead of ReentrantLock in blocking critical sections."],
                "followUpQuestions": ["How do you detect pinned virtual threads using -Djdk.tracePinnedThreads?", "How does continuation unmounting work in Project Loom?"],
                "interviewTips": ["Emphasize: 'Never pool virtual threads; create and discard them.'", "Explain replacing synchronized with ReentrantLock for virtual thread compatibility."]
            },
            {
                "title": "Explain Java Memory Model (JMM), volatile semantics, and happens-before relationships.",
                "shortAnswer": "JMM defines visibility, ordering, and atomicity across threads. volatile guarantees visibility (immediate flush to main memory) and ordering (prevents instruction reordering via memory barriers), but does NOT guarantee atomicity.",
                "detailedExplanation": "Without volatile, CPU register caching and out-of-order execution allow threads to see stale variable states. volatile inserts memory barriers (LoadLoad, LoadStore, StoreStore, StoreLoad). The happens-before relationship guarantees that actions in one thread are visible to another.",
                "realWorldExample": "Thread cancellation flags (private volatile boolean running = true) or Double-Checked Locking in lazy Singleton initialization.",
                "implementationExample": "public class WorkerService {\n    private volatile boolean isRunning = true;\n    public void stop() { isRunning = false; }\n    public void run() { while (isRunning) { doWork(); } }\n}",
                "codeSnippet": "private static volatile Singleton instance;\npublic static Singleton getInstance() {\n    if (instance == null) {\n        synchronized (Singleton.class) { if (instance == null) instance = new Singleton(); }\n    }\n    return instance;\n}",
                "commonMistakes": ["Assuming volatile int count; count++ is thread-safe (increment is 3 non-atomic operations).", "Omitting volatile in double-checked locking causing partially constructed object visibility."],
                "followUpQuestions": ["What are the four types of memory barriers in JMM?", "How does VarHandle in Java 9+ extend volatile semantics?"],
                "interviewTips": ["Break down count++ into read, modify, write to prove why volatile lacks atomicity.", "Explain why Double-Checked Locking requires both synchronized and volatile."]
            },
            {
                "title": "Explain Java Streams internals: Spliterators, Lazy Evaluation, and parallelStream risks.",
                "shortAnswer": "Java Streams are lazy functional pipelines driven by Spliterators. Intermediate operations are queued into Stage objects; nothing executes until a terminal operation is called. parallelStream() uses ForkJoinPool.commonPool() where blocking I/O can starve the entire JVM.",
                "detailedExplanation": "Spliterators partition data via trySplit() for parallel execution. Intermediate operations can be stateless (filter, map) or stateful (sorted, distinct). parallelStream() is designed exclusively for CPU-bound computations, not network/DB I/O.",
                "realWorldExample": "In-memory transformation and statistical aggregation of 100,000 financial trade records across multi-core CPU architectures.",
                "implementationExample": "List<TradeDTO> highValueTrades = trades.stream()\n    .filter(t -> t.getAmount() > 50_000)\n    .map(TradeDTO::fromEntity)\n    .toList();",
                "codeSnippet": "ForkJoinPool customPool = new ForkJoinPool(4);\ncustomPool.submit(() -> data.parallelStream().map(this::process).toList()).get();",
                "commonMistakes": ["Executing blocking HTTP/DB calls in parallelStream(), stalling the common ForkJoinPool.", "Modifying the backing collection during stream iteration (ConcurrentModificationException)."],
                "followUpQuestions": ["What characteristics can a Spliterator have (SIZED, ORDERED, DISTINCT, SORTED)?", "What is the difference between findFirst() and findAny() in parallel streams?"],
                "interviewTips": ["Highlight that streams are lazy: elements are pulled through the pipeline only when the terminal operation runs.", "Warn against parallelStream() with blocking I/O."]
            },
            {
                "title": "Explain Java 17 & 21 Features: Sealed Classes, Records, and Pattern Matching.",
                "shortAnswer": "Records are immutable transparent data carriers. Sealed Classes restrict which classes may extend or implement them using permits. Pattern matching allows switch statements to perform compile-time exhaustive type matching without a default clause.",
                "detailedExplanation": "Records automatically generate constructors, accessors, equals, hashCode, and toString. Sealed hierarchies enforce algebraic sum types. When switching over a sealed class, the compiler verifies that every permitted subtype is handled.",
                "realWorldExample": "Modeling domain payment types (CardPayment, UpiPayment, NetBanking) where the compiler enforces handling of all payment methods across the checkout workflow.",
                "implementationExample": "public sealed interface Payment permits CardPayment, UpiPayment {}\npublic record CardPayment(String cardNum, String cvv) implements Payment {}\npublic record UpiPayment(String vpa) implements Payment {}\n\npublic String route(Payment p) {\n    return switch (p) {\n        case CardPayment c -> \"Processing card: \" + c.cardNum();\n        case UpiPayment u -> \"Processing UPI: \" + u.vpa();\n    };\n}",
                "codeSnippet": "public record Money(BigDecimal amount, String currency) {\n    public Money { if (amount.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException(); }\n}",
                "commonMistakes": ["Declaring non-final fields in Records.", "Forgetting that subclasses of sealed classes must be declared final, sealed, or non-sealed."],
                "followUpQuestions": ["What is a non-sealed class?", "How does the compact constructor in records work?"],
                "interviewTips": ["Mention that sealed classes provide algebraic data types (sum types) directly in Java.", "Explain how pattern matching eliminates clumsy instanceof casts."]
            },
            {
                "title": "Explain ClassLoader Hierarchy, Delegation Model, and ClassLoader Memory Leaks.",
                "shortAnswer": "Java uses parent-first delegation (Bootstrap -> Platform -> Application). A ClassLoader checks with its parent before loading a class. Memory leaks occur when classes loaded by a custom ClassLoader are held by ThreadLocals or static references.",
                "detailedExplanation": "Bootstrap loads core java.base classes; Platform loads JDK platform modules; Application loads user classpath classes. When a custom ClassLoader loads classes, if any object of those classes is held in memory, the entire ClassLoader and its Metaspace cannot be collected.",
                "realWorldExample": "Tomcat or OSGi container hot-reloading where unclosed ThreadLocals prevent the WebAppClassLoader from being garbage collected upon undeployment, causing Metaspace OOM.",
                "implementationExample": "ClassLoader cl = MyService.class.getClassLoader();\nwhile (cl != null) {\n    System.out.println(cl.getName());\n    cl = cl.getParent();\n}",
                "codeSnippet": "public class CustomClassLoader extends ClassLoader {\n    protected Class<?> findClass(String name) throws ClassNotFoundException {\n        byte[] bytes = loadBytes(name);\n        return defineClass(name, bytes, 0, bytes.length);\n    }\n}",
                "commonMistakes": ["Leaving ThreadLocal references active in web application threads after request completion.", "Assuming two classes with the same name from different ClassLoaders are equal."],
                "followUpQuestions": ["How does Tomcat achieve child-first class loading?", "What causes java.lang.OutOfMemoryError: Metaspace?"],
                "interviewTips": ["Draw the three-tier delegation tree: Bootstrap -> Platform -> Application.", "Explain that class identity in JVM is (ClassLoader instance, fully qualified name)."]
            },
            {
                "title": "Explain Type Erasure in Java Generics and the PECS Principle.",
                "shortAnswer": "Type erasure removes generic type parameters at compile time, replacing them with Object (or bounds) and synthetic bridge methods. PECS stands for 'Producer Extends, Consumer Super': use <? extends T> when reading, and <? super T> when writing.",
                "detailedExplanation": "Generics are invariant (List<String> is not a List<Object>). Arrays are covariant (String[] is Object[]). PECS enables safe variance: <? extends T> produces elements safely (read-only), while <? super T> consumes elements safely (write-only).",
                "realWorldExample": "Designing reusable collection utilities like Collections.copy(List<? super T> dest, List<? extends T> src) where source produces and destination consumes.",
                "implementationExample": "public static <T> void copy(List<? super T> dest, List<? extends T> src) {\n    for (T item : src) dest.add(item);\n}",
                "codeSnippet": "List<? extends Number> nums = new ArrayList<Integer>();\nNumber n = nums.get(0); // OK: Producer\n// nums.add(10); // COMPILE ERROR: cannot write to producer!",
                "commonMistakes": ["Trying to instantiate generic types (new T() or new T[10]) which fails due to erasure.", "Assuming List<Integer> can be passed to a method expecting List<Number>."],
                "followUpQuestions": ["What is a synthetic bridge method generated by javac?", "Why are arrays covariant while generics are invariant in Java?"],
                "interviewTips": ["State the rule crisply: Producer Extends, Consumer Super.", "Mention that type erasure maintained binary compatibility with pre-Java 5 bytecode."]
            },
            {
                "title": "Compare synchronized vs ReentrantLock vs StampedLock in Java Concurrency.",
                "shortAnswer": "synchronized is a built-in monitor lock with automatic release. ReentrantLock adds explicit lock/unlock, tryLock timeouts, fairness, and Conditions. StampedLock introduces Optimistic Reads via validation stamps for maximum read throughput.",
                "detailedExplanation": "ReentrantLock prevents deadlocks via tryLock(timeout) and supports multiple Condition variables. StampedLock is NOT reentrant; its tryOptimisticRead() reads fields without acquiring any lock, validating the stamp afterwards to ensure no write occurred.",
                "realWorldExample": "Financial ledgers or coordinate tracking where 99% of requests read balances and 1% update; StampedLock optimistic reads eliminate lock contention.",
                "implementationExample": "private final StampedLock sl = new StampedLock();\nprivate double x, y;\npublic double distance() {\n    long stamp = sl.tryOptimisticRead();\n    double cx = x, cy = y;\n    if (!sl.validate(stamp)) {\n        stamp = sl.readLock();\n        try { cx = x; cy = y; } finally { sl.unlockRead(stamp); }\n    }\n    return Math.hypot(cx, cy);\n}",
                "codeSnippet": "if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {\n    try { doWork(); } finally { lock.unlock(); }\n}",
                "commonMistakes": ["Forgetting to unlock ReentrantLock in a finally block.", "Attempting reentrant locking with StampedLock (causes self-deadlock)."],
                "followUpQuestions": ["Why is StampedLock not reentrant?", "How do Condition variables replace Object.wait() and notify()?"],
                "interviewTips": ["Walk through the optimistic read flow: tryOptimisticRead -> read -> validate -> fallback.", "Explain that synchronized has become extremely fast in uncontended scenarios."]
            },
            {
                "title": "Explain Java NIO vs BIO (Selectors, Channels, ByteBuffers) and epoll underneath.",
                "shortAnswer": "BIO uses one OS thread per connection, causing thread exhaustion under high concurrency. NIO multiplexes thousands of Channels over a single Selector thread using OS event loops (Linux epoll / macOS kqueue). ByteBuffers manage data transfer.",
                "detailedExplanation": "A Channel is an open connection to a socket or file. A ByteBuffer tracks position, limit, and capacity. Methods: put() writes, flip() switches to read mode, get() reads, compact() preserves unread bytes, clear() resets pointers. epoll_wait notifies the Selector when channels are ready.",
                "realWorldExample": "High-performance network engines like Netty, Tomcat NIO connector, and Apache Kafka broker message handlers.",
                "implementationExample": "Selector selector = Selector.open();\nServerSocketChannel server = ServerSocketChannel.open();\nserver.bind(new InetSocketAddress(8080));\nserver.configureBlocking(false);\nserver.register(selector, SelectionKey.OP_ACCEPT);",
                "codeSnippet": "while (selector.select() > 0) {\n    for (SelectionKey key : selector.selectedKeys()) {\n        if (key.isReadable()) readData((SocketChannel) key.channel());\n    }\n}",
                "commonMistakes": ["Forgetting buffer.flip() before reading from a ByteBuffer.", "Running heavy blocking computations on the Selector thread, stalling all managed sockets."],
                "followUpQuestions": ["What is zero-copy file transfer using FileChannel.transferTo()?", "Why is epoll O(1) compared to select() O(n)?"],
                "interviewTips": ["Trace ByteBuffer state across write, flip, read, clear.", "Mention zero-copy transferTo leveraging Linux sendfile system call."]
            },
            {
                "title": "Explain Reference Types in Java: Strong, Soft, Weak, and Phantom References.",
                "shortAnswer": "Strong references prevent GC. SoftReferences are cleared only before OutOfMemoryError (caching). WeakReferences are cleared on the next GC cycle (WeakHashMap). PhantomReferences track post-mortem object destruction via ReferenceQueue (off-heap cleanup).",
                "detailedExplanation": "SoftReference: cleared when JVM is low on memory. WeakReference: cleared immediately by GC. PhantomReference: get() always returns null; enqueued in ReferenceQueue after object finalization, used for safe native resource reclamation.",
                "realWorldExample": "In-memory image caches where large bitmaps are retained while memory is abundant but reclaimed automatically before OOM occurs.",
                "implementationExample": "WeakReference<Context> ref = new WeakReference<>(context);\nContext c = ref.get();\nif (c != null) { /* use context */ }",
                "codeSnippet": "ReferenceQueue<Object> q = new ReferenceQueue<>();\nPhantomReference<NativeBuffer> phantom = new PhantomReference<>(buffer, q);",
                "commonMistakes": ["Using SoftReference for mission-critical state that cannot tolerate nulls.", "Calling phantomRef.get() expecting the target object (it always returns null)."],
                "followUpQuestions": ["How does WeakHashMap automatically purge expired keys?", "How does Java 9 Cleaner replace deprecated finalize()?"],
                "interviewTips": ["Contrast SoftReference (memory pressure) vs WeakReference (next GC).", "Explain why PhantomReference is essential for off-heap buffer cleanup."]
            },
            {
                "title": "Explain SOLID Principles with modern Java refactoring examples.",
                "shortAnswer": "SOLID: Single Responsibility (one reason to change), Open/Closed (extend via interfaces without editing code), Liskov Substitution (subtypes must honor supertype contracts), Interface Segregation (small role interfaces), Dependency Inversion (depend on abstractions).",
                "detailedExplanation": "SRP separates business logic, persistence, and formatting. OCP uses Strategy or Factory patterns. LSP ensures subclasses do not throw unexpected exceptions or tighten constraints. ISP splits fat interfaces. DIP leverages Spring IoC for dependency decoupling.",
                "realWorldExample": "Refactoring an OrderService that handled tax calculation, payment processing, inventory reservation, and PDF generation into decoupled, individually testable services.",
                "implementationExample": "public interface DiscountStrategy { BigDecimal apply(BigDecimal amount); }\n@Component\npublic class VipDiscount implements DiscountStrategy {\n    public BigDecimal apply(BigDecimal a) { return a.multiply(BigDecimal.valueOf(0.8)); }\n}\npublic class OrderProcessor {\n    private final DiscountStrategy discountStrategy;\n    public OrderProcessor(DiscountStrategy s) { this.discountStrategy = s; }\n}",
                "codeSnippet": "// Interface Segregation: split fat printer into targeted interfaces\npublic interface Printer { void print(); }\npublic interface Scanner { void scan(); }",
                "commonMistakes": ["Using god classes that violate SRP.", "Subclasses throwing UnsupportedOperationException on inherited methods (violates LSP)."],
                "followUpQuestions": ["How does Spring Dependency Injection fulfill Dependency Inversion?", "Why should composition be favored over inheritance in SOLID designs?"],
                "interviewTips": ["Walk through a concrete before-and-after refactoring example.", "Emphasize how SOLID directly improves unit testability with mocks."]
            },
            {
                "title": "Explain GoF Design Patterns in Java: Singleton, Factory, Builder, Observer, Strategy, Decorator.",
                "shortAnswer": "Creational: Singleton (single instance via Bill Pugh or Enum), Factory (decouples instantiation), Builder (constructs complex objects). Behavioral: Strategy (interchangeable algorithms), Observer (event notification). Structural: Decorator (dynamic feature extension).",
                "detailedExplanation": "Bill Pugh Singleton uses a private static inner class for lazy, thread-safe initialization without synchronized overhead. Builder pattern enforces immutability and validates required parameters. Strategy pattern replaces complex if-else chains with polymorphic execution.",
                "realWorldExample": "Java runtime examples: Runtime.getRuntime() (Singleton), Calendar.getInstance() (Factory), StringBuilder (Builder), Collections.unmodifiableList() (Decorator), Comparator (Strategy).",
                "implementationExample": "// Bill Pugh Singleton\npublic class DatabaseConnection {\n    private DatabaseConnection() {}\n    private static class Holder { private static final DatabaseConnection INSTANCE = new DatabaseConnection(); }\n    public static DatabaseConnection getInstance() { return Holder.INSTANCE; }\n}",
                "codeSnippet": "// Builder Pattern with immutability\npublic class UserDTO {\n    private final String name, email;\n    private UserDTO(Builder b) { this.name = b.name; this.email = b.email; }\n    public static class Builder {\n        private String name, email;\n        public Builder name(String n) { this.name = n; return this; }\n        public Builder email(String e) { this.email = e; return this; }\n        public UserDTO build() { return new UserDTO(this); }\n    }\n}",
                "commonMistakes": ["Singleton breakages via Reflection, Serialization, or Cloning (Enum singleton prevents all three).", "Overusing Decorator causing deep object nesting and debugging complexity."],
                "followUpQuestions": ["Why is Enum the most robust way to implement a Singleton in Java?", "How does the Decorator pattern differ from the Proxy pattern?"],
                "interviewTips": ["Cite standard JDK examples for each pattern (e.g. InputStream as Decorator, Comparator as Strategy).", "Explain the thread safety of the Bill Pugh Holder idiom."]
            }
        ]
    },
    {
        "category": "Spring Boot",
        "subcategory": "Architecture & Production Internals",
        "lang": "java",
        "questions": [
            {
                "title": "Explain Spring Boot Auto-Configuration internals: @EnableAutoConfiguration and Conditionals.",
                "shortAnswer": "Spring Boot auto-configuration scans META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports (or spring.factories in v2) and conditionally registers beans based on classpath, properties, and existing beans using @ConditionalOnClass, @ConditionalOnProperty, etc.",
                "detailedExplanation": "@SpringBootApplication combines @Configuration, @EnableAutoConfiguration, and @ComponentScan. Auto-configuration classes evaluate conditional annotations. If conditions pass (e.g., DataSource is on classpath and no custom DataSource bean exists via @ConditionalOnMissingBean), Spring Boot configures the default bean.",
                "realWorldExample": "Spring Boot automatically configuring HikariCP DataSource and Hibernate EntityManagerFactory as soon as mysql-connector-j and spring-boot-starter-data-jpa are present in pom.xml.",
                "implementationExample": "@Configuration\n@ConditionalOnClass(DataSource.class)\n@ConditionalOnMissingBean(DataSource.class)\npublic class CustomDataSourceAutoConfiguration {\n    @Bean public DataSource dataSource() { return new HikariDataSource(); }\n}",
                "codeSnippet": "@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })\npublic class Application { public static void main(String[] args) { SpringApplication.run(Application.class); } }",
                "commonMistakes": ["Not knowing how to exclude problematic auto-configurations.", "Assuming auto-configuration overrides user-defined custom beans (@ConditionalOnMissingBean yields to user beans)."],
                "followUpQuestions": ["How does AutoConfiguration.imports in Spring Boot 3 differ from spring.factories in Spring Boot 2?", "What is the AutoConfigurationReport / ConditionEvaluationReport?"],
                "interviewTips": ["Run application with --debug to show the ConditionEvaluationReport.", "Explain the role of @ConditionalOnMissingBean in allowing user overrides."]
            },
            {
                "title": "Explain the Spring Bean Lifecycle from instantiation to destruction.",
                "shortAnswer": "Bean lifecycle: 1. Instantiation (constructor). 2. Populate Properties (DI). 3. Aware interfaces (BeanNameAware, ApplicationContextAware). 4. BeanPostProcessor beforeInitialization. 5. @PostConstruct / InitializingBean afterPropertiesSet. 6. BeanPostProcessor afterInitialization (AOP proxying). 7. In service. 8. @PreDestroy / DisposableBean destroy.",
                "detailedExplanation": "Spring loads BeanDefinitions, instantiates beans via reflection, and populates dependencies. BeanPostProcessor.postProcessAfterInitialization is where Dynamic Proxies (AOP, @Transactional) are wrapped around the target bean. On shutdown, destruction callbacks clean up resources.",
                "realWorldExample": "Initializing a cache connection or pre-fetching configuration data inside @PostConstruct and safely closing socket pools inside @PreDestroy.",
                "implementationExample": "@Component\npublic class CacheManager implements InitializingBean, DisposableBean {\n    @PostConstruct public void init() { logger.info(\"PostConstruct\"); }\n    @Override public void afterPropertiesSet() { connect(); }\n    @PreDestroy public void clean() { disconnect(); }\n    @Override public void destroy() { logger.info(\"Destroyed\"); }\n}",
                "codeSnippet": "public Object postProcessAfterInitialization(Object bean, String beanName) {\n    if (needsProxy(bean)) return wrapWithAopProxy(bean);\n    return bean;\n}",
                "commonMistakes": ["Calling @Transactional methods inside @PostConstruct (AOP proxy may not be fully active yet).", "Doing heavy blocking operations in the constructor before dependencies are injected."],
                "followUpQuestions": ["Why are AOP proxies created in BeanPostProcessor.afterInitialization?", "What is the difference between BeanPostProcessor and BeanFactoryPostProcessor?"],
                "interviewTips": ["Highlight that BeanFactoryPostProcessor operates on BeanDefinitions, while BeanPostProcessor operates on bean instances.", "Point out that @PostConstruct runs before afterPropertiesSet()."]
            },
            {
                "title": "Explain Spring Bean Scopes and resolving prototype injection into singleton beans.",
                "shortAnswer": "Scopes: singleton (default, one per container), prototype (new instance per request), request, session, and application. When a prototype is injected into a singleton, it is injected only once at startup. Fix using @Lookup, ObjectProvider<T>, or ProxyMode.",
                "detailedExplanation": "Because singletons are instantiated once, dependencies injected via constructor/setter are also fixed at creation time. To obtain a fresh prototype on every call: 1. Use @Scope(value = \"prototype\", proxyMode = ScopedProxyMode.TARGET_CLASS). 2. Inject ObjectProvider<PrototypeBean> and call .getObject(). 3. Use @Lookup method injection.",
                "realWorldExample": "A singleton OrderProcessingService injecting a prototype PaymentTransactionTask that must maintain fresh per-transaction state without thread contention.",
                "implementationExample": "@Component\n@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE, proxyMode = ScopedProxyMode.TARGET_CLASS)\npublic class RequestContext { private String requestId; }\n\n@Service\npublic class OrderService {\n    private final ObjectProvider<PaymentTask> taskProvider;\n    public OrderService(ObjectProvider<PaymentTask> provider) { this.taskProvider = provider; }\n    public void process() { taskProvider.getObject().execute(); }\n}",
                "codeSnippet": "@Lookup public abstract PaymentTask getPaymentTask();",
                "commonMistakes": ["Directly autowiring a prototype bean into a singleton and expecting a new instance per method call.", "Creating stateful singleton beans causing race conditions."],
                "followUpQuestions": ["What is ScopedProxyMode.TARGET_CLASS and how does CGLIB proxying work here?", "How does request scope work in multi-threaded asynchronous tasks?"],
                "interviewTips": ["Demonstrate ObjectProvider<T> as the modern clean solution in Spring 5+.", "Explain how CGLIB proxy intercepts method calls and resolves the bean dynamically."]
            },
            {
                "title": "Explain Constructor vs Field vs Setter Injection and Circular Dependency resolution.",
                "shortAnswer": "Constructor injection is recommended: guarantees immutability (final fields), prevents NPEs, and enables pure unit testing without Spring. Field injection (@Autowired on private fields) is an anti-pattern. Circular dependencies are resolved via @Lazy, ObjectProvider, or refactoring.",
                "detailedExplanation": "Constructor injection ensures that beans cannot be created in an incomplete state. In Spring Boot 2.6+, circular dependencies are disabled by default. If ServiceA requires ServiceB and ServiceB requires ServiceA, Spring throws BeanCurrentlyInCreationException. @Lazy injects a proxy to break the constructor lock.",
                "realWorldExample": "Refactoring circular dependencies between UserService and NotificationService into an event-driven architecture using ApplicationEventPublisher.",
                "implementationExample": "@Service\npublic class UserService {\n    private final UserRepository userRepository;\n    public UserService(UserRepository repo) { this.userRepository = repo; }\n}",
                "codeSnippet": "@Service\npublic class ServiceA {\n    private final ServiceB b;\n    public ServiceA(@Lazy ServiceB b) { this.b = b; }\n}",
                "commonMistakes": ["Using field injection which hides dependencies and makes unit testing without reflection impossible.", "Allowing circular dependencies instead of refactoring to events or intermediary services."],
                "followUpQuestions": ["Why did Spring Boot 2.6 disable circular references by default?", "How does @Lazy resolve circular dependency at runtime?"],
                "interviewTips": ["State clearly: 'Constructor injection guarantees immutability and compile-time dependency verification.'", "Mention ApplicationEventPublisher as the architectural fix for circular dependencies."]
            },
            {
                "title": "Explain Spring AOP internals: JDK Dynamic Proxy vs CGLIB and the self-invocation issue.",
                "shortAnswer": "Spring AOP uses JDK Dynamic Proxies (for classes implementing interfaces) or CGLIB (subclass bytecode generation, default in Spring Boot). Self-invocation (calling this.methodB() from methodA() inside the same class) bypasses the proxy, causing @Transactional and @Async to fail.",
                "detailedExplanation": "Spring AOP creates proxy wrappers around beans. When an external caller invokes a method, the proxy intercepts the call, executes advice (Around, Before, After), and delegates to the target. In self-invocation, the call is direct on 'this', completely bypassing the proxy wrapper.",
                "realWorldExample": "A public method checkout() calling a private/public @Transactional method saveOrder() within the same service; transactions fail to start because the call bypassed the AOP proxy.",
                "implementationExample": "// Solution to self-invocation: extract to separate service or inject self\n@Service\npublic class OrderService {\n    @Autowired private ApplicationContext context;\n    public void placeOrder() { context.getBean(OrderService.class).processPayment(); }\n    @Transactional public void processPayment() { /* transactional */ }\n}",
                "codeSnippet": "// Enabling CGLIB proxying explicitly\n@EnableAspectJAutoProxy(proxyTargetClass = true)",
                "commonMistakes": ["Expecting @Transactional, @Async, or @Cacheable to work on private methods or self-invoked methods.", "Thinking Spring AOP is full AspectJ (Spring AOP is proxy-based runtime interception; AspectJ is compile/load-time weaving)."],
                "followUpQuestions": ["What is the difference between compile-time weaving (AspectJ) and runtime proxying (Spring AOP)?", "Why does CGLIB fail on final classes or final methods?"],
                "interviewTips": ["Sketch the proxy diagram: Caller -> Proxy -> Target Bean. Explain why 'this.' bypasses the Proxy.", "Mention extracting the internal method into a separate dedicated service as best practice."]
            },
            {
                "title": "Explain Spring @Transactional internals: Propagation, Isolation, and Rollback rules.",
                "shortAnswer": "Spring @Transactional uses AOP proxies around PlatformTransactionManager. By default, it rolls back only on unchecked exceptions (RuntimeException and Error). Propagation defines boundary behavior: REQUIRED (joins or creates), REQUIRES_NEW (suspends outer and creates new), NESTED (savepoint).",
                "detailedExplanation": "TransactionInterceptor begins a transaction before method execution and commits on success. Rollback rules: checked exceptions (e.g. IOException, Exception) do NOT trigger rollback unless rollbackFor = Exception.class is specified. Propagation.REQUIRES_NEW starts an independent physical transaction.",
                "realWorldExample": "Writing audit logs in REQUIRES_NEW transaction so that even if the primary payment transaction fails and rolls back, the audit record is safely committed to the database.",
                "implementationExample": "@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class, isolation = Isolation.READ_COMMITTED)\npublic void transferFunds(Long from, Long to, BigDecimal amount) {\n    accountRepo.debit(from, amount);\n    accountRepo.credit(to, amount);\n    auditService.logTransfer(from, to, amount); // runs in REQUIRES_NEW\n}",
                "codeSnippet": "@Transactional(propagation = Propagation.REQUIRES_NEW)\npublic void logTransfer(Long from, Long to, BigDecimal amount) { auditRepo.save(new AuditLog(...)); }",
                "commonMistakes": ["Expecting rollback on checked exceptions without rollbackFor = Exception.class.", "Catching exceptions inside try-catch and swallowing them without re-throwing, causing transaction to commit normally.", "Using @Transactional on private methods."],
                "followUpQuestions": ["What is the difference between Propagation.REQUIRES_NEW and Propagation.NESTED?", "What is TransactionSynchronizationManager and how does it store connections in ThreadLocal?"],
                "interviewTips": ["Always specify rollbackFor = Exception.class in enterprise code.", "Explain that Spring binds database connections to the current thread via ThreadLocal in TransactionSynchronizationManager."]
            },
            {
                "title": "Explain the N+1 Query Problem in Spring Data JPA and solutions (@EntityGraph, JOIN FETCH, DTO).",
                "shortAnswer": "The N+1 problem occurs when fetching N parent entities triggers N additional queries to fetch their child relationships. Solved via: 1. JOIN FETCH in JPQL. 2. @EntityGraph. 3. DTO Projections. 4. Batch fetching via @BatchSize.",
                "detailedExplanation": "If an Author has lazy Books, calling authorRepo.findAll() runs 1 query for authors. Iterating through authors and calling author.getBooks() executes N queries (one per author). JOIN FETCH performs a single SQL JOIN. @EntityGraph dynamically overrides fetch type to EAGER for specific queries without modifying entity mappings.",
                "realWorldExample": "Loading an Order list with OrderItems in an e-commerce dashboard; without JOIN FETCH, loading 100 orders fires 101 database queries, collapsing database connection pools.",
                "implementationExample": "// 1. JOIN FETCH\n@Query(\"SELECT a FROM Author a JOIN FETCH a.books\")\nList<Author> findAllWithBooks();\n\n// 2. EntityGraph\n@EntityGraph(attributePaths = {\"books\"})\nList<Author> findByName(String name);",
                "codeSnippet": "// 3. DTO Projection for read-only speed\n@Query(\"SELECT new com.app.AuthorSummaryDTO(a.id, a.name, COUNT(b)) FROM Author a LEFT JOIN a.books b GROUP BY a.id, a.name\")\nList<AuthorSummaryDTO> getAuthorSummaries();",
                "commonMistakes": ["Using FetchType.EAGER on entity relationships (EAGER applies globally and causes massive Cartesian products).", "Using JOIN FETCH on multiple collections simultaneously (Cartesian product and MultipleBagFetchException)."],
                "followUpQuestions": ["What is MultipleBagFetchException in Hibernate and how is it resolved?", "How does @BatchSize mitigate N+1 queries?"],
                "interviewTips": ["Advise using DTO projections for read-heavy APIs to bypass entity tracking and lazy loading overhead.", "Emphasize that FetchType.LAZY should be default on all relationships."]
            },
            {
                "title": "Explain Spring Boot Actuator, Micrometer metrics, and Prometheus scraping.",
                "shortAnswer": "Spring Boot Actuator provides production-ready monitoring endpoints (/actuator/health, /actuator/metrics, /actuator/prometheus). Micrometer acts as a vendor-neutral facade collecting dimensional metrics (Timers, Counters, Gauges) scraped by Prometheus.",
                "detailedExplanation": "Actuator exposes endpoints over HTTP/JMX. Custom HealthIndicators report DB or third-party downstream status. Micrometer integrates with Prometheus, Datadog, etc. Metrics like http.server.requests record latency percentiles (P95, P99).",
                "realWorldExample": "Kubernetes liveness/readiness probes targeting /actuator/health/liveness and /actuator/health/readiness to automatically restart crashed pods and control traffic ingress.",
                "implementationExample": "@Component\npublic class PaymentGatewayHealthIndicator implements HealthIndicator {\n    public Health health() {\n        boolean ok = pingGateway();\n        return ok ? Health.up().withDetail(\"latency\", \"23ms\").build() : Health.down().withDetail(\"error\", \"Timeout\").build();\n    }\n}",
                "codeSnippet": "// Micrometer custom counter\nprivate final Counter orderCounter;\npublic OrderService(MeterRegistry registry) {\n    this.orderCounter = Counter.builder(\"orders.created\").tag(\"currency\", \"INR\").register(registry);\n}\npublic void create() { orderCounter.increment(); }",
                "commonMistakes": ["Exposing all actuator endpoints publicly (management.endpoints.web.exposure.include=*) without security authentication.", "Blocking on external services inside HealthIndicator, causing Kubernetes liveness probe timeouts and cascade pod restarts."],
                "followUpQuestions": ["What is the difference between Liveness and Readiness probes in Kubernetes?", "How do you record latency distributions with Micrometer Timer and @Timed?"],
                "interviewTips": ["Emphasize separating management.server.port from application port for security.", "Demonstrate setting up liveness and readiness states with AvailabilityChangeEvent."]
            },
            {
                "title": "Explain HikariCP Connection Pool tuning in Spring Boot production environments.",
                "shortAnswer": "HikariCP is the ultra-fast default connection pool in Spring Boot. Key tuning parameters: maximumPoolSize (often 10-30 based on CPU cores and disk spindles), minimumIdle, connectionTimeout (max wait to borrow), idleTimeout, and maxLifetime.",
                "detailedExplanation": "Formula for optimal pool size: Pool Size = (Core Count * 2) + Effective Spindle Count. Oversized connection pools cause CPU context-switching thrashing and lock contention in the database. connectionTimeout should be low (e.g. 3000ms) to fail fast instead of queuing requests indefinitely.",
                "realWorldExample": "A microservice cluster of 20 pods each configured with 100 connections overwhelmed MySQL's max_connections (2000), causing connection refused errors; tuning pool size to 15 per pod restored database stability.",
                "implementationExample": "spring:\n  datasource:\n    hikari:\n      maximum-pool-size: 20\n      minimum-idle: 10\n      connection-timeout: 3000\n      idle-timeout: 600000\n      max-lifetime: 1800000\n      leak-detection-threshold: 2000",
                "codeSnippet": "// Leak detection log warning\n// Appears if connection is borrowed for longer than leak-detection-threshold",
                "commonMistakes": ["Setting maximumPoolSize to 100+ believing more connections equals faster processing.", "Setting maxLifetime higher than MySQL's wait_timeout, causing stale connection RST errors."],
                "followUpQuestions": ["Why is a small connection pool often faster than a huge connection pool?", "What is leak-detection-threshold in HikariCP?"],
                "interviewTips": ["Cite the formula: connections = (CPU cores * 2) + disk spindles.", "Explain that maxLifetime must be 2-3 minutes shorter than the database server's connection timeout."]
            },
            {
                "title": "Explain Spring Events and asynchronous event publishing with @TransactionalEventListener.",
                "shortAnswer": "Spring Events decouple producers from consumers via ApplicationEventPublisher. @Async enables non-blocking event processing. @TransactionalEventListener binds event execution to transaction phases (BEFORE_COMMIT, AFTER_COMMIT, AFTER_ROLLBACK).",
                "detailedExplanation": "By default, event listeners execute synchronously in the publishing thread inside the same transaction. @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) ensures that side-effects like sending welcome emails or publishing Kafka messages execute ONLY after the database transaction successfully commits.",
                "realWorldExample": "Sending payment confirmation emails or triggering shipping webhooks only AFTER the Order database transaction commits, preventing sending emails for rolled-back orders.",
                "implementationExample": "public record OrderCreatedEvent(Long orderId, String email) {}\n\n@Service\npublic class OrderService {\n    private final ApplicationEventPublisher publisher;\n    @Transactional\n    public void createOrder(Order o) {\n        orderRepo.save(o);\n        publisher.publishEvent(new OrderCreatedEvent(o.getId(), o.getEmail()));\n    }\n}",
                "codeSnippet": "@Component\npublic class NotificationListener {\n    @Async\n    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)\n    public void handle(OrderCreatedEvent event) { emailService.send(event.email()); }\n}",
                "commonMistakes": ["Modifying database entities inside an AFTER_COMMIT listener without creating a new transaction (the original transaction is already closed).", "Assuming event listeners are asynchronous by default (they are synchronous unless annotated with @Async)."],
                "followUpQuestions": ["What happens if an exception is thrown inside an AFTER_COMMIT listener?", "Why must @Async listeners have an active TaskExecutor configured?"],
                "interviewTips": ["Highlight that @TransactionalEventListener prevents phantom side-effects if the publishing transaction rolls back.", "Mention pairing @Async with @TransactionalEventListener."]
            },
            {
                "title": "Explain Centralized Exception Handling in Spring Boot using @RestControllerAdvice and ProblemDetail.",
                "shortAnswer": "@RestControllerAdvice provides centralized exception interception across controllers. @ExceptionHandler handles specific exceptions, returning standardized JSON error envelopes. Spring Boot 3 introduced RFC 7807 ProblemDetail for industry-standard error payloads.",
                "detailedExplanation": "Without global handling, uncaught exceptions return ugly 500 HTML error pages or expose internal stack traces. @RestControllerAdvice captures exceptions, logs error context, and formats error responses with status, timestamp, path, error code, and validation field errors.",
                "realWorldExample": "Converting MethodArgumentNotValidException into a clean 400 Bad Request JSON response listing field-level validation errors for frontend UI forms.",
                "implementationExample": "@RestControllerAdvice\npublic class GlobalExceptionHandler {\n    @ExceptionHandler(ResourceNotFoundException.class)\n    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {\n        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());\n        pd.setTitle(\"Resource Not Found\");\n        pd.setProperty(\"timestamp\", Instant.now());\n        return pd;\n    }\n}",
                "codeSnippet": "@ExceptionHandler(MethodArgumentNotValidException.class)\npublic ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {\n    Map<String, String> errors = new HashMap<>();\n    ex.getBindingResult().getFieldErrors().forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));\n    return ResponseEntity.badRequest().body(errors);\n}",
                "commonMistakes": ["Leaking sensitive database stack traces or SQL syntax errors to external API clients.", "Catching generic Exception and returning 200 OK with an error status inside the JSON body."],
                "followUpQuestions": ["What is RFC 7807 Problem Details for HTTP APIs?", "How does ResponseEntityExceptionHandler help in Spring Boot?"],
                "interviewTips": ["Show familiarity with Spring Boot 3's native ProblemDetail class.", "Emphasize returning appropriate HTTP status codes (400, 401, 403, 404, 409, 422)."]
            },
            {
                "title": "Compare Spring WebFlux (Reactive) vs Spring MVC in terms of throughput, concurrency, and architecture.",
                "shortAnswer": "Spring MVC is synchronous blocking (Servlet API, one thread per request, Tomcat). Spring WebFlux is asynchronous non-blocking (Project Reactor Mono/Flux, event loop, Netty). WebFlux shines in high-concurrency I/O bound streaming, but blocking JDBC calls nullify its benefits.",
                "detailedExplanation": "Spring MVC scales by increasing thread pools; when requests block on slow DB/network calls, threads are held idle, exhausting thread capacity. WebFlux scales via a small fixed pool of event loop threads using non-blocking I/O (epoll). However, if any blocking call (e.g. standard JPA) is executed on the event loop, throughput collapses.",
                "realWorldExample": "API Gateway routing millions of concurrent streaming requests or notifications benefits heavily from WebFlux; a standard CRUD app with relational MySQL is better suited to Spring MVC with Virtual Threads.",
                "implementationExample": "@RestController\npublic class ReactiveUserController {\n    @GetMapping(\"/users\")\n    public Flux<User> getAllUsers() { return userReactiveRepo.findAll().delayElements(Duration.ofMillis(10)); }\n}",
                "codeSnippet": "@GetMapping(value = \"/stream\", produces = MediaType.TEXT_EVENT_STREAM_VALUE)\npublic Flux<StockPrice> streamPrices() { return stockService.getPriceStream(); }",
                "commonMistakes": ["Using blocking Spring Data JPA inside Spring WebFlux instead of R2DBC, blocking the Netty event loop threads.", "Choosing WebFlux for simple CRUD apps where Spring MVC with Java 21 Virtual Threads is simpler and faster."],
                "followUpQuestions": ["What is Backpressure in Reactive Streams?", "How do Virtual Threads in Java 21 challenge the necessity of WebFlux?"],
                "interviewTips": ["Clarify that WebFlux does not make individual requests faster; it increases system concurrency under I/O wait.", "Discuss R2DBC vs JDBC in reactive contexts."]
            },
            {
                "title": "Explain Production Debugging in Spring Boot: Heap Dumps, Thread Dumps, and High CPU Analysis.",
                "shortAnswer": "High CPU: capture thread dumps via jstack or jcmd, find thread CPU usage with top -H -p <pid>, convert thread TID to hex, and locate the spinning method. OutOfMemoryError: generate heap dump via -XX:+HeapDumpOnOutOfMemoryError and analyze with Eclipse Memory Analyzer (MAT).",
                "detailedExplanation": "Thread dumps reveal thread states (BLOCKED, WAITING, TIMED_WAITING, RUNNABLE) and detect deadlocks. High CPU is typically caused by infinite loops, regex catastrophic backtracking, or continuous GC cycles. Heap dumps identify memory leaks (unbounded caches, static collections, unclosed streams) via dominator trees.",
                "realWorldExample": "Diagnosing a 100% CPU spike on production Spring Boot instances caused by an un-anchored regex running against malicious user inputs.",
                "implementationExample": "# Generate thread dump\njcmd <PID> Thread.print > threaddump.tdump\n\n# Find high CPU thread in Linux\ntop -H -p <PID>\n# Convert thread id to hex\nprintf \"%x\\n\" <thread_id>\n# Grep in threaddump\ngrep -A 20 \"nid=0x<hex_id>\" threaddump.tdump",
                "codeSnippet": "// JVM flags for automatic heap dump on OOM\n// -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/dumps/oom.hprof",
                "commonMistakes": ["Restarting crashed instances immediately without capturing heap dumps or logs, losing root cause forensic data.", "Running full heap dumps on live production traffic without understanding that JVM pauses during heap dump creation."],
                "followUpQuestions": ["What is the difference between a shallow heap and retained heap in MAT?", "How do you detect database connection pool starvation from a thread dump?"],
                "interviewTips": ["Walk step-by-step through: top -H -> printf hex -> jstack grep.", "Explain how to identify deadlock blocks: 'Found one Java-level deadlock' in thread dump."]
            },
            {
                "title": "Explain Spring Security Architecture: FilterChainProxy, SecurityFilterChain, and AuthenticationManager.",
                "shortAnswer": "Spring Security is an interceptor filter chain managed by DelegatingFilterProxy and FilterChainProxy. Incoming requests pass through ordered security filters (SecurityContextPersistenceFilter, UsernamePasswordAuthenticationFilter, etc.). AuthenticationManager verifies credentials.",
                "detailedExplanation": "DelegatingFilterProxy acts as the bridge between standard Servlet container and Spring ApplicationContext. FilterChainProxy holds the list of SecurityFilterChain beans. AuthenticationManager (typically ProviderManager) delegates to configured AuthenticationProviders. On success, an Authentication token is stored in SecurityContextHolder (ThreadLocal).",
                "realWorldExample": "Protecting a multi-tenant enterprise REST API with JWT tokens, where SecurityFilterChain validates Bearer tokens on /api/** while leaving /public/** open.",
                "implementationExample": "@Configuration\n@EnableWebSecurity\npublic class SecurityConfig {\n    @Bean\n    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {\n        return http.csrf(csrf -> csrf.disable())\n            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))\n            .authorizeHttpRequests(auth -> auth.requestMatchers(\"/api/auth/**\").permitAll().anyRequest().authenticated())\n            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)\n            .build();\n    }\n}",
                "codeSnippet": "Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));\nSecurityContextHolder.getContext().setAuthentication(auth);",
                "commonMistakes": ["Enabling CSRF for stateless REST APIs using JWT tokens (CSRF is only needed for cookie-based browser sessions).", "Using deprecated WebSecurityConfigurerAdapter instead of modern component-based SecurityFilterChain bean."],
                "followUpQuestions": ["What is the role of DelegatingFilterProxy in web.xml / servlet container?", "How does SecurityContextHolder manage state across asynchronous threads (@Async)?"],
                "interviewTips": ["Emphasize modern Spring Security 6 component-based configuration using lambda DSL.", "Trace the authentication flow: Filter -> AuthenticationManager -> AuthenticationProvider -> SecurityContextHolder."]
            },
            {
                "title": "Explain JWT Authentication Filter Implementation in Spring Boot.",
                "shortAnswer": "A custom OncePerRequestFilter extracts the Authorization header, validates the JWT signature and expiration, extracts user claims, loads UserDetails, and sets an authenticated UsernamePasswordAuthenticationToken in the SecurityContextHolder.",
                "detailedExplanation": "OncePerRequestFilter guarantees execution once per HTTP request dispatch. The filter: 1. Checks for 'Bearer <token>'. 2. Parses and validates token using HMAC-SHA256 or RSA public key. 3. If valid, populates UsernamePasswordAuthenticationToken with user authorities. 4. Calls filterChain.doFilter() to continue execution.",
                "realWorldExample": "Stateless authentication for mobile and web clients in microservice architectures where backend instances do not share session state.",
                "implementationExample": "@Component\npublic class JwtAuthFilter extends OncePerRequestFilter {\n    @Autowired private JwtService jwtService;\n    @Autowired private UserDetailsService userDetailsService;\n    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {\n        String header = req.getHeader(\"Authorization\");\n        if (header != null && header.startsWith(\"Bearer \")) {\n            String token = header.substring(7);\n            String username = jwtService.extractUsername(token);\n            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {\n                UserDetails user = userDetailsService.loadUserByUsername(username);\n                if (jwtService.isValid(token, user)) {\n                    var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());\n                    SecurityContextHolder.getContext().setAuthentication(auth);\n                }\n            }\n        }\n        chain.doFilter(req, res);\n    }\n}",
                "codeSnippet": "// Extracting current user in controller\n@GetMapping(\"/me\")\npublic UserDTO getCurrentUser(@AuthenticationPrincipal UserDetails user) { return userService.find(user.getUsername()); }",
                "commonMistakes": ["Calling database on every request to validate JWT instead of validating cryptographic signature and claims in memory.", "Not handling expired token exceptions gracefully in an AuthenticationEntryPoint."],
                "followUpQuestions": ["How do you handle JWT revocation / logout before expiration?", "Why should refresh tokens be stored in HttpOnly cookies?"],
                "interviewTips": ["Highlight that OncePerRequestFilter prevents duplicate execution on internal servlet forwards.", "Discuss the security trade-offs between symmetric (HMAC) and asymmetric (RSA/ECDSA) JWT signing."]
            },
            {
                "title": "Explain Role-Based Access Control (RBAC) with @PreAuthorize and Method Security in Spring.",
                "shortAnswer": "@EnableMethodSecurity enables SpEL annotations (@PreAuthorize, @PostAuthorize, @Secured) on service methods. @PreAuthorize evaluates expressions (e.g. hasRole('ADMIN') or #id == authentication.principal.id) before method invocation.",
                "detailedExplanation": "Method security uses AOP interception via MethodSecurityInterceptor. SpEL allows fine-grained authorization rules based on user roles, permissions, or method argument values. @PostAuthorize can inspect the method's return value before deciding whether the caller is authorized to view it.",
                "realWorldExample": "Enforcing that only users with role 'HR_ADMIN' or the employee matching the requested employeeId can view payroll compensation records.",
                "implementationExample": "@Configuration\n@EnableMethodSecurity(prePostEnabled = true)\npublic class MethodSecurityConfig {}\n\n@Service\npublic class AccountService {\n    @PreAuthorize(\"hasRole('ADMIN') or #userId == authentication.principal.id\")\n    public Account getAccount(Long userId) { return accountRepo.findByUserId(userId); }\n    \n    @PostAuthorize(\"returnObject.owner == authentication.name\")\n    public Document getDocument(Long docId) { return docRepo.findById(docId); }\n}",
                "codeSnippet": "@PreAuthorize(\"hasAuthority('SCOPE_payment:write')\")\npublic void executePayment() { /* payment */ }",
                "commonMistakes": ["Confusing hasRole('ADMIN') with hasAuthority('ADMIN') (hasRole automatically prefixes 'ROLE_').", "Assuming method security works when calling methods internally on the same class (bypasses AOP proxy)."],
                "followUpQuestions": ["What is the difference between @PreAuthorize and @PostAuthorize?", "How does PermissionEvaluator allow custom domain permission checks?"],
                "interviewTips": ["Explain the 'ROLE_' prefix convention in Spring Security hasRole().", "Showcase SpEL expressions accessing method arguments via #parameterName."]
            }
        ]
    }
]
