/**
 * tab.js — 스킬 카테고리 탭 전환
 */

const TAB_SELECTOR = '.skills-tab';
const PANEL_SELECTOR = '.skills-panel';

export function initTabs() {
  const tabs = document.querySelectorAll(TAB_SELECTOR);
  const panels = document.querySelectorAll(PANEL_SELECTOR);
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      if (!targetId) return;

      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach((panel) => {
        const panelId = panel.id || '';
        const isActive = panelId === `panel-${targetId}`;
        panel.classList.toggle('active', isActive);
        panel.setAttribute('aria-hidden', !isActive);
        if (isActive) {
          panel.querySelectorAll('.skill-card').forEach((card) => card.classList.add('visible'));
        }
      });
    });
  });
}
