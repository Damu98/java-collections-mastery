/* ==========================================================================
   CONTENT: EnumMap
   ========================================================================== */

CollectionsContent['enummap'] = {

  overview: {
    paragraphs: [
      'EnumMap is a specialized Map implementation exclusively for enum keys, backed internally by a simple array indexed directly by each key\'s ordinal() — no hashing, no buckets, no collisions are even possible by construction.',
      'This makes EnumMap both extremely fast (true O(1), not just average-case O(1)) and extremely compact (one array slot per possible enum constant, regardless of how many are actually populated), while also giving you a useful, deterministic bonus: iteration always follows the enum\'s natural declaration order.',
      'It is the map-flavored sibling of EnumSet — the two are almost always reached for together whenever an enum represents a small, fixed universe of states, flags, or categories.',
    ],
    keyPoints: [
      'Backed by a plain array sized to the enum type\'s constant count, indexed by ordinal().',
      'True O(1) for get/put/remove/containsKey — no hashing, no collisions possible.',
      'Iterates in the enum\'s natural (ordinal) order, always — never insertion order.',
      'Requires all keys to be constants of a single specified enum type (given via the constructor or inferred from the first entry).',
      'Does not permit a null key (throws NullPointerException); null values are permitted.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'EnumMap holds two parallel internal arrays sized to the enum type\'s total number of constants: one tracking whether each ordinal position currently has a mapping, and one holding the actual values (using a private sentinel to distinguish "no mapping" from "mapped to null").',
      'put(key, value) is essentially `values[key.ordinal()] = value` (plus bookkeeping); get(key) is `values[key.ordinal()]` — both are direct array index operations with no hash computation, no equals() calls, and no possibility of a collision, since every enum constant maps to a unique, fixed ordinal.',
      'Because iteration walks the array in index order, and index corresponds directly to ordinal() (which is assigned in declaration order), iteration always proceeds in the enum\'s natural declared order — a property that falls out of the implementation for free, rather than being separately maintained the way LinkedHashMap maintains its linked list.',
    ],
  },

  complexity: [
    { operation: 'get(key) / put(key, value) / remove(key) / containsKey(key)', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Direct array index by ordinal(); no hashing or collisions possible.' },
    { operation: 'iteration', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'n = number of enum constants in the type\'s universe; walks the array in ordinal order.' },
  ],

  memory: {
    paragraphs: [
      'An EnumMap allocates arrays sized to the enum type\'s total constant count, regardless of how many entries are actually populated — for small enums (the common case: a handful of statuses, days, directions) this is far more compact than a HashMap\'s bucket array plus per-entry Node objects.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'EnumMap is not synchronized. Wrap with Collections.synchronizedMap(new EnumMap<>(...)) for coarse external synchronization if shared mutably across threads.',
    ],
  },

  iteration: {
    paragraphs: [
      'Iteration always proceeds in the enum\'s natural ordinal (declaration) order, regardless of the order keys were inserted — a fixed, deterministic property of the array-backed design. The iterator is fail-fast, consistent with the rest of the framework.',
    ],
  },

  ordering: {
    paragraphs: [
      'Always ordinal order — the order enum constants are declared in their source file — never insertion order.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'EnumMap does not permit a null key (there is no ordinal() to index by), throwing NullPointerException on put(null, value). Null values are permitted.',
    ],
  },

  useCases: [
    { title: 'State machines: mapping states to handlers/actions', description: 'EnumMap<State, Runnable> or EnumMap<State, Handler> gives O(1) dispatch with full compile-time key-type safety.' },
    { title: 'Scheduling data indexed by a fixed calendar-like enum', description: 'Business hours, staffing levels, or delivery windows keyed by DayOfWeek, naturally iterating Monday-through-Sunday.' },
    { title: 'Compact configuration keyed by a small closed category set', description: 'Per-priority-level settings, per-log-level formatters, per-HTTP-method routing tables (when modeled as an enum).' },
    { title: 'Counting/aggregating by a small enum dimension', description: 'Tallying events per Status or per Severity level with guaranteed, meaningful iteration order for reporting.' },
  ],

  springBootExamples: [
    {
      title: 'Strategy dispatch table keyed by order status',
      description: 'An order-processing service maps each OrderStatus to its corresponding handler bean using EnumMap for fast, safe dispatch instead of a switch statement scattered across the codebase.',
      code:
`public enum OrderStatus { CREATED, PAID, SHIPPED, DELIVERED, CANCELLED }

public interface OrderStatusHandler { void handle(Order order); }

@Service
public class OrderStatusDispatcher {

    private final EnumMap<OrderStatus, OrderStatusHandler> handlers = new EnumMap<>(OrderStatus.class);

    public OrderStatusDispatcher(List<OrderStatusHandlerRegistration> registrations) {
        for (OrderStatusHandlerRegistration reg : registrations) {
            handlers.put(reg.status(), reg.handler());
        }
    }

    public void dispatch(Order order) {
        OrderStatusHandler handler = handlers.get(order.getStatus());
        if (handler == null) {
            throw new IllegalStateException("No handler registered for status " + order.getStatus());
        }
        handler.handle(order);
    }
}`,
    },
    {
      title: 'Per-day staffing requirements for a scheduling service',
      description: 'A staffing service keeps required headcount per day of week in an EnumMap<DayOfWeek, Integer>, always iterating Monday-through-Sunday for reports.',
      code:
`@Service
public class StaffingRequirementsService {

    private final EnumMap<DayOfWeek, Integer> requiredStaff = new EnumMap<>(DayOfWeek.class);

    @PostConstruct
    void loadDefaults() {
        requiredStaff.put(DayOfWeek.SATURDAY, 12);
        requiredStaff.put(DayOfWeek.SUNDAY, 12);
        for (DayOfWeek day : List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                                      DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)) {
            requiredStaff.put(day, 8);
        }
    }

    public Map<DayOfWeek, Integer> weeklyPlan() {
        return requiredStaff; // always iterates Monday -> Sunday
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why is EnumMap faster than a HashMap<SomeEnum, V>?', difficulty: 'Intermediate', answer: 'EnumMap indexes directly into an array using the key\'s ordinal() — no hashing, no equals() calls, and no possibility of collision — whereas HashMap must compute a hash, resolve the bucket, and potentially walk/compare a chain of colliding entries.' },
    { question: 'What determines EnumMap\'s iteration order?', difficulty: 'Beginner', answer: 'The natural ordinal (declaration) order of the enum\'s constants, always — a direct consequence of the array-backed, ordinal-indexed implementation, not a separately-maintained property.' },
    { question: 'Can an EnumMap hold keys from two different enum types?', difficulty: 'Beginner', answer: 'No — an EnumMap is constructed for (or infers) a single specific enum type, and its generic signature enforces that all keys belong to that one type at compile time.' },
    { question: 'Why does EnumMap disallow a null key but permit null values?', difficulty: 'Intermediate', answer: 'A key must have an ordinal() to index into the backing array, and null has none — so a null key is structurally meaningless and rejected with NullPointerException. A value, by contrast, is just data stored at that index and can legitimately be null.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Map each day of the week to whether the store is open',
        statement: 'Build an EnumMap<DayOfWeek, Boolean> representing store hours and check whether the store is open on a given day.',
        code:
`import java.time.DayOfWeek;
import java.util.*;

public class StoreHours {
    public static void main(String[] args) {
        EnumMap<DayOfWeek, Boolean> isOpen = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            isOpen.put(day, day != DayOfWeek.SUNDAY);
        }

        System.out.println(isOpen.get(DayOfWeek.SUNDAY));
        System.out.println(isOpen.get(DayOfWeek.MONDAY));
        System.out.println(isOpen);
    }
}`,
        output: 'false\ntrue\n{MONDAY=true, TUESDAY=true, WEDNESDAY=true, THURSDAY=true, FRIDAY=true, SATURDAY=true, SUNDAY=false}',
      },
    ],
    intermediate: [
      {
        title: 'Build a simple state machine using EnumMap of Runnables',
        statement: 'Implement a traffic light controller that runs a specific action for each Signal state, dispatched via EnumMap.',
        code:
`import java.util.*;

public class TrafficLightController {
    enum Signal { RED, YELLOW, GREEN }

    public static void main(String[] args) {
        EnumMap<Signal, Runnable> actions = new EnumMap<>(Signal.class);
        actions.put(Signal.RED, () -> System.out.println("Stop"));
        actions.put(Signal.YELLOW, () -> System.out.println("Prepare to stop"));
        actions.put(Signal.GREEN, () -> System.out.println("Go"));

        for (Signal signal : Signal.values()) {
            actions.get(signal).run();
        }
    }
}`,
        output: 'Stop\nPrepare to stop\nGo',
      },
    ],
    advanced: [
      {
        title: 'Count events per severity level, always reported in severity order',
        statement: 'Tally incoming log events by Severity and print counts guaranteed to be in declared severity order, regardless of arrival order.',
        code:
`import java.util.*;

public class SeverityTally {
    enum Severity { DEBUG, INFO, WARN, ERROR, FATAL }

    public static void main(String[] args) {
        List<Severity> events = List.of(
            Severity.WARN, Severity.ERROR, Severity.INFO, Severity.WARN, Severity.DEBUG, Severity.ERROR
        );

        EnumMap<Severity, Integer> counts = new EnumMap<>(Severity.class);
        for (Severity s : events) {
            counts.merge(s, 1, Integer::sum);
        }

        counts.forEach((severity, count) -> System.out.println(severity + ": " + count));
    }
}`,
        output: 'INFO: 1\nWARN: 2\nERROR: 2',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Priority-based alert routing for a hospital monitoring system',
      domain: 'Healthcare',
      description: 'A patient-monitoring alert service routes alerts to different notification channels based on severity, using EnumMap<Severity, NotificationChannel> for guaranteed O(1), type-safe dispatch on every vital-sign breach event.',
      code:
`public enum Severity { INFO, WARNING, CRITICAL }

@Service
public class AlertRoutingService {

    private final EnumMap<Severity, NotificationChannel> channelBySeverity = new EnumMap<>(Severity.class);

    public AlertRoutingService(NotificationChannel dashboardChannel, NotificationChannel pagerChannel) {
        channelBySeverity.put(Severity.INFO, dashboardChannel);
        channelBySeverity.put(Severity.WARNING, dashboardChannel);
        channelBySeverity.put(Severity.CRITICAL, pagerChannel);
    }

    public void routeAlert(Severity severity, String message) {
        channelBySeverity.get(severity).send(message);
    }
}`,
    },
    {
      title: 'Per-priority shipping SLA lookup for e-commerce fulfillment',
      domain: 'E-commerce',
      description: 'A fulfillment service keeps target ship-by durations per ShippingTier in an EnumMap, guaranteeing correct, fast lookup on the checkout hot path.',
      code:
`public enum ShippingTier { STANDARD, EXPEDITED, OVERNIGHT }

@Service
public class ShippingSlaService {

    private final EnumMap<ShippingTier, Duration> slaByTier = new EnumMap<>(Map.of(
        ShippingTier.STANDARD, Duration.ofDays(5),
        ShippingTier.EXPEDITED, Duration.ofDays(2),
        ShippingTier.OVERNIGHT, Duration.ofHours(24)
    ));

    public Duration slaFor(ShippingTier tier) {
        return slaByTier.get(tier);
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Per-department weekly schedules: Map<String, EnumMap<DayOfWeek, Shift>>',
      explanation: 'A hospital staffing system nests an EnumMap keyed by day-of-week inside a regular Map keyed by department name.',
      code:
`Map<String, EnumMap<DayOfWeek, Shift>> scheduleByDepartment = new HashMap<>();

scheduleByDepartment
    .computeIfAbsent("Emergency", dept -> new EnumMap<>(DayOfWeek.class))
    .put(DayOfWeek.MONDAY, new Shift("07:00", "19:00", 6));`,
    },
  ],

  bestPractices: [
    'Always prefer EnumMap over HashMap<SomeEnum, V> — it is strictly faster, more compact, and gives deterministic ordinal-order iteration for free.',
    'Construct with the enum\'s Class token (`new EnumMap<>(MyEnum.class)`) when starting from an empty map, since there is no other way to specify the key universe upfront.',
    'Use EnumMap for state-machine/strategy dispatch tables instead of a long switch statement scattered through business logic — it centralizes the mapping and is trivially extensible.',
    'Pair EnumMap with EnumSet when you need both "the value for each key" and "which keys are present" views of the same enum-indexed data.',
  ],

  commonMistakes: [
    {
      mistake: 'Using HashMap<SomeEnum, V> out of habit instead of EnumMap<SomeEnum, V>.',
      why: 'It works correctly but gives up EnumMap\'s speed, compactness, and guaranteed ordinal-order iteration for no benefit.',
      fix: 'Default to EnumMap whenever the key type is a single enum.',
    },
    {
      mistake: 'Trying to construct an EnumMap without specifying the enum type and without any initial entries.',
      why: 'EnumMap needs to know the key universe (the enum Class) to size its backing array; there is no way to infer it from nothing.',
      fix: 'Use the `new EnumMap<>(MyEnum.class)` constructor, or `new EnumMap<>(existingMap)` to copy/infer the type from another EnumMap or a non-empty Map.',
    },
    {
      mistake: 'Calling put(null, value) on an EnumMap.',
      why: 'A key must have an ordinal() to be indexed; null has none, so this throws NullPointerException.',
      fix: 'Never use null as an EnumMap key — model "no value" via Optional or by simply omitting the entry.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'EnumMap', 'HashMap<Enum, V>', 'TreeMap<Enum, V>'],
    rows: [
      ['Backing structure', 'Array indexed by ordinal()', 'Hash buckets', 'Red-black tree'],
      ['get/put complexity', 'True O(1)', 'O(1) average', 'O(log n)'],
      ['Iteration order', 'Ordinal (declaration) order', 'Unspecified', 'Natural/Comparator order (often same as ordinal by default)'],
      ['Null keys allowed', 'No', 'One null key', 'No'],
      ['Memory per entry', 'Very low (flat array slot)', 'Higher (Node objects)', 'Higher (tree node objects)'],
    ],
  },

  diagrams: [
    {
      title: 'Array indexed by ordinal()',
      caption: 'For `enum Status { CREATED, PAID, SHIPPED, DELIVERED }`, values are stored directly at index == ordinal().',
      render: () => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <DiagramBox label="CREATED→3" tone="brand" index={0} />
            <DiagramBox label="PAID→12" tone="brand" index={1} />
            <DiagramBox label="SHIPPED→5" tone="brand" index={2} />
            <DiagramBox label="DELIVERED→1" tone="brand" index={3} />
          </div>
          <p className="text-xs text-slate-400">get(SHIPPED) reads array[2] directly — no hashing involved.</p>
        </div>
      ),
    },
  ],

  quiz: [
    { question: 'What does EnumMap use to index its backing storage?', options: ['hashCode()', 'ordinal()', 'compareTo()', 'The enum constant\'s name() string'], answerIndex: 1, explanation: 'EnumMap indexes a plain array directly by each key\'s ordinal(), avoiding hashing entirely.' },
    { question: 'What is the time complexity of EnumMap.get()?', options: ['O(1) average, like HashMap', 'True O(1), always', 'O(log n)', 'O(n)'], answerIndex: 1, explanation: 'Since ordinal() gives a direct, collision-free array index, EnumMap.get() is O(1) unconditionally, not just on average.' },
    { question: 'What iteration order does EnumMap always use?', options: ['Insertion order', 'Ordinal (declaration) order', 'Reverse ordinal order', 'Unspecified'], answerIndex: 1, explanation: 'Iteration walks the backing array in index order, which corresponds exactly to ordinal (declaration) order.' },
    { question: 'Can EnumMap contain a null key?', options: ['Yes, one null key', 'Yes, unlimited', 'No, it throws NullPointerException', 'Only for the first entry'], answerIndex: 2, explanation: 'A key must have an ordinal() to index into the array; null has none, so it is rejected.' },
  ],
};
