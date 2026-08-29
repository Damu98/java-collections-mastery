/* ==========================================================================
   CONTENT: DelayQueue
   ========================================================================== */

CollectionsContent['delayqueue'] = {

  overview: {
    paragraphs: [
      'DelayQueue (Java 5) is an unbounded blocking queue that only releases an element once its individual delay has expired — every element must implement the Delayed interface (which extends Comparable and adds `getDelay(TimeUnit)`), and the head of the queue is always the element whose delay expires soonest.',
      'Even if elements are present, take()/poll() will not return one whose delay has not yet elapsed — take() instead blocks until the earliest-expiring element actually becomes ready, making DelayQueue a natural, purpose-built scheduler for "do this, but not before time T" workloads.',
      'Internally it reuses a binary heap (ordered by remaining delay) exactly like PriorityQueue/PriorityBlockingQueue, plus a clever "leader-follower" optimization that avoids waking every waiting thread whenever the head changes.',
    ],
    keyPoints: [
      'Elements must implement Delayed (Comparable + getDelay(TimeUnit)); the head is always the element with the earliest expiry.',
      'take()/poll() only return an element once its delay has actually expired — take() blocks until that happens, even if the queue is non-empty.',
      'Always unbounded, like PriorityBlockingQueue — put()/offer() never block.',
      'Uses a "leader-follower" pattern internally so only one waiting thread ever times its wait against the head element, reducing unnecessary wake-ups.',
      'Does not permit null elements.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Internally, DelayQueue wraps a PriorityQueue<Delayed> (an array-based binary heap) ordered by each element\'s compareTo() — which, by the Delayed contract, must be consistent with remaining delay — guarded by a single ReentrantLock and an "available" Condition.',
      'take() peeks the head; if its getDelay() has already reached zero or below, it is removed and returned immediately. Otherwise the calling thread must wait — but rather than every waiting thread waking up on every signal (a "thundering herd"), DelayQueue designates one thread as the "leader," which waits with a bounded timeout matching the head\'s remaining delay, while all other waiting threads simply wait indefinitely until signaled. When the leader\'s wait completes (or a new, sooner-expiring head is added), it clears its leader status and signals the next waiter, which becomes the new leader.',
      'offer(e) never blocks (the queue is unbounded, exactly like PriorityBlockingQueue) — it inserts into the heap and, if the new element is now the head, signals waiting threads since the previously-known "next wake-up time" may no longer be correct.',
    ],
  },

  complexity: [
    { operation: 'offer(e) / put(e)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', notes: 'Never blocks — the queue is always unbounded.' },
    { operation: 'peek()', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Returns the head regardless of whether its delay has expired.' },
    { operation: 'poll() / take()', average: 'O(log n)', worst: 'O(log n) (plus wait time for the delay to expire, for take())', space: 'O(1)', notes: 'poll() returns null immediately if the head has not yet expired; take() blocks until it does.' },
  ],

  memory: {
    paragraphs: [
      'Same array-based heap memory profile as PriorityQueue, plus each element\'s own Delayed-wrapper overhead (typically a small record/class holding the payload and its scheduled expiry time).',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Fully thread-safe. All heap mutations and the leader-follower wait coordination happen under a single internal lock and its associated Condition.',
    ],
  },

  iteration: {
    paragraphs: [
      'The iterator does NOT guarantee any particular order — in particular, it does NOT guarantee to return elements in delay-expiration order, and it may (unlike take()/poll()) return elements whose delay has not yet expired. It is weakly consistent with respect to concurrent modification.',
    ],
  },

  ordering: {
    paragraphs: [
      'Elements become AVAILABLE for removal (via poll()/take()) strictly in order of delay expiration — the element expiring soonest is always released first, regardless of insertion order.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Does not permit null elements, consistent with the rest of the java.util.concurrent queue family.',
    ],
  },

  useCases: [
    { title: 'Scheduled retry mechanisms', description: 'Re-attempting a failed operation (e.g. a payment or webhook delivery) only after a computed backoff delay has elapsed.' },
    { title: 'Cache entry expiration processing', description: 'A background worker that take()s expired cache keys as soon as their TTL elapses, to evict them promptly.' },
    { title: 'Session/lock timeout handling', description: 'Releasing a resource or invalidating a session automatically once its timeout has passed.' },
    { title: 'Building a lightweight in-process task scheduler', description: 'Running arbitrary tasks no earlier than a specified future time, without pulling in a full scheduling framework.' },
  ],

  springBootExamples: [
    {
      title: 'Delayed webhook retry queue',
      description: 'A webhook delivery service schedules retries with exponential backoff using DelayQueue, so a failed delivery is only reattempted once its computed delay has elapsed.',
      code:
`public class DelayedRetry implements Delayed {
    private final WebhookDelivery delivery;
    private final long readyAtNanos;

    public DelayedRetry(WebhookDelivery delivery, Duration delay) {
        this.delivery = delivery;
        this.readyAtNanos = System.nanoTime() + delay.toNanos();
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(readyAtNanos - System.nanoTime(), TimeUnit.NANOSECONDS);
    }

    @Override
    public int compareTo(Delayed other) {
        return Long.compare(getDelay(TimeUnit.NANOSECONDS), other.getDelay(TimeUnit.NANOSECONDS));
    }

    public WebhookDelivery delivery() { return delivery; }
}

@Component
public class WebhookRetryService {

    private final DelayQueue<DelayedRetry> retryQueue = new DelayQueue<>();

    public void scheduleRetry(WebhookDelivery delivery, Duration backoff) {
        retryQueue.offer(new DelayedRetry(delivery, backoff)); // never blocks
    }

    @Scheduled(fixedDelay = 100)
    public void processReadyRetries() {
        DelayedRetry ready;
        while ((ready = retryQueue.poll()) != null) { // only returns EXPIRED entries
            attemptDelivery(ready.delivery());
        }
    }

    private void attemptDelivery(WebhookDelivery delivery) { /* ... */ }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What interface must every element in a DelayQueue implement?', difficulty: 'Beginner', answer: 'Delayed, which extends Comparable and adds getDelay(TimeUnit) — the queue orders elements by remaining delay and uses getDelay() to determine whether the head is actually ready to be removed.' },
    { question: 'Does poll() on a non-empty DelayQueue always return an element?', difficulty: 'Intermediate', answer: 'No — poll() returns null if the head element\'s delay has not yet expired, even though the queue is not empty. Only take() will actually wait for that expiration; poll() checks the current instant only.' },
    { question: 'What is the "leader-follower" pattern used inside DelayQueue, and why does it matter?', difficulty: 'Advanced', answer: 'Rather than waking every waiting thread whenever the head element or its delay changes, DelayQueue designates a single "leader" thread to wait with a timeout matched to the head\'s remaining delay; all other waiting threads simply wait indefinitely until signaled — avoiding a thundering-herd of unnecessary wake-ups under many concurrent consumers.' },
    { question: 'Can put()/offer() ever block on a DelayQueue?', difficulty: 'Intermediate', answer: 'No — DelayQueue is always unbounded, exactly like PriorityBlockingQueue, so insertion never blocks regardless of how many (or how delayed) elements are already present.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Schedule tasks to run after a fixed delay',
        statement: 'Implement a simple delayed-task holder and demonstrate that take() waits until the delay has elapsed.',
        code:
`import java.util.concurrent.*;

public class DelayedTaskDemo implements Delayed {
    private final String name;
    private final long readyAtNanos;

    DelayedTaskDemo(String name, long delayMillis) {
        this.name = name;
        this.readyAtNanos = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(delayMillis);
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(readyAtNanos - System.nanoTime(), TimeUnit.NANOSECONDS);
    }

    @Override
    public int compareTo(Delayed other) {
        return Long.compare(getDelay(TimeUnit.NANOSECONDS), other.getDelay(TimeUnit.NANOSECONDS));
    }

    public static void main(String[] args) throws InterruptedException {
        DelayQueue<DelayedTaskDemo> queue = new DelayQueue<>();
        queue.put(new DelayedTaskDemo("task-A", 300));
        queue.put(new DelayedTaskDemo("task-B", 100));

        System.out.println(queue.take().name); // waits ~100ms, task-B expires first
        System.out.println(queue.take().name); // waits the remaining ~200ms for task-A
    }
}`,
        output: 'task-B\ntask-A',
      },
    ],
    intermediate: [
      {
        title: 'Cache with TTL-based eviction via DelayQueue',
        statement: 'Build a simple cache where a background thread evicts entries as soon as their TTL expires, using DelayQueue to know exactly when to act.',
        code:
`import java.util.concurrent.*;
import java.util.*;

public class TtlCache<K> {
    private record ExpiringKey<K>(K key, long readyAtNanos) implements Delayed {
        public long getDelay(TimeUnit unit) {
            return unit.convert(readyAtNanos - System.nanoTime(), TimeUnit.NANOSECONDS);
        }
        public int compareTo(Delayed other) {
            return Long.compare(getDelay(TimeUnit.NANOSECONDS), other.getDelay(TimeUnit.NANOSECONDS));
        }
    }

    private final Map<K, Object> store = new ConcurrentHashMap<>();
    private final DelayQueue<ExpiringKey<K>> expiryQueue = new DelayQueue<>();

    public void put(K key, Object value, long ttlMillis) {
        store.put(key, value);
        expiryQueue.put(new ExpiringKey<>(key, System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(ttlMillis)));
    }

    public void startEvictionWorker() {
        Thread worker = new Thread(() -> {
            try {
                while (true) {
                    ExpiringKey<K> expired = expiryQueue.take(); // blocks until something expires
                    store.remove(expired.key());
                    System.out.println("Evicted: " + expired.key());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        worker.setDaemon(true);
        worker.start();
    }
}`,
        output: 'Evicted: session-42 (printed once that key\'s TTL elapses)',
      },
    ],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Exponential-backoff retry scheduler for failed payment reprocessing',
      domain: 'Payments',
      description: 'A payment resilience service reschedules failed transactions with an exponentially increasing delay, using DelayQueue to ensure retries only fire once their computed backoff window has actually elapsed.',
      code:
`public class PaymentRetryScheduler {

    private final DelayQueue<DelayedPaymentRetry> queue = new DelayQueue<>();

    public void scheduleRetry(Transaction tx, int attemptNumber) {
        Duration backoff = Duration.ofSeconds((long) Math.pow(2, attemptNumber));
        queue.put(new DelayedPaymentRetry(tx, backoff));
    }

    public void runWorkerLoop() throws InterruptedException {
        while (true) {
            DelayedPaymentRetry retry = queue.take(); // only returns once the backoff has elapsed
            reprocess(retry.transaction());
        }
    }

    private void reprocess(Transaction tx) { /* ... */ }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-tenant delayed task queues: Map<String, DelayQueue<DelayedTask>>',
      explanation: 'A multi-tenant scheduling platform keeps a separate DelayQueue per tenant, each drained by its own dedicated scheduler thread.',
      code:
`Map<String, DelayQueue<DelayedTask>> queueByTenant = new ConcurrentHashMap<>();

queueByTenant.computeIfAbsent(tenantId, id -> new DelayQueue<>()).put(delayedTask);`,
    },
  ],

  bestPractices: [
    'Implement getDelay()/compareTo() consistently and based on an absolute "ready at" timestamp computed once at insertion, not a relative countdown recomputed inconsistently across calls.',
    'Use take() (not poll()) in a dedicated worker thread when you want to react the instant each element becomes ready.',
    'Remember iteration order is not delay order and may include not-yet-ready elements — never use iteration to decide what is "ready."',
    'Handle InterruptedException from take() by restoring the interrupt flag and exiting the loop cleanly for graceful shutdown.',
  ],

  commonMistakes: [
    {
      mistake: 'Implementing getDelay() by recomputing from a stored duration rather than an absolute deadline.',
      why: 'If getDelay() is called multiple times, a duration-based (rather than deadline-based) implementation can return inconsistent, incorrect countdowns.',
      fix: 'Store an absolute "ready at" timestamp (e.g. System.nanoTime() + delayNanos) at construction, and compute getDelay() as `readyAt - System.nanoTime()` every time.',
    },
    {
      mistake: 'Using poll() in a busy-loop instead of take() to wait for the next ready element.',
      why: 'A busy poll() loop wastes CPU spinning while nothing is ready, when take() would efficiently block until the exact moment something expires.',
      fix: 'Use take() in a dedicated worker thread whenever you want to react as soon as an element becomes ready.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'DelayQueue', 'PriorityBlockingQueue', 'ScheduledExecutorService'],
    rows: [
      ['Ordering criterion', 'Soonest delay expiration', 'General priority (any Comparator)', 'Scheduled execution time'],
      ['Element requirement', 'Must implement Delayed', 'Must implement Comparable or supply a Comparator', 'Runnable/Callable, no interface needed'],
      ['Blocking take()', 'Yes, waits for expiry', 'Yes, waits for any element', 'N/A (framework runs tasks itself)'],
      ['Typical use', 'Custom delayed/retry queues', 'General priority task queues', 'Standard recurring/delayed task scheduling'],
    ],
  },

  diagrams: [
    {
      title: 'Only expired elements are released',
      caption: 'Even though three items are queued, poll() returns null until the soonest-expiring one\'s delay reaches zero.',
      render: () => (
        <div className="flex items-center gap-3">
          <DiagramBox label="B: 20ms left" tone="green" sub="head — closest to ready" />
          <DiagramBox label="A: 150ms left" tone="brand" />
          <DiagramBox label="C: 300ms left" tone="brand" />
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What interface must elements of a DelayQueue implement?', options: ['Comparable only', 'Delayed (which extends Comparable)', 'Runnable', 'Serializable'], answerIndex: 1, explanation: 'Delayed extends Comparable and adds getDelay(TimeUnit), which the queue uses to order elements and decide readiness.' },
    { question: 'Does poll() on a DelayQueue return an element whose delay has not yet expired?', options: ['Yes, always', 'No — it returns null until that element\'s delay has expired', 'Only if the queue is bounded', 'Only for the first call'], answerIndex: 1, explanation: 'poll() checks the current instant and returns null if the head has not yet expired, even if the queue is non-empty.' },
    { question: 'What optimization does DelayQueue use to avoid waking every waiting thread unnecessarily?', options: ['Fair locking', 'The leader-follower pattern', 'Segment locking', 'Copy-on-write'], answerIndex: 1, explanation: 'Only one designated "leader" thread times its wait against the head\'s delay; others wait indefinitely until signaled.' },
    { question: 'Can DelayQueue be constructed with a fixed maximum capacity?', options: ['Yes', 'No, it is always unbounded', 'Only with fair mode', 'Only for Comparable elements'], answerIndex: 1, explanation: 'Like PriorityBlockingQueue, DelayQueue is always unbounded — put()/offer() never block.' },
  ],
};
