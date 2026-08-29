/* ==========================================================================
   CONTENT: ArrayDeque
   ========================================================================== */

CollectionsContent['arraydeque'] = {

  overview: {
    paragraphs: [
      'ArrayDeque ("array double-ended queue", Java 6) is a resizable, circular-array implementation of the Deque interface, giving O(1) amortized insertion and removal at BOTH ends. The JDK explicitly recommends it as the modern replacement for both legacy Stack (via push()/pop()) and LinkedList (via offer()/poll()) for stack and queue use cases.',
      'Unlike LinkedList, ArrayDeque has no per-element node overhead and enjoys excellent cache locality from its contiguous backing array, which is why it consistently outperforms LinkedList for the same head/tail-only workloads despite LinkedList\'s theoretical O(1) advantage looking identical on paper.',
      'It has no fixed capacity — the backing array grows (doubling) automatically as needed, similar in spirit to ArrayList, but unlike ArrayBlockingQueue it is never actually "full" and never blocks.',
    ],
    keyPoints: [
      'Backed by a circular (wrap-around) resizable array; capacity is always a power of two.',
      'O(1) amortized for addFirst/addLast/removeFirst/removeLast/peekFirst/peekLast.',
      'JDK-recommended replacement for both Stack (as a stack) and LinkedList (as a queue).',
      'Does NOT permit null elements (unlike LinkedList) — null is reserved as the poll()/peek() "empty" sentinel.',
      'Not thread-safe; no synchronized or concurrent Deque-specific wrapper exists in java.util (use ConcurrentLinkedDeque or LinkedBlockingDeque instead).',
    ],
  },

  internalWorking: {
    paragraphs: [
      'The backing array is treated as circular via two indices, `head` and `tail`, that wrap around using bitmasking (`(index + 1) & (array.length - 1)`) — which is why capacity is always kept as a power of two, exactly like HashMap\'s bucket array sizing trick.',
      'addFirst(e) decrements head (wrapping around to the end of the array if needed) and stores the element there; addLast(e) stores the element at tail and then increments tail (wrapping if needed) — both are O(1) with no shifting of any other element, unlike ArrayList\'s add(0, e).',
      'When the array becomes full (head catches up to tail), the deque doubles its capacity and copies all elements into the new array in logical order — the same amortized-O(1)-per-operation trade-off ArrayList\'s grow() makes.',
    ],
  },

  complexity: [
    { operation: 'addFirst / addLast / offerFirst / offerLast', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Worst case triggers a resize + full copy, same as ArrayList.' },
    { operation: 'removeFirst / removeLast / pollFirst / pollLast', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Pure index arithmetic, no shifting.' },
    { operation: 'peekFirst / peekLast', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Direct array access at head/tail index.' },
    { operation: 'contains(e) / remove(Object)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Linear scan — no index or hash structure for arbitrary elements.' },
  ],

  memory: {
    paragraphs: [
      'A single Object[] array with no per-element wrapper objects — dramatically more compact than LinkedList\'s node-per-element design for the same content, and with far better cache locality for sequential access.',
    ],
    points: [
      'Capacity is always rounded up to the next power of two, so actual allocated capacity can slightly exceed the requested initial capacity.',
      'Pre-size with an appropriate initial capacity when the expected size is roughly known, to avoid repeated doubling.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'ArrayDeque is not synchronized. For concurrent stack/queue needs, use java.util.concurrent.ConcurrentLinkedDeque (lock-free, unbounded) or LinkedBlockingDeque (blocking, optionally bounded) rather than manually synchronizing an ArrayDeque.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator (head to tail) and descendingIterator() (tail to head) are both fail-fast, using the same modCount mechanism as the rest of the framework.',
    ],
  },

  ordering: {
    paragraphs: [
      'Strictly insertion/removal order at whichever end operations are performed — used as a queue (offer/poll) it is FIFO; used as a stack (push/pop) it is LIFO. There is no reordering beyond what the caller explicitly performs.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'ArrayDeque explicitly prohibits null elements (addFirst(null)/addLast(null) throw NullPointerException) — a deliberate departure from LinkedList, which allows null. This preserves the poll()/peek() "null means empty" convention that null-tolerant Deque implementations cannot offer.',
    ],
  },

  useCases: [
    { title: 'Stack replacement (via push/pop/peek)', description: 'The JDK-recommended replacement for the legacy Stack class — faster, unsynchronized, and free of Stack\'s leaky List methods.' },
    { title: 'Queue replacement (via offer/poll/peek)', description: 'The JDK-recommended replacement for using LinkedList as a Queue — better cache locality, lower memory overhead, same O(1) guarantees.' },
    { title: 'Sliding window algorithms', description: 'Monotonic deque techniques (sliding window maximum/minimum) benefit from ArrayDeque\'s speed over LinkedList for the same algorithm.' },
    { title: 'Undo/redo and browser-style history', description: 'Symmetric push/pop at both ends models forward/back navigation cleanly.' },
  ],

  springBootExamples: [
    {
      title: 'Undo stack for a document editing service',
      description: 'A collaborative editing backend uses ArrayDeque as a stack (via push/pop) for per-document undo history, replacing a legacy Stack-based implementation.',
      code:
`@Service
public class DocumentUndoService {

    private final Map<String, Deque<DocumentSnapshot>> undoStacks = new ConcurrentHashMap<>();

    public void recordEdit(String documentId, DocumentSnapshot snapshot) {
        undoStacks.computeIfAbsent(documentId, id -> new ArrayDeque<>()).push(snapshot);
    }

    public Optional<DocumentSnapshot> undo(String documentId) {
        Deque<DocumentSnapshot> stack = undoStacks.get(documentId);
        if (stack == null || stack.isEmpty()) return Optional.empty();
        return Optional.of(stack.pop());
    }
}`,
    },
    {
      title: 'Bounded task queue for a lightweight worker loop',
      description: 'A background worker drains tasks FIFO from an ArrayDeque used as a Queue, avoiding LinkedList\'s node overhead for a hot-path work queue.',
      code:
`@Component
public class SimpleTaskWorker {

    private final Deque<Runnable> tasks = new ArrayDeque<>();

    public synchronized void submit(Runnable task) {
        tasks.offer(task);
    }

    @Scheduled(fixedDelay = 100)
    public void processNext() {
        Runnable task;
        synchronized (this) {
            task = tasks.poll();
        }
        if (task != null) task.run();
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why does the JDK recommend ArrayDeque over both Stack and LinkedList?', difficulty: 'Intermediate', answer: 'It offers the same O(1) amortized operations at both ends with better cache locality (contiguous array vs scattered nodes) and lower per-element memory overhead than LinkedList, plus no unnecessary synchronization overhead and no leaky List methods, unlike the legacy Stack class.' },
    { question: 'Why must ArrayDeque\'s backing array capacity always be a power of two?', difficulty: 'Advanced', answer: 'Wrap-around index arithmetic (`(index + 1) & (capacity - 1)`) is only equivalent to modulo when capacity is a power of two — the same bitmask trick HashMap uses for its bucket array.' },
    { question: 'Why does ArrayDeque disallow null elements while LinkedList allows them?', difficulty: 'Intermediate', answer: 'ArrayDeque was designed specifically as a high-performance Queue/Deque, where poll()/peek() need null as an unambiguous "empty" sentinel. LinkedList inherited its null-tolerance from its earlier life as a general-purpose List, predating this design consideration.' },
    { question: 'What is the time complexity of ArrayDeque.addFirst(e), and how does it avoid the O(n) shifting ArrayList.add(0, e) requires?', difficulty: 'Intermediate', answer: 'O(1) amortized. Because the array is treated as circular via a wrapping head index, adding to the front simply decrements (with wrap-around) the head index and writes the element there — no other elements move at all.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Implement a stack using ArrayDeque',
        statement: 'Use ArrayDeque\'s push/pop/peek methods to implement classic LIFO stack behavior.',
        code:
`import java.util.*;

public class ArrayDequeStack {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);

        System.out.println(stack.peek());
        System.out.println(stack.pop());
        System.out.println(stack.pop());
        System.out.println(stack);
    }
}`,
        output: '3\n3\n2\n[1]',
      },
    ],
    intermediate: [
      {
        title: 'Sliding window maximum using ArrayDeque (monotonic deque)',
        statement: 'Find the maximum of every window of size k in an array using ArrayDeque to hold candidate indices, in O(n).',
        code:
`import java.util.*;

public class SlidingWindowMaxDeque {
    public static int[] maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> indices = new ArrayDeque<>(); // decreasing-value indices
        int[] result = new int[nums.length - k + 1];

        for (int i = 0; i < nums.length; i++) {
            while (!indices.isEmpty() && indices.peekFirst() <= i - k) {
                indices.pollFirst();
            }
            while (!indices.isEmpty() && nums[indices.peekLast()] < nums[i]) {
                indices.pollLast();
            }
            indices.offerLast(i);
            if (i >= k - 1) {
                result[i - k + 1] = nums[indices.peekFirst()];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3)));
    }
}`,
        output: '[3, 3, 5, 5, 6, 7]',
      },
    ],
    advanced: [
      {
        title: 'Simulate a circular buffer with manual wrap-around, mirroring ArrayDeque internals',
        statement: 'Implement a fixed-size circular buffer (ring buffer) from scratch to understand the wrap-around indexing ArrayDeque uses internally.',
        code:
`public class CircularBuffer<T> {
    private final Object[] data;
    private int head = 0, tail = 0, size = 0;

    public CircularBuffer(int capacity) {
        this.data = new Object[capacity];
    }

    public void addLast(T value) {
        if (size == data.length) throw new IllegalStateException("Buffer full");
        data[tail] = value;
        tail = (tail + 1) % data.length;
        size++;
    }

    @SuppressWarnings("unchecked")
    public T removeFirst() {
        if (size == 0) throw new IllegalStateException("Buffer empty");
        T value = (T) data[head];
        data[head] = null;
        head = (head + 1) % data.length;
        size--;
        return value;
    }

    public static void main(String[] args) {
        CircularBuffer<Integer> buffer = new CircularBuffer<>(3);
        buffer.addLast(1);
        buffer.addLast(2);
        buffer.addLast(3);
        System.out.println(buffer.removeFirst()); // 1
        buffer.addLast(4); // wraps around to reuse slot 0
        System.out.println(buffer.removeFirst()); // 2
        System.out.println(buffer.removeFirst()); // 3
        System.out.println(buffer.removeFirst()); // 4
    }
}`,
        output: '1\n2\n3\n4',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Browser-style back/forward navigation for a hospital records viewer',
      domain: 'Healthcare',
      description: 'A clinician chart-viewing UI implements back/forward navigation between recently viewed patient charts using two ArrayDeque stacks, replacing a slower LinkedList-based implementation.',
      code:
`public class ChartNavigation {

    private final Deque<String> backStack = new ArrayDeque<>();
    private final Deque<String> forwardStack = new ArrayDeque<>();
    private String current;

    public void open(String chartId) {
        if (current != null) backStack.push(current);
        current = chartId;
        forwardStack.clear();
    }

    public String back() {
        if (backStack.isEmpty()) return current;
        forwardStack.push(current);
        return current = backStack.pop();
    }
}`,
    },
    {
      title: 'Recent order buffer for a fulfillment dashboard',
      domain: 'E-commerce',
      description: 'A fulfillment dashboard keeps the most recent 100 processed orders visible using ArrayDeque\'s O(1) addFirst/removeLast for an efficient bounded ring of recent activity.',
      code:
`public class RecentOrdersBuffer {

    private static final int MAX_SIZE = 100;
    private final Deque<Order> recentOrders = new ArrayDeque<>();

    public synchronized void record(Order order) {
        recentOrders.addFirst(order);
        if (recentOrders.size() > MAX_SIZE) {
            recentOrders.removeLast();
        }
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-conversation message buffers: Map<String, ArrayDeque<Message>>',
      explanation: 'A chat backend keeps the last N messages per conversation in an ArrayDeque, evicting the oldest once the cap is reached.',
      code:
`Map<String, ArrayDeque<Message>> messagesByConversation = new HashMap<>();

ArrayDeque<Message> buffer = messagesByConversation.computeIfAbsent(conversationId, id -> new ArrayDeque<>());
buffer.addLast(newMessage);
if (buffer.size() > 200) buffer.removeFirst();`,
    },
  ],

  bestPractices: [
    'Default to ArrayDeque over Stack or LinkedList for any new stack/queue code — it is faster and more memory-efficient with an equivalent API.',
    'Program against the Deque interface type, not the concrete ArrayDeque class, in fields and method signatures.',
    'Remember null is disallowed — use Optional or a dedicated sentinel object if "no value" needs to be represented in elements.',
    'Pre-size with an appropriate initial capacity when the expected size is roughly known to avoid repeated doubling.',
  ],

  commonMistakes: [
    {
      mistake: 'Calling addFirst(null) or offer(null) on an ArrayDeque.',
      why: 'ArrayDeque reserves null as the poll()/peek() "empty" sentinel and rejects null elements outright with NullPointerException.',
      fix: 'Wrap values that may be absent in Optional, or use a dedicated sentinel object instead of null.',
    },
    {
      mistake: 'Using ArrayDeque.get(index) expecting List-style random access.',
      why: 'ArrayDeque does not implement List and has no get(index) method at all — it is purpose-built for head/tail access only.',
      fix: 'Use ArrayList (or an explicit iterator/stream) if positional/random access is genuinely needed.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'ArrayDeque', 'LinkedList', 'Stack (legacy)'],
    rows: [
      ['Backing structure', 'Circular resizable array', 'Doubly linked nodes', 'Resizable array (via Vector)'],
      ['addFirst/removeFirst', 'O(1) amortized', 'O(1)', 'Not directly supported'],
      ['Synchronized', 'No', 'No', 'Yes (inherited from Vector)'],
      ['Allows null', 'No', 'Yes', 'Yes'],
      ['JDK recommendation', 'Preferred modern choice', 'Acceptable, but usually slower', 'Legacy, avoid for new code'],
    ],
  },

  diagrams: [
    {
      title: 'Circular array with wrap-around head/tail',
      caption: 'addFirst() decrements head with wrap-around; addLast() increments tail with wrap-around — both O(1), no shifting.',
      render: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <DiagramBox label="D" tone="green" sub="head" index={0} />
            <DiagramBox label="E" tone="brand" index={1} />
            <DiagramBox label="" tone="dashed" index={2} />
            <DiagramBox label="" tone="dashed" index={3} />
            <DiagramBox label="B" tone="brand" index={4} />
            <DiagramBox label="C" tone="brand" index={5} />
            <DiagramBox label="A" tone="amber" sub="tail wrapped here" index={6} />
          </div>
          <p className="text-xs text-slate-400">Logical order (head to tail): D, E, ..., B, C, A — physically wrapped around the array.</p>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does the JDK recommend ArrayDeque as a replacement for?', options: ['HashMap', 'Both Stack and LinkedList (for stack/queue use)', 'ArrayList only', 'TreeSet'], answerIndex: 1, explanation: 'The JDK documentation recommends ArrayDeque over Stack and over using LinkedList as a queue/stack.' },
    { question: 'Does ArrayDeque permit null elements?', options: ['Yes, one null', 'Yes, unlimited', 'No, it throws NullPointerException', 'Only if constructed with a capacity'], answerIndex: 2, explanation: 'ArrayDeque reserves null for the "empty" sentinel of poll()/peek() and rejects null elements.' },
    { question: 'Why must ArrayDeque\'s capacity be a power of two?', options: ['To simplify serialization', 'So wrap-around index arithmetic can use a fast bitmask instead of modulo', 'It is required by the Deque interface', 'To guarantee sorted iteration'], answerIndex: 1, explanation: 'Wrap-around via bitmask (`& (capacity - 1)`) only works correctly when capacity is a power of two.' },
    { question: 'What is the time complexity of ArrayDeque.addFirst(e)?', options: ['O(n)', 'O(log n)', 'O(1) amortized', 'O(n^2)'], answerIndex: 2, explanation: 'It only touches the wrap-around head index and writes one slot — no shifting of other elements is needed.' },
  ],
};
