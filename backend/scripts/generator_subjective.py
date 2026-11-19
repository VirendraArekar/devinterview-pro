#!/usr/bin/env python3
"""
Comprehensive Subjective Questions Generator for DevInterview Pro
Generates 640 rich interview questions (16 per category across all 40 categories).
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

# Master list of 40 categories with 16 core topic titles, descriptions, and code blueprints
TOPICS_BY_CATEGORY = {
    "Java": {
        "sub": "Core Java & JVM Concurrency", "lang": "java",
        "items": [
            ("HashMap Internal Implementation & Treeification", "How does HashMap work internally in Java 8+, how is treeification triggered, and how does resizing avoid re-hashing?",
             "HashMap uses an array of Node buckets indexed by (n-1)&hash. When collisions reach 8 and capacity >= 64, buckets transform into Red-Black Trees (TreeNode) reducing lookup from O(n) to O(log n).",
             "Treeification prevents Hash Collision DoS attacks. Bitwise split during resize doubles capacity without recomputing expensive hash codes.",
             "High-throughput caching where poor hashCode distribution would degrade lookup performance.",
             "public class Cache<K, V> { private final Map<K, V> map = new HashMap<>(128, 0.75f); }",
             "if (binCount >= TREEIFY_THRESHOLD - 1) treeifyBin(tab, hash);"),
            ("ConcurrentHashMap Lock Striping & Thread Safety", "How does ConcurrentHashMap achieve high concurrency and thread safety in Java 8+ without segment locks?",
             "Replaced Java 7 Segments with lock-free CAS on empty buckets and synchronized on individual bucket heads. Reads are completely lock-free via volatile pointers.",
             "Concurrent resizing is coordinated collaboratively across threads using ForwardingNodes. CounterCell striping handles size counting without contention.",
             "Trading order books and financial ledger state caches with hundreds of concurrent updater threads.",
             "ConcurrentMap<String, LongAdder> counters = new ConcurrentHashMap<>();\ncounters.computeIfAbsent(key, k -> new LongAdder()).increment();",
             "if (casTabAt(tab, i, null, new Node<>(hash, key, value))) break;\nelse synchronized (f) { /* insert */ }"),
            ("JVM Garbage Collectors: G1GC vs ZGC vs Shenandoah", "Compare modern JVM Garbage Collectors: G1GC, ZGC, and Shenandoah in terms of pause times and throughput.",
             "G1GC is a regionalized generational collector balancing throughput and pause targets (-XX:MaxGCPauseMillis). ZGC and Shenandoah are concurrent collectors achieving sub-millisecond pauses.",
             "ZGC uses Colored Pointers and Load Barriers to relocate objects concurrently with application threads.",
             "Banking transaction pipelines with 64GB heaps where G1GC pause spikes cause client connection timeouts.",
             "// java -XX:+UseZGC -XX:+ZGenerational -Xms32g -jar app.jar",
             "ManagementFactory.getGarbageCollectorMXBeans().forEach(gc -> System.out.println(gc.getName()));"),
            ("ThreadPoolExecutor Architecture & Rejection Policies", "Explain the internal lifecycle of ThreadPoolExecutor, work queue sizing, and the 4 standard rejection policies.",
             "Manages corePoolSize, maximumPoolSize, and a BlockingQueue. Standard rejection policies: AbortPolicy, CallerRunsPolicy (backpressure), DiscardPolicy, and DiscardOldestPolicy.",
             "CallerRunsPolicy executes rejected tasks on the calling producer thread, providing natural backpressure during bursts.",
             "Payment webhook ingestion where sudden traffic spikes must not trigger OutOfMemoryError.",
             "ThreadPoolExecutor pool = new ThreadPoolExecutor(4, 16, 60L, TimeUnit.SECONDS, new ArrayBlockingQueue<>(1000), new ThreadPoolExecutor.CallerRunsPolicy());",
             "pool.submit(() -> process(item)); pool.shutdown();"),
            ("CompletableFuture Asynchronous Reactive Pipelines", "How does CompletableFuture enable non-blocking reactive pipelines in Java?",
             "Implements Future and CompletionStage, enabling functional composition of async tasks using thenApply, thenCompose (flat-map), and thenCombine. allOf() waits for multiple parallel futures.",
             "Tasks execute asynchronously via an explicit Executor. Unlike Future.get(), CompletionStage callbacks execute reactively without thread blocking.",
             "Aggregating User Profile, Order History, and Loyalty Points concurrently within a strict 150ms budget.",
             "CompletableFuture<Profile> p = CompletableFuture.supplyAsync(() -> fetchProfile(id), pool);\nCompletableFuture<Orders> o = CompletableFuture.supplyAsync(() -> fetchOrders(id), pool);\nCompletableFuture<Dashboard> d = p.thenCombine(o, Dashboard::new);",
             "CompletableFuture.allOf(f1, f2).join();"),
            ("Virtual Threads in Java 21 & Carrier Pinning", "What are Virtual Threads in Java 21 and what causes Carrier Thread Pinning?",
             "Virtual Threads (Project Loom) are lightweight user-mode threads managed by the JVM over OS carrier threads. Pinning occurs when a virtual thread blocks inside a synchronized block or native call.",
             "When a virtual thread executes blocking I/O, JVM unmounts its continuation to the heap. Pinning prevents unmounting, stalling the carrier thread.",
             "Web servers handling 100,000+ concurrent long-polling HTTP connections without exhausting OS thread handles.",
             "try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    executor.submit(() -> doBlockingIo());\n}",
             "Thread vThread = Thread.ofVirtual().start(() -> handle());"),
            ("Java Memory Model (JMM) & volatile Semantics", "What guarantees does the Java Memory Model provide regarding atomicity, visibility, and ordering?",
             "JMM establishes happens-before relationships. volatile guarantees visibility (immediate memory flush) and ordering (prevents instruction reordering via memory barriers), but NOT atomicity.",
             "volatile inserts hardware memory barriers (LoadLoad, LoadStore, StoreStore, StoreLoad) preventing CPU register caching.",
             "Thread cancellation flags or Double-Checked Locking in lazy Singleton initialization.",
             "private volatile boolean isRunning = true;\npublic void stop() { isRunning = false; }",
             "private static volatile Singleton instance;"),
            ("Java Streams Internals: Spliterators & parallelStream", "How does the Java Streams API execute operations lazily, and what are parallelStream risks?",
             "Streams are lazy functional pipelines driven by Spliterators. parallelStream() runs over ForkJoinPool.commonPool() where blocking I/O can starve the entire JVM.",
             "Intermediate operations are queued into Stage objects. Computation triggers only when a terminal operation (collect, forEach) is invoked.",
             "In-memory transformation and statistical aggregation of 100,000 financial trade records across multi-core CPUs.",
             "List<TradeDTO> dtos = trades.stream().filter(t -> t.getAmount() > 5000).map(TradeDTO::new).toList();",
             "ForkJoinPool customPool = new ForkJoinPool(4); customPool.submit(() -> data.parallelStream().map(this::process).toList());"),
            ("Java 17 & 21 Features: Sealed Classes & Records", "Explain Sealed Classes, Records, and Pattern Matching for switch introduced in Java 17/21.",
             "Records are transparent immutable data carriers. Sealed Classes restrict which classes may extend them using permits. Pattern matching allows exhaustive switch evaluation without a default clause.",
             "The compiler verifies exhaustiveness over sealed hierarchies, eliminating unhandled runtime type edge cases.",
             "Domain modeling financial payment methods (CardPayment, UpiPayment, NetBanking) with compile-time type verification.",
             "public sealed interface Payment permits CardPayment, UpiPayment {}\npublic record CardPayment(String cardNum) implements Payment {}\npublic record UpiPayment(String vpa) implements Payment {}",
             "return switch (p) { case CardPayment c -> \"Card: \" + c.cardNum(); case UpiPayment u -> \"UPI: \" + u.vpa(); };"),
            ("ClassLoader Hierarchy & ClassLoader Memory Leaks", "Explain the ClassLoader hierarchy in Java and how classloader memory leaks occur.",
             "Java uses parent-first delegation (Bootstrap -> Platform -> Application). Memory leaks occur when classes loaded by a custom ClassLoader are held by ThreadLocals or static references.",
             "Bootstrap loads java.base; Platform loads JDK platform modules; Application loads user classpath classes. Detached classes held by surviving threads pin entire ClassLoaders in Metaspace.",
             "Tomcat webapp redeployment where unclosed ThreadLocals prevent the WebAppClassLoader from being garbage collected upon undeploy.",
             "ClassLoader cl = MyService.class.getClassLoader();\nwhile (cl != null) { System.out.println(cl.getName()); cl = cl.getParent(); }",
             "public class CustomClassLoader extends ClassLoader { protected Class<?> findClass(String n) { return defineClass(n, b, 0, b.length); } }"),
            ("Type Erasure in Java Generics & The PECS Principle", "Explain Type Erasure in Java Generics and the PECS principle.",
             "Type erasure removes generic type parameters at compile time, replacing them with Object and synthetic bridge methods. PECS: Producer Extends, Consumer Super.",
             "Generics are invariant. <? extends T> produces elements safely (read-only), while <? super T> consumes elements safely (write-only).",
             "Designing reusable collection utilities like Collections.copy(List<? super T> dest, List<? extends T> src).",
             "public static <T> void copy(List<? super T> dest, List<? extends T> src) { for (T item : src) dest.add(item); }",
             "List<? extends Number> nums = new ArrayList<Integer>(); Number n = nums.get(0);"),
            ("synchronized vs ReentrantLock vs StampedLock", "Compare synchronized, ReentrantLock, and StampedLock in Java Concurrency.",
             "synchronized is a built-in monitor lock. ReentrantLock adds explicit tryLock timeouts and Conditions. StampedLock introduces Optimistic Reads via validation stamps for near lock-free read throughput.",
             "StampedLock is NOT reentrant. tryOptimisticRead() reads fields without acquiring any physical lock, validating the stamp afterwards.",
             "Financial ledgers where 99% of requests read balances and 1% update; StampedLock optimistic reads eliminate lock contention.",
             "private final StampedLock sl = new StampedLock();\npublic double read() {\n    long stamp = sl.tryOptimisticRead();\n    double v = val;\n    if (!sl.validate(stamp)) { stamp = sl.readLock(); try { v = val; } finally { sl.unlockRead(stamp); } }\n    return v;\n}",
             "if (lock.tryLock(100, TimeUnit.MILLISECONDS)) { try { doWork(); } finally { lock.unlock(); } }"),
            ("Java NIO vs BIO: Selectors, Channels & ByteBuffers", "Explain Java NIO vs BIO and how epoll multiplexes thousands of connections.",
             "BIO uses one OS thread per connection, causing thread exhaustion under high concurrency. NIO multiplexes thousands of Channels over a single Selector thread using OS event loops (Linux epoll).",
             "A Channel is an open connection to a socket. ByteBuffers track position, limit, and capacity via flip(), compact(), and clear().",
             "Underlying network engine of high-performance servers like Netty, Tomcat NIO connector, and Kafka broker message handlers.",
             "Selector selector = Selector.open();\nServerSocketChannel server = ServerSocketChannel.open();\nserver.configureBlocking(false);\nserver.register(selector, SelectionKey.OP_ACCEPT);",
             "while (selector.select() > 0) { for (SelectionKey key : selector.selectedKeys()) { if (key.isReadable()) read(key); } }"),
            ("Reference Types in Java: Strong, Soft, Weak, Phantom", "Explain Strong, Soft, Weak, and Phantom References in Java.",
             "Strong references prevent GC. SoftReferences are cleared only before OutOfMemoryError (caches). WeakReferences are cleared on the next GC cycle (WeakHashMap). PhantomReferences track post-mortem cleanup via ReferenceQueue.",
             "SoftReference: cleared on low memory. WeakReference: cleared immediately. PhantomReference: get() always returns null, enqueued after finalization for off-heap buffer cleanup.",
             "In-memory image caches where large bitmaps are retained while memory is abundant but reclaimed before OOM occurs.",
             "WeakReference<Context> ref = new WeakReference<>(context);\nContext c = ref.get();",
             "ReferenceQueue<Object> q = new ReferenceQueue<>();\nPhantomReference<NativeBuffer> phantom = new PhantomReference<>(buffer, q);"),
            ("SOLID Principles with Modern Java Refactoring Examples", "Explain SOLID Principles with modern Java refactoring examples.",
             "Single Responsibility (one reason to change), Open/Closed (extend via interfaces without editing code), Liskov Substitution (subtypes honor supertype contracts), Interface Segregation (small role interfaces), Dependency Inversion (depend on abstractions).",
             "SRP separates business logic, persistence, and formatting. OCP uses Strategy pattern. LSP ensures subclasses do not throw unexpected exceptions.",
             "Refactoring an OrderService that handled tax, payment, inventory, and PDF generation into decoupled services.",
             "public interface DiscountStrategy { BigDecimal apply(BigDecimal amount); }\n@Component\npublic class VipDiscount implements DiscountStrategy { public BigDecimal apply(BigDecimal a) { return a.multiply(BigDecimal.valueOf(0.8)); } }",
             "public interface Printer { void print(); }\npublic interface Scanner { void scan(); }"),
            ("GoF Design Patterns in Modern Java Enterprise Systems", "Explain GoF Design Patterns: Singleton, Factory, Builder, Observer, Strategy, Decorator.",
             "Creational: Singleton (Bill Pugh or Enum), Factory (decouples instantiation), Builder (constructs immutable objects). Behavioral: Strategy (interchangeable algorithms), Observer (event notification). Structural: Decorator (dynamic feature extension).",
             "Bill Pugh Singleton uses a private static inner class for lazy, thread-safe initialization without synchronized overhead. Builder pattern enforces immutability.",
             "Runtime examples: Runtime.getRuntime() (Singleton), Calendar.getInstance() (Factory), StringBuilder (Builder), Collections.unmodifiableList() (Decorator).",
             "public class DatabaseConnection {\n    private DatabaseConnection() {}\n    private static class Holder { static final DatabaseConnection INSTANCE = new DatabaseConnection(); }\n    public static DatabaseConnection getInstance() { return Holder.INSTANCE; }\n}",
             "public class UserDTO { private final String name; private UserDTO(Builder b) { this.name = b.name; } }")
        ]
    }
}

# Add standard topics dynamically for the remaining 39 categories
REMAINING_CATEGORIES = [
    # 2. Spring Boot
    ("Spring Boot", "AutoConfiguration & Production Internals", "java", [
        "Spring Boot Auto-Configuration internals: @EnableAutoConfiguration and Conditionals",
        "Spring Bean Lifecycle: Instantiation, BeanPostProcessor, @PostConstruct, Destruction",
        "Spring Bean Scopes and resolving prototype injection into singleton beans",
        "Constructor vs Field vs Setter Injection and Circular Dependency resolution",
        "Spring AOP internals: Dynamic Proxies (JDK vs CGLIB) and the self-invocation issue",
        "Spring @Transactional: Propagation, Isolation, and Rollback rules",
        "N+1 Query Problem in Spring Data JPA: Solutions with @EntityGraph and JOIN FETCH",
        "Spring Boot Actuator, Micrometer metrics, and Prometheus scraping",
        "HikariCP Connection Pool tuning in Spring Boot production",
        "Spring Events and Asynchronous Processing with @TransactionalEventListener",
        "Centralized Exception Handling with @RestControllerAdvice & ProblemDetail",
        "Spring WebFlux vs Spring MVC: Throughput, Concurrency, and Event Loop",
        "Production Debugging: Heap Dumps, Thread Dumps, and High CPU Analysis",
        "Spring Security Architecture: FilterChainProxy and SecurityFilterChain",
        "JWT Authentication Filter implementation in Spring Boot",
        "Role-Based Access Control (RBAC) with @PreAuthorize and Method Security"
    ]),
    # 3. Spring Framework
    ("Spring Framework", "Core IoC & ApplicationContext", "java", [
        "ApplicationContext vs BeanFactory in Spring Core",
        "BeanPostProcessor vs BeanFactoryPostProcessor in Spring",
        "Spring Expression Language (SpEL) and its architectural usage",
        "Spring Caching Abstraction (@Cacheable, @CachePut, @CacheEvict)",
        "FactoryBean in Spring and when to use it over standard @Bean",
        "Spring Profiles and configuration precedence in enterprise apps",
        "InitializingBean & DisposableBean vs @PostConstruct & @PreDestroy",
        "TaskExecutor and Asynchronous Processing (@Async) in Spring",
        "Spring Event Multicasting and Custom ApplicationEventPublisher",
        "Spring Environment abstraction and PropertySource hierarchy",
        "Dependency Lookup vs Dependency Injection in Spring Framework",
        "Spring Type Conversion and Formatting SPI (Converter and Formatter)",
        "Spring ResourceLoader and Classpath Resource access patterns",
        "Spring Validation framework with JSR-380 Bean Validation",
        "Spring Scheduling: @Scheduled, TaskScheduler, and Cron triggers",
        "Dynamic Module Registration with ImportBeanDefinitionRegistrar"
    ]),
    # 4. Hibernate
    ("Hibernate", "ORM Engine & Persistence", "java", [
        "First-Level (Session) vs Second-Level (SessionFactory) Cache in Hibernate",
        "Cascade Types vs orphanRemoval in JPA / Hibernate",
        "LazyInitializationException and why Open Session in View (OSIV) is an anti-pattern",
        "Hibernate Dirty Checking mechanism and Flush Modes",
        "JPA Inheritance Mapping Strategies: SINGLE_TABLE vs JOINED vs TABLE_PER_CLASS",
        "Optimistic Locking (@Version) vs Pessimistic Locking in JPA",
        "Hibernate Batch Processing and hibernate.jdbc.batch_size optimization",
        "Entity Lifecycle States in Hibernate: Transient, Persistent, Detached, Removed",
        "Hibernate Envers for Entity Auditing and History Tracking",
        "Criteria API vs JPQL vs Native SQL queries performance comparison",
        "Composite Keys in JPA: @IdClass vs @EmbeddedId",
        "@DynamicInsert and @DynamicUpdate in Hibernate performance trade-offs",
        "Hibernate Natural ID Caching and its performance advantages",
        "Secondary Table mapping with @SecondaryTable in Hibernate",
        "Hibernate Connection Release Modes and connection lifecycle",
        "Second-Level Cache Concurrency Strategies (READ_ONLY, READ_WRITE, TRANSACTIONAL)"
    ]),
    # 5. Spring Security
    ("Spring Security", "Authentication & Authorization", "java", [
        "Spring Security Architecture: FilterChainProxy and DelegatingFilterProxy",
        "AuthenticationManager vs ProviderManager vs AuthenticationProvider",
        "UserDetailsService and Custom UserDetails implementation",
        "Stateless JWT Authentication Filter Chain design",
        "OAuth2 and OpenID Connect (OIDC) integration in Spring Security",
        "Role-Based Access Control (RBAC) with @PreAuthorize and SpEL",
        "Cross-Site Request Forgery (CSRF) protection in REST vs Session web apps",
        "Cross-Origin Resource Sharing (CORS) configuration in Spring Security",
        "Session Management: Session Fixation protection and Concurrent Session control",
        "Password Hashing: BCrypt vs Argon2 vs PBKDF2 best practices",
        "Method Security with MethodSecurityInterceptor and Custom Voters",
        "SecurityContextHolder and ThreadLocal strategy across async threads",
        "Custom AuthenticationEntryPoint and AccessDeniedHandler",
        "Remember-Me Authentication architecture and persistent token repositories",
        "Content Security Policy (CSP) and HTTP Security Headers in Spring",
        "Securing Microservices: Token Propagation and Mutual TLS (mTLS)"
    ]),
    # 6. JPA
    ("JPA", "Java Persistence API Standards", "java", [
        "JPA Specification vs Hibernate Provider Architecture",
        "Entity Lifecycle Callbacks: @PrePersist, @PostPersist, @PreUpdate, @PostRemove",
        "EntityManager vs Hibernate Session APIs",
        "TypedQuery vs Query vs NativeQuery execution differences",
        "Spring Data JPA Derived Query Methods and Parsing Internals",
        "Pageable vs Slice in Spring Data JPA pagination performance",
        "JPA Specifications and dynamic predicate building with CriteriaBuilder",
        "Projections in JPA: Interface-based vs Class-based DTO projections",
        "@Modifying queries and the clearAutomatically parameter",
        "LockModeType: PESSIMISTIC_WRITE vs OPTIMISTIC_FORCE_INCREMENT",
        "@EntityGraph: FETCH vs LOAD graph semantics",
        "ManyToMany Join Table optimization and Bidirectional synchronization",
        "Cascade Persistence Graphs and transitive dependency saving",
        "AttributeConverter for Custom Types and JSON Column Mapping in JPA",
        "AuditingEntityListener and @CreatedDate / @LastModifiedDate configuration",
        "Repository Inheritance: CrudRepository vs PagingAndSortingRepository vs JpaRepository"
    ]),
    # 7. JavaScript
    ("JavaScript", "V8 Engine & Async Internals", "javascript", [
        "JavaScript Event Loop: Call Stack, Macrotask Queue, and Microtask Queue",
        "Closures and Lexical Scope in JavaScript",
        "Prototypal Inheritance and the Prototype Chain",
        "The 'this' Keyword Binding Rules in JavaScript",
        "Promise Internals: States, Chaining, and Promise.all vs allSettled",
        "V8 Engine Optimization: Ignition, TurboFan, Hidden Classes, and Inline Caches",
        "Memory Leaks in JavaScript: Detached DOM, Closures, and Timers",
        "Async/Await desugaring to Generator Functions and Co-routines",
        "ES Modules (ESM) vs CommonJS (CJS) in Modern JavaScript",
        "Debounce vs Throttle: Implementation and Use Cases",
        "Function Currying and Partial Application in JavaScript",
        "Event Bubbling, Event Capturing, and Event Delegation",
        "Web Workers and Multi-threaded JavaScript",
        "Object Immutability: Object.freeze vs Object.seal vs Deep Freeze",
        "WeakMap and WeakSet: Weak References and Garbage Collection",
        "Symbols and Well-Known Symbols in JavaScript"
    ]),
    # 8. TypeScript
    ("TypeScript", "Advanced Type System & Architecture", "typescript", [
        "Structural Typing (Duck Typing) vs Nominal Typing in TypeScript",
        "Generics and Generic Constraints (T extends object)",
        "Type Narrowing and User-Defined Type Predicates (val is Type)",
        "Discriminated Unions and Exhaustive Checking using the 'never' type",
        "Conditional Types and the 'infer' keyword for type extraction",
        "Mapped Types and Key Remapping using template literal types",
        "Built-in Utility Types: Partial, Pick, Omit, Record, ReturnType, Parameters",
        "Interface vs Type Alias: Declaration merging and compiler performance",
        "TypeScript Decorators (Stage 3 Standard) and Metadata Reflection",
        "Strict Compiler Flags: strictNullChecks, noImplicitAny, noUncheckedIndexedAccess",
        "Const Assertions (as const) and the 'satisfies' operator",
        "Template Literal Types and String Manipulation in Type System",
        "Namespace vs ES Modules in modern TypeScript applications",
        "Ambient Declarations and Writing Custom .d.ts Declaration Files",
        "Branded Types for Primitive Domain Type Safety",
        "Type Variance: Covariance, Contravariance, and Invariance in TypeScript"
    ]),
    # 9. React.js
    ("React.js", "Fiber Architecture & State Management", "javascript", [
        "React Fiber Architecture: WorkInProgress Tree and Lane Priority Model",
        "Virtual DOM Diffing Heuristics: Element Types and Keys importance",
        "Rules of Hooks and the Fiber memoizedState Linked List",
        "useEffect vs useLayoutEffect vs useInsertionEffect execution timing",
        "useMemo and useCallback: When to memoize and referential equality",
        "useRef and useImperativeHandle for mutable state and DOM access",
        "React Context API vs Redux Toolkit: Re-render cascade optimization",
        "React Server Components (RSC) vs Client Components architecture",
        "Concurrent React: useTransition, useDeferredValue, and startTransition",
        "React Error Boundaries: static getDerivedStateFromError and componentDidCatch",
        "React Portals and event bubbling through DOM hierarchies",
        "Performance Optimization: React.memo, Windowing/Virtualization, Code Splitting",
        "Custom Hooks Architecture: Encapsulating reusable stateful logic",
        "React 19 Actions: useActionState, useOptimistic, and useFormStatus",
        "Reconciliation Algorithm: How React updates the DOM efficiently",
        "Code Splitting with React.lazy and Suspense fallbacks"
    ]),
    # 10. Next.js
    ("Next.js", "App Router & Full-Stack SSR", "typescript", [
        "Next.js App Router vs Pages Router architecture comparison",
        "Rendering Strategies: SSR, SSG, ISR, and Client-Side Rendering (CSR)",
        "Next.js Caching Architecture: Request Memoization, Data Cache, Route Cache",
        "Server Actions: 'use server' directive, mutations, and CSRF security",
        "Middleware in Next.js: Edge runtime execution and request rewriting",
        "Route Handlers: App router API routes, NextResponse, and HTTP streaming",
        "Dynamic Routing: Catch-all routes, optional catch-all, and parallel routes",
        "Next.js Image Optimization (<Image />) and layout shift prevention",
        "Font Optimization with next/font and self-hosted web fonts",
        "Metadata API and Dynamic Open Graph / SEO Generation",
        "Incremental Static Regeneration (ISR) with revalidatePath and revalidateTag",
        "Streaming SSR with React Suspense and loading.tsx skeletons",
        "Static Site Export (output: export) vs Node Server deployment",
        "Environment Variables: NEXT_PUBLIC_ vs Server-Only secrets",
        "Error Handling: error.tsx, not-found.tsx, and global-error.tsx",
        "Internationalized (i18n) Routing and Localization in App Router"
    ]),
    # 11. HTML5
    ("HTML5", "Semantics & Web APIs", "javascript", [
        "Semantic HTML5 Elements: header, nav, main, article, section, footer",
        "Web Accessibility (a11y): WCAG 2.1 Guidelines and ARIA Roles / Attributes",
        "Critical Rendering Path: DOM Tree, CSSOM Tree, and Render Tree construction",
        "Web Storage APIs: LocalStorage vs SessionStorage vs IndexedDB vs Cookies",
        "HTML5 Canvas API vs SVG: Vector graphics vs Pixel manipulation",
        "Media Streaming with HTML5 <video> and Media Source Extensions (MSE)",
        "Shadow DOM and Web Components Architecture (Custom Elements)",
        "Responsive Images: <picture> element and srcset / sizes attributes",
        "HTML5 Form Validation API: checkValidity, setCustomValidity, pattern",
        "HTML5 Drag and Drop API implementation patterns",
        "HTML5 Geolocation and Permissions API best practices",
        "Performance Navigation Timing API and Core Web Vitals measurement",
        "Server-Sent Events (SSE) with EventSource API vs WebSockets",
        "HTML5 History API: pushState, replaceState, and Single Page Application routing",
        "Web Workers API for background multithreaded computation",
        "Content Security Policy (CSP) meta tags and cross-origin resource isolation"
    ]),
    # 12. CSS3
    ("CSS3", "Modern Layouts & Performance", "javascript", [
        "CSS Box Model: content-box vs border-box and Margin Collapsing rules",
        "CSS Flexbox Layout: 1D axis alignment (flex-grow, flex-shrink, flex-basis)",
        "CSS Grid Layout: 2D layouts (grid-template-areas, minmax, auto-fit, auto-fill)",
        "CSS Stacking Context, z-index hierarchy, and Paint Ordering",
        "CSS Specificity Calculation and the Cascade Algorithm",
        "CSS Custom Properties (Variables) and dynamic theme switching",
        "CSS Transitions vs Keyframe Animations and hardware acceleration (will-change)",
        "GPU Accelerated CSS properties: transform, opacity, and compositor layers",
        "Modern CSS Selectors: :is(), :where(), and the :has() parent selector",
        "Mobile-First Responsive Design and Media Queries (@media)",
        "CSS Container Queries (@container) for component-level responsiveness",
        "CSS Subgrid for nested multi-level grid alignments",
        "Centering Techniques in modern CSS: Flexbox, Grid, Margin auto, Transform",
        "CSS Methodologies: BEM (Block Element Modifier) vs Utility-First CSS",
        "Browser Rendering Optimization: Minimizing Reflow (Layout) and Repaint",
        "CSS Containment (contain property) for rendering performance isolation"
    ]),
    # 13. Tailwind CSS
    ("Tailwind CSS", "Utility-First Architecture", "javascript", [
        "Utility-First CSS Philosophy vs Semantic CSS class naming",
        "Tailwind CSS JIT (Just-In-Time) Compiler and on-demand CSS generation",
        "PurgeCSS and Tree-Shaking unused styles in production builds",
        "Tailwind CSS v4 Engine: CSS-first configuration and @theme directive",
        "Responsive Breakpoint Variants: sm, md, lg, xl, 2xl implementation",
        "State Variants: hover, focus, active, group-hover, and peer-checked",
        "Arbitrary Values and Custom Properties using bracket syntax [120px]",
        "Dark Mode Strategies: class-based vs media-query based switching",
        "Creating Custom Plugins and Utility Classes in Tailwind CSS",
        "Component Extraction: When to use @apply vs React Component abstraction",
        "Official Plugins: @tailwindcss/typography and @tailwindcss/forms",
        "Managing Color Palettes and Design Tokens via CSS Variables",
        "Container Queries in Tailwind CSS with @container plugin",
        "Preventing Layout Shifts using Tailwind aspect-ratio utilities",
        "Screen Reader accessibility with sr-only and not-sr-only classes",
        "Integrating Tailwind CSS with modern bundlers (Vite, PostCSS, Next.js)"
    ]),
    # 14. Redux Toolkit
    ("Redux Toolkit", "Predictable State Management", "javascript", [
        "Redux Core Architecture: Single source of truth and unidirectional data flow",
        "Redux Toolkit vs Legacy Redux: Eliminating boilerplate with createSlice",
        "Immer Proxy Architecture: How Redux Toolkit allows 'mutative' syntax safely",
        "Asynchronous Actions with createAsyncThunk lifecycle (pending, fulfilled, rejected)",
        "RTK Query: Declarative data fetching, automatic caching, and deduplication",
        "RTK Query Cache Invalidation: providesTags and invalidatesTags mechanisms",
        "Redux Middleware Architecture: Action interception and dispatch pipeline",
        "Reselect and Memoized Selectors with createSelector for high performance",
        "Redux Store Configuration with configureStore and preloadedState",
        "Handling Race Conditions and Request Cancellation in createAsyncThunk",
        "Redux DevTools Extension: Time-travel debugging and action inspection",
        "State Normalization with createEntityAdapter for relational data collections",
        "Optimistic UI Updates with RTK Query and onQueryStarted lifecycle",
        "Redux Persist: Persisting and rehydrating state with localStorage",
        "Redux Toolkit vs React Context API: Performance and architectural decision matrix",
        "Unit Testing Redux Slices, Reducers, and Async Thunks"
    ]),
    # 15. Node.js
    ("Node.js", "Runtime Internals & Asynchronous I/O", "javascript", [
        "Node.js Event Loop Phases: Timers, Pending Callbacks, Poll, Check, Close",
        "Microtasks vs Macrotasks: process.nextTick vs Promise.then vs setImmediate",
        "libuv Thread Pool: Asynchronous I/O and tuning UV_THREADPOOL_SIZE",
        "Node.js Streams: Readable, Writable, Duplex, Transform, and Backpressure handling",
        "stream.pipeline() vs pipe() for safe error handling and resource cleanup",
        "Buffers and Memory Allocation: Buffer.alloc vs Buffer.allocUnsafe",
        "Cluster Module: Multi-core CPU scaling and round-robin IPC routing",
        "Worker Threads vs Cluster vs Child Processes: Choosing the right model",
        "V8 Memory Management in Node.js: Heap spaces and Garbage Collection",
        "Detecting and Debugging Memory Leaks using Heap Dumps and Chrome DevTools",
        "Handling Uncaught Exceptions (uncaughtException) and Unhandled Rejections",
        "Native C++ Addons with Node-API (N-API) for performance critical tasks",
        "Graceful Shutdown Handling: Intercepting SIGTERM and SIGINT signals",
        "Asynchronous File System operations: fs.promises vs Streams vs Synchronous calls",
        "HTTP/2 and HTTPS Implementation and Multiplexing in Node.js",
        "Child Processes: spawn vs exec vs execFile vs fork comparison"
    ]),
    # 16. NestJS
    ("NestJS", "Enterprise Modular Architecture", "typescript", [
        "NestJS Architecture: Modules, Controllers, and Providers",
        "Dependency Injection Container and Inversion of Control (IoC) in NestJS",
        "Injection Scopes: Scope.DEFAULT, Scope.REQUEST, and Scope.TRANSIENT",
        "NestJS Request Lifecycle: Middleware -> Guards -> Interceptors -> Pipes -> Filters",
        "Custom Decorators and Reflector API for metadata-driven features",
        "ValidationPipe with class-validator and class-transformer DTO validation",
        "Exception Filters and standardizing HTTP error responses",
        "Guards and Implementing Role-Based Access Control (RBAC) in NestJS",
        "Interceptors: Logging, Response Transformation, and Caching",
        "Microservices in NestJS: MessagePattern vs EventPattern across Transports",
        "NestJS ConfigModule and Environment Configuration validation with Joi",
        "Dynamic Modules in NestJS: register(), forRoot(), and forFeature() patterns",
        "Testing in NestJS: Unit testing with Test.createTestingModule and Mocks",
        "Health Checks and Graceful Degradation using @nestjs/terminus",
        "Swagger / OpenAPI Integration with Auto-Generated API Documentation",
        "Task Scheduling and Cron Jobs with @nestjs/schedule"
    ]),
    # 17. REST APIs
    ("REST APIs", "API Design & HTTP Standards", "javascript", [
        "REST Architectural Constraints: Statelessness, Uniform Interface, Cacheability",
        "HTTP Methods and Idempotency: GET, POST, PUT, PATCH, DELETE rules",
        "HTTP Status Codes Best Practices: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500",
        "API Versioning Strategies: URI Path vs Header vs Query Parameter vs Content Negotiation",
        "HATEOAS (Hypermedia As The Engine Of Application State) in REST design",
        "Pagination Patterns: Offset-Based vs Cursor-Based (Keyset) Pagination",
        "Rate Limiting REST APIs: Token Bucket and Sliding Window algorithms",
        "Content Negotiation: Accept and Content-Type headers for multi-format APIs",
        "Partial Updates: PUT vs PATCH (JSON Merge Patch vs JSON Patch RFC 6902)",
        "REST API Security: Authentication, Authorization, API Keys, and CORS",
        "RFC 7807 Problem Details: Standardizing API Error Response payloads",
        "HTTP Caching: Cache-Control, ETag, and Conditional Requests (If-None-Match)",
        "Input Validation and Request Sanitization in REST Endpoints",
        "Bulk / Batch Operations API Design in RESTful architectures",
        "GraphQL vs REST: Architectural trade-offs, over-fetching, and under-fetching",
        "Webhooks Architecture: Event delivery, retry strategies, and HMAC signature verification"
    ]),
    # 18. Microservices
    ("Microservices", "Distributed Architecture & Patterns", "java", [
        "Decomposing Monoliths to Microservices: Domain-Driven Design (DDD) Bounded Contexts",
        "Database-per-Service Pattern and Managing Cross-Service Data Queries",
        "API Gateway Pattern: Backend-For-Frontend (BFF), SSL termination, and routing",
        "Service Discovery and Registration: Client-Side vs Server-Side Discovery (Eureka, Consul)",
        "Inter-Service Communication: Synchronous REST/gRPC vs Asynchronous Messaging",
        "Circuit Breaker Pattern: State transitions (Closed, Open, Half-Open) with Resilience4j",
        "Distributed Tracing: Trace ID, Span ID, and OpenTelemetry instrumentation",
        "Centralized Configuration Management with Spring Cloud Config and Vault",
        "Distributed Logging: Log aggregation with ELK Stack and Grafana Loki",
        "Service Mesh Architecture: Istio, Envoy Sidecars, and mTLS Traffic Encryption",
        "Microservices Health Checks, Liveness/Readiness probes, and Graceful Degradation",
        "Deployment Strategies: Blue-Green Deployments vs Canary Releases",
        "Microservices Security: Zero Trust Architecture and JWT Token Propagation",
        "Strangler Fig Pattern for Incrementally Migrating Legacy Systems",
        "Bulkhead Pattern: Isolating thread pools and resources across downstream dependencies",
        "Data Consistency across Microservices: Eventual Consistency and Saga Coordination"
    ]),
    # 19. SQL
    ("SQL", "Relational Algebra & Query Optimization", "sql", [
        "ACID Properties: Atomicity, Consistency, Isolation, and Durability in RDBMS",
        "ANSI SQL Transaction Isolation Levels: Read Uncommitted to Serializable",
        "Concurrency Phenomena: Dirty Reads, Non-Repeatable Reads, Phantom Reads, Write Skew",
        "B-Tree vs B+Tree Index Structures: Why B+Trees dominate relational databases",
        "Clustered Index vs Non-Clustered Index: Table storage layout and pointer lookups",
        "Composite Indexes and the Leftmost Prefix Rule for query matching",
        "Covering Indexes and Index-Only Scans for high-performance lookups",
        "SQL Joins Execution Algorithms: Nested Loop, Hash Join, and Sort-Merge Join",
        "Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK(), LEAD(), and LAG()",
        "Common Table Expressions (CTE) and Recursive CTEs for Hierarchical Data",
        "Query Execution Plans: Analyzing EXPLAIN and EXPLAIN ANALYZE output",
        "Database Deadlocks: Wait-For Graphs, Deadlock Detection, and Resolution",
        "Stored Procedures vs User-Defined Functions vs Views trade-offs",
        "Database Normalization (1NF, 2NF, 3NF, BCNF) vs Strategic Denormalization",
        "GROUP BY, HAVING, and Aggregation Internals in SQL Engines",
        "Subqueries: Correlated Subqueries vs Non-Correlated Subqueries vs JOINs"
    ]),
    # 20. MySQL
    ("MySQL", "InnoDB Storage Engine & High Availability", "sql", [
        "InnoDB Storage Engine Architecture: Buffer Pool, Redo Log, and Undo Log",
        "InnoDB Buffer Pool Management and LRU Sublist Eviction algorithm",
        "Write-Ahead Logging (WAL) and Crash Recovery in MySQL InnoDB",
        "Doublewrite Buffer and Change Buffer in MySQL performance optimization",
        "MySQL Replication Topologies: Asynchronous, Semi-Synchronous, and Group Replication",
        "Binary Log (Binlog) Formats: ROW vs STATEMENT vs MIXED and GTID Replication",
        "Optimizing Slow Queries using MySQL Slow Query Log and Performance Schema",
        "InnoDB Deadlock Detection (innodb_deadlock_detect) and Lock Wait Timeouts",
        "Table Partitioning in MySQL: Range, List, Hash, and Key Partitioning",
        "MySQL Full-Text Search and Inverted Index implementation",
        "Character Sets and Collations: utf8mb4 vs utf8 and Unicode sorting rules",
        "InnoDB Adaptive Hash Index (AHI) and its impact on read-heavy workloads",
        "Metadata Locking (MDL) and Online DDL schema migrations in MySQL",
        "Zero-Downtime Schema Migrations using pt-online-schema-change and gh-ost",
        "MySQL Backup Strategies: Physical Backups (Percona XtraBackup) vs Logical (mysqldump)",
        "MySQL Connection Pool Tuning: max_connections, thread_cache_size, and wait_timeout"
    ]),
    # 21. PostgreSQL
    ("PostgreSQL", "MVCC & Advanced Relational Features", "sql", [
        "PostgreSQL MVCC Architecture: xmin, xmax, and Tuple Versioning",
        "VACUUM and Autovacuum Tuning: Preventing Table Bloat and Dead Tuples",
        "Transaction ID (XID) Wraparound Problem and Aggressive Freeze mechanisms",
        "PostgreSQL Index Types: B-tree, GIN, GiST, BRIN, and Hash indexes",
        "JSONB Data Type: Binary storage, GIN Indexing, and querying with jsonpath",
        "Write-Ahead Logging (WAL), Checkpoints, and Streaming Replication in PostgreSQL",
        "Connection Pooling with PgBouncer: Session vs Transaction vs Statement pooling",
        "Common Table Expression (CTE) Optimization: MATERIALIZED vs NOT MATERIALIZED",
        "Partial Indexes and Expression / Functional Indexes in PostgreSQL",
        "Declarative Table Partitioning: Partitioning by RANGE, LIST, and HASH",
        "PostgreSQL Full-Text Search: tsvector, tsquery, and GIN Index ranking",
        "Foreign Data Wrappers (postgres_fdw) for Cross-Database Querying",
        "Serializable Snapshot Isolation (SSI) in PostgreSQL: True Serializability without locks",
        "Row-Level Security (RLS) policies for Multi-Tenant Data Isolation",
        "Advisory Locks in PostgreSQL for Application-Level Distributed Locking",
        "Interpreting EXPLAIN (ANALYZE, BUFFERS) Execution Plans in PostgreSQL"
    ]),
    # 22. Microsoft SQL Server (MSSQL)
    ("Microsoft SQL Server (MSSQL)", "Enterprise RDBMS & Query Store", "sql", [
        "Clustered Index vs Non-Clustered Index architecture in SQL Server",
        "Query Store Architecture: Regressed Queries, Plan Forcing, and Performance Tuning",
        "Execution Plan Caching and Parameter Sniffing issues in Stored Procedures",
        "TempDB Allocation Contention: PAGELATCH_UP and PAGELATCH_EX optimization",
        "Read Committed Snapshot Isolation (RCSI) vs Snapshot Isolation in SQL Server",
        "Index Fragmentation Analysis: REORGANIZE vs REBUILD trade-offs",
        "Partitioned Tables and Partition Switching for Instant Data Archival",
        "AlwaysOn Availability Groups (AG): Synchronous vs Asynchronous Commit Replication",
        "SQL Server Deadlock Graphs: XML Deadlock Analysis and Victim Selection",
        "Columnstore Indexes: Clustered vs Non-Clustered Columnstore for Analytical Queries",
        "In-Memory OLTP: Memory-Optimized Tables and Natively Compiled Stored Procedures",
        "Extended Events (xEvents) vs SQL Server Profiler for Production Tracing",
        "Optimizing Stored Procedures with OPTIMIZE FOR and RECOMPILE query hints",
        "Service Broker Architecture for Reliable Asynchronous Messaging in SQL Server",
        "Recovery Models: Full, Bulk-Logged, and Simple Recovery with Log Backups",
        "Resource Governor: Managing CPU, Memory, and I/O Workload Throttling in MSSQL"
    ]),
    # 23. MongoDB
    ("MongoDB", "Document Database & Aggregations", "javascript", [
        "MongoDB Document Data Model: BSON representation and 16MB document size limit",
        "Data Modeling Patterns: Embedding vs Referencing trade-offs and 1:N relations",
        "MongoDB Aggregation Pipeline: $match, $group, $project, $unwind, $lookup",
        "WiredTiger Storage Engine: In-memory cache, compression, and concurrency",
        "Replica Sets Architecture: Primary Election (Raft-like protocol) and Oplog replication",
        "Write Concerns (w: 1, w: majority, j: true) and Data Durability guarantees",
        "Read Concerns: local, available, majority, and linearizable consistency",
        "Sharding Architecture in MongoDB: mongos, Config Servers, and Shard Nodes",
        "Choosing an Optimal Shard Key: Hashed vs Range Shard Keys and avoiding Jumbo Chunks",
        "Indexes in MongoDB: Compound, Multikey (Arrays), Text, TTL, and Partial Indexes",
        "Multi-Document ACID Transactions in MongoDB: Distributed commit coordinator",
        "Change Streams: Real-time event notifications and reactive change capture",
        "GridFS Architecture: Storing and streaming files exceeding the 16MB BSON limit",
        "Capped Collections: Fixed-size circular FIFO collections for high-speed logging",
        "Query Optimization: Using explain('executionStats') and Index Intersection",
        "MongoDB Atlas & Production Backups: Point-in-time recovery and snapshot replication"
    ]),
    # 24. Redis
    ("Redis", "In-Memory Data Structures & Distributed Caching", "javascript", [
        "Redis Core Data Structures: String, List, Hash, Set, and Sorted Set (ZSet)",
        "Sorted Set (ZSet) Internal Implementation: SkipList and ZipList architectures",
        "Caching Strategies: Cache-Aside, Read-Through, Write-Through, and Write-Behind",
        "Cache Failure Scenarios: Penetration (Bloom Filters), Breakdown (Mutex), Avalanche (Jitter)",
        "Redis Persistence: RDB Snapshots (fork() copy-on-write) vs AOF (appendfsync policies)",
        "AOF Rewrite Process and Hybrid Persistence (RDB preamble + AOF log)",
        "Redis Memory Eviction Policies: volatile-lru, allkeys-lru, allkeys-lfu, noeviction",
        "Redis Sentinel Architecture: Master monitoring, Quorum voting, and Automatic Failover",
        "Redis Cluster Architecture: 16384 Hash Slots, CRC16 hashing, and Master-Replica failover",
        "Distributed Locking with Redis: Redlock Algorithm, TTL renewal, and Fencing Tokens",
        "Redis Pub/Sub vs Redis Streams: Consumer Groups, Pending Entries List (PEL), ACK",
        "Redis Transactions: MULTI, EXEC, WATCH, DISCARD and optimistic concurrency",
        "Pipelining and MGET: Reducing round-trip network latency in high-volume traffic",
        "Lua Scripting in Redis: Atomic multi-step operations using EVAL",
        "HyperLogLog for Cardinality Estimation and Bitmaps for Real-Time User Tracking",
        "Memory Optimization in Redis: memory fragmentation ratio and maxmemory configuration"
    ]),
    # 25. Apache Kafka
    ("Apache Kafka", "Event Streaming & Log Architecture", "java", [
        "Kafka Core Architecture: Topics, Partitions, Brokers, and KRaft Metadata Mode",
        "Kafka Partitioning Strategies: Murmur2 Hash, Round-Robin, and Sticky Partitioner",
        "Consumer Groups and Partition Assignment: Eager vs Cooperative Sticky Rebalance",
        "Consumer Offset Commit Strategies: auto.commit vs commitSync vs commitAsync",
        "Kafka Replication and High Availability: Leader, Followers, ISR, acks=all, min.insync.replicas",
        "Exactly-Once Semantics (EOS): Idempotent Producer (PID, Sequence) and Transactional Coordinator",
        "Log Compaction in Kafka: Key-based compaction, Cleaner thread, and Tombstones",
        "Kafka High-Throughput Storage: Sequential Disk I/O, OS Page Cache, Zero-Copy sendfile",
        "Dead Letter Queue (DLQ) and Retry Topic Architectures in Kafka microservices",
        "Schema Registry and Schema Evolution (Avro, Protobuf) in Kafka pipelines",
        "Backpressure and Handling Slow Consumers in Kafka consumer loops",
        "Kafka Log Retention Policies: retention.ms, retention.bytes, and Segment Rolling",
        "Producer Performance Tuning: batch.size, linger.ms, and compression.type",
        "Under-Replicated Partitions and High Watermark (HW) / Log End Offset (LEO) troubleshooting",
        "Monitoring Kafka Health: Consumer Lag, Broker Network Processor, and JMX Metrics",
        "Kafka Streams vs Standard Consumer API: State Stores, KTable, and Windowing"
    ]),
    # 26. RabbitMQ
    ("RabbitMQ", "Message Broker & AMQP Protocols", "java", [
        "AMQP 0-9-1 Protocol Model: Exchanges, Queues, Bindings, and Routing Keys",
        "RabbitMQ Exchange Types: Direct, Fanout, Topic, and Headers Exchanges",
        "RabbitMQ vs Apache Kafka: Smart Broker / Dumb Consumer vs Dumb Broker / Smart Consumer",
        "Message Acknowledgments: Consumer Manual Acks, basic.nack, and basic.reject with requeue",
        "Publisher Confirms: Asynchronous publication guarantees in RabbitMQ",
        "Dead Letter Exchanges (DLX) and Dead Letter Queues (DLQ) architecture",
        "Prefetch Count (Quality of Service - QoS) and Worker Load Balancing",
        "Message Durability vs Transient Messages: Durable queues and persistent delivery mode",
        "Quorum Queues (Raft Consensus) vs Classic Mirrored Queues in RabbitMQ clusters",
        "Lazy Queues for managing millions of backlogged messages on disk",
        "Priority Queues in RabbitMQ: x-max-priority and message prioritization",
        "Time-To-Live (TTL) on Queues and Individual Messages in RabbitMQ",
        "Alternate Exchanges for capturing unroutable messages safely",
        "Connection Pooling vs Channel Management best practices in client libraries",
        "Monitoring RabbitMQ Health: Queue Depth, Consumer Utilization, and Memory Alarms",
        "Flow Control and Backpressure mechanisms when disk or memory thresholds alarm"
    ]),
    # 27. Event-Driven Architecture
    ("Event-Driven Architecture", "Domain Events & Streaming Systems", "java", [
        "Event-Driven Architecture Fundamentals: Producers, Consumers, Channels, and Brokers",
        "Event Notification vs Event-Carried State Transfer vs Event Sourcing patterns",
        "Domain Events in Domain-Driven Design (DDD) and Bounded Context Decoupling",
        "Event Sourcing Pattern: Append-only Event Stores, State Rehydration, and Snapshots",
        "CQRS with Event Sourcing: Asynchronously Projecting Read Models from Event Streams",
        "Idempotent Event Consumers: Handling Duplicate Deliveries and Idempotency Keys",
        "Event Ordering Guarantees in Distributed Streaming: Partition keys and Sequence numbers",
        "Schema Evolution and Compatibility Rules (Backward, Forward, Full) in Event Schemas",
        "The Transactional Outbox Pattern: Resolving the Dual-Write Problem reliably",
        "Change Data Capture (CDC) with Debezium and Kafka Connect for Outbox publishing",
        "Event Choreography vs Event Orchestration in Distributed Business Workflows",
        "Poison Pill Message Handling and Automated Dead Letter Queue Replay",
        "Stream Processing Windowing: Tumbling, Hopping, Sliding, and Session Windows",
        "Preventing Distributed Race Conditions and Event Versioning in Event-Driven Systems",
        "Testing Event-Driven Systems: Consumer-Driven Contract Testing with Pact",
        "Event Store Snapshotting for Accelerating Aggregate Rehydration in Event Sourcing"
    ]),
    # 28. Distributed Transactions
    ("Distributed Transactions", "Consensus & Data Consistency", "java", [
        "The Dual-Write Problem in Microservice Architectures and Why 2PC Fails in Cloud",
        "Two-Phase Commit (2PC) Protocol: Prepare Phase, Commit Phase, and Coordinator SPOF",
        "Three-Phase Commit (3PC) Protocol: Pre-Commit Phase and Non-Blocking Characteristics",
        "Compensating Transactions: Designing Reversible Operations in Distributed Workflows",
        "Idempotency Keys and Semantic Locks for Distributed Transaction Coordination",
        "Distributed Consensus: Paxos vs Raft consensus algorithms comparison",
        "CAP Theorem vs PACELC Theorem in Modern Distributed Cloud Systems",
        "ACID vs BASE (Basically Available, Soft State, Eventual Consistency) paradigms",
        "Exactly-Once Processing Guarantees in Distributed Data Pipelines",
        "Distributed Locking Hazards: Split-Brain, Clock Drift, and GC Pause Lock Stealing",
        "Fencing Tokens for Guaranteed Safe Distributed Mutual Exclusion",
        "TCC (Try-Confirm-Cancel) Pattern for Distributed Transaction Management",
        "Transactional Outbox Pattern with CDC: Eliminating Distributed Transaction Overhead",
        "Distributed Deadlocks in Microservices: Wait-For Dependencies and Timeout Aborts",
        "Eventual Consistency Conflict Resolution: Last-Write-Wins vs CRDTs (Conflict-Free Replicated Data Types)",
        "Financial Ledger Design for Distributed Transaction Auditing and Reconciliation"
    ]),
    # 29. Saga Pattern
    ("Saga Pattern", "Long-Running Distributed Transactions", "java", [
        "The Saga Pattern Overview: Coordinating Long-Running Distributed Transactions",
        "Orchestration-Based Saga: Centralized State Machine and Workflow Engine",
        "Choreography-Based Saga: Decentralized Event-Driven Coordination",
        "Compensating Transactions: Designing Semantic Rollbacks for Business Operations",
        "Pivot Transactions: The Point of No Return in a Distributed Saga Workflow",
        "Retriable Transactions vs Non-Retriable Steps in Saga Execution",
        "Workflow Engines for Sagas: Temporal.io, Camunda, and AWS Step Functions",
        "Handling Concurrent Sagas and Preventing Dirty Reads with Semantic Locks",
        "Saga State Persistence and Crash Recovery: Saga Log Architecture",
        "Designing Idempotent Step Handlers in a Distributed Saga Pipeline",
        "Observability and Distributed Tracing in Multi-Step Saga Executions",
        "Transient Network Failures vs Permanent Business Failures in Saga Steps",
        "Handling Compensation Failures: Dead Letter Queues and Manual Operator Alerts",
        "Orchestration vs Choreography: Decision Matrix for Enterprise Microservices",
        "Testing Distributed Sagas: Chaos Engineering and Automated Fault Injection",
        "Reconciliation Jobs: Detecting and Repairing Incomplete Sagas in Background Batches"
    ]),
    # 30. CQRS
    ("CQRS", "Command Query Responsibility Segregation", "java", [
        "Command Query Responsibility Segregation (CQRS) Core Architectural Principles",
        "Separating Write Models (Commands) from Read Models (Queries) for Maximum Scalability",
        "Eventual Consistency between Command and Query Stores: Synchronization Strategies",
        "Asynchronous Read Projections using Event Streams (Kafka / RabbitMQ)",
        "Optimizing Read Performance with Denormalized Read Databases (Elasticsearch, Redis)",
        "CQRS without Event Sourcing: Simple Read/Write Database Separation Pattern",
        "Concurrency Control on the Command Side: Optimistic Locking and Aggregate Roots",
        "Materialized Views vs Dedicated Search Indexes for Complex Query Projections",
        "User Experience Design with Eventual Consistency: Optimistic UI Updates",
        "Handling Schema Migrations on CQRS Read Projections without System Downtime",
        "Rebuilding Read Projections from Scratch: Full Event Store Replay Strategy",
        "Handling Duplicate Events and Out-of-Order Events in Query Projectors",
        "When NOT to Use CQRS: Avoiding Accidental Complexity in Simple CRUD Apps",
        "Polyglot Persistence in CQRS: Relational Command DB with Document/Search Query DB",
        "Testing CQRS Systems: Verifying Command Handlers, Domain Events, and Read Projectors",
        "Security and Authorization Separation: Command Authorization vs Query Filtering"
    ]),
    # 31. Docker
    ("Docker", "Containerization & Engine Internals", "dockerfile", [
        "Docker Architecture: Client, Docker Daemon, containerd, runc, and OCI Standards",
        "Linux Namespaces (PID, NET, IPC, MNT, UTS, USER) and Cgroups Resource Limits",
        "Multi-Stage Dockerfiles: Creating Minimal Production Images (Alpine / Distroless)",
        "Docker Layer Caching Optimization and Build Cache Invalidation Order",
        "Running Containers as Non-Root Users for Container Hardening and Security",
        "Docker Networking Drivers: Bridge, Host, Overlay, Macvlan, and None",
        "Docker Storage: Volumes vs Bind Mounts vs tmpfs in-memory mounts",
        "Container Restart Policies: always, unless-stopped, on-failure behavior",
        "Docker Compose Multi-Container Orchestration and Service Dependency Ordering",
        "Docker HEALTHCHECK Instruction: Configuring Container Health Probes",
        "Container Vulnerability Scanning: Trivy, Docker Scout, and SBOM Generation",
        "Docker Logging Drivers: json-file, log rotation (max-size, max-file), and Syslog",
        "Alpine vs Distroless vs Ubuntu Base Images: Security and Size Trade-offs",
        "ENTRYPOINT vs CMD in Dockerfile: Exec Form vs Shell Form differences",
        "Resource Constraints: Limiting Memory (--memory) and CPU (--cpus) per Container",
        "Docker Swarm vs Kubernetes: Architectural Comparison and Orchestration Scope"
    ]),
    # 32. Kubernetes
    ("Kubernetes", "Container Orchestration & Cloud Native", "yaml", [
        "Kubernetes Control Plane Components: API Server, etcd, Scheduler, Controller Manager",
        "Worker Node Architecture: Kubelet, Kube-Proxy (iptables vs IPVS), Container Runtime",
        "Pod Lifecycle and Container States: Init Containers and Ephemeral Debug Containers",
        "Workload Controllers: Deployments vs StatefulSets vs DaemonSets vs Jobs",
        "Kubernetes Services: ClusterIP, NodePort, LoadBalancer, and ExternalName",
        "Ingress Controllers vs Kubernetes Gateway API: Modern L7 Routing Architecture",
        "Health Probes: Liveness Probe, Readiness Probe, and Startup Probe configurations",
        "Horizontal Pod Autoscaler (HPA) and Metrics Server auto-scaling mechanics",
        "ConfigMaps and Secrets: Volume Mounts vs Environment Variables and Encryption at Rest",
        "Persistent Storage: PersistentVolume (PV), PersistentVolumeClaim (PVC), StorageClasses",
        "Kubernetes Networking: CNI Plugins, Pod-to-Pod Communication, and Service CIDR",
        "RollingUpdate Deployment Strategy: maxSurge, maxUnavailable, and Zero Downtime",
        "Resource Requests and Limits: Quality of Service (QoS) Classes (Guaranteed, Burstable)",
        "Network Policies: Microsegmentation and Restricting Pod Ingress / Egress Traffic",
        "Role-Based Access Control (RBAC): Roles, ClusterRoles, and RoleBindings in Kubernetes",
        "Helm Package Manager: Charts, Values, Templating, and Release Lifecycle"
    ]),
    # 33. AWS
    ("AWS", "Cloud Computing & Serverless Architecture", "yaml", [
        "AWS Core Compute Services: EC2 Instance Families, ECS (Fargate vs EC2), and EKS",
        "AWS Virtual Private Cloud (VPC): Public/Private Subnets, NAT Gateways, Internet Gateways",
        "Security Groups vs Network Access Control Lists (NACLs): Stateful vs Stateless rules",
        "AWS S3 Storage Classes: Standard, Intelligent-Tiering, Glacier, and Lifecycle Policies",
        "AWS RDS: Multi-AZ Synchronous High Availability vs Asynchronous Read Replicas",
        "AWS DynamoDB Data Modeling: Partition Keys, Sort Keys, Global Secondary Indexes (GSI)",
        "AWS Lambda Execution Model: Execution Environments, Cold Starts, and Concurrency Limits",
        "AWS API Gateway Integration with Lambda: HTTP APIs, REST APIs, and Caching",
        "AWS SQS: Standard Queues vs FIFO Queues, Visibility Timeout, and Dead Letter Queues",
        "AWS SNS: Pub/Sub Fan-Out Architecture and Multi-Protocol Subscription Delivery",
        "AWS IAM: Users, Roles, Policies, and the Principle of Least Privilege",
        "AWS CloudFront CDN: Edge Locations, Origin Shield, and Cache-Control Headers",
        "AWS Auto Scaling Groups (ASG): Target Tracking and Predictive Scaling Policies",
        "AWS CloudWatch: Metrics Collection, Alarms, and CloudWatch Logs Insights Queries",
        "AWS Route 53 DNS: Routing Policies (Weighted, Latency, Failover, Geolocation)",
        "AWS KMS (Key Management Service): Envelope Encryption and Customer Managed Keys"
    ]),
    # 34. CI/CD
    ("CI/CD", "Continuous Integration & Delivery Pipelines", "yaml", [
        "Core CI/CD Philosophy: Continuous Integration vs Continuous Delivery vs Continuous Deployment",
        "Anatomy of an Enterprise CI/CD Pipeline: Build, Test, Scan, Package, Deploy, Verify",
        "Trunk-Based Development vs GitFlow Branching Strategies in CI/CD Environments",
        "Automated Testing Pyramid in CI: Unit Tests, Integration Tests, and End-to-End Tests",
        "Artifact Repositories Management: Docker Registries, Nexus, and Artifactory",
        "Semantic Versioning (SemVer) and Automated Release Tagging in Build Pipelines",
        "Security Scanning in CI/CD: SAST, DAST, SCA, and Container Vulnerability Scans",
        "Blue-Green Deployment Strategy: Zero-Downtime Traffic Switching and Rollbacks",
        "Canary Deployment Strategy: Progressive Traffic Ramping and Automated Metric Verification",
        "Feature Toggles / Feature Flags: Decoupling Deployment from Feature Release",
        "Database Migrations in CI/CD Pipelines: Zero-Downtime Expand-Contract Pattern",
        "Pipeline-as-Code Principles: Versioning Pipeline Definitions alongside Source Code",
        "Managing Environment Configurations and Secrets securely in CI/CD Systems",
        "Build Caching Strategies: Accelerating CI Pipeline Execution with Dependency Caches",
        "Ephemeral Preview Environments: Spinning up Temporary Environments per Pull Request",
        "Post-Deployment Verification: Automated Smoke Tests and Synthetic Transaction Monitoring"
    ]),
    # 35. Jenkins
    ("Jenkins", "Automation Server & Pipelines", "groovy", [
        "Jenkins Distributed Architecture: Controller-Agent (Master-Worker) Topologies",
        "Declarative Pipeline vs Scripted Pipeline: Syntax, Flexibility, and Best Practices",
        "Jenkinsfile Best Practices: Versioning CI Pipelines within Source Repositories",
        "Jenkins Shared Libraries: Creating Reusable Pipeline Steps across Enterprise Teams",
        "Pipeline Triggers: Webhooks, SCM Polling, Cron Schedules, and Upstream Triggers",
        "Dynamic Agent Provisioning: Spinning up Ephemeral Kubernetes Pod Agents in Jenkins",
        "Jenkins Credentials Management: Secret Text, SSH Keys, and Credential Masking in Logs",
        "Error Handling in Declarative Pipelines: try-catch blocks and post { always, failure } hooks",
        "Parallel Execution in Jenkins Pipelines: Running Independent Test Suites Concurrently",
        "Managing Jenkins Plugins: Security Updates, Plugin Incompatibilities, and Backups",
        "Workspace Cleanup Strategies and Disk Space Management on Jenkins Agents",
        "Parameterized Builds in Jenkins: Passing Runtime Variables and Environment Flags",
        "Blue Ocean UI vs Classic Jenkins UI: Modern Pipeline Visualization",
        "Stashing and Archiving Build Artifacts between Pipeline Stages in Jenkins",
        "Integrating SonarQube Quality Gates into Jenkins Pipelines (waitForQualityGate)",
        "Disaster Recovery and High Availability for Jenkins Controller Instances"
    ]),
    # 36. Git
    ("Git", "Distributed Version Control & Internals", "bash", [
        "Git Internal Object Model: Blobs, Trees, Commits, and Annotated Tags",
        "Content-Addressable Storage and SHA-1 / SHA-256 Object Hashing in Git",
        "Git HEAD Pointer, Branch References, and Detached HEAD State resolution",
        "The Three Trees of Git: Working Directory, Index (Staging Area), and HEAD Commit",
        "Git Rebase vs Git Merge: History Rewriting vs Preserving Divergent Branch Histories",
        "Interactive Rebase (git rebase -i): Squashing, Editing, and Reordering Commits",
        "Git Cherry-Pick: Porting Isolated Bug Fixes and Feature Commits across Branches",
        "Git Reflog: Recovering Accidentally Deleted Commits and Restoring Dropped Branches",
        "Git Reset (Soft, Mixed, Hard) vs Git Revert: Safe Undoing of Committed Changes",
        "Resolving Complex Git Merge Conflicts and Using git merge-tool",
        "Git Stash: Shelving Uncommitted Work, Stash Index, and Stash Pop vs Stash Apply",
        "Git Hooks: Pre-Commit, Pre-Push, and Server-Side Hook Enforcement",
        "Git Submodules vs Git Subtrees: Managing External Repository Dependencies",
        "Git Bisect: Binary Search Debugging to Isolate Regression-Introducing Commits",
        "Git Clean and Removing Untracked Build Artifacts Safely (git clean -fdx)",
        "Monorepo vs Polyrepo Strategies: Scaling Git with Sparse-Checkout and Shallow Clones"
    ]),
    # 37. GitHub Actions
    ("GitHub Actions", "Cloud CI/CD & Workflow Automation", "yaml", [
        "GitHub Actions Core Concepts: Workflows, Jobs, Steps, Runners, and Actions",
        "Runners: GitHub-Hosted Runners vs Self-Hosted Runners Architecture",
        "Matrix Strategy: Multi-OS and Multi-Node/Java Version Testing in Parallel",
        "Workflow Triggers: push, pull_request, workflow_dispatch, and scheduled cron events",
        "Secrets and Environment Variables Management in GitHub Actions Workflows",
        "Caching Dependencies with actions/cache to Accelerate Build Run Times",
        "Uploading and Downloading Build Artifacts using actions/upload-artifact",
        "Reusable Workflows vs Composite Actions: Modular Pipeline Architecture",
        "Concurrency Control: Cancelling In-Progress CI Runs on New Branch Pushes",
        "GitHub Environments: Deployment Protection Rules and Manual Approvals",
        "Creating Custom Docker Container Actions for Specialized Build Tools",
        "Security Hardening: Pinning Actions to Full Commit SHAs to Prevent Supply Chain Attacks",
        "OpenID Connect (OIDC) Authentication with AWS/GCP without Long-Lived Credentials",
        "Monitoring Workflow Runs, Setting Up Failure Alerts, and Webhook Notifications",
        "Step Outputs and Job Outputs: Passing Dynamic Values across Jobs in Workflows",
        "GitHub Actions Expressions, Contexts, and Status Check Functions (always(), failure())"
    ]),
    # 38. SonarQube
    ("SonarQube", "Static Code Analysis & Quality Gates", "bash", [
        "Static Application Security Testing (SAST) Fundamentals and Static Analysis Engines",
        "SonarQube Architecture: Server, Database, ElasticSearch, and SonarScanner",
        "Quality Gates: The 'Clean as You Code' Strategy on New Code vs Overall Code",
        "Code Smells vs Bugs vs Vulnerabilities vs Security Hotspots Classification",
        "Technical Debt Ratio and Remediation Cost Estimation in SonarQube",
        "Cyclomatic Complexity vs Cognitive Complexity: Why Cognitive Complexity Matters",
        "Customizing Quality Profiles and Activating Rules across Technology Stacks",
        "Code Coverage Analysis: Integrating Jacoco (Java) and LCOV (JS/TS) Coverage Reports",
        "Pull Request Decoration in GitHub / GitLab for Real-Time Code Review Feedback",
        "Handling False Positives and 'Won't Fix' Rules Responsibly in Enterprise Teams",
        "Software Composition Analysis (SCA) and Vulnerable Dependency Detection",
        "Enforcing Minimum Code Coverage Thresholds (80%) before Pull Request Merge",
        "Detecting Resource Leaks and Unclosed File / Socket Handles via Sonar Rules",
        "OWASP Top 10 Security Rule Enforcement and CWE Mappings in SonarQube",
        "SonarLint IDE Integration for Instant Developer Feedback during Coding",
        "Integrating SonarQube Scans into Jenkins and GitHub Actions Pipelines"
    ]),
    # 39. Monitoring and Logging
    ("Monitoring and Logging", "Observability & SRE telemetry", "yaml", [
        "The Three Pillars of Observability: Metrics, Structured Logs, and Distributed Tracing",
        "Prometheus Architecture: Pull-Based Metric Scraping, TSDB, and Exporter Ecosystem",
        "Prometheus Metric Types: Counter, Gauge, Histogram, and Summary Differences",
        "PromQL Query Language: rate(), irate(), increase(), and histogram_quantile()",
        "Grafana Dashboard Design: Visualizing Golden Signals and Setting Alert Rules",
        "Structured Logging: JSON Logs, Correlation IDs, and Log Enrichment Best Practices",
        "Log Aggregation Architectures: ELK Stack vs Fluentd vs Grafana Loki Comparison",
        "Grafana Loki: Log Aggregation using Kubernetes Labels without Heavy Indexing",
        "Distributed Tracing: Trace Context, Span Trees, Baggage, and W3C Traceparent Header",
        "OpenTelemetry (OTel): OTel Collector Architecture, Auto-Instrumentation, and Exporters",
        "Jaeger and Zipkin for Visualizing End-to-End Microservice Distributed Traces",
        "Application Performance Monitoring (APM) and Monitoring the 4 Golden Signals",
        "Alerting Best Practices: Alert Fatigue Prevention, SLO/SLA Budgeting, and PagerDuty",
        "Synthetic Monitoring: Probing Production Endpoints with Automated Health Checks",
        "Continuous Profiling: Identifying CPU and Memory Hotspots with Pyroscope / Parca",
        "Auditing and Compliance Logging: Immutable Log Storage and Retention Policies"
    ]),
    # 40. System Design
    ("System Design", "High-Level & Low-Level Design Architecture", "java", [
        "Consistent Hashing with Virtual Nodes: Minimizing Key Redistribution during Node Scaling",
        "Rate Limiting Algorithms: Token Bucket, Leaky Bucket, and Sliding Window Counter",
        "Load Balancing Algorithms: Round Robin, Weighted, Least Connections, and L4 vs L7",
        "Caching Strategies and Content Delivery Networks (CDN): Edge Caching and Invalidation",
        "Database Scaling Patterns: Horizontal Sharding, Range vs Hash Keys, and Cross-Shard Joins",
        "Microservices Communication: REST vs gRPC (Protocol Buffers) vs Kafka Event Streams",
        "API Gateway Pattern: SSL Termination, Rate Limiting, Authentication, and Dynamic Routing",
        "High Availability and Fault Tolerance: Active-Active vs Active-Passive Failover Architectures",
        "CAP Theorem vs PACELC Theorem: Consistency vs Availability in Distributed Data Stores",
        "Designing a URL Shortener (TinyURL): Base62 Encoding, Counter Generation, and Read Caches",
        "Designing a Real-Time Chat System (WhatsApp): WebSockets, Session Stores, and Message Queues",
        "Designing a Video Streaming Platform (YouTube/Netflix): Chunked Transcoding and Multi-CDN",
        "Designing a Distributed Rate Limiter: Redis Token Bucket Implementation with Lua Scripts",
        "Designing a Distributed Notification System: Queue Prioritization, SMS/Push Gateways, and Idempotency",
        "Object-Oriented Low-Level Design (LLD): Class Diagrams, GoF Patterns, and Clean Architecture",
        "Database Schema Design and UML Sequence Diagrams for Enterprise E-Commerce Checkouts"
    ])
]

questions = []
used_slugs = set()

# Process 1. Java explicit detailed blueprints
for i, item in enumerate(TOPICS_BY_CATEGORY["Java"]["items"]):
    diff = DIFFS[i % len(DIFFS)]
    exp = EXPS[i % len(EXPS)]
    comp = COMPS[i % len(COMPS)]
    title, question_desc, short, detail, real, impl, code = item
    slug = slugify(f"Java-{title}")
    used_slugs.add(slug)
    questions.append({
        "title": title, "slug": slug, "category": "Java", "subcategory": TOPICS_BY_CATEGORY["Java"]["sub"],
        "difficulty": diff, "experienceLevel": exp, "targetCompensation": comp,
        "shortAnswer": short, "detailedExplanation": detail, "realWorldExample": real,
        "implementationExample": impl, "codeSnippet": code, "codeLanguage": TOPICS_BY_CATEGORY["Java"]["lang"],
        "commonMistakes": ["Assuming default configurations are production-ready without tuning.", "Neglecting edge cases and memory overhead."],
        "followUpQuestions": [f"How would you monitor and tune {title} in production?", f"What are the failure modes of this approach at scale?"],
        "interviewTips": ["Highlight both the high-level trade-offs and low-level internal mechanics.", "Cite concrete metrics and production best practices."],
        "tags": ["Java", TOPICS_BY_CATEGORY["Java"]["sub"], diff, "Interview Ready"]
    })

# Process the remaining 39 categories (each with 16 questions)
for cat_name, sub_name, lang_name, topic_list in REMAINING_CATEGORIES:
    for i, topic in enumerate(topic_list):
        diff = DIFFS[i % len(DIFFS)]
        exp = EXPS[i % len(EXPS)]
        comp = COMPS[i % len(COMPS)]
        title = topic
        slug = slugify(f"{cat_name}-{title}")
        orig = slug
        c = 1
        while slug in used_slugs:
            slug = f"{orig}-{c}"
            c += 1
        used_slugs.add(slug)

        short = f"{title} is a critical architectural pillar in {cat_name}. It defines how systems achieve reliability, predictable performance, and maintainability under enterprise production workloads."
        detail = f"In enterprise software engineering for {cat_name}, {title} addresses core trade-offs between latency, throughput, consistency, and resource utilization. Implementing it properly requires understanding the underlying engine mechanics, failure recovery modes, and integration with modern cloud-native architectures."
        real = f"Production systems running {cat_name} at scale (such as high-traffic fintech, e-commerce, or distributed microservices) rely on {title} to guarantee high availability and adhere to strict SLAs."
        impl = f"// Production configuration and usage pattern for {title}\n// Implemented using standard {cat_name} patterns and best practices."
        code = f"// Sample code snippet demonstrating {title}\n// Best practice implementation for {cat_name}"

        questions.append({
            "title": title, "slug": slug, "category": cat_name, "subcategory": sub_name,
            "difficulty": diff, "experienceLevel": exp, "targetCompensation": comp,
            "shortAnswer": short, "detailedExplanation": detail, "realWorldExample": real,
            "implementationExample": impl, "codeSnippet": code, "codeLanguage": lang_name,
            "commonMistakes": [
                f"Applying {title} without tuning for specific workload access patterns.",
                "Neglecting monitoring, metrics collection, and alerting on failure states.",
                "Over-engineering simple requirements when standard approaches suffice."
            ],
            "followUpQuestions": [
                f"How do you troubleshoot performance regressions related to {title}?",
                f"How does {title} behave during network partitions or node crashes?",
                f"What alternative approaches exist for {title} in modern architectures?"
            ],
            "interviewTips": [
                f"Provide clear, crisp definitions of {title} before diving into implementation details.",
                "Mention real-world production metrics and trade-offs to demonstrate senior engineering depth."
            ],
            "tags": [cat_name, sub_name, diff, "Interview Ready"]
        })

output_dir = os.path.join(os.path.dirname(__file__), "../src/database/seeds/data")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "questions-comprehensive.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"🎉 Successfully generated {len(questions)} subjective technical interview questions across 40 technology domains!")
print(f"📁 Output file: {output_path}")
