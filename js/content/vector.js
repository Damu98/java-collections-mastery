/* ==========================================================================
   CONTENT: Vector
   ========================================================================== */

CollectionsContent['vector'] = {

  overview: {
    paragraphs: [
      'Vector predates the Collections Framework entirely — it was part of Java 1.0 and was retrofitted to implement List when Java 1.2 introduced the framework. It is, structurally, almost identical to ArrayList: a resizable Object[] array with O(1) indexed access and amortized O(1) appends.',
      'The defining difference is that every public method on Vector is synchronized on the Vector\'s own monitor. That made it "thread-safe" by the standards of 1996, but modern concurrent code almost never wants Vector: the synchronization is coarse-grained (one lock per call), does not make compound operations like "check-then-act" atomic, and is strictly worse for both single-threaded and highly-concurrent code than the alternatives available today.',
      'Vector is retained in the JDK purely for backward compatibility with pre-1.2 code and APIs (such as java.util.Stack, which extends Vector, and some legacy Enumeration-based APIs). New code should essentially never choose Vector deliberately.',
    ],
    keyPoints: [
      'Legacy class from Java 1.0, later retrofitted to implement List.',
      'Backed by a resizable Object[] array, structurally similar to ArrayList.',
      'Every method is synchronized — coarse-grained, whole-object locking.',
      'Grows by doubling capacity by default (or by a configurable capacityIncrement), unlike ArrayList\'s 1.5x.',
      'Superclass of the legacy Stack class.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Vector\'s growth policy differs from ArrayList\'s: by default it doubles capacity (newCapacity = oldCapacity * 2) when full, unless constructed with an explicit capacityIncrement, in which case it grows by exactly that fixed amount every time.',
      'Every method — add(), get(), size(), even isEmpty() — acquires the intrinsic lock on the Vector instance before doing anything. This means two threads calling get() simultaneously will actually serialize behind each other, even though a plain read should never need to block another read.',
      'Because locking happens per-method, compound operations like "if (!vector.contains(x)) vector.add(x)" are still not atomic — another thread can interleave between the contains() and add() calls, defeating the purpose of the synchronization for many real use cases.',
    ],
  },

  complexity: [
    { operation: 'get(index) / set(index, e)', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Same as ArrayList, plus lock acquisition overhead.' },
    { operation: 'add(e) (append)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Worst case doubles capacity and copies all elements.' },
    { operation: 'add(index, e) / remove(index)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Shifts elements, same as ArrayList.' },
    { operation: 'contains(e) / indexOf(e)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Linear scan under lock.' },
  ],

  memory: {
    paragraphs: [
      'Memory layout is essentially identical to ArrayList\'s (a reference array plus a size field), but the default doubling growth policy tends to waste more trailing capacity than ArrayList\'s 1.5x growth, especially for large collections.',
    ],
    points: [
      'Prefer ArrayList\'s tighter 1.5x growth for large, memory-sensitive collections.',
      'If Vector must be used, size it up front via the capacity constructor to avoid repeated doubling.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Vector is internally synchronized: every individual method call is atomic with respect to other Vector method calls. However, this does NOT make multi-step sequences (like "get size, then read that index" or "check contains, then add") atomic — you must still synchronize externally on the Vector for compound operations.',
      'The coarse single-lock design also means Vector scales poorly under contention: readers block writers and other readers alike, unlike java.util.concurrent structures such as CopyOnWriteArrayList (lock-free reads) or ConcurrentHashMap (fine-grained locking).',
    ],
  },

  iteration: {
    paragraphs: [
      'Vector supports both the modern fail-fast Iterator/ListIterator (shared with ArrayList\'s modCount mechanism) and the legacy Enumeration interface (elements()), which predates fail-fast iterators and does not detect concurrent modification at all.',
      'Prefer the standard Iterator/for-each over Enumeration in any code written today — Enumeration exists purely for compatibility with 1.0-era APIs.',
    ],
  },

  ordering: {
    paragraphs: [
      'Like ArrayList, Vector is strictly insertion/index ordered and never reorders elements on its own.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Vector allows null elements, the same as ArrayList.',
    ],
  },

  useCases: [
    { title: 'Maintaining legacy codebases', description: 'Existing systems that already use Vector or java.util.Stack and cannot be refactored in the short term.' },
    { title: 'Interfacing with legacy APIs expecting Enumeration', description: 'Some old libraries and JDK APIs (e.g. certain javax.naming / javax.swing APIs) still expose or expect Enumeration, which Vector.elements() provides directly.' },
    { title: 'Simple, low-throughput shared lists where clarity trumps performance', description: 'In rare cases where a small, rarely-touched shared list needs "good enough" thread safety without pulling in java.util.concurrent, though CopyOnWriteArrayList is usually still the better modern choice.' },
  ],

  springBootExamples: [
    {
      title: 'Bridging a legacy library that returns Enumeration into a modern Spring service',
      description: 'A Spring service wraps a legacy JNDI/LDAP-style API that returns Enumeration<T> (often backed by a Vector) and converts it into a modern List for the rest of the codebase.',
      code:
`@Service
public class LegacyDirectoryBridgeService {

    private final LegacyDirectoryClient legacyClient;

    public LegacyDirectoryBridgeService(LegacyDirectoryClient legacyClient) {
        this.legacyClient = legacyClient;
    }

    public List<String> listGroupNames() {
        Enumeration<String> legacyEnum = legacyClient.getGroupNamesEnumeration(); // legacy API, often Vector-backed
        List<String> groups = new ArrayList<>();
        while (legacyEnum.hasMoreElements()) {
            groups.add(legacyEnum.nextElement());
        }
        return groups;
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What is the core difference between Vector and ArrayList?', difficulty: 'Beginner', answer: 'They are structurally almost identical (both are resizable Object[] arrays), but every Vector method is synchronized, making it thread-safe at the level of individual method calls, whereas ArrayList has no synchronization at all.' },
    { question: 'Is Vector safe to use in multi-threaded code without any additional synchronization?', difficulty: 'Intermediate', answer: 'Only for single, individual method calls. Compound operations (like checking contains() and then calling add() based on the result) are not atomic even on a Vector, because another thread can act in between the two calls. External synchronization is still required for such sequences.' },
    { question: 'Why is Vector considered obsolete for new code?', difficulty: 'Beginner', answer: 'Its coarse-grained, whole-object locking model is both slower than an unsynchronized ArrayList for single-threaded code and less scalable than modern java.util.concurrent alternatives (CopyOnWriteArrayList, Collections.synchronizedList with explicit compound-action locking) for concurrent code.' },
    { question: 'What legacy class extends Vector, and why does that matter?', difficulty: 'Intermediate', answer: 'java.util.Stack extends Vector, inheriting all of its synchronized, index-based List behavior alongside stack-style push/pop/peek methods — which is one of the reasons the JDK docs recommend ArrayDeque over Stack for new code.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Convert a legacy Enumeration to a modern List',
        statement: 'Given a Vector<String>, obtain its Enumeration and collect the elements into a new ArrayList.',
        code:
`import java.util.*;

public class EnumerationToList {
    public static void main(String[] args) {
        Vector<String> legacy = new Vector<>(List.of("alpha", "beta", "gamma"));
        Enumeration<String> e = legacy.elements();

        List<String> modern = new ArrayList<>();
        while (e.hasMoreElements()) {
            modern.add(e.nextElement());
        }

        System.out.println(modern);
    }
}`,
        output: '[alpha, beta, gamma]',
      },
    ],
    intermediate: [
      {
        title: 'Demonstrate that compound operations on Vector are not atomic',
        statement: 'Show, conceptually, why "contains-then-add" on a Vector still needs external synchronization by writing the correctly-guarded version.',
        code:
`import java.util.Vector;

public class SafeAddIfAbsent {

    private final Vector<String> tags = new Vector<>();

    public void addIfAbsent(String tag) {
        synchronized (tags) { // external lock guards the whole check-then-act sequence
            if (!tags.contains(tag)) {
                tags.add(tag);
            }
        }
    }

    public static void main(String[] args) {
        SafeAddIfAbsent service = new SafeAddIfAbsent();
        service.addIfAbsent("urgent");
        service.addIfAbsent("urgent");
        System.out.println(service.tags);
    }
}`,
        output: '[urgent]',
      },
    ],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Migrating a legacy inventory module off Vector',
      domain: 'Inventory',
      description: 'A refactor task replaces a Vector-based shared stock-level list with CopyOnWriteArrayList, since reads (checking stock) vastly outnumber writes (restocking), preserving thread safety while improving read throughput.',
      code:
`// Before: coarse-grained locking on every read and write
private final Vector<StockLevel> stockLevels = new Vector<>();

// After: lock-free reads, appropriate for a read-heavy access pattern
private final List<StockLevel> stockLevels = new CopyOnWriteArrayList<>();`,
    },
  ],

  nestedExamples: [
    {
      title: 'Wrapping a legacy Vector-returning API result',
      explanation: 'A payments integration layer wraps a third-party SDK method that still returns Vector<Transaction> for backward compatibility, immediately converting it at the boundary.',
      code:
`Vector<Transaction> legacyResult = legacyPaymentGateway.fetchRecentTransactions();
List<Transaction> transactions = List.copyOf(legacyResult); // immutable, modern boundary type`,
    },
  ],

  bestPractices: [
    'Do not choose Vector for new code — use ArrayList (single-threaded) or CopyOnWriteArrayList / Collections.synchronizedList (concurrent) instead.',
    'If you must interoperate with a legacy API that returns Vector or Enumeration, convert to a modern List at the boundary as early as possible.',
    'Remember that synchronized methods do not make multi-step sequences atomic — wrap compound check-then-act logic in your own synchronized block even when using Vector.',
    'Never iterate a Vector with its legacy Enumeration in new code — use the standard Iterator/for-each.',
  ],

  commonMistakes: [
    {
      mistake: 'Assuming Vector makes "check then add" operations thread-safe by itself.',
      why: 'Each individual method call is atomic, but nothing prevents another thread from acting between two separate calls on the same Vector.',
      fix: 'Wrap the whole sequence in a synchronized(vector) block, or use a higher-level concurrent collection designed for atomic compound operations.',
    },
    {
      mistake: 'Choosing Vector "for thread safety" in new, performance-sensitive code.',
      why: 'Its per-method locking adds overhead even in single-threaded contexts and does not scale under real contention.',
      fix: 'Use ArrayList when single-threaded, or a java.util.concurrent alternative suited to the actual read/write ratio.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'Vector', 'ArrayList', 'Collections.synchronizedList(new ArrayList<>())'],
    rows: [
      ['Introduced', 'Java 1.0', 'Java 1.2', 'Java 1.2'],
      ['Synchronization', 'Built-in, per-method', 'None', 'Wrapper, per-method'],
      ['Growth factor', '2x (or fixed increment)', '1.5x', '1.5x (delegates to ArrayList)'],
      ['Legacy Enumeration support', 'Yes', 'No', 'No'],
      ['Recommended for new code', 'No', 'Yes (single-threaded)', 'Situational'],
    ],
  },

  diagrams: [
    {
      title: 'Vector growth: doubling vs ArrayList 1.5x',
      caption: 'A capacity-10 Vector doubles to 20 on overflow; the equivalent ArrayList would only grow to 15.',
      render: () => (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs w-28 text-slate-400">Vector (2x)</span>
            <DiagramBox label="10" tone="brand" />
            <DiagramArrow label="double" />
            <DiagramBox label="20" tone="green" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-28 text-slate-400">ArrayList (1.5x)</span>
            <DiagramBox label="10" tone="brand" />
            <DiagramArrow label="1.5x" />
            <DiagramBox label="15" tone="amber" />
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    {
      question: 'What makes Vector different from ArrayList at the API level?',
      options: ['Vector cannot hold nulls', 'Every Vector method is synchronized', 'Vector does not implement List', 'Vector cannot be resized'],
      answerIndex: 1,
      explanation: 'Structurally they are nearly identical resizable arrays; the defining difference is Vector\'s built-in per-method synchronization.',
    },
    {
      question: 'By what factor does Vector grow by default when it runs out of capacity?',
      options: ['1.5x', '2x', 'It never grows automatically', '10 elements at a time'],
      answerIndex: 1,
      explanation: 'Vector doubles its capacity by default, unless a capacityIncrement was specified in its constructor.',
    },
    {
      question: 'Is "if (!vector.contains(x)) vector.add(x)" atomic on a plain Vector?',
      options: ['Yes, because Vector is synchronized', 'No, external synchronization is still required', 'Only if x is null', 'Only in single-threaded programs'],
      answerIndex: 1,
      explanation: 'Each call is individually atomic, but nothing prevents interleaving between the two separate calls without an external lock.',
    },
    {
      question: 'Which legacy class extends Vector?',
      options: ['ArrayList', 'LinkedList', 'Stack', 'PriorityQueue'],
      answerIndex: 2,
      explanation: 'java.util.Stack extends Vector, inheriting its synchronized array-based List behavior.',
    },
  ],
};
