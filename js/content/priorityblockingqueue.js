/* ==========================================================================
   CONTENT: PriorityBlockingQueue
   ========================================================================== */

CollectionsContent['priorityblockingqueue'] = {

  overview: {
    paragraphs: [
      'PriorityBlockingQueue (Java 5) is the thread-safe, blocking counterpart to PriorityQueue: an unbounded binary-heap-based queue that orders elements by priority (natural ordering or a supplied Comparator) while providing take() that blocks when the queue is empty.',
      'Because it is always unbounded (it can be constructed with an initial capacity, but that is only a hint — the heap array still grows as needed), put() never actually blocks; only take() can — there is no notion of "full" to block a producer against.',
      'It is the natural choice whenever multiple threads submit work with varying priority and one or more worker threads should always process the currently-highest-priority item next, blocking gracefully when there is nothing left to do.',
    ],
    keyPoints: [
      'Unbounded binary heap, guarded by a single internal lock; take() blocks when empty, put()/offer() never block (there is no capacity ceiling).',
      'Only the head (peek()/poll()/take()) is guaranteed to be the minimum according to the ordering in use — iteration order is unspecified, exactly like plain PriorityQueue.',
      'O(log n) offer()/poll(), O(1) peek(), plus lock acquisition overhead.',
      'Does not permit null elements, since ordering requires non-null comparisons.',
      'Weakly consistent iterators, consistent with the rest of the java.util.concurrent queue family.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Internally, it maintains the same array-based binary heap structure as PriorityQueue (parent/child relationships via index arithmetic, sift-up on insertion, sift-down on removal), but every structural operation is guarded by a single ReentrantLock, with a notEmpty Condition that take() blocks on when the heap is empty.',
      'Because there is no upper bound, put()/offer() never need to wait — they simply acquire the lock, insert (growing the array if needed, exactly like PriorityQueue\'s own grow() logic), and signal notEmpty to wake any thread blocked in take().',
      'take() acquires the lock, blocks on notEmpty while the heap is empty, then removes and returns the head element (sifting the heap back into a valid state) once one becomes available.',
    ],
  },

  complexity: [
    { operation: 'offer(e) / put(e)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Never blocks — the queue is always unbounded.' },
    { operation: 'poll() / take()', average: 'O(log n)', worst: 'O(log n) (plus blocking wait time for take())', space: 'O(1)', notes: 'take() blocks until an element is available; poll() returns null immediately if empty.' },
    { operation: 'peek()', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'The head is always the current minimum.' },
  ],

  memory: {
    paragraphs: [
      'Same array-based heap memory profile as PriorityQueue, plus the fixed overhead of one lock and one condition variable per queue instance — no per-element locking overhead.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Fully thread-safe. All heap mutations happen under a single internal lock, and take() correctly blocks/wakes via a Condition rather than busy-waiting.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator, exactly like plain PriorityQueue\'s, makes NO ordering guarantee — it does not traverse in priority order. Only sequential take()/poll() calls are guaranteed to return elements from lowest to highest priority. The iterator is weakly consistent with respect to concurrent modification.',
    ],
  },

  ordering: {
    paragraphs: [
      'Only the head element is guaranteed to be the minimum (or maximum, with a reversed Comparator) according to the ordering in use — the same guarantee, and the same common misconception around iteration order, as plain PriorityQueue.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Does not permit null elements, since insertion requires comparing the new element against existing elements to find its heap position.',
    ],
  },

  useCases: [
    { title: 'Concurrent priority-based task scheduling', description: 'Multiple producer threads submitting work of varying urgency to a shared pool of worker threads that always pick up the highest-priority item next.' },
    { title: 'Multi-threaded event processing by severity/urgency', description: 'Alerting or monitoring systems where more severe events should be handled before less severe ones, regardless of arrival order, across concurrent ingestion threads.' },
  ],

  springBootExamples: [
    {
      title: 'Concurrent priority-based background job processor',
      description: 'A job-processing service accepts jobs from many concurrent request-handling threads and processes them in priority order using a dedicated worker thread pool consuming from a single shared PriorityBlockingQueue.',
      code:
`@Service
public class PriorityJobProcessor {

    private final BlockingQueue<Job> jobs =
        new PriorityBlockingQueue<>(11, Comparator.comparingInt(Job::priority).reversed());

    @PostConstruct
    void startWorkers() {
        for (int i = 0; i < 4; i++) {
            Thread worker = new Thread(this::workerLoop);
            worker.setDaemon(true);
            worker.start();
        }
    }

    public void submit(Job job) {
        jobs.offer(job); // never blocks — the queue is unbounded
    }

    private void workerLoop() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                Job job = jobs.take(); // blocks until a job is available
                job.execute();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why does put()/offer() never block on a PriorityBlockingQueue?', difficulty: 'Intermediate', answer: 'It is always unbounded — an "initial capacity" constructor argument only pre-sizes the internal array as a performance hint, but the heap will still grow automatically as needed, so there is no "full" state to block a producer against.' },
    { question: 'Does iterating a PriorityBlockingQueue return elements in priority order?', difficulty: 'Intermediate', answer: 'No, exactly like plain PriorityQueue — the iterator walks the backing heap array in physical position order, not priority order. Only sequential take()/poll() calls guarantee priority-ordered results.' },
    { question: 'What is the practical difference between PriorityQueue and PriorityBlockingQueue?', difficulty: 'Beginner', answer: 'PriorityBlockingQueue adds thread safety (an internal lock guarding all heap operations) and a blocking take() that waits for an element to become available, whereas plain PriorityQueue is unsynchronized and has no blocking operations at all.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Multiple producers feeding a single priority worker',
        statement: 'Have several producer threads submit prioritized tasks concurrently, consumed in priority order by a single worker thread.',
        code:
`import java.util.concurrent.*;
import java.util.*;

public class PriorityWorkerDemo {
    record Task(int priority, String name) {}

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Task> tasks = new PriorityBlockingQueue<>(11,
            Comparator.comparingInt(Task::priority));

        ExecutorService producers = Executors.newFixedThreadPool(3);
        producers.submit(() -> tasks.offer(new Task(5, "low-priority-report")));
        producers.submit(() -> tasks.offer(new Task(1, "critical-alert")));
        producers.submit(() -> tasks.offer(new Task(3, "medium-task")));
        producers.shutdown();
        producers.awaitTermination(2, TimeUnit.SECONDS);

        for (int i = 0; i < 3; i++) {
            System.out.println(tasks.take().name());
        }
    }
}`,
        output: 'critical-alert\nmedium-task\nlow-priority-report',
      },
    ],
    intermediate: [],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Multi-threaded hospital alert triage queue',
      domain: 'Healthcare',
      description: 'Multiple monitoring devices push vital-sign alerts concurrently into a shared PriorityBlockingQueue, ordered by clinical severity, consumed by a pool of on-call notification workers that always handle the most critical alert first.',
      code:
`@Component
public class VitalsAlertQueue {

    private final BlockingQueue<VitalsAlert> alerts =
        new PriorityBlockingQueue<>(50, Comparator.comparingInt(VitalsAlert::severity).reversed());

    public void publish(VitalsAlert alert) {
        alerts.offer(alert);
    }

    public VitalsAlert nextMostCritical() throws InterruptedException {
        return alerts.take();
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-region priority alert queues: Map<String, PriorityBlockingQueue<Alert>>',
      explanation: 'A monitoring platform keeps one priority queue per data-center region, each consumed by its own regional on-call worker pool.',
      code:
`Map<String, PriorityBlockingQueue<Alert>> alertsByRegion = new ConcurrentHashMap<>();

alertsByRegion
    .computeIfAbsent(region, r -> new PriorityBlockingQueue<>(20, Comparator.comparing(Alert::severity).reversed()))
    .offer(alert);`,
    },
  ],

  bestPractices: [
    'Never rely on iteration order for priority-sorted output — always consume via take()/poll().',
    'Remember put()/offer() never block, so a producer misbehaving (submitting far faster than consumers can drain) can still grow memory unboundedly — apply your own external rate limiting if that is a concern.',
    'Provide an explicit Comparator with a clear tie-breaker for predictable behavior when priorities collide.',
  ],

  commonMistakes: [
    {
      mistake: 'Assuming PriorityBlockingQueue applies backpressure like a bounded BlockingQueue.',
      why: 'It is always unbounded — put()/offer() never block regardless of how large the queue grows.',
      fix: 'If backpressure is required, enforce your own size check/limit externally, since the queue itself provides none.',
    },
    {
      mistake: 'Iterating a PriorityBlockingQueue expecting priority-sorted output.',
      why: 'Like PriorityQueue, its iterator reflects heap-array physical order, not priority order.',
      fix: 'Drain via take()/poll() when priority order matters.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'PriorityBlockingQueue', 'PriorityQueue', 'DelayQueue'],
    rows: [
      ['Thread-safe', 'Yes', 'No', 'Yes'],
      ['Bounded?', 'No (always unbounded)', 'No', 'No (always unbounded)'],
      ['Blocking take()', 'Yes', 'N/A (no blocking methods)', 'Yes'],
      ['Ordering of head', 'Priority order', 'Priority order', 'By soonest delay expiration'],
    ],
  },

  diagrams: [
    {
      title: 'Locked heap with blocking take()',
      caption: 'A worker thread blocks on take() until a producer offers an element; the head is always the current minimum.',
      render: () => (
        <div className="flex flex-col items-center gap-3">
          <DiagramBox label={1} tone="green" sub="head (min priority number = highest urgency)" />
          <div className="flex gap-6">
            <DiagramBox label={5} tone="brand" />
            <DiagramBox label={3} tone="brand" />
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'Can PriorityBlockingQueue be bounded to a fixed capacity?', options: ['Yes, via a capacity constructor argument', 'No, it is always unbounded', 'Only in fair mode', 'Yes, up to Integer.MAX_VALUE only'], answerIndex: 1, explanation: 'The "initial capacity" constructor argument is only a sizing hint — the heap still grows automatically as needed, so put()/offer() never block.' },
    { question: 'Does PriorityBlockingQueue.take() block?', options: ['Never', 'Yes, when the queue is empty', 'Only in fair mode', 'Only if bounded'], answerIndex: 1, explanation: 'take() blocks until an element becomes available; put()/offer() never block since there is no upper bound.' },
    { question: 'Does iterating a PriorityBlockingQueue return sorted output?', options: ['Yes, always', 'No — only take()/poll() guarantee priority order', 'Only for Comparable elements', 'Only with a custom Comparator'], answerIndex: 1, explanation: 'Iteration reflects physical heap-array order, exactly like plain PriorityQueue.' },
  ],
};
