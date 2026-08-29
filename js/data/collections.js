/* ==========================================================================
   DATA MODEL
   --------------------------------------------------------------------------
   This file is the single source of truth for the app's navigational
   structure: phases, categories and the collections that belong to them.

   It intentionally contains NO written content (no overviews, no code, no
   quizzes). Written content lives in js/content/<id>.js files and is
   registered into `CollectionsContent` (see js/data/registry.js). Keeping
   structure and content apart means every later phase can be dropped in
   without ever touching this file or the routing/layout components.
   ========================================================================== */

/**
 * A learning phase groups categories together and is only used for
 * progress reporting on the Home dashboard (js/components/Home.js).
 * @typedef {{ id: number, name: string, blurb: string }} Phase
 */
const PHASES = [
  { id: 1, name: 'Foundations', blurb: 'App shell, navigation, theming and the Collections Framework map.' },
  { id: 2, name: 'Lists', blurb: 'Ordered, index-based sequences: ArrayList, LinkedList, Vector, Stack.' },
  { id: 3, name: 'Sets', blurb: 'Uniqueness-enforcing collections: HashSet, LinkedHashSet, TreeSet, EnumSet.' },
  { id: 4, name: 'Maps', blurb: 'Key-value stores: HashMap, LinkedHashMap, TreeMap and five specialised maps.' },
  { id: 5, name: 'Queues', blurb: 'FIFO/priority structures and the concurrent queue family used in producer-consumer systems.' },
];

/**
 * @typedef {{ key: string, label: string, icon: string, description: string }} Category
 */
const CATEGORIES = {
  core: { key: 'core', label: 'Core Concepts', icon: 'compass', description: 'The Collections Framework hierarchy and shared vocabulary.' },
  list: { key: 'list', label: 'List', icon: 'list', description: 'Ordered collections that allow duplicates and positional access.' },
  set: { key: 'set', label: 'Set', icon: 'set', description: 'Collections that guarantee no duplicate elements.' },
  map: { key: 'map', label: 'Map', icon: 'map', description: 'Associative key → value data structures.' },
  queue: { key: 'queue', label: 'Queue & Deque', icon: 'queue', description: 'Head/tail-oriented structures for scheduling and hand-off between threads.' },
};

/**
 * Every collection covered by the app.
 * @typedef {{
 *   id: string,
 *   name: string,
 *   category: string,
 *   phase: number,
 *   since: string,
 *   javaPackage: string,
 *   interfaces: string[],
 *   summary: string,
 *   threadSafe: boolean,
 *   concurrentGroup?: boolean
 * }} CollectionMeta
 */
const COLLECTIONS = [
  // ---- Phase 1: Core concepts -------------------------------------------
  {
    id: 'overview',
    name: 'Collections Framework Overview',
    category: 'core',
    phase: 1,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['Iterable', 'Collection', 'Map'],
    summary: 'The unified architecture behind every collection in this app: interfaces, abstract classes and implementations.',
    threadSafe: false,
  },

  // ---- Phase 2: Lists -----------------------------------------------------
  {
    id: 'arraylist',
    name: 'ArrayList',
    category: 'list',
    phase: 2,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['List', 'RandomAccess', 'Cloneable', 'Serializable'],
    summary: 'Resizable-array implementation of List; the default general-purpose list.',
    threadSafe: false,
  },
  {
    id: 'linkedlist',
    name: 'LinkedList',
    category: 'list',
    phase: 2,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['List', 'Deque', 'Queue', 'Cloneable', 'Serializable'],
    summary: 'Doubly-linked list implementation of List and Deque.',
    threadSafe: false,
  },
  {
    id: 'vector',
    name: 'Vector',
    category: 'list',
    phase: 2,
    since: 'Java 1.0',
    javaPackage: 'java.util',
    interfaces: ['List', 'RandomAccess', 'Cloneable', 'Serializable'],
    summary: 'Legacy synchronized, resizable-array List implementation.',
    threadSafe: true,
  },
  {
    id: 'stack',
    name: 'Stack',
    category: 'list',
    phase: 2,
    since: 'Java 1.0',
    javaPackage: 'java.util',
    interfaces: ['List (via Vector)'],
    summary: 'Legacy LIFO stack built on top of Vector.',
    threadSafe: true,
  },

  // ---- Phase 3: Sets -------------------------------------------------------
  {
    id: 'hashset',
    name: 'HashSet',
    category: 'set',
    phase: 3,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['Set', 'Cloneable', 'Serializable'],
    summary: 'Hash-table backed Set with no ordering guarantees; O(1) average operations.',
    threadSafe: false,
  },
  {
    id: 'linkedhashset',
    name: 'LinkedHashSet',
    category: 'set',
    phase: 3,
    since: 'Java 1.4',
    javaPackage: 'java.util',
    interfaces: ['Set', 'Cloneable', 'Serializable'],
    summary: 'HashSet variant that preserves insertion order via an internal linked list.',
    threadSafe: false,
  },
  {
    id: 'treeset',
    name: 'TreeSet',
    category: 'set',
    phase: 3,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['NavigableSet', 'SortedSet', 'Cloneable', 'Serializable'],
    summary: 'Red-black tree backed sorted Set with O(log n) operations.',
    threadSafe: false,
  },
  {
    id: 'enumset',
    name: 'EnumSet',
    category: 'set',
    phase: 3,
    since: 'Java 1.5',
    javaPackage: 'java.util',
    interfaces: ['Set', 'Cloneable', 'Serializable'],
    summary: 'Bit-vector backed Set specialised for enum types; extremely fast and compact.',
    threadSafe: false,
  },

  // ---- Phase 4: Maps --------------------------------------------------------
  {
    id: 'hashmap',
    name: 'HashMap',
    category: 'map',
    phase: 4,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['Map', 'Cloneable', 'Serializable'],
    summary: 'Hash-table backed Map; the default general-purpose key-value store.',
    threadSafe: false,
  },
  {
    id: 'linkedhashmap',
    name: 'LinkedHashMap',
    category: 'map',
    phase: 4,
    since: 'Java 1.4',
    javaPackage: 'java.util',
    interfaces: ['Map', 'Cloneable', 'Serializable'],
    summary: 'HashMap variant that preserves insertion (or access) order.',
    threadSafe: false,
  },
  {
    id: 'treemap',
    name: 'TreeMap',
    category: 'map',
    phase: 4,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['NavigableMap', 'SortedMap', 'Cloneable', 'Serializable'],
    summary: 'Red-black tree backed sorted Map with O(log n) operations.',
    threadSafe: false,
  },
  {
    id: 'hashtable',
    name: 'Hashtable',
    category: 'map',
    phase: 4,
    since: 'Java 1.0',
    javaPackage: 'java.util',
    interfaces: ['Map', 'Cloneable', 'Serializable'],
    summary: 'Legacy synchronized Map; predecessor to HashMap, disallows null keys/values.',
    threadSafe: true,
  },
  {
    id: 'concurrenthashmap',
    name: 'ConcurrentHashMap',
    category: 'map',
    phase: 4,
    since: 'Java 1.5',
    javaPackage: 'java.util.concurrent',
    interfaces: ['ConcurrentMap', 'Serializable'],
    summary: 'Segment/bin-locked, highly concurrent Map for multi-threaded access without external synchronization.',
    threadSafe: true,
  },
  {
    id: 'weakhashmap',
    name: 'WeakHashMap',
    category: 'map',
    phase: 4,
    since: 'Java 1.2',
    javaPackage: 'java.util',
    interfaces: ['Map'],
    summary: 'Map with weakly-referenced keys that are auto-removed once no longer strongly reachable.',
    threadSafe: false,
  },
  {
    id: 'identityhashmap',
    name: 'IdentityHashMap',
    category: 'map',
    phase: 4,
    since: 'Java 1.4',
    javaPackage: 'java.util',
    interfaces: ['Map', 'Cloneable', 'Serializable'],
    summary: 'Map using reference equality (==) instead of equals() for keys.',
    threadSafe: false,
  },
  {
    id: 'enummap',
    name: 'EnumMap',
    category: 'map',
    phase: 4,
    since: 'Java 1.5',
    javaPackage: 'java.util',
    interfaces: ['Map', 'Cloneable', 'Serializable'],
    summary: 'Array-backed Map specialised for enum keys; compact and fast, iterates in natural enum order.',
    threadSafe: false,
  },

  // ---- Phase 5: Queues ---------------------------------------------------
  {
    id: 'queue-interface',
    name: 'Queue (interface)',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util',
    interfaces: ['Collection'],
    summary: 'The root FIFO-oriented interface implemented by every queue in this section.',
    threadSafe: false,
  },
  {
    id: 'priorityqueue',
    name: 'PriorityQueue',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util',
    interfaces: ['Queue', 'Serializable'],
    summary: 'Binary-heap backed queue that orders elements by priority instead of insertion order.',
    threadSafe: false,
  },
  {
    id: 'arraydeque',
    name: 'ArrayDeque',
    category: 'queue',
    phase: 5,
    since: 'Java 1.6',
    javaPackage: 'java.util',
    interfaces: ['Deque', 'Cloneable', 'Serializable'],
    summary: 'Resizable-array Deque; the recommended replacement for Stack and LinkedList as a stack/queue.',
    threadSafe: false,
  },
  {
    id: 'concurrentlinkedqueue',
    name: 'ConcurrentLinkedQueue',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util.concurrent',
    interfaces: ['Queue'],
    summary: 'Unbounded, lock-free (CAS-based) non-blocking FIFO queue.',
    threadSafe: true,
    concurrentGroup: true,
  },
  {
    id: 'linkedblockingqueue',
    name: 'LinkedBlockingQueue',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util.concurrent',
    interfaces: ['BlockingQueue'],
    summary: 'Optionally-bounded, lock-based blocking FIFO queue; a common producer-consumer workhorse.',
    threadSafe: true,
    concurrentGroup: true,
  },
  {
    id: 'arrayblockingqueue',
    name: 'ArrayBlockingQueue',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util.concurrent',
    interfaces: ['BlockingQueue'],
    summary: 'Fixed-capacity, array-backed blocking queue with a single shared lock.',
    threadSafe: true,
    concurrentGroup: true,
  },
  {
    id: 'priorityblockingqueue',
    name: 'PriorityBlockingQueue',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util.concurrent',
    interfaces: ['BlockingQueue'],
    summary: 'Unbounded blocking queue that orders elements by priority.',
    threadSafe: true,
    concurrentGroup: true,
  },
  {
    id: 'delayqueue',
    name: 'DelayQueue',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util.concurrent',
    interfaces: ['BlockingQueue'],
    summary: 'Unbounded blocking queue that only releases elements once their delay has expired.',
    threadSafe: true,
    concurrentGroup: true,
  },
  {
    id: 'synchronousqueue',
    name: 'SynchronousQueue',
    category: 'queue',
    phase: 5,
    since: 'Java 1.5',
    javaPackage: 'java.util.concurrent',
    interfaces: ['BlockingQueue'],
    summary: 'Zero-capacity hand-off queue: every put() waits for a matching take().',
    threadSafe: true,
    concurrentGroup: true,
  },
];

/** Convenience lookups used throughout the app. */
const getCollectionById = (id) => COLLECTIONS.find((c) => c.id === id);
const getCollectionsByCategory = (categoryKey) => COLLECTIONS.filter((c) => c.category === categoryKey);
const getCollectionsByPhase = (phaseId) => COLLECTIONS.filter((c) => c.phase === phaseId);
