/* ==========================================================================
   CONTENT: SynchronousQueue
   ========================================================================== */

CollectionsContent['synchronousqueue'] = {

  overview: {
    paragraphs: [
      'SynchronousQueue (Java 5) is the strangest member of the BlockingQueue family: it has zero capacity and holds no elements at all. Every put() must be matched by a concurrently-waiting take() (or vice versa) — the element is handed directly from the producing thread to the consuming thread, with no buffering step in between.',
      'If no thread is waiting to take() when put() is called, the calling thread blocks until one arrives (and symmetrically for take() with no waiting put()). This makes it less a "queue" in the buffering sense and more a synchronization point for direct thread-to-thread hand-off.',
      'It is the default work-handoff mechanism inside Executors.newCachedThreadPool() — tasks are handed directly to an available (or freshly created) worker thread rather than queued, which is precisely why a cached thread pool can grow unboundedly under load instead of queuing work behind a fixed-size pool.',
    ],
    keyPoints: [
      'Zero capacity — it stores nothing; size() always returns 0 and isEmpty() always returns true.',
      'Every put() blocks until a matching take() arrives, and vice versa — a direct, synchronous hand-off.',
      'Supports both "fair" (FIFO, using an internal queue of waiting threads) and default "non-fair" (LIFO stack of waiters, generally higher throughput) waiting-thread ordering modes.',
      'Used internally by Executors.newCachedThreadPool() to hand tasks directly to threads rather than buffering them.',
      'Does not permit null elements.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'SynchronousQueue has two distinct internal implementations selected by its constructor\'s fairness flag: the default (non-fair) mode uses a Scherer-Scott dual-stack algorithm (LIFO ordering among waiting threads, generally better throughput), while fair mode uses a dual-queue algorithm (FIFO ordering among waiters) — both are lock-free, CAS-based designs rather than traditional lock-and-condition implementations.',
      'A thread calling put(e) that finds no waiting consumer creates a "waiting node" holding its item and parks itself (blocks) on that node; when a thread later calls take(), it finds that waiting node, CAS-claims the item directly from it, and wakes the blocked producer thread — the transfer happens without the item ever being stored in any independent buffer.',
      'Symmetrically, a take() with no waiting producer parks itself as a waiting "request" node until a put() arrives to fulfill it directly.',
    ],
  },

  complexity: [
    { operation: 'put(e) / take()', average: 'O(1)', worst: 'O(1) (plus blocking wait time for a matching thread)', space: 'O(1)', notes: 'A direct hand-off, not a buffered insert/remove — no element storage overhead at all.' },
    { operation: 'size()', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Always returns 0, since nothing is ever actually stored.' },
  ],

  memory: {
    paragraphs: [
      'Minimal — there is no element storage whatsoever; the only memory used is small bookkeeping nodes representing currently-waiting threads, which exist only for the duration of a blocked put()/take() call.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Fully thread-safe, using a lock-free (CAS-based) dual-stack or dual-queue algorithm depending on the fairness setting, rather than traditional locks.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iteration is essentially a no-op: since the queue never actually stores any elements, its iterator always immediately reports no elements to visit.',
    ],
  },

  ordering: {
    paragraphs: [
      'There is no element ordering to speak of, since no elements are ever buffered together — each put() is paired with exactly one take() in a direct hand-off. The fairness setting instead governs the order in which WAITING THREADS are matched: FIFO in fair mode, LIFO (typically higher throughput) in the default non-fair mode.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Does not permit null elements; put(null) throws NullPointerException.',
    ],
  },

  useCases: [
    { title: 'Direct hand-off between exactly one producer and one consumer', description: 'When you want zero buffering — the producer should genuinely wait until a consumer is ready to receive, rather than dropping work into a queue.' },
    { title: 'Thread-pool task dispatch (as used by newCachedThreadPool)', description: 'Handing a submitted task directly to an available (or newly spun-up) worker thread instead of queuing it behind existing work.' },
    { title: 'Rendezvous-style coordination between two specific threads', description: 'Any scenario that needs a synchronization point where one thread must wait for another to be ready before an exchange happens.' },
  ],

  springBootExamples: [
    {
      title: 'Understanding why newCachedThreadPool can grow unboundedly',
      description: 'This illustrates the mechanism (not something you would typically configure directly): Executors.newCachedThreadPool() uses a SynchronousQueue internally, so every submitted task is handed directly to a thread — creating a new one if none are idle — rather than being queued, which is why an unbounded burst of submissions can spawn an unbounded number of threads.',
      code:
`// Roughly equivalent to what Executors.newCachedThreadPool() constructs internally:
ExecutorService cachedPool = new ThreadPoolExecutor(
    0, Integer.MAX_VALUE,
    60L, TimeUnit.SECONDS,
    new SynchronousQueue<>() // no buffering: every task needs an available thread NOW
);`,
    },
    {
      title: 'Direct hand-off dispatcher between a producer and a single worker',
      description: 'A lightweight dispatcher pairs a request-accepting thread directly with a processing thread, ensuring the producer only proceeds once the consumer has actually picked up the work item.',
      code:
`@Component
public class DirectHandoffDispatcher {

    private final SynchronousQueue<Runnable> handoff = new SynchronousQueue<>();

    @PostConstruct
    void startWorker() {
        Thread worker = new Thread(() -> {
            try {
                while (true) {
                    Runnable task = handoff.take(); // blocks until a task is handed off
                    task.run();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        worker.setDaemon(true);
        worker.start();
    }

    public void dispatch(Runnable task) throws InterruptedException {
        handoff.put(task); // blocks until the worker is ready to receive it
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What does size() return on a SynchronousQueue, and why?', difficulty: 'Beginner', answer: 'Always 0 — SynchronousQueue never actually stores any elements; every put() must be matched immediately by a waiting take() in a direct hand-off, so there is never a moment where an element is "sitting in" the queue.' },
    { question: 'What is the practical consequence of Executors.newCachedThreadPool() using a SynchronousQueue internally?', difficulty: 'Advanced', answer: 'Since SynchronousQueue never buffers a task, every submitted task must be handed directly to an available thread — if none is idle, the pool creates a new one (up to Integer.MAX_VALUE). This is why a cached thread pool can spawn an unbounded number of threads under a sudden burst of submissions, unlike a fixed-size pool backed by a genuinely buffering queue.' },
    { question: 'What is the difference between "fair" and default (non-fair) mode for SynchronousQueue?', difficulty: 'Advanced', answer: 'Fair mode uses a FIFO dual-queue algorithm for ordering waiting threads (first waiter gets matched first); the default non-fair mode uses a LIFO dual-stack algorithm, which is generally faster in practice but does not guarantee waiting-order fairness.' },
    { question: 'Can you meaningfully iterate over a SynchronousQueue?', difficulty: 'Beginner', answer: 'Not usefully — since it never stores any elements, its iterator immediately reports no elements, regardless of how many put()/take() pairs have occurred.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Direct hand-off between one producer and one consumer',
        statement: 'Demonstrate that put() blocks until a matching take() is ready, using SynchronousQueue.',
        code:
`import java.util.concurrent.*;

public class HandoffDemo {
    public static void main(String[] args) throws InterruptedException {
        SynchronousQueue<String> handoff = new SynchronousQueue<>();

        Thread consumer = new Thread(() -> {
            try {
                System.out.println("Consumer waiting...");
                String value = handoff.take();
                System.out.println("Consumer received: " + value);
            } catch (InterruptedException ignored) {}
        });
        consumer.start();

        Thread.sleep(300); // ensure the consumer is already waiting
        System.out.println("Producer handing off...");
        handoff.put("payload");
        consumer.join();
    }
}`,
        output: 'Consumer waiting...\nProducer handing off...\nConsumer received: payload',
      },
    ],
    intermediate: [
      {
        title: 'Confirm SynchronousQueue never buffers anything',
        statement: 'Show that isEmpty() is always true and size() is always 0, even immediately after a put() call from another thread.',
        code:
`import java.util.concurrent.*;

public class NeverBuffersDemo {
    public static void main(String[] args) throws InterruptedException {
        SynchronousQueue<Integer> queue = new SynchronousQueue<>();

        Thread producer = new Thread(() -> {
            try {
                queue.put(42); // blocks until a consumer takes it
            } catch (InterruptedException ignored) {}
        });
        producer.start();

        Thread.sleep(100);
        System.out.println("size=" + queue.size() + ", isEmpty=" + queue.isEmpty());

        System.out.println("Consumed: " + queue.take()); // unblocks the producer
        producer.join();
    }
}`,
        output: 'size=0, isEmpty=true\nConsumed: 42',
      },
    ],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Zero-buffering trade execution hand-off',
      domain: 'Banking',
      description: 'A trading system hands market-data-triggered execution requests directly from a market-data thread to an execution thread with zero buffering, ensuring no stale trade requests can ever sit queued if the execution thread briefly lags.',
      code:
`public class TradeExecutionHandoff {

    private final SynchronousQueue<TradeRequest> handoff = new SynchronousQueue<>();

    public void onMarketDataTick(TradeRequest request) throws InterruptedException {
        handoff.put(request); // blocks until the execution thread is actually ready — no stale queued trades
    }

    public void executionWorkerLoop() throws InterruptedException {
        while (true) {
            TradeRequest request = handoff.take();
            execute(request);
        }
    }

    private void execute(TradeRequest request) { /* ... */ }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-connection hand-off channels: Map<String, SynchronousQueue<Message>>',
      explanation: 'A lightweight in-process messaging layer creates one direct hand-off channel per connection, ensuring each message is delivered synchronously to exactly one waiting reader.',
      code:
`Map<String, SynchronousQueue<Message>> channelByConnection = new ConcurrentHashMap<>();

channelByConnection
    .computeIfAbsent(connectionId, id -> new SynchronousQueue<>())
    .put(message); // blocks until that connection's reader thread is ready`,
    },
  ],

  bestPractices: [
    'Use SynchronousQueue only when you specifically want zero buffering and a genuine hand-off — reach for LinkedBlockingQueue/ArrayBlockingQueue when any buffering is acceptable or desired.',
    'Be aware that using it as an ExecutorService work queue (like newCachedThreadPool does) means the pool must always have (or create) an available thread — pair it with a bounded maximum pool size in production to avoid unbounded thread creation.',
    'Choose fair mode only if FIFO ordering among waiting threads is a genuine requirement — it costs throughput versus the default.',
  ],

  commonMistakes: [
    {
      mistake: 'Using Executors.newCachedThreadPool() (SynchronousQueue-backed) for a workload with unpredictable bursts, without a bounded alternative.',
      why: 'Because SynchronousQueue never buffers, an unbounded burst of submissions can create an unbounded number of threads, potentially exhausting system resources.',
      fix: 'Use a custom ThreadPoolExecutor with a bounded maximum pool size and an appropriate bounded work queue (e.g. ArrayBlockingQueue) for workloads where uncontrolled thread growth is a risk.',
    },
    {
      mistake: 'Expecting SynchronousQueue to buffer even a single element "just in case".',
      why: 'It fundamentally holds nothing — a put() with no waiting take() blocks indefinitely (or until timeout, with the timed offer() variant) rather than queuing the element for later.',
      fix: 'Use a capacity-1 ArrayBlockingQueue if you specifically want minimal but non-zero buffering.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'SynchronousQueue', 'ArrayBlockingQueue(1)', 'LinkedBlockingQueue'],
    rows: [
      ['Capacity', 'Zero — stores nothing', 'One element', 'Unbounded by default (optionally bounded)'],
      ['put() blocks until', 'A matching take() is ready', 'The single slot is free', 'A slot is free (if bounded) or never (if unbounded)'],
      ['size()', 'Always 0', '0 or 1', 'Actual buffered count'],
      ['Typical use', 'Direct thread-to-thread hand-off', 'Minimal single-slot buffering', 'General producer-consumer buffering'],
    ],
  },

  diagrams: [
    {
      title: 'Direct hand-off — no storage in between',
      caption: 'Unlike every other queue in this app, there is no buffer box between producer and consumer — the element passes directly from one thread to the other.',
      render: () => (
        <div className="flex items-center gap-3">
          <DiagramBox label="Producer" tone="brand" sub="put()" />
          <DiagramArrow label="direct hand-off, no buffer" />
          <DiagramBox label="Consumer" tone="green" sub="take()" />
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does SynchronousQueue.size() always return?', options: ['1', '0', 'Integer.MAX_VALUE', 'It varies with load'], answerIndex: 1, explanation: 'It never stores any elements, so size() is always 0.' },
    { question: 'What happens when put() is called with no thread currently waiting in take()?', options: ['The element is buffered until a consumer arrives', 'The calling thread blocks until a matching take() arrives', 'An exception is thrown immediately', 'The element is silently dropped'], answerIndex: 1, explanation: 'put() blocks until a take() is ready to receive the element directly — there is no buffering step.' },
    { question: 'Which well-known Executors factory method uses SynchronousQueue internally?', options: ['newFixedThreadPool', 'newSingleThreadExecutor', 'newCachedThreadPool', 'newScheduledThreadPool'], answerIndex: 2, explanation: 'newCachedThreadPool hands tasks directly to threads via SynchronousQueue, creating new threads as needed rather than queuing work.' },
    { question: 'What does the "fair" mode of SynchronousQueue control?', options: ['Element ordering', 'The order in which waiting threads are matched (FIFO vs LIFO)', 'Whether null is allowed', 'Whether it becomes bounded'], answerIndex: 1, explanation: 'Fair mode uses a FIFO dual-queue algorithm for matching waiters; the default non-fair mode uses a typically-faster LIFO dual-stack algorithm.' },
  ],
};
