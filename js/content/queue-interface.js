/* ==========================================================================
   CONTENT: Queue (interface)
   ========================================================================== */

CollectionsContent['queue-interface'] = {

  overview: {
    paragraphs: [
      'Queue was added in Java 5 as a Collection sub-interface specifically for holding elements prior to processing, with an implied FIFO (first-in-first-out) intent — though, importantly, the interface itself does not enforce any particular ordering. PriorityQueue (priority order) and Deque used as a stack (LIFO order via push/pop) are both legitimate Queue implementations that deliberately do not behave FIFO.',
      'Queue\'s defining API contribution is a set of methods that come in two flavors for the same three operations — insert, remove, examine — one flavor that throws an exception on failure and one that returns a special sentinel value instead. Knowing which flavor to reach for is one of the most practical, everyday pieces of Collections Framework knowledge.',
      'Deque (double-ended queue), covered in ArrayDeque\'s page, extends Queue with symmetric first/last operations and is the JDK-recommended choice for both stack and queue use cases today.',
    ],
    keyPoints: [
      'A Collection sub-interface for holding elements prior to processing; FIFO is the typical but not guaranteed ordering.',
      'Every core operation has two method forms: one throws an exception on failure (add/remove/element), one returns a sentinel value (offer/poll/peek).',
      'Most Queue implementations prohibit null elements, because poll()/peek() use null as the "queue is empty" sentinel.',
      'Concrete implementations range from simple (ArrayDeque, LinkedList) to priority-ordered (PriorityQueue) to fully concurrent/blocking (the java.util.concurrent queue family).',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Queue has no internal working of its own — it is a pure interface. What matters practically is its two-methods-per-operation design: add(e)/remove()/element() throw (IllegalStateException, NoSuchElementException, NoSuchElementException respectively) on failure, while offer(e)/poll()/peek() instead return false/null/null.',
      'This dual API exists because a queue can legitimately be full (for bounded implementations) or empty, and different callers want different failure-handling styles — a batch job that considers a full queue a bug might prefer add() throwing loudly, while a polling worker loop treats an empty queue as completely routine and prefers poll() returning null.',
    ],
  },

  complexity: [
    { operation: 'offer(e) / poll() / peek()', average: 'Implementation-defined', worst: 'Implementation-defined', space: 'Implementation-defined', notes: 'See each concrete implementation\'s own page for exact guarantees.' },
  ],

  memory: {
    paragraphs: [
      'Memory characteristics are entirely determined by the concrete implementation chosen — see ArrayDeque (compact array), LinkedList (node overhead), or the java.util.concurrent family (varying lock/CAS bookkeeping) for specifics.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Not specified by the interface — ArrayDeque, LinkedList, and PriorityQueue are all unsynchronized; the java.util.concurrent BlockingQueue implementations are fully thread-safe by design and add put()/take() methods that block rather than fail when the queue is full/empty.',
    ],
  },

  iteration: {
    paragraphs: [
      'Not specified by the interface — fail-fast for the non-concurrent implementations, weakly consistent (never throwing ConcurrentModificationException) for the java.util.concurrent implementations.',
    ],
  },

  ordering: {
    paragraphs: [
      'The interface documentation describes Queue implementations as "typically, but not necessarily," FIFO — PriorityQueue orders by priority and a Deque used via push()/pop() behaves LIFO, both while still satisfying the Queue contract.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Most Queue implementations prohibit null elements specifically because poll() and peek() use a null return value to unambiguously signal "the queue is empty." LinkedList is the one notable JDK exception (it permits null, inherited from its List heritage), which is precisely why the JDK recommends ArrayDeque over LinkedList for Queue/Deque use — to keep that sentinel convention meaningful.',
    ],
  },

  useCases: [
    { title: 'Task/work queues', description: 'Buffering units of work between a producer and one or more consumer threads or processes.' },
    { title: 'Breadth-first search and level-order traversal', description: 'The standard FIFO queue is the core data structure behind BFS on graphs and trees.' },
    { title: 'Rate-limited or batched processing', description: 'Accumulating items to be drained and processed in batches via drainTo() (on BlockingQueue implementations).' },
    { title: 'Modeling real-world waiting lines', description: 'Ticketing systems, print queues, call-center queues — anywhere "first come, first served" (or a well-defined priority) is the actual business rule.' },
  ],

  springBootExamples: [
    {
      title: 'Programming against the Queue interface, not a concrete implementation',
      description: 'A background job dispatcher declares its field as Queue<Job>, letting the concrete implementation (ArrayDeque here) be swapped later without touching calling code.',
      code:
`@Service
public class JobDispatcher {

    private final Queue<Job> pendingJobs = new ArrayDeque<>();

    public void submit(Job job) {
        if (!pendingJobs.offer(job)) {
            throw new IllegalStateException("Job queue rejected the job unexpectedly");
        }
    }

    public Optional<Job> nextJob() {
        return Optional.ofNullable(pendingJobs.poll());
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What is the difference between add() and offer() on a Queue?', difficulty: 'Beginner', answer: 'Both attempt to insert an element. add() throws an exception (typically IllegalStateException) if the insertion fails (e.g. the queue is at capacity); offer() instead returns false. Prefer offer() when a full queue is an expected, routine condition rather than a bug.' },
    { question: 'What is the difference between remove()/poll() and element()/peek()?', difficulty: 'Beginner', answer: 'remove() and poll() both remove and return the head of the queue, but remove() throws NoSuchElementException on an empty queue while poll() returns null. element() and peek() do the same thing but WITHOUT removing the head — element() throws, peek() returns null.' },
    { question: 'Is a Queue always FIFO?', difficulty: 'Intermediate', answer: 'No — the interface documentation explicitly says ordering is "typically, but not necessarily" FIFO. PriorityQueue orders by priority, and Deque implementations used via push()/pop() behave as a LIFO stack, while both still satisfy the Queue contract.' },
    { question: 'Why do most Queue implementations disallow null elements?', difficulty: 'Intermediate', answer: 'poll() and peek() use a null return value as the unambiguous signal that the queue is empty. If null were also a valid element, callers could not distinguish "the queue is empty" from "the head element happens to be null" without an extra isEmpty() check every time.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Breadth-first traversal of a simple graph',
        statement: 'Given an adjacency list graph, print nodes in breadth-first order starting from a given node, using a Queue.',
        code:
`import java.util.*;

public class BfsTraversal {
    public static void bfs(Map<String, List<String>> graph, String start) {
        Queue<String> queue = new ArrayDeque<>();
        Set<String> visited = new HashSet<>();

        queue.offer(start);
        visited.add(start);

        while (!queue.isEmpty()) {
            String node = queue.poll();
            System.out.println(node);
            for (String neighbor : graph.getOrDefault(node, List.of())) {
                if (visited.add(neighbor)) {
                    queue.offer(neighbor);
                }
            }
        }
    }

    public static void main(String[] args) {
        Map<String, List<String>> graph = Map.of(
            "A", List.of("B", "C"),
            "B", List.of("D"),
            "C", List.of("D"),
            "D", List.of()
        );
        bfs(graph, "A");
    }
}`,
        output: 'A\nB\nC\nD',
      },
    ],
    intermediate: [
      {
        title: 'Implement a Queue using two Stacks',
        statement: 'Implement FIFO queue semantics using only two Deque-as-stack instances, amortized O(1) per operation.',
        code:
`import java.util.*;

public class QueueViaTwoStacks<T> {
    private final Deque<T> inbox = new ArrayDeque<>();
    private final Deque<T> outbox = new ArrayDeque<>();

    public void enqueue(T item) {
        inbox.push(item);
    }

    public T dequeue() {
        if (outbox.isEmpty()) {
            while (!inbox.isEmpty()) {
                outbox.push(inbox.pop());
            }
        }
        if (outbox.isEmpty()) throw new NoSuchElementException("Queue is empty");
        return outbox.pop();
    }

    public static void main(String[] args) {
        QueueViaTwoStacks<Integer> queue = new QueueViaTwoStacks<>();
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        System.out.println(queue.dequeue());
        System.out.println(queue.dequeue());
        queue.enqueue(4);
        System.out.println(queue.dequeue());
        System.out.println(queue.dequeue());
    }
}`,
        output: '1\n2\n3\n4',
      },
    ],
    advanced: [
      {
        title: 'Josephus problem using a Queue simulation',
        statement: 'N people stand in a circle; every k-th person is eliminated until one remains. Simulate this using a Queue.',
        code:
`import java.util.*;

public class JosephusProblem {
    public static int lastRemaining(int n, int k) {
        Queue<Integer> circle = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) circle.offer(i);

        while (circle.size() > 1) {
            for (int i = 1; i < k; i++) {
                circle.offer(circle.poll()); // rotate k-1 people to the back
            }
            circle.poll(); // eliminate the k-th person
        }
        return circle.poll();
    }

    public static void main(String[] args) {
        System.out.println(lastRemaining(7, 3));
    }
}`,
        output: '4',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Print-job queue abstraction for a hospital records printing service',
      domain: 'Healthcare',
      description: 'A print service exposes a Queue<PrintJob> so callers can enqueue jobs without knowing (or caring) whether the concrete implementation is a plain ArrayDeque or a full BlockingQueue, keeping the door open to add concurrency later without an API change.',
      code:
`public class PrintJobService {

    private final Queue<PrintJob> jobQueue;

    public PrintJobService(Queue<PrintJob> jobQueue) {
        this.jobQueue = jobQueue; // could be ArrayDeque today, LinkedBlockingQueue tomorrow
    }

    public void submit(PrintJob job) {
        if (!jobQueue.offer(job)) {
            throw new IllegalStateException("Print queue is full");
        }
    }

    public void processNext() {
        PrintJob job = jobQueue.poll();
        if (job != null) job.print();
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-worker task queues: Map<String, Queue<Task>>',
      explanation: 'A simple work-distribution system keeps a separate Queue per worker ID, letting each worker drain its own backlog independently.',
      code:
`Map<String, Queue<Task>> taskQueueByWorker = new HashMap<>();

taskQueueByWorker.computeIfAbsent(workerId, id -> new ArrayDeque<>()).offer(task);`,
    },
  ],

  bestPractices: [
    'Prefer offer()/poll()/peek() over add()/remove()/element() unless a full/empty queue truly represents an unrecoverable bug in your program.',
    'Program against the Queue (or Deque) interface type in fields, parameters, and return types — reserve the concrete class for the construction site.',
    'Choose the concrete implementation based on your actual requirements: ArrayDeque for plain unsynchronized FIFO/LIFO, PriorityQueue for priority order, a BlockingQueue implementation for producer-consumer concurrency.',
    'Remember that "Queue" does not promise FIFO — check the specific implementation\'s documented ordering before relying on it.',
  ],

  commonMistakes: [
    {
      mistake: 'Mixing add()/remove() with poll()/peek() inconsistently in the same code path.',
      why: 'It obscures whether a full/empty queue is treated as an exceptional condition or a routine one, making error handling inconsistent and confusing to read.',
      fix: 'Pick one flavor per use site based on whether failure is exceptional (add/remove/element) or routine (offer/poll/peek), and stick with it.',
    },
    {
      mistake: 'Assuming every Queue implementation is FIFO.',
      why: 'PriorityQueue orders by priority, and a Deque used via push()/pop() behaves LIFO — both are still valid Queue implementations.',
      fix: 'Check the specific implementation\'s documented ordering before writing logic that depends on it.',
    },
  ],

  comparisonTable: {
    headers: ['Implementation', 'Ordering', 'Bounded?', 'Blocking?', 'Null allowed?'],
    rows: [
      ['ArrayDeque', 'Insertion (FIFO) or LIFO via push/pop', 'No (grows as needed)', 'No', 'No'],
      ['LinkedList', 'Insertion (FIFO) or LIFO', 'No', 'No', 'Yes'],
      ['PriorityQueue', 'Priority order (head only)', 'No', 'No', 'No'],
      ['ConcurrentLinkedQueue', 'FIFO', 'No', 'No (non-blocking)', 'No'],
      ['LinkedBlockingQueue', 'FIFO', 'Optional', 'Yes', 'No'],
      ['ArrayBlockingQueue', 'FIFO', 'Yes (required)', 'Yes', 'No'],
      ['PriorityBlockingQueue', 'Priority order (head only)', 'No', 'Yes (take only)', 'No'],
      ['DelayQueue', 'By delay expiration', 'No', 'Yes (take only)', 'No'],
      ['SynchronousQueue', 'N/A (direct hand-off, holds nothing)', 'Zero capacity', 'Yes', 'No'],
    ],
  },

  diagrams: [
    {
      title: 'The exception-vs-sentinel method pairing',
      caption: 'Every core Queue operation has a throwing form and a sentinel-returning form.',
      render: () => (
        <div className="flex flex-col gap-2 font-mono-code text-sm">
          <div className="flex items-center gap-4"><span className="w-24 text-slate-400">Insert</span><DiagramBox label="add(e)" tone="rose" sub="throws" /><DiagramBox label="offer(e)" tone="green" sub="returns false" /></div>
          <div className="flex items-center gap-4"><span className="w-24 text-slate-400">Remove</span><DiagramBox label="remove()" tone="rose" sub="throws" /><DiagramBox label="poll()" tone="green" sub="returns null" /></div>
          <div className="flex items-center gap-4"><span className="w-24 text-slate-400">Examine</span><DiagramBox label="element()" tone="rose" sub="throws" /><DiagramBox label="peek()" tone="green" sub="returns null" /></div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does offer() return if the queue cannot accept the element?', options: ['Throws an exception', 'null', 'false', 'The element itself'], answerIndex: 2, explanation: 'offer() is the non-throwing insertion form and returns false on failure.' },
    { question: 'What does poll() return on an empty queue?', options: ['Throws NoSuchElementException', 'null', 'false', '0'], answerIndex: 1, explanation: 'poll() is the non-throwing removal form and returns null when the queue is empty.' },
    { question: 'Is Queue guaranteed to be FIFO?', options: ['Yes, always', 'No — PriorityQueue and Deque-as-stack are valid non-FIFO Queue implementations', 'Only for concurrent implementations', 'Only if constructed with an initial capacity'], answerIndex: 1, explanation: 'The interface documents ordering as "typically, but not necessarily" FIFO.' },
    { question: 'Why do most Queue implementations disallow null elements?', options: ['Null cannot be serialized', 'poll()/peek() use null to signal "empty"', 'It would break hashCode()', 'JVM limitation'], answerIndex: 1, explanation: 'Allowing null elements would make it impossible to distinguish "empty queue" from "head element is null" via the sentinel-return methods.' },
  ],
};
