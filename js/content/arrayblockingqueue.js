/* ==========================================================================
   CONTENT: ArrayBlockingQueue
   ========================================================================== */

CollectionsContent['arrayblockingqueue'] = {

  overview: {
    paragraphs: [
      'ArrayBlockingQueue (Java 5) is a fixed-capacity, array-backed BlockingQueue — the capacity MUST be specified at construction time and can never grow, making it the right choice whenever you need a hard, predictable memory bound on a producer-consumer buffer.',
      'Unlike LinkedBlockingQueue\'s two-lock design, ArrayBlockingQueue uses a single ReentrantLock shared by both put() and take(), paired with two Conditions (notEmpty and notFull) — simpler, and with a smaller memory footprint per element (no per-node objects), but with producers and consumers contending for the same lock.',
      'It also optionally supports a "fair" ordering mode, guaranteeing that threads blocked waiting to put()/take() are served in the order they started waiting (FIFO among waiters) — at the cost of typically lower overall throughput compared to the default unfair mode.',
    ],
    keyPoints: [
      'Fixed capacity, specified at construction — never grows, applying a strict memory bound.',
      'Single shared lock (not two, unlike LinkedBlockingQueue) guarding both put() and take().',
      'Optional "fair" constructor flag orders waiting threads FIFO, at some throughput cost.',
      'FIFO ordering of elements; does not permit null elements.',
      'The most memory-compact BlockingQueue implementation, since it uses a plain circular array with no per-element node objects.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'The backing store is a plain circular Object[] array of the fixed capacity given at construction, with `takeIndex` and `putIndex` cursors that wrap around using modulo arithmetic (similar in spirit to ArrayDeque\'s circular buffer, though ArrayBlockingQueue does not require a power-of-two capacity since it uses true modulo rather than a bitmask).',
      'A single ReentrantLock guards all state; put() blocks on the notFull Condition when count == capacity, and take() blocks on the notEmpty Condition when count == 0. Because both operations share one lock, only one of put()/take() can actually be executing its critical section at any instant, even though conceptually they touch different ends of the array.',
      'The optional "fair" constructor argument (`new ArrayBlockingQueue<>(capacity, true)`) configures the underlying ReentrantLock in fair mode, which grants the lock to the longest-waiting thread first — reducing the risk of thread starvation under heavy contention, at a real throughput cost versus the default (unfair) mode.',
    ],
  },

  complexity: [
    { operation: 'put(e) / take()', average: 'O(1)', worst: 'O(1) (plus blocking wait time)', space: 'O(1)', notes: 'Single shared lock — put and take always contend with each other, unlike LinkedBlockingQueue.' },
    { operation: 'offer(e, timeout) / poll(timeout)', average: 'O(1)', worst: 'O(1) (plus bounded wait time)', space: 'O(1)', notes: 'Timed variants return after the timeout rather than blocking forever.' },
    { operation: 'size()', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Maintained as a simple counter guarded by the shared lock.' },
  ],

  memory: {
    paragraphs: [
      'The most memory-compact of the blocking queues: a single fixed-size Object[] array with no per-element wrapper/node objects at all, plus the fixed overhead of one lock and two conditions for the whole queue instance.',
    ],
    points: [
      'Because capacity is fixed forever, memory usage for the queue itself is entirely predictable at construction time — useful for systems with strict memory budgets.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Fully thread-safe. The single-lock design is simpler to reason about than LinkedBlockingQueue\'s two-lock split, at the cost of producers and consumers always contending for the same lock rather than proceeding fully independently.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iterators are weakly consistent, consistent with the rest of the java.util.concurrent queue family, never throwing ConcurrentModificationException.',
    ],
  },

  ordering: {
    paragraphs: [
      'Strict FIFO ordering of elements. The optional fairness flag additionally governs the order in which BLOCKED THREADS are granted access when multiple are waiting — a distinct concept from element ordering.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Does not permit null elements; put(null)/offer(null) throw NullPointerException.',
    ],
  },

  useCases: [
    { title: 'Strictly bounded producer-consumer buffers', description: 'When a hard, predictable memory ceiling matters more than maximum possible throughput.' },
    { title: 'Rate-limiting / backpressure enforcement', description: 'A fixed capacity naturally throttles producers once consumers fall behind, without any additional rate-limiting logic.' },
    { title: 'Bounded thread pool work queues', description: 'ThreadPoolExecutor configured with an ArrayBlockingQueue gives predictable, bounded memory usage for pending tasks (paired with an appropriate RejectedExecutionHandler for overflow).' },
  ],

  springBootExamples: [
    {
      title: 'Bounded task executor configuration',
      description: 'A Spring async task executor is explicitly bounded with ArrayBlockingQueue to guarantee the application never accumulates unbounded pending work under sustained load.',
      code:
`@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public Executor taskExecutor() {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            4, 8, 60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(200), // hard, predictable bound
            new ThreadPoolExecutor.CallerRunsPolicy() // apply backpressure to the caller on overflow
        );
        return executor;
    }
}`,
    },
    {
      title: 'Strictly bounded ingestion buffer for order intake',
      description: 'A checkout service rejects new orders outright (rather than queuing indefinitely) once its bounded ArrayBlockingQueue is full, protecting downstream systems from overload.',
      code:
`@Service
public class OrderIntakeBuffer {

    private final BlockingQueue<Order> buffer = new ArrayBlockingQueue<>(500);

    public boolean accept(Order order) {
        return buffer.offer(order); // false immediately if the buffer is already full
    }

    public Order nextOrThrow() throws InterruptedException {
        return buffer.poll(2, TimeUnit.SECONDS);
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What must you always specify when constructing an ArrayBlockingQueue, unlike LinkedBlockingQueue?', difficulty: 'Beginner', answer: 'A fixed capacity — there is no no-argument constructor, and unlike LinkedBlockingQueue there is no default/unbounded option; the capacity is required and can never change afterward.' },
    { question: 'How many locks does ArrayBlockingQueue use, and how does that compare to LinkedBlockingQueue?', difficulty: 'Intermediate', answer: 'One single shared ReentrantLock for both put() and take(), versus LinkedBlockingQueue\'s two independent locks. This makes ArrayBlockingQueue simpler and more memory-compact, but producers and consumers always contend for the same lock rather than proceeding fully in parallel.' },
    { question: 'What does the "fair" constructor argument do, and what is its cost?', difficulty: 'Advanced', answer: 'It configures the underlying lock in fair mode, granting access to the longest-waiting thread first among those blocked on put()/take() — reducing starvation risk under contention, at the cost of typically lower overall throughput than the default unfair mode.' },
    { question: 'Why might you choose ArrayBlockingQueue over LinkedBlockingQueue for a thread pool\'s work queue?', difficulty: 'Intermediate', answer: 'When a hard, predictable memory bound matters more than maximizing put/take throughput — its fixed array has no per-element node allocation overhead and its capacity can never silently grow.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Bounded queue blocking behavior',
        statement: 'Demonstrate that put() blocks once an ArrayBlockingQueue reaches its fixed capacity, until a take() frees a slot.',
        code:
`import java.util.concurrent.*;

public class BoundedQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        queue.put(1);
        queue.put(2);
        System.out.println("Queue full, size=" + queue.size());

        Thread producer = new Thread(() -> {
            try {
                queue.put(3); // blocks until a slot frees up
                System.out.println("Producer added 3 after a slot freed");
            } catch (InterruptedException ignored) {}
        });
        producer.start();

        Thread.sleep(200);
        System.out.println("Consumed: " + queue.take()); // frees a slot, unblocking the producer
        producer.join();
    }
}`,
        output: 'Queue full, size=2\nConsumed: 1\nProducer added 3 after a slot freed',
      },
    ],
    intermediate: [
      {
        title: 'Fair vs unfair ordering demonstration',
        statement: 'Illustrate constructing a fair ArrayBlockingQueue and explain when you would choose it over the default.',
        code:
`import java.util.concurrent.*;

public class FairQueueDemo {
    public static void main(String[] args) {
        // Fair mode: threads that have been waiting longest are served first
        BlockingQueue<String> fairQueue = new ArrayBlockingQueue<>(10, true);

        // Default (unfair) mode: generally higher throughput, no waiting-order guarantee
        BlockingQueue<String> defaultQueue = new ArrayBlockingQueue<>(10);

        System.out.println("Use fair=true when starvation risk under heavy contention matters more than raw throughput.");
    }
}`,
        output: 'Use fair=true when starvation risk under heavy contention matters more than raw throughput.',
      },
    ],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Fixed-memory transaction buffer for a banking core system',
      domain: 'Banking',
      description: 'A core-banking batch ingestion component uses a strictly bounded ArrayBlockingQueue to guarantee a hard, auditable memory ceiling for in-flight transactions, rejecting new submissions outright once full rather than risking unbounded memory growth.',
      code:
`public class TransactionIngestionBuffer {

    private final BlockingQueue<Transaction> buffer = new ArrayBlockingQueue<>(10_000);

    public boolean submit(Transaction transaction) {
        return buffer.offer(transaction); // strict, predictable capacity ceiling
    }

    public Transaction takeNext() throws InterruptedException {
        return buffer.take();
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-shard bounded buffers: Map<Integer, ArrayBlockingQueue<Event>>',
      explanation: 'A sharded event processor keeps one fixed-capacity buffer per shard, each consumed by exactly one dedicated worker thread for strict ordering within a shard.',
      code:
`Map<Integer, BlockingQueue<Event>> queueByShard = new HashMap<>();
for (int shard = 0; shard < shardCount; shard++) {
    queueByShard.put(shard, new ArrayBlockingQueue<>(1000));
}

queueByShard.get(event.shardId() % shardCount).put(event);`,
    },
  ],

  bestPractices: [
    'Choose ArrayBlockingQueue when a strict, predictable memory bound matters more than maximum put/take throughput.',
    'Use the fair constructor argument only when starvation among many contending threads is a genuine, observed problem — it costs real throughput.',
    'Pair it with an appropriate RejectedExecutionHandler when used as a ThreadPoolExecutor work queue, since put()/offer() failing must be handled deliberately.',
    'Prefer LinkedBlockingQueue when you specifically need independent producer/consumer lock paths for higher mixed-workload throughput.',
  ],

  commonMistakes: [
    {
      mistake: 'Assuming ArrayBlockingQueue can grow if constructed with a capacity that turns out to be too small.',
      why: 'Its capacity is fixed forever at construction — there is no resize operation, unlike ArrayList or ArrayDeque.',
      fix: 'Size it generously based on realistic load testing, or choose LinkedBlockingQueue (optionally bounded) if flexibility is more valuable than a hard memory guarantee.',
    },
    {
      mistake: 'Enabling fair mode by default "just to be safe" without measuring the throughput impact.',
      why: 'Fair mode trades meaningful throughput for starvation avoidance — most workloads never actually experience starvation and pay the cost for nothing.',
      fix: 'Use the default (unfair) mode unless you have concrete evidence of thread starvation under your actual contention patterns.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'ArrayBlockingQueue', 'LinkedBlockingQueue', 'PriorityBlockingQueue'],
    rows: [
      ['Capacity', 'Fixed, required at construction', 'Optional bound (unbounded by default)', 'Unbounded'],
      ['Locking', 'Single shared lock', 'Two locks (put/take)', 'Single lock guarding the heap'],
      ['Ordering', 'FIFO', 'FIFO', 'Priority order (head only)'],
      ['Fairness option', 'Yes (constructor flag)', 'No', 'No'],
    ],
  },

  diagrams: [
    {
      title: 'Fixed-capacity circular array, single shared lock',
      caption: 'Both put() and take() must acquire the same lock, unlike LinkedBlockingQueue\'s independent put/take locks.',
      render: () => (
        <div className="flex items-center gap-2">
          <DiagramBox label="A" tone="brand" sub="takeIndex" index={0} />
          <DiagramBox label="B" tone="brand" index={1} />
          <DiagramBox label="C" tone="brand" index={2} />
          <DiagramBox label="" tone="dashed" sub="putIndex" index={3} />
          <span className="text-xs text-slate-400 ml-2">capacity = 4 (fixed forever)</span>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'Can ArrayBlockingQueue grow beyond its constructed capacity?', options: ['Yes, it doubles like ArrayList', 'No, capacity is fixed forever', 'Yes, but only by a fixed increment', 'Only in fair mode'], answerIndex: 1, explanation: 'Its capacity is set once at construction and never changes.' },
    { question: 'How many locks does ArrayBlockingQueue use for put/take?', options: ['None — lock-free', 'Two, like LinkedBlockingQueue', 'One shared lock', 'One per element'], answerIndex: 2, explanation: 'A single ReentrantLock guards both put() and take(), unlike LinkedBlockingQueue\'s two-lock design.' },
    { question: 'What does constructing with fair=true guarantee?', options: ['Elements are sorted', 'Waiting threads are served in the order they began waiting', 'Higher throughput', 'Null elements are allowed'], answerIndex: 1, explanation: 'Fair mode reduces starvation risk by granting the lock to the longest-waiting thread first, at some throughput cost.' },
    { question: 'Why is ArrayBlockingQueue generally more memory-compact than LinkedBlockingQueue?', options: ['It uses fewer locks', 'It stores elements directly in a flat array with no per-element node objects', 'It compresses elements', 'It does not store elements at all'], answerIndex: 1, explanation: 'A plain fixed-size array avoids the per-node allocation overhead of a linked structure.' },
  ],
};
