/* ==========================================================================
   CONTENT: LinkedBlockingQueue
   ========================================================================== */

CollectionsContent['linkedblockingqueue'] = {

  overview: {
    paragraphs: [
      'LinkedBlockingQueue (Java 5) is a linked-node BlockingQueue: optionally bounded (unbounded by default, effectively Integer.MAX_VALUE capacity), offering put() that blocks when full and take() that blocks when empty — the classic building block for producer-consumer thread coordination.',
      'Its standout implementation detail is using two separate locks — one guarding the head (for take()/poll()) and one guarding the tail (for put()/offer()) — so a producer and a consumer can operate fully concurrently without contending for the same lock, unlike ArrayBlockingQueue\'s single shared lock.',
      'It is, notably, the default work queue used internally by several java.util.concurrent.Executors factory methods (e.g. newFixedThreadPool), making it one of the most-used-without-realizing-it classes in concurrent Java applications.',
    ],
    keyPoints: [
      'Optionally bounded (default capacity Integer.MAX_VALUE, effectively unbounded unless a capacity is specified).',
      'Two-lock design: a putLock and a takeLock allow concurrent put() and take() without contending for the same lock.',
      'put()/take() block; offer()/poll() have timeout variants and non-blocking forms.',
      'FIFO ordering; does not permit null elements.',
      'The default work queue for several Executors factory methods, including newFixedThreadPool.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'The queue is a singly-linked list of nodes, with the head and tail protected by two independent ReentrantLocks (takeLock and putLock respectively), each paired with its own Condition (notEmpty for takeLock, notFull for putLock). An AtomicInteger tracks the current count so both sides can check capacity/emptiness without needing to acquire the other side\'s lock.',
      'put(e) acquires putLock, blocks on the notFull condition if the queue is at capacity, otherwise links the new node at the tail and signals notEmpty (waking a blocked take() if one is waiting) — critically, this can all happen while a concurrent take() holds takeLock and is simultaneously unlinking from the head, since the two operations touch different ends and different locks.',
      'take() is the mirror image: acquires takeLock, blocks on notEmpty if the queue is empty, otherwise unlinks the head node and signals notFull.',
    ],
  },

  complexity: [
    { operation: 'put(e) / take()', average: 'O(1)', worst: 'O(1) (plus blocking wait time)', space: 'O(1)', notes: 'Lock acquisition is per-side (put or take), not shared, so concurrent put+take do not contend.' },
    { operation: 'offer(e, timeout) / poll(timeout)', average: 'O(1)', worst: 'O(1) (plus bounded wait time)', space: 'O(1)', notes: 'Timed variants return after the timeout instead of blocking forever.' },
    { operation: 'size()', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Maintained via an AtomicInteger, unlike ConcurrentLinkedQueue\'s O(n) size().' },
    { operation: 'drainTo(collection)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Bulk-transfers all currently available elements in one lock acquisition — much cheaper than n individual poll() calls.' },
  ],

  memory: {
    paragraphs: [
      'Node overhead is comparable to LinkedList\'s, plus the fixed cost of the two ReentrantLock/Condition pairs and the AtomicInteger count — a small, constant overhead per queue instance (not per element).',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Fully thread-safe, purpose-built for concurrent producer-consumer usage. The two-lock design specifically allows a producer and a consumer to make progress simultaneously without blocking each other, which is the key throughput advantage over ArrayBlockingQueue\'s single shared lock under mixed put/take workloads.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iterators are weakly consistent, never throwing ConcurrentModificationException, consistent with the rest of the java.util.concurrent queue family.',
    ],
  },

  ordering: {
    paragraphs: [
      'Strict FIFO ordering.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Does not permit null elements; put(null)/offer(null) throw NullPointerException.',
    ],
  },

  useCases: [
    { title: 'Classic producer-consumer thread pools', description: 'Buffering work between producer threads and a pool of worker/consumer threads, with backpressure if bounded.' },
    { title: 'Default ExecutorService work queues', description: 'Executors.newFixedThreadPool() and newSingleThreadExecutor() use an unbounded LinkedBlockingQueue internally by default.' },
    { title: 'Bounded pipelines needing backpressure', description: 'Constructing with an explicit capacity makes put() block (applying natural backpressure) once downstream consumers cannot keep up.' },
    { title: 'Batch draining via drainTo()', description: 'Efficiently pulling all currently-available elements in one call for batch processing, rather than looping poll().' },
  ],

  springBootExamples: [
    {
      title: 'Bounded producer-consumer pipeline for order processing',
      description: 'An order-ingestion service applies backpressure via a bounded LinkedBlockingQueue, so a slow downstream processor naturally throttles the upstream producer instead of causing unbounded memory growth.',
      code:
`@Component
public class OrderProcessingPipeline {

    private final BlockingQueue<Order> pending = new LinkedBlockingQueue<>(1000); // bounded

    public void submit(Order order) throws InterruptedException {
        pending.put(order); // blocks (applies backpressure) once 1000 orders are queued
    }

    @Scheduled(fixedDelay = 50)
    public void processNext() throws InterruptedException {
        Order order = pending.poll(200, TimeUnit.MILLISECONDS);
        if (order != null) processOrder(order);
    }

    private void processOrder(Order order) { /* ... */ }
}`,
    },
    {
      title: 'Batch draining for efficient bulk database writes',
      description: 'A logging pipeline accumulates log entries in a LinkedBlockingQueue and periodically drains the whole batch in one call for an efficient bulk insert.',
      code:
`@Component
public class BatchedLogWriter {

    private final BlockingQueue<LogEntry> queue = new LinkedBlockingQueue<>();

    public void log(LogEntry entry) {
        queue.offer(entry);
    }

    @Scheduled(fixedDelay = 1000)
    public void flush() {
        List<LogEntry> batch = new ArrayList<>();
        queue.drainTo(batch, 500); // pull up to 500 entries in one lock acquisition
        if (!batch.isEmpty()) logRepository.saveAll(batch);
    }

    private final LogRepository logRepository;
    public BatchedLogWriter(LogRepository logRepository) { this.logRepository = logRepository; }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why does LinkedBlockingQueue use two separate locks instead of one?', difficulty: 'Advanced', answer: 'Because put() only ever touches the tail and take() only ever touches the head, using independent putLock/takeLock (each with its own Condition) lets a producer and a consumer proceed fully concurrently without contending for the same lock — improving throughput over a single-lock design like ArrayBlockingQueue\'s under mixed put/take workloads.' },
    { question: 'What is the default capacity of a LinkedBlockingQueue constructed with no arguments?', difficulty: 'Beginner', answer: 'Integer.MAX_VALUE — effectively unbounded. This matters because an unbounded queue used as a work queue can hide a slow consumer behind unbounded memory growth rather than surfacing backpressure.' },
    { question: 'Which built-in ExecutorService factory methods use LinkedBlockingQueue internally?', difficulty: 'Intermediate', answer: 'Executors.newFixedThreadPool() and Executors.newSingleThreadExecutor() both use an unbounded LinkedBlockingQueue as their work queue by default — one reason these factories can accumulate unbounded pending tasks under sustained overload.' },
    { question: 'What does drainTo() provide that a loop of poll() calls does not?', difficulty: 'Intermediate', answer: 'It transfers all (or up to a given maximum number of) currently-available elements in a single lock acquisition, which is significantly cheaper than acquiring and releasing the lock once per element via repeated poll() calls.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Simple producer-consumer with LinkedBlockingQueue',
        statement: 'Have one producer thread put() items and one consumer thread take() them, demonstrating blocking behavior.',
        code:
`import java.util.concurrent.*;

public class SimpleProducerConsumer {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(5);

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    queue.put(i); // blocks if the queue is full (capacity 5)
                }
            } catch (InterruptedException ignored) {}
        });

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    System.out.println("Consumed: " + queue.take());
                }
            } catch (InterruptedException ignored) {}
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
    }
}`,
        output: 'Consumed: 1\nConsumed: 2\n... (through 10, in order)',
      },
    ],
    intermediate: [
      {
        title: 'Batch consumer using drainTo()',
        statement: 'Consume items in batches of up to 5 at a time using drainTo(), rather than one at a time.',
        code:
`import java.util.concurrent.*;
import java.util.*;

public class BatchConsumer {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new LinkedBlockingQueue<>();
        for (int i = 1; i <= 12; i++) {
            queue.offer("task-" + i);
        }

        List<String> batch = new ArrayList<>();
        while (!queue.isEmpty()) {
            batch.clear();
            queue.drainTo(batch, 5);
            System.out.println("Processing batch: " + batch);
        }
    }
}`,
        output: 'Processing batch: [task-1, task-2, task-3, task-4, task-5]\nProcessing batch: [task-6, task-7, task-8, task-9, task-10]\nProcessing batch: [task-11, task-12]',
      },
    ],
    advanced: [
      {
        title: 'Bounded thread pool with explicit backpressure',
        statement: 'Configure a ThreadPoolExecutor with a bounded LinkedBlockingQueue and observe how submit() behaves once the queue fills and the pool is saturated.',
        code:
`import java.util.concurrent.*;

public class BoundedExecutorDemo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Runnable> workQueue = new LinkedBlockingQueue<>(2); // small bound for demonstration
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            1, 1, 0L, TimeUnit.MILLISECONDS, workQueue,
            new ThreadPoolExecutor.AbortPolicy());

        try {
            for (int i = 1; i <= 5; i++) {
                int taskId = i;
                executor.submit(() -> {
                    try { Thread.sleep(200); } catch (InterruptedException ignored) {}
                    System.out.println("Ran task " + taskId);
                });
            }
        } catch (RejectedExecutionException e) {
            System.out.println("Rejected: queue and pool both saturated");
        }
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);
    }
}`,
        output: 'Ran task 1\nRan task 2\nRan task 3\nRejected: queue and pool both saturated',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Payment retry pipeline with bounded backlog',
      domain: 'Payments',
      description: 'A payment retry service buffers failed transactions for reprocessing in a bounded LinkedBlockingQueue, so a downstream outage naturally applies backpressure to the ingestion side rather than exhausting memory.',
      code:
`@Component
public class PaymentRetryPipeline {

    private final BlockingQueue<FailedPayment> retryQueue = new LinkedBlockingQueue<>(5000);

    public boolean scheduleRetry(FailedPayment payment) {
        return retryQueue.offer(payment); // non-blocking: false if backlog is already full
    }

    @Scheduled(fixedDelay = 200)
    public void processRetries() throws InterruptedException {
        FailedPayment payment = retryQueue.poll(100, TimeUnit.MILLISECONDS);
        if (payment != null) attemptReprocessing(payment);
    }

    private void attemptReprocessing(FailedPayment payment) { /* ... */ }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-priority-tier work queues: Map<String, LinkedBlockingQueue<Task>>',
      explanation: 'A multi-tenant task processor keeps a separate bounded queue per subscription tier, each drained by its own dedicated worker thread.',
      code:
`Map<String, LinkedBlockingQueue<Task>> queueByTier = new HashMap<>();

queueByTier.put("PREMIUM", new LinkedBlockingQueue<>(10_000));
queueByTier.put("STANDARD", new LinkedBlockingQueue<>(2_000));

queueByTier.get(task.tier()).put(task);`,
    },
  ],

  bestPractices: [
    'Always specify an explicit bounded capacity in production systems unless truly unbounded growth is acceptable — the default is effectively Integer.MAX_VALUE.',
    'Use drainTo() for batch consumption instead of a tight loop of individual poll() calls.',
    'Prefer the timed poll(timeout, unit)/offer(timeout, unit) variants over indefinite blocking when a consumer/producer needs to remain responsive to shutdown signals.',
    'Remember its two-lock design gives real throughput benefits under concurrent put+take — do not add unnecessary external synchronization around it.',
  ],

  commonMistakes: [
    {
      mistake: 'Using the default unbounded constructor for a production work queue.',
      why: 'An unbounded queue hides a slow consumer behind ever-growing memory usage instead of surfacing backpressure, risking an eventual OutOfMemoryError under sustained overload.',
      fix: 'Always specify an explicit, capacity-appropriate bound: `new LinkedBlockingQueue<>(capacity)`.',
    },
    {
      mistake: 'Calling take()/put() without handling InterruptedException properly (e.g. swallowing it silently).',
      why: 'Blocking methods can be interrupted as part of normal shutdown/cancellation; silently swallowing the exception can leave threads in an inconsistent state or prevent graceful shutdown.',
      fix: 'Either propagate the InterruptedException, or catch it, restore the interrupt flag (`Thread.currentThread().interrupt()`), and exit the loop/method cleanly.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'LinkedBlockingQueue', 'ArrayBlockingQueue', 'SynchronousQueue'],
    rows: [
      ['Locking', 'Two locks (put/take)', 'One shared lock', 'Lock-free hand-off (CAS-based)'],
      ['Default capacity', 'Unbounded (Integer.MAX_VALUE)', 'Must specify (required)', 'Zero (no storage at all)'],
      ['Backing structure', 'Linked nodes', 'Fixed-size circular array', 'No storage — direct hand-off'],
      ['Best for', 'General producer-consumer, optionally bounded', 'Strict fixed-memory bound', 'Direct thread-to-thread hand-off'],
    ],
  },

  diagrams: [
    {
      title: 'Two-lock design: put and take proceed independently',
      caption: 'A producer holding putLock and a consumer holding takeLock can both make progress at the same instant.',
      render: () => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-400">takeLock</span>
            <DiagramBox label="head" tone="green" sub="consumer" />
          </div>
          <DiagramArrow />
          <DiagramBox label="..." tone="slate" />
          <DiagramArrow />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-400">putLock</span>
            <DiagramBox label="tail" tone="brand" sub="producer" />
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'How many internal locks does LinkedBlockingQueue use?', options: ['None (lock-free)', 'One shared lock', 'Two — one for put, one for take', 'One per element'], answerIndex: 2, explanation: 'Its two-lock design lets a producer and a consumer proceed concurrently without contending for the same lock.' },
    { question: 'What is the default capacity if no bound is specified?', options: ['16', '1024', 'Integer.MAX_VALUE (effectively unbounded)', '0'], answerIndex: 2, explanation: 'Without an explicit capacity argument, the queue is effectively unbounded.' },
    { question: 'What does drainTo() provide over repeated poll() calls?', options: ['Sorted output', 'A single lock acquisition for a bulk transfer, instead of one per element', 'Guaranteed FIFO order (poll() does not guarantee this)', 'Thread-safety (poll() is not thread-safe)'], answerIndex: 1, explanation: 'drainTo() bulk-transfers available elements far more cheaply than looping individual poll() calls.' },
    { question: 'Which ExecutorService factory methods use LinkedBlockingQueue internally by default?', options: ['newCachedThreadPool only', 'newFixedThreadPool and newSingleThreadExecutor', 'newWorkStealingPool only', 'None — they all use ArrayBlockingQueue'], answerIndex: 1, explanation: 'Both use an unbounded LinkedBlockingQueue as their default work queue.' },
  ],
};
