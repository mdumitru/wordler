// jest-dom adds custom matchers for asserting on DOM nodes, such as
// expect(element).toBeInTheDocument().
import "@testing-library/jest-dom";

// headlessui's Dialog observes its panel; jsdom has no IntersectionObserver.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverStub,
});
