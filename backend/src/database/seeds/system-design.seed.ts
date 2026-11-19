import { SystemDesignType } from '../entities/system-design-topic.entity';

export const initialSystemDesignSeed = [
  // 1. URL Shortener (TinyURL)
  {
    title: 'Design a Scalable URL Shortener (TinyURL / Bitly)',
    slug: 'design-url-shortener-tinyurl',
    type: SystemDesignType.REAL_WORLD,
    summary:
      'Design a globally distributed URL shortening service capable of creating compact 7-character aliases, redirecting at sub-10ms latencies with 100:1 read-to-write ratios, and handling 100M new URLs per month.',
    difficulty: 'Intermediate',
    experienceLevel: '3–5 Years',
    functionalRequirements: [
      'Given a long URL, generate a shorter unique alias (e.g. https://tiny.url/aB7k9Z1).',
      'When user accesses short URL, redirect with HTTP 302 (or 301) to original long URL.',
      'Allow custom short aliases (vanity URLs) up to 16 characters.',
      'Short URLs expire after a default TTL (e.g. 2 years) or user-configured timestamp.',
      'Analytics tracking (clicks, geo-location, referrer, timestamp).',
    ],
    nonFunctionalRequirements: [
      'High Availability: 99.99% uptime (redirections must never fail).',
      'Ultra-Low Latency: Redirection latency < 10ms (p99).',
      'Read-heavy system: 100:1 read to write ratio.',
      'Data Integrity: Short URLs must be non-guessable / tamper-resistant.',
    ],
    capacityEstimation: {
      dau: '10 Million active redirect users daily',
      qps: 'Writes: 100M/month ≈ 40 writes/sec; Reads (100:1): 4,000 reads/sec',
      peakQps: 'Peak Read QPS: 10,000 reads/sec',
      storagePerDay: '40 writes/sec * 86,400s * 500 bytes ≈ 1.7 GB/day',
      storage5Years: '100M * 12 months * 5 years * 500 bytes ≈ 3 TB total',
      networkBandwidth: 'Reads: 4,000 req/s * 500 bytes = 2 MB/s; Writes: 40 req/s * 500 bytes = 20 KB/s',
      notes: 'Cache top 20% URLs (80-20 Pareto Rule). 20% of daily read traffic = 800M requests * 500 bytes ≈ 400 GB RAM Redis cache cluster.',
    },
    architectureDiagram: {
      type: 'mermaid',
      content: `graph TD
    Client[Web/Mobile Clients] --> DNS[Route 53 GeoDNS]
    DNS --> CDN[Cloudflare / CloudFront CDN]
    CDN --> LB[Nginx / AWS ALB Load Balancer]
    LB --> AppCluster[URL Redirection Service Cluster]
    LB --> WriteCluster[URL Generator Service Cluster]
    
    WriteCluster --> KGS[Key Generation Service Pre-computed Base62]
    WriteCluster --> Cache[(Redis Cache Cluster LRU)]
    WriteCluster --> MasterDB[(MySQL / DynamoDB)]
    
    AppCluster --> Cache
    AppCluster --> ReadReplica[(DB Read Replicas)]
    AppCluster --> Kafka[Kafka Analytics Topic]
    Kafka --> AnalyticsWorker[ClickHouse / Spark Analytics]`,
      layers: [
        {
          name: 'Edge & Ingress Layer',
          components: ['Route 53 GeoDNS', 'Cloudflare CDN', 'AWS Application Load Balancer'],
          description: 'Terminates TLS, absorbs DDoS attacks, and caches popular hot redirect URLs globally.',
        },
        {
          name: 'Application Cluster',
          components: ['Stateless Node.js/Go Services', 'Key Generation Service (KGS)'],
          description: 'Separates write path (KGS base62 allocation) from read path (sub-5ms redirection).',
        },
        {
          name: 'Storage & Cache Tier',
          components: ['Redis Cluster', 'NoSQL DynamoDB / MySQL with Read Replicas'],
          description: 'Redis in-memory caching stores hot mappings. Persistent store partitioned by short_hash.',
        },
      ],
    },
    databaseSchema: {
      type: 'relational_and_nosql',
      tables: [
        {
          tableName: 'url_mappings',
          primaryKey: 'short_key (VARCHAR 7)',
          columns: [
            { name: 'short_key', type: 'VARCHAR(7)', desc: 'Base62 encoded unique key (Index)' },
            { name: 'original_url', type: 'VARCHAR(2048)', desc: 'Target destination long URL' },
            { name: 'user_id', type: 'BIGINT', desc: 'Creator account ID (optional)' },
            { name: 'created_at', type: 'TIMESTAMP', desc: 'Creation timestamp' },
            { name: 'expires_at', type: 'TIMESTAMP', desc: 'TTL expiration timestamp (Index)' },
            { name: 'click_count', type: 'BIGINT', desc: 'Atomic counter' },
          ],
          partitionKey: 'short_key (Consistent Hashing across DB partitions)',
        },
        {
          tableName: 'click_events',
          primaryKey: 'event_id (UUID)',
          columns: [
            { name: 'short_key', type: 'VARCHAR(7)', desc: 'Foreign reference' },
            { name: 'timestamp', type: 'TIMESTAMP', desc: 'Click occurrence' },
            { name: 'country_code', type: 'CHAR(2)', desc: 'Geo-IP location' },
            { name: 'user_agent', type: 'VARCHAR(256)', desc: 'Device / Browser header' },
          ],
        },
      ],
      notes: 'DynamoDB or Cassandra key-value store with partition key short_key provides deterministic O(1) reads.',
    },
    apiDesign: [
      {
        endpoint: '/api/v1/urls',
        method: 'POST',
        description: 'Shorten a long URL',
        requestBody: '{\n  "originalUrl": "https://example.com/very/long/path",\n  "customAlias": "custom123",\n  "ttlDays": 365\n}',
        responseBody: '{\n  "shortUrl": "https://tiny.url/aB7k9Z1",\n  "shortKey": "aB7k9Z1",\n  "expiresAt": "2028-01-01T00:00:00Z"\n}',
      },
      {
        endpoint: '/{shortKey}',
        method: 'GET',
        description: 'Redirect to original URL',
        responseBody: 'HTTP 302 Found\nLocation: https://example.com/very/long/path',
      },
      {
        endpoint: '/api/v1/urls/{shortKey}/analytics',
        method: 'GET',
        description: 'Retrieve click statistics',
        responseBody: '{\n  "shortKey": "aB7k9Z1",\n  "totalClicks": 142050,\n  "topCountries": [{"country": "IN", "clicks": 85000}]\n}',
      },
    ],
    componentBreakdown: [
      {
        name: 'Key Generation Service (KGS)',
        role: 'Pre-generates 7-character Base62 random alphanumeric keys in advance and stores in DB. Hands out batches (e.g. 1000 keys) to API worker memory, guaranteeing zero hash collisions and zero runtime encryption overhead.',
        techStack: 'Go / Java with Redis buffer',
        scalabilityNotes: 'Two KGS instances keep two tables (used_keys, unused_keys) with lock-free atomic batch allocation.',
      },
      {
        name: 'Redis Cache Layer',
        role: 'Caches the mapping short_key -> original_url. Employs Allkeys-LRU eviction.',
        techStack: 'Redis Cluster (3 Masters, 3 Replicas)',
        scalabilityNotes: 'Memory capped at 256GB RAM, handling 95% of all read redirection queries in <1ms.',
      },
      {
        name: 'Analytics Pipeline',
        role: 'Asynchronously logs click events via Kafka topic without adding latency to the user redirect HTTP response.',
        techStack: 'Apache Kafka + ClickHouse',
        scalabilityNotes: 'Batch flushed every 500ms or 1,000 events.',
      },
    ],
    scalingStrategy: [
      'Stateless Redirection Servers: Horizontally auto-scaled based on CPU & network latency behind AWS ALB.',
      'Consistent Hashing: Partitions the Redis cache and database across storage nodes without rehashing everything on node addition.',
      'CDN Caching: 301/302 redirects for popular viral URLs cached at Cloudflare edge PoPs for 5 minutes, keeping 80% of traffic off the origin servers entirely.',
    ],
    bottlenecks: [
      'Database write lock contention if keys are generated on-the-fly with MD5/SHA256 (resolved by KGS pre-generation).',
      'Cache stampede on viral URL expiration (resolved by mutual exclusion mutex lock on cache reload or soft TTL pre-warming).',
    ],
    failureScenarios: [
      {
        scenario: 'Redis Cache Node crashes',
        impact: 'Temporary read latency spike to DB read replicas.',
        mitigation: 'Redis Sentinel / Cluster auto-promotes standby replica in <2 seconds. DB read replicas are sized to absorb 3x standard load.',
      },
      {
        scenario: 'KGS Worker crashes holding allocated key batch',
        impact: 'Batch of 1000 unused keys is orphaned.',
        mitigation: 'Acceptable trade-off: 62^7 = 3.5 Trillion unique keys. Losing 1000 keys represents 0.00000003% of namespace.',
      },
    ],
    securityConsiderations: [
      'Rate Limiting: Token bucket rate limiter (e.g. max 20 creates/min per IP) to prevent malicious key depletion.',
      'Phishing & Malware Scanner: Async worker validates long URLs against Google Safe Browsing API before activating alias.',
    ],
    tradeOffs: [
      {
        choiceA: 'HTTP 301 Permanent Redirect',
        choiceB: 'HTTP 302 Found (Temporary)',
        selected: 'HTTP 302 Temporary',
        justification: '301 allows browser to cache redirect locally forever, which eliminates all subsequent analytics click tracking. 302 forces requests to hit our server/CDN, enabling accurate real-time metrics.',
      },
      {
        choiceA: 'Runtime Hash (MD5 + Base62) with Collision Probing',
        choiceB: 'Key Generation Service (KGS) Pre-allocation',
        selected: 'Key Generation Service (KGS)',
        justification: 'Hashing requires DB uniqueness checks and collision appending, creating O(k) write stalls. KGS provides O(1) instantaneous assignment.',
      },
    ],
    interviewExplanation:
      'In an interview, start by confirming the 100:1 read/write ratio and calculating QPS and 5-year storage (3TB). Propose Base62 encoding: 62 characters [a-z, A-Z, 0-9]. 62^7 = 3.5 Trillion combinations, perfectly sufficient for centuries. Highlight Key Generation Service (KGS) to avoid collision probing, explain 301 vs 302 trade-offs, and detail Redis LRU caching.',
  },

  // 2. WhatsApp / Chat Application
  {
    title: 'Design Real-Time Messaging System (WhatsApp / Slack)',
    slug: 'design-whatsapp-realtime-chat',
    type: SystemDesignType.REAL_WORLD,
    summary:
      'Architect a low-latency, end-to-end encrypted messaging platform supporting 1-on-1 chats, group chats up to 1,000 members, read receipts, online presence, and offline message delivery at 2 Billion DAU scale.',
    difficulty: 'Senior / Architect',
    experienceLevel: '8–12 Years',
    functionalRequirements: [
      '1-on-1 real-time text messaging with sub-100ms delivery.',
      'Group chats supporting up to 1,000 participants.',
      'Message status indicators: Sent (Single tick), Delivered (Double grey ticks), Read (Double blue ticks).',
      'Offline message queueing and synchronization when recipient reconnects.',
      'User online / last seen presence tracking.',
      'Media sharing (images, videos, documents).',
    ],
    nonFunctionalRequirements: [
      'Ultra-Low Latency: Message delivery < 100ms globally.',
      'High Reliability: Zero message loss (at-least-once delivery with client deduplication).',
      'End-to-End Encryption (E2EE) using Signal Protocol.',
      'Massive Scalability: 2 Billion DAU, 100 Billion messages per day.',
    ],
    capacityEstimation: {
      dau: '2 Billion Daily Active Users',
      qps: '100 Billion messages/day / 86,400s ≈ 1.15 Million messages/sec (Peak: 3 Million msg/s)',
      storagePerDay: '100B messages * 200 bytes text ≈ 20 TB / day',
      storage5Years: '20 TB * 365 * 5 ≈ 36 Petabytes (archived to cold storage)',
      networkBandwidth: '1.15M msg/s * 200 bytes = 230 MB/sec outgoing payload',
      notes: 'Ephemeral storage model: Once delivered and acked by client, message can be purged from server DB in pure E2EE model (like WhatsApp).',
    },
    architectureDiagram: {
      type: 'mermaid',
      content: `graph TD
    Sender[Sender Client] -->|WebSocket / TLS| GatewayA[WebSocket Gateway Node 1]
    Receiver[Receiver Client] -->|WebSocket / TLS| GatewayB[WebSocket Gateway Node 2]
    
    GatewayA --> SessionService[(Redis Session Registry: UserId -> GatewayIP)]
    GatewayA --> MessageRouter[Message Routing Service]
    MessageRouter --> SessionService
    
    MessageRouter -->|Receiver Online| GatewayB
    GatewayB --> Receiver
    
    MessageRouter -->|Receiver Offline| Kafka[Kafka Undelivered Queue]
    Kafka --> OfflineWorker[Offline Message Storage Service]
    OfflineWorker --> Cassandra[(Apache Cassandra / ScyllaDB)]
    
    GatewayA --> MediaService[Media Upload Pre-signed URL]
    MediaService --> S3[(AWS S3 / GCS Storage)]`,
      layers: [
        {
          name: 'Connection & Gateway Layer',
          components: ['WebSocket / TCP Gateways (epoll/Netty)', 'Load Balancers'],
          description: 'Maintains millions of persistent, long-lived bidirectional WebSocket connections.',
        },
        {
          name: 'Session & Routing Tier',
          components: ['Redis Session Registry', 'Message Routing Engine'],
          description: 'Maps which user ID is connected to which physical Gateway server IP.',
        },
        {
          name: 'Persistence & Async Queue',
          components: ['Kafka Message Bus', 'Apache Cassandra (Wide-Column Store)', 'AWS S3 Object Store'],
          description: 'Stores pending offline messages and high-volume append-only chat histories.',
        },
      ],
    },
    databaseSchema: {
      type: 'nosql_wide_column',
      tables: [
        {
          tableName: 'messages',
          primaryKey: '((chat_id), message_id)',
          columns: [
            { name: 'chat_id', type: 'UUID', desc: 'Partition Key (groups all chat messages together)' },
            { name: 'message_id', type: 'TIMEUUID', desc: 'Clustering Key (chronologically sorted)' },
            { name: 'sender_id', type: 'UUID', desc: 'User who sent message' },
            { name: 'content_cipher', type: 'BLOB', desc: 'E2EE encrypted ciphertext' },
            { name: 'status', type: 'VARCHAR', desc: 'SENT, DELIVERED, READ' },
            { name: 'media_url', type: 'VARCHAR', desc: 'S3 object reference if media' },
          ],
          partitionKey: 'chat_id with clustering key message_id DESC',
        },
        {
          tableName: 'user_sessions',
          primaryKey: 'user_id',
          columns: [
            { name: 'user_id', type: 'UUID', desc: 'User identifier' },
            { name: 'gateway_ip', type: 'VARCHAR(45)', desc: 'Active gateway node host' },
            { name: 'socket_id', type: 'VARCHAR(64)', desc: 'Socket connection descriptor' },
            { name: 'last_heartbeat', type: 'TIMESTAMP', desc: 'Presence timestamp' },
          ],
        },
      ],
    },
    apiDesign: [
      {
        endpoint: 'WSS /v1/chat/connect',
        method: 'WEBSOCKET',
        description: 'Bi-directional real-time transport for messages and receipts',
        requestBody: '{\n  "action": "SEND_MESSAGE",\n  "to": "user_4920",\n  "contentCipher": "enc_base64_blob...",\n  "clientMsgId": "uuid-1234"\n}',
        responseBody: '{\n  "action": "MESSAGE_ACK",\n  "clientMsgId": "uuid-1234",\n  "serverMsgId": "timeuuid-5678",\n  "status": "SENT"\n}',
      },
    ],
    componentBreakdown: [
      {
        name: 'WebSocket Connection Manager (Gateways)',
        role: 'Maintains millions of persistent, open TCP/WebSocket connections. Designed with lightweight C++ or Go Netty/epoll to support 100K concurrent connections per 16-core server.',
        techStack: 'Go / Netty + WebSockets',
        scalabilityNotes: 'Scaled horizontally across 20,000 gateway instances.',
      },
      {
        name: 'Distributed Session Registry',
        role: 'Tracks which WebSocket gateway node each user is currently connected to (e.g. user_A -> 10.0.4.12:8080).',
        techStack: 'Redis Cluster with 1-second TTL heartbeats',
        scalabilityNotes: 'Sub-millisecond lookups for message routing.',
      },
    ],
    scalingStrategy: [
      'Fan-out on Read vs Fan-out on Write for Group Chats: For small groups (<100 members), fan-out on write copies message to each member queue. For large channels (>1,000 members), fan-out on read queries a single channel message log.',
      'Keep-alive Heartbeats: Mobile clients send 30-second ping/pong frames to detect dead connections across cellular networks without draining phone battery.',
    ],
    bottlenecks: [
      'Presence updates (online/offline) triggering millions of fan-out notifications. Resolved by lazy presence polling when a user opens a chat rather than pushing status to all phonebook contacts.',
    ],
    failureScenarios: [
      {
        scenario: 'Gateway node abruptly crashes due to hardware failure',
        impact: '100,000 connected clients lose connection simultaneously.',
        mitigation: 'Clients implement exponential backoff with jitter (e.g. 1s + rand(0, 500ms)) to reconnect, preventing a reconnection thundering herd from overwhelming remaining gateways.',
      },
    ],
    securityConsiderations: [
      'Signal Protocol (Double Ratchet): Ephemeral Diffie-Hellman keys ensure Perfect Forward Secrecy; compromise of current key cannot decrypt past messages.',
    ],
    tradeOffs: [
      {
        choiceA: 'HTTP Long Polling',
        choiceB: 'WebSockets',
        selected: 'WebSockets',
        justification: 'WebSockets eliminate HTTP header overhead (800 bytes per request reduced to 2-byte framing) and enable true full-duplex bi-directional communication.',
      },
    ],
    interviewExplanation:
      'Emphasize that the server is an encrypted dumb pipe in WhatsApp architecture: it cannot read ciphertext. Explain WebSocket Gateway connection management, the Redis session router, and how Cassandra partitioning by chat_id enables rapid retrieval of historical chats.',
  },
];
