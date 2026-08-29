/* ==========================================================================
   CONTENT: ConcurrentHashMap
   ========================================================================== */

CollectionsContent['concurrenthashmap'] = {

  overview: {
    paragraphs: [
      'ConcurrentHashMap (Java 5, java.util.concurrent) is the modern, production-grade answer to "I need a thread-safe map" — it achieves high concurrent throughput without the single-global-lock bottleneck of Hashtable or Collections.synchronizedMap.',
      'Its pre-Java-8 design partitioned the table into 16 independently-locked "segments"; Java 8 replaced that with a simpler and even more scalable design based on per-bin (per-bucket) synchronization plus lock-free CAS operations for the common case of inserting into an empty bin — most reads require no locking at all.',
      'It deliberately disallows null keys and null values — a design decision rooted specifically in concurrency semantics, not an arbitrary restriction (explained under Null Handling below).',
    ],
    keyPoints: [
      'Fine-grained concurrency: reads are largely lock-free; writes lock only the specific bin being modified, not the whole map.',
      'O(1) average get/put/remove, same as HashMap, but safe under real concurrent access.',
      'Iterators are weakly consistent — they never throw ConcurrentModificationException and reflect the state of the map at some point during (not necessarily at the start or end of) the traversal.',
      'Disallows null keys and null values (throws NullPointerException) to avoid concurrency-related ambiguity.',
      'Provides atomic compound operations: putIfAbsent, computeIfAbsent, compute, merge — critical for correct concurrent code.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Since Java 8, ConcurrentHashMap uses the same Node<K,V>[] table + bucket-chain-or-tree design as HashMap, but every structural change to a bin uses either a CAS (compare-and-swap) operation (for inserting into a currently-empty bin) or `synchronized` on just that bin\'s head node (for anything more involved, like appending to a non-empty chain).',
      'Because the lock scope is a single bin rather than the whole table, two threads writing to different bins never block each other at all — contention only occurs when multiple threads target the exact same bin simultaneously.',
      'Reads (get()) are largely lock-free: they rely on volatile reads of the table and node references to see a consistent (if possibly slightly stale) view without ever acquiring a lock, which is why read-heavy concurrent workloads scale so well.',
      'size() does not maintain a single shared counter (which would itself become a contention hotspot) — instead it uses an array of "CounterCell" objects that different threads update independently, summing them only when size() is actually called, similar in spirit to LongAdder.',
      'Resizing is itself parallelized: multiple threads that happen to be writing during a resize can cooperatively help move (transfer) nodes from the old table to the new one, rather than one thread blocking all others.',
    ],
  },

  complexity: [
    { operation: 'get(key)', average: 'O(1)', worst: 'O(log n)', space: 'O(1)', notes: 'Largely lock-free; treeified bins cap worst case at O(log n).' },
    { operation: 'put(key, value) / remove(key)', average: 'O(1)', worst: 'O(log n)', space: 'O(1)', notes: 'Locks only the target bin, not the whole table.' },
    { operation: 'putIfAbsent / computeIfAbsent / merge', average: 'O(1)', worst: 'O(log n)', space: 'O(1)', notes: 'Atomic — the entire check-and-act sequence happens under the bin lock.' },
    { operation: 'size()', average: 'O(1) amortized', worst: 'O(#threads)', space: 'O(1)', notes: 'Sums per-thread counter cells rather than maintaining one shared counter.' },
  ],

  memory: {
    paragraphs: [
      'Per-entry overhead is comparable to HashMap\'s Node, with some additional bookkeeping (e.g. sizeCtl, counter cells) shared across the whole map rather than per-entry, so the marginal cost per element is close to HashMap\'s.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'ConcurrentHashMap is fully thread-safe for both individual operations and the atomic compound operations it exposes (putIfAbsent, computeIfAbsent, compute, merge, replace). These compound methods are the primary reason to prefer it over merely synchronizing a HashMap externally — they let you express "check and update atomically" without hand-written locking.',
      'One notable caveat: the function passed to computeIfAbsent/compute/merge must not attempt to modify the same ConcurrentHashMap (including via a recursive call for a different key that maps to the same bin) — doing so can deadlock, since the bin is already locked for the duration of the callback.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iterators (and the keySet()/values()/entrySet() views) are weakly consistent: they never throw ConcurrentModificationException, are guaranteed to reflect the state of the map at (or after) the iterator\'s creation, and may or may not reflect updates made by other threads during the traversal — but they will never return the same element twice or skip an element that was present for the entire traversal and never removed.',
      'This is a fundamentally different (and, for concurrent use, far more useful) guarantee than HashMap\'s fail-fast iterators, which are designed to detect single-threaded bugs, not to behave sanely under genuine concurrent mutation.',
    ],
  },

  ordering: {
    paragraphs: [
      'No ordering guarantee, the same as HashMap — ConcurrentHashMap optimizes purely for safe, scalable concurrent access, not for any kind of ordering.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'ConcurrentHashMap disallows both null keys and null values. The reason is specifically about concurrency: in a single-threaded HashMap, `map.get(key) == null` is ambiguous between "no mapping" and "mapped to null", but you can disambiguate with a follow-up containsKey(key) call since nothing else can mutate the map between the two calls. In a concurrent map, another thread could remove the mapping between your get() and your containsKey() check, making that disambiguation pattern fundamentally unreliable — so the JDK designers simply outlawed null values (and, for consistency, null keys) entirely.',
    ],
  },

  useCases: [
    { title: 'Shared in-memory caches', description: 'Any cache accessed by multiple request-handling threads — computeIfAbsent() gives you atomic "load if missing" semantics for free.' },
    { title: 'Concurrent counters and registries', description: 'Per-key counters (via merge(key, 1L, Long::sum)), active-session registries, rate-limiting buckets.' },
    { title: 'Read-heavy shared configuration/state', description: 'Feature flags, routing tables, or other shared state that is read constantly and updated occasionally.' },
    { title: 'Building block for higher-level concurrent utilities', description: 'ConcurrentHashMap.newKeySet() gives you a concurrent Set for free by wrapping a ConcurrentHashMap<E, Boolean>.' },
  ],

  springBootExamples: [
    {
      title: 'Thread-safe request-count rate limiter',
      description: 'A simple in-memory rate limiter tracks request counts per API key using merge() for atomic incrementing under concurrent request handling.',
      code:
`@Component
public class SimpleRateLimiter {

    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final int maxPerWindow;

    public SimpleRateLimiter(@Value("\${rate-limit.max-per-minute}") int maxPerWindow) {
        this.maxPerWindow = maxPerWindow;
    }

    public boolean tryAcquire(String apiKey) {
        AtomicInteger count = requestCounts.computeIfAbsent(apiKey, k -> new AtomicInteger(0));
        return count.incrementAndGet() <= maxPerWindow;
    }

    @Scheduled(fixedRate = 60_000)
    public void resetWindow() {
        requestCounts.clear();
    }
}`,
    },
    {
      title: 'Concurrent cache-aside pattern with computeIfAbsent',
      description: 'A product-lookup service atomically loads and caches product data on first access, safely across concurrent requests for the same product.',
      code:
`@Service
public class ProductLookupCache {

    private final Map<String, Product> cache = new ConcurrentHashMap<>();
    private final ProductRepository repository;

    public ProductLookupCache(ProductRepository repository) {
        this.repository = repository;
    }

    public Product get(String productId) {
        // Safe under concurrency: the load happens at most once per key, even
        // if many threads call get() for the same missing key simultaneously.
        return cache.computeIfAbsent(productId, repository::findById);
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'How does ConcurrentHashMap achieve better concurrency than a synchronized HashMap?', difficulty: 'Advanced', answer: 'It locks at the granularity of a single bin (bucket) rather than the whole table — writes to different bins proceed fully in parallel with no contention, and reads are largely lock-free via volatile access. A synchronized HashMap (or Hashtable) instead serializes every single operation behind one global lock.' },
    { question: 'Why does ConcurrentHashMap disallow null keys and null values?', difficulty: 'Advanced', answer: 'In a single-threaded map, you can disambiguate "no mapping" from "mapped to null" by following get() with containsKey(). In a concurrent map another thread could mutate the map between those two calls, making that disambiguation unreliable — so null is disallowed entirely to avoid the ambiguity ever arising.' },
    { question: 'What does "weakly consistent" mean for ConcurrentHashMap\'s iterators?', difficulty: 'Intermediate', answer: 'The iterator never throws ConcurrentModificationException, is guaranteed to reflect the map\'s state at (or after) its creation, and may (but is not guaranteed to) reflect concurrent updates made during the traversal — while never returning a duplicate or omitting an element that was present throughout and never removed.' },
    { question: 'Is it safe to call map.put() on the same ConcurrentHashMap from inside a computeIfAbsent() callback?', difficulty: 'Advanced', answer: 'No — the callback runs while the target bin is locked; recursively mutating the same map (especially a key that could map to the same bin) can deadlock or throw an exception depending on the JDK version. The mapping function must be side-effect-free with respect to the same map.' },
    { question: 'What is the practical difference between ConcurrentHashMap and Collections.synchronizedMap(new HashMap<>())?', difficulty: 'Intermediate', answer: 'synchronizedMap wraps every method in a single lock (like Hashtable) and still requires manual external synchronization for both compound operations and iteration; ConcurrentHashMap provides fine-grained locking, built-in atomic compound operations, and weakly-consistent iteration that never needs external synchronization at all.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Thread-safe word frequency counter',
        statement: 'Count word occurrences across multiple threads safely using ConcurrentHashMap.merge().',
        code:
`import java.util.concurrent.*;
import java.util.*;

public class ConcurrentWordCount {
    public static void main(String[] args) throws InterruptedException {
        Map<String, Integer> counts = new ConcurrentHashMap<>();
        List<String> words = List.of("cat", "dog", "cat", "bird", "dog", "cat");

        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (String word : words) {
            pool.submit(() -> counts.merge(word, 1, Integer::sum));
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println(new TreeMap<>(counts)); // sort just for stable println output
    }
}`,
        output: '{bird=1, cat=3, dog=2}',
      },
    ],
    intermediate: [
      {
        title: 'Atomic cache-aside loader with computeIfAbsent',
        statement: 'Simulate multiple threads requesting the same missing key and confirm the loader function runs exactly once.',
        code:
`import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class SingleLoadGuarantee {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();
        AtomicInteger loadCount = new AtomicInteger();

        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int i = 0; i < 8; i++) {
            pool.submit(() -> cache.computeIfAbsent("shared-key", k -> {
                loadCount.incrementAndGet();
                return "loaded-value";
            }));
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Load count: " + loadCount.get());
    }
}`,
        output: 'Load count: 1',
      },
    ],
    advanced: [
      {
        title: 'Concurrent sliding-window request counter with expiry',
        statement: 'Implement a per-key request counter where each key\'s count resets after a time window, safe under concurrent access.',
        code:
`import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

public class SlidingWindowCounter {

    private record Window(AtomicLong count, long windowStartMillis) {}

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final long windowSizeMillis;

    public SlidingWindowCounter(long windowSizeMillis) {
        this.windowSizeMillis = windowSizeMillis;
    }

    public long increment(String key) {
        long now = System.currentTimeMillis();
        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStartMillis() >= windowSizeMillis) {
                return new Window(new AtomicLong(1), now);
            }
            existing.count().incrementAndGet();
            return existing;
        });
        return window.count().get();
    }

    public static void main(String[] args) throws InterruptedException {
        SlidingWindowCounter counter = new SlidingWindowCounter(100);
        System.out.println(counter.increment("user-1"));
        System.out.println(counter.increment("user-1"));
        Thread.sleep(150);
        System.out.println(counter.increment("user-1")); // window reset
    }
}`,
        output: '1\n2\n1',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Concurrent session registry for a payments gateway',
      domain: 'Payments',
      description: 'A payment gateway tracks active idempotent-request sessions across many concurrent request-handling threads, using ConcurrentHashMap for both safety and throughput.',
      code:
`@Component
public class IdempotentRequestRegistry {

    private final ConcurrentHashMap<String, CompletableFuture<PaymentResult>> inFlight = new ConcurrentHashMap<>();

    public CompletableFuture<PaymentResult> processOnce(String idempotencyKey, Supplier<PaymentResult> processor) {
        return inFlight.computeIfAbsent(idempotencyKey, key ->
            CompletableFuture.supplyAsync(processor).whenComplete((r, ex) -> inFlight.remove(key)));
    }
}`,
    },
    {
      title: 'Live inventory reservation counters for a flash sale',
      domain: 'E-commerce',
      description: 'A flash-sale checkout service decrements available stock counts under heavy concurrent load using compute() for atomic check-and-decrement semantics.',
      code:
`@Service
public class FlashSaleStockService {

    private final ConcurrentHashMap<String, Integer> availableStock = new ConcurrentHashMap<>();

    public boolean tryReserve(String sku) {
        boolean[] reserved = {false};
        availableStock.compute(sku, (key, remaining) -> {
            if (remaining != null && remaining > 0) {
                reserved[0] = true;
                return remaining - 1;
            }
            return remaining;
        });
        return reserved[0];
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Concurrent nested map: ConcurrentHashMap<String, ConcurrentHashMap<String, Long>>',
      explanation: 'A real-time analytics service tracks per-region, per-event-type counters, both levels safe for concurrent updates from many ingestion threads.',
      code:
`ConcurrentHashMap<String, ConcurrentHashMap<String, Long>> countsByRegionAndEvent = new ConcurrentHashMap<>();

countsByRegionAndEvent
    .computeIfAbsent(region, r -> new ConcurrentHashMap<>())
    .merge(eventType, 1L, Long::sum);`,
    },
  ],

  bestPractices: [
    'Prefer the atomic compound methods (computeIfAbsent, compute, merge, putIfAbsent) over manual "check then act" sequences — they are both simpler and race-free.',
    'Never let a computeIfAbsent/compute/merge callback mutate the same map — it can deadlock or throw depending on JDK version.',
    'Use ConcurrentHashMap.newKeySet() when you need a concurrent Set rather than manually wrapping keys in a dummy-valued map yourself.',
    'Remember iteration is weakly consistent, not a frozen snapshot — do not assume a full traversal reflects any single consistent instant in time under concurrent writes.',
  ],

  commonMistakes: [
    {
      mistake: 'Calling map.put() (or another mutating method on the same map) from inside a computeIfAbsent()/compute() callback.',
      why: 'The relevant bin is locked for the duration of the callback; recursive mutation of the same map can deadlock or throw an exception.',
      fix: 'Compute the value using only external state and inputs, and perform any related map updates outside the callback.',
    },
    {
      mistake: 'Treating ConcurrentHashMap iteration as a consistent snapshot for reporting purposes.',
      why: 'Weakly consistent iterators can reflect a mix of before- and after-mutation states across a single traversal under concurrent writes.',
      fix: 'If a true point-in-time snapshot is required, copy into an immutable Map (e.g. Map.copyOf()) under an external lock, or design the reporting logic to tolerate slight inconsistency.',
    },
    {
      mistake: 'Using ConcurrentHashMap and still wrapping every access in synchronized blocks "just to be safe".',
      why: 'This defeats the entire purpose of its fine-grained internal locking and re-introduces the exact global-lock bottleneck ConcurrentHashMap was designed to avoid.',
      fix: 'Trust the built-in atomic methods for single-key operations; only add external coordination for genuinely multi-key invariants.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'ConcurrentHashMap', 'Hashtable', 'Collections.synchronizedMap(HashMap)'],
    rows: [
      ['Locking granularity', 'Per-bin', 'Whole map (single lock)', 'Whole map (single lock)'],
      ['Read cost', 'Largely lock-free', 'Always locked', 'Always locked'],
      ['Atomic compound ops', 'Yes (computeIfAbsent, merge, etc.)', 'No (manual sync required)', 'No (manual sync required)'],
      ['Null keys/values', 'Neither allowed', 'Neither allowed', 'Allowed (delegates to HashMap)'],
      ['Iterator behavior', 'Weakly consistent, never throws CME', 'Fail-fast (modern iterator) / unsafe (Enumeration)', 'Fail-fast'],
    ],
  },

  diagrams: [
    {
      title: 'Per-bin locking vs single global lock',
      caption: 'Two threads writing to different bins proceed in parallel under ConcurrentHashMap; Hashtable/synchronizedMap would serialize both behind one lock.',
      render: () => (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <DiagramBucketColumn bucketIndex={0} entries={['T1 writing']} tone="green" />
            <DiagramBucketColumn bucketIndex={1} entries={[]} />
            <DiagramBucketColumn bucketIndex={2} entries={['T2 writing']} tone="green" />
            <DiagramBucketColumn bucketIndex={3} entries={[]} />
          </div>
          <p className="text-xs text-slate-400">ConcurrentHashMap: bucket 0 and bucket 2 lock independently — no contention between T1 and T2.</p>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What is the locking granularity of ConcurrentHashMap since Java 8?', options: ['One lock for the whole map', 'One lock per 16 segments', 'One lock per bin (bucket)', 'No locking at all, ever'], answerIndex: 2, explanation: 'Java 8 replaced the earlier 16-segment design with per-bin synchronization plus CAS for empty-bin insertion.' },
    { question: 'Can ConcurrentHashMap store null values?', options: ['Yes', 'No, it throws NullPointerException', 'Only null keys, not null values', 'Only in single-threaded use'], answerIndex: 1, explanation: 'Both null keys and null values are disallowed, specifically to avoid concurrency-related ambiguity.' },
    { question: 'What does "weakly consistent" mean for its iterators?', options: ['They throw ConcurrentModificationException like HashMap', 'They never throw CME and reflect a reasonable, not-necessarily-frozen view of the map', 'They always reflect a perfectly frozen snapshot', 'They are not thread-safe to use at all'], answerIndex: 1, explanation: 'Weakly consistent iterators tolerate concurrent modification without throwing, without guaranteeing a single consistent instant.' },
    { question: 'Why is it dangerous to mutate the same ConcurrentHashMap from within a computeIfAbsent() callback?', options: ['It is actually perfectly safe', 'The target bin is locked during the callback, risking deadlock', 'computeIfAbsent() is read-only and the mutation is silently ignored', 'It throws ClassCastException'], answerIndex: 1, explanation: 'The bin lock held during the callback can conflict with the recursive mutation attempt, causing a deadlock or an exception depending on JDK version.' },
  ],
};
