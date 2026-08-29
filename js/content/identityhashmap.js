/* ==========================================================================
   CONTENT: IdentityHashMap
   ========================================================================== */

CollectionsContent['identityhashmap'] = {

  overview: {
    paragraphs: [
      'IdentityHashMap is a deliberately rule-breaking Map: instead of using equals()/hashCode() to compare keys (and values, for containsValue()), it uses reference identity — the == operator and System.identityHashCode() — meaning two distinct objects that are "equal" by every normal Java convention are still treated as completely different keys.',
      'Its javadoc is explicit that this violates the general Map contract on purpose, for a narrow but important class of use cases: algorithms that operate over object graphs (serialization, deep cloning, cycle detection) where you specifically need "have I already processed this exact object instance" rather than "have I already processed an object that happens to be equal to this one".',
      'Internally it also uses a different physical layout than HashMap — a single flat Object[] array storing alternating key/value slots with linear-probing collision resolution, rather than chained buckets — making it both simpler and, for its narrow use case, quite memory-efficient.',
    ],
    keyPoints: [
      'Uses reference identity (==) instead of equals() for key comparison — and for containsValue(), for values too.',
      'Backed by a single flat Object[] array (alternating keys and values) using open addressing / linear probing, not chained buckets.',
      'O(1) average time complexity, same big-O shape as HashMap.',
      'Allows null keys and null values.',
      'Explicitly documented as breaking the general Map contract — use it only when you specifically need identity semantics.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Instead of an array of bucket chains, IdentityHashMap uses one flat array where keys and values are stored at alternating indices (key at index 2i, its value at index 2i+1). The bucket index for a key is derived from System.identityHashCode(key) — the identity hash code, which is not overridable by the object\'s class (unlike hashCode()) — rather than key.hashCode().',
      'On a collision (another key already occupies the computed slot), IdentityHashMap uses linear probing: it simply scans forward to the next available slot, rather than building a linked chain the way HashMap does. This keeps the implementation simple and cache-friendly, at the cost of potentially longer probe sequences under heavy load compared to HashMap\'s bucket chaining.',
      'Because comparisons use == rather than equals(), lookups never call the key\'s equals() or hashCode() methods at all — which also means IdentityHashMap is immune to malicious or broken equals()/hashCode() overrides on the key type, a property some security-sensitive graph-traversal code specifically relies on.',
    ],
  },

  complexity: [
    { operation: 'get(key) / put(key, value) / remove(key)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Linear probing; worst case under very high load factor with many collisions.' },
    { operation: 'containsValue(value)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Also compares by reference identity (==), not equals().' },
  ],

  memory: {
    paragraphs: [
      'A single flat Object[] array with no per-entry Node/Entry wrapper objects tends to be more memory-compact per entry than HashMap\'s chained-node design, since there is no separate object allocation per key-value pair beyond the array slots themselves.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'IdentityHashMap is not synchronized. Wrap with Collections.synchronizedMap(new IdentityHashMap<>()) for coarse external synchronization if shared across threads.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iteration is fail-fast, consistent with the rest of the framework, and gives no ordering guarantee — order reflects the internal flat-array layout, driven by identity hash codes rather than equals()-based hash codes.',
    ],
  },

  ordering: {
    paragraphs: [
      'No ordering guarantee, similar in spirit to HashMap, though the internal array layout mechanics differ (linear probing vs bucket chaining).',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Allows a null key and null values, since reference-identity comparison handles null identically to any other reference value (null == null is well-defined).',
    ],
  },

  useCases: [
    { title: 'Cycle detection during object-graph traversal', description: 'Deep-clone/deep-copy utilities and custom serialization frameworks that must track "have I already visited this exact node" to correctly handle cyclic object graphs.' },
    { title: 'Topology-preserving serialization', description: 'Serialization formats that need to preserve shared-reference structure (two fields pointing at the exact same object) rather than treating equal-but-distinct objects interchangeably.' },
    { title: 'Tooling that must distinguish object identity by design', description: 'IDE/AST/bytecode-manipulation tools, and certain proxy/interception frameworks, where two "equal" instances must genuinely be treated as different keys.' },
  ],

  springBootExamples: [
    {
      title: 'Deep-copy utility for a complex domain object graph',
      description: 'An order-processing service deep-copies a potentially cyclic object graph (e.g. an Order referencing a Customer which references their Orders) using IdentityHashMap to avoid infinite recursion and preserve shared references correctly.',
      code:
`@Component
public class DeepCopyService {

    public <T> T deepCopy(T original, Map<Object, Object> visited) {
        if (original == null) return null;
        if (visited.containsKey(original)) {
            @SuppressWarnings("unchecked")
            T alreadyCopied = (T) visited.get(original);
            return alreadyCopied;
        }
        T copy = ObjectCloner.shallowClone(original);
        visited.put(original, copy); // register BEFORE recursing into fields, to break cycles
        ObjectCloner.deepCopyFieldsInto(original, copy, this, visited);
        return copy;
    }

    public <T> T deepCopy(T original) {
        return deepCopy(original, new IdentityHashMap<>());
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'How does IdentityHashMap decide whether two keys are "the same"?', difficulty: 'Beginner', answer: 'By reference identity (the == operator / System.identityHashCode()), not by equals()/hashCode(). Two distinct objects that are equals()-equal are still treated as two separate keys.' },
    { question: 'Why would cycle-detecting object-graph algorithms specifically prefer IdentityHashMap over a regular HashMap?', difficulty: 'Advanced', answer: 'Because a deep-copy or serialization traversal needs to know "have I already visited this exact object instance", not "have I visited an object that happens to be equal to it" — two distinct-but-equal nodes in the graph must still be copied/serialized separately, and a regular HashMap keyed by equals() would incorrectly conflate them.' },
    { question: 'What collision-resolution strategy does IdentityHashMap use, and how does it differ from HashMap\'s?', difficulty: 'Advanced', answer: 'Linear probing over a single flat array (scanning forward for the next open slot), versus HashMap\'s chained linked lists (or trees) per bucket. This keeps IdentityHashMap simpler and often more compact, at the cost of potentially longer probe sequences under high load.' },
    { question: 'Does IdentityHashMap call a key\'s equals() or hashCode() methods at all?', difficulty: 'Intermediate', answer: 'No — it uses System.identityHashCode() (not overridable) for hashing and == for comparison, entirely bypassing whatever equals()/hashCode() the key\'s class defines.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Demonstrate the identity-vs-equality difference',
        statement: 'Show that two equals()-equal String instances are treated as different keys by IdentityHashMap but the same key by HashMap.',
        code:
`import java.util.*;

public class IdentityVsEquality {
    public static void main(String[] args) {
        String a = new String("hello");
        String b = new String("hello");
        System.out.println(a.equals(b)); // true: same content
        System.out.println(a == b);      // false: different objects

        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put(a, 1);
        hashMap.put(b, 2); // overwrites the entry for "a", since a.equals(b)
        System.out.println("HashMap size: " + hashMap.size());

        Map<String, Integer> identityMap = new IdentityHashMap<>();
        identityMap.put(a, 1);
        identityMap.put(b, 2); // kept as a SEPARATE entry, since a != b
        System.out.println("IdentityHashMap size: " + identityMap.size());
    }
}`,
        output: 'true\nfalse\nHashMap size: 1\nIdentityHashMap size: 2',
      },
    ],
    intermediate: [
      {
        title: 'Detect a cycle while traversing a linked object graph',
        statement: 'Given a graph of Node objects that may contain a cycle, use IdentityHashMap to detect the cycle instead of looping forever.',
        code:
`import java.util.*;

public class CycleDetector {

    static class Node {
        String name;
        Node next;
        Node(String name) { this.name = name; }
    }

    public static boolean hasCycle(Node start) {
        Map<Node, Boolean> visited = new IdentityHashMap<>();
        Node current = start;
        while (current != null) {
            if (visited.containsKey(current)) {
                return true;
            }
            visited.put(current, true);
            current = current.next;
        }
        return false;
    }

    public static void main(String[] args) {
        Node a = new Node("A");
        Node b = new Node("B");
        Node c = new Node("C");
        a.next = b;
        b.next = c;
        c.next = a; // cycle!

        System.out.println(hasCycle(a));
    }
}`,
        output: 'true',
      },
    ],
    advanced: [
      {
        title: 'Deep clone a cyclic object graph using IdentityHashMap',
        statement: 'Deep-copy a graph of nodes that may reference each other cyclically, preserving the exact reference structure without infinite recursion.',
        code:
`import java.util.*;

public class GraphDeepCopy {

    static class Node {
        String label;
        Node friend;
        Node(String label) { this.label = label; }
    }

    public static Node deepCopy(Node original, Map<Node, Node> visited) {
        if (original == null) return null;
        if (visited.containsKey(original)) {
            return visited.get(original); // already copied — reuse to preserve shared structure
        }
        Node copy = new Node(original.label);
        visited.put(original, copy); // register before recursing to break cycles
        copy.friend = deepCopy(original.friend, visited);
        return copy;
    }

    public static void main(String[] args) {
        Node a = new Node("A");
        Node b = new Node("B");
        a.friend = b;
        b.friend = a; // cyclic reference

        Node copyA = deepCopy(a, new IdentityHashMap<>());
        System.out.println(copyA.label + " -> " + copyA.friend.label + " -> " + copyA.friend.friend.label);
        System.out.println(copyA != a && copyA.friend.friend == copyA); // copy preserves the cycle
    }
}`,
        output: 'A -> B -> A\ntrue',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Undo-history deep snapshot for a hospital records editing tool',
      domain: 'Healthcare',
      description: 'A clinical documentation editor snapshots a potentially cyclic object graph of chart entries and cross-references for undo support, using IdentityHashMap during the copy to correctly preserve shared references and avoid infinite loops.',
      code:
`public class ChartSnapshotService {

    public ChartEntry snapshot(ChartEntry root) {
        return deepCopy(root, new IdentityHashMap<>());
    }

    private ChartEntry deepCopy(ChartEntry original, Map<Object, Object> visited) {
        if (original == null) return null;
        if (visited.containsKey(original)) {
            return (ChartEntry) visited.get(original);
        }
        ChartEntry copy = original.shallowCopy();
        visited.put(original, copy);
        copy.setCrossReferences(deepCopyList(original.getCrossReferences(), visited));
        return copy;
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Identity-based visited set nested inside a graph-processing algorithm',
      explanation: 'A dependency-graph resolver tracks visited modules by identity (not equals()) since two distinct module instances with identical names should still be processed separately during this pass.',
      code:
`Map<Module, Set<Module>> dependencyGraph = buildDependencyGraph();
Map<Module, Boolean> visited = new IdentityHashMap<>();

for (Module module : dependencyGraph.keySet()) {
    if (!visited.containsKey(module)) {
        resolveDependenciesDepthFirst(module, dependencyGraph, visited);
    }
}`,
    },
  ],

  bestPractices: [
    'Reach for IdentityHashMap only for the narrow class of problems that specifically require reference-identity semantics — object-graph traversal, cycle detection, and topology-preserving deep copy/serialization.',
    'Never use it as a general-purpose Map substitute — for ordinary business data keyed by ID/name/value, equals()-based HashMap is almost always what you actually want.',
    'Document clearly at the point of use why identity semantics are required, since it is a surprising and easy-to-misuse deviation from every other Map in the framework.',
  ],

  commonMistakes: [
    {
      mistake: 'Using IdentityHashMap for regular business-data lookups (e.g. keyed by a String ID).',
      why: 'Two different String instances with the same content are treated as different keys, so lookups can mysteriously "miss" even when the content clearly matches.',
      fix: 'Use a regular HashMap (or TreeMap/LinkedHashMap as appropriate) for any key comparison that should be based on logical equality.',
    },
    {
      mistake: 'Assuming IdentityHashMap respects the general Map/Object contracts (e.g. that map.get(key) works if key.equals(originalKey)).',
      why: 'The class explicitly documents that it violates the general contract by design — only exact reference identity finds an entry.',
      fix: 'Only choose IdentityHashMap when identity semantics are precisely the behavior you want, and keep its usage well-contained and well-commented.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'IdentityHashMap', 'HashMap', 'WeakHashMap'],
    rows: [
      ['Key comparison', 'Reference identity (==)', 'equals()/hashCode()', 'equals()/hashCode() (on weakly-held keys)'],
      ['Collision resolution', 'Linear probing (flat array)', 'Chaining (+ tree for large buckets)', 'Chaining (HashMap-based)'],
      ['Typical use', 'Graph traversal, cycle detection, deep copy', 'General-purpose storage', 'Auxiliary metadata that must not leak'],
      ['Calls key.equals()/hashCode()?', 'No', 'Yes', 'Yes'],
    ],
  },

  diagrams: [
    {
      title: 'Reference identity vs logical equality',
      caption: 'Two distinct String objects with identical content are the SAME key in a HashMap but DIFFERENT keys in an IdentityHashMap.',
      render: () => (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <DiagramBox label={'"hi" (obj A)'} tone="brand" />
            <DiagramBox label={'"hi" (obj B)'} tone="brand" />
            <span className="text-xs text-slate-400">a.equals(b) = true, a == b = false</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">HashMap</span>
              <DiagramBox label="1 entry" tone="green" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">IdentityHashMap</span>
              <DiagramBox label="2 entries" tone="amber" />
            </div>
          </div>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does IdentityHashMap use to compare keys?', options: ['equals()', 'hashCode() only', 'Reference identity (==)', 'compareTo()'], answerIndex: 2, explanation: 'It deliberately uses == and System.identityHashCode() instead of equals()/hashCode().' },
    { question: 'What collision-resolution strategy does IdentityHashMap use internally?', options: ['Chained linked lists', 'Red-black tree per bucket', 'Linear probing in a flat array', 'Cuckoo hashing'], answerIndex: 2, explanation: 'Unlike HashMap\'s chaining, IdentityHashMap uses a single flat array with linear probing.' },
    { question: 'Why is IdentityHashMap useful for deep-copying cyclic object graphs?', options: ['It is faster than HashMap in general', 'It tracks visited objects by exact instance, correctly handling shared references and cycles', 'It automatically clones objects', 'It supports null values only'], answerIndex: 1, explanation: 'Identity-based tracking correctly distinguishes distinct-but-equal nodes and detects revisits by exact reference.' },
    { question: 'Does IdentityHashMap call a key\'s overridden equals() method?', options: ['Yes, always', 'No, never', 'Only for null keys', 'Only during resize'], answerIndex: 1, explanation: 'It bypasses equals()/hashCode() entirely in favor of reference identity.' },
  ],
};
