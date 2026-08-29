/* ==========================================================================
   CONTENT: TreeMap
   ========================================================================== */

CollectionsContent['treemap'] = {

  overview: {
    paragraphs: [
      'TreeMap is a NavigableMap implementation backed by a red-black tree, keeping its keys in sorted order at all times — natural order (Comparable) or a supplied Comparator — while still giving O(log n) get/put/remove.',
      'It is the map-flavored twin of TreeSet (in fact, TreeSet is implemented on top of TreeMap), and it exposes the same rich navigation vocabulary — firstKey(), lastKey(), floorKey(), ceilingKey(), headMap(), tailMap(), subMap() — for whenever "closest key" or "range of keys" queries matter.',
      'Choose TreeMap whenever the business problem is naturally expressed as an ordered timeline or a sorted range: order books, scheduling, time-series aggregation, and tiered/threshold lookups all map directly onto its navigation methods.',
    ],
    keyPoints: [
      'Backed by a red-black tree; O(log n) for get/put/remove/containsKey.',
      'Keys are always kept sorted — natural ordering or a constructor-supplied Comparator.',
      'Implements NavigableMap: firstKey/lastKey, floorKey/ceilingKey/higherKey/lowerKey, headMap/tailMap/subMap.',
      'Does NOT allow null keys (throws NullPointerException); null values are permitted.',
      'Like TreeSet, "duplicate key" is determined by compareTo()/Comparator returning 0, not by equals().',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Each key-value pair is stored in a red-black tree node (Entry<K,V>) with left/right/parent references and a color bit, ordered by the key according to compareTo() or the supplied Comparator.',
      'get(key)/put(key, value)/remove(key) all work by descending the tree, comparing the target key at each node, exactly like a classic binary search tree — then rebalancing (rotations + recoloring) after insertions/removals to preserve the red-black invariants that guarantee O(log n) height.',
      'headMap(toKey), tailMap(fromKey), and subMap(fromKey, toKey) return live views backed by the same tree — no copying occurs, so mutating a view mutates the original TreeMap (and vice versa), which is both a powerful feature and a common source of surprise bugs if you expected an independent snapshot.',
    ],
  },

  complexity: [
    { operation: 'get(key) / put(key, v) / remove(key) / containsKey(key)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Red-black tree height is always O(log n).' },
    { operation: 'firstKey() / lastKey()', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Walk to the leftmost/rightmost node.' },
    { operation: 'floorKey / ceilingKey / higherKey / lowerKey', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Bounded search variants using the same tree.' },
    { operation: 'headMap / tailMap / subMap', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Returns a live, non-copying view.' },
    { operation: 'iteration (in-order)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Naturally yields ascending key order.' },
  ],

  memory: {
    paragraphs: [
      'Each entry costs a tree node with key, value, left/right/parent references, and a color bit — comparable in overhead to a TreeSet node but carrying an additional value reference.',
    ],
    points: [
      'No capacity/load-factor concept exists — the tree grows node-by-node with no bulk rehashing step.',
      'headMap()/tailMap()/subMap() are memory-cheap live views, not copies — snapshot explicitly (`new TreeMap<>(view)`) if you need independence from later mutations.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'TreeMap is not synchronized. Use Collections.synchronizedSortedMap(new TreeMap<>()) for coarse external synchronization, or java.util.concurrent.ConcurrentSkipListMap for a genuinely concurrent sorted map with comparable O(log n) guarantees.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iterating keySet(), values(), or entrySet() performs an in-order tree traversal, always yielding ascending key order (or descending, via descendingMap()/descendingKeySet()). The iterators are fail-fast, consistent with the rest of the framework.',
    ],
  },

  ordering: {
    paragraphs: [
      'Keys are always kept sorted — natural order if the key type implements Comparable, or the order defined by a Comparator passed to the constructor. As with TreeSet, two keys that compareTo() as 0 are treated as the same key even if equals() would disagree.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'TreeMap does not permit null keys (comparisons against null are undefined, so put(null, v) throws NullPointerException with natural ordering, and usually with a custom Comparator too unless it explicitly handles null). Null values are permitted.',
    ],
  },

  useCases: [
    { title: 'Time-series and scheduling data', description: 'Storing events, appointments, or exchange rates keyed by timestamp, where range queries ("everything between t1 and t2") are common.' },
    { title: 'Order books / price-level data', description: 'Bid/ask price levels naturally map onto a TreeMap<BigDecimal, Quantity> with firstKey()/lastKey() giving best bid/ask instantly.' },
    { title: 'Threshold / tiered lookups', description: 'Discount tiers, tax brackets, and SLA thresholds — anywhere floorKey()/ceilingKey() naturally expresses "which tier does this value fall into".' },
    { title: 'Producing a sorted report or export', description: 'Whenever a Map\'s output needs to be presented sorted by key without a separate manual sort step.' },
  ],

  springBootExamples: [
    {
      title: 'Tax bracket lookup service using floorKey()',
      description: 'A payroll service stores tax bracket thresholds in a TreeMap<BigDecimal, BigDecimal> (threshold -> rate) and finds the applicable bracket via floorKey().',
      code:
`@Service
public class TaxBracketService {

    private final TreeMap<BigDecimal, BigDecimal> bracketRates; // threshold -> marginal rate

    public TaxBracketService() {
        bracketRates = new TreeMap<>();
        bracketRates.put(BigDecimal.ZERO, new BigDecimal("0.10"));
        bracketRates.put(new BigDecimal("11000"), new BigDecimal("0.12"));
        bracketRates.put(new BigDecimal("44725"), new BigDecimal("0.22"));
    }

    public BigDecimal marginalRateFor(BigDecimal income) {
        Map.Entry<BigDecimal, BigDecimal> bracket = bracketRates.floorEntry(income);
        return bracket == null ? BigDecimal.ZERO : bracket.getValue();
    }
}`,
    },
    {
      title: 'Time-window log aggregation endpoint',
      description: 'A monitoring dashboard exposes request counts aggregated into a TreeMap<LocalDateTime, Long> so the response is always chronologically ordered without a separate sort.',
      code:
`@RestController
@RequestMapping("/api/metrics")
public class RequestVolumeController {

    private final TreeMap<LocalDateTime, Long> countsByMinute = new TreeMap<>();

    @GetMapping("/volume")
    public SortedMap<LocalDateTime, Long> volumeBetween(
            @RequestParam LocalDateTime from, @RequestParam LocalDateTime to) {
        return countsByMinute.subMap(from, true, to, true); // inclusive range view
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What is the practical difference between HashMap and TreeMap?', difficulty: 'Beginner', answer: 'HashMap offers O(1) average operations with no ordering guarantee; TreeMap offers O(log n) operations but always keeps keys sorted and adds navigation methods (floorKey, ceilingKey, subMap, etc.) that HashMap cannot provide.' },
    { question: 'Why does TreeMap.put(null, value) throw NullPointerException?', difficulty: 'Beginner', answer: 'Insertion requires comparing the new key against existing keys to find its sorted position; comparing null with compareTo() (or most Comparators) is undefined and throws NPE, so TreeMap rejects null keys outright.' },
    { question: 'What do headMap(), tailMap(), and subMap() return — copies or views?', difficulty: 'Intermediate', answer: 'Live views backed by the same underlying tree, not copies. Mutating the view (e.g. calling clear() on a subMap()) mutates the original TreeMap, and mutating the original TreeMap is reflected in any previously obtained view.' },
    { question: 'How would you find the two keys immediately surrounding a target value that is not itself a key?', difficulty: 'Intermediate', answer: 'Use floorKey(target) for the nearest key ≤ target and ceilingKey(target) for the nearest key ≥ target — both run in O(log n) using the tree structure directly, no manual scanning required.' },
    { question: 'Can a TreeMap treat two keys as "the same" even if their equals() implementations say they are different?', difficulty: 'Advanced', answer: 'Yes — TreeMap\'s notion of key equality is defined entirely by compareTo()/Comparator returning 0, independent of equals(). If a Comparator only compares a subset of a key\'s fields, two objects that differ elsewhere but tie on those fields are treated as the same key, and the second put() silently overwrites the first.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Sort a map of scores by key automatically',
        statement: 'Insert student-name-to-score pairs into a TreeMap and observe automatic alphabetical ordering by key.',
        code:
`import java.util.*;

public class SortedScores {
    public static void main(String[] args) {
        TreeMap<String, Integer> scores = new TreeMap<>();
        scores.put("Charlie", 88);
        scores.put("Alice", 95);
        scores.put("Bob", 72);

        System.out.println(scores);
        System.out.println("First: " + scores.firstKey());
        System.out.println("Last: " + scores.lastKey());
    }
}`,
        output: '{Alice=95, Bob=72, Charlie=88}\nFirst: Alice\nLast: Charlie',
      },
    ],
    intermediate: [
      {
        title: 'Find the applicable pricing tier for a cart total',
        statement: 'Given a TreeMap of spending thresholds to discount percentages, find the correct discount for an arbitrary cart total using floorEntry().',
        code:
`import java.util.*;

public class PricingTier {
    public static void main(String[] args) {
        TreeMap<Integer, Integer> discountByThreshold = new TreeMap<>();
        discountByThreshold.put(0, 0);
        discountByThreshold.put(50, 5);
        discountByThreshold.put(100, 10);
        discountByThreshold.put(250, 20);

        int cartTotal = 130;
        Map.Entry<Integer, Integer> tier = discountByThreshold.floorEntry(cartTotal);
        System.out.println("Discount: " + tier.getValue() + "%");
    }
}`,
        output: 'Discount: 10%',
      },
    ],
    advanced: [
      {
        title: 'Maintain a simple limit order book with TreeMap',
        statement: 'Model a buy-side order book as a TreeMap<BigDecimal, Integer> (price -> quantity) in descending order, and match an incoming sell order against the best (highest) bids.',
        code:
`import java.util.*;
import java.math.BigDecimal;

public class OrderBook {
    // Descending order: highest bid first
    private final TreeMap<BigDecimal, Integer> bids = new TreeMap<>(Comparator.reverseOrder());

    public void addBid(BigDecimal price, int quantity) {
        bids.merge(price, quantity, Integer::sum);
    }

    public void matchSellOrder(int quantityToSell) {
        Iterator<Map.Entry<BigDecimal, Integer>> it = bids.entrySet().iterator();
        while (quantityToSell > 0 && it.hasNext()) {
            Map.Entry<BigDecimal, Integer> bestBid = it.next();
            int filled = Math.min(quantityToSell, bestBid.getValue());
            System.out.println("Filled " + filled + " @ " + bestBid.getKey());
            quantityToSell -= filled;
            if (filled == bestBid.getValue()) it.remove();
            else bestBid.setValue(bestBid.getValue() - filled);
        }
    }

    public static void main(String[] args) {
        OrderBook book = new OrderBook();
        book.addBid(new BigDecimal("101.50"), 100);
        book.addBid(new BigDecimal("101.75"), 50);
        book.matchSellOrder(120);
    }
}`,
        output: 'Filled 50 @ 101.75\nFilled 70 @ 101.50',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Hospital shift schedule keyed by start time',
      domain: 'Healthcare',
      description: 'A staffing tool keeps each ward\'s shifts in a TreeMap<LocalTime, Shift>, so "next shift after 14:00" is a single ceilingEntry() call instead of a manual scan.',
      code:
`public class WardShiftSchedule {

    private final TreeMap<LocalTime, Shift> shiftsByStart = new TreeMap<>();

    public void addShift(Shift shift) {
        shiftsByStart.put(shift.startTime(), shift);
    }

    public Optional<Shift> nextShiftAfter(LocalTime time) {
        Map.Entry<LocalTime, Shift> entry = shiftsByStart.higherEntry(time);
        return Optional.ofNullable(entry).map(Map.Entry::getValue);
    }
}`,
    },
    {
      title: 'Currency exchange rate history lookup',
      domain: 'Banking',
      description: 'A treasury service keeps historical FX rates in a TreeMap<LocalDate, BigDecimal> per currency pair, using floorEntry() to find "the rate in effect on this date" even on non-trading days (weekends/holidays).',
      code:
`public class ExchangeRateHistory {

    private final TreeMap<LocalDate, BigDecimal> ratesByDate = new TreeMap<>();

    public void recordRate(LocalDate date, BigDecimal rate) {
        ratesByDate.put(date, rate);
    }

    public BigDecimal rateInEffectOn(LocalDate date) {
        Map.Entry<LocalDate, BigDecimal> entry = ratesByDate.floorEntry(date);
        if (entry == null) throw new IllegalStateException("No rate available before " + date);
        return entry.getValue();
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-symbol price history: Map<String, TreeMap<LocalDate, BigDecimal>>',
      explanation: 'A market-data service groups historical closing prices by ticker symbol, each symbol\'s history stored in a TreeMap for chronological range queries.',
      code:
`Map<String, TreeMap<LocalDate, BigDecimal>> priceHistory = new HashMap<>();

priceHistory
    .computeIfAbsent("AAPL", s -> new TreeMap<>())
    .put(LocalDate.of(2026, 1, 15), new BigDecimal("189.50"));

SortedMap<LocalDate, BigDecimal> januaryPrices = priceHistory.get("AAPL")
    .subMap(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1));`,
    },
  ],

  bestPractices: [
    'Only reach for TreeMap when sorted iteration or range/navigation queries are actually needed — HashMap is faster for pure key-value lookup.',
    'Supply an explicit Comparator with a tie-breaker whenever the natural ordering of your key type might not be a total order for your business rule (e.g. sorting by amount but needing a stable secondary key).',
    'Treat headMap()/tailMap()/subMap() as live views; copy explicitly with `new TreeMap<>(view)` if you need an independent snapshot.',
    'Prefer floorEntry()/ceilingEntry() (which return the Map.Entry) over floorKey()/ceilingKey() plus a follow-up get() when you need both the key and the value.',
  ],

  commonMistakes: [
    {
      mistake: 'Calling put(null, value) on a TreeMap.',
      why: 'Natural ordering (and most Comparators) cannot compare against null, so TreeMap throws NullPointerException rather than silently accepting it like HashMap would.',
      fix: 'Filter out null keys before insertion, or use a sentinel value if "no key" must be representable.',
    },
    {
      mistake: 'Assuming subMap()/headMap()/tailMap() return independent copies.',
      why: 'They are live views backed by the same tree — later mutations to the original map (or the view) are visible through both.',
      fix: 'Explicitly copy with `new TreeMap<>(view)` when independence from future mutation is required.',
    },
    {
      mistake: 'Using a Comparator that ties on the intended primary key without a tie-breaker.',
      why: 'TreeMap treats any two keys comparing as 0 as "the same key" — the second put() silently overwrites the first instead of both being retained.',
      fix: 'Add a secondary comparison (thenComparing) so only truly identical keys tie.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'TreeMap', 'HashMap', 'LinkedHashMap'],
    rows: [
      ['Ordering', 'Sorted by key', 'None', 'Insertion or access order'],
      ['get/put complexity', 'O(log n)', 'O(1) average', 'O(1) average'],
      ['Null keys allowed', 'No (throws NPE)', 'One null key', 'One null key'],
      ['Navigation methods', 'floorKey/ceilingKey/subMap/etc.', 'None', 'None'],
    ],
  },

  diagrams: [
    {
      title: 'Sorted key-value tree (conceptual)',
      caption: 'In-order traversal of the red-black tree yields ascending key order directly.',
      render: () => (
        <div className="flex flex-col items-center gap-4">
          <DiagramBox label="50:C" tone="slate" sub="root" />
          <div className="flex gap-10">
            <DiagramBox label="25:A" tone="brand" />
            <DiagramBox label="75:D" tone="brand" />
          </div>
          <div className="flex gap-4">
            <DiagramBox label="10:X" tone="green" />
            <DiagramBox label="30:B" tone="green" />
          </div>
          <p className="text-xs text-slate-400">In-order: 10:X, 25:A, 30:B, 50:C, 75:D</p>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What is the time complexity of TreeMap.get(key)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answerIndex: 1, explanation: 'The red-black tree\'s bounded height guarantees O(log n) for get/put/remove.' },
    { question: 'Does TreeMap allow a null key?', options: ['Yes, one null key', 'Yes, unlimited null keys', 'No, it throws NullPointerException', 'Only with a custom Comparator'], answerIndex: 2, explanation: 'Comparisons against null are undefined, so TreeMap rejects null keys with an NPE.' },
    { question: 'What do headMap()/tailMap()/subMap() return?', options: ['Independent copies', 'Live views backed by the same tree', 'Sorted arrays', 'Immutable snapshots'], answerIndex: 1, explanation: 'They are live views — mutating one affects the underlying map and vice versa.' },
    { question: 'Which method returns the smallest key greater than or equal to a target?', options: ['floorKey()', 'lowerKey()', 'ceilingKey()', 'higherKey()'], answerIndex: 2, explanation: 'ceilingKey(k) returns the smallest key ≥ k; floorKey(k) is the symmetric "greatest key ≤ k".' },
    { question: 'What determines whether two keys are treated as duplicates in a TreeMap?', options: ['equals()', 'hashCode()', 'compareTo()/Comparator returning 0', 'Reference identity'], answerIndex: 2, explanation: 'Like TreeSet, TreeMap defines key equality via its ordering, not via equals().' },
  ],
};
