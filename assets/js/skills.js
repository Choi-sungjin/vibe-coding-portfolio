/**
 * skills.js — 스킬 카드 렌더링, 스크롤 진입 시 stagger fade-up (Intersection Observer)
 */

const SKILLS_DATA = {
  frontend: [
    { name: 'HTML5', icon: 'devicon-html5-plain' },
    { name: 'CSS3', icon: 'devicon-css3-plain' },
    { name: 'JavaScript', icon: 'devicon-javascript-plain' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain' },
    { name: 'React', icon: 'devicon-react-original' },
    { name: 'Next.js', icon: 'devicon-nextjs-plain' },
    { name: 'Vue.js', icon: 'devicon-vuejs-plain' },
    { name: 'Tailwind CSS', icon: 'devicon-tailwindcss-plain' },
    { name: 'Redux', icon: 'devicon-redux-original' },
    { name: 'Sass', icon: 'devicon-sass-original' },
  ],
  backend: [
    { name: 'Node.js', icon: 'devicon-nodejs-plain' },
    { name: 'Express', icon: 'devicon-express-original' },
    { name: 'NestJS', icon: 'devicon-nestjs-plain' },
    { name: 'Python', icon: 'devicon-python-plain' },
    { name: 'FastAPI', icon: 'devicon-fastapi-plain' },
    { name: 'Django', icon: 'devicon-django-plain' },
    { name: 'REST API', icon: 'devicon-plain' },
    { name: 'GraphQL', icon: 'devicon-graphql-plain' },
    { name: 'WebSocket', icon: 'devicon-plain' },
  ],
  database: [
    { name: 'PostgreSQL', icon: 'devicon-postgresql-plain' },
    { name: 'MySQL', icon: 'devicon-mysql-plain' },
    { name: 'MongoDB', icon: 'devicon-mongodb-plain' },
    { name: 'Redis', icon: 'devicon-redis-plain' },
    { name: 'Firebase', icon: 'devicon-firebase-plain' },
    { name: 'Supabase', icon: 'devicon-plain' },
    { name: 'Prisma', icon: 'devicon-plain' },
    { name: 'Mongoose', icon: 'devicon-plain' },
    { name: 'TypeORM', icon: 'devicon-plain' },
  ],
  devops: [
    { name: 'Docker', icon: 'devicon-docker-plain' },
    { name: 'Kubernetes', icon: 'devicon-kubernetes-plain' },
    { name: 'AWS', icon: 'devicon-amazonwebservices-plain-wordmark' },
    { name: 'Vercel', icon: 'devicon-vercel-plain' },
    { name: 'GitHub Actions', icon: 'devicon-github-original' },
    { name: 'Nginx', icon: 'devicon-nginx-original' },
    { name: 'Linux', icon: 'devicon-linux-plain' },
  ],
  tools: [
    { name: 'Git', icon: 'devicon-git-plain' },
    { name: 'GitHub', icon: 'devicon-github-original' },
    { name: 'Figma', icon: 'devicon-figma-plain' },
    { name: 'Postman', icon: 'devicon-plain' },
    { name: 'VS Code', icon: 'devicon-vscode-plain' },
    { name: 'Webpack', icon: 'devicon-webpack-plain' },
    { name: 'Vite', icon: 'devicon-vite-plain' },
    { name: 'Notion', icon: 'devicon-plain' },
    { name: 'Slack', icon: 'devicon-plain' },
    { name: 'Jira', icon: 'devicon-plain' },
  ],
};

const STAGGER_DELAY = 50;

function createSkillCard(skill, index) {
  const card = document.createElement('div');
  card.className = 'skill-card fade-up';
  card.style.animationDelay = `${index * STAGGER_DELAY}ms`;
  card.innerHTML = `
    <i class="${skill.icon} skill-icon" style="font-size: 2rem; color: var(--color-text-secondary);" aria-hidden="true"></i>
    <span class="skill-name">${skill.name}</span>
  `;
  return card;
}

function renderPanels() {
  Object.keys(SKILLS_DATA).forEach((key) => {
    const panel = document.getElementById(`panel-${key}`);
    if (!panel) return;
    panel.innerHTML = '';
    SKILLS_DATA[key].forEach((skill, i) => {
      panel.appendChild(createSkillCard(skill, i));
    });
  });
}

function observeSkillCards() {
  const cards = document.querySelectorAll('.skill-card.fade-up');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
  );
  cards.forEach((card) => io.observe(card));
}

export function initSkills() {
  renderPanels();
  observeSkillCards();
  // 탭 전환 시 새 패널의 카드도 observe
  const panelContainer = document.getElementById('skills-panels');
  if (panelContainer) {
    const observer = new MutationObserver(() => {
      observeSkillCards();
    });
    observer.observe(panelContainer, { childList: true, subtree: true });
  }
}
