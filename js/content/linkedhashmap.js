/* ==========================================================================
   CONTENT: LinkedHashMap
   ========================================================================== */

CollectionsContent['linkedhashmap'] = {

  overview: {
    paragraphs: [
      'LinkedHashMap extends HashMap, adding a doubly-linked list running through all entries so iteration is predictable — either insertion order (the default) or, optionally, access order, where every get()/put() moves an entry to the end of the iteration sequence.',
      'That access-order mode is precisely what makes LinkedHashMap the textbook building block for an LRU (Least Recently Used) cache: combined with an overridden removeEldestEntry() hook, a handful of lines implement a fully working bounded cache with automatic eviction.',
      'Aside from the linked-list bookkeeping, LinkedHashMap inherits HashMap\'s entire bucket/treeification machinery, so its raw lookup performance characteristics are essentially identical to HashMap\'s.',
    ],
    keyPoints: [
      'Extends HashMap, adding a doubly-linked list through all entries for predictable iteration order.',
      'Two modes: insertion order (default) or access order (accessOrder=true constructor flag).',
      'Override removeEldestEntry(eldest) to build a self-evicting bounded LRU cache in a few lines.',
      'Same O(1) average time complexity as HashMap, plus a small constant for linked-list maintenance.',
      'Allows one null key and any number of null values, exactly like HashMap.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'LinkedHashMap.Entry extends HashMap.Node, adding `before` and `after` references that thread every entry into a single doubly-linked list, independent of which hash bucket each entry physically lives in.',
      'In access-order mode, every successful get() (and every put() that updates an existing key) calls an internal `afterNodeAccess` hook that unlinks the entry from its current linked-list position and re-links it at the tail — making the tail of the list always "most recently used" and the head always "least recently used".',
      'After every put(), LinkedHashMap calls the protected `removeEldestEntry(Map.Entry<K,V> eldest)` hook (which returns false by default, meaning "never auto-evict"). Overriding this method to return `size() > maxCapacity` is the entire implementation of an LRU cache — the JDK does the eviction for you once you say when it should happen.',
    ],
  },

  complexity: [
    { operation: 'get(key) / put(key, value) / remove(key)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Identical to HashMap, plus O(1) linked-list relinking (extra in access-order mode).' },
    { operation: 'iteration (full traversal)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Walks the linked list directly — no empty-bucket scanning, unlike plain HashMap.' },
  ],

  memory: {
    paragraphs: [
      'Each entry costs everything a HashMap entry costs, plus two additional reference fields (`before`/`after`) for the ordering linked list — a small, constant overhead per entry in exchange for predictable iteration.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'LinkedHashMap has no internal synchronization, exactly like HashMap. Wrap with Collections.synchronizedMap(new LinkedHashMap<>()) for coarse external synchronization if shared across threads — access-order mode in particular needs care, since even get() is a mutating operation from the linked list\'s perspective.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator is fail-fast (same modCount mechanism as HashMap) and walks the ordering linked list rather than the bucket array, so iteration is both safe-by-default and deterministic in order.',
    ],
  },

  ordering: {
    paragraphs: [
      'Insertion order by default: entries iterate in the order their keys were first put(). In access-order mode (constructor flag accessOrder=true), the order instead reflects recency of access — every get() or update-put() moves that entry to the end.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Allows one null key and any number of null values, identical to HashMap (which it extends).',
    ],
  },

  useCases: [
    { title: 'LRU caches', description: 'The canonical use case: access-order mode plus removeEldestEntry() gives you a complete, self-bounding cache implementation.' },
    { title: 'Preserving insertion order for serialization', description: 'JSON/XML serialization that should reproduce field or entry order exactly as constructed, rather than arbitrary hash order.' },
    { title: 'Deterministic test fixtures and debugging output', description: 'Anywhere reproducible iteration order makes logs/tests easier to read and diff.' },
  ],

  springBootExamples: [
    {
      title: 'Bounded LRU cache bean for expensive lookups',
      description: 'A Spring @Component wraps a LinkedHashMap configured in access-order mode with a fixed capacity, evicting the least-recently-used entry automatically.',
      code:
`@Component
public class LruProductCache {

    private static final int MAX_ENTRIES = 500;

    private final Map<String, Product> cache = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Product> eldest) {
            return size() > MAX_ENTRIES;
        }
    };

    public synchronized Product getOrLoad(String productId, Function<String, Product> loader) {
        return cache.computeIfAbsent(productId, loader);
    }
}`,
    },
    {
      title: 'Preserving configuration key order for a settings export endpoint',
      description: 'An admin export endpoint returns settings in the exact order they were registered, which a plain HashMap could not guarantee.',
      code:
`@RestController
@RequestMapping("/api/admin/settings")
public class SettingsExportController {

    private final Map<String, String> settings = new LinkedHashMap<>();

    @PostConstruct
    void loadDefaults() {
        settings.put("app.name", "OrderService");
        settings.put("app.version", "1.4.2");
        settings.put("app.region", "us-east-1");
    }

    @GetMapping
    public Map<String, String> export() {
        return settings; // iterates in the exact order keys were inserted
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'How would you implement an LRU cache using only LinkedHashMap?', difficulty: 'Advanced', answer: 'Construct it with `new LinkedHashMap<>(initialCapacity, loadFactor, true)` (the third argument enables access order), then override `removeEldestEntry(Map.Entry eldest)` to return true once `size() > maxCapacity`. Every get() moves an entry to the "most recent" end, and put() triggers automatic eviction of the least-recently-used entry.' },
    { question: 'What is the difference between insertion order and access order in LinkedHashMap?', difficulty: 'Intermediate', answer: 'Insertion order (the default) preserves the order keys were first added, unaffected by subsequent get() calls. Access order (accessOrder=true) instead reorders the linked list on every get() and update-put(), moving the accessed entry to the end — turning the head of the list into "least recently used".' },
    { question: 'What does removeEldestEntry() return by default, and why?', difficulty: 'Intermediate', answer: 'It returns false by default, meaning "never automatically remove anything" — LinkedHashMap behaves like a plain ordered HashMap unless you explicitly opt into eviction by overriding this method.' },
    { question: 'Is get() a read-only operation on a LinkedHashMap in access-order mode?', difficulty: 'Advanced', answer: 'No — in access-order mode, get() mutates the internal linked list (moving the accessed entry to the end), which matters for thread-safety reasoning: even "read-only" access requires external synchronization if the map is shared across threads.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Preserve insertion order while counting occurrences',
        statement: 'Count occurrences of each word in a sentence but print the results in the order words first appeared, using LinkedHashMap.',
        code:
`import java.util.*;

public class OrderedWordCount {
    public static void main(String[] args) {
        String text = "banana apple banana cherry apple apple";
        Map<String, Integer> counts = new LinkedHashMap<>();

        for (String word : text.split(" ")) {
            counts.merge(word, 1, Integer::sum);
        }

        System.out.println(counts);
    }
}`,
        output: '{banana=2, apple=3, cherry=1}',
      },
    ],
    intermediate: [
      {
        title: 'Implement a fixed-size LRU cache from scratch',
        statement: 'Build a generic LRU cache using LinkedHashMap in access-order mode with automatic eviction via removeEldestEntry().',
        code:
`import java.util.*;

public class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LruCache(int capacity) {
        super(16, 0.75f, true); // accessOrder = true
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }

    public static void main(String[] args) {
        LruCache<Integer, String> cache = new LruCache<>(3);
        cache.put(1, "A");
        cache.put(2, "B");
        cache.put(3, "C");
        cache.get(1);          // 1 becomes most recently used
        cache.put(4, "D");     // evicts 2 (least recently used)

        System.out.println(cache.keySet());
    }
}`,
        output: '[3, 1, 4]',
      },
    ],
    advanced: [
      {
        title: 'Time-bounded LRU cache with expiry',
        statement: 'Extend the LRU cache to also expire entries older than a fixed TTL, checked lazily on access.',
        code:
`import java.util.*;

public class ExpiringLruCache<K, V> {

    private record Entry<V>(V value, long expiresAtMillis) {}

    private final int capacity;
    private final long ttlMillis;
    private final LinkedHashMap<K, Entry<V>> store;

    public ExpiringLruCache(int capacity, long ttlMillis) {
        this.capacity = capacity;
        this.ttlMillis = ttlMillis;
        this.store = new LinkedHashMap<>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, Entry<V>> eldest) {
                return size() > ExpiringLruCache.this.capacity;
            }
        };
    }

    public synchronized void put(K key, V value) {
        store.put(key, new Entry<>(value, System.currentTimeMillis() + ttlMillis));
    }

    public synchronized Optional<V> get(K key) {
        Entry<V> entry = store.get(key);
        if (entry == null) return Optional.empty();
        if (System.currentTimeMillis() > entry.expiresAtMillis()) {
            store.remove(key);
            return Optional.empty();
        }
        return Optional.of(entry.value());
    }

    public static void main(String[] args) throws InterruptedException {
        ExpiringLruCache<String, String> cache = new ExpiringLruCache<>(2, 50);
        cache.put("session-1", "active");
        System.out.println(cache.get("session-1"));
        Thread.sleep(60);
        System.out.println(cache.get("session-1")); // expired
    }
}`,
        output: 'Optional[active]\nOptional.empty',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Bounded in-memory product-detail cache for an e-commerce catalog service',
      domain: 'E-commerce',
      description: 'A catalog microservice caches the last 1000 accessed product detail objects to avoid repeated database round-trips, using access-order LinkedHashMap for automatic LRU eviction.',
      code:
`@Component
public class ProductDetailCache {

    private final LinkedHashMap<String, ProductDetail> cache = new LinkedHashMap<>(1024, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, ProductDetail> eldest) {
            return size() > 1000;
        }
    };

    private final ProductRepository repository;

    public ProductDetailCache(ProductRepository repository) {
        this.repository = repository;
    }

    public synchronized ProductDetail get(String productId) {
        return cache.computeIfAbsent(productId, repository::loadDetail);
    }
}`,
    },
    {
      title: 'Preserving audit-log field order for a hospital records export',
      domain: 'Healthcare',
      description: 'A compliance export tool builds a LinkedHashMap of patient record fields in the exact regulatory-required display order, unlike a HashMap which could reorder them arbitrarily.',
      code:
`public Map<String, Object> toAuditRecord(PatientRecord record) {
    Map<String, Object> fields = new LinkedHashMap<>();
    fields.put("patientId", record.id());
    fields.put("admittedAt", record.admittedAt());
    fields.put("ward", record.ward());
    fields.put("attendingPhysician", record.physician());
    return fields; // export tool relies on this exact field order
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-user LRU search history: Map<String, LinkedHashMap<String, Long>>',
      explanation: 'A search platform keeps each user\'s recent unique search terms with timestamps, evicting the least-recently-used term once a user exceeds their history limit.',
      code:
`Map<String, LinkedHashMap<String, Long>> searchHistoryByUser = new HashMap<>();

searchHistoryByUser
    .computeIfAbsent(userId, id -> new LinkedHashMap<>(16, 0.75f, true))
    .put(searchTerm, System.currentTimeMillis());`,
    },
  ],

  bestPractices: [
    'Use access-order mode (accessOrder=true) plus removeEldestEntry() for LRU caches instead of hand-rolling one with a HashMap + separate tracking structure.',
    'Remember that get() mutates the map in access-order mode — treat it as a write operation for synchronization purposes.',
    'Default to insertion-order mode unless you specifically need recency-based eviction — it is simpler to reason about and just as fast.',
    'Synchronize the whole compound operation (e.g. computeIfAbsent on an LRU cache) rather than only individual calls, to avoid races between a miss-then-load sequence.',
  ],

  commonMistakes: [
    {
      mistake: 'Forgetting to override removeEldestEntry() and expecting automatic eviction.',
      why: 'The default implementation always returns false — LinkedHashMap never evicts anything unless you explicitly opt in.',
      fix: 'Override removeEldestEntry(eldest) to return `size() > maxCapacity` (or any other eviction condition you need).',
    },
    {
      mistake: 'Sharing an access-order LinkedHashMap across threads without synchronizing get() calls.',
      why: 'get() mutates internal linked-list pointers in access-order mode, so it is not actually a read-only operation from a concurrency standpoint.',
      fix: 'Wrap access in synchronized blocks/methods, or use a purpose-built concurrent cache library for high-throughput scenarios.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'LinkedHashMap', 'HashMap', 'TreeMap'],
    rows: [
      ['Ordering', 'Insertion or access order', 'None', 'Sorted by key'],
      ['get/put complexity', 'O(1) average', 'O(1) average', 'O(log n)'],
      ['Built-in LRU support', 'Yes (removeEldestEntry)', 'No', 'No'],
      ['Extra memory per entry', '~16 bytes (before/after)', 'Baseline', 'Tree node overhead'],
    ],
  },

  diagrams: [
    {
      title: 'Access-order relinking on get()',
      caption: 'Calling get("B") moves entry B to the tail (most-recently-used) end of the ordering list.',
      render: () => (
        <div className="flex flex-col gap-3">
          <div className="flex items-center">
            <span className="text-xs w-20 text-slate-400">Before:</span>
            <DiagramBox label="A" sub="LRU" tone="amber" />
            <DiagramArrow />
            <DiagramBox label="B" tone="brand" />
            <DiagramArrow />
            <DiagramBox label="C" sub="MRU" tone="green" />
          </div>
          <div className="flex items-center">
            <span className="text-xs w-20 text-slate-400">get("B"):</span>
            <DiagramBox label="A" sub="LRU" tone="amber" />
            <DiagramArrow />
            <DiagramBox label="C" tone="brand" />
            <DiagramArrow />
            <DiagramBox label="B" sub="MRU now" tone="green" />
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does LinkedHashMap add on top of HashMap?', options: ['Sorted iteration', 'A linked list preserving insertion or access order', 'Thread safety', 'Primitive key support'], answerIndex: 1, explanation: 'It threads entries into a doubly-linked list so iteration is predictable, in either insertion or access order.' },
    { question: 'Which hook do you override to build an LRU cache with LinkedHashMap?', options: ['afterNodeAccess()', 'removeEldestEntry()', 'onResize()', 'evictOldest()'], answerIndex: 1, explanation: 'Overriding removeEldestEntry(eldest) to return `size() > capacity` implements automatic eviction.' },
    { question: 'In access-order mode, is get() a read-only operation with respect to internal state?', options: ['Yes, always', 'No — it moves the accessed entry to the end of the ordering list', 'Only if the key does not exist', 'Only for the first call'], answerIndex: 1, explanation: 'get() mutates the linked-list position in access-order mode, which matters for concurrency reasoning.' },
    { question: 'What is the default removeEldestEntry() behavior?', options: ['Always evicts the oldest entry', 'Evicts once size exceeds 16', 'Always returns false (never evicts)', 'Throws UnsupportedOperationException'], answerIndex: 2, explanation: 'By default it always returns false; you must override it to enable any eviction policy.' },
  ],
};
