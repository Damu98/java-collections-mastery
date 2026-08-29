/* ==========================================================================
   CONTENT: HashSet
   ========================================================================== */

CollectionsContent['hashset'] = {

  overview: {
    paragraphs: [
      'HashSet is the default general-purpose Set implementation: it guarantees no duplicate elements (as defined by equals()) and offers O(1) average-case add, remove, and contains, at the cost of providing no ordering guarantee whatsoever.',
      'It is not a standalone data structure — internally, HashSet is a thin wrapper around a HashMap<E, Object>, where every element you add becomes a key in that map and a shared dummy sentinel object (`PRESENT`) is stored as the value. Every HashSet operation delegates directly to the equivalent HashMap operation.',
      'Because it is hash-bucket based, correctness depends entirely on the elements\' hashCode() and equals() being implemented consistently (equal objects must have equal hashCodes) — this is the single most important rule to internalize about HashSet.',
    ],
    keyPoints: [
      'Backed internally by a HashMap<E, Object>; elements are map keys.',
      'O(1) average add/remove/contains; no ordering guarantee.',
      'Iteration order depends on hash bucket layout and can change across JVM runs or after a resize.',
      'Allows exactly one null element.',
      'Requires correct, consistent hashCode()/equals() implementations on stored elements.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'When you call set.add(element), HashSet internally calls `map.put(element, PRESENT)`. The HashMap computes `hash(element.hashCode())` (a supplemental hash-spreading function that XORs the high and low bits to reduce collisions), then uses `hash & (table.length - 1)` to pick a bucket index.',
      'Each bucket starts as a linked list of nodes. If two elements land in the same bucket ("collide"), HashSet/HashMap must call equals() to check whether they are actually the same logical element (duplicate, so the add is a no-op) or merely a hash collision (both are kept, chained in that bucket).',
      'The table resizes (doubles capacity) once the number of entries exceeds `capacity * loadFactor` (default load factor 0.75, default initial capacity 16) — so a HashSet resizes at 12, 24, 48 entries, and so on, rehashing every existing element into the new, larger table.',
      'Since Java 8, if a single bucket accumulates 8 or more colliding nodes AND the table has at least 64 buckets, that bucket is "treeified" into a balanced red-black tree, capping the worst-case lookup for a pathologically bad hashCode() at O(log n) instead of O(n).',
    ],
  },

  complexity: [
    { operation: 'add(e) / remove(e) / contains(e)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Worst case only with terrible hashCode() distribution; treeified buckets cap it at O(log n) in modern JDKs.' },
    { operation: 'iteration (full traversal)', average: 'O(capacity + size)', worst: 'O(capacity + size)', space: 'O(1)', notes: 'Must scan every bucket slot, even empty ones.' },
    { operation: 'resize (rehash)', average: 'O(n)', worst: 'O(n)', space: 'O(n)', notes: 'Happens once per doubling; amortized cost is O(1) per add.' },
  ],

  memory: {
    paragraphs: [
      'Each element costs one HashMap.Node: the cached hash code (int), a reference to the key, a reference to the shared PRESENT value, and a `next` pointer for chaining — noticeably more overhead per element than a plain array-backed collection.',
      'An undersized initial capacity causes repeated resize-and-rehash cycles as the set grows; an oversized one wastes memory on empty buckets. If the eventual size is roughly known, size the set up front.',
    ],
    points: [
      'Construct with `new HashSet<>(Math.ceilDiv(expectedSize, 3) * 4)` or simply size generously, since resizing rehashes every element.',
      'A high load factor (closer to 1.0) saves memory but increases collision probability and lookup cost; the default 0.75 is a deliberately tuned middle ground.',
      'Storing large mutable objects directly in a HashSet is memory-inefficient and risky (see Common Mistakes) — consider storing IDs and looking values up elsewhere.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'HashSet has no internal synchronization; concurrent add/remove from multiple threads can corrupt the internal bucket structure (in older JDKs this could even cause an infinite loop during resize under concurrent modification).',
      'Use Collections.synchronizedSet(new HashSet<>()) for coarse-grained safety, or ConcurrentHashMap.newKeySet() for a genuinely concurrent, high-throughput Set backed by ConcurrentHashMap internally.',
    ],
  },

  iteration: {
    paragraphs: [
      'HashSet\'s iterator is fail-fast, using the same modCount mechanism as ArrayList — structural modification during iteration (outside the iterator\'s own remove()) throws ConcurrentModificationException.',
      'Iteration order reflects internal bucket layout, not insertion order, and is not guaranteed to be stable even between two runs of the exact same program if hashCodes or resize thresholds differ.',
    ],
  },

  ordering: {
    paragraphs: [
      'HashSet makes no ordering guarantee at all. Never write code that depends on the order elements come back in iteration — if you need insertion order, use LinkedHashSet; if you need sorted order, use TreeSet.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'HashSet permits exactly one null element (since it is backed by a HashMap, which permits one null key). Adding null a second time is a no-op, consistent with Set semantics.',
    ],
  },

  useCases: [
    { title: 'Deduplication', description: 'Removing duplicate entries from a stream of data (e.g. de-duplicating a batch of incoming customer IDs) when order does not matter.' },
    { title: 'Fast membership testing', description: 'Checking "have I seen this before?" in O(1) — blacklists, visited-node sets in graph algorithms, seen-event sets.' },
    { title: 'Set algebra', description: 'Union, intersection, and difference operations via addAll(), retainAll(), and removeAll().' },
    { title: 'Backing store for other structures', description: 'Many higher-level structures (e.g. a graph\'s adjacency Set<Node>) use HashSet as their fundamental "unordered collection of unique things" building block.' },
  ],

  springBootExamples: [
    {
      title: 'De-duplicating incoming webhook event IDs',
      description: 'A payments webhook handler uses a HashSet-backed idempotency check to discard duplicate delivery attempts from the payment provider.',
      code:
`@Service
public class WebhookIdempotencyService {

    private final Set<String> processedEventIds = ConcurrentHashMap.newKeySet();

    public boolean isDuplicate(String eventId) {
        return !processedEventIds.add(eventId); // add() returns false if already present
    }
}`,
    },
    {
      title: 'Role-based access check using a Set of permissions',
      description: 'A Spring Security-adjacent authorization service checks whether a user\'s permission set contains everything a protected operation requires.',
      code:
`@Service
public class AuthorizationService {

    public boolean canPerform(Set<String> userPermissions, Set<String> requiredPermissions) {
        return userPermissions.containsAll(requiredPermissions);
    }

    public Set<String> missingPermissions(Set<String> userPermissions, Set<String> required) {
        Set<String> missing = new HashSet<>(required);
        missing.removeAll(userPermissions);
        return missing;
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What data structure actually backs HashSet internally?', difficulty: 'Beginner', answer: 'A HashMap<E, Object>. Every element added to the HashSet becomes a key in that internal map, with a shared static dummy object as the value — HashSet methods are thin delegations to the corresponding HashMap methods.' },
    { question: 'Why must you override both hashCode() and equals() together for objects stored in a HashSet?', difficulty: 'Intermediate', answer: 'HashSet first uses hashCode() to pick a bucket, then uses equals() to check for duplicates within that bucket. If two "equal" objects (per your equals()) produce different hashCodes, they can land in different buckets and both be added, silently violating the Set\'s uniqueness contract.' },
    { question: 'What is bucket treeification and when does it kick in?', difficulty: 'Advanced', answer: 'Since Java 8, if a single hash bucket accumulates 8 or more colliding entries AND the overall table has at least 64 buckets, that bucket is converted from a linked list into a red-black tree, bounding worst-case lookup within that bucket to O(log n) instead of O(n) — a defense against adversarial or accidental hashCode collisions.' },
    { question: 'What happens if you mutate a field used in an object\'s hashCode() after adding it to a HashSet?', difficulty: 'Advanced', answer: 'The object is now sitting in the bucket corresponding to its old hash code, but a future contains()/remove() call will recompute the hash from its current (mutated) state and look in the wrong bucket — the element becomes effectively unfindable, silently "leaking" from the set even though it is still technically present.' },
    { question: 'How many null elements can a HashSet contain?', difficulty: 'Beginner', answer: 'Exactly one, since it is backed by a HashMap, which permits a single null key.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Find duplicate elements in an array',
        statement: 'Given an int array, return the set of values that appear more than once.',
        code:
`import java.util.*;

public class FindDuplicates {
    public static Set<Integer> findDuplicates(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        Set<Integer> duplicates = new HashSet<>();
        for (int n : nums) {
            if (!seen.add(n)) {
                duplicates.add(n);
            }
        }
        return duplicates;
    }

    public static void main(String[] args) {
        int[] nums = {4, 3, 2, 7, 8, 2, 3, 1};
        System.out.println(findDuplicates(nums));
    }
}`,
        output: '[2, 3]',
      },
      {
        title: 'Check if two arrays have any element in common',
        statement: 'Given two int arrays, determine if they share at least one common value, using a HashSet for O(n + m) time.',
        code:
`import java.util.*;

public class HasCommonElement {
    public static boolean hasCommon(int[] a, int[] b) {
        Set<Integer> setA = new HashSet<>();
        for (int n : a) setA.add(n);
        for (int n : b) {
            if (setA.contains(n)) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(hasCommon(new int[]{1, 2, 3}, new int[]{7, 8, 3}));
        System.out.println(hasCommon(new int[]{1, 2, 3}, new int[]{7, 8, 9}));
    }
}`,
        output: 'true\nfalse',
      },
    ],
    intermediate: [
      {
        title: 'Set algebra: union, intersection, difference',
        statement: 'Given two Set<String> of customer segments, compute their union, intersection, and difference (a minus b) without mutating the originals.',
        code:
`import java.util.*;

public class SetAlgebra {
    public static void main(String[] args) {
        Set<String> a = new HashSet<>(Set.of("gold", "silver", "bronze"));
        Set<String> b = new HashSet<>(Set.of("silver", "platinum"));

        Set<String> union = new HashSet<>(a);
        union.addAll(b);

        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);

        Set<String> difference = new HashSet<>(a);
        difference.removeAll(b);

        System.out.println("Union: " + union);
        System.out.println("Intersection: " + intersection);
        System.out.println("A - B: " + difference);
    }
}`,
        output: 'Union: [gold, silver, bronze, platinum]\nIntersection: [silver]\nA - B: [gold, bronze]',
      },
    ],
    advanced: [
      {
        title: 'Correctly implement equals()/hashCode() for a custom HashSet element',
        statement: 'Model a Money value object (currency + amount) so that two Money instances with the same currency and amount are treated as duplicates in a HashSet.',
        code:
`import java.util.*;

public final class Money {
    private final String currency;
    private final long minorUnits; // avoid double for money

    public Money(String currency, long minorUnits) {
        this.currency = currency;
        this.minorUnits = minorUnits;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money other)) return false;
        return minorUnits == other.minorUnits && currency.equals(other.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(currency, minorUnits);
    }

    @Override
    public String toString() {
        return minorUnits + " " + currency;
    }

    public static void main(String[] args) {
        Set<Money> amounts = new HashSet<>();
        amounts.add(new Money("USD", 1000));
        amounts.add(new Money("USD", 1000)); // duplicate, ignored
        amounts.add(new Money("EUR", 1000)); // different currency, kept

        System.out.println(amounts.size());
        System.out.println(amounts.contains(new Money("USD", 1000)));
    }
}`,
        output: '2\ntrue',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Fraud detection: duplicate transaction fingerprint check',
      domain: 'Banking',
      description: 'A fraud-detection service fingerprints incoming transactions (card + amount + merchant + minute-bucket) and uses a time-windowed HashSet to flag exact repeats within a short window as potential double-submits or replay attacks.',
      code:
`public class DuplicateTransactionDetector {

    private final Set<String> recentFingerprints = ConcurrentHashMap.newKeySet();

    public boolean isSuspiciousDuplicate(Transaction tx) {
        String fingerprint = tx.cardId() + "|" + tx.amount() + "|" + tx.merchantId() + "|" + tx.minuteBucket();
        return !recentFingerprints.add(fingerprint); // false if this exact fingerprint was already seen
    }
}`,
    },
    {
      title: 'Unique follower count for a social media profile view',
      domain: 'Social Media',
      description: 'A profile analytics job merges follower lists from several shards into a single HashSet to compute a deduplicated total follower count before caching it.',
      code:
`public class FollowerCountAggregator {

    public int deduplicatedFollowerCount(List<Set<String>> shardedFollowerIds) {
        Set<String> merged = new HashSet<>();
        for (Set<String> shard : shardedFollowerIds) {
            merged.addAll(shard);
        }
        return merged.size();
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Role-to-permissions map: Map<String, Set<String>>',
      explanation: 'An inventory management system models each role as a key mapping to a HashSet of granted permissions, so membership checks stay O(1).',
      code:
`Map<String, Set<String>> rolePermissions = new HashMap<>();
rolePermissions.put("WAREHOUSE_MANAGER", new HashSet<>(Set.of("VIEW_STOCK", "ADJUST_STOCK", "APPROVE_TRANSFER")));
rolePermissions.put("PICKER", new HashSet<>(Set.of("VIEW_STOCK")));

boolean canAdjust = rolePermissions.getOrDefault("PICKER", Set.of()).contains("ADJUST_STOCK");
System.out.println(canAdjust); // false`,
    },
  ],

  bestPractices: [
    'Always override hashCode() and equals() together, and keep them consistent with each other, for any type stored in a HashSet.',
    'Prefer immutable elements in a HashSet — mutating a field involved in hashCode() after insertion makes the element unfindable.',
    'Pre-size the set (`new HashSet<>(capacity)`) when the approximate final size is known, to avoid repeated resize/rehash cycles.',
    'Use Set<E> as the field/parameter/return type; reserve HashSet as a concrete type only at construction sites.',
    'Reach for ConcurrentHashMap.newKeySet() over synchronizedSet() for high-throughput concurrent use.',
  ],

  commonMistakes: [
    {
      mistake: 'Storing a mutable object in a HashSet, then mutating a field used by hashCode().',
      why: 'The element\'s bucket position was computed from its hash at insertion time; after mutation, contains()/remove() compute a different hash and look in the wrong bucket.',
      fix: 'Use immutable value objects as set elements, or remove-mutate-reinsert explicitly if mutation is unavoidable.',
    },
    {
      mistake: 'Overriding equals() but forgetting hashCode() (or vice versa).',
      why: 'Two "equal" objects can end up with different hash codes, land in different buckets, and both get added — silently breaking uniqueness.',
      fix: 'Generate both methods together (most IDEs do this in one action) and keep them in sync as fields change.',
    },
    {
      mistake: 'Relying on HashSet iteration order in tests or business logic.',
      why: 'Order is an implementation detail of the bucket layout and is not guaranteed to be stable across JVM versions, resizes, or even separate runs.',
      fix: 'Use LinkedHashSet if insertion order matters, or TreeSet if sorted order matters.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'HashSet', 'LinkedHashSet', 'TreeSet', 'EnumSet'],
    rows: [
      ['Ordering', 'None', 'Insertion order', 'Sorted (natural/Comparator)', 'Enum declaration order'],
      ['add/remove/contains', 'O(1) average', 'O(1) average', 'O(log n)', 'O(1) (bit operations)'],
      ['Allows null', 'One null', 'One null', 'No (throws NPE)', 'No (throws NPE)'],
      ['Backing structure', 'HashMap', 'LinkedHashMap', 'TreeMap (red-black tree)', 'bit vector (long / long[])'],
    ],
  },

  diagrams: [
    {
      title: 'Hash bucket layout with a collision',
      caption: '"apple" and "grape" both hash to bucket 3; equals() distinguishes them within the chain.',
      render: () => (
        <div className="flex items-end gap-3">
          <DiagramBucketColumn bucketIndex={0} entries={[]} />
          <DiagramBucketColumn bucketIndex={1} entries={['"kiwi"']} tone="brand" />
          <DiagramBucketColumn bucketIndex={2} entries={[]} />
          <DiagramBucketColumn bucketIndex={3} entries={['"apple"', '"grape"']} tone="amber" />
          <DiagramBucketColumn bucketIndex={4} entries={['"mango"']} tone="brand" />
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What internally backs a HashSet?', options: ['An ArrayList', 'A HashMap', 'A TreeMap', 'A plain array'], answerIndex: 1, explanation: 'Every element becomes a key in an internal HashMap<E, Object>, with a shared dummy PRESENT value.' },
    { question: 'What is the default load factor of a HashSet?', options: ['0.5', '0.75', '1.0', '2.0'], answerIndex: 1, explanation: 'The default load factor is 0.75, balancing memory usage against collision probability.' },
    { question: 'How many null elements can a HashSet hold?', options: ['Zero', 'Exactly one', 'Unlimited', 'Depends on capacity'], answerIndex: 1, explanation: 'It permits exactly one null, mirroring HashMap\'s single null key.' },
    { question: 'What happens when a bucket accumulates 8+ colliding entries and the table has 64+ buckets?', options: ['The set throws an exception', 'The bucket is treeified into a red-black tree', 'The set automatically switches to a TreeSet', 'Nothing changes'], answerIndex: 1, explanation: 'Since Java 8, such buckets are treeified, bounding worst-case lookup to O(log n).' },
    { question: 'Why can mutating an object already stored in a HashSet break the set?', options: ['HashSet forbids mutation and throws an exception', 'The object may become unfindable if the mutated field affects hashCode()', 'HashSet automatically re-sorts on mutation', 'It has no effect'], answerIndex: 1, explanation: 'The bucket position was computed at insertion time from the original hash; mutation can move the "correct" bucket while the object stays in the old one.' },
  ],
};
