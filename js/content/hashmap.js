/* ==========================================================================
   CONTENT: HashMap
   ========================================================================== */

CollectionsContent['hashmap'] = {

  overview: {
    paragraphs: [
      'HashMap is the default general-purpose Map implementation and arguably the single most-used class in the entire JDK. It stores key-value pairs in a hash table, giving O(1) average-case get/put/remove/containsKey at the cost of no ordering guarantee.',
      'Every other hash-based collection in this app (HashSet, LinkedHashSet, ConcurrentHashMap\'s conceptual cousin) either wraps a HashMap directly or shares its core bucket-and-treeification design, so understanding HashMap deeply is the single highest-leverage thing you can learn in this entire framework.',
      'Correctness of a HashMap depends entirely on well-behaved hashCode() and equals() implementations for its keys — get the hash contract wrong and lookups silently fail or duplicates silently appear.',
    ],
    keyPoints: [
      'Backed by an array of buckets, each holding a linked list (or, since Java 8, a red-black tree once a bucket gets large) of Node<K,V> entries.',
      'O(1) average time for get/put/remove/containsKey; default initial capacity 16, default load factor 0.75.',
      'Capacity is always a power of two, which lets the JDK use a fast bitmask (`hash & (capacity - 1)`) instead of a modulo operation to pick a bucket.',
      'No ordering guarantee at all — not insertion order, not any kind of sort order.',
      'Allows exactly one null key and any number of null values.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'HashMap stores an internal `Node<K,V>[] table`. Each Node holds the cached hash, key, value, and a `next` reference for chaining within a bucket. put(key, value) computes `hash(key)` — `(h = key.hashCode()) ^ (h >>> 16)`, a "hash spreading" step that XORs the high 16 bits into the low 16 bits to reduce collisions caused by poor hashCode() implementations that only vary in their high bits — then picks the bucket via `hash & (table.length - 1)`.',
      'If the target bucket is empty, the new node is inserted directly. If not, HashMap walks the bucket\'s chain, calling equals() on each existing key to check for a match (replace the value) versus a genuine hash collision (append a new node). Since Java 8, if a single bucket\'s chain grows to 8 or more nodes AND the table has at least 64 buckets, that bucket is treeified into a small red-black tree keyed by hash (and, as a tie-breaker, a class-name comparison), bounding worst-case lookup within the bucket to O(log n).',
      'The map resizes (always doubling capacity) whenever `size > capacity * loadFactor` (default 0.75, so the first resize from 16 happens at 13 entries). Resizing allocates a new, larger table and rehashes every existing entry into it — a clever trick since Java 8 means most entries either stay in the same bucket index or move to `oldIndex + oldCapacity`, avoiding a full re-hash computation for every node.',
      'Because capacity is always a power of two, `hash & (capacity - 1)` is mathematically equivalent to `hash % capacity` but is a single bitwise AND instead of a division — one of several small, deliberate performance details baked into the design.',
    ],
  },

  complexity: [
    { operation: 'get(key) / put(key, value) / remove(key) / containsKey(key)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Worst case only with a pathological hashCode(); treeified buckets cap it at O(log n) in modern JDKs.' },
    { operation: 'containsValue(value)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Must scan every entry — there is no value-side index.' },
    { operation: 'iteration (entrySet/keySet/values)', average: 'O(capacity + size)', worst: 'O(capacity + size)', space: 'O(1)', notes: 'Must scan every bucket slot, including empty ones.' },
    { operation: 'resize (rehash)', average: 'O(n)', worst: 'O(n)', space: 'O(n)', notes: 'Happens once per doubling; amortized O(1) per put.' },
  ],

  memory: {
    paragraphs: [
      'Each entry costs one Node<K,V>: a cached int hash, a key reference, a value reference, and a `next` reference — roughly 32+ bytes of pure overhead per entry before counting the key and value objects themselves.',
      'Autoboxing applies here just as it does for ArrayList: a HashMap<Integer, Integer> stores boxed Integer objects for both keys and values, which is far more memory- and cache-hungry than a primitive-keyed structure. For very large numeric maps, consider a specialized primitive-map library.',
    ],
    points: [
      'Pre-size with `new HashMap<>(expectedSize * 4 / 3)` (or simply a generous capacity) when the eventual size is roughly known, to avoid repeated resize/rehash cycles.',
      'Prefer compact, immutable key types (String, Integer, a small immutable record) — mutable keys risk the same "lost in the wrong bucket" bug HashSet has.',
      'containsValue() is O(n); if you need fast lookup by value too, maintain a second reverse map or use a bidirectional-map library.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'HashMap has no internal synchronization. Concurrent structural modification is unsafe — in pre-Java-8 JDKs, concurrent resizes could even corrupt a bucket\'s linked list into a cycle, causing an infinite loop on the next get(). While later JDKs fixed the infinite-loop failure mode, concurrent mutation remains fundamentally unsafe and can silently lose updates or corrupt state.',
      'Use Collections.synchronizedMap(new HashMap<>()) for coarse-grained safety (with manual synchronization required for iteration), or — almost always the better choice — java.util.concurrent.ConcurrentHashMap, which is built from the ground up for safe, scalable concurrent access.',
    ],
  },

  iteration: {
    paragraphs: [
      'All three views — keySet(), values(), and entrySet() — share the same fail-fast iterator behavior as ArrayList/HashSet: structural modification during iteration (outside the iterator\'s own remove()) throws ConcurrentModificationException.',
      'entrySet() is the most efficient way to iterate both keys and values together — iterating keySet() and calling get(key) inside the loop performs a redundant second lookup per entry.',
    ],
  },

  ordering: {
    paragraphs: [
      'HashMap makes no ordering guarantee whatsoever — iteration order reflects internal bucket layout and can change across resizes or JVM runs. Use LinkedHashMap for insertion order or TreeMap for sorted-by-key order.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'HashMap permits exactly one null key (stored, by convention, in bucket 0) and any number of null values. This is a deliberate design choice that Hashtable and ConcurrentHashMap both explicitly reject, for different reasons discussed on their respective pages.',
    ],
  },

  useCases: [
    { title: 'General-purpose key-value storage', description: 'The default choice any time you need fast lookup by key and do not need ordering.' },
    { title: 'Counting / frequency maps', description: 'Word counts, event tallies, histogram-style aggregation via merge(key, 1, Integer::sum).' },
    { title: 'Indexing collections by a derived key', description: 'Grouping a List<T> into a Map<K, List<T>> via Collectors.groupingBy() or manual computeIfAbsent().' },
    { title: 'Caching computed results', description: 'Memoization: computeIfAbsent(key, this::expensiveCompute) to avoid redundant work.' },
  ],

  springBootExamples: [
    {
      title: 'In-memory request-scoped cache using computeIfAbsent',
      description: 'A pricing service memoizes an expensive tax calculation per (region, category) pair within a single request.',
      code:
`@Service
public class TaxCalculationService {

    public BigDecimal effectiveTaxRate(Map<String, BigDecimal> cache, String region, String category) {
        String key = region + ":" + category;
        return cache.computeIfAbsent(key, k -> computeExpensiveTaxRate(region, category));
    }

    private BigDecimal computeExpensiveTaxRate(String region, String category) {
        // Simulates a slow rule-engine lookup
        return TaxRulesEngine.evaluate(region, category);
    }
}`,
    },
    {
      title: 'Grouping orders by customer for a reporting endpoint',
      description: 'A reporting controller groups a flat list of orders into a Map<String, List<Order>> keyed by customer ID using the Collectors.groupingBy idiom, which is backed by a HashMap.',
      code:
`@RestController
@RequestMapping("/api/reports")
public class OrderReportController {

    private final OrderRepository orderRepository;

    public OrderReportController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders-by-customer")
    public Map<String, List<Order>> ordersByCustomer() {
        return orderRepository.findAll().stream()
            .collect(Collectors.groupingBy(Order::getCustomerId));
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why does HashMap XOR the high bits of hashCode() into the low bits before computing the bucket index?', difficulty: 'Advanced', answer: 'Because the bucket index is computed as `hash & (capacity - 1)`, only the low bits of the hash actually matter for small capacities. Many hashCode() implementations vary mostly in their high bits (e.g. Object.hashCode() based on memory addresses), so without spreading, those differences would be discarded and cause excessive collisions. XOR-ing high into low bits mixes that entropy into the bits that are actually used.' },
    { question: 'What is bucket treeification and why was it introduced?', difficulty: 'Advanced', answer: 'Since Java 8, if a bucket\'s chain grows to 8+ nodes while the table has 64+ buckets, the bucket converts from a linked list to a red-black tree, bounding worst-case lookup at O(log n) instead of O(n) — a defense against both accidental hash clustering and adversarial hashCode-collision denial-of-service attacks.' },
    { question: 'Why must you keep hashCode() and equals() consistent for HashMap keys?', difficulty: 'Intermediate', answer: 'get()/put() first use hashCode() to find the bucket, then use equals() to identify the exact key within that bucket. If two "equal" keys produce different hash codes, one lookup can miss the other entirely — silently causing a duplicate entry instead of an update.' },
    { question: 'What is the default load factor and why 0.75?', difficulty: 'Intermediate', answer: '0.75 is the JDK\'s tuned balance between memory usage and lookup performance: a higher load factor (closer to 1.0) packs more entries per bucket before resizing (saving memory but increasing collision chains, hence average chain length), while a lower one resizes more eagerly (using more memory for shorter chains).' },
    { question: 'What is the practical difference between HashMap and Hashtable?', difficulty: 'Beginner', answer: 'Hashtable synchronizes every method (legacy, coarse-grained locking) and disallows both null keys and null values; HashMap has no synchronization and allows one null key plus any number of null values. Neither is the right choice for genuinely concurrent access today — that is what ConcurrentHashMap is for.' },
    { question: 'Why is iterating entrySet() preferred over iterating keySet() and calling get(key) inside the loop?', difficulty: 'Beginner', answer: 'entrySet() gives you the key and value together from the same node in one pass; iterating keySet() and then calling get(key) performs a second, entirely redundant bucket lookup for every single entry.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Word frequency counter',
        statement: 'Given a sentence, count how many times each word appears, using merge() for a one-line increment.',
        code:
`import java.util.*;

public class WordFrequency {
    public static void main(String[] args) {
        String text = "the quick fox jumps over the lazy fox";
        Map<String, Integer> counts = new HashMap<>();

        for (String word : text.split(" ")) {
            counts.merge(word, 1, Integer::sum);
        }

        System.out.println(counts);
    }
}`,
        output: '{the=2, quick=1, fox=2, jumps=1, over=1, lazy=1}',
      },
      {
        title: 'Two Sum using a HashMap',
        statement: 'Given an array of integers and a target, return the indices of the two numbers that add up to the target, in O(n).',
        code:
`import java.util.*;

public class TwoSum {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> valueToIndex = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (valueToIndex.containsKey(complement)) {
                return new int[]{valueToIndex.get(complement), i};
            }
            valueToIndex.put(nums[i], i);
        }
        throw new IllegalArgumentException("No two sum solution");
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
    }
}`,
        output: '[0, 1]',
      },
    ],
    intermediate: [
      {
        title: 'Group anagrams',
        statement: 'Given a list of words, group the ones that are anagrams of each other using a sorted-letters key.',
        code:
`import java.util.*;
import java.util.stream.Collectors;

public class GroupAnagrams {
    public static Collection<List<String>> group(List<String> words) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String word : words) {
            char[] letters = word.toCharArray();
            Arrays.sort(letters);
            String key = new String(letters);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
        }
        return groups.values();
    }

    public static void main(String[] args) {
        List<String> words = List.of("eat", "tea", "tan", "ate", "nat", "bat");
        group(words).forEach(System.out::println);
    }
}`,
        output: '[eat, tea, ate]\n[tan, nat]\n[bat]',
      },
    ],
    advanced: [
      {
        title: 'Top K frequent elements',
        statement: 'Given an array, return the k most frequent values, using a HashMap for counting plus a bucket-sort by frequency for O(n) time overall.',
        code:
`import java.util.*;

public class TopKFrequent {
    public static List<Integer> topK(int[] nums, int k) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int n : nums) counts.merge(n, 1, Integer::sum);

        List<Integer>[] buckets = new List[nums.length + 1]; // frequency -> values
        for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
            int freq = entry.getValue();
            if (buckets[freq] == null) buckets[freq] = new ArrayList<>();
            buckets[freq].add(entry.getKey());
        }

        List<Integer> result = new ArrayList<>();
        for (int freq = buckets.length - 1; freq >= 0 && result.size() < k; freq--) {
            if (buckets[freq] != null) result.addAll(buckets[freq]);
        }
        return result.subList(0, k);
    }

    public static void main(String[] args) {
        System.out.println(topK(new int[]{1, 1, 1, 2, 2, 3}, 2));
    }
}`,
        output: '[1, 2]',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Shopping cart quantity map',
      domain: 'E-commerce',
      description: 'A cart service tracks quantity per product SKU in a HashMap, using merge() to atomically-in-effect increment quantities as items are added multiple times.',
      code:
`public class ShoppingCart {

    private final Map<String, Integer> quantityBySku = new HashMap<>();

    public void addItem(String sku, int quantity) {
        quantityBySku.merge(sku, quantity, Integer::sum);
    }

    public void removeItem(String sku) {
        quantityBySku.remove(sku);
    }

    public int totalItems() {
        return quantityBySku.values().stream().mapToInt(Integer::intValue).sum();
    }
}`,
    },
    {
      title: 'In-memory feature configuration lookup',
      domain: 'Payments',
      description: 'A payment routing service loads per-merchant routing rules into a HashMap keyed by merchant ID at startup, giving O(1) rule lookup on the hot path of every transaction.',
      code:
`public class MerchantRoutingRules {

    private final Map<String, RoutingRule> rulesByMerchantId;

    public MerchantRoutingRules(List<RoutingRule> allRules) {
        this.rulesByMerchantId = allRules.stream()
            .collect(Collectors.toMap(RoutingRule::merchantId, rule -> rule));
    }

    public RoutingRule ruleFor(String merchantId) {
        return rulesByMerchantId.getOrDefault(merchantId, RoutingRule.DEFAULT);
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Nested inventory levels: Map<String, Map<String, Integer>>',
      explanation: 'A multi-warehouse inventory system maps warehouse ID to a HashMap of SKU-to-quantity, so per-warehouse stock lookups stay O(1).',
      code:
`Map<String, Map<String, Integer>> stockByWarehouse = new HashMap<>();

stockByWarehouse
    .computeIfAbsent("WH-EAST", w -> new HashMap<>())
    .merge("SKU-100", 50, Integer::sum);

int eastStockOfSku100 = stockByWarehouse
    .getOrDefault("WH-EAST", Map.of())
    .getOrDefault("SKU-100", 0);`,
    },
    {
      title: 'Map of Lists for grouping: Map<String, List<Order>>',
      explanation: 'Grouping orders by status for a dashboard summary, built manually with computeIfAbsent (equivalent to Collectors.groupingBy).',
      code:
`Map<String, List<Order>> ordersByStatus = new HashMap<>();
for (Order order : allOrders) {
    ordersByStatus.computeIfAbsent(order.status(), s -> new ArrayList<>()).add(order);
}`,
    },
  ],

  bestPractices: [
    'Always override hashCode() and equals() together, and keep both consistent, for any custom key type.',
    'Prefer computeIfAbsent()/merge()/getOrDefault() over manual containsKey()+get()+put() sequences — they are both clearer and avoid redundant lookups.',
    'Pre-size the map when the final size is roughly known to avoid repeated resize/rehash cycles.',
    'Iterate entrySet() rather than keySet() plus get() when you need both keys and values.',
    'Use immutable key types wherever possible to eliminate an entire class of "lost entry" bugs.',
  ],

  commonMistakes: [
    {
      mistake: 'Mutating a field used in hashCode() after using an object as a HashMap key.',
      why: 'The key\'s bucket was computed from its hash at insertion time; later lookups compute a different hash from the mutated state and search the wrong bucket.',
      fix: 'Use immutable key types, or never mutate fields that participate in hashCode()/equals() once an object is used as a map key.',
    },
    {
      mistake: 'Iterating keySet() and calling map.get(key) inside the loop.',
      why: 'This performs a second, entirely redundant hash lookup per entry when entrySet() already gives you both key and value in one pass.',
      fix: 'Use `for (Map.Entry<K, V> entry : map.entrySet())` instead.',
    },
    {
      mistake: 'Calling map.remove(key) directly while iterating the map with a for-each loop.',
      why: 'Structural modification outside the iterator\'s own remove() triggers ConcurrentModificationException via the fail-fast mechanism.',
      fix: 'Use `entrySet().iterator()` and call `iterator.remove()`, or collect keys to remove first and remove them after the loop.',
    },
    {
      mistake: 'Assuming HashMap iteration order is stable or meaningful.',
      why: 'Order depends on bucket layout and can change across resizes, JVM versions, or even separate runs with different hash codes.',
      fix: 'Use LinkedHashMap if insertion order matters, or TreeMap if sorted-by-key order matters.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'HashMap', 'Hashtable', 'ConcurrentHashMap', 'TreeMap', 'LinkedHashMap'],
    rows: [
      ['Ordering', 'None', 'None', 'None', 'Sorted by key', 'Insertion (or access) order'],
      ['Thread-safe', 'No', 'Yes (coarse lock)', 'Yes (fine-grained)', 'No', 'No'],
      ['Null keys/values', '1 null key, many null values', 'None allowed', 'None allowed', 'No null keys, values ok', '1 null key, many null values'],
      ['get/put complexity', 'O(1) average', 'O(1) average', 'O(1) average', 'O(log n)', 'O(1) average'],
    ],
  },

  diagrams: [
    {
      title: 'Bucket array with a collision chain',
      caption: '"orange" and "grape" both hash to bucket 3; equals() distinguishes them as separate chained entries.',
      render: () => (
        <div className="flex items-end gap-3">
          <DiagramBucketColumn bucketIndex={0} entries={[]} />
          <DiagramBucketColumn bucketIndex={1} entries={['"kiwi":7']} tone="brand" />
          <DiagramBucketColumn bucketIndex={2} entries={[]} />
          <DiagramBucketColumn bucketIndex={3} entries={['"orange":3', '"grape":12']} tone="amber" />
          <DiagramBucketColumn bucketIndex={4} entries={['"mango":5']} tone="brand" />
        </div>
      ),
    },
    {
      title: 'Resize: capacity doubles, entries rehash',
      caption: 'Crossing the load-factor threshold (capacity * 0.75) triggers a full rehash into a table twice the size.',
      render: () => (
        <div className="flex items-center gap-3">
          <DiagramBox label="16 buckets" tone="brand" />
          <DiagramArrow label="resize()" />
          <DiagramBox label="32 buckets" tone="green" />
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What is the default initial capacity and load factor of a HashMap?', options: ['10 and 0.75', '16 and 0.75', '16 and 1.0', '32 and 0.5'], answerIndex: 1, explanation: 'Default capacity is 16 buckets with a load factor of 0.75, so the first resize happens once the map holds 13 entries.' },
    { question: 'Why does HashMap keep capacity as a power of two?', options: ['To simplify serialization', 'So bucket index can be computed with a fast bitmask instead of modulo', 'To guarantee sorted iteration', 'It is required by the Map interface'], answerIndex: 1, explanation: '`hash & (capacity - 1)` is a cheap bitwise AND, equivalent to `hash % capacity` only when capacity is a power of two.' },
    { question: 'How many null keys can a HashMap contain?', options: ['Zero', 'Exactly one', 'Unlimited', 'Depends on capacity'], answerIndex: 1, explanation: 'HashMap permits exactly one null key, conventionally stored in bucket 0.' },
    { question: 'What triggers bucket treeification in a modern HashMap?', options: ['Any collision at all', 'A bucket chain of 8+ nodes with table capacity of 64+', 'Reaching the load-factor threshold', 'Calling containsValue()'], answerIndex: 1, explanation: 'Both conditions must hold — otherwise the table simply resizes instead of treeifying a small table.' },
    { question: 'Why is entrySet() iteration preferred over keySet() + get(key)?', options: ['entrySet() is thread-safe and keySet() is not', 'entrySet() avoids a redundant second lookup per entry', 'keySet() does not support fail-fast detection', 'There is no difference'], answerIndex: 1, explanation: 'entrySet() gives you the key and value from the same node directly, while keySet()+get() performs a second bucket lookup for every entry.' },
  ],
};
