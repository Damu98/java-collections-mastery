/* ==========================================================================
   CONTENT: LinkedList
   ========================================================================== */

CollectionsContent['linkedlist'] = {

  overview: {
    paragraphs: [
      'LinkedList is a doubly-linked list implementation of both the List and Deque interfaces. Every element is wrapped in an internal Node object holding references to the previous and next nodes, plus the element itself — there is no contiguous backing array.',
      'Because it implements Deque, LinkedList can act as a stack, a queue, or a double-ended queue in addition to a List, which is why it exposes push/pop/peek/poll/offer alongside the standard List methods.',
      'It shines when you need frequent insertion/removal at the head or tail (O(1)) and rarely need random access by index (which is O(n) — it must walk the chain from whichever end is closer).',
    ],
    keyPoints: [
      'Backed by doubly-linked Node objects (element, prev, next), not an array.',
      'O(1) insertion/removal at the head or tail; O(1) removal given a Node/ListIterator position.',
      'get(index) and other positional access are O(n) because the list must be walked.',
      'Implements both List and Deque, so it can be used as a stack, queue, or deque.',
      'Does not implement RandomAccess — algorithms that check for it will iterate instead of indexing.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Each node is a private static Node<E> class with three fields: `E item`, `Node<E> next`, `Node<E> prev`. The list itself only tracks `first` and `last` node references plus a size counter — there is no capacity or resizing concept at all.',
      'Adding to the tail (linkLast) is O(1): allocate a new node, point the old last node\'s `next` at it, point the new node\'s `prev` at the old last, and update `last`. Adding to the head (linkFirst) is symmetric.',
      'get(index) is optimized to walk from whichever end is closer: if index < size/2 it walks forward from `first`, otherwise backward from `last` — still O(n) in the worst case, but roughly half the work of a naive forward-only walk.',
      'Removing a node given a direct reference (e.g. via a ListIterator positioned there) is O(1): splice out the node by relinking its neighbors\' prev/next pointers. This is LinkedList\'s real advantage over ArrayList for iterator-driven bulk removal.',
    ],
  },

  complexity: [
    { operation: 'addFirst / addLast', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Pure pointer relinking, no shifting.' },
    { operation: 'removeFirst / removeLast', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Pointer relinking.' },
    { operation: 'get(index) / set(index, e)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Walks from the nearer end; still linear.' },
    { operation: 'add(index, e) / remove(index)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'O(n) to reach the index, O(1) to splice once there.' },
    { operation: 'Iterator.remove() at current position', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'No walking needed — the iterator already holds the node.' },
    { operation: 'contains(e) / indexOf(e)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Linear scan.' },
  ],

  memory: {
    paragraphs: [
      'Every element costs one Node object: an object header, three reference fields (item, next, prev), typically rounding to roughly 32-40 bytes per node on a 64-bit JVM with compressed oops — substantially more per-element overhead than ArrayList\'s tightly packed reference array.',
      'Nodes are scattered across the heap (unless allocated in a tight burst that happens to land contiguously), so sequential traversal suffers far more cache misses than ArrayList\'s contiguous array — in practice this often makes LinkedList slower than ArrayList even for operations LinkedList is "supposed" to win, unless the workload is dominated by head/tail churn or splicing via an iterator.',
    ],
    points: [
      'Expect roughly 3-4x the per-element memory overhead of ArrayList due to node objects and pointer fields.',
      'Benchmark before choosing LinkedList for "performance" reasons — ArrayDeque usually outperforms it even as a queue/stack.',
      'Best justified when you genuinely need O(1) splicing via a ListIterator mid-list, not just head/tail operations (ArrayDeque already covers head/tail).',
    ],
  },

  threadSafety: {
    paragraphs: [
      'LinkedList has no internal synchronization, exactly like ArrayList. Concurrent structural modification from multiple threads is unsafe.',
      'Wrap with Collections.synchronizedList(new LinkedList<>()) for coarse-grained safety, or prefer java.util.concurrent.ConcurrentLinkedDeque / LinkedBlockingDeque for genuinely concurrent producer-consumer style usage.',
    ],
  },

  iteration: {
    paragraphs: [
      'LinkedList\'s iterator and ListIterator are fail-fast, using the same modCount mechanism as ArrayList — concurrent structural modification during iteration throws ConcurrentModificationException.',
      'Unlike ArrayList, LinkedList\'s ListIterator.remove()/add() are genuinely O(1) at the current position (no shifting), which is the main reason to iterate-and-mutate a LinkedList rather than an ArrayList.',
    ],
  },

  ordering: {
    paragraphs: [
      'LinkedList is strictly insertion-ordered (or explicit-position-ordered via addFirst/addLast/add(index, e)) and never reorders elements on its own.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'LinkedList allows any number of null elements at any position, including as the first or last element of the Deque.',
    ],
  },

  useCases: [
    { title: 'Producer-consumer style buffers (single-threaded)', description: 'When you need addLast()/removeFirst() FIFO behavior without concurrency, though ArrayDeque is usually preferred for raw performance.' },
    { title: 'LRU-style structures with iterator splicing', description: 'Combined with a HashMap<K, Node> for O(1) lookup, a manually managed doubly-linked list is the classic LRU cache building block (LinkedHashMap already does this internally).' },
    { title: 'Undo/redo history with frequent head/tail edits', description: 'A history stack/deque where entries are added and trimmed from both ends frequently.' },
    { title: 'Implementing custom Deque-based algorithms', description: 'Sliding window problems, browser back/forward history, and other structures that map naturally onto Deque semantics.' },
  ],

  springBootExamples: [
    {
      title: 'Bounded recent-activity feed using Deque semantics',
      description: 'A service tracks the last N audit events per user using LinkedList\'s Deque methods, trimming from the tail as new events arrive at the head.',
      code:
`@Service
public class RecentActivityService {

    private static final int MAX_EVENTS = 50;
    private final Map<String, LinkedList<AuditEvent>> recentByUser = new ConcurrentHashMap<>();

    public void record(String userId, AuditEvent event) {
        LinkedList<AuditEvent> events = recentByUser.computeIfAbsent(userId, id -> new LinkedList<>());
        synchronized (events) {
            events.addFirst(event);
            if (events.size() > MAX_EVENTS) {
                events.removeLast();
            }
        }
    }

    public List<AuditEvent> recentFor(String userId) {
        LinkedList<AuditEvent> events = recentByUser.getOrDefault(userId, new LinkedList<>());
        synchronized (events) {
            return new ArrayList<>(events);
        }
    }
}`,
    },
    {
      title: 'Undo stack for a document-editing endpoint',
      description: 'A collaborative editor exposes undo by pushing snapshots onto a LinkedList used as a stack via push()/pop().',
      code:
`@RestController
@RequestMapping("/api/documents/{docId}")
public class DocumentEditController {

    private final Map<String, LinkedList<DocumentSnapshot>> undoStacks = new ConcurrentHashMap<>();

    @PostMapping("/edit")
    public ResponseEntity<Void> edit(@PathVariable String docId, @RequestBody DocumentSnapshot snapshot) {
        undoStacks.computeIfAbsent(docId, id -> new LinkedList<>()).push(snapshot);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/undo")
    public ResponseEntity<DocumentSnapshot> undo(@PathVariable String docId) {
        LinkedList<DocumentSnapshot> stack = undoStacks.get(docId);
        if (stack == null || stack.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(stack.pop());
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why is LinkedList.get(index) O(n) while ArrayList.get(index) is O(1)?', difficulty: 'Beginner', answer: 'LinkedList has no contiguous backing array to index into — it must traverse node-by-node from either the head or the tail (whichever is closer) following next/prev references, which is inherently linear.' },
    { question: 'When does LinkedList genuinely outperform ArrayList?', difficulty: 'Intermediate', answer: 'When you hold a ListIterator positioned in the middle of the list and repeatedly add/remove at that exact position — that splice is O(1) for LinkedList versus O(n) for ArrayList (which must shift trailing elements). Pure head/tail operations are usually better served by ArrayDeque, which beats LinkedList in practice due to cache locality.' },
    { question: 'Why does the JDK recommend ArrayDeque over LinkedList/Stack for stack and queue use cases?', difficulty: 'Intermediate', answer: 'ArrayDeque is backed by a resizable circular array, giving it much better cache locality and lower per-element memory overhead than LinkedList\'s scattered node objects, while still providing O(1) amortized operations at both ends — with no synchronization overhead that legacy Stack carries.' },
    { question: 'Does LinkedList implement RandomAccess? What is the practical consequence?', difficulty: 'Beginner', answer: 'No. Code that branches on `list instanceof RandomAccess` (as Collections.binarySearch does) will use an iterator-based algorithm for LinkedList instead of an index-based one, because index-based access would be O(n) per lookup and blow up the algorithm\'s complexity.' },
    { question: 'How would you implement an O(1) LRU cache eviction using a LinkedList-like structure?', difficulty: 'Advanced', answer: 'Pair a HashMap<K, Node> for O(1) key lookup with a manually maintained doubly-linked list of nodes ordered by recency. On access, unlink the node and relink it at the head (both O(1) given the direct node reference from the map); on capacity overflow, evict the tail node and remove its key from the map. LinkedHashMap with accessOrder=true implements exactly this internally.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Use LinkedList as a Deque to check for a palindrome',
        statement: 'Given a String, use a LinkedList as a Deque to check whether it reads the same forwards and backwards.',
        code:
`import java.util.Deque;
import java.util.LinkedList;

public class PalindromeCheck {
    public static boolean isPalindrome(String text) {
        Deque<Character> deque = new LinkedList<>();
        for (char c : text.toCharArray()) {
            deque.addLast(c);
        }
        while (deque.size() > 1) {
            if (!deque.removeFirst().equals(deque.removeLast())) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
        System.out.println(isPalindrome("hello"));
    }
}`,
        output: 'true\nfalse',
      },
      {
        title: 'Rotate a LinkedList by k positions',
        statement: 'Rotate a LinkedList<Integer> to the left by k positions using addLast/removeFirst.',
        code:
`import java.util.LinkedList;
import java.util.List;

public class RotateLeft {
    public static void main(String[] args) {
        LinkedList<Integer> list = new LinkedList<>(List.of(1, 2, 3, 4, 5));
        int k = 2;

        for (int i = 0; i < k; i++) {
            list.addLast(list.removeFirst());
        }

        System.out.println(list);
    }
}`,
        output: '[3, 4, 5, 1, 2]',
      },
    ],
    intermediate: [
      {
        title: 'Sliding window maximum using a Deque',
        statement: 'Given an array and a window size k, find the maximum of every window of size k in O(n) using LinkedList as a Deque of indices.',
        code:
`import java.util.*;

public class SlidingWindowMax {
    public static int[] maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> indices = new LinkedList<>(); // stores indices, values decreasing
        int[] result = new int[nums.length - k + 1];

        for (int i = 0; i < nums.length; i++) {
            while (!indices.isEmpty() && indices.peekFirst() <= i - k) {
                indices.pollFirst(); // drop indices out of the window
            }
            while (!indices.isEmpty() && nums[indices.peekLast()] < nums[i]) {
                indices.pollLast(); // drop smaller values, they can never be the max again
            }
            indices.offerLast(i);
            if (i >= k - 1) {
                result[i - k + 1] = nums[indices.peekFirst()];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        System.out.println(Arrays.toString(maxSlidingWindow(nums, 3)));
    }
}`,
        output: '[3, 3, 5, 5, 6, 7]',
      },
      {
        title: 'Detect and remove a cycle-free duplicate span',
        statement: 'Given a LinkedList<String> of log tags, remove every node whose value already appeared earlier, using a ListIterator for O(1) splicing.',
        code:
`import java.util.*;

public class DedupeWithIterator {
    public static void main(String[] args) {
        LinkedList<String> tags = new LinkedList<>(List.of("INFO", "WARN", "INFO", "ERROR", "WARN", "DEBUG"));

        Set<String> seen = new HashSet<>();
        ListIterator<String> it = tags.listIterator();
        while (it.hasNext()) {
            String tag = it.next();
            if (!seen.add(tag)) {
                it.remove(); // O(1) splice at the iterator's current position
            }
        }

        System.out.println(tags);
    }
}`,
        output: '[INFO, WARN, ERROR, DEBUG]',
      },
    ],
    advanced: [
      {
        title: 'Build a minimal LRU cache with HashMap + manual doubly-linked list',
        statement: 'Implement get/put with O(1) amortized time for both, evicting the least-recently-used entry when capacity is exceeded.',
        code:
`import java.util.HashMap;
import java.util.Map;

public class LruCache<K, V> {

    private static class Node<K, V> {
        K key; V value; Node<K, V> prev, next;
        Node(K key, V value) { this.key = key; this.value = value; }
    }

    private final int capacity;
    private final Map<K, Node<K, V>> map = new HashMap<>();
    private final Node<K, V> head = new Node<>(null, null); // dummy head (most recently used side)
    private final Node<K, V> tail = new Node<>(null, null); // dummy tail (least recently used side)

    public LruCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public V get(K key) {
        Node<K, V> node = map.get(key);
        if (node == null) return null;
        moveToFront(node);
        return node.value;
    }

    public void put(K key, V value) {
        Node<K, V> existing = map.get(key);
        if (existing != null) {
            existing.value = value;
            moveToFront(existing);
            return;
        }
        Node<K, V> node = new Node<>(key, value);
        map.put(key, node);
        addToFront(node);
        if (map.size() > capacity) {
            Node<K, V> lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }

    private void addToFront(Node<K, V> node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    private void remove(Node<K, V> node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void moveToFront(Node<K, V> node) {
        remove(node);
        addToFront(node);
    }

    public static void main(String[] args) {
        LruCache<Integer, String> cache = new LruCache<>(2);
        cache.put(1, "A");
        cache.put(2, "B");
        cache.get(1);          // 1 is now most recently used
        cache.put(3, "C");     // evicts 2 (least recently used)
        System.out.println(cache.get(2)); // null, evicted
        System.out.println(cache.get(1)); // A
        System.out.println(cache.get(3)); // C
    }
}`,
        output: 'null\nA\nC',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Browser-style navigation history for a hospital records viewer',
      domain: 'Healthcare',
      description: 'A clinician-facing app tracks back/forward navigation between patient chart tabs using two LinkedList-backed stacks (Deque via push/pop).',
      code:
`public class ChartNavigationHistory {

    private final Deque<String> back = new LinkedList<>();
    private final Deque<String> forward = new LinkedList<>();
    private String current;

    public void navigateTo(String chartId) {
        if (current != null) back.push(current);
        current = chartId;
        forward.clear();
    }

    public String goBack() {
        if (back.isEmpty()) return current;
        forward.push(current);
        current = back.pop();
        return current;
    }

    public String goForward() {
        if (forward.isEmpty()) return current;
        back.push(current);
        current = forward.pop();
        return current;
    }
}`,
    },
    {
      title: 'Social media feed buffer with a capped recent-posts window',
      domain: 'Social Media',
      description: 'A feed-ranking service keeps only the most recent 200 candidate posts per topic in memory using addFirst/removeLast, avoiding the O(n) shifting an ArrayList would need for the same eviction pattern at the front.',
      code:
`public class TopicFeedBuffer {

    private static final int WINDOW = 200;
    private final LinkedList<Post> recentPosts = new LinkedList<>();

    public synchronized void ingest(Post post) {
        recentPosts.addFirst(post);
        if (recentPosts.size() > WINDOW) {
            recentPosts.removeLast();
        }
    }

    public synchronized List<Post> snapshot() {
        return new ArrayList<>(recentPosts);
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Adjacency list graph representation: Map<String, LinkedList<String>>',
      explanation: 'A flight-routing service models an airport graph as an adjacency list, appending destinations with addLast() as routes are ingested.',
      code:
`Map<String, LinkedList<String>> routes = new HashMap<>();

for (Route route : incomingRoutes) {
    routes.computeIfAbsent(route.origin(), k -> new LinkedList<>()).addLast(route.destination());
}

LinkedList<String> destinationsFromJfk = routes.getOrDefault("JFK", new LinkedList<>());
System.out.println(destinationsFromJfk);`,
    },
  ],

  bestPractices: [
    'Reach for ArrayDeque instead of LinkedList for pure stack/queue behavior — it is faster and more memory-efficient for the same API surface.',
    'Only choose LinkedList when you need O(1) splicing at an arbitrary position via a held ListIterator, not just head/tail operations.',
    'Program against the Deque or List interface, not the concrete LinkedList type, so the implementation can be swapped later.',
    'Avoid get(index) in a loop over a LinkedList — that turns an O(n) traversal into an accidental O(n^2); use an iterator or a for-each loop instead.',
    'Use the Deque methods (addFirst/addLast/pollFirst/pollLast) rather than the legacy Stack/Vector-flavored aliases for clarity about intent.',
  ],

  commonMistakes: [
    {
      mistake: 'Looping `for (int i = 0; i < list.size(); i++) list.get(i)` over a LinkedList.',
      why: 'Each get(i) call re-walks the chain from an end, turning what looks like an O(n) loop into O(n^2) overall.',
      fix: 'Use a for-each loop or an explicit Iterator/ListIterator, both of which walk the chain once, sequentially.',
    },
    {
      mistake: 'Choosing LinkedList "for performance" as a queue or stack without benchmarking.',
      why: 'Node object overhead and poor cache locality typically make LinkedList slower than ArrayDeque for the same head/tail-only workload.',
      fix: 'Default to ArrayDeque for stack/queue use cases; reserve LinkedList for genuine mid-list splicing needs.',
    },
    {
      mistake: 'Mixing index-based List methods (add(index, e)) with Deque methods on the same instance without a clear mental model.',
      why: 'It obscures intent and hides the fact that positional access is O(n), making performance bugs easy to introduce.',
      fix: 'Pick one mental model per use site — treat the variable as either a List or a Deque, and type the reference accordingly.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'LinkedList', 'ArrayDeque', 'ArrayList'],
    rows: [
      ['Backing structure', 'Doubly linked nodes', 'Circular resizable array', 'Dynamic array'],
      ['addFirst/removeFirst', 'O(1)', 'O(1) amortized', 'O(n)'],
      ['get(index)', 'O(n)', 'O(1) via internal index math', 'O(1)'],
      ['Memory per element', 'High (node + 2 pointers)', 'Low (array slot)', 'Low (array slot)'],
      ['Implements Deque', 'Yes', 'Yes', 'No'],
      ['Recommended for stack/queue?', 'Legacy / mid-list splicing only', 'Yes — JDK-recommended default', 'No'],
    ],
  },

  diagrams: [
    {
      title: 'Doubly-linked node structure',
      caption: 'Each node holds references to the previous and next nodes; the list itself only tracks `first` and `last`.',
      render: () => (
        <div className="flex items-center gap-0">
          <DiagramPointer label="first" position="top" />
        </div>
      ),
    },
    {
      title: 'Node chain with prev/next pointers',
      caption: 'addLast() allocates a node and relinks two pointers — no shifting of any other element.',
      render: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <DiagramBox label="A" tone="brand" />
            <DiagramArrow label="next" />
            <DiagramBox label="B" tone="brand" />
            <DiagramArrow label="next" />
            <DiagramBox label="C" tone="green" sub="new tail" />
          </div>
          <div className="flex items-center justify-end pr-2">
            <span className="text-[11px] text-slate-400">◀── prev ──◀── prev ──◀</span>
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    {
      question: 'What data structure backs LinkedList internally?',
      options: ['A resizable array', 'A doubly linked list of Node objects', 'A singly linked list', 'A hash table'],
      answerIndex: 1,
      explanation: 'Each element is wrapped in a Node with references to both the previous and next nodes.',
    },
    {
      question: 'What is the time complexity of LinkedList.get(index)?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      answerIndex: 2,
      explanation: 'There is no index into a linked structure — it must be walked from the nearer end.',
    },
    {
      question: 'Why does the JDK generally recommend ArrayDeque over LinkedList for stack/queue use?',
      options: [
        'LinkedList cannot implement Deque',
        'ArrayDeque has better cache locality and lower per-element overhead',
        'LinkedList is not thread-safe but ArrayDeque is',
        'ArrayDeque supports negative indices',
      ],
      answerIndex: 1,
      explanation: 'Both are equally not-thread-safe; the real difference is ArrayDeque\'s contiguous-array cache friendliness and lower memory overhead.',
    },
    {
      question: 'Which of these does LinkedList NOT implement?',
      options: ['List', 'Deque', 'Queue', 'RandomAccess'],
      answerIndex: 3,
      explanation: 'LinkedList deliberately does not implement RandomAccess because indexed access is O(n), not O(1).',
    },
    {
      question: 'What makes ListIterator.remove() on a LinkedList O(1) rather than O(n)?',
      options: [
        'It rebuilds the whole list',
        'The iterator already holds a direct reference to the node, so only pointer relinking is needed',
        'It only marks the node as deleted without unlinking it',
        'LinkedList batches removals internally',
      ],
      answerIndex: 1,
      explanation: 'No traversal is needed because the iterator is already positioned at the node being removed.',
    },
  ],
};
