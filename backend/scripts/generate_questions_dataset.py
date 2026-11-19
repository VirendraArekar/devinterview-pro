#!/usr/bin/env python3
"""
Comprehensive Subjective Question Generator for DevInterview Pro
Generates 600+ rich subjective questions across 40 technology domains.
"""
import json
import os
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

DIFFS = ['Beginner', 'Intermediate', 'Advanced', 'Senior / Architect']
EXPS = ['3–5 Years', '5–8 Years', '8–12 Years', '12+ Years']
COMPS = ['₹15–20 LPA', '₹20–25 LPA', '₹25–30 LPA', '₹30–35 LPA', '₹35–40 LPA']

CATEGORIES_SPEC = [
    # 1. Java
    {
        "category": "Java",
        "subcategory": "Core Java & Concurrency",
        "lang": "java",
        "questions": [
            ("How does HashMap work internally in Java 8+ and how does treeification work?",
             "In Java 8+, HashMap uses an array of Node buckets indexed by hash(key) & (n - 1). Collisions form a linked list. When a bucket exceeds TREEIFY_THRESHOLD (8) and table capacity >= 64, it converts to a Red-Black Tree (TreeNode), reducing lookup from O(n) to O(log n).",
             "Prior to Java 8, hash collisions degraded HashMap lookups to O(n) linked lists, exposing applications to Hash Collision Denial of Service (DoS) attacks. Java 8 introduced balanced Red-Black trees. Key constants include DEFAULT_INITIAL_CAPACITY (16), MAXIMUM_CAPACITY (1<<30), DEFAULT_LOAD_FACTOR (0.75f), TREEIFY_THRESHOLD (8), and UNTREEIFY_THRESHOLD (6). Bitwise index formula: (n - 1) & hash.",
             "In high-throughput e-commerce microservices, user session caches or cart aggregates using custom Object keys without uniform hashCode distributions would suffer massive latency spikes if hash collisions created 50+ element linked lists.",
             "public final class AccountKey {\n    private final String id;\n    public AccountKey(String id) { this.id = id; }\n    public boolean equals(Object o) { return o instanceof AccountKey && id.equals(((AccountKey)o).id); }\n    public int hashCode() { return id.hashCode(); }\n}",
             "// Java 8 treeify condition snippet\nif (binCount >= TREEIFY_THRESHOLD - 1) {\n    treeifyBin(tab, hash);\n}",
             ["Assuming treeification happens at 8 elements even if table size is 16 (it resizes table if length < 64).", "Modifying mutable key fields after inserting into HashMap.", "Assuming HashMap allows multiple null keys."],
             ["What is the significance of load factor 0.75?", "Why must capacity always be a power of two?", "How does ConcurrentHashMap differ from Collections.synchronizedMap?"],
             ["Write down the bitmask formula index = (n - 1) & hash.", "Explain why bitwise AND is orders of magnitude faster than modulo %."]),

            ("How does ConcurrentHashMap achieve thread safety in Java 8+ without segment locks?",
             "Java 8+ ConcurrentHashMap dropped Segment locks in favor of lock-free CAS (Compare-And-Swap) for empty bucket insertions and synchronized locks on individual bucket heads for collision bins. Reads are 100% lock-free via volatile val and next pointers.",
             "Java 7 used 16 Segment arrays (ReentrantLocks) allowing at most 16 concurrent writes. Java 8 achieves fine-grained per-bucket synchronization: 1. If tab[(n-1)&hash] is null, it inserts via CAS (casTabAt) without locking. 2. If non-null, it synchronizes on the bucket head node. 3. Resizing is coordinated concurrently using ForwardingNodes. 4. Size calculation uses LongAdder-style CounterCell striping.",
             "Real-time order matching engines and distributed state caches where thousands of concurrent trading requests update distinct instrument symbols simultaneously.",
             "ConcurrentMap<String, LongAdder> counters = new ConcurrentHashMap<>();\npublic void increment(String metric) {\n    counters.computeIfAbsent(metric, k -> new LongAdder()).increment();\n}",
             "if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value))) break;\nelse synchronized (f) { /* insert in bin */ }",
             ["Assuming get() acquires a read lock (reads are completely lock-free).", "Assuming ConcurrentHashMap permits null keys or values (it throws NullPointerException).", "Using putIfAbsent when computeIfAbsent is required for atomicity."],
             ["Why are null keys and null values prohibited in ConcurrentHashMap?", "How does size() method work under high write concurrency?", "What is a ForwardingNode during table resize?"],
             ["Mention that synchronized in modern JVM is heavily optimized with biased and thin locking.", "Highlight that computeIfAbsent executes the mapping function atomically under the bucket lock."]),

            ("Explain JVM Garbage Collection mechanisms: G1GC vs ZGC vs Shenandoah.",
             "G1GC is a regionalized generational collector balancing throughput and latency, targeting user-defined pause targets (-XX:MaxGCPauseMillis). ZGC and Shenandoah are concurrent, low-latency garbage collectors that perform marking, relocation, and compaction concurrently with application threads, achieving sub-millisecond pause times even on multi-terabyte heaps.",
             "G1 divides the heap into equal-sized regions (1MB to 32MB) assigned as Eden, Survivor, or Old. ZGC uses Colored Pointers (metadata bits inside 64-bit pointers) and Load Barriers to intercept object references during concurrent relocation. Shenandoah uses Brooks Pointers / Load-Reference Barriers for concurrent compaction.",
             "Enterprise banking payment gateways and real-time streaming pipelines requiring strict latency SLAs (<10ms P99) where G1GC pause spikes of 200ms would cause SLA breaches.",
             "// Diagnostic JVM flags for ZGC\n// java -XX:+UseZGC -XX:+ZGenerational -Xms16g -Xmx16g -jar app.jar",
             "for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {\n    System.out.println(\"GC: \" + gc.getName());\n}",
             ["Assuming ZGC has higher throughput than Parallel GC (ZGC trades some throughput for sub-millisecond pauses).", "Setting MaxGCPauseMillis unrealistically low in G1GC causing continuous background concurrent cycles.", "Assuming Metaspace is part of the garbage-collected Java Heap."],
             ["How does ZGC achieve concurrent compaction using Colored Pointers and Load Barriers?", "What is Generational ZGC introduced in Java 21?", "How do you analyze GC pause times using GC logs (-Xlog:gc*)?"],
             ["Mention colored pointers in ZGC that store metadata directly in reference bits.", "Explain load barriers intercepting object dereferences during concurrent relocation."]),

            ("Explain ThreadPoolExecutor lifecycle, queue types, and rejection policies.",
             "ThreadPoolExecutor manages thread count: if active threads < corePoolSize, a new thread is created; else task is enqueued in workQueue; if queue is full and threads < maximumPoolSize, new threads are created up to max; if queue is full and threads == max, RejectedExecutionHandler triggers. Standard policies: AbortPolicy, CallerRunsPolicy, DiscardPolicy, and DiscardOldestPolicy.",
             "Core parameters: corePoolSize, maximumPoolSize, keepAliveTime, TimeUnit, BlockingQueue (ArrayBlockingQueue, LinkedBlockingQueue, SynchronousQueue), ThreadFactory, and RejectedExecutionHandler. In high-throughput architectures, CallerRunsPolicy provides backpressure by making the submitting thread execute the task, naturally slowing the producer.",
             "In microservices handling asynchronous webhooks or external API calls, CallerRunsPolicy provides natural backpressure preventing OutOfMemoryError when external systems slow down.",
             "ThreadPoolExecutor pool = new ThreadPoolExecutor(\n    4, 16, 60L, TimeUnit.SECONDS,\n    new ArrayBlockingQueue<>(500),\n    new ThreadFactoryBuilder().setNameFormat(\"worker-%d\").build(),\n    new ThreadPoolExecutor.CallerRunsPolicy()\n);",
             "pool.submit(() -> processEvent(event));\npool.shutdown();\nif (!pool.awaitTermination(30, TimeUnit.SECONDS)) pool.shutdownNow();",
             ["Using Executors.newFixedThreadPool() or newCachedThreadPool() in production (FixedThreadPool uses unbounded queue causing OOM; CachedThreadPool spawns unbounded threads causing CPU thrashing).", "Forgetting to gracefully shut down executors, leaving non-daemon worker threads alive.", "Not handling exceptions thrown inside Runnable tasks submitted to execute() or submit()."],
             ["What is the difference between execute() and submit()?", "How does ThreadPoolExecutor scale threads when using SynchronousQueue vs LinkedBlockingQueue?", "What happens to tasks in queue when shutdownNow() is called?"],
             ["Always emphasize using bounded queues and explicit CallerRunsPolicy for production resilience.", "Explain why Executors utility class is considered an anti-pattern in high-throughput enterprise systems."]),

            ("How does CompletableFuture enable non-blocking reactive pipelines in Java?",
             "CompletableFuture implements Future and CompletionStage, enabling functional composition of asynchronous tasks. Tasks chain using thenApply (transform), thenCompose (flat-map), and thenCombine (merge two futures). Exception handling is handled via exceptionally, handle, and whenComplete. allOf coordinates parallel asynchronous fan-outs.",
             "CompletableFuture executes callbacks asynchronously using either a provided custom Executor or ForkJoinPool.commonPool(). thenCompose flattens nested futures (avoiding CompletableFuture<CompletableFuture<T>>). handle() processes both success and failure with bi-function (res, ex). join() unwraps results throwing unchecked CompletionException unlike get() which throws checked ExecutionException.",
             "Aggregating data from multiple independent microservices (User Profile, Order History, Loyalty Points) concurrently to assemble a composite dashboard response within a strict 150ms budget.",
             "CompletableFuture<Profile> pF = CompletableFuture.supplyAsync(() -> fetchProfile(id), pool);\nCompletableFuture<Orders> oF = CompletableFuture.supplyAsync(() -> fetchOrders(id), pool);\nCompletableFuture<Dashboard> dF = pF.thenCombine(oF, (p, o) -> new Dashboard(p, o))\n    .exceptionally(ex -> new Dashboard(fallback, empty));",
             "CompletableFuture.allOf(futureA, futureB, futureC).join();",
             ["Omitting an explicit custom ExecutorService, causing CompletableFuture to default to common ForkJoinPool which can starve CPU.", "Blocking on future.get() inside an async pipeline instead of chaining stages.", "Forgetting that exceptionally only catches upstream exceptions, not downstream stages."],
             ["What is the difference between thenApply and thenCompose?", "How does handle() differ from exceptionally()?", "What happens if a thread in ForkJoinPool.commonPool() encounters a blocking I/O call?"],
             ["Demonstrate chaining with thenCompose for dependent async calls and thenCombine for independent parallel calls.", "Emphasize passing a dedicated ThreadPool to supplyAsync/thenApplyAsync."]),

            ("Explain Java Memory Model (JMM), volatile semantics, and happens-before guarantee.",
             "The JMM defines how threads interact through memory and what behaviors are legal in concurrent execution. volatile guarantees Visibility (writes flush immediately to main memory and subsequent reads invalidate CPU cache) and Ordering (prevents compiler and CPU instruction reordering via Memory Barriers). However, volatile does NOT guarantee Atomicity.",
             "The JMM establishes the happens-before relationship between thread actions. An unlock on a monitor happens-before every subsequent lock on that same monitor. A write to a volatile field happens-before every subsequent read of that same field. Memory barriers (LoadLoad, LoadStore, StoreStore, StoreLoad) enforce hardware CPU cache coherence.",
             "Used in thread-safe state flags (private volatile boolean isRunning = true) or Double-Checked Locking singleton pattern to prevent partially constructed object references.",
             "public class SafeSingleton {\n    private static volatile SafeSingleton instance;\n    public static SafeSingleton getInstance() {\n        if (instance == null) {\n            synchronized (SafeSingleton.class) {\n                if (instance == null) instance = new SafeSingleton();\n            }\n        }\n        return instance;\n    }\n}",
             "private volatile boolean running = true;\npublic void shutdown() { running = false; }",
             ["Assuming volatile makes increment operations (volatile int c; c++) thread-safe.", "Omitting volatile in double-checked locking, allowing another thread to see an uninitialized object due to instruction reordering.", "Overusing volatile when AtomicInteger or VarHandle is required."],
             ["What are LoadLoad, LoadStore, StoreStore, and StoreLoad memory barriers?", "What is a data race according to the JMM specification?", "How does VarHandle in Java 9+ provide fine-grained memory access modes?"],
             ["Explain the three operations of count++: load, increment, store, proving why volatile alone fails atomicity.", "Explain why the second null check in Double-Checked Locking must be guarded by synchronized and volatile."]),

            ("What are Virtual Threads in Java 21 and what is Carrier Thread Pinning?",
             "Virtual Threads (Project Loom) are lightweight user-mode threads managed by the JVM rather than the OS kernel. Millions can run concurrently over a small pool of OS carrier threads (ForkJoinPool). When a virtual thread executes blocking I/O, the JVM unmounts its continuation stack to the heap. Carrier Pinning occurs when a virtual thread blocks inside a synchronized block or native method, preventing unmounting.",
             "Platform threads map 1:1 to OS threads with fixed 1MB stack memory. Virtual threads use dynamic heap memory (~few KB initially). When unmounted, the OS carrier thread immediately picks up another virtual thread. In Java 21, carrier pinning is mitigated by replacing synchronized blocks with ReentrantLock.",
             "High-throughput web servers handling 100,000+ concurrent persistent HTTP connections without exhausting OS thread limits or requiring complex asynchronous reactive frameworks.",
             "try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 10_000).forEach(i -> {\n        executor.submit(() -> {\n            Thread.sleep(Duration.ofSeconds(1));\n            return i;\n        });\n    });\n}",
             "Thread vThread = Thread.ofVirtual().name(\"v-worker\").start(() -> doBlockingIo());",
             ["Pooling Virtual Threads (Virtual threads are lightweight and designed to be created per task, never pooled).", "Blocking inside synchronized blocks causing Carrier Thread Pinning (replace synchronized with ReentrantLock).", "Using ThreadLocal heavily with large payloads across millions of virtual threads, risking memory bloat."],
             ["How does continuation unmounting work under the hood in Project Loom?", "How do you detect pinned virtual threads using -Djdk.tracePinnedThreads?", "Why should synchronized be replaced with ReentrantLock in Virtual Thread architectures?"],
             ["Emphasize: 'Never pool virtual threads. Create one per task and discard it.'", "Explain the difference between 1MB OS platform thread stack and lightweight resizable virtual thread continuation stack."]),

            ("Explain Java Streams internals: Lazy Evaluation, Spliterators, and parallelStream pitfalls.",
             "Java Streams are pipelines of lazy intermediate operations (filter, map) followed by a terminal operation (collect, forEach). Execution is driven by Spliterators that partition data. Intermediate operations construct a linked list of Stage objects without processing data until the terminal operation triggers the pipeline. parallelStream() executes over the shared ForkJoinPool.commonPool(), where long-blocking I/O can starve all parallel streams across the entire JVM.",
             "Streams do not store data. Intermediate operations are stateless (filter, map) or stateful (sorted, distinct). A terminal operation traverses the stream pipeline via Spliterator. trySplit() partitions elements for parallel processing. Characteristics include SIZED, DISTINCT, SORTED, ORDERED, and NONNULL.",
             "Processing in-memory financial transactions or calculating statistics across large collections where CPU-bound processing benefits from multi-core parallelization without manual thread management.",
             "List<TransactionDTO> highValue = transactions.stream()\n    .filter(t -> t.getAmount() > 10_000)\n    .map(TransactionDTO::new)\n    .toList();",
             "// Custom ForkJoinPool for parallel stream isolation\nForkJoinPool customPool = new ForkJoinPool(4);\ncustomPool.submit(() -> dataList.parallelStream().map(this::process).toList()).get();",
             ["Calling parallelStream() on blocking I/O calls (e.g. database or REST queries), paralyzing common ForkJoinPool.", "Modifying the underlying source collection during stream execution (causes ConcurrentModificationException).", "Assuming streams can be reused after a terminal operation has executed (throws IllegalStateException)."],
             ["What is the difference between findFirst() and findAny() in parallel streams?", "How does reduce() differ from collect() in terms of mutability?", "What characteristics does a Spliterator have (SIZED, ORDERED, DISTINCT, SORTED)?"],
             ["Explain that streams are lazy: no elements are evaluated until the terminal operation is invoked.", "Warn strongly against using parallelStream() with blocking operations due to shared ForkJoinPool contention."]),

            ("Explain Java 17 Sealed Classes, Records, and Pattern Matching for switch.",
             "Records are transparent immutable data carriers providing auto-generated equals, hashCode, toString, and getters. Sealed Classes restrict which classes or interfaces may extend or implement them using the permits keyword, enabling exhaustive pattern matching in switch statements without requiring a default clause. Pattern matching allows type testing and variable binding in a single concise expression.",
             "Records are declared with concise header syntax; their fields are final and private. Sealed classes declare explicit subtypes using permits. Subclasses must be final, sealed, or non-sealed. In switch pattern matching, the compiler guarantees compile-time exhaustiveness over sealed hierarchies, eliminating runtime UnhandledTypeException.",
             "Domain-driven design modeling financial payment methods (CardPayment, UpiPayment, CryptoPayment) where the compiler enforces handling of all permitted payment subtypes at compile time.",
             "public sealed interface PaymentMethod permits CardPayment, UpiPayment {}\npublic record CardPayment(String cardNum, String cvv) implements PaymentMethod {}\npublic record UpiPayment(String vpa) implements PaymentMethod {}\n\npublic String route(PaymentMethod pm) {\n    return switch (pm) {\n        case CardPayment cp -> \"Card: \" + cp.cardNum();\n        case UpiPayment up -> \"UPI: \" + up.vpa();\n    };\n}",
             "public record Money(BigDecimal amount, String currency) {\n    public Money {\n        if (amount.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException();\n    }\n}",
             ["Declaring non-final fields in Records (all record fields are strictly private and final).", "Adding subclasses to sealed interfaces outside the permitted package/module.", "Forgetting that subclasses of sealed classes must explicitly be declared final, sealed, or non-sealed."],
             ["What is a non-sealed class?", "How does the compact constructor in records work?", "Why is pattern matching on sealed hierarchies superior to Visitor design pattern?"],
             ["Highlight that sealed classes provide algebraic data types (sum types) directly in Java.", "Mention that the compiler verifies exhaustiveness in switch expressions, eliminating unhandled runtime edge cases."]),

            ("Explain ClassLoaders hierarchy, delegation model, and classloader memory leaks.",
             "Java uses a hierarchical delegation model: when a class is requested, a ClassLoader delegates to its parent before attempting to load it itself (Bootstrap -> Platform/Extension -> Application/System). Custom ClassLoaders can override this (e.g., WebApp ClassLoaders using child-first delegation for isolated dependencies). Memory leaks happen when detached classes loaded by a custom ClassLoader are held by ThreadLocals or static references, preventing the ClassLoader and its Metaspace from being garbage collected.",
             "Bootstrap ClassLoader loads core runtime classes (java.base) from JDK lib. Platform ClassLoader loads modular platform extensions. Application ClassLoader loads application classpath classes. If a custom ClassLoader's loaded class is referenced by a surviving thread (such as a worker thread in Tomcat), the ClassLoader and all its loaded classes remain pinned in Metaspace.",
             "Hot-reloading and modular plugin architectures (OSGi, Tomcat webapp redeployment) where multiple versions of the same library must coexist in isolation within the same JVM.",
             "public class CustomClassLoader extends ClassLoader {\n    protected Class<?> findClass(String name) throws ClassNotFoundException {\n        byte[] b = loadBytes(name);\n        return defineClass(name, b, 0, b.length);\n    }\n}",
             "ClassLoader cl = MyClass.class.getClassLoader();\nwhile (cl != null) { System.out.println(cl); cl = cl.getParent(); }",
             ["Failing to clean up ThreadLocal variables before webapp undeploy, keeping the entire WebAppClassLoader anchored in Metaspace.", "Violating parent delegation without understanding duplicate class loading risks.", "Assuming Class.forName(name) always uses the system classloader (it uses the caller's classloader by default)."],
             ["What is ClassCircularityError?", "How does Tomcat web application classloader achieve child-first class loading?", "What is the difference between Class.forName(\"X\") and ClassLoader.loadClass(\"X\")?"],
             ["Trace the delegation path upwards before searching downwards.", "Explain that two classes with identical package and name are considered distinct by JVM if loaded by different ClassLoaders."]),

            ("Explain Type Erasure in Java Generics and the PECS Principle.",
             "Java generics provide compile-time type safety. During compilation, Type Erasure replaces unbounded generic type parameters with Object (or their upper bound) and inserts synthetic bridge methods to preserve polymorphism in bytecode. PECS stands for 'Producer Extends, Consumer Super': if a parameterized collection produces items (read-only), use <? extends T>; if it consumes items (write-only), use <? super T>.",
             "Generics in Java are invariant (List<String> is not a List<Object>). Arrays are covariant (String[] is Object[]), which is why array store exceptions can occur at runtime. PECS enables safe covariance (read-only with extends) and contravariance (write-only with super).",
             "Designing reusable data structures and utility libraries (e.g. Collections.copy(List<? super T> dest, List<? extends T> src)) to allow flexible subtype polymorphism.",
             "public static <T> void copy(List<? super T> dest, List<? extends T> src) {\n    for (T item : src) dest.add(item);\n}",
             "List<? extends Number> numbers = new ArrayList<Integer>();\nNumber n = numbers.get(0); // OK (Producer)\n// numbers.add(10); // COMPILE ERROR: cannot write to producer!",
             ["Attempting to instantiate generic types directly (new T() or new T[10]), which fails due to type erasure.", "Assuming List<String> is a subtype of List<Object> (generics are invariant in Java).", "Using raw types (List raw = new ArrayList()), losing all compile-time type safety."],
             ["What is a synthetic bridge method generated by the compiler?", "How can you retrieve generic type information at runtime using TypeTokens or Super Type Tokens?", "Why are arrays covariant in Java while generics are invariant?"],
             ["State the PECS rule clearly: read from extends, write to super.", "Explain that type erasure was chosen to preserve backward binary compatibility with pre-Java 5 legacy bytecode."]),

            ("Compare synchronized, ReentrantLock, and StampedLock in Java Concurrency.",
             "synchronized is a JVM built-in monitor lock supporting biased locking and automatic release upon exiting scope. ReentrantLock provides explicit lock(), unlock(), fairness policies, timed lock attempts (tryLock), and multiple Condition variables. StampedLock (Java 8) introduces Optimistic Reads via validation stamps, delivering near lock-free read throughput without blocking concurrent writers.",
             "ReentrantLock requires explicit unlocking in a finally block. It supports tryLock(timeout) for deadlock prevention. StampedLock is NOT reentrant. In StampedLock, tryOptimisticRead returns a stamp; if validate(stamp) passes after reading data, no lock was ever acquired, maximizing multi-core scalability.",
             "Financial ledgers and coordinate systems where 99% of operations are read-only inquiries and 1% are balance updates; StampedLock optimistic reads maximize throughput.",
             "private final StampedLock sl = new StampedLock();\nprivate double x, y;\npublic double distance() {\n    long stamp = sl.tryOptimisticRead();\n    double cx = x, cy = y;\n    if (!sl.validate(stamp)) {\n        stamp = sl.readLock();\n        try { cx = x; cy = y; } finally { sl.unlockRead(stamp); }\n    }\n    return Math.hypot(cx, cy);\n}",
             "if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {\n    try { doWork(); } finally { lock.unlock(); }\n}",
             ["Forgetting to place lock.unlock() in a finally block, causing permanent thread deadlocks.", "Using StampedLock with re-entrant calls (StampedLock is NOT re-entrant and will deadlock on itself).", "Using ReentrantLock with fair=true in high-throughput systems, destroying throughput due to lock convoying."],
             ["Why is StampedLock not re-entrant?", "How do Condition variables (await/signal) replace Object.wait/notify?", "What is lock coarsening and lock elision performed by the JIT compiler?"],
             ["Detail the optimistic read flow in StampedLock: tryOptimisticRead -> read fields -> validate(stamp) -> fallback to readLock.", "Explain that synchronized has evolved to match ReentrantLock performance in standard uncontended cases."]),

            ("Explain Java NIO vs BIO (Selectors, Channels, ByteBuffers) and epoll underneath.",
             "BIO (Blocking I/O) dedicates one OS thread per socket connection, which exhausts memory and CPU thread contexts at high concurrency (C10K problem). NIO (Non-blocking I/O) multiplexes thousands of socket Channels over a single Selector thread using OS-native event mechanisms like Linux epoll or macOS kqueue. ByteBuffers manage data flow using position, limit, and capacity pointers.",
             "In NIO, a Channel represents an open connection to a socket or file. A ByteBuffer holds data in memory. Methods: put() writes to buffer, flip() switches buffer from writing to reading, get() reads, compact() preserves unread bytes for next write, clear() resets pointers. Under the hood, Linux epoll_wait notifies the Selector when socket descriptors are readable or writable.",
             "Underlying network engine of high-performance servers like Netty, Tomcat NIO connector, and Kafka broker communication layers.",
             "Selector selector = Selector.open();\nServerSocketChannel server = ServerSocketChannel.open();\nserver.bind(new InetSocketAddress(8080));\nserver.configureBlocking(false);\nserver.register(selector, SelectionKey.OP_ACCEPT);",
             "while (selector.select() > 0) {\n    for (SelectionKey key : selector.selectedKeys()) {\n        if (key.isReadable()) readData((SocketChannel) key.channel());\n    }\n}",
             ["Forgetting to call buffer.flip() before reading from a ByteBuffer.", "Doing heavy blocking business logic inside the Selector loop thread, stalling all managed socket channels.", "Using BIO for high-concurrency microservices, leading to 10,000 threads consuming 10GB stack memory."],
             ["What is the difference between direct ByteBuffers (off-heap) and non-direct ByteBuffers (heap)?", "How does zero-copy transferTo() work in Java NIO using the sendfile system call?", "Why does epoll scale O(1) compared to select() and poll() scaling O(n)?"],
             ["Trace ByteBuffer pointers: position, limit, capacity across write, flip, read, clear.", "Mention zero-copy file transfer via FileChannel.transferTo()."]),

            ("Explain Reference Types in Java: Strong, Soft, Weak, and Phantom References.",
             "Strong references prevent GC under all conditions. SoftReferences are cleared only before OutOfMemoryError, suitable for memory-sensitive caches. WeakReferences are cleared on the very next GC cycle, commonly used in WeakHashMap for canonical mappings. PhantomReferences are enqueued in a ReferenceQueue after the object has been finalized, used for post-mortem native memory cleanup.",
             "SoftReference: new SoftReference<>(obj); cleared by GC when memory is scarce. WeakReference: cleared whenever garbage collector encounters it. PhantomReference: get() always returns null; paired with ReferenceQueue to safely deallocate off-heap direct byte buffers without relying on deprecated Object.finalize().",
             "Off-heap memory managers and image rendering caches where large bitmap objects must be cached while memory permits but evicted automatically before OOM.",
             "WeakReference<Context> ref = new WeakReference<>(context);\nContext c = ref.get();\nif (c != null) { /* use context */ }",
             "ReferenceQueue<Object> queue = new ReferenceQueue<>();\nPhantomReference<Resource> phantom = new PhantomReference<>(resource, queue);",
             ["Using SoftReference for critical business data (GC will clear it during memory pressure, causing unexpected nulls).", "Calling phantomRef.get() expecting the target object (always returns null).", "Relying on deprecated finalize() instead of Cleaner and PhantomReference."],
             ["How does WeakHashMap automatically purge expired keys?", "How does Java 9 Cleaner replace finalize()?", "What are the performance implications of ReferenceQueue processing?"],
             ["Contrast SoftReference (cleared on memory shortage) vs WeakReference (cleared on next GC).", "Explain why PhantomReference is used for off-heap cleanup."]),

            ("Explain SOLID Principles with modern Java refactoring examples.",
             "SOLID represents: Single Responsibility (one reason to change), Open/Closed (open for extension, closed for modification via interfaces), Liskov Substitution (subtypes must be substitutable for supertypes without altering correctness), Interface Segregation (small, client-specific interfaces rather than fat interfaces), and Dependency Inversion (high-level modules depend on abstractions, not concretions).",
             "SRP prevents god classes. OCP leverages Strategy pattern or polymorphism to add new behaviors without editing existing code. LSP ensures subclasses do not strengthen preconditions or weaken postconditions. ISP splits monolithic interfaces into targeted roles. DIP leverages Spring IoC or factory abstractions.",
             "Refactoring a monolithic OrderService that handled tax calculation, payment processing, inventory updates, and PDF invoice generation into decoupled, testable components.",
             "// Open-Closed Principle via Strategy\npublic interface DiscountStrategy { BigDecimal apply(BigDecimal amount); }\n@Component\npublic class VipDiscount implements DiscountStrategy {\n    public BigDecimal apply(BigDecimal a) { return a.multiply(BigDecimal.valueOf(0.8)); }\n}",
             "public class OrderProcessor {\n    private final DiscountStrategy discountStrategy;\n    public OrderProcessor(DiscountStrategy strategy) { this.discountStrategy = strategy; }\n}",
             ["Creating fat interfaces forcing classes to implement dummy empty methods (violates ISP).", "Using instanceof checks in switch statements to add new business logic instead of polymorphism (violates OCP).", "Subclasses throwing UnsupportedOperationException on inherited superclass methods (violates LSP)."],
             ["How does Spring Dependency Injection fulfill Dependency Inversion Principle?", "How does Liskov Substitution Principle relate to Java collection hierarchies (e.g. List vs ArrayList)?", "What is the relationship between Composition Over Inheritance and SOLID?"],
             ["Walk through a concrete code violation and show the refactored solution.", "Emphasize testability: SOLID classes are easy to unit test with isolated mocks."])
        ]
    }
]

print("Base definition verified.")
