/* ==========================================================================
   CONTENT: WeakHashMap
   ========================================================================== */

CollectionsContent['weakhashmap'] = {

  overview: {
    paragraphs: [
      'WeakHashMap is a HashMap variant where every key is held via a WeakReference instead of a normal ("strong") reference. If nothing else in the application holds a strong reference to a key, the garbage collector is free to reclaim it — and once that happens, WeakHashMap automatically removes the corresponding entry.',
      'This makes WeakHashMap a natural fit for caches and auxiliary metadata that should never be the reason an object stays alive: the map "remembers" extra information about an object for as long as that object is used elsewhere, and forgets it automatically the moment the object becomes garbage, with no manual cleanup code required.',
      'It is a specialized tool, not a general-purpose replacement for HashMap — most application code should never need it, but it is exactly the right structure for a specific class of memory-leak-avoidance problems.',
    ],
    keyPoints: [
      'Keys are held via WeakReference; entries are auto-removed once a key is no longer strongly reachable and gets garbage collected.',
      'Same bucket-array structure and O(1) average complexity as HashMap for the operations that remain well-defined.',
      'Stale entries (whose keys were collected) are only actually purged lazily, on a subsequent map operation (get/put/size/etc.), via an internal ReferenceQueue.',
      'Values are held via normal strong references — if a value itself references its key (directly or indirectly), that can prevent the key from ever becoming weakly reachable.',
      'Not synchronized; allows one null key (treated specially, held strongly) and any number of null values.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Each key is wrapped in a private WeakHashMap.Entry, which extends WeakReference<Object> and is registered with an internal ReferenceQueue. When the garbage collector determines a key is only weakly reachable, it clears the WeakReference and enqueues that entry onto the queue.',
      'WeakHashMap does not proactively scan for collected keys in the background — instead, essentially every public operation (get, put, size, isEmpty, and others) begins by calling an internal `expungeStaleEntries()` method that drains the reference queue and removes any now-stale entries from the actual bucket table before doing its real work.',
      'This means the map\'s reported size() and iteration contents can appear to shrink "for free" between operations purely as a side effect of GC activity — there is no dedicated background thread doing this cleanup.',
    ],
  },

  complexity: [
    { operation: 'get(key) / put(key, value) / remove(key)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Same shape as HashMap, plus amortized stale-entry expunging.' },
    { operation: 'size() / isEmpty()', average: 'O(k)', worst: 'O(k)', space: 'O(1)', notes: 'k = number of stale (GC\'d) entries pending expunge at call time; usually small.' },
  ],

  memory: {
    paragraphs: [
      'Per-entry overhead is comparable to HashMap\'s Node plus the WeakReference wrapper object around each key — a modest, worthwhile cost given that the whole point of WeakHashMap is to prevent a much larger memory leak (unboundedly accumulating entries for objects that are otherwise long gone).',
      'Because entries disappear as a side effect of garbage collection timing (which is not deterministic or immediately observable), you cannot treat WeakHashMap\'s size() as a precise, stable count at any given instant — it is best-effort.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'WeakHashMap is not synchronized. Wrap with Collections.synchronizedMap(new WeakHashMap<>()) for coarse external synchronization if shared across threads.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator is fail-fast with respect to structural modification via other methods, but note that a key being garbage collected during iteration is itself a form of structural change the iterator did not directly cause — code iterating a WeakHashMap under memory pressure should be written defensively.',
    ],
  },

  ordering: {
    paragraphs: [
      'No ordering guarantee, the same as HashMap (which it closely mirrors internally).',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Allows a single null key, which — since null cannot be wrapped in a meaningful WeakReference — is handled as a special case and effectively held strongly (it will never be auto-removed by GC). Allows any number of null values.',
    ],
  },

  useCases: [
    { title: 'Canonicalizing / interning mappings', description: 'Mapping one object to a canonical equivalent without preventing the original from being garbage collected once no longer used elsewhere.' },
    { title: 'Per-object metadata caches', description: 'Attaching auxiliary computed data to objects (e.g. reflection metadata keyed by Class<?>) without needing to modify those objects\' own classes and without leaking memory as classes are unloaded.' },
    { title: 'Listener/callback registries keyed by the observed object', description: 'Associating callbacks with objects such that the association disappears automatically once the observed object itself is no longer reachable, avoiding classic listener-leak bugs.' },
  ],

  springBootExamples: [
    {
      title: 'Per-Class reflection metadata cache that does not pin classloaders',
      description: 'A framework-style component caches expensive reflection introspection results keyed by Class<?>, using WeakHashMap so dynamically-loaded/unloaded classes (e.g. from a plugin system) do not leak memory forever.',
      code:
`@Component
public class BeanIntrospectionCache {

    private final Map<Class<?>, BeanMetadata> cache = Collections.synchronizedMap(new WeakHashMap<>());

    public BeanMetadata metadataFor(Class<?> type) {
        return cache.computeIfAbsent(type, BeanMetadata::introspect);
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What is the fundamental difference between WeakHashMap and HashMap?', difficulty: 'Intermediate', answer: 'WeakHashMap holds its keys via WeakReference instead of a normal strong reference. Once a key has no strong references anywhere else in the application and is garbage collected, WeakHashMap automatically removes that entry — HashMap keys, by contrast, are held strongly and will never be collected while the map itself is reachable.' },
    { question: 'When are stale (garbage-collected) entries actually removed from a WeakHashMap?', difficulty: 'Advanced', answer: 'Lazily — not immediately when the GC clears the WeakReference, but on the next call to essentially any WeakHashMap method (get, put, size, etc.), which internally drains an associated ReferenceQueue and purges the corresponding stale entries before proceeding.' },
    { question: 'Why might a key in a WeakHashMap never actually get garbage collected even though it "should"?', difficulty: 'Advanced', answer: 'If the value associated with that key (directly or transitively) holds a strong reference back to the key itself, the key remains strongly reachable through the map\'s own value, defeating the purpose — you must ensure values do not accidentally re-anchor their keys.' },
    { question: 'Is WeakHashMap a substitute for a proper caching library like Caffeine or Guava Cache?', difficulty: 'Intermediate', answer: 'Generally no — WeakHashMap only offers GC-driven eviction with no size limits, TTLs, or eviction statistics. Dedicated caching libraries provide bounded size, time-based expiry, and eviction listeners, which most production caches actually need.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Observe entries disappearing after their keys are no longer referenced',
        statement: 'Demonstrate (illustratively) that a WeakHashMap entry can vanish once its key has no other strong references and a GC occurs.',
        code:
`import java.util.*;

public class WeakHashMapDemo {
    public static void main(String[] args) throws InterruptedException {
        Map<Object, String> cache = new WeakHashMap<>();
        Object key = new Object();
        cache.put(key, "metadata for key");

        System.out.println("Before: " + cache.size());

        key = null; // drop the only strong reference
        System.gc(); // request (not guarantee) garbage collection
        Thread.sleep(200);
        cache.size(); // triggers expungeStaleEntries() internally

        System.out.println("After: " + cache.size());
    }
}`,
        output: 'Before: 1\nAfter: 0',
      },
    ],
    intermediate: [
      {
        title: 'Per-object metadata attachment without a memory leak',
        statement: 'Attach a computed "display name" to arbitrary request objects without modifying their class, using WeakHashMap so entries do not outlive the requests themselves.',
        code:
`import java.util.*;

public class RequestDisplayNames {

    private static class Request { final String id; Request(String id) { this.id = id; } }

    private static final Map<Request, String> displayNames = new WeakHashMap<>();

    static String displayNameFor(Request request) {
        return displayNames.computeIfAbsent(request, r -> "Request#" + r.id);
    }

    public static void main(String[] args) {
        Request request = new Request("42");
        System.out.println(displayNameFor(request));
        System.out.println(displayNames.size());
    }
}`,
        output: 'Request#42\n1',
      },
    ],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Avoiding listener leaks in a hospital monitoring dashboard',
      domain: 'Healthcare',
      description: 'A real-time vitals dashboard registers UI update callbacks keyed by patient-monitor session objects; using WeakHashMap ensures a callback is automatically forgotten once its monitor session object is discarded, instead of accumulating leaked callbacks across a long-running shift.',
      code:
`public class MonitorCallbackRegistry {

    private final Map<MonitorSession, Consumer<VitalsUpdate>> callbacks =
        Collections.synchronizedMap(new WeakHashMap<>());

    public void onUpdate(MonitorSession session, Consumer<VitalsUpdate> callback) {
        callbacks.put(session, callback);
    }

    public void dispatch(MonitorSession session, VitalsUpdate update) {
        Consumer<VitalsUpdate> callback = callbacks.get(session);
        if (callback != null) callback.accept(update);
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Weak per-object caches nested by category: Map<String, WeakHashMap<Object, Object>>',
      explanation: 'A plugin framework keeps per-plugin-category metadata caches, each using WeakHashMap so unloaded plugin classes do not leak their metadata forever.',
      code:
`Map<String, WeakHashMap<Class<?>, Object>> metadataByCategory = new HashMap<>();

metadataByCategory
    .computeIfAbsent(category, c -> new WeakHashMap<>())
    .put(pluginClass, computedMetadata);`,
    },
  ],

  bestPractices: [
    'Use WeakHashMap only for genuine "auxiliary data about an object that must not outlive it" scenarios — not as a general-purpose cache with size/TTL requirements.',
    'Ensure values never hold a strong reference back to their own key, or the key can never actually become collectible.',
    'Do not rely on WeakHashMap.size() as a precise, stable measurement — it reflects best-effort, GC-timing-dependent state.',
    'Prefer a dedicated caching library (Caffeine, Guava Cache) when you need bounded size, TTL expiry, or eviction statistics rather than pure GC-driven cleanup.',
  ],

  commonMistakes: [
    {
      mistake: 'Storing a value that holds a strong reference back to its own key.',
      why: 'The key remains strongly reachable through the map\'s own value slot, so it is never actually eligible for garbage collection, defeating WeakHashMap\'s entire purpose.',
      fix: 'Ensure values reference the key only weakly (or not at all), or restructure so the association does not create a reference cycle back to the key.',
    },
    {
      mistake: 'Expecting entries to disappear immediately/deterministically after the key becomes unreachable.',
      why: 'Garbage collection timing is not deterministic, and stale-entry purging only happens lazily on the next map operation.',
      fix: 'Never write logic that depends on the precise timing of entry removal; treat it as a best-effort memory-management aid, not a synchronous cleanup mechanism.',
    },
    {
      mistake: 'Using WeakHashMap as a general-purpose bounded cache.',
      why: 'It has no size limit, no TTL, and no eviction policy beyond "the key happened to be garbage collected" — under light memory pressure it may not shrink at all.',
      fix: 'Use a purpose-built cache library with explicit size/TTL configuration for real caching requirements.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'WeakHashMap', 'HashMap', 'IdentityHashMap'],
    rows: [
      ['Key reference strength', 'Weak (GC-collectible)', 'Strong', 'Strong'],
      ['Key comparison', 'equals()/hashCode()', 'equals()/hashCode()', 'Reference identity (==)'],
      ['Entries auto-removed on GC', 'Yes', 'No', 'No'],
      ['Typical use', 'Auxiliary metadata / listener registries', 'General-purpose storage', 'Object-graph traversal / cycle detection'],
    ],
  },

  diagrams: [
    {
      title: 'Weak reference lifecycle',
      caption: 'Once no strong references to the key remain, the GC clears the WeakReference and the entry is purged on the next map operation.',
      render: () => (
        <div className="flex items-center gap-3">
          <DiagramBox label="key" tone="brand" sub="strongly referenced" />
          <DiagramArrow label="app drops ref" />
          <DiagramBox label="key" tone="amber" sub="weakly reachable" />
          <DiagramArrow label="GC + expunge" />
          <DiagramBox label="∅" tone="dashed" sub="entry removed" />
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'How does WeakHashMap hold its keys internally?', options: ['Via SoftReference', 'Via WeakReference', 'Via PhantomReference', 'Via a normal strong reference'], answerIndex: 1, explanation: 'Each key is wrapped in a WeakReference, allowing it to be garbage collected once no strong references remain elsewhere.' },
    { question: 'When are stale entries (whose keys were garbage collected) actually removed from the map?', options: ['Immediately when the GC runs', 'Lazily, on the next map operation', 'Only when clear() is called', 'Never, automatically'], answerIndex: 1, explanation: 'Purging happens lazily via an internal ReferenceQueue drained at the start of most map operations.' },
    { question: 'What can prevent a WeakHashMap key from ever being garbage collected?', options: ['Using a String as the key', 'The associated value holding a strong reference back to the key', 'Calling get() on the map', 'Using a large initial capacity'], answerIndex: 1, explanation: 'If the value strongly references its own key, the key stays reachable through the map itself.' },
    { question: 'Is WeakHashMap a good substitute for a bounded, TTL-based cache library?', options: ['Yes, it is equivalent', 'No — it has no size limit or TTL, only GC-driven eviction', 'Yes, but only for String keys', 'No, it cannot hold more than 16 entries'], answerIndex: 1, explanation: 'It provides no size bound, TTL, or eviction statistics — purpose-built cache libraries cover those needs.' },
  ],
};
