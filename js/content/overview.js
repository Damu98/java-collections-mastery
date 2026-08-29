/* ==========================================================================
   CONTENT: Collections Framework Overview
   ========================================================================== */

CollectionsContent['overview'] = {

  overview: {
    paragraphs: [
      'The Java Collections Framework (JCF), introduced in Java 1.2, is a unified architecture for representing and manipulating groups of objects. Before it existed, Java had a handful of unrelated ad-hoc classes — Vector, Hashtable, Stack, Enumeration — with no shared interfaces or consistent design. The JCF replaced that chaos with a small set of core interfaces (Collection, List, Set, Queue, Deque, Map) and a rich family of implementations, all interoperating through consistent contracts.',
      'Every collection you will study in this app implements one of these core interfaces, and every implementation makes the same handful of design decisions differently: how it orders elements, how fast its core operations are, whether it tolerates null, and whether it is safe under concurrent access. Learning to ask those same four or five questions about any new collection is the single most transferable skill this entire framework has to teach.',
      'Note the one asymmetry baked into the framework from day one: Map does NOT extend Collection. A map is fundamentally a different shape of data (key → value pairs) from a flat group of elements, though Map does expose Collection-shaped views of itself via keySet(), values(), and entrySet().',
    ],
    keyPoints: [
      'Collection is the root interface for groups of elements; List, Set, and Queue are its three specialized sub-interfaces.',
      'Map is a deliberately separate hierarchy (key-value pairs), not a Collection — though it exposes Collection views via keySet()/values()/entrySet().',
      'Every implementation makes independent choices about ordering, performance, null-tolerance, and thread safety — always check all four before choosing one.',
      'Interfaces (List, Set, Map, Queue) should appear in your code\'s types; concrete classes (ArrayList, HashMap, etc.) should appear only at construction sites.',
      'The Collections utility class (java.util.Collections) provides algorithms (sort, binarySearch, shuffle) and wrappers (unmodifiable*, synchronized*) that work across every implementation.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'The framework is organized as a small set of interfaces at the top (Collection, List, Set, SortedSet, NavigableSet, Queue, Deque, Map, SortedMap, NavigableMap), a layer of AbstractX skeletal implementations that provide default logic for most methods (so concrete classes only need to implement a handful of primitives), and finally the concrete implementations you actually instantiate (ArrayList, HashMap, TreeSet, and so on).',
      'This layered design is why, for example, every List implementation automatically gets a working toString(), equals(), and iterator-based removeIf() for free from AbstractList/AbstractCollection — concrete classes only override what needs implementation-specific behavior (like ArrayList\'s array-based get(index) versus LinkedList\'s node-walking get(index)).',
    ],
  },

  complexity: [
    { operation: 'ArrayList.get(index)', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'See the ArrayList page for full detail.' },
    { operation: 'HashMap.get(key)', average: 'O(1)', worst: 'O(n) / O(log n) treeified', space: 'O(1)', notes: 'See the HashMap page for full detail.' },
    { operation: 'TreeMap.get(key)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'See the TreeMap page for full detail.' },
    { operation: 'ArrayDeque.addFirst/addLast', average: 'O(1)', worst: 'O(n) (resize)', space: 'O(1)', notes: 'See the ArrayDeque page for full detail.' },
  ],

  memory: {
    paragraphs: [
      'As a rule of thumb across the whole framework: array-backed structures (ArrayList, ArrayDeque, HashMap\'s bucket array) are more memory-compact and cache-friendly than node-based structures (LinkedList, tree-based Sets/Maps), because they avoid a separate object allocation per element.',
    ],
    points: [
      'Prefer array-backed implementations by default; only reach for node-based ones when you specifically need their structural properties (sorted order for trees, O(1) mid-list splicing for linked lists).',
      'Autoboxing affects every generic collection holding primitives (Integer, Long, etc.) — this is a framework-wide consideration, not specific to any one class.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'None of the "core" implementations (ArrayList, HashMap, HashSet, ArrayDeque, TreeMap, TreeSet, LinkedList, PriorityQueue) are synchronized. Thread safety across the framework comes from one of three places: legacy synchronized classes (Vector, Hashtable, Stack), the Collections.synchronizedX() wrappers (coarse external locking), or the purpose-built java.util.concurrent package (ConcurrentHashMap, CopyOnWriteArrayList, the BlockingQueue family) — always prefer the third option for new concurrent code.',
    ],
  },

  iteration: {
    paragraphs: [
      'The non-concurrent implementations share a common fail-fast iterator design (tracking a modCount and throwing ConcurrentModificationException on detected structural modification during iteration) as a development-time safety net. The java.util.concurrent implementations instead use weakly consistent iterators that never throw that exception, reflecting the fundamentally different concurrency model those classes are built for.',
    ],
  },

  ordering: {
    paragraphs: [
      'Ordering is entirely implementation-specific: List types preserve insertion/index order by definition; HashSet/HashMap guarantee none; LinkedHashSet/LinkedHashMap preserve insertion (or access) order; TreeSet/TreeMap maintain sorted order; PriorityQueue only guarantees its head is the minimum. Always check a specific implementation\'s page rather than assuming.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Null-tolerance varies by design intent, not by accident: ArrayList/LinkedList/HashMap allow null because there is no structural reason not to; TreeMap/TreeSet reject null keys because comparisons are undefined; ConcurrentHashMap and the blocking queue family reject null specifically to avoid concurrency-related ambiguity; ArrayDeque/PriorityQueue/EnumMap reject null for their own structural reasons. Check each implementation\'s own page for its specific rule.',
    ],
  },

  useCases: [
    { title: 'Choosing the right interface for your API', description: 'Expose List/Set/Map/Queue in public method signatures, never a concrete class — it lets callers and implementers change the underlying data structure freely.' },
    { title: 'Choosing the right implementation for your workload', description: 'Base the choice on the questions this page teaches: required ordering, dominant operations (random access vs. head/tail vs. key lookup), null-tolerance needs, and concurrency requirements.' },
    { title: 'Composing collections for real-world data models', description: 'Nearly every non-trivial domain model needs nested collections (Map<String, List<T>>, List<Map<K,V>>, etc.) — every phase of this app includes worked examples of exactly this pattern.' },
  ],

  springBootExamples: [
    {
      title: 'Programming against interfaces throughout a service layer',
      description: 'A well-designed Spring service exposes only Collections Framework interfaces in its public API, keeping every concrete implementation choice an internal, freely-changeable detail.',
      code:
`public interface OrderQueryService {
    List<Order> findByCustomer(String customerId);
    Map<String, Long> countByStatus();
    Set<String> distinctRegions();
}

@Service
class OrderQueryServiceImpl implements OrderQueryService {

    private final OrderRepository repository;

    OrderQueryServiceImpl(OrderRepository repository) {
        this.repository = repository;
    }

    public List<Order> findByCustomer(String customerId) {
        return repository.findByCustomerId(customerId); // concrete type (ArrayList, likely) stays internal
    }

    public Map<String, Long> countByStatus() {
        return repository.findAll().stream()
            .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
    }

    public Set<String> distinctRegions() {
        return repository.findAll().stream()
            .map(Order::getRegion)
            .collect(Collectors.toSet());
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why does Map not extend Collection?', difficulty: 'Intermediate', answer: 'A Collection represents a group of individual elements, while a Map represents a group of key-value pairs (associations) — a fundamentally different shape of data. The designers chose a separate hierarchy rather than forcing an awkward fit, though Map still exposes Collection-shaped views (keySet(), values(), entrySet()) for interoperability.' },
    { question: 'What four questions should you ask about any new Collections Framework class you encounter?', difficulty: 'Beginner', answer: 'What ordering does it guarantee (if any)? What is the time complexity of its core operations? Does it tolerate null elements/keys/values? Is it safe for concurrent access? These four questions cover the vast majority of what distinguishes one implementation from another.' },
    { question: 'Why should application code use List<T>/Map<K,V> as field and parameter types instead of ArrayList<T>/HashMap<K,V>?', difficulty: 'Beginner', answer: 'Programming against the interface keeps the concrete implementation an internal, freely-changeable detail — you can swap ArrayList for LinkedList, or HashMap for LinkedHashMap, without touching any calling code, as long as the interface contract is respected.' },
    { question: 'What role do the AbstractX classes (AbstractList, AbstractMap, etc.) play in the framework?', difficulty: 'Advanced', answer: 'They provide skeletal implementations of most interface methods in terms of a small set of primitive operations, so concrete classes only need to implement those primitives (e.g. get(index) and size() for a List) to get a fully working implementation — including iterator support, equals()/hashCode(), and toString() — essentially for free.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Choose the right collection for a scenario',
        statement: 'For each of these requirements, name the best-fit Collections Framework type and justify it in one sentence: (1) unique usernames with fast lookup, (2) a leaderboard always sorted by score, (3) a fixed set of weekday flags.',
        code:
`public class CollectionChoice {
    public static void main(String[] args) {
        // 1) Unique usernames, fast lookup, order doesn't matter -> HashSet<String>
        Set<String> usernames = new HashSet<>();

        // 2) Leaderboard always sorted by score -> TreeSet<Player> with a score Comparator,
        //    or PriorityQueue<Player> if you only ever need the current top score.
        Set<String> leaderboardNote = Set.of("Use TreeSet<Player> for full sorted view; PriorityQueue for just the top.");

        // 3) A fixed set of weekday flags -> EnumSet<DayOfWeek>
        EnumSet<java.time.DayOfWeek> weekendDays = EnumSet.of(java.time.DayOfWeek.SATURDAY, java.time.DayOfWeek.SUNDAY);

        System.out.println(weekendDays);
    }
}`,
        output: '[SATURDAY, SUNDAY]',
      },
    ],
    intermediate: [],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Auditing a legacy codebase for concrete-type leakage',
      domain: 'E-commerce',
      description: 'A team refactoring a legacy order-management service replaces every public method signature that exposed ArrayList/HashMap directly with the corresponding List/Map interface, immediately unlocking the ability to swap implementations without touching dozens of call sites.',
      code:
`// Before: concrete types leak implementation details into the public API
public ArrayList<Order> getOrders() { ... }
public HashMap<String, Order> getOrdersById() { ... }

// After: callers only ever depend on the interface contract
public List<Order> getOrders() { ... }
public Map<String, Order> getOrdersById() { ... }`,
    },
  ],

  nestedExamples: [
    {
      title: 'A realistic nested domain model',
      explanation: 'Most real applications combine several collection types in a single model — this hospital ward model uses a Map, nested Lists, and an EnumSet together.',
      code:
`public class Ward {
    private final Map<String, List<Patient>> patientsByRoom = new HashMap<>();
    private final EnumSet<DayOfWeek> visitingDays = EnumSet.of(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);
    private final TreeMap<LocalTime, Shift> shiftsByStartTime = new TreeMap<>();
}`,
    },
  ],

  bestPractices: [
    'Always ask the four framework-wide questions (ordering, complexity, null-tolerance, thread safety) before picking an implementation — never guess or assume based on a class name alone.',
    'Program against interfaces (List, Set, Map, Queue, Deque) everywhere except at construction sites.',
    'Use the Collections utility class\'s algorithms and wrappers (sort, unmodifiableList, synchronizedMap) instead of hand-rolling equivalents.',
    'When in doubt for a general-purpose need, the framework\'s own defaults are good defaults: ArrayList, HashMap, HashSet, ArrayDeque cover the overwhelming majority of everyday cases.',
  ],

  commonMistakes: [
    {
      mistake: 'Assuming Map is a kind of Collection.',
      why: 'Map deliberately does not extend Collection — it models a different shape of data (associations, not flat elements) even though it exposes Collection-shaped views.',
      fix: 'Remember Map sits in its own parallel hierarchy; use keySet()/values()/entrySet() when you need a Collection view of a Map\'s contents.',
    },
    {
      mistake: 'Picking an implementation based on familiarity rather than its actual guarantees.',
      why: 'Defaulting to "whatever I used last time" can silently produce O(n) behavior where O(1) or O(log n) was available, or miss a needed ordering/null/concurrency guarantee entirely.',
      fix: 'Run through the four framework-wide questions explicitly whenever choosing a collection for a new piece of code.',
    },
  ],

  comparisonTable: {
    headers: ['Interface', 'Ordering guarantee', 'Duplicates allowed?', 'Key implementations covered in this app'],
    rows: [
      ['List', 'Insertion/index order', 'Yes', 'ArrayList, LinkedList, Vector, Stack'],
      ['Set', 'Implementation-specific', 'No', 'HashSet, LinkedHashSet, TreeSet, EnumSet'],
      ['Map', 'Implementation-specific (per key)', 'Keys: no, Values: yes', 'HashMap, LinkedHashMap, TreeMap, Hashtable, ConcurrentHashMap, WeakHashMap, IdentityHashMap, EnumMap'],
      ['Queue / Deque', 'Typically FIFO (not guaranteed)', 'Yes', 'PriorityQueue, ArrayDeque, and the six concurrent queue types'],
    ],
  },

  diagrams: [
    {
      title: 'The Collections Framework interface hierarchy',
      caption: 'Map is a deliberately separate hierarchy from Collection — the framework\'s one major asymmetry.',
      render: () => (
        <div className="flex flex-col items-center gap-4">
          <DiagramBox label="Iterable" tone="slate" />
          <DiagramArrow label="extends" />
          <DiagramBox label="Collection" tone="brand" />
          <div className="flex gap-6 mt-1">
            <DiagramBox label="List" tone="green" />
            <DiagramBox label="Set" tone="green" />
            <DiagramBox label="Queue" tone="green" />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400">(separate hierarchy — does NOT extend Collection)</span>
            <DiagramBox label="Map" tone="amber" />
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'Does Map extend Collection?', options: ['Yes', 'No — it is a separate hierarchy', 'Only SortedMap does', 'Only in Java 9+'], answerIndex: 1, explanation: 'Map models key-value associations, a different shape of data from a flat group of elements, so it deliberately sits outside the Collection hierarchy.' },
    { question: 'Which three interfaces directly extend Collection?', options: ['List, Set, Map', 'List, Set, Queue', 'List, Map, Queue', 'Set, Map, Deque'], answerIndex: 1, explanation: 'List, Set, and Queue are the three core Collection sub-interfaces; Map is separate.' },
    { question: 'What should you check before choosing a collection implementation, according to this framework-wide guidance?', options: ['Only its name popularity', 'Ordering, complexity, null-tolerance, and thread safety', 'Only its memory usage', 'Only whether it is generic'], answerIndex: 1, explanation: 'These four questions cover the vast majority of what actually differs between implementations.' },
    { question: 'Why should public APIs use List<T> instead of ArrayList<T> in method signatures?', options: ['ArrayList cannot be generic', 'It keeps the concrete implementation a freely-changeable internal detail', 'List is faster than ArrayList', 'It is required by the Java language spec'], answerIndex: 1, explanation: 'Programming against the interface decouples callers from any specific implementation choice.' },
  ],
};
