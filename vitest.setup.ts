// Polyfill for Radix UI components in testing environment
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  value: function() { return false; },
  writable: true,
});

Object.defineProperty(Element.prototype, 'setPointerCapture', {
  value: function() {},
  writable: true,
});

Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  value: function() {},
  writable: true,
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: function() {},
  writable: true,
});