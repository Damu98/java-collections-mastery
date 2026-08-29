/* ==========================================================================
   CONTENT: LinkedHashSet
   ========================================================================== */

CollectionsContent['linkedhashset'] = {

  overview: {
    paragraphs: [
      'LinkedHashSet is a HashSet variant that additionally maintains a doubly-linked list running through all of its entries, so iteration always follows insertion order rather than arbitrary bucket order.',
      'It gives you the best of both worlds for many practical cases: O(1) average add/remove/contains just like HashSet, plus predictable, repeatable iteration order — at a small, constant memory and CPU cost for maintaining the extra linked list.',
      'Internally, LinkedHashSet is implemented as a thin wrapper around LinkedHashMap<E, Object> (the same PRESENT-sentinel trick HashSet uses with HashMap), inheriting all of LinkedHashMap\'s ordering machinery.',
    ],
    keyPoints: [
      'Backed internally by a LinkedHashMap<E, Object>.',
      'Preserves insertion order during iteration — the one thing plain HashSet cannot guarantee.',
      'Same O(1) average time complexity as HashSet for add/remove/contains.',
      'Slightly higher memory footprint than HashSet per element (extra prev/next pointers).',
      'Allows exactly one null element, like HashSet.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Every entry lives in a hash bucket exactly like in HashSet (for O(1) lookup), but each entry is also a node in a separate doubly-linked list that threads through all entries in the order they were inserted.',
      'When you iterate a LinkedHashSet, the iterator walks the linked list, not the bucket array — this is why iteration order matches insertion order even though the physical bucket layout is just as "scattered" as a regular HashSet\'s.',
      'Re-inserting an element that is already present (add() returning false) does not move it in the linked list — LinkedHashSet only supports insertion order, not access order (unlike LinkedHashMap, which optionally supports access-order via a constructor flag).',
    ],
  },

  complexity: [
    { operation: 'add(e) / remove(e) / contains(e)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Same as HashSet, plus a small constant for linked-list maintenance.' },
    { operation: 'iteration (full traversal)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Walks the linked list directly — no empty-bucket scanning needed, unlike HashSet.' },
  ],

  memory: {
    paragraphs: [
      'Each entry costs everything a HashSet entry costs (cached hash, key reference, PRESENT reference, bucket `next` pointer) plus two additional references for the insertion-order linked list (`before`/`after`) — roughly 16 extra bytes per element versus HashSet on a 64-bit JVM.',
    ],
    points: [
      'The memory overhead is small and constant per element — usually a worthwhile trade for guaranteed iteration order.',
      'Size the set up front the same way you would a HashSet, to avoid repeated resizing.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'LinkedHashSet is not synchronized, exactly like HashSet. Use Collections.synchronizedSet(new LinkedHashSet<>()) for coarse-grained external synchronization if it must be shared across threads.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator is fail-fast (same modCount mechanism as HashSet/ArrayList) and walks the insertion-order linked list, so results are both safe-by-default against concurrent modification bugs and deterministic in order.',
    ],
  },

  ordering: {
    paragraphs: [
      'Strictly insertion order: the first element added is iterated first, and this order never changes on its own (re-adding an existing element is a no-op and does not move it).',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Allows exactly one null element, in whatever position it was inserted relative to the other elements.',
    ],
  },

  useCases: [
    { title: 'Order-preserving deduplication', description: 'Removing duplicates from a list while keeping the first-seen order — a very common data-cleaning task.' },
    { title: 'LRU-adjacent caches without full LRU semantics', description: 'Anywhere you want set semantics (no duplicates) plus predictable, reproducible iteration for logging, testing, or display.' },
    { title: 'Maintaining a stable "seen items" audit trail', description: 'Tracking unique events/IDs in the order they were first observed, for reporting or debugging.' },
  ],

  springBootExamples: [
    {
      title: 'Preserving first-seen order of unique tags on a support ticket',
      description: 'A helpdesk service collects tags from multiple triage rules but wants the final tag list de-duplicated while preserving the order rules fired in.',
      code:
`@Service
public class TicketTaggingService {

    public Set<String> applyTaggingRules(Ticket ticket, List<TaggingRule> rules) {
        Set<String> tags = new LinkedHashSet<>(); // de-dup, but keep rule-firing order
        for (TaggingRule rule : rules) {
            if (rule.matches(ticket)) {
                tags.addAll(rule.tagsToApply());
            }
        }
        return tags;
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What is the key difference between HashSet and LinkedHashSet?', difficulty: 'Beginner', answer: 'LinkedHashSet additionally maintains a doubly-linked list through all entries, so iteration follows insertion order — HashSet gives no ordering guarantee at all.' },
    { question: 'What backs LinkedHashSet internally?', difficulty: 'Intermediate', answer: 'A LinkedHashMap<E, Object>, the same PRESENT-sentinel-value pattern HashSet uses over a plain HashMap.' },
    { question: 'Does LinkedHashSet support access-order iteration like LinkedHashMap can?', difficulty: 'Advanced', answer: 'No — LinkedHashSet only ever preserves insertion order. LinkedHashMap exposes an access-order constructor flag (used for LRU caches), but that option is not exposed through LinkedHashSet\'s public API.' },
    { question: 'If you re-add an element that is already in a LinkedHashSet, does its iteration position change?', difficulty: 'Intermediate', answer: 'No. add() is a no-op for an already-present element (it returns false), and the element stays at its original insertion-order position.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Deduplicate a list while preserving order',
        statement: 'Given a List<String> with duplicates, produce a new list with duplicates removed and original order preserved, using LinkedHashSet.',
        code:
`import java.util.*;

public class DedupePreservingOrder {
    public static void main(String[] args) {
        List<String> visited = List.of("home", "products", "cart", "home", "checkout", "cart");

        Set<String> uniqueInOrder = new LinkedHashSet<>(visited);

        System.out.println(uniqueInOrder);
    }
}`,
        output: '[home, products, cart, checkout]',
      },
    ],
    intermediate: [
      {
        title: 'Find the first non-repeating character in a string',
        statement: 'Given a string, find the first character that does not repeat, using a LinkedHashSet plus a frequency map.',
        code:
`import java.util.*;

public class FirstNonRepeating {
    public static Character firstNonRepeating(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        Set<Character> orderedChars = new LinkedHashSet<>();

        for (char c : s.toCharArray()) {
            counts.merge(c, 1, Integer::sum);
            orderedChars.add(c);
        }

        for (char c : orderedChars) {
            if (counts.get(c) == 1) return c;
        }
        return null;
    }

    public static void main(String[] args) {
        System.out.println(firstNonRepeating("swiss"));
    }
}`,
        output: 'w',
      },
    ],
    advanced: [
      {
        title: 'Maintain a bounded, order-preserving "recently searched" set',
        statement: 'Keep at most N recent unique search terms per user: re-searching an existing term should not change its position, but the set must never exceed N entries (evict the oldest when full).',
        code:
`import java.util.*;

public class RecentSearches {
    private final int maxSize;
    private final LinkedHashSet<String> terms = new LinkedHashSet<>();

    public RecentSearches(int maxSize) {
        this.maxSize = maxSize;
    }

    public void record(String term) {
        if (terms.contains(term)) return; // already present, keep its original position
        if (terms.size() == maxSize) {
            Iterator<String> it = terms.iterator();
            it.next();
            it.remove(); // evict the oldest (first) entry
        }
        terms.add(term);
    }

    public static void main(String[] args) {
        RecentSearches searches = new RecentSearches(3);
        searches.record("laptop");
        searches.record("mouse");
        searches.record("keyboard");
        searches.record("monitor"); // evicts "laptop"
        searches.record("mouse");   // already present, no change in position
        System.out.println(searches.terms);
    }
}`,
        output: '[keyboard, monitor, mouse]',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Deduplicated, order-preserving product view history',
      domain: 'E-commerce',
      description: 'A "recently viewed" widget must show unique products in the order they were most recently first viewed this session, without arbitrary hash-based reordering.',
      code:
`public class RecentlyViewedTracker {

    private static final int MAX_ITEMS = 10;
    private final LinkedHashSet<String> viewedProductIds = new LinkedHashSet<>();

    public synchronized void recordView(String productId) {
        viewedProductIds.remove(productId);   // drop old position if re-viewed
        viewedProductIds.add(productId);       // re-add at the end (most recent)
        if (viewedProductIds.size() > MAX_ITEMS) {
            Iterator<String> it = viewedProductIds.iterator();
            it.next();
            it.remove();
        }
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Unique mentions per post, in first-mention order: Map<String, LinkedHashSet<String>>',
      explanation: 'A social media parsing service extracts @mentions from a post, keeping only unique handles in the order they first appear.',
      code:
`Map<String, LinkedHashSet<String>> mentionsByPost = new HashMap<>();

mentionsByPost
    .computeIfAbsent(postId, id -> new LinkedHashSet<>())
    .addAll(extractMentions(postText));`,
    },
  ],

  bestPractices: [
    'Choose LinkedHashSet whenever you need Set semantics AND reproducible, insertion-ordered iteration — it is a strictly stronger guarantee than HashSet for a small, constant overhead.',
    'Do not use it expecting access-order/LRU behavior — that option only exists on LinkedHashMap, not LinkedHashSet.',
    'Prefer it over manually pairing a HashSet with a separate List to track order — it does both jobs in one structure, correctly and atomically.',
  ],

  commonMistakes: [
    {
      mistake: 'Expecting LinkedHashSet to reorder an element to "most recent" when it is re-added.',
      why: 'add() on an already-present element is a no-op and does not move its position in the linked list.',
      fix: 'Explicitly remove() then add() the element if you want to refresh its position, as shown in the "recently viewed" scenario above.',
    },
    {
      mistake: 'Using LinkedHashSet where a plain HashSet would do, "just in case order matters later".',
      why: 'It is harmless but adds a small, usually unnecessary memory/CPU overhead if ordering is genuinely never observed.',
      fix: 'Default to HashSet unless you can point to a specific reason iteration order must be predictable.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'LinkedHashSet', 'HashSet', 'TreeSet'],
    rows: [
      ['Ordering', 'Insertion order', 'None', 'Sorted order'],
      ['add/remove/contains', 'O(1) average', 'O(1) average', 'O(log n)'],
      ['Extra memory per element', '~16 bytes (prev/next)', 'Baseline', 'Tree node overhead'],
      ['Best for', 'Dedup + stable iteration order', 'Pure membership testing', 'Range queries, sorted iteration'],
    ],
  },

  diagrams: [
    {
      title: 'Bucket storage + insertion-order linked list overlay',
      caption: 'Elements physically sit in hash buckets (for O(1) lookup) but a separate linked list (dashed path) preserves insertion order for iteration.',
      render: () => (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <DiagramBucketColumn bucketIndex={0} entries={['"cart"']} tone="brand" />
            <DiagramBucketColumn bucketIndex={1} entries={[]} />
            <DiagramBucketColumn bucketIndex={2} entries={['"home"', '"checkout"']} tone="amber" />
            <DiagramBucketColumn bucketIndex={3} entries={['"products"']} tone="brand" />
          </div>
          <p className="text-xs text-slate-400">Iteration order (linked list): home → products → cart → checkout</p>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does LinkedHashSet add on top of HashSet?', options: ['Sorted ordering', 'A doubly-linked list preserving insertion order', 'Thread safety', 'Primitive element support'], answerIndex: 1, explanation: 'It threads a linked list through all entries so iteration follows insertion order.' },
    { question: 'What backs LinkedHashSet internally?', options: ['TreeMap', 'HashMap', 'LinkedHashMap', 'ArrayDeque'], answerIndex: 2, explanation: 'It wraps a LinkedHashMap<E, Object>, exactly as HashSet wraps a HashMap.' },
    { question: 'Does re-adding an existing element move it in LinkedHashSet\'s iteration order?', options: ['Yes, it moves to the end', 'Yes, it moves to the front', 'No, its position is unchanged', 'Only if access-order mode is enabled'], answerIndex: 2, explanation: 'add() on an existing element is a no-op; only explicit remove()+add() changes its position.' },
    { question: 'What is the time complexity of iterating a fully-populated LinkedHashSet?', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(capacity + n), same as HashSet'], answerIndex: 1, explanation: 'Iteration walks the linked list directly in O(n), unlike HashSet which must scan the whole bucket array including empty slots.' },
  ],
};
