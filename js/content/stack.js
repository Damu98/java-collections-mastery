/* ==========================================================================
   CONTENT: Stack
   ========================================================================== */

CollectionsContent['stack'] = {

  overview: {
    paragraphs: [
      'Stack is a legacy class (Java 1.0) that extends Vector to add classic LIFO (last-in-first-out) operations: push(), pop(), peek(), and empty(). Because it extends Vector rather than composing it, Stack inherits every one of Vector\'s List methods too — you can call add(index, e) or get(0) on a "Stack", which arguably violates the LIFO abstraction it is meant to enforce.',
      'The JDK\'s own documentation for Stack recommends using ArrayDeque instead for a "more complete and consistent set of LIFO stack operations" with better performance, since Stack inherits Vector\'s synchronization overhead and its non-stack List methods leak the abstraction.',
      'Stack remains useful to know because it still appears throughout legacy code, textbooks, and some interview questions, but it should not be your first choice for new stack-based code.',
    ],
    keyPoints: [
      'Extends Vector — inherits its synchronized, array-backed, doubling-growth behavior.',
      'Adds push()/pop()/peek()/empty()/search() for LIFO semantics.',
      'Also exposes every List/Vector method, which can violate strict stack discipline.',
      'The JDK explicitly recommends ArrayDeque as the modern replacement.',
    ],
  },

  internalWorking: {
    paragraphs: [
      'push(item) is implemented as simply `addElement(item)` (a Vector method that appends to the end) and returns the pushed item. pop() removes and returns the last element (`elementAt(size - 1)` then `removeElementAt(size - 1)`), so the "top" of the stack is the end of the underlying array — appends and removals there are O(1) amortized, same as Vector\'s append.',
      'Because it extends Vector, every push/pop/peek call is synchronized on the Stack\'s own monitor, inheriting the same coarse-grained locking discussed for Vector.',
    ],
  },

  complexity: [
    { operation: 'push(e)', average: 'O(1)', worst: 'O(n)', space: 'O(1)', notes: 'Amortized O(1) append; worst case triggers Vector\'s doubling resize.' },
    { operation: 'pop() / peek()', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Operates on the last array slot.' },
    { operation: 'search(e)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', notes: 'Linear scan from the top; returns 1-based distance from the top, or -1.' },
    { operation: 'get(index) (inherited from Vector)', average: 'O(1)', worst: 'O(1)', space: 'O(1)', notes: 'Breaks stack discipline — available but discouraged.' },
  ],

  memory: {
    paragraphs: [
      'Memory characteristics are identical to Vector\'s: a resizable Object[] array that doubles on overflow, with the same per-element reference overhead as ArrayList/Vector.',
    ],
  },

  threadSafety: {
    paragraphs: [
      'Every operation is synchronized (inherited from Vector), so individual push/pop/peek calls are atomic with respect to each other. As with Vector, compound sequences (e.g. "if (!stack.empty()) stack.pop()") are not atomic and still require external synchronization in genuinely concurrent code.',
      'For real concurrent stack/queue needs, prefer java.util.concurrent.ConcurrentLinkedDeque (lock-free) over synchronizing around a legacy Stack.',
    ],
  },

  iteration: {
    paragraphs: [
      'Stack inherits Vector\'s fail-fast Iterator/ListIterator as well as the legacy Enumeration. Note that iterating a Stack front-to-back (index 0 upward) visits elements in insertion order, i.e. bottom-of-stack first — not pop order — which surprises developers expecting LIFO iteration.',
    ],
  },

  ordering: {
    paragraphs: [
      'Logically LIFO via push/pop/peek, but the underlying List view is insertion-ordered (bottom-to-top), which is exposed by iteration and by inherited index-based methods.',
    ],
  },

  nullHandling: {
    paragraphs: [
      'Stack allows null elements (inherited from Vector), though pushing null is rarely meaningful and can make peek()/pop() results ambiguous versus an empty-stack check.',
    ],
  },

  useCases: [
    { title: 'Maintaining or reading legacy code', description: 'Understanding existing Stack usage in older codebases and textbooks.' },
    { title: 'Simple, low-throughput single-threaded stacks where clarity trumps performance', description: 'Small utility scripts where reaching for ArrayDeque is not a meaningful cost/benefit difference but Stack is already imported/familiar.' },
    { title: 'Interview / algorithm exercises', description: 'Many textbook problems (balanced parentheses, expression evaluation, backtracking) are phrased in terms of Stack even though ArrayDeque is the production-quality choice.' },
  ],

  springBootExamples: [
    {
      title: 'Expression evaluator endpoint (illustrative use of Stack in an algorithm)',
      description: 'A calculator microservice evaluates postfix expressions using a Stack for clarity in a small, single-threaded request-scoped computation — a reasonable niche use even in modern code.',
      code:
`@RestController
@RequestMapping("/api/calculator")
public class PostfixCalculatorController {

    @PostMapping("/evaluate")
    public ResponseEntity<Double> evaluate(@RequestBody String[] postfixTokens) {
        Stack<Double> stack = new Stack<>();
        for (String token : postfixTokens) {
            switch (token) {
                case "+" -> stack.push(stack.pop() + stack.pop());
                case "*" -> stack.push(stack.pop() * stack.pop());
                default -> stack.push(Double.parseDouble(token));
            }
        }
        return ResponseEntity.ok(stack.pop());
    }
}`,
    },
  ],

  interviewQuestions: [
    { question: 'Why does the JDK recommend ArrayDeque instead of Stack for new code?', difficulty: 'Beginner', answer: 'Stack extends Vector, inheriting synchronized (and therefore slower, single-threaded-unnecessary) operations and a full set of List methods that can violate LIFO discipline. ArrayDeque offers the same LIFO operations with better performance and a cleaner, purpose-built API.' },
    { question: 'What does Stack.search(Object) return, and how is it indexed?', difficulty: 'Intermediate', answer: 'It returns the 1-based distance from the top of the stack to the first occurrence of the object (so the top element is at distance 1), or -1 if not found — unlike most Java APIs which are 0-indexed.' },
    { question: 'If you iterate a Stack with a for-each loop, do you get elements in pop order?', difficulty: 'Intermediate', answer: 'No. Iteration follows the underlying Vector\'s index order (bottom of the stack to top), which is the reverse of pop order. To process in pop order you must actually call pop() repeatedly (destructively) or iterate a reversed copy.' },
    { question: 'Is Stack synchronized, and does that make it fully thread-safe for a producer-consumer pattern?', difficulty: 'Advanced', answer: 'Individual method calls are synchronized (inherited from Vector), but compound sequences like "peek then pop only if not empty" are not atomic. For genuine producer-consumer concurrency, a java.util.concurrent structure like LinkedBlockingDeque is the correct choice, not a manually-synchronized Stack.' },
  ],

  problems: {
    beginner: [
      {
        title: 'Balanced parentheses checker',
        statement: 'Given a string of brackets, determine whether every opening bracket has a matching, correctly-nested closing bracket using a Stack.',
        code:
`import java.util.Stack;

public class BalancedParentheses {
    public static boolean isBalanced(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char open = stack.pop();
                if ((c == ')' && open != '(') ||
                    (c == '}' && open != '{') ||
                    (c == ']' && open != '[')) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("{[()()]}"));
        System.out.println(isBalanced("{[(])}"));
    }
}`,
        output: 'true\nfalse',
      },
    ],
    intermediate: [
      {
        title: 'Evaluate a postfix (Reverse Polish Notation) expression',
        statement: 'Given a postfix expression as space-separated tokens, evaluate it using a Stack<Integer>.',
        code:
`import java.util.Stack;

public class PostfixEvaluator {
    public static int evaluate(String expression) {
        Stack<Integer> stack = new Stack<>();
        for (String token : expression.split(" ")) {
            switch (token) {
                case "+" -> stack.push(stack.pop() + stack.pop());
                case "*" -> stack.push(stack.pop() * stack.pop());
                case "-" -> {
                    int b = stack.pop(), a = stack.pop();
                    stack.push(a - b);
                }
                default -> stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }

    public static void main(String[] args) {
        System.out.println(evaluate("5 1 2 + 4 * + 3 -"));
    }
}`,
        output: '14',
      },
    ],
    advanced: [
      {
        title: 'Next Greater Element using a monotonic Stack',
        statement: 'For each element in an array, find the next element to its right that is strictly greater, using a single-pass monotonic stack (O(n) total).',
        code:
`import java.util.*;

public class NextGreaterElement {
    public static int[] nextGreater(int[] nums) {
        int[] result = new int[nums.length];
        Arrays.fill(result, -1);
        Stack<Integer> indices = new Stack<>(); // indices with no greater element found yet

        for (int i = 0; i < nums.length; i++) {
            while (!indices.isEmpty() && nums[indices.peek()] < nums[i]) {
                result[indices.pop()] = nums[i];
            }
            indices.push(i);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {2, 1, 2, 4, 3};
        System.out.println(Arrays.toString(nextGreater(nums)));
    }
}`,
        output: '[4, 2, 4, -1, -1]',
      },
    ],
  },

  realProjectScenarios: [
    {
      title: 'Undo history for a banking transaction builder UI',
      domain: 'Banking',
      description: 'A back-office transaction-composition tool (single-threaded, per-user-session state) uses a Stack to let a teller undo the last several edits before submitting a batch transfer.',
      code:
`public class TransactionDraftSession {

    private final Stack<TransactionDraft> history = new Stack<>();

    public void applyEdit(TransactionDraft newDraft) {
        history.push(newDraft);
    }

    public TransactionDraft undoLastEdit() {
        if (history.size() <= 1) {
            throw new IllegalStateException("Nothing to undo");
        }
        history.pop(); // discard current
        return history.peek(); // reveal previous
    }
}`,
    },
  ],

  nestedExamples: [
    {
      title: 'Stack of Stacks: undo history per open document',
      explanation: 'A multi-document editor keeps a Map from document ID to its own undo Stack, so each open document has independent undo history.',
      code:
`Map<String, Stack<EditorState>> undoHistoryByDocument = new HashMap<>();

undoHistoryByDocument
    .computeIfAbsent("doc-42", id -> new Stack<>())
    .push(currentEditorState);`,
    },
  ],

  bestPractices: [
    'Prefer ArrayDeque (used as a stack via push/pop/peek) over Stack for all new code.',
    'If you must use Stack, avoid calling inherited List/Vector methods like add(index, e) or get(0) — they undermine the LIFO abstraction the class is meant to express.',
    'Remember Stack.search() is 1-indexed from the top, unlike almost every other Java indexing convention.',
    'Do not iterate a Stack expecting pop order — a for-each/iterator walks bottom-to-top, the reverse of LIFO order.',
  ],

  commonMistakes: [
    {
      mistake: 'Calling stack.get(0) or stack.add(index, e) on a Stack instance.',
      why: 'These are inherited Vector/List methods that bypass push/pop entirely, silently corrupting the intended LIFO usage pattern.',
      fix: 'Restrict yourself to push()/pop()/peek()/empty()/search(), or switch to ArrayDeque which does not expose these methods at all.',
    },
    {
      mistake: 'Assuming for-each iteration over a Stack yields elements in pop order.',
      why: 'Iteration follows Vector\'s underlying index order (bottom to top), which is the opposite of LIFO pop order.',
      fix: 'To process elements in pop order, actually call pop() in a loop, or reverse a copy before iterating.',
    },
    {
      mistake: 'Choosing Stack for a new, performance-sensitive single-threaded algorithm.',
      why: 'Every push/pop pays for synchronization overhead that ArrayDeque does not incur.',
      fix: 'Use `Deque<T> stack = new ArrayDeque<>();` and call push()/pop()/peek() on it instead.',
    },
  ],

  comparisonTable: {
    headers: ['Aspect', 'Stack', 'ArrayDeque (as a stack)', 'LinkedList (as a stack)'],
    rows: [
      ['Extends', 'Vector', 'AbstractCollection', 'AbstractSequentialList'],
      ['Synchronized', 'Yes (inherited)', 'No', 'No'],
      ['Exposes non-stack List methods', 'Yes (leaky abstraction)', 'No', 'Yes (leaky abstraction)'],
      ['JDK recommendation', 'Legacy, avoid for new code', 'Preferred modern choice', 'Acceptable but not preferred'],
    ],
  },

  diagrams: [
    {
      title: 'push / pop operate on the top (end of the array)',
      caption: 'push("D") appends at the end; pop() removes and returns "D" — both O(1) amortized.',
      render: () => (
        <div className="flex items-center gap-1">
          <DiagramBox label="A" tone="slate" sub="bottom" />
          <DiagramBox label="B" tone="slate" />
          <DiagramBox label="C" tone="slate" />
          <DiagramBox label="D" tone="green" sub="top ← push/pop here" />
        </div>
      ),
    },
  ],

  quiz: [
    {
      question: 'What class does java.util.Stack extend?',
      options: ['ArrayList', 'AbstractList', 'Vector', 'LinkedList'],
      answerIndex: 2,
      explanation: 'Stack extends Vector, inheriting its synchronized, array-backed List behavior in addition to adding LIFO methods.',
    },
    {
      question: 'What does Stack.search(x) return if x is the top element?',
      options: ['0', '1', '-1', 'The index of x in the array'],
      answerIndex: 1,
      explanation: 'search() is 1-based from the top: the top element is always at distance 1 if found.',
    },
    {
      question: 'Why does the JDK documentation recommend ArrayDeque over Stack?',
      options: [
        'Stack cannot hold null',
        'ArrayDeque provides a more complete, consistent, and faster LIFO API',
        'Stack is deprecated and will be removed',
        'ArrayDeque is thread-safe and Stack is not',
      ],
      answerIndex: 1,
      explanation: 'Both are effectively equally "not recommended for concurrency purposes"; the JDK\'s stated reason is API completeness/consistency and performance.',
    },
    {
      question: 'If you iterate a Stack containing [A, B, C] (pushed in that order) with a for-each loop, what order do you get?',
      options: ['C, B, A (pop order)', 'A, B, C (insertion order)', 'Random order', 'It throws an exception'],
      answerIndex: 1,
      explanation: 'Iteration uses the underlying Vector\'s index order, which is bottom-to-top (insertion order), not pop order.',
    },
  ],
};
