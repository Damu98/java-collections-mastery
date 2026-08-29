/* ==========================================================================
   CONTENT: TreeSet
   ========================================================================== */

CollectionsContent['treeset'] = {

  overview: {
    paragraphs: [
      'TreeSet is a NavigableSet implementation backed by a red-black tree (via an internal TreeMap), which keeps its elements in sorted order at all times — either their natural order (Comparable) or an order defined by a Comparator supplied at construction time.',
      'Because it maintains a balanced binary search tree, every core operation (add, remove, contains) runs in O(log n), trading HashSet\'s O(1) average speed for guaranteed sorted iteration and a rich set of range/navigation queries.',
      'TreeSet is the right tool whenever "give me the elements in order" or "give me the closest element to X" are first-class requirements — leaderboards, scheduling, range filters, and anything modeled as an ordered timeline.',
    ],
    keyPoints: [
      'Backed internally by a TreeMap<E, Object> (a red-black tree), the sorted-collection analog of HashSet-over-HashMap.',
      'O(log n) for add/remove/contains — slower per-operation than HashSet but always sorted.',
      'Implements NavigableSet: floor(), ceiling(), higher(), lower(), first(), last(), headSet(), tailSet(), subSet(), pollFirst()/pollLast().',
      'Does NOT allow null elements (throws NullPointerException) since comparisons against null are undefined.',
      'Ordering is determined by compareTo()/Comparator, NOT equals() — two elements that compareTo() as 0 are treated as duplicates even if equals() would say they differ.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'TreeSet delegates essentially everything to an internal TreeMap<E, Object>, using the same PRESENT-sentinel trick as HashSet/LinkedHashSet do over their respective maps.',
      'A red-black tree is a self-balancing binary search tree: it guarantees the longest root-to-leaf path is never more than roughly 2x the shortest, which bounds every operation to O(log n) even in adversarial insertion orders (unlike a naive unbalanced BST, which can degrade to a linked list — O(n) — for already-sorted input).',
      'add(), remove(), and contains() all work by repeatedly comparing the target with the current node (using compareTo() or the supplied Comparator) and descending left or right, exactly like a textbook binary search tree lookup, then rebalancing (rotations + recoloring) after structural changes to restore the red-black invariants.',
    ],
  },

  complexity: [
    { operation: 'add(e) / remove(e) / contains(e)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Red-black tree guarantees logarithmic height regardless of insertion order.' },
    { operation: 'first() / last()', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Walk to the leftmost/rightmost node.' },
    { operation: 'floor(e) / ceiling(e) / higher(e) / lower(e)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Navigable search variants, still tree-height bound.' },
    { operation: 'headSet() / tailSet() / subSet()', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Returns a live view in O(log n); does not copy the underlying data.' },
    { operation: 'iteration (in-order)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'In-order traversal naturally yields sorted order.' },
  ],

  memory: {
    paragraphs: [
      'Each element is stored in a tree node with references to its left child, right child, parent, and a color bit (red/black) — comparable in overhead to a LinkedHashSet node, though for a different structural purpose.',
    ],
    points: [
      'No load-factor/resize concept exists for TreeSet — the tree grows and rebalances node-by-node, so there is no equivalent of "pre-sizing" to avoid rehashing.',
      'headSet()/tailSet()/subSet() return live, memory-cheap views rather than copies — mutating the view mutates the original TreeSet and vice versa.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'TreeSet is not synchronized. Use Collections.synchronizedSortedSet(new TreeSet<>()) for coarse external synchronization, or java.util.concurrent.ConcurrentSkipListSet for a genuinely concurrent, lock-free sorted Set with comparable O(log n) guarantees.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator performs an in-order traversal of the underlying tree, which naturally yields elements in ascending sorted order (or descending, via descendingIterator()). It is fail-fast, exactly like the hash-based Set implementations.',
    ],
  },

  ordering: {
    paragraphs: [
      'Elements are always kept in sorted order — either natural order (the element type must implement Comparable) or the order defined by a Comparator passed to the constructor. Ordering is determined purely by compareTo()/compare(), independent of equals(); TreeSet treats two elements as duplicates if they compareTo() as 0, even if their equals() implementations disagree. This is a subtle but important departure from every other Set in the framework.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'TreeSet does not permit null elements. Attempting to add null throws NullPointerException (natural ordering has no defined comparison against null, and most Comparators would also NPE unless explicitly written to handle it).',
    ],
  },

  useCases: [
    { title: 'Leaderboards and rankings', description: 'Maintaining a live-sorted set of scores/players where you frequently need "who is currently #1" or "who is just above/below player X".' },
    { title: 'Range queries over a sorted domain', description: 'Finding all events between two timestamps, all prices in a band, or all IDs in a range, via subSet()/headSet()/tailSet().' },
    { title: 'Nearest-neighbor style lookups', description: 'floor()/ceiling() answer "closest value at or below/above X" in O(log n), useful for scheduling ("next available slot") and price-matching.' },
    { title: 'Deduplication with a custom total order', description: 'When "duplicate" should mean "compares equal under some business rule" rather than strict equals() equality.' },
  ],

  springBootExamples: [
    {
      title: 'Live leaderboard service using TreeSet + a Comparator',
      description: 'A gaming/social platform keeps a sorted set of player scores, exposing "top N" and "rank of player X" queries via NavigableSet methods.',
      code:
`@Service
public class LeaderboardService {

    private final TreeSet<PlayerScore> scores =
        new TreeSet<>(Comparator.comparingInt(PlayerScore::score).reversed()
            .thenComparing(PlayerScore::playerId)); // tie-break for equal scores

    public synchronized void recordScore(PlayerScore score) {
        scores.add(score);
    }

    public synchronized List<PlayerScore> topN(int n) {
        return scores.stream().limit(n).toList();
    }
}`,
    },
    {
      title: 'Finding the next available appointment slot',
      description: 'A booking service stores open slot start-times in a TreeSet<LocalDateTime> and uses ceiling() to find the next slot at or after a requested time.',
      code:
`@Service
public class AppointmentSlotService {

    private final TreeSet<LocalDateTime> openSlots = new TreeSet<>();

    public Optional<LocalDateTime> nextAvailableAt(LocalDateTime requested) {
        return Optional.ofNullable(openSlots.ceiling(requested));
    }

    public void bookSlot(LocalDateTime slot) {
        openSlots.remove(slot);
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What tree structure backs TreeSet, and what guarantee does it provide?', difficulty: 'Intermediate', answer: 'A red-black tree, a self-balancing binary search tree that guarantees O(log n) height regardless of insertion order, keeping add/remove/contains at O(log n) even for already-sorted input (which would degrade a naive BST to O(n)).' },
    { question: 'Why does TreeSet throw NullPointerException on add(null)?', difficulty: 'Beginner', answer: 'Every element must be compared against existing elements via compareTo()/Comparator to find its position; comparing against null is undefined (calling x.compareTo(null) itself typically NPEs), so TreeSet rejects null outright.' },
    { question: 'Can TreeSet contain two objects that are equals() but not "duplicates" from the set\'s perspective?', difficulty: 'Advanced', answer: 'Yes, if a custom Comparator is used and two distinct-per-equals() objects compareTo() as non-zero, both are kept. Conversely — and more surprisingly — two objects that compareTo() as 0 are treated as duplicates by TreeSet even if their equals() disagrees, because TreeSet\'s notion of "equal" is defined by compareTo()/compare(), not equals().' },
    { question: 'What is the time complexity of TreeSet.first() and TreeSet.last()?', difficulty: 'Beginner', answer: 'O(log n) — the operation walks from the root to the leftmost (first) or rightmost (last) node, and tree height is bounded at O(log n) by the red-black balancing invariants.' },
    { question: 'How would you find the closest value to X that is less than or equal to X in a TreeSet?', difficulty: 'Intermediate', answer: 'Call floor(X), which returns the greatest element ≤ X, or null if none exists. The symmetric ceiling(X) returns the smallest element ≥ X.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Maintain a sorted set of unique scores',
        statement: 'Insert a batch of scores (with duplicates) into a TreeSet and print them in ascending order.',
        code:
`import java.util.*;

public class SortedUniqueScores {
    public static void main(String[] args) {
        TreeSet<Integer> scores = new TreeSet<>(List.of(88, 42, 95, 42, 67, 95, 100));
        System.out.println(scores);
        System.out.println("Highest: " + scores.last());
        System.out.println("Lowest: " + scores.first());
    }
}`,
        output: '[42, 67, 88, 95, 100]\nHighest: 100\nLowest: 42',
      },
    ],
    intermediate: [
      {
        title: 'Find the k closest values to a target',
        statement: 'Given a TreeSet<Integer> and a target value, find the k values closest to the target using floor() and ceiling() to walk outward from both sides.',
        code:
`import java.util.*;

public class KClosestValues {
    public static List<Integer> kClosest(TreeSet<Integer> set, int target, int k) {
        List<Integer> result = new ArrayList<>();
        Integer lower = set.floor(target);
        Integer higher = (lower != null && lower == target) ? set.higher(target) : set.ceiling(target);

        while (result.size() < k && (lower != null || higher != null)) {
            if (lower == null) {
                result.add(higher);
                higher = set.higher(higher);
            } else if (higher == null) {
                result.add(lower);
                lower = set.lower(lower);
            } else if (Math.abs(target - lower) <= Math.abs(higher - target)) {
                result.add(lower);
                lower = set.lower(lower);
            } else {
                result.add(higher);
                higher = set.higher(higher);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>(List.of(1, 4, 7, 10, 15, 20));
        System.out.println(kClosest(set, 11, 3));
    }
}`,
        output: '[10, 15, 7]',
      },
    ],
    advanced: [
      {
        title: 'Merge overlapping intervals stored in a TreeSet',
        statement: 'Given a TreeSet<int[]> of intervals ordered by start time, insert a new interval and merge any overlaps, keeping the set sorted and non-overlapping.',
        code:
`import java.util.*;

public class MergeIntervalSet {

    public static void insertAndMerge(TreeSet<int[]> intervals, int[] newInterval) {
        int start = newInterval[0], end = newInterval[1];

        // Merge with any interval whose start is <= end and expand backward too
        Iterator<int[]> it = intervals.iterator();
        List<int[]> toRemove = new ArrayList<>();
        for (int[] interval : intervals) {
            if (interval[0] <= end && interval[1] >= start) {
                start = Math.min(start, interval[0]);
                end = Math.max(end, interval[1]);
                toRemove.add(interval);
            }
        }
        intervals.removeAll(toRemove);
        intervals.add(new int[]{start, end});
    }

    public static void main(String[] args) {
        TreeSet<int[]> intervals = new TreeSet<>(Comparator.comparingInt(iv -> iv[0]));
        intervals.add(new int[]{1, 3});
        intervals.add(new int[]{6, 9});

        insertAndMerge(intervals, new int[]{2, 5});

        for (int[] iv : intervals) {
            System.out.println(Arrays.toString(iv));
        }
    }
}`,
        output: '[1, 5]\n[6, 9]',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Hospital bed availability by ward, sorted by floor number',
      domain: 'Healthcare',
      description: 'A bed-management dashboard keeps available beds in a TreeSet ordered by floor and room number, so staff can query "next available bed at or above floor 3" in O(log n) via ceiling().',
      code:
`public class BedAvailabilityBoard {

    private final TreeSet<BedLocation> availableBeds =
        new TreeSet<>(Comparator.comparingInt(BedLocation::floor).thenComparing(BedLocation::room));

    public Optional<BedLocation> nextAvailableFrom(int floor) {
        BedLocation probe = new BedLocation(floor, Integer.MIN_VALUE);
        return Optional.ofNullable(availableBeds.ceiling(probe));
    }
}`,
    },
    {
      title: 'Price-band matching engine for e-commerce flash sales',
      domain: 'E-commerce',
      description: 'A pricing engine keeps active discount thresholds in a TreeSet<BigDecimal> and uses floor() to find the highest applicable discount tier for a given cart total.',
      code:
`public class DiscountTierMatcher {

    private final TreeSet<BigDecimal> thresholds; // e.g. {0, 50, 100, 250}
    private final Map<BigDecimal, BigDecimal> discountByThreshold;

    public DiscountTierMatcher(Map<BigDecimal, BigDecimal> discountByThreshold) {
        this.discountByThreshold = discountByThreshold;
        this.thresholds = new TreeSet<>(discountByThreshold.keySet());
    }

    public BigDecimal discountFor(BigDecimal cartTotal) {
        BigDecimal tier = thresholds.floor(cartTotal);
        return tier == null ? BigDecimal.ZERO : discountByThreshold.get(tier);
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-category sorted price sets: Map<String, TreeSet<BigDecimal>>',
      explanation: 'A catalog analytics job groups product prices by category, each category holding a TreeSet so min/max/median-adjacent queries are cheap.',
      code:
`Map<String, TreeSet<BigDecimal>> pricesByCategory = new HashMap<>();

for (Product p : catalog) {
    pricesByCategory.computeIfAbsent(p.category(), c -> new TreeSet<>()).add(p.price());
}

BigDecimal cheapestElectronics = pricesByCategory.get("Electronics").first();`,
    },
  ],

  bestPractices: [
    'Only choose TreeSet when you genuinely need sorted iteration or navigation (floor/ceiling/first/last) — otherwise HashSet is faster.',
    'Remember TreeSet\'s notion of duplicates is defined by compareTo()/Comparator, not equals() — make sure your ordering is consistent with equals() unless you deliberately want a different notion of "same element".',
    'Use a Comparator with an explicit tie-breaker (e.g. thenComparing(id)) whenever the primary sort key is not itself unique, to avoid silently dropping "duplicates" that only tie on the primary key.',
    'Treat headSet()/tailSet()/subSet() results as live views — copy them (`new TreeSet<>(view)`) if you need an independent snapshot.',
  ],

  commonMistakes: [
    {
      mistake: 'Adding elements whose type has no natural ordering and no Comparator was supplied.',
      why: 'TreeSet needs some way to compare elements; without Comparable or a Comparator, add() throws ClassCastException on the first insertion (or the second, depending on JDK version nuances).',
      fix: 'Implement Comparable<T> on the element type, or pass an explicit Comparator<T> to the TreeSet constructor.',
    },
    {
      mistake: 'Using a Comparator that only compares one field, expecting equals()-based semantics elsewhere.',
      why: 'Any two elements that tie on that one field are treated as duplicates by TreeSet, even if they are clearly different objects by equals() — one silently "disappears".',
      fix: 'Add a tie-breaking secondary comparison (e.g. thenComparing(SomeType::getId)) so only truly identical elements tie.',
    },
    {
      mistake: 'Calling add(null) or expecting a Comparator to gracefully sort nulls without writing null-handling logic.',
      why: 'Both natural ordering and most hand-written Comparators throw NullPointerException on null.',
      fix: 'Filter out nulls before insertion, or use Comparator.nullsFirst()/nullsLast() explicitly if null must be representable.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'TreeSet', 'HashSet', 'LinkedHashSet'],
    rows: [
      ['Ordering', 'Sorted (natural/Comparator)', 'None', 'Insertion order'],
      ['add/remove/contains', 'O(log n)', 'O(1) average', 'O(1) average'],
      ['Allows null', 'No (throws NPE)', 'One null', 'One null'],
      ['Navigation methods', 'floor/ceiling/higher/lower/subSet', 'None', 'None'],
      ['"Duplicate" defined by', 'compareTo()/Comparator', 'equals()/hashCode()', 'equals()/hashCode()'],
    ],
  },

  diagrams: [
    {
      title: 'Red-black tree shape (conceptual, balanced by construction)',
      caption: 'In-order traversal (left, node, right) always yields ascending sorted order.',
      render: () => (
        <div className="flex flex-col items-center gap-4">
          <DiagramBox label={50} tone="slate" sub="root" />
          <div className="flex gap-10">
            <DiagramBox label={25} tone="brand" />
            <DiagramBox label={75} tone="brand" />
          </div>
          <div className="flex gap-4">
            <DiagramBox label={10} tone="green" />
            <DiagramBox label={30} tone="green" />
            <DiagramBox label={60} tone="green" />
            <DiagramBox label={90} tone="green" />
          </div>
          <p className="text-xs text-slate-400">In-order: 10, 25, 30, 50, 60, 75, 90</p>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What tree structure backs TreeSet?', options: ['AVL tree', 'Red-black tree', 'B-tree', 'Splay tree'], answerIndex: 1, explanation: 'TreeSet is backed internally by a TreeMap, which uses a red-black tree.' },
    { question: 'What is the time complexity of TreeSet.contains()?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answerIndex: 1, explanation: 'The balanced tree height bounds lookup at O(log n).' },
    { question: 'What happens if you call treeSet.add(null)?', options: ['It is added like any element', 'It throws NullPointerException', 'It is silently ignored', 'It becomes the new first() element'], answerIndex: 1, explanation: 'Comparisons against null are undefined, so TreeSet rejects null with an NPE.' },
    { question: 'In TreeSet, what determines whether two elements are treated as duplicates?', options: ['equals() only', 'hashCode() only', 'compareTo()/Comparator returning 0', 'Object identity (==)'], answerIndex: 2, explanation: 'TreeSet\'s uniqueness is defined by its ordering — two elements comparing as 0 are treated as the same, regardless of equals().' },
    { question: 'Which method returns the greatest element less than or equal to a given value?', options: ['ceiling()', 'higher()', 'floor()', 'lower()'], answerIndex: 2, explanation: 'floor(e) returns the greatest element ≤ e; ceiling(e) is the symmetric "smallest element ≥ e".' },
  ],
};
