/* ==========================================================================
   CONTENT: Hashtable
   ========================================================================== */

CollectionsContent['hashtable'] = {

  overview: {
    paragraphs: [
      'Hashtable is a legacy Map implementation from Java 1.0, predating both the Collections Framework and HashMap. It stores key-value pairs in a hash table with every method synchronized on the Hashtable instance, and — unlike HashMap — disallows both null keys and null values entirely.',
      'It is retained in the JDK mainly for backward compatibility and because java.util.Properties (the standard mechanism for .properties configuration files) extends Hashtable<Object, Object> directly.',
      'For any new code, HashMap (single-threaded) or ConcurrentHashMap (concurrent) is almost always the better choice — Hashtable\'s coarse per-method locking is both slower than an unsynchronized HashMap and less scalable than ConcurrentHashMap\'s fine-grained concurrency design.',
    ],
    keyPoints: [
      'Legacy class from Java 1.0, later retrofitted to implement Map.',
      'Every method is synchronized on the Hashtable\'s own monitor — coarse-grained locking.',
      'Disallows both null keys and null values (throws NullPointerException for either).',
      'Default initial capacity 11, grows via `2 * oldCapacity + 1` (not a power of two, unlike HashMap).',
      'Superclass of java.util.Properties.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Structurally similar to HashMap — an array of buckets holding chained entries — but Hashtable computes bucket index using `(hash & 0x7FFFFFFF) % table.length`, a true modulo operation, since its capacity is not constrained to powers of two the way HashMap\'s is.',
      'Every public method (get, put, remove, size, even isEmpty) acquires the Hashtable\'s intrinsic lock before doing anything, so two threads calling get() concurrently still serialize behind one another — there is no reader/writer distinction at all.',
      'Because null is disallowed for both keys and values, Hashtable\'s get(key) returning null is an unambiguous signal that the key is genuinely absent — a guarantee HashMap cannot make (a HashMap key can legitimately be mapped to null).',
    ],
  },

  complexity: [
    { operation: 'get(key) / put(key, value) / remove(key)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Same shape as HashMap, plus lock acquisition overhead; no bucket treeification.' },
    { operation: 'containsValue(value)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Linear scan under lock.' },
  ],

  memory: {
    paragraphs: [
      'Per-entry memory overhead is comparable to HashMap\'s (a chained Entry object per key-value pair), though the default non-power-of-two capacity growth (2n+1) tends to produce slightly less predictable bucket distribution than HashMap\'s power-of-two-and-bitmask approach.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Every individual method call is atomic thanks to built-in synchronization, but — exactly like Vector and Stack — compound operations (e.g. "putIfAbsent implemented manually as containsKey then put") are not atomic unless you wrap the whole sequence in your own synchronized block on the Hashtable instance.',
      'For real concurrent workloads, ConcurrentHashMap provides both better throughput (fine-grained, bin-level locking instead of one global lock) and atomic compound operations (putIfAbsent, computeIfAbsent, merge) built in.',
    ],
  },

  iteration: {
    paragraphs: [
      'Hashtable supports both the legacy Enumeration (via keys()/elements(), which does not detect concurrent modification at all) and the modern fail-fast Iterator (via keySet()/entrySet()/values()). Prefer the modern iterator APIs in any code written today.',
    ],
  },

  ordering: {
    paragraphs: [
      'No ordering guarantee, the same as HashMap.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Hashtable throws NullPointerException on put(null, value), put(key, null), and get(null) — both null keys and null values are entirely disallowed, unlike HashMap.',
    ],
  },

  useCases: [
    { title: 'Reading/writing .properties files', description: 'java.util.Properties extends Hashtable<Object, Object>, so any code touching Properties is technically touching a Hashtable under the hood.' },
    { title: 'Maintaining legacy codebases', description: 'Existing systems already using Hashtable directly that have not been migrated.' },
    { title: 'Interfacing with legacy APIs expecting Enumeration', description: 'Some older libraries/JDK APIs still expose Hashtable or Enumeration-based contracts.' },
  ],

  springBootExamples: [
    {
      title: 'Loading application properties via the Properties/Hashtable API',
      description: 'A configuration loader reads a .properties resource, working directly with the Properties (Hashtable) API before exposing a cleaned-up modern Map to the rest of the app.',
      code:
`@Configuration
public class LegacyPropertiesLoader {

    @Bean
    public Map<String, String> legacyFeatureFlags() throws IOException {
        Properties properties = new Properties(); // extends Hashtable<Object, Object>
        try (InputStream in = getClass().getResourceAsStream("/feature-flags.properties")) {
            properties.load(in);
        }
        Map<String, String> flags = new HashMap<>();
        for (String name : properties.stringPropertyNames()) {
            flags.put(name, properties.getProperty(name));
        }
        return flags;
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'What are the two biggest practical differences between Hashtable and HashMap?', difficulty: 'Beginner', answer: 'Hashtable synchronizes every method (coarse-grained locking) and disallows both null keys and null values; HashMap has no synchronization and allows one null key plus any number of null values.' },
    { question: 'Why does Properties extend Hashtable instead of HashMap?', difficulty: 'Intermediate', answer: 'Properties predates the Collections Framework (Java 1.0, same era as Hashtable) and was designed for thread-safe access to configuration data from the start; it was never retrofitted onto the newer HashMap.' },
    { question: 'Is Hashtable\'s per-method synchronization enough to make a check-then-act sequence like "if absent, then put" atomic?', difficulty: 'Intermediate', answer: 'No — each individual call is atomic, but nothing prevents another thread from acting between two separate calls. You must wrap the whole sequence in an external synchronized(table) block, or better, migrate to ConcurrentHashMap\'s putIfAbsent().' },
    { question: 'What happens if you call hashtable.put(key, null)?', difficulty: 'Beginner', answer: 'It throws NullPointerException immediately — Hashtable treats a null value as meaningless/ambiguous and disallows it outright, unlike HashMap.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Convert a legacy Hashtable to a modern Map',
        statement: 'Given a Hashtable<String, Integer>, convert it into a modern HashMap for use with newer APIs.',
        code:
`import java.util.*;

public class HashtableToMap {
    public static void main(String[] args) {
        Hashtable<String, Integer> legacy = new Hashtable<>();
        legacy.put("apples", 10);
        legacy.put("bananas", 5);

        Map<String, Integer> modern = new HashMap<>(legacy);
        System.out.println(modern);
    }
}`,
        output: '{bananas=5, apples=10}',
      },
    ],
    intermediate: [
      {
        title: 'Demonstrate Hashtable\'s null rejection',
        statement: 'Show that both a null key and a null value are rejected by Hashtable, unlike HashMap.',
        code:
`import java.util.*;

public class HashtableNullRejection {
    public static void main(String[] args) {
        Hashtable<String, String> table = new Hashtable<>();
        try {
            table.put(null, "value");
        } catch (NullPointerException e) {
            System.out.println("Rejected null key");
        }
        try {
            table.put("key", null);
        } catch (NullPointerException e) {
            System.out.println("Rejected null value");
        }
    }
}`,
        output: 'Rejected null key\nRejected null value',
      },
    ],
    advanced: [],
  },

  realProjectScenarios: [
    {
      title: 'Reading legacy JNDI environment properties',
      domain: 'Banking',
      description: 'A legacy core-banking integration layer still configures a JNDI InitialContext using a Hashtable<String, String> of environment properties, as required by the javax.naming API contract.',
      code:
`public class LegacyJndiConnector {

    public InitialContext createContext() throws NamingException {
        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.legacycorebank.jndi.Factory");
        env.put(Context.PROVIDER_URL, "corebank://mainframe-gateway:1099");
        return new InitialContext(env); // JNDI's InitialContext constructor requires a Hashtable
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Wrapping a legacy Hashtable-returning API result',
      explanation: 'An integration layer immediately converts a third-party SDK\'s Hashtable<String, Object> result into a modern, immutable Map at the system boundary.',
      code:
`Hashtable<String, Object> legacyResult = legacySdk.fetchAccountMetadata();
Map<String, Object> metadata = Map.copyOf(legacyResult); // immutable modern boundary type`,
    },
  ],

  bestPractices: [
    'Do not choose Hashtable for new code — use HashMap (single-threaded) or ConcurrentHashMap (concurrent) instead.',
    'When forced to interoperate with an API requiring Hashtable (e.g. javax.naming), construct it right at that boundary and keep the rest of the codebase on modern Map types.',
    'Never rely on Hashtable\'s per-method synchronization alone for compound operations — wrap multi-step sequences in your own synchronized block.',
    'If you only need Hashtable because of Properties, prefer reading it into a plain Map immediately after loading.',
  ],

  commonMistakes: [
    {
      mistake: 'Assuming Hashtable behaves exactly like a synchronized HashMap with no other differences.',
      why: 'Hashtable additionally disallows null keys and null values entirely, which HashMap permits — code migrated from Hashtable to HashMap (or vice versa) can behave differently around nulls.',
      fix: 'Audit for null usage explicitly when migrating between the two, in either direction.',
    },
    {
      mistake: 'Choosing Hashtable "for thread safety" in new, performance-sensitive code.',
      why: 'Its single coarse lock serializes all access — reads block writes and other reads — which scales far worse than ConcurrentHashMap\'s fine-grained locking under real concurrency.',
      fix: 'Use ConcurrentHashMap, which was designed from scratch for exactly this scenario.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'Hashtable', 'HashMap', 'ConcurrentHashMap'],
    rows: [
      ['Introduced', 'Java 1.0', 'Java 1.2', 'Java 1.5'],
      ['Synchronization', 'Built-in, per-method (coarse)', 'None', 'Fine-grained, bin-level'],
      ['Null keys/values', 'Neither allowed', '1 null key, many null values', 'Neither allowed'],
      ['Legacy Enumeration support', 'Yes', 'No', 'No'],
      ['Recommended for new code', 'No', 'Yes (single-threaded)', 'Yes (concurrent)'],
    ],
  },

  diagrams: [
    {
      title: 'Capacity growth: Hashtable vs HashMap',
      caption: 'Hashtable grows via 2n+1 (non-power-of-two, true modulo indexing); HashMap always doubles to a power of two (bitmask indexing).',
      render: () => (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs w-32 text-slate-400">Hashtable (2n+1)</span>
            <DiagramBox label="11" tone="brand" />
            <DiagramArrow />
            <DiagramBox label="23" tone="green" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-32 text-slate-400">HashMap (2n)</span>
            <DiagramBox label="16" tone="brand" />
            <DiagramArrow />
            <DiagramBox label="32" tone="amber" />
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'Which null-handling rule is correct for Hashtable?', options: ['Allows null keys, disallows null values', 'Allows null values, disallows null keys', 'Disallows both null keys and null values', 'Allows both, like HashMap'], answerIndex: 2, explanation: 'Hashtable rejects both null keys and null values with NullPointerException.' },
    { question: 'What well-known JDK class extends Hashtable?', options: ['System', 'Properties', 'Runtime', 'Collections'], answerIndex: 1, explanation: 'java.util.Properties extends Hashtable<Object, Object>.' },
    { question: 'How does Hashtable compute its bucket index, compared to HashMap?', options: ['Identical bitmask approach', 'A true modulo operation, since capacity is not a power of two', 'Hashtable does not use buckets at all', 'It uses a red-black tree'], answerIndex: 1, explanation: 'Hashtable capacity follows a 2n+1 growth pattern, so it must use `% table.length` rather than a bitmask.' },
    { question: 'Is Hashtable\'s synchronization sufficient to make "check then put" atomic without extra locking?', options: ['Yes, always', 'No, external synchronization is still required for compound operations', 'Only for null values', 'Only in single-threaded programs'], answerIndex: 1, explanation: 'Each call is individually atomic, but the sequence of two calls is not, exactly as with Vector.' },
  ],
};
