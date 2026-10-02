(() => {
  const shortWords = /(^|[\s([\u00ab\u201e\u201c"\u2014-])(а|без|бы|в|во|да|для|до|же|за|и|из|или|к|ко|ли|либо|на|над|не|ни|но|о|об|обо|от|по|под|при|с|со|у)(?:[ \t\r\n]+)(?=\S)/giu;
  const skipped = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE', 'SVG', 'CANVAS', 'AUDIO']);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || skipped.has(parent.tagName) || parent.closest('[data-no-typography]')) return NodeFilter.FILTER_REJECT;
      return /[А-Яа-яЁё]/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    node.nodeValue = node.nodeValue.replace(shortWords, '$1$2\u00a0');
  });
})();
