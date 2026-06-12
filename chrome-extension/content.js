const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

function isValidPhone(str) {
  const digits = str.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function injectCallButton(phoneEl, phoneNumber) {
  if (phoneEl.dataset.leadarrowInjected) return;
  phoneEl.dataset.leadarrowInjected = 'true';

  const btn = document.createElement('span');
  btn.textContent = ' \u260E';
  btn.title = `Call ${phoneNumber} via LeadArrow`;
  btn.className = 'inline-flex items-center mx-1 px-1.5 py-0.5 bg-[#1A5CFF] hover:bg-[#0043F0] text-white text-xs rounded transition-all cursor-pointer shadow-[0_2px_8px_rgba(26,92,255,0.4)]';
  btn.style.cssText = 'display:inline-flex;align-items:center;margin:0 2px;padding:1px 5px;background:#1A5CFF;color:white;font-size:11px;border-radius:4px;cursor:pointer;';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    chrome.runtime.sendMessage({ action: 'CLICK_TO_CALL', phoneNumber });
  });

  phoneEl.parentNode?.insertBefore(btn, phoneEl.nextSibling);
}

function scanAndInject() {
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  while (treeWalker.nextNode()) textNodes.push(treeWalker.currentNode);

  for (const node of textNodes) {
    const text = node.textContent || '';
    let match;
    PHONE_REGEX.lastIndex = 0;
    while ((match = PHONE_REGEX.exec(text)) !== null) {
      const phone = match[0].trim();
      if (isValidPhone(phone)) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + phone.length);

        const wrapper = document.createElement('span');
        wrapper.textContent = phone;
        range.deleteContents();
        range.insertNode(wrapper);

        injectCallButton(wrapper, phone);
        break;
      }
    }
  }
}

const observer = new MutationObserver(() => {
  clearTimeout(observer._timer);
  observer._timer = setTimeout(scanAndInject, 1000);
});

observer.observe(document.body, { childList: true, subtree: true });

scanAndInject();
