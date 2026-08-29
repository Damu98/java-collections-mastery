/* ==========================================================================
   CONTENT: EnumSet
   ========================================================================== */

CollectionsContent['enumset'] = {

  overview: {
    paragraphs: [
      'EnumSet is a highly specialized Set implementation exclusively for enum types. Instead of hash buckets or tree nodes, it represents membership internally as a bit vector — a single long (RegularEnumSet, for enums with up to 64 constants) or a long[] (JumboEnumSet, for larger enums) — making it extraordinarily compact and fast.',
      'Every operation (add, remove, contains, union, intersection, complement) becomes a simple bitwise operation (OR, AND, NOT) on machine words, which is why EnumSet is routinely faster than even HashSet for its narrow use case.',
      'EnumSet is abstract — you never call `new EnumSet<>()` directly. Instead you use its static factory methods: noneOf(), allOf(), of(...), range(from, to), and complementOf(otherSet).',
    ],
    keyPoints: [
      'Backed by a bit vector (a long, or a long[] for enums with more than 64 constants) — not hash buckets or tree nodes.',
      'Every operation is effectively O(1) — a single bitwise instruction (or a small, fixed number for JumboEnumSet).',
      'Iterates in the enum constants\' natural declaration order (ordinal order), never insertion order.',
      'Does not permit null elements (throws NullPointerException).',
      'Created exclusively via static factories: noneOf(), allOf(), of(), range(), complementOf(); there is no public constructor.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'Each enum constant has an implicit ordinal() (its declaration position, starting at 0). EnumSet maps membership directly onto bit positions: bit `i` of the internal long represents "is the enum constant with ordinal i present in this set?".',
      'add(e) is `elements |= (1L << e.ordinal())`; remove(e) is `elements &= ~(1L << e.ordinal())`; contains(e) is `(elements & (1L << e.ordinal())) != 0` — all single machine instructions, with no hashing, comparison chains, or tree traversal whatsoever.',
      'Union (addAll), intersection (retainAll), and difference (removeAll) between two EnumSets of the same enum type become single bitwise OR / AND / AND-NOT operations across the entire set at once — this is dramatically faster than the element-by-element loops a general-purpose Set must perform for the same operations.',
      'If the enum has more than 64 constants, EnumSet transparently switches to JumboEnumSet, which uses a long[] and performs the equivalent bitwise operations word-by-word — the API is identical either way.',
    ],
  },

  complexity: [
    { operation: 'add(e) / remove(e) / contains(e)', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'A single bitwise operation on a machine word.' },
    { operation: 'addAll / retainAll / removeAll (same enum type)', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'A single word-level OR/AND/AND-NOT; O(k) words for JumboEnumSet with k = number of 64-bit words needed.' },
    { operation: 'iteration', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'n = number of enum constants in the universe, scanning set bits in ordinal order.' },
  ],

  memory: {
    paragraphs: [
      'A RegularEnumSet uses a single 8-byte long regardless of how many of its (up to 64) constants are present — dramatically smaller than any hash- or tree-based Set, which pay per-element node/bucket overhead.',
      'This makes EnumSet an excellent choice for representing flags, feature toggles, and small finite state sets that are created and discarded frequently (e.g. per-request permission sets), since allocation and garbage collection pressure are minimal.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'EnumSet is not synchronized. Wrap with Collections.synchronizedSet(EnumSet.noneOf(MyEnum.class)) if shared mutably across threads — though in practice EnumSets are so cheap to copy that many concurrent designs simply hand out immutable snapshots instead of sharing a mutable instance.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iteration always proceeds in the enum\'s natural (ordinal/declaration) order, never insertion order — this is a fixed property of the bit-vector representation, not a configurable choice like it is for LinkedHashSet.',
      'The iterator is fail-fast with respect to structural modification during iteration, consistent with the rest of the framework, though in practice EnumSet is often built once and treated as effectively immutable.',
    ],
  },

  ordering: {
    paragraphs: [
      'Always ordinal order — the order the enum constants are declared in the source file — regardless of the order elements were added to the set.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'EnumSet does not permit null elements; add(null) and similar operations throw NullPointerException, since null has no ordinal to map to a bit position.',
    ],
  },

  useCases: [
    { title: 'Representing flags and feature toggles', description: 'A compact, type-safe alternative to old-style bitmask int constants (e.g. Font.BOLD | Font.ITALIC-style APIs), with full compile-time checking.' },
    { title: 'Valid state-transition sets', description: 'Modeling "which OrderStatus values can this order legally transition to from here" as an EnumSet per current state.' },
    { title: 'Days-of-week / scheduling rules', description: 'e.g. EnumSet.of(SATURDAY, SUNDAY) for "weekend delivery days", combined via union/intersection with other rule sets.' },
    { title: 'Permission/role bit sets', description: 'A compact representation of "which of a fixed, small set of permissions does this role grant" with O(1) checks.' },
  ],

  springBootExamples: [
    {
      title: 'Order status transition validator using EnumSet',
      description: 'An order-processing service defines, per status, the set of statuses it may legally transition to, using EnumSet for both compactness and fast contains() checks.',
      code:
`public enum OrderStatus { CREATED, PAID, SHIPPED, DELIVERED, CANCELLED, REFUNDED }

@Service
public class OrderStatusTransitionService {

    private static final Map<OrderStatus, EnumSet<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
        OrderStatus.CREATED,   EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED),
        OrderStatus.PAID,      EnumSet.of(OrderStatus.SHIPPED, OrderStatus.REFUNDED),
        OrderStatus.SHIPPED,   EnumSet.of(OrderStatus.DELIVERED),
        OrderStatus.DELIVERED, EnumSet.of(OrderStatus.REFUNDED),
        OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class),
        OrderStatus.REFUNDED,  EnumSet.noneOf(OrderStatus.class)
    );

    public boolean canTransition(OrderStatus from, OrderStatus to) {
        return ALLOWED_TRANSITIONS.getOrDefault(from, EnumSet.noneOf(OrderStatus.class)).contains(to);
    }
}`,
    },
    {
      title: 'Feature-flag set resolved per request',
      description: 'A Spring web filter computes an EnumSet<Feature> of active feature flags for the current user, combining a base set with user-specific overrides via union/intersection.',
      code:
`public enum Feature { NEW_CHECKOUT, DARK_MODE, BETA_SEARCH, EXPRESS_SHIPPING }

@Component
public class FeatureResolver {

    private static final EnumSet<Feature> DEFAULT_FEATURES = EnumSet.of(Feature.DARK_MODE);

    public EnumSet<Feature> resolveFor(User user) {
        EnumSet<Feature> features = EnumSet.copyOf(DEFAULT_FEATURES);
        if (user.isBetaTester()) {
            features.addAll(EnumSet.of(Feature.BETA_SEARCH, Feature.NEW_CHECKOUT));
        }
        return features;
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why is EnumSet so much faster than HashSet for enum elements?', difficulty: 'Intermediate', answer: 'EnumSet represents membership as bits in a long (or long[]) indexed by each constant\'s ordinal(), so add/remove/contains are single bitwise operations with no hashing, no equals() calls, and no object allocation per element — versus HashSet\'s bucket lookup and chain traversal.' },
    { question: 'Can you call `new EnumSet<Color>()` directly?', difficulty: 'Beginner', answer: 'No — EnumSet is abstract. You must use one of its static factory methods: noneOf(Class), allOf(Class), of(e1, e2, ...), range(from, to), or copyOf(collection).' },
    { question: 'What determines EnumSet\'s iteration order?', difficulty: 'Beginner', answer: 'The natural ordinal (declaration) order of the enum\'s constants — always, regardless of insertion order, because that order is fixed by the bit-position mapping itself.' },
    { question: 'How does EnumSet decide between RegularEnumSet and JumboEnumSet?', difficulty: 'Advanced', answer: 'The static factory methods check the enum type\'s constant count: 64 or fewer uses RegularEnumSet (backed by a single long); more than 64 uses JumboEnumSet (backed by a long[]) — this happens transparently and the public API is identical either way.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Represent and check weekend delivery days',
        statement: 'Model an enum of Day and use EnumSet to represent "weekend" days, checking membership.',
        code:
`import java.util.EnumSet;

public class WeekendCheck {
    enum Day { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }

    public static void main(String[] args) {
        EnumSet<Day> weekend = EnumSet.of(Day.SATURDAY, Day.SUNDAY);
        System.out.println(weekend.contains(Day.SATURDAY));
        System.out.println(weekend.contains(Day.MONDAY));
        System.out.println(weekend);
    }
}`,
        output: 'true\nfalse\n[SATURDAY, SUNDAY]',
      },
    ],
    intermediate: [
      {
        title: 'Compute the complement of a permission set',
        statement: 'Given a small enum of Permission constants and a granted EnumSet, compute the set of permissions NOT granted using complementOf().',
        code:
`import java.util.EnumSet;

public class PermissionComplement {
    enum Permission { READ, WRITE, DELETE, ADMIN, EXPORT }

    public static void main(String[] args) {
        EnumSet<Permission> granted = EnumSet.of(Permission.READ, Permission.WRITE);
        EnumSet<Permission> notGranted = EnumSet.complementOf(granted);

        System.out.println("Granted: " + granted);
        System.out.println("Not granted: " + notGranted);
    }
}`,
        output: 'Granted: [READ, WRITE]\nNot granted: [DELETE, ADMIN, EXPORT]',
      },
    ],
    advanced: [
      {
        title: 'Validate legal order-status transitions using a Map<Status, EnumSet<Status>>',
        statement: 'Build a state machine for an OrderStatus enum where each status maps to its EnumSet of legal next statuses, and reject illegal transitions.',
        code:
`import java.util.*;

public class OrderStateMachine {
    enum Status { CREATED, PAID, SHIPPED, DELIVERED, CANCELLED }

    private static final Map<Status, EnumSet<Status>> TRANSITIONS = new EnumMap<>(Status.class);
    static {
        TRANSITIONS.put(Status.CREATED, EnumSet.of(Status.PAID, Status.CANCELLED));
        TRANSITIONS.put(Status.PAID, EnumSet.of(Status.SHIPPED));
        TRANSITIONS.put(Status.SHIPPED, EnumSet.of(Status.DELIVERED));
        TRANSITIONS.put(Status.DELIVERED, EnumSet.noneOf(Status.class));
        TRANSITIONS.put(Status.CANCELLED, EnumSet.noneOf(Status.class));
    }

    public static void transition(Status from, Status to) {
        if (!TRANSITIONS.getOrDefault(from, EnumSet.noneOf(Status.class)).contains(to)) {
            throw new IllegalStateException("Cannot transition from " + from + " to " + to);
        }
        System.out.println(from + " -> " + to + " OK");
    }

    public static void main(String[] args) {
        transition(Status.CREATED, Status.PAID);
        transition(Status.PAID, Status.SHIPPED);
        try {
            transition(Status.SHIPPED, Status.CANCELLED);
        } catch (IllegalStateException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}`,
        output: 'CREATED -> PAID OK\nPAID -> SHIPPED OK\nRejected: Cannot transition from SHIPPED to CANCELLED',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Compact role-permission bit sets for a hospital records system',
      domain: 'Healthcare',
      description: 'Access control for patient records uses EnumSet<Permission> per role, so millions of per-request permission checks stay allocation-light and O(1), which matters under strict audit-logging latency budgets.',
      code:
`public enum Permission { VIEW_CHART, EDIT_CHART, PRESCRIBE, VIEW_BILLING, ADMIN }

public class RolePermissions {

    private static final Map<String, EnumSet<Permission>> ROLE_PERMISSIONS = Map.of(
        "NURSE",    EnumSet.of(Permission.VIEW_CHART),
        "DOCTOR",   EnumSet.of(Permission.VIEW_CHART, Permission.EDIT_CHART, Permission.PRESCRIBE),
        "BILLING",  EnumSet.of(Permission.VIEW_BILLING),
        "ADMIN",    EnumSet.allOf(Permission.class)
    );

    public boolean roleHasPermission(String role, Permission permission) {
        return ROLE_PERMISSIONS.getOrDefault(role, EnumSet.noneOf(Permission.class)).contains(permission);
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-user active feature flags: Map<String, EnumSet<Feature>>',
      explanation: 'An experimentation platform keeps each user\'s active EnumSet<Feature> in a map, merging cohort-level and user-level overrides via addAll()/retainAll().',
      code:
`public enum Feature { NEW_CHECKOUT, DARK_MODE, BETA_SEARCH }

Map<String, EnumSet<Feature>> activeFeaturesByUser = new HashMap<>();

activeFeaturesByUser.put("user-42", EnumSet.of(Feature.DARK_MODE, Feature.BETA_SEARCH));

boolean hasBetaSearch = activeFeaturesByUser
    .getOrDefault("user-42", EnumSet.noneOf(Feature.class))
    .contains(Feature.BETA_SEARCH);`,
    },
  ],

  bestPractices: [
    'Always create EnumSet via its static factories (noneOf, allOf, of, range, copyOf) — there is no public constructor.',
    'Prefer EnumSet over int-based bitmask constants for flags — it gives you full type safety and readability with the same bitwise performance under the hood.',
    'Use complementOf() instead of manually computing "everything except this subset" — it is both clearer and avoids off-by-one mistakes.',
    'Pair EnumSet with EnumMap when you need "for each enum constant, an associated EnumSet" — both are specialized for the same enum-ordinal-indexed performance profile.',
  ],

  commonMistakes: [
    {
      mistake: 'Trying to instantiate EnumSet with `new EnumSet<>()`.',
      why: 'EnumSet is an abstract class specifically to allow the JDK to choose RegularEnumSet or JumboEnumSet transparently based on the enum\'s constant count.',
      fix: 'Use a static factory: EnumSet.noneOf(MyEnum.class), EnumSet.of(...), EnumSet.allOf(...), etc.',
    },
    {
      mistake: 'Mixing EnumSets of two different enum types in a single addAll()/retainAll() call.',
      why: 'EnumSet operations assume a single, shared enum universe for their bitwise implementation — mixing types is a compile-time type error, but code that erases types via raw usage can hit confusing runtime failures.',
      fix: 'Keep EnumSet<T> strictly typed per enum type; use generics consistently instead of raw types.',
    },
    {
      mistake: 'Assuming EnumSet iteration reflects insertion order.',
      why: 'Iteration order is always the enum\'s ordinal (declaration) order, never insertion order, due to the underlying bit-vector representation.',
      fix: 'If insertion order genuinely matters, use a LinkedHashSet<MyEnum> instead — you lose EnumSet\'s performance advantage but gain insertion-order iteration.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'EnumSet', 'HashSet<Enum>', 'Traditional int bitmask'],
    rows: [
      ['Backing structure', 'long / long[] bit vector', 'HashMap buckets', 'Raw int/long with manual bit ops'],
      ['add/contains', 'O(1), single bitwise op', 'O(1) average, hashing + equals()', 'O(1), single bitwise op'],
      ['Type safety', 'Full (enum-typed)', 'Full (enum-typed)', 'None (plain int constants)'],
      ['Allows null', 'No', 'One null', 'N/A'],
      ['Readability', 'High (named constants, Set API)', 'High', 'Low (magic numbers, manual masks)'],
    ],
  },

  diagrams: [
    {
      title: 'Bit vector representation',
      caption: 'For `enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }`, EnumSet.of(SAT, SUN) sets bits 5 and 6.',
      render: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
              <DiagramBox key={day} label={i === 5 || i === 6 ? '1' : '0'} sub={day} tone={i === 5 || i === 6 ? 'green' : 'slate'} index={i} />
            ))}
          </div>
          <p className="text-xs text-slate-400">Bit i corresponds to the enum constant with ordinal() == i.</p>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does EnumSet use internally to represent element membership?', options: ['A hash table', 'A red-black tree', 'A bit vector (long or long[])', 'A doubly-linked list'], answerIndex: 2, explanation: 'Membership is encoded as bits indexed by each constant\'s ordinal(), stored in a long (or long[] for large enums).' },
    { question: 'How do you create an EnumSet containing no elements of a given enum type?', options: ['new EnumSet<MyEnum>()', 'EnumSet.noneOf(MyEnum.class)', 'EnumSet.empty(MyEnum.class)', 'Collections.emptySet()'], answerIndex: 1, explanation: 'EnumSet is abstract; noneOf(Class) is the correct static factory for an empty set of a given enum type.' },
    { question: 'What iteration order does EnumSet always use?', options: ['Insertion order', 'Ordinal (declaration) order', 'Reverse ordinal order', 'Unspecified, like HashSet'], answerIndex: 1, explanation: 'Iteration always follows the enum constants\' natural ordinal order, a direct consequence of the bit-vector representation.' },
    { question: 'What does EnumSet.complementOf(set) return?', options: ['A copy of set', 'An empty set', 'All constants of the enum type NOT in set', 'A set sorted in reverse'], answerIndex: 2, explanation: 'complementOf() computes the set difference between the full enum universe and the given set.' },
    { question: 'Can an EnumSet contain null?', options: ['Yes, up to one null', 'Yes, unlimited nulls', 'No, it throws NullPointerException', 'Only if the enum has a NULL constant'], answerIndex: 2, explanation: 'null has no ordinal(), so it cannot be mapped to a bit position — add(null) throws NullPointerException.' },
  ],
};
