/* ==========================================================================
   CONTENT: ArrayList
   ========================================================================== */

CollectionsContent['arraylist'] = {

  overview: {
    paragraphs: [
      'ArrayList is the workhorse List implementation in the JDK: a resizable array that gives you O(1) random access by index and amortized O(1) appends at the end. It is almost always the right default choice when you need an ordered, indexable, duplicate-allowing collection and are not doing heavy insert/remove work in the middle.',
      'Internally it wraps a plain Object[] array (`elementData`) and a size counter. Because the backing store is a contiguous array, ArrayList inherits all of an array\'s cache-friendliness — sequential access is fast because elements sit next to each other in memory.',
      'ArrayList is part of the original Java 1.2 Collections Framework rewrite, implements RandomAccess (a marker interface that tells algorithms like Collections.binarySearch to use index-based access instead of iterators), and is Cloneable and Serializable.',
    ],
    keyPoints: [
      'Backed by a dynamically resized Object[] array.',
      'Random access (get/set by index) is O(1).',
      'Appending at the end is amortized O(1); inserting/removing at the front or middle is O(n) due to shifting.',
      'Not synchronized — needs external synchronization or a concurrent alternative for multi-threaded mutation.',
      'Allows duplicate elements and any number of null elements.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'A new ArrayList created with the no-arg constructor starts with an internal array reference set to a shared empty array (DEFAULTCAPACITY_EMPTY_ELEMENTDATA) — no backing array is actually allocated until the first element is added, which is why creating thousands of empty ArrayLists is cheap.',
      'On the first add(), the array is allocated with a default capacity of 10. Every subsequent add() checks whether `size + 1 > elementData.length`; if so, `grow()` is triggered.',
      'grow() computes a new capacity of approximately `oldCapacity + (oldCapacity >> 1)` — i.e. 1.5x the old capacity (not doubling, a common misconception) — then copies every existing element into the new array via Arrays.copyOf(), an O(n) operation. Because this only happens when capacity is exhausted, the amortized cost per add() across many insertions is still O(1).',
      'add(index, element) and remove(index) both call System.arraycopy() to shift the trailing elements one slot left or right, which is why operations near the front of a large list are comparatively expensive (O(n)).',
    ],
  },

  complexity: [
    { operation: 'get(index) / set(index, e)', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Direct array index access.' },
    { operation: 'add(e) (append)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Worst case triggers a resize + full copy.' },
    { operation: 'add(index, e)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Shifts all elements after index right by one.' },
    { operation: 'remove(index) / remove(Object)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Shifts trailing elements left; remove(Object) also does an O(n) linear search.' },
    { operation: 'contains(e) / indexOf(e)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Linear scan using equals().' },
    { operation: 'iterator traversal', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Sequential array read — very cache friendly.' },
  ],

  memory: {
    paragraphs: [
      'Each ArrayList instance carries the overhead of an Object[] array header plus one reference slot per element (8 bytes on a compressed-oops 64-bit JVM, 4 bytes for the array length field, plus object header). Because capacity typically exceeds size (growth is 1.5x), an ArrayList usually wastes some trailing capacity — call trimToSize() after a bulk-load phase to reclaim it.',
      'Autoboxing matters: ArrayList<Integer> stores references to boxed Integer objects, not primitive ints, so a List<Integer> of a million values costs far more memory and cache-locality than an int[] of the same size. For hot numeric paths, consider a primitive array or a specialized library (e.g. Eclipse Collections\' IntArrayList).',
    ],
    points: [
      'Pre-size with `new ArrayList<>(expectedSize)` when the final size is roughly known — this avoids repeated grow()/copy cycles.',
      'Call trimToSize() after bulk removals or one-time population to shrink wasted capacity.',
      'Prefer primitive-friendly alternatives for very large numeric collections to avoid boxing overhead.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'ArrayList performs no internal synchronization. Concurrent structural modification from multiple threads (even one writer and one reader) can corrupt internal state or silently lose elements — it is not merely "unsafe for reads while writing", it can genuinely break.',
      'For a thread-safe drop-in replacement, wrap it with Collections.synchronizedList(new ArrayList<>()) (coarse-grained, one lock for every operation, and you must still manually synchronize when iterating), or use java.util.concurrent.CopyOnWriteArrayList for read-heavy, write-rare scenarios (e.g. a small list of registered listeners) where writes copy the entire backing array.',
    ],
  },

  iteration: {
    paragraphs: [
      'ArrayList\'s iterator (and the enhanced for-loop, which uses it under the hood) is fail-fast: it keeps an internal `modCount` snapshot and throws ConcurrentModificationException if the list is structurally modified (add/remove, not set()) by any means other than the iterator\'s own remove()/add() methods while iteration is in progress.',
      'This is a best-effort safety net for catching bugs during development, not a concurrency guarantee — it does not reliably fire under true concurrent modification and must never be relied on for correctness.',
      'To remove elements safely while iterating, use Iterator.remove(), ListIterator.add()/set(), or Collection.removeIf(), all of which keep modCount consistent.',
    ],
  },

  ordering: {
    paragraphs: [
      'ArrayList is strictly insertion-ordered: iteration order always matches the order elements were added (or explicitly inserted at an index), and never changes on its own. This is one of its key differences from hash-based collections.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'ArrayList allows any number of null elements, at any position, including as the only element. Methods like indexOf(null), contains(null), and remove(null) all work correctly (ArrayList uses `o == null ? elem == null : o.equals(elem)` style comparisons internally).',
    ],
  },

  useCases: [
    { title: 'Default general-purpose list', description: 'The right first choice whenever you need an ordered, indexable collection and are not certain you need anything more specialized.' },
    { title: 'Read-heavy, append-mostly datasets', description: 'Loading query results, CSV rows, or API response items where you mostly append and then iterate/read by index.' },
    { title: 'Building blocks for algorithms', description: 'Sorting (Collections.sort/List.sort), binary search, and most textbook algorithms assume RandomAccess, which ArrayList provides.' },
    { title: 'Buffer before conversion', description: 'Accumulating items before converting to an immutable List (List.copyOf) or an array (toArray()) for a stable, safe-to-share snapshot.' },
  ],

  springBootExamples: [
    {
      title: 'Aggregating paginated results in a service layer',
      description: 'A common Spring Boot pattern: fetch pages from a repository/client and flatten them into a single ArrayList before returning to the controller.',
      code:
`@Service
public class OrderExportService {

    private final OrderRepository orderRepository;

    public OrderExportService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<OrderDto> fetchAllPendingOrders() {
        List<OrderDto> result = new ArrayList<>();
        int page = 0;
        Page<Order> chunk;
        do {
            chunk = orderRepository.findByStatus(OrderStatus.PENDING, PageRequest.of(page, 200));
            for (Order order : chunk.getContent()) {
                result.add(OrderDto.from(order));
            }
            page++;
        } while (chunk.hasNext());
        return result;
    }
}`,
    },
    {
      title: '@RequestBody list binding in a REST controller',
      description: 'Spring MVC deserializes a JSON array body directly into an ArrayList<T> when the parameter is declared as List<T>.',
      code:
`@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/bulk-adjust")
    public ResponseEntity<Void> bulkAdjust(@RequestBody List<StockAdjustment> adjustments) {
        // Jackson deserializes the JSON array into an ArrayList<StockAdjustment>
        inventoryService.applyAdjustments(adjustments);
        return ResponseEntity.accepted().build();
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why is ArrayList.add() described as "amortized O(1)" rather than plain O(1)?', difficulty: 'Beginner', answer: 'Most calls are O(1) because there is spare capacity, but occasionally a call must grow the array (allocate a new, larger array and copy every element), which is O(n). Spread across a long sequence of n insertions, the total copying work is O(n), so the average (amortized) cost per insertion is still O(1).' },
    { question: 'By how much does ArrayList grow when it resizes, and why does that matter?', difficulty: 'Intermediate', answer: 'It grows to roughly 1.5x the old capacity (oldCapacity + oldCapacity >> 1), not 2x. Growing too aggressively wastes memory; growing too conservatively causes more frequent, more expensive copies. 1.5x is the JDK\'s tuned trade-off between the two.' },
    { question: 'What happens if you modify an ArrayList while iterating over it with a for-each loop?', difficulty: 'Beginner', answer: 'The for-each loop uses the list\'s iterator internally. Structural modification (add/remove) outside of the iterator\'s own methods increments modCount, and the iterator\'s next()/hasNext() detects the mismatch on the next call and throws ConcurrentModificationException. Use Iterator.remove(), ListIterator, or removeIf() instead.' },
    { question: 'Why is ArrayList<Integer> generally slower and more memory-hungry than int[] for large numeric datasets?', difficulty: 'Intermediate', answer: 'Generics erase to Object, so ArrayList<Integer> stores references to boxed Integer objects rather than primitive ints. Each element costs an extra object header plus the reference itself, boxing/unboxing adds CPU overhead, and the elements are not contiguous in memory the way a primitive array\'s values are, hurting cache locality.' },
    { question: 'When would you choose Collections.synchronizedList(new ArrayList<>()) over CopyOnWriteArrayList?', difficulty: 'Advanced', answer: 'Choose synchronizedList when reads and writes are both frequent and roughly balanced — it uses one lock per call, so writes are cheap but every access (read or write) is serialized. Choose CopyOnWriteArrayList when reads vastly outnumber writes and you want lock-free, never-throws-ConcurrentModificationException iteration — writes copy the entire backing array, so it becomes expensive as the list grows or writes become frequent.' },
    { question: 'Does ArrayList.remove(5) remove the element at index 5 or the element equal to Integer 5?', difficulty: 'Beginner', answer: 'remove(int index) is overload-resolved for a primitive int literal, so remove(5) removes the element at index 5. To remove the boxed value 5 by equality, you must call remove(Integer.valueOf(5)) or remove((Object) 5) to force the List<E> overload.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Reverse an ArrayList in place',
        statement: 'Given an ArrayList<Integer>, reverse its order without creating a new list.',
        code:
`import java.util.ArrayList;
import java.util.List;

public class ReverseList {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(10, 20, 30, 40, 50));

        int left = 0, right = numbers.size() - 1;
        while (left < right) {
            int temp = numbers.get(left);
            numbers.set(left, numbers.get(right));
            numbers.set(right, temp);
            left++;
            right--;
        }

        System.out.println(numbers);
    }
}`,
        output: '[50, 40, 30, 20, 10]',
      },
      {
        title: 'Remove duplicates while preserving order',
        statement: 'Given a List<String> of product SKUs with duplicates, return a new list with duplicates removed, preserving first-seen order.',
        code:
`import java.util.*;

public class DedupeSkus {
    public static void main(String[] args) {
        List<String> skus = new ArrayList<>(List.of("SKU-1", "SKU-2", "SKU-1", "SKU-3", "SKU-2"));

        Set<String> seen = new HashSet<>();
        List<String> unique = new ArrayList<>();
        for (String sku : skus) {
            if (seen.add(sku)) {
                unique.add(sku);
            }
        }

        System.out.println(unique);
    }
}`,
        output: '[SKU-1, SKU-2, SKU-3]',
      },
    ],
    intermediate: [
      {
        title: 'Merge two sorted ArrayLists into one sorted list',
        statement: 'Given two ArrayList<Integer> already sorted ascending, merge them into a single sorted ArrayList in O(n + m) without calling Collections.sort().',
        code:
`import java.util.ArrayList;
import java.util.List;

public class MergeSortedLists {
    public static List<Integer> merge(List<Integer> a, List<Integer> b) {
        List<Integer> result = new ArrayList<>(a.size() + b.size());
        int i = 0, j = 0;
        while (i < a.size() && j < b.size()) {
            if (a.get(i) <= b.get(j)) {
                result.add(a.get(i++));
            } else {
                result.add(b.get(j++));
            }
        }
        while (i < a.size()) result.add(a.get(i++));
        while (j < b.size()) result.add(b.get(j++));
        return result;
    }

    public static void main(String[] args) {
        List<Integer> a = List.of(1, 3, 5, 7);
        List<Integer> b = List.of(2, 4, 6);
        System.out.println(merge(a, b));
    }
}`,
        output: '[1, 2, 3, 4, 5, 6, 7]',
      },
      {
        title: 'Partition a shopping cart into pages',
        statement: 'Given a List<CartItem> and a page size, split it into a List<List<CartItem>> of consecutive chunks (the last chunk may be smaller).',
        code:
`import java.util.*;

public class Paginate {

    record CartItem(String name, int quantity) {}

    public static <T> List<List<T>> chunk(List<T> items, int pageSize) {
        List<List<T>> pages = new ArrayList<>();
        for (int i = 0; i < items.size(); i += pageSize) {
            pages.add(new ArrayList<>(items.subList(i, Math.min(i + pageSize, items.size()))));
        }
        return pages;
    }

    public static void main(String[] args) {
        List<CartItem> cart = List.of(
            new CartItem("Keyboard", 1), new CartItem("Mouse", 2),
            new CartItem("Monitor", 1), new CartItem("Webcam", 1),
            new CartItem("Headset", 1)
        );
        List<List<CartItem>> pages = chunk(cart, 2);
        System.out.println(pages.size() + " pages");
        pages.forEach(System.out::println);
    }
}`,
        output: '3 pages\n[CartItem[name=Keyboard, quantity=1], CartItem[name=Mouse, quantity=2]]\n[CartItem[name=Monitor, quantity=1], CartItem[name=Webcam, quantity=1]]\n[CartItem[name=Headset, quantity=1]]',
      },
    ],
    advanced: [
      {
        title: 'Simulate ArrayList\'s own growth strategy',
        statement: 'Implement a minimal generic dynamic array (IntArrayList) that grows by 1.5x when full, to understand what ArrayList does internally.',
        code:
`import java.util.Arrays;

public class IntArrayList {
    private int[] data;
    private int size;

    public IntArrayList() {
        this.data = new int[10];
    }

    public void add(int value) {
        if (size == data.length) {
            grow();
        }
        data[size++] = value;
    }

    private void grow() {
        int newCapacity = data.length + (data.length >> 1);
        data = Arrays.copyOf(data, newCapacity);
        System.out.println("Grew capacity to " + newCapacity);
    }

    public int get(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException(String.valueOf(index));
        return data[index];
    }

    public int size() {
        return size;
    }

    public static void main(String[] args) {
        IntArrayList list = new IntArrayList();
        for (int i = 0; i < 12; i++) {
            list.add(i * i);
        }
        System.out.println("size=" + list.size() + " last=" + list.get(list.size() - 1));
    }
}`,
        output: 'Grew capacity to 15\nsize=12 last=121',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Batch payment settlement processor',
      domain: 'Payments',
      description: 'A nightly batch job pulls unsettled transactions, accumulates them into an ArrayList (final size known-ish in advance, so it is pre-sized), then hands them off in fixed-size chunks to a downstream settlement API that only accepts 500 records per call.',
      code:
`public class SettlementBatchJob {

    private static final int BATCH_SIZE = 500;

    public void run(List<Transaction> unsettled, SettlementClient client) {
        List<Transaction> buffer = new ArrayList<>(BATCH_SIZE);
        for (Transaction tx : unsettled) {
            buffer.add(tx);
            if (buffer.size() == BATCH_SIZE) {
                client.submitBatch(buffer);
                buffer = new ArrayList<>(BATCH_SIZE);
            }
        }
        if (!buffer.isEmpty()) {
            client.submitBatch(buffer);
        }
    }
}`,
    },
    {
      title: 'Hospital admission queue snapshot',
      domain: 'Healthcare',
      description: 'A ward dashboard periodically takes an immutable snapshot of the current admissions ArrayList to render to the UI without risking a ConcurrentModificationException while a background thread keeps admitting patients.',
      code:
`public class WardDashboard {

    private final List<Patient> admissions = Collections.synchronizedList(new ArrayList<>());

    public void admit(Patient patient) {
        admissions.add(patient);
    }

    public List<Patient> snapshotForUi() {
        synchronized (admissions) {
            return List.copyOf(admissions); // immutable, safe to hand to the rendering thread
        }
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Grid of seat availability: List<List<Boolean>>',
      explanation: 'A theater booking system models a seating chart as a list of rows, each row a list of booleans indicating seat availability — a classic nested-ArrayList grid.',
      code:
`List<List<Boolean>> seatingChart = new ArrayList<>();
for (int row = 0; row < 5; row++) {
    List<Boolean> seats = new ArrayList<>(Collections.nCopies(8, true)); // 8 seats, all free
    seatingChart.add(seats);
}

// Book row 2, seat 4
seatingChart.get(2).set(4, false);

long freeSeats = seatingChart.stream()
    .flatMap(List::stream)
    .filter(Boolean::booleanValue)
    .count();

System.out.println("Free seats: " + freeSeats); // 39`,
    },
    {
      title: 'Map of order histories: Map<String, List<Order>>',
      explanation: 'An e-commerce customer service tool groups every customer\'s orders into an ArrayList, keyed by customer ID, so a support agent can pull a customer\'s full order history in O(1) map lookup + O(k) list scan.',
      code:
`Map<String, List<Order>> ordersByCustomer = new HashMap<>();

for (Order order : incomingOrders) {
    ordersByCustomer
        .computeIfAbsent(order.customerId(), id -> new ArrayList<>())
        .add(order);
}

List<Order> historyForCustomer42 = ordersByCustomer.getOrDefault("CUST-42", List.of());`,
    },
  ],

  bestPractices: [
    'Pre-size with new ArrayList<>(expectedSize) when you have a good estimate — it avoids repeated grow()/copy cycles.',
    'Prefer the List<E> interface type for fields, parameters and return types; only mention ArrayList explicitly at the construction site.',
    'Use removeIf(predicate) instead of manual iterator loops for conditional removal — it is both clearer and internally optimized.',
    'Return List.copyOf(list) or Collections.unmodifiableList(list) when exposing an internal ArrayList to callers who should not mutate it.',
    'Avoid repeated add(0, element) / remove(0) in a loop — that is O(n) per call, O(n^2) overall; use ArrayDeque if you need queue-like behavior at the front.',
    'Call trimToSize() only after a list\'s population phase is truly finished and it will live a long time (e.g. a cache), since the very next add() will re-grow it.',
  ],

  commonMistakes: [
    {
      mistake: 'Removing elements by index while iterating forward with a regular for loop.',
      why: 'Removing element i shifts every subsequent element left by one, so the next iteration silently skips what is now at index i.',
      fix: 'Iterate backward (from size-1 to 0), use an Iterator with iterator.remove(), or use removeIf().',
    },
    {
      mistake: 'Calling list.remove(5) expecting to remove the value 5, when the list is List<Integer>.',
      why: 'remove(int) is a distinct overload from remove(Object) — a primitive int argument always resolves to "remove by index".',
      fix: 'Box the argument explicitly: list.remove(Integer.valueOf(5)) or list.remove((Object) 5).',
    },
    {
      mistake: 'Using ArrayList in a multi-threaded service without synchronization "because it works in testing".',
      why: 'Concurrent structural modification is a race condition that may not manifest under light test load but corrupts state or throws under production concurrency.',
      fix: 'Use Collections.synchronizedList(...), CopyOnWriteArrayList, or a higher-level concurrent structure appropriate to the read/write ratio.',
    },
    {
      mistake: 'Treating List.of(...) results as mutable and calling add()/set() on them.',
      why: 'List.of() (and Arrays.asList() for structural changes) return fixed-size or immutable list views, not ArrayLists — mutating methods throw UnsupportedOperationException.',
      fix: 'Wrap in new ArrayList<>(List.of(...)) when you need a genuinely mutable copy.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'ArrayList', 'LinkedList', 'Vector', 'CopyOnWriteArrayList'],
    rows: [
      ['Backing structure', 'Dynamic array', 'Doubly linked nodes', 'Dynamic array', 'Dynamic array (copied on write)'],
      ['get(index)', 'O(1)', 'O(n)', 'O(1)', 'O(1)'],
      ['add at end', 'Amortized O(1)', 'O(1)', 'Amortized O(1)', 'O(n) (full copy)'],
      ['Thread-safe', 'No', 'No', 'Yes (synchronized)', 'Yes (lock-free reads)'],
      ['Best for', 'General purpose, random access', 'Frequent head/tail insert-remove', 'Legacy synchronized code', 'Read-heavy, rarely-written lists'],
    ],
  },

  diagrams: [
    {
      title: 'Backing array before and after a resize',
      caption: 'Adding an 11th element to a capacity-10 ArrayList triggers grow() to capacity 15 (10 + 10>>1), then copies all elements across.',
      render: () => (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">size = 10, capacity = 10 (full)</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <DiagramBox key={i} label={i * 5} index={i} tone="brand" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="chevronDown" className="h-5 w-5 text-slate-400 rotate-[-90deg]" />
            <span className="text-xs text-slate-400">grow(): Arrays.copyOf(elementData, 15)</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">size = 11, capacity = 15 (5 free slots)</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <DiagramBox key={i} label={i * 5} index={i} tone="brand" />
              ))}
              <DiagramBox label={50} index={10} tone="green" />
              {Array.from({ length: 4 }).map((_, i) => (
                <DiagramBox key={`empty-${i}`} label="" index={11 + i} tone="dashed" />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'add(index, element) shifts trailing elements right',
      caption: 'Inserting "25" at index 2 shifts elements at indices 2..4 one slot to the right via System.arraycopy().',
      render: () => (
        <div className="flex items-center gap-1">
          <DiagramBox label={10} index={0} tone="brand" />
          <DiagramBox label={20} index={1} tone="brand" />
          <DiagramBox label={25} index={2} tone="green" />
          <DiagramArrow />
          <DiagramBox label={30} index={3} tone="amber" />
          <DiagramArrow />
          <DiagramBox label={40} index={4} tone="amber" />
          <DiagramArrow />
          <DiagramBox label={50} index={5} tone="amber" />
        </div>
      ),
    },
  ],

  quiz: [
    {
      question: 'What is the default initial capacity allocated on the first add() to a no-arg ArrayList?',
      options: ['0', '10', '16', '1.5x the requested size'],
      answerIndex: 1,
      explanation: 'The no-arg constructor defers allocation; the first add() allocates a backing array of capacity 10.',
    },
    {
      question: 'What is the time complexity of ArrayList.add(0, element) on a list of size n?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answerIndex: 2,
      explanation: 'Inserting at the front requires shifting all n existing elements one slot to the right.',
    },
    {
      question: 'Which interface does ArrayList implement that LinkedList also implements but that signals "efficient index-based access" to algorithms?',
      options: ['Cloneable', 'RandomAccess', 'Serializable', 'Deque'],
      answerIndex: 1,
      explanation: 'RandomAccess is a marker interface. ArrayList implements it (and is genuinely O(1) for get); LinkedList does not implement it since its get(index) is O(n).',
    },
    {
      question: 'What does ArrayList\'s fail-fast iterator throw when the list is structurally modified during iteration outside the iterator itself?',
      options: ['NullPointerException', 'IllegalStateException', 'ConcurrentModificationException', 'UnsupportedOperationException'],
      answerIndex: 2,
      explanation: 'A modCount mismatch detected by the iterator triggers ConcurrentModificationException — a best-effort development-time safety check.',
    },
    {
      question: 'Which statement about ArrayList and null is correct?',
      options: [
        'ArrayList never allows null elements',
        'ArrayList allows at most one null element',
        'ArrayList allows any number of null elements at any position',
        'ArrayList throws NullPointerException on add(null)',
      ],
      answerIndex: 2,
      explanation: 'Unlike hash-based Sets/Maps with a single null key restriction, ArrayList places no restriction on how many nulls it can hold.',
    },
  ],
};
