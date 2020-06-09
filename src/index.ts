// general types
type Primitive = number | string | boolean | null | undefined;
type Subscriber = (newVal?: Primitive, oldVal?: Primitive) => void;

type ComputeFunc = () => Primitive | void;

// The one and only global variable. It is shared between Signals and Computes
// if it has anything and a node is read,
// the signal knows it's currently inside a compute and subscribes
let computeFunc: ComputeFunc;

function trkl(initValue?: Primitive) {
  // when it is created, we store the initial value in a mutable variable.
  // signal() and any of its children functions will have access to it
  let val = initValue;
  // this is a list of .subscribe functions that we must alert on changes
  const subscribers: Set<Subscriber> = new Set();

  // if no value was provided, return the value.
  // if one was, update val, call all subscribers and return the current val
  function signal(writeValue?: Primitive) {
    // we check arguments.length and not writeValue === undefined because perhaps
    // the user meant to set it to undefined
    if (!arguments.length) return read();
    return write(writeValue!);
  }

  // if someone subscribes, we add it onto our array and execute if we're told to
  signal.subscribe = (subscriber: Subscriber, immediate?: boolean) => {
    subscribers.add(subscriber);
    if (immediate) subscriber(val);
  };

  // if someone unsubscribes, remove their func from the subscriptions
  signal.unsubscribe = (subscriber: Subscriber) => {
    for (const sub of subscribers) {
      if (sub !== subscriber) continue;
      subscribers.delete(sub);
      break;
    }
  };

  // if the value is new, notify all subscribers and return it
  function write(newValue: Primitive) {
    // if we're getting the same value again exit early
    if (newValue === val) return;

    // keep the val as the old value and change this signal's value
    const oldValue = val;
    val = newValue;

    // alert each subscriber of the change we have just made
    for (const sub of subscribers) sub(val, oldValue);

    return val;
  }

  // this is how we get computations working
  function read() {
    // usually there won't be any computes.
    // The only time there ever should is if this node is specifically inside
    // a compute that has just been initialized
    // if we're in a computation, have this node subscribe to it
    if (computeFunc) {
      signal.subscribe(computeFunc);
    }

    // regardless, return the value
    return val;
  }

  return signal;
}

// this one was the real crazy one for me.
// It reacts whenever signals it contains mutate.
// This feature can be used to create computed values
trkl.computed = function(fn: () => Primitive | void) {
  // create new Signal which subscribes to runComputed()
  const signal = trkl();

  runComputed();
  function runComputed() {
    // if it already includes our fn, we're gonna run into some errors.
    if (computeFunc === runComputed) {
      throw Error("Circular computation detected");
    }

    // we add and remove this ComputeFunc specifically surrounding where we call fn()
    // fn() will call read() on every Signal it contains.
    // This makes it subscribe to our compute since computedTracker is no longer
    // empty (as it usually is)
    const prevFunc = computeFunc;
    computeFunc = runComputed;

    let err;
    let result;
    try {
      result = fn();
    } catch (e) {
      err = e;
    }
    computeFunc = prevFunc;

    if (err) throw err;
    signal(result);
  }

  return signal;
};

trkl.from = (executor: (val: any) => void) => {
  const signal = trkl();
  executor(signal);

  return signal;
};

export default trkl;
