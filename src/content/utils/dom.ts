export const waitForElement = async <T extends Element>(
  selector: string,
  root: ParentNode = document,
  timeoutMs = 5000
): Promise<T> => {
  const existing = root.querySelector<T>(selector);
  if (existing) {
    return existing;
  }

  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timed out waiting for selector: ${selector}`));
    }, timeoutMs);

    const observer = new MutationObserver(() => {
      const found = root.querySelector<T>(selector);
      if (!found) return;
      window.clearTimeout(timeout);
      observer.disconnect();
      resolve(found);
    });

    observer.observe(root, { childList: true, subtree: true });
  });
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: { classNames?: string[]; attributes?: Record<string, string> } = {}
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  if (options.classNames) {
    element.classList.add(...options.classNames);
  }
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  return element;
};

export const injectStyles = (id: string, styles: string): void => {
  if (document.getElementById(id)) {
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = styles;
  document.head.appendChild(style);
};
