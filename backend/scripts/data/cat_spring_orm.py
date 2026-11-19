"""
Spring Framework, Hibernate, JPA, and Spring Security Category Data
"""

SPRING_ORM_DATA = [
    {
        "category": "Spring Framework",
        "subcategory": "Core IoC & Lifecycle",
        "lang": "java",
        "questions": [
            {
                "title": "Explain ApplicationContext vs BeanFactory in Spring Core.",
                "shortAnswer": "BeanFactory is the basic IoC container providing lazy initialization and DI. ApplicationContext extends BeanFactory with eager singleton pre-instantiation, AOP integration, MessageSource i18n, and Event publication.",
                "detailedExplanation": "BeanFactory loads beans on-demand (lazy), suitable for memory-constrained environments. ApplicationContext pre-instantiates singletons at startup, detecting configuration errors early. Implementations: AnnotationConfigApplicationContext, ClassPathXmlApplicationContext.",
                "realWorldExample": "Enterprise web services use ApplicationContext to fail fast at deployment if any dependency or configuration is missing.",
                "implementationExample": "ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);\nMyService svc = ctx.getBean(MyService.class);",
                "codeSnippet": "public interface ApplicationContext extends EnvironmentCapable, ListableBeanFactory, HierarchicalBeanFactory, MessageSource, ApplicationEventPublisher, ResourcePatternResolver {}",
                "commonMistakes": ["Using BeanFactory directly in modern Spring Boot apps.", "Assuming ApplicationContext creates prototype beans at startup (prototypes are always created on demand)."],
                "followUpQuestions": ["What is eager vs lazy initialization of beans?", "How does Spring Boot bootstrap its ApplicationContext?"],
                "interviewTips": ["Highlight that ApplicationContext adds enterprise features (events, i18n, resource loading) on top of BeanFactory."]
            },
            {
                "title": "Explain BeanPostProcessor vs BeanFactoryPostProcessor in Spring.",
                "shortAnswer": "BeanFactoryPostProcessor operates on BeanDefinition metadata before any beans are created. BeanPostProcessor operates on actual bean instances after creation, before and after initialization (used for AOP proxies).",
                "detailedExplanation": "PropertySourcesPlaceholderConfigurer is a BeanFactoryPostProcessor that resolves ${property} placeholders. BeanPostProcessor (e.g. CommonAnnotationBeanPostProcessor) executes @PostConstruct and wraps beans in AOP proxies.",
                "realWorldExample": "Custom BeanFactoryPostProcessor dynamically modifying database connection URLs based on tenant configuration before DataSource instantiation.",
                "implementationExample": "@Component\npublic class CustomBFPP implements BeanFactoryPostProcessor {\n    public void postProcessBeanFactory(ConfigurableListableBeanFactory factory) {\n        BeanDefinition bd = factory.getBeanDefinition(\"myService\");\n        bd.setLazyInit(true);\n    }\n}",
                "codeSnippet": "@Component\npublic class CustomBPP implements BeanPostProcessor {\n    public Object postProcessBeforeInitialization(Object b, String n) { return b; }\n    public Object postProcessAfterInitialization(Object b, String n) { return wrapProxy(b); }\n}",
                "commonMistakes": ["Injecting standard beans into BeanFactoryPostProcessor (causes early bean creation without post-processors).", "Confusing metadata modification with instance modification."],
                "followUpQuestions": ["Why do BeanFactoryPostProcessors run before BeanPostProcessors?", "How does @Value property injection relate to PropertySourcesPlaceholderConfigurer?"],
                "interviewTips": ["State clearly: BFPP touches BeanDefinitions; BPP touches Bean instances."]
            },
            {
                "title": "Explain Spring Expression Language (SpEL) and its architectural usage.",
                "shortAnswer": "SpEL is a powerful expression language supporting querying and manipulating an object graph at runtime. Used in @Value, @PreAuthorize, @EventListener, and cache keys.",
                "detailedExplanation": "SpEL expressions evaluate against an EvaluationContext. Features: literal expressions, boolean and relational operators, regular expressions, class expressions, method invocation, and collection projection/selection (?[]).",
                "realWorldExample": "Dynamic cache key generation based on method parameters in high-traffic APIs using @Cacheable(key = \"#userId + '_' + #tenantId\").",
                "implementationExample": "ExpressionParser parser = new SpelExpressionParser();\nExpression exp = parser.parseExpression(\"name == 'Dev' ? 'Active' : 'Inactive'\");\nEvaluationContext context = new StandardEvaluationContext(user);\nString status = (String) exp.getValue(context);",
                "codeSnippet": "@Cacheable(value = \"users\", key = \"#user.id\", condition = \"#user.age > 18\")\npublic User getUser(User user) { return user; }",
                "commonMistakes": ["SpEL injection vulnerabilities when evaluating untrusted user inputs dynamically.", "Complex logic in SpEL expressions making code unmaintainable and un-testable."],
                "followUpQuestions": ["What is SimpleEvaluationContext vs StandardEvaluationContext?", "How does collection projection in SpEL work with .![property]?"],
                "interviewTips": ["Mention security implications: use SimpleEvaluationContext for untrusted input to disable arbitrary code execution."]
            },
            {
                "title": "Explain Spring Caching Abstraction (@Cacheable, @CachePut, @CacheEvict).",
                "shortAnswer": "Spring caching provides transparent caching over methods via AOP. @Cacheable queries the cache first; @CachePut executes the method and updates the cache; @CacheEvict removes stale entries.",
                "detailedExplanation": "CacheManager (e.g., RedisCacheManager, CaffeineCacheManager) manages Cache instances. If key exists in cache, method execution is bypassed. @CacheEvict with allEntries=true clears entire cache namespaces.",
                "realWorldExample": "Caching product catalog details in Redis for 10 minutes to shield relational databases from 100,000 read queries/sec.",
                "implementationExample": "@Service\npublic class ProductService {\n    @Cacheable(value = \"products\", key = \"#id\", unless = \"#result == null\")\n    public Product getProduct(Long id) { return productRepo.findById(id).orElse(null); }\n    \n    @CachePut(value = \"products\", key = \"#product.id\")\n    public Product update(Product product) { return productRepo.save(product); }\n    \n    @CacheEvict(value = \"products\", key = \"#id\")\n    public void delete(Long id) { productRepo.deleteById(id); }\n}",
                "codeSnippet": "@EnableCaching\n@Configuration\npublic class CacheConfig { @Bean public CacheManager cacheManager() { return new ConcurrentMapCacheManager(); } }",
                "commonMistakes": ["Self-invocation of @Cacheable methods within the same class (bypasses Spring AOP proxy).", "Not setting TTL on cache entries causing stale data accumulation."],
                "followUpQuestions": ["What is the difference between condition and unless in @Cacheable?", "How do you handle Redis cache serialization with GenericJackson2JsonRedisSerializer?"],
                "interviewTips": ["Emphasize that unless evaluates AFTER method execution against #result, while condition evaluates BEFORE."]
            },
            {
                "title": "Explain FactoryBean in Spring and when to use it over standard @Bean.",
                "shortAnswer": "FactoryBean<T> is a programmatic bean creation interface for complex object instantiation logic. getObject() returns the created bean; getObjectType() returns its type. Prefixing bean name with '&' retrieves the FactoryBean itself.",
                "detailedExplanation": "When bean creation requires extensive setup, reflection, or proxy construction (e.g. JpaRepositoryFactoryBean, ProxyFactoryBean), FactoryBean encapsulates the complexity cleanly inside Spring IoC.",
                "realWorldExample": "Spring Data JPA using JpaRepositoryFactoryBean to dynamically generate repository interface proxy implementations at startup.",
                "implementationExample": "public class ConnectionFactoryBean implements FactoryBean<Connection> {\n    public Connection getObject() throws Exception { return DriverManager.getConnection(url); }\n    public Class<?> getObjectType() { return Connection.class; }\n    public boolean isSingleton() { return false; }\n}",
                "codeSnippet": "// Retrieving the FactoryBean instance itself\nFactoryBean<?> fb = (FactoryBean<?>) ctx.getBean(\"&connectionBean\");",
                "commonMistakes": ["Confusing FactoryBean with @Bean method or BeanFactory.", "Forgetting that getObject() can return singletons or prototypes depending on isSingleton()."],
                "followUpQuestions": ["What does the '&' prefix do when querying getBean()?", "How does Spring Data JPA leverage FactoryBean?"],
                "interviewTips": ["Highlight: 'BeanFactory is the container; FactoryBean is a bean that produces other beans.'"]
            },
            {
                "title": "Explain Spring Profiles and configuration precedence in enterprise apps.",
                "shortAnswer": "Spring Profiles (@Profile) segregate configuration beans and properties per environment (dev, stage, prod). Activated via spring.profiles.active. Properties follow strict precedence order.",
                "detailedExplanation": "Precedence order: Command line args > JVM system properties > OS environment variables > Profile-specific config (application-prod.yml) > Default config (application.yml).",
                "realWorldExample": "Configuring embedded H2 database for dev profile and clustered Amazon RDS MySQL with HikariCP for prod profile.",
                "implementationExample": "@Configuration\n@Profile(\"dev\")\npublic class DevDataConfig {\n    @Bean public DataSource dataSource() { return new EmbeddedDatabaseBuilder().build(); }\n}",
                "codeSnippet": "# application-prod.yml\nspring:\n  datasource:\n    url: jdbc:mysql://prod-cluster:3306/db\n    hikari:\n      maximum-pool-size: 30",
                "commonMistakes": ["Hardcoding sensitive production credentials in application.yml instead of injecting via environment variables.", "Assuming @Profile beans are created in disabled profiles (they are omitted entirely)."],
                "followUpQuestions": ["What is the configuration precedence order in Spring Boot?", "How can you combine multiple profiles with boolean logic (@Profile(\"prod & cloud\"))?"],
                "interviewTips": ["Mention 12-factor app principles: store configuration in the environment.", "Explain spring.config.import in Spring Boot 2.4+."]
            },
            {
                "title": "Explain InitializingBean & DisposableBean vs @PostConstruct & @PreDestroy.",
                "shortAnswer": "@PostConstruct and @PreDestroy are standard JSR-250 annotations and the recommended approach. InitializingBean (afterPropertiesSet) and DisposableBean (destroy) are Spring-specific interfaces that couple code to Spring APIs.",
                "detailedExplanation": "Order of execution: 1. @PostConstruct. 2. afterPropertiesSet(). 3. Custom init-method. For destruction: 1. @PreDestroy. 2. destroy(). 3. Custom destroy-method.",
                "realWorldExample": "Initializing thread pools and validating external connection parameters immediately after property injection.",
                "implementationExample": "@Component\npublic class LifecycleService implements InitializingBean, DisposableBean {\n    @PostConstruct public void postConstruct() { logger.info(\"1. PostConstruct\"); }\n    public void afterPropertiesSet() { logger.info(\"2. afterPropertiesSet\"); }\n    @PreDestroy public void preDestroy() { logger.info(\"1. PreDestroy\"); }\n    public void destroy() { logger.info(\"2. destroy\"); }\n}",
                "codeSnippet": "@Bean(initMethod = \"customInit\", destroyMethod = \"customDestroy\")\npublic LegacyBean legacyBean() { return new LegacyBean(); }",
                "commonMistakes": ["Expecting @PreDestroy to execute if the JVM is killed via kill -9 (only graceful SIGTERM triggers destruction).", "Running long network calls in @PostConstruct blocking application startup."],
                "followUpQuestions": ["What happens during abnormal JVM termination regarding @PreDestroy?", "Why are JSR-250 annotations preferred over Spring interfaces?"],
                "interviewTips": ["List the precise execution sequence: PostConstruct -> InitializingBean -> initMethod.", "Emphasize loose coupling using standard JSR annotations."]
            },
            {
                "title": "Explain TaskExecutor and Asynchronous Processing (@Async) in Spring.",
                "shortAnswer": "@EnableAsync with @Async executes methods in background threads. By default, Spring uses SimpleAsyncTaskExecutor (which creates new threads per task, no reuse). Production apps must configure a dedicated ThreadPoolTaskExecutor.",
                "detailedExplanation": "When a caller invokes an @Async method, Spring's AsyncExecutionInterceptor delegates the task to the configured TaskExecutor and immediately returns a CompletableFuture or void to the caller.",
                "realWorldExample": "Generating monthly billing PDF statements asynchronously in the background while immediately returning HTTP 202 Accepted to the user.",
                "implementationExample": "@Configuration\n@EnableAsync\npublic class AsyncConfig {\n    @Bean(name = \"billingExecutor\")\n    public Executor billingExecutor() {\n        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();\n        executor.setCorePoolSize(4);\n        executor.setMaxPoolSize(16);\n        executor.setQueueCapacity(500);\n        executor.setThreadNamePrefix(\"billing-\");\n        executor.initialize();\n        return executor;\n    }\n}",
                "codeSnippet": "@Async(\"billingExecutor\")\npublic CompletableFuture<String> generatePdf(Long accountId) {\n    return CompletableFuture.completedFuture(pdfService.build(accountId));\n}",
                "commonMistakes": ["Using default @Async without defining a custom ThreadPoolTaskExecutor (SimpleAsyncTaskExecutor spawns unbounded OS threads).", "Calling @Async methods from within the same class (bypasses AOP proxy)."],
                "followUpQuestions": ["How do you handle uncaught exceptions from void @Async methods using AsyncUncaughtExceptionHandler?", "How does SecurityContext propagate across @Async threads?"],
                "interviewTips": ["Highlight that SimpleAsyncTaskExecutor is not a thread pool and will exhaust system memory under load.", "Explain CompletableFuture return types for @Async."]
            }
        ]
    },
    {
        "category": "Hibernate",
        "subcategory": "ORM Internals & Caching",
        "lang": "java",
        "questions": [
            {
                "title": "Explain First-Level (Session) vs Second-Level (SessionFactory) Cache in Hibernate.",
                "shortAnswer": "First-Level cache is bound to the Hibernate Session (L1, enabled by default, transactional scope). Second-Level cache is shared across sessions across the JVM/cluster (L2, optional, uses Redis/Ehcache).",
                "detailedExplanation": "L1 cache guarantees repeatable entity reads within a single transaction without hitting the DB. When a session closes, L1 evaporates. L2 caches entities, collections, and queries across transactions. Second-level caching requires explicit concurrency strategies (read-only, read-write, nonstrict-read-write, transactional).",
                "realWorldExample": "Caching static reference data (e.g., Countries, Currencies, Tax Codes) in L2 Redis cache to avoid millions of repetitive database queries across all web request threads.",
                "implementationExample": "@Entity\n@Cacheable\n@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)\npublic class Currency {\n    @Id private String code;\n    private String name;\n}",
                "codeSnippet": "# application.yml\nspring.jpa.properties.hibernate.cache.use_second_level_cache: true\nspring.jpa.properties.hibernate.cache.region.factory_class: org.hibernate.cache.jcache.JCacheRegionFactory",
                "commonMistakes": ["Enabling L2 cache on frequently updated, highly volatile entities, causing cache invalidation thrashing.", "Confusing query cache with entity cache (query cache stores only entity IDs, not full state)."],
                "followUpQuestions": ["What is the Query Cache in Hibernate and why does it require Second-Level Cache?", "What are the 4 cache concurrency strategies in Hibernate?"],
                "interviewTips": ["Highlight that L1 is always active and cannot be disabled.", "Explain that Query Cache invalidates whenever any record in the target table changes."]
            },
            {
                "title": "Explain Cascade Types vs orphanRemoval in JPA / Hibernate.",
                "shortAnswer": "CascadeType (PERSIST, MERGE, REMOVE) propagates entity operations from parent to child. orphanRemoval=true automatically deletes a child entity from the database when it is removed from the parent's collection.",
                "detailedExplanation": "CascadeType.REMOVE only deletes children when the parent itself is deleted. orphanRemoval=true handles collection dissociation: order.getItems().remove(item) causes an SQL DELETE on that item upon flush.",
                "realWorldExample": "An Order containing LineItems: removing a line item from the shopping cart collection automatically deletes that orphaned row in the database.",
                "implementationExample": "@Entity\npublic class Order {\n    @OneToMany(mappedBy = \"order\", cascade = CascadeType.ALL, orphanRemoval = true)\n    private List<OrderItem> items = new ArrayList<>();\n    \n    public void removeItem(OrderItem item) {\n        items.remove(item);\n        item.setOrder(null);\n    }\n}",
                "codeSnippet": "order.removeItem(firstItem);\norderRepo.save(order); // triggers DELETE on firstItem automatically",
                "commonMistakes": ["Using CascadeType.REMOVE on ManyToMany relationships, which deletes referenced shared entities.", "Forgetting to maintain both sides of the bidirectional relationship in memory."],
                "followUpQuestions": ["What is the difference between CascadeType.REMOVE and orphanRemoval=true?", "Why is CascadeType.ALL dangerous on @ManyToMany?"],
                "interviewTips": ["Clearly contrast: CascadeType.REMOVE is for parent deletion; orphanRemoval is for collection removal.", "Always recommend defensive bidirectional helper methods (addItem, removeItem)."]
            },
            {
                "title": "Explain LazyInitializationException and why Open Session in View (OSIV) is an anti-pattern.",
                "shortAnswer": "LazyInitializationException happens when accessing a lazy relationship after the Hibernate Session is closed. Open Session in View (OSIV) keeps the session open through the web rendering layer, which causes hidden N+1 queries and holds DB connections too long.",
                "detailedExplanation": "When an entity becomes detached (transaction commits and session closes), accessing a lazy proxy fails because there is no open database session. OSIV fixes this by holding database connections until HTTP response completes, causing connection pool exhaustion under load.",
                "realWorldExample": "Serializing an entity to JSON in a REST controller where Jackson triggers lazy proxies, firing dozens of unexpected SQL queries after business logic completed.",
                "implementationExample": "// Best practice: disable OSIV and fetch required data in service layer via DTO\n// spring.jpa.open-in-view: false\n\n@Query(\"SELECT new com.app.OrderDTO(o.id, o.total, i.productName) FROM Order o JOIN o.items i WHERE o.id = :id\")\nOrderDTO findOrderWithItems(@Param(\"id\") Long id);",
                "codeSnippet": "# application.yml\nspring.jpa.open-in-view: false",
                "commonMistakes": ["Leaving spring.jpa.open-in-view: true in production microservices, starving connection pools.", "Using FetchType.EAGER as a quick fix for LazyInitializationException."],
                "followUpQuestions": ["Why is OSIV enabled by default in Spring Boot?", "How do DTO projections and @EntityGraph cleanly resolve LazyInitializationException?"],
                "interviewTips": ["Advocate strongly for spring.jpa.open-in-view: false in modern stateless REST APIs.", "Explain how DTO projections decouple database models from presentation serialization."]
            },
            {
                "title": "Explain Hibernate Dirty Checking mechanism and Flush Modes.",
                "shortAnswer": "Hibernate takes a snapshot of entity state when loaded into Session (L1 cache). During flush, it compares current entity properties with the snapshot; any differences generate SQL UPDATE statements automatically.",
                "detailedExplanation": "FlushModeType controls when changes synchronize to DB: AUTO (flushes before query execution to ensure consistency and at commit), COMMIT (flushes only at commit), MANUAL. Dirty checking eliminates manual update() calls.",
                "realWorldExample": "Updating a user's address: user.setAddress('New St') automatically triggers UPDATE without needing explicit repository.save() inside @Transactional methods.",
                "implementationExample": "@Transactional\npublic void updateUserEmail(Long id, String email) {\n    User user = userRepo.findById(id).orElseThrow();\n    user.setEmail(email); // Dirty checking automatically executes SQL UPDATE on commit\n}",
                "codeSnippet": "Session session = entityManager.unwrap(Session.class);\nsession.setHibernateFlushMode(FlushMode.AUTO);",
                "commonMistakes": ["Redundantly calling repository.save() inside @Transactional methods for already-managed entities.", "Assuming flush() commits the transaction (flush writes SQL to the DB buffer; commit finalizes the transaction)."],
                "followUpQuestions": ["What is the difference between flush() and commit() in Hibernate?", "How does @DynamicUpdate optimize dirty checking SQL generation?"],
                "interviewTips": ["Explain the snapshot comparison mechanism in L1 cache.", "Point out that Calling save() on managed entities in @Transactional is completely unnecessary."]
            },
            {
                "title": "Explain JPA Inheritance Mapping Strategies: SINGLE_TABLE vs JOINED vs TABLE_PER_CLASS.",
                "shortAnswer": "SINGLE_TABLE (default, all classes in 1 table with discriminator column, fastest queries, nullable columns). JOINED (normalized, base table + subclass tables joined by PK, clean schema, slower joins). TABLE_PER_CLASS (separate table per concrete class, union queries).",
                "detailedExplanation": "SINGLE_TABLE offers highest query performance because polymorphic queries require no SQL joins, but subclass columns cannot have NOT NULL constraints. JOINED is fully normalized but requires multiple outer joins as inheritance depth grows.",
                "realWorldExample": "Payment methods hierarchy: CardPayment, PayPalPayment, CryptoPayment mapped with SINGLE_TABLE for maximum query speed.",
                "implementationExample": "@Entity\n@Inheritance(strategy = InheritanceType.SINGLE_TABLE)\n@DiscriminatorColumn(name = \"payment_type\")\npublic abstract class Payment { @Id @GeneratedValue private Long id; }\n\n@Entity\n@DiscriminatorValue(\"CARD\")\npublic class CardPayment extends Payment { private String cardNum; }",
                "codeSnippet": "@Entity\n@Inheritance(strategy = InheritanceType.JOINED)\npublic abstract class Vehicle { @Id private Long id; }",
                "commonMistakes": ["Using JOINED on deep hierarchies (5+ levels), causing performance degradation due to massive multi-table SQL joins.", "Requiring NOT NULL constraints on subclass fields with SINGLE_TABLE."],
                "followUpQuestions": ["When should TABLE_PER_CLASS be avoided?", "How does polymorphism work in JPQL queries with inheritance hierarchies?"],
                "interviewTips": ["Contrast SINGLE_TABLE (fastest reads, denormalized) vs JOINED (normalized, join overhead)."]
            },
            {
                "title": "Explain Optimistic Locking (@Version) vs Pessimistic Locking in JPA.",
                "shortAnswer": "Optimistic locking (@Version) detects concurrent modifications at commit time by verifying row version; if mismatched, it throws OptimisticLockException. Pessimistic locking (SELECT ... FOR UPDATE) locks rows at the database level during read.",
                "detailedExplanation": "Optimistic locking is ideal for read-heavy systems with low collision probability. Pessimistic locking (LockModeType.PESSIMISTIC_WRITE) prevents concurrent access physically, necessary for high-contention financial transactions where retries are costly.",
                "realWorldExample": "Optimistic locking for editing collaborative document profiles; Pessimistic locking for reserving limited event seats or deducting banking balances under high concurrency.",
                "implementationExample": "@Entity\npublic class Inventory {\n    @Id private Long id;\n    private Integer stock;\n    @Version private Long version; // Optimistic lock\n}",
                "codeSnippet": "@Lock(LockModeType.PESSIMISTIC_WRITE)\n@Query(\"SELECT a FROM Account a WHERE a.id = :id\")\nOptional<Account> findByIdForUpdate(@Param(\"id\") Long id);",
                "commonMistakes": ["Relying on optimistic locking without handling OptimisticLockException or providing retry logic.", "Using pessimistic locking across long-running user interactions, causing database connection holding and deadlocks."],
                "followUpQuestions": ["What is the difference between PESSIMISTIC_READ and PESSIMISTIC_WRITE?", "How does Spring Retry help handle optimistic lock failures?"],
                "interviewTips": ["Show SQL generated by optimistic locking: UPDATE table SET stock=?, version=version+1 WHERE id=? AND version=?.", "Explain SELECT ... FOR UPDATE for pessimistic locking."]
            },
            {
                "title": "Explain Hibernate Batch Processing and hibernate.jdbc.batch_size optimization.",
                "shortAnswer": "Hibernate batching groups multiple INSERT/UPDATE statements into single JDBC executeBatch() calls. Requires configuring hibernate.jdbc.batch_size and ordering inserts/updates. Note: GenerationType.IDENTITY disables batch inserts.",
                "detailedExplanation": "Without batching, saving 1,000 entities sends 1,000 network round-trips to the DB. With batch_size=50, it sends 20 batch requests. GenerationType.IDENTITY requires immediately querying generated keys, which forces immediate single-row inserts and disables batching.",
                "realWorldExample": "Bulk importing 50,000 product catalog rows from CSV into MySQL; batching reduces import time from 15 minutes to 12 seconds.",
                "implementationExample": "spring:\n  jpa:\n    properties:\n      hibernate:\n        jdbc:\n          batch_size: 50\n          order_inserts: true\n          order_updates: true",
                "codeSnippet": "@Entity\npublic class Product {\n    @Id\n    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = \"prod_seq\")\n    @SequenceGenerator(name = \"prod_seq\", allocationSize = 50) // Sequence enables batching\n    private Long id;\n}",
                "commonMistakes": ["Using GenerationType.IDENTITY and expecting batch inserts to work (use SEQUENCE or TABLE instead).", "Forgetting to periodically call entityManager.flush() and clear() during large loops, causing OutOfMemoryError in L1 cache."],
                "followUpQuestions": ["Why does GenerationType.IDENTITY break JDBC batching in Hibernate?", "What is the role of order_inserts and order_updates in batching?"],
                "interviewTips": ["Point out that allocationSize in SequenceGenerator must match batch_size.", "Explain clearing L1 cache in chunks (e.g. every 50 records) to prevent heap exhaustion."]
            },
            {
                "title": "Explain Entity Lifecycle States in Hibernate: Transient, Persistent, Detached, Removed.",
                "shortAnswer": "Transient: new object, no DB identity, not in Session. Persistent: associated with open Session, has DB identity, tracked by dirty checking. Detached: has DB identity, Session is closed. Removed: scheduled for deletion in Session.",
                "detailedExplanation": "persist() transitions Transient -> Persistent. close() or clear() transitions Persistent -> Detached. merge() copies state from Detached into a new Persistent instance. remove() transitions Persistent -> Removed.",
                "realWorldExample": "Receiving a detached DTO from a REST API request and merging it back into a persistent session to apply updates safely.",
                "implementationExample": "User user = new User(\"Alex\"); // Transient\nem.persist(user); // Persistent (tracked)\nem.detach(user); // Detached (no longer tracked)\nUser managed = em.merge(user); // New Persistent reference managed",
                "codeSnippet": "em.remove(managed); // Removed",
                "commonMistakes": ["Modifying a detached entity and expecting changes to automatically sync to the database without merge().", "Assuming merge() makes the original object persistent (it returns a NEW managed instance)."],
                "followUpQuestions": ["What is the difference between persist() and merge()?", "What happens if you persist a detached entity?"],
                "interviewTips": ["Draw the state diagram: Transient -(persist)-> Persistent -(detach/close)-> Detached -(merge)-> Persistent.", "Emphasize that merge() returns the managed instance."]
            }
        ]
    }
]
