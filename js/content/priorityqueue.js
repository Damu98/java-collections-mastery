/* ==========================================================================
   CONTENT: PriorityQueue
   ========================================================================== */

CollectionsContent['priorityqueue'] = {

  overview: {
    paragraphs: [
      'PriorityQueue is a binary-heap-backed Queue implementation that orders its elements by priority — natural ordering (Comparable) by default, or a Comparator supplied at construction — rather than by insertion order. Despite implementing the Queue interface, it is deliberately NOT a FIFO structure.',
      'It guarantees only one thing about ordering: the head of the queue (returned by peek()/poll()) is always the smallest element according to the ordering in use (a "min-heap" by default). The rest of the internal array is heap-ordered, not fully sorted — a very common source of confusion for anyone who assumes iterating a PriorityQueue yields sorted output.',
      'PriorityQueue is the standard building block for any algorithm that repeatedly needs "give me the current smallest/highest-priority item" — Dijkstra\'s shortest path, task schedulers, and top-K style problems all lean on it heavily.',
    ],
    keyPoints: [
      'Backed by an array-based binary heap; O(log n) insertion and removal, O(1) peek at the head.',
      'Orders elements by natural ordering or a supplied Comparator — the head is always the minimum (or maximum, with a reversed Comparator).',
      'Iterating a PriorityQueue does NOT yield sorted order — only repeated poll() calls do.',
      'Does not permit null elements (throws NullPointerException), since ordering comparisons require non-null values.',
      'Not thread-safe; PriorityBlockingQueue is the concurrent equivalent.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'The heap is stored in a plain Object[] array representing a complete binary tree: for a node at index i, its children live at indices 2i+1 and 2i+2, and its parent at (i-1)/2 — no pointers are needed at all, just index arithmetic.',
      'offer(e) appends the new element at the end of the array, then "sifts up": repeatedly compares it with its parent and swaps if it violates the heap property (is smaller than its parent, for a min-heap), until the property is restored or it reaches the root. This is O(log n) since the tree height is log n.',
      'poll() saves the root (the element to return), moves the very last element in the array into the root position, shrinks the array\'s logical size by one, then "sifts down": repeatedly compares the new root with its children and swaps with the smaller child until the heap property is restored. Also O(log n).',
      'Capacity growth mirrors ArrayList\'s spirit but with different constants: PriorityQueue doubles capacity if the current capacity is small (under 64), and grows by 50% for larger capacities — the same general "amortized O(1) growth, occasional O(n) copy" pattern as ArrayList.',
    ],
  },

  complexity: [
    { operation: 'offer(e)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Sift-up from the last position.' },
    { operation: 'poll() / remove() (head)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Sift-down from the root.' },
    { operation: 'peek()', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'The root is always the head; no traversal needed.' },
    { operation: 'remove(Object) / contains(Object)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'No index structure for arbitrary elements — must linearly scan the heap array.' },
  ],

  memory: {
    paragraphs: [
      'A plain Object[] array with no per-element node overhead, similar in spirit to ArrayList\'s memory profile — significantly more compact than a linked structure would be for the same element count.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'PriorityQueue is not synchronized. Use Collections.synchronizedCollection(...) for coarse external synchronization, or java.util.concurrent.PriorityBlockingQueue for a genuinely concurrent priority queue with blocking take() semantics.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator makes NO guarantee about traversal order — it does not walk the heap in priority order, sorted order, or insertion order; it simply walks the backing array in whatever physical position each element happens to occupy after heap operations. Only repeated calls to poll() are guaranteed to return elements in priority order.',
      'The iterator is fail-fast with respect to structural modification during iteration, consistent with the rest of the framework.',
    ],
  },

  ordering: {
    paragraphs: [
      'Only the head element (peek()/poll()) is guaranteed to be the minimum according to the queue\'s ordering. To fully drain a PriorityQueue in sorted order, you must repeatedly poll() rather than iterate.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'PriorityQueue does not permit null elements; add(null) throws NullPointerException, since every insertion must be compared against existing elements to find its heap position, and comparing against null is undefined.',
    ],
  },

  useCases: [
    { title: 'Task scheduling by priority', description: 'Processing the highest-priority pending task first, regardless of arrival order.' },
    { title: 'Graph algorithms (Dijkstra, Prim\'s MST)', description: 'Repeatedly extracting the "closest" unvisited node is the core operation both algorithms are built around.' },
    { title: 'Top-K / K-th element problems', description: 'Maintaining a bounded heap of the K best/worst elements seen so far is a classic O(n log k) pattern.' },
    { title: 'Merging multiple sorted streams', description: 'Merge k sorted lists/streams by always pulling the current smallest head element across all streams.' },
  ],

  springBootExamples: [
    {
      title: 'Priority-ordered background job runner',
      description: 'A single-threaded job runner processes queued jobs in priority order (lower number = higher priority) using PriorityQueue with a Comparator.',
      code:
`@Component
public class PriorityJobRunner {

    private final PriorityQueue<Job> jobs = new PriorityQueue<>(Comparator.comparingInt(Job::priority));

    public synchronized void submit(Job job) {
        jobs.offer(job);
    }

    @Scheduled(fixedDelay = 500)
    public synchronized void runNext() {
        Job job = jobs.poll();
        if (job != null) job.execute();
    }
}`,
    },
    {
      title: 'Top-K slowest endpoints monitor',
      description: 'A metrics endpoint reports the K slowest recent requests using a bounded min-heap that evicts the fastest entry once it exceeds size K.',
      code:
`@Component
public class SlowestRequestsTracker {

    private static final int K = 10;
    private final PriorityQueue<RequestTiming> slowest =
        new PriorityQueue<>(Comparator.comparingLong(RequestTiming::durationMillis));

    public synchronized void record(RequestTiming timing) {
        slowest.offer(timing);
        if (slowest.size() > K) {
            slowest.poll(); // evict the currently-fastest of the tracked K
        }
    }

    public synchronized List<RequestTiming> topSlowest() {
        return new ArrayList<>(slowest);
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Does iterating a PriorityQueue return elements in sorted order?', difficulty: 'Intermediate', answer: 'No. The iterator walks the backing array in physical position order, which is only heap-ordered, not fully sorted. Only the head (peek()/poll()) is guaranteed to be the minimum; to get fully sorted output you must repeatedly poll().' },
    { question: 'What is the time complexity of PriorityQueue.offer() and why?', difficulty: 'Intermediate', answer: 'O(log n). The new element is appended at the next free array slot then "sifted up" — swapped with its parent repeatedly until the heap property holds — and the tree height (hence the maximum number of swaps) is O(log n) for n elements.' },
    { question: 'How would you create a max-heap using PriorityQueue, which defaults to a min-heap?', difficulty: 'Beginner', answer: 'Supply a reversed Comparator: `new PriorityQueue<>(Comparator.reverseOrder())` for Comparable elements, or `new PriorityQueue<>(comparator.reversed())` for a custom Comparator.' },
    { question: 'Why is remove(Object) O(n) on a PriorityQueue, unlike offer()/poll()?', difficulty: 'Intermediate', answer: 'The heap array is only structured to make finding the minimum (index 0) fast — there is no index or hash structure for locating an arbitrary element, so removing an arbitrary value requires a linear scan to find it before the usual O(log n) heap-repair step.' },
    { question: 'Why does PriorityQueue reject null elements?', difficulty: 'Beginner', answer: 'Every insertion must be compared against existing elements (via compareTo() or a Comparator) to find its correct heap position, and comparing against null is undefined — so add(null) throws NullPointerException immediately.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Find the Kth largest element in an array',
        statement: 'Given an unsorted array, find the Kth largest element using a min-heap of size K.',
        code:
`import java.util.*;

public class KthLargest {
    public static int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int n : nums) {
            minHeap.offer(n);
            if (minHeap.size() > k) {
                minHeap.poll(); // discard the smallest, keeping only the top k
            }
        }
        return minHeap.peek();
    }

    public static void main(String[] args) {
        int[] nums = {3, 2, 1, 5, 6, 4};
        System.out.println(findKthLargest(nums, 2));
    }
}`,
        output: '5',
      },
    ],
    intermediate: [
      {
        title: 'Merge k sorted lists',
        statement: 'Given k sorted List<Integer>, merge them into a single sorted list using a PriorityQueue.',
        code:
`import java.util.*;

public class MergeKSortedLists {
    public static List<Integer> merge(List<List<Integer>> lists) {
        record Cursor(int listIndex, int elementIndex) {}
        PriorityQueue<Cursor> heap = new PriorityQueue<>(
            Comparator.comparingInt(c -> lists.get(c.listIndex()).get(c.elementIndex())));

        for (int i = 0; i < lists.size(); i++) {
            if (!lists.get(i).isEmpty()) heap.offer(new Cursor(i, 0));
        }

        List<Integer> result = new ArrayList<>();
        while (!heap.isEmpty()) {
            Cursor cur = heap.poll();
            List<Integer> list = lists.get(cur.listIndex());
            result.add(list.get(cur.elementIndex()));
            if (cur.elementIndex() + 1 < list.size()) {
                heap.offer(new Cursor(cur.listIndex(), cur.elementIndex() + 1));
            }
        }
        return result;
    }

    public static void main(String[] args) {
        List<List<Integer>> lists = List.of(List.of(1, 4, 5), List.of(1, 3, 4), List.of(2, 6));
        System.out.println(merge(lists));
    }
}`,
        output: '[1, 1, 2, 3, 4, 4, 5, 6]',
      },
    ],
    advanced: [
      {
        title: 'Dijkstra\'s shortest path using PriorityQueue',
        statement: 'Given a weighted graph, find the shortest distance from a source node to all others using PriorityQueue as the min-priority frontier.',
        code:
`import java.util.*;

public class Dijkstra {
    record Edge(String to, int weight) {}

    public static Map<String, Integer> shortestPaths(Map<String, List<Edge>> graph, String source) {
        Map<String, Integer> distances = new HashMap<>();
        PriorityQueue<Map.Entry<String, Integer>> frontier =
            new PriorityQueue<>(Map.Entry.comparingByValue());

        distances.put(source, 0);
        frontier.offer(Map.entry(source, 0));

        while (!frontier.isEmpty()) {
            Map.Entry<String, Integer> current = frontier.poll();
            String node = current.getKey();
            int dist = current.getValue();
            if (dist > distances.getOrDefault(node, Integer.MAX_VALUE)) continue; // stale entry

            for (Edge edge : graph.getOrDefault(node, List.of())) {
                int newDist = dist + edge.weight();
                if (newDist < distances.getOrDefault(edge.to(), Integer.MAX_VALUE)) {
                    distances.put(edge.to(), newDist);
                    frontier.offer(Map.entry(edge.to(), newDist));
                }
            }
        }
        return distances;
    }

    public static void main(String[] args) {
        Map<String, List<Edge>> graph = Map.of(
            "A", List.of(new Edge("B", 4), new Edge("C", 1)),
            "C", List.of(new Edge("B", 1), new Edge("D", 5)),
            "B", List.of(new Edge("D", 1)),
            "D", List.of()
        );
        System.out.println(shortestPaths(graph, "A"));
    }
}`,
        output: '{A=0, B=2, C=1, D=3}',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Emergency room patient triage queue',
      domain: 'Healthcare',
      description: 'An ER intake system processes patients by severity score rather than arrival order, using PriorityQueue to always surface the most critical waiting patient next.',
      code:
`public class TriageQueue {

    private final PriorityQueue<Patient> queue =
        new PriorityQueue<>(Comparator.comparingInt(Patient::severityScore).reversed());

    public synchronized void checkIn(Patient patient) {
        queue.offer(patient);
    }

    public synchronized Optional<Patient> nextToTreat() {
        return Optional.ofNullable(queue.poll());
    }
}`,
    },
    {
      title: 'Customer support ticket priority routing',
      domain: 'E-commerce',
      description: 'A support platform routes tickets by a combined priority score (SLA tier + wait time), always handling the most urgent ticket next regardless of raw arrival order.',
      code:
`public class SupportTicketQueue {

    private final PriorityQueue<Ticket> queue =
        new PriorityQueue<>(Comparator.comparingDouble(Ticket::urgencyScore).reversed());

    public void enqueue(Ticket ticket) {
        queue.offer(ticket);
    }

    public Ticket nextTicket() {
        Ticket ticket = queue.poll();
        if (ticket == null) throw new NoSuchElementException("No tickets waiting");
        return ticket;
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-region priority queues: Map<String, PriorityQueue<DeliveryTask>>',
      explanation: 'A logistics dispatch system keeps one priority queue per delivery region, each ordered by promised delivery deadline.',
      code:
`Map<String, PriorityQueue<DeliveryTask>> tasksByRegion = new HashMap<>();

tasksByRegion
    .computeIfAbsent(region, r -> new PriorityQueue<>(Comparator.comparing(DeliveryTask::deadline)))
    .offer(task);`,
    },
  ],

  bestPractices: [
    'Never rely on iteration order for sorted output — repeatedly call poll() if you need elements in priority order.',
    'Supply an explicit Comparator with a documented tie-breaker whenever the primary priority field is not itself unique.',
    'Use a bounded min-heap pattern (offer then poll if size exceeds K) for efficient "top K" tracking rather than sorting the entire dataset.',
    'Reach for PriorityBlockingQueue instead of manually synchronizing a PriorityQueue for concurrent producer/consumer priority scheduling.',
  ],

  commonMistakes: [
    {
      mistake: 'Iterating a PriorityQueue with a for-each loop and expecting sorted output.',
      why: 'The iterator walks the backing array in physical heap position, which is only partially ordered (heap property), not fully sorted.',
      fix: 'Drain the queue with repeated poll() calls if you need elements in priority order, or copy into a List and sort it if you need sorted output without destroying the original queue.',
    },
    {
      mistake: 'Assuming PriorityQueue.remove(Object) is as fast as offer()/poll().',
      why: 'There is no fast-lookup structure for arbitrary elements in a heap — removing a specific value requires an O(n) linear scan to locate it first.',
      fix: 'If you need frequent arbitrary-element removal, consider maintaining a separate index (e.g. a Map from element to heap-adjacent bookkeeping), or reconsider whether PriorityQueue is the right structure.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'PriorityQueue', 'TreeSet', 'PriorityBlockingQueue'],
    rows: [
      ['Ordering guarantee', 'Only the head is the minimum', 'Fully sorted at all times', 'Only the head is the minimum'],
      ['offer/poll complexity', 'O(log n)', 'O(log n)', 'O(log n) + lock overhead'],
      ['Duplicate elements', 'Allowed', 'Not allowed (compareTo()==0 treated as duplicate)', 'Allowed'],
      ['Thread-safe', 'No', 'No', 'Yes'],
    ],
  },

  diagrams: [
    {
      title: 'Binary heap as a tree and as its backing array',
      caption: 'Node at array index i has children at 2i+1 and 2i+2 — parent/child relationships are pure arithmetic, no pointers needed.',
      render: () => (
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <DiagramBox label={3} tone="green" sub="root (min)" />
            <div className="flex gap-8">
              <DiagramBox label={7} tone="brand" />
              <DiagramBox label={5} tone="brand" />
            </div>
            <div className="flex gap-3">
              <DiagramBox label={9} tone="slate" />
              <DiagramBox label={8} tone="slate" />
              <DiagramBox label={6} tone="slate" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[3, 7, 5, 9, 8, 6].map((v, i) => <DiagramBox key={i} label={v} index={i} tone={i === 0 ? 'green' : 'slate'} />)}
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What is guaranteed about the order of a PriorityQueue\'s iterator?', options: ['Fully sorted order', 'Insertion order', 'Nothing — only peek()/poll() guarantee the minimum', 'Reverse sorted order'], answerIndex: 2, explanation: 'Only the head element accessed via peek()/poll() is guaranteed to be the minimum; iteration order is unspecified heap-array order.' },
    { question: 'What is the time complexity of PriorityQueue.peek()?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answerIndex: 0, explanation: 'The minimum is always at array index 0 (the root), so peek() requires no traversal at all.' },
    { question: 'How do you make a PriorityQueue behave as a max-heap?', options: ['It is impossible', 'Pass Comparator.reverseOrder() or a reversed Comparator', 'Call queue.reverse()', 'Use TreeSet instead'], answerIndex: 1, explanation: 'Supplying a reversed Comparator flips which element is considered "smallest" (i.e. the head).' },
    { question: 'What is the time complexity of PriorityQueue.remove(Object)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answerIndex: 2, explanation: 'Finding an arbitrary element requires a linear scan since there is no index structure beyond the heap-ordering of the root.' },
    { question: 'Can a PriorityQueue contain null elements?', options: ['Yes, one null', 'Yes, unlimited', 'No, it throws NullPointerException', 'Only with a Comparator that handles null'], answerIndex: 2, explanation: 'Insertions require comparing against existing elements, and comparing against null is undefined.' },
  ],
};
