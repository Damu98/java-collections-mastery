/* ==========================================================================
   CONTENT: ConcurrentLinkedQueue
   ========================================================================== */

CollectionsContent['concurrentlinkedqueue'] = {

  overview: {
    paragraphs: [
      'ConcurrentLinkedQueue (Java 5) is an unbounded, non-blocking FIFO queue built entirely on lock-free CAS (compare-and-swap) operations rather than locks — implementing a well-known algorithm from Michael and Scott\'s 1996 paper on lock-free queues.',
      'Because it never blocks and never takes a lock, it offers excellent throughput for high-concurrency scenarios where producers and consumers should never be stalled waiting on each other — the trade-off is that it has no way to signal "wait until an element is available," which is exactly what the blocking queue family (LinkedBlockingQueue, etc.) exists to provide instead.',
      'Choose ConcurrentLinkedQueue when you want safe concurrent FIFO access with a poll()-returns-null-if-empty polling style; choose a BlockingQueue when you want a consumer thread to genuinely sleep until work arrives.',
    ],
    keyPoints: [
      'Unbounded, lock-free FIFO queue using CAS-based linked-node operations (the Michael-Scott algorithm).',
      'No locking at all — offer()/poll() never block, even under heavy contention.',
      'size() is O(n) (must traverse the list) and is only a momentary estimate under concurrent modification — avoid relying on it in hot paths.',
      'Weakly consistent iterators — never throw ConcurrentModificationException.',
      'Does not permit null elements, like the rest of the Queue family.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'The queue is a singly-linked list of nodes with separate `head` and `tail` references, both updated via AtomicReference CAS operations rather than locks. offer(e) creates a new node, then CAS-links it after the current tail (retrying if another thread raced to do the same thing first), then attempts to CAS-advance the tail reference itself.',
      'poll() reads the current head\'s next node (the actual first element, since head itself is a dummy/sentinel node in the classic Michael-Scott design) and CAS-updates head to point there, retrying on contention — no thread ever blocks waiting for a lock; a failed CAS simply means "try again immediately."',
      'Because there is no lock protecting the whole structure, size() cannot simply read a counter — it must walk the entire linked list counting nodes, which is O(n) and can be inaccurate the instant it finishes if concurrent modifications are happening.',
    ],
  },

  complexity: [
    { operation: 'offer(e)', average: 'O(1)', worst: 'O(1) (plus CAS retries under contention)', space: 'O(1)', notes: 'Lock-free; retries on CAS failure rather than blocking.' },
    { operation: 'poll() / peek()', average: 'O(1)', worst: 'O(1) (plus CAS retries under contention)', space: 'O(1)', notes: 'Returns null immediately if empty — never blocks.' },
    { operation: 'size()', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Must traverse the entire linked list; result is only a momentary estimate under concurrent use.' },
  ],

  memory: {
    paragraphs: [
      'Node overhead is comparable to LinkedList\'s (a value reference plus a next reference per element), plus the underlying algorithm\'s use of a permanent dummy head node.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Fully thread-safe for concurrent producers and consumers without any external synchronization, using lock-free CAS operations exclusively — no thread ever blocks waiting for another thread to release a lock.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iterators are weakly consistent: they never throw ConcurrentModificationException and are guaranteed to traverse elements as they existed at some point during the iteration, though they may or may not reflect concurrent additions/removals made by other threads mid-traversal.',
    ],
  },

  ordering: {
    paragraphs: [
      'Strict FIFO — elements are returned by poll() in the order they were successfully offer()\'d, consistent with the classic Michael-Scott lock-free queue algorithm.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Does not permit null elements; offer(null) throws NullPointerException, preserving poll()\'s "null return means empty" convention.',
    ],
  },

  useCases: [
    { title: 'High-throughput non-blocking event/message passing', description: 'When producers should never be blocked or delayed by lock contention, and consumers are fine polling rather than blocking-waiting.' },
    { title: 'Lock-free logging/metrics buffers', description: 'Collecting events from many threads with minimal contention overhead, later drained by a background thread.' },
    { title: 'Building block for higher-level lock-free structures', description: 'Where the queue itself is a component of a larger non-blocking algorithm.' },
  ],

  springBootExamples: [
    {
      title: 'Non-blocking audit event buffer',
      description: 'A high-throughput API gateway records audit events from many request-handling threads into a ConcurrentLinkedQueue with zero lock contention, drained periodically by a single background writer.',
      code:
`@Component
public class AuditEventBuffer {

    private final Queue<AuditEvent> events = new ConcurrentLinkedQueue<>();

    public void record(AuditEvent event) {
        events.offer(event); // never blocks, regardless of concurrent callers
    }

    @Scheduled(fixedDelay = 1000)
    public void flushToStorage() {
        AuditEvent event;
        List<AuditEvent> batch = new ArrayList<>();
        while ((event = events.poll()) != null) {
            batch.add(event);
        }
        if (!batch.isEmpty()) auditEventRepository.saveAll(batch);
    }

    private final AuditEventRepository auditEventRepository;
    public AuditEventBuffer(AuditEventRepository repository) { this.auditEventRepository = repository; }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'How does ConcurrentLinkedQueue achieve thread safety without any locks?', difficulty: 'Advanced', answer: 'It uses the Michael-Scott lock-free queue algorithm: every structural change (linking a new tail node, advancing the head) is performed via CAS (compare-and-swap) operations on AtomicReference fields, retrying automatically if another thread raced to make the same change first — no thread ever blocks.' },
    { question: 'Why is size() expensive and potentially inaccurate on a ConcurrentLinkedQueue?', difficulty: 'Intermediate', answer: 'There is no maintained counter (which would itself become a contention hotspot); size() must traverse the entire linked list, an O(n) operation, and the result the moment it returns may already be stale due to concurrent modification.' },
    { question: 'When would you choose ConcurrentLinkedQueue over LinkedBlockingQueue?', difficulty: 'Intermediate', answer: 'When you want producers/consumers to never block — poll() returning null immediately on an empty queue is the desired behavior (e.g. a polling loop with its own backoff strategy), rather than a consumer thread genuinely sleeping until an element becomes available.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Multi-producer, single-consumer counter aggregation',
        statement: 'Have several threads offer() values concurrently into a ConcurrentLinkedQueue, then drain and sum them from a single consumer.',
        code:
`import java.util.concurrent.*;

public class ConcurrentProducerConsumer {
    public static void main(String[] args) throws InterruptedException {
        Queue<Integer> queue = new ConcurrentLinkedQueue<>();
        ExecutorService pool = Executors.newFixedThreadPool(4);

        for (int i = 1; i <= 100; i++) {
            int value = i;
            pool.submit(() -> queue.offer(value));
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        int sum = 0, count = 0;
        Integer value;
        while ((value = queue.poll()) != null) {
            sum += value;
            count++;
        }
        System.out.println("Count: " + count + ", Sum: " + sum);
    }
}`,
        output: 'Count: 100, Sum: 5050',
      },
    ],
    intermediate: [],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Real-time metrics ingestion buffer for a payments platform',
      domain: 'Payments',
      description: 'A metrics-collection agent ingests latency samples from hundreds of concurrent transaction-processing threads into a ConcurrentLinkedQueue with zero blocking, aggregated by a separate background reporter thread every second.',
      code:
`public class LatencySampleBuffer {

    private final Queue<Long> samples = new ConcurrentLinkedQueue<>();

    public void record(long latencyMillis) {
        samples.offer(latencyMillis);
    }

    public List<Long> drainAll() {
        List<Long> drained = new ArrayList<>();
        Long sample;
        while ((sample = samples.poll()) != null) {
            drained.add(sample);
        }
        return drained;
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-topic concurrent event queues: Map<String, ConcurrentLinkedQueue<Event>>',
      explanation: 'A lightweight in-process pub/sub component keeps one lock-free queue per topic, fed by many publisher threads simultaneously.',
      code:
`ConcurrentHashMap<String, ConcurrentLinkedQueue<Event>> queuesByTopic = new ConcurrentHashMap<>();

queuesByTopic.computeIfAbsent(topic, t -> new ConcurrentLinkedQueue<>()).offer(event);`,
    },
  ],

  bestPractices: [
    'Choose ConcurrentLinkedQueue when producers/consumers should never block; choose a BlockingQueue when consumers should genuinely wait for work.',
    'Avoid calling size() in hot paths — it is O(n) and only ever an estimate under concurrent access; use isEmpty() (O(1)) when you only need to know if any element exists.',
    'Design consumers around poll() returning null as "nothing right now" rather than treating it as an error.',
  ],

  commonMistakes: [
    {
      mistake: 'Calling size() frequently on a ConcurrentLinkedQueue, e.g. in a monitoring loop.',
      why: 'size() is O(n) and requires a full traversal — frequent calls under high throughput add real, avoidable CPU cost.',
      fix: 'Use isEmpty() when only presence/absence matters, or maintain a separate approximate counter (e.g. a LongAdder) updated alongside offers/polls if a count is genuinely needed.',
    },
    {
      mistake: 'Using ConcurrentLinkedQueue when consumers actually need to block-wait for new elements.',
      why: 'It has no blocking take()/put() — poll() on an empty queue returns null immediately rather than waiting, forcing consumers into an inefficient busy-poll loop.',
      fix: 'Use LinkedBlockingQueue (or another BlockingQueue implementation) when genuine blocking consumption is needed.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'ConcurrentLinkedQueue', 'LinkedBlockingQueue', 'synchronized LinkedList'],
    rows: [
      ['Concurrency mechanism', 'Lock-free (CAS)', 'Two locks (put/take)', 'Single external lock'],
      ['Blocking take()/put()', 'No', 'Yes', 'No (must poll manually)'],
      ['Bounded capacity option', 'No (always unbounded)', 'Yes (optional)', 'No'],
      ['size() cost', 'O(n)', 'O(1) (maintained counter)', 'O(1)'],
    ],
  },

  diagrams: [
    {
      title: 'CAS-based lock-free enqueue',
      caption: 'Two threads racing to append: only one CAS succeeds; the loser retries against the updated tail.',
      render: () => (
        <div className="flex items-center gap-2">
          <DiagramBox label="head" tone="slate" sub="dummy" />
          <DiagramArrow />
          <DiagramBox label="A" tone="brand" />
          <DiagramArrow />
          <DiagramBox label="B" tone="brand" sub="old tail" />
          <DiagramArrow label="CAS wins" />
          <DiagramBox label="C" tone="green" sub="new tail" />
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What algorithm underlies ConcurrentLinkedQueue?', options: ['A single global lock', 'The Michael-Scott lock-free queue algorithm (CAS-based)', 'Segment locking like old ConcurrentHashMap', 'A red-black tree'], answerIndex: 1, explanation: 'It implements the well-known CAS-based lock-free queue algorithm published by Michael and Scott.' },
    { question: 'What is the time complexity of ConcurrentLinkedQueue.size()?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], answerIndex: 2, explanation: 'There is no maintained counter; size() must traverse the whole linked list.' },
    { question: 'Does ConcurrentLinkedQueue.poll() block if the queue is empty?', options: ['Yes, until an element arrives', 'No, it returns null immediately', 'It throws an exception', 'It blocks only in fair mode'], answerIndex: 1, explanation: 'It is non-blocking by design — poll() always returns immediately, with null signaling "empty".' },
    { question: 'Are ConcurrentLinkedQueue\'s iterators fail-fast or weakly consistent?', options: ['Fail-fast', 'Weakly consistent', 'Neither — iteration is unsupported', 'Strongly consistent (frozen snapshot)'], answerIndex: 1, explanation: 'Like other java.util.concurrent structures, its iterators are weakly consistent and never throw ConcurrentModificationException.' },
  ],
};
