const slides = [...document.querySelectorAll('.slide')];
const stage = document.querySelector('#palco');
const menu = document.querySelector('#menu');
const menuButton = document.querySelector('#menuBtn');
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const full = document.querySelector('#full');
const count = document.querySelector('#count');
const controls = document.querySelector('.controls');
const progress = document.querySelector('#bar');
let current = 0;

function fitSlide() {
  const slide=slides[current];
  slide.style.zoom='1';
  slide.style.width=Math.max(1000,Math.min(stage.clientWidth,1450))+'px';
  const ratio=Math.min(1,stage.clientWidth/slide.offsetWidth,(stage.clientHeight-4)/slide.offsetHeight);
  slide.style.zoom=String(ratio);
}

const links = slides.map((slide, index) => {
  const link = document.createElement('a');
  link.href = '#' + slide.id;
  link.textContent = String(index + 1).padStart(2, '0') + ' · ' + slide.querySelector('h1,h2').textContent;
  menu.append(link);
  return link;
});

function toggleMenu(open) {
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  if (open) links[current].focus();
}

function render() {
  document.querySelectorAll('video').forEach(video => video.pause());
  const previous = current;
  const requestedId = location.hash.slice(1);
  const id = requestedId === 'riscos' ? 'impacto' : requestedId;
  current = Math.max(0, slides.findIndex(slide => slide.id === id));
  stage.dataset.direction = current < previous ? 'back' : 'forward';
  slides.forEach((slide, index) => {
    slide.hidden = index !== current;
    if (index === current) links[index].setAttribute('aria-current', 'step');
    else links[index].removeAttribute('aria-current');
  });
  controls.hidden = current === 0;
  document.body.classList.toggle('is-cover', current === 0);
  count.textContent = String(current + 1).padStart(2, '0') + ' / ' + slides.length;
  progress.max = slides.length;
  progress.value = current + 1;
  prev.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  toggleMenu(false);
  fitSlide();
  stage.scrollTop = 0;
}

function go(index) {
  if (index >= 0 && index < slides.length && index !== current) {
    location.hash = slides[index].id;
  }
}
prev.addEventListener('click', () => go(current - 1));
next.addEventListener('click', () => go(current + 1));
document.querySelector('[data-next]').addEventListener('click', () => {
  go(1);
  stage.focus({preventScroll: true});
});
menuButton.addEventListener('click', () => toggleMenu(menu.hidden));
menu.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  toggleMenu(false);
  stage.focus({preventScroll: true});
});
if (!document.fullscreenEnabled) full.hidden = true;
full.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    full.title = 'Tela cheia indisponível';
  }
});
document.addEventListener('fullscreenchange', () => {
  const expanded = Boolean(document.fullscreenElement);
  const label = expanded ? 'Sair da tela cheia' : 'Tela cheia';
  full.setAttribute('aria-label', label);
  full.title = label;
  full.classList.toggle('is-fullscreen', expanded);
});
document.addEventListener('keydown', event => {
  if (document.querySelector('#plan-dialog').open || document.querySelector('#infra-image-dialog').open || event.target.closest('[role=tablist]')) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'Escape' && !menu.hidden) {
    toggleMenu(false);
    menuButton.focus();
    return;
  }
  if (!menu.hidden || event.target.closest('input,textarea,select')) return;
  const destinations = {ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: slides.length - 1};
  if (Object.hasOwn(destinations, event.key)) {
    event.preventDefault();
    go(destinations[event.key]);
  }
});
window.addEventListener('hashchange', render);
new ResizeObserver(fitSlide).observe(stage);
document.querySelectorAll('.slide img').forEach(image => image.addEventListener('load', fitSlide));
addVisualDetails();
render();

document.querySelectorAll('video').forEach(video => video.addEventListener('loadedmetadata', fitSlide));

function addVisualDetails() {
  const icons = {
    document: '<path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5M10 16h5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
    review: '<circle cx="10" cy="10" r="6"/><path d="M14 14l7 7M7 10l2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    network: '<rect x="8" y="2" width="8" height="5" rx="1"/><path d="M12 7v6M4 17v-4h16v4"/><rect x="1" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/>',
    chart: '<path d="M3 3v18h19M7 16v-5M12 16V7M17 16V4"/>',
    cloud: '<path d="M6 18a5 5 0 010-10 7 7 0 0113 1 4.5 4.5 0 010 9z"/>',
    money: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h1M18 15h1"/>'
  };
  const groups = [
    ['#solucao .solution-visual article', ['document', 'shield', 'review']],
    ['.pipeline li', ['document', 'shield', 'review', 'network']],
    ['.target-grid article', ['clock', 'network', 'cloud']],
    ['#tech-risk-panel .risk-grid article', ['network', 'shield', 'shield', 'clock']],
    ['#riscos-financeiros .risk-grid article', ['money', 'chart', 'network', 'cloud']]
  ];
  for (const [selector, names] of groups) {
    document.querySelectorAll(selector).forEach((element, index) => {
      const icon = document.createElement('span');
      icon.className = 'visual-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg viewBox="0 0 24 24">' + icons[names[index]] + '</svg>';
      element.prepend(icon);
    });
  }
}

const planDialog = document.querySelector('#plan-dialog');
const planDescriptions = {
  "essencial": {
    "name": "Essencial",
    "price": "R$ 490/mês",
    "rules": [
      [
        "Franquia mensal proposta",
        "100 unidades de processamento por escritório."
      ],
      [
        "Usuários internos",
        "Até 2 usuários nomeados, com perfis de administrador e analista. A franquia é compartilhada entre os usuários."
      ],
      [
        "Formas de envio",
        "E-mail, portal Web e formulário de recebimento do escritório. Cada envio gera um caso com protocolo."
      ],
      [
        "Recursos do plano",
        "Triagem, OCR, anonimização, resumo, classificação, prioridade sugerida, relatório por e-mail e acompanhamento de status."
      ],
      [
        "Suporte proposto",
        "Atendimento remoto por e-mail, de segunda a sexta, das 9h às 18h, horário de Brasília."
      ],
      [
        "Contagem da franquia",
        "1 unidade = até 10 páginas de um documento. Um arquivo de 11 a 20 páginas usa 2 unidades. Cada anexo conta separadamente. A franquia renova na data mensal de cobrança e não acumula."
      ],
      [
        "Validação e consumo",
        "Arquivos inválidos ou repetidos no mesmo caso não consomem franquia. A unidade é reservada antes da análise e confirmada quando o relatório fica disponível. Falhas técnicas e novas tentativas automáticas não geram cobrança adicional. Nova análise solicitada após alterar o documento consome unidades novamente."
      ],
      [
        "Limite e excedentes",
        "Alertas em 80% e 100%. Ao atingir o limite, novas análises aguardam contratação de pacote adicional ou renovação. Não há cobrança automática de excedentes. Pacote e preço devem ser aprovados antes de processar."
      ],
      [
        "Formatos e tamanho",
        "Proposta inicial: PDF, JPG e PNG, até 10 MB por arquivo, 20 páginas por PDF e 5 anexos por caso. Arquivos maiores devem ser divididos. Arquivo corrompido, com senha, malicioso ou sem leitura suficiente recebe orientação de correção."
      ],
      [
        "Dados obrigatórios",
        "Identificação do escritório, referência do caso, remetente identificado e ao menos um documento jurídico. Nome e canal de retorno do interessado quando o envio ocorrer no formulário do escritório. Área e assunto podem vir do usuário ou da classificação preliminar."
      ],
      [
        "Entrega e proteção",
        "Protocolo e acompanhamento pelo portal. Relatório por e-mail cadastrado ou integração habilitada. O fluxo proposto anonimiza antes da IA, registra as etapas e remove os originais após processamento e envio. A revisão jurídica cabe ao profissional, fora da TriAIge. O escopo termina no envio do relatório, sem retorno do cliente sobre a correção da análise."
      ],
      [
        "Assinatura e implantação",
        "R$ 2.000 de instalação padrão por novo escritório, além da mensalidade. O BC projeta reajuste anual de 5%. As franquias, canais, usuários e regras desta proposta precisam de validação comercial e técnica no piloto."
      ]
    ]
  },
  "profissional": {
    "name": "Profissional",
    "price": "R$ 1.290/mês",
    "rules": [
      [
        "Franquia mensal proposta",
        "500 unidades de processamento por escritório."
      ],
      [
        "Usuários internos",
        "Até 5 usuários nomeados, com perfis de administrador e analista. A franquia é compartilhada entre os usuários."
      ],
      [
        "Formas de envio",
        "E-mail, Web, formulário, WhatsApp oficial vinculado ao escritório e API autenticada. E-mail e WhatsApp exigem configuração dos respectivos conectores."
      ],
      [
        "Recursos do plano",
        "Recursos do Essencial, indicadores de produtividade, filtros e exportação de relatórios, além de retorno por webhook na integração."
      ],
      [
        "Suporte proposto",
        "Atendimento remoto por e-mail e canal de suporte, de segunda a sexta, das 9h às 18h, horário de Brasília."
      ],
      [
        "Contagem da franquia",
        "1 unidade = até 10 páginas de um documento. Um arquivo de 11 a 20 páginas usa 2 unidades. Cada anexo conta separadamente. A franquia renova na data mensal de cobrança e não acumula."
      ],
      [
        "Validação e consumo",
        "Arquivos inválidos ou repetidos no mesmo caso não consomem franquia. A unidade é reservada antes da análise e confirmada quando o relatório fica disponível. Falhas técnicas e novas tentativas automáticas não geram cobrança adicional. Nova análise solicitada após alterar o documento consome unidades novamente."
      ],
      [
        "Limite e excedentes",
        "Alertas em 80% e 100%. Ao atingir o limite, novas análises aguardam contratação de pacote adicional ou renovação. Não há cobrança automática de excedentes. Pacote e preço devem ser aprovados antes de processar."
      ],
      [
        "Formatos e tamanho",
        "Proposta inicial: PDF, JPG e PNG, até 10 MB por arquivo, 20 páginas por PDF e 5 anexos por caso. Arquivos maiores devem ser divididos. Arquivo corrompido, com senha, malicioso ou sem leitura suficiente recebe orientação de correção."
      ],
      [
        "Dados obrigatórios",
        "Identificação do escritório, referência do caso, remetente identificado e ao menos um documento jurídico. Nome e canal de retorno do interessado quando o envio ocorrer no formulário do escritório. Área e assunto podem vir do usuário ou da classificação preliminar."
      ],
      [
        "Entrega e proteção",
        "Protocolo e acompanhamento pelo portal. Relatório por e-mail cadastrado ou integração habilitada. O fluxo proposto anonimiza antes da IA, registra as etapas e remove os originais após processamento e envio. A revisão jurídica cabe ao profissional, fora da TriAIge. O escopo termina no envio do relatório, sem retorno do cliente sobre a correção da análise."
      ],
      [
        "Assinatura e implantação",
        "R$ 2.000 de instalação padrão por novo escritório, além da mensalidade. O BC projeta reajuste anual de 5%. As franquias, canais, usuários e regras desta proposta precisam de validação comercial e técnica no piloto."
      ]
    ]
  },
  "corporativo": {
    "name": "Corporativo",
    "price": "R$ 3.500/mês",
    "rules": [
      [
        "Franquia mensal proposta",
        "1000 unidades de processamento por escritório."
      ],
      [
        "Usuários internos",
        "Até 15 usuários nomeados, com perfis de administrador e analista. A franquia é compartilhada entre os usuários."
      ],
      [
        "Formas de envio",
        "E-mail, Web, formulário, WhatsApp oficial, API autenticada e integração com CRM homologado. Conectores específicos dependem de avaliação e escopo de implantação."
      ],
      [
        "Recursos do plano",
        "Recursos do Profissional, gestão de perfis e auditoria do escritório, regras de classificação configuradas na implantação e apoio à integração."
      ],
      [
        "Suporte proposto",
        "Atendimento remoto com ponto de contato técnico, de segunda a sexta, das 9h às 18h, horário de Brasília."
      ],
      [
        "Onboarding presencial opcional",
        "Serviço adicional previsto no BC: três profissionais por 15 dias úteis. Orçamento e contratação separados da assinatura e da implantação padrão."
      ],
      [
        "Contagem da franquia",
        "1 unidade = até 10 páginas de um documento. Um arquivo de 11 a 20 páginas usa 2 unidades. Cada anexo conta separadamente. A franquia renova na data mensal de cobrança e não acumula."
      ],
      [
        "Validação e consumo",
        "Arquivos inválidos ou repetidos no mesmo caso não consomem franquia. A unidade é reservada antes da análise e confirmada quando o relatório fica disponível. Falhas técnicas e novas tentativas automáticas não geram cobrança adicional. Nova análise solicitada após alterar o documento consome unidades novamente."
      ],
      [
        "Limite e excedentes",
        "Alertas em 80% e 100%. Ao atingir o limite, novas análises aguardam contratação de pacote adicional ou renovação. Não há cobrança automática de excedentes. Pacote e preço devem ser aprovados antes de processar."
      ],
      [
        "Formatos e tamanho",
        "Proposta inicial: PDF, JPG e PNG, até 10 MB por arquivo, 20 páginas por PDF e 5 anexos por caso. Arquivos maiores devem ser divididos. Arquivo corrompido, com senha, malicioso ou sem leitura suficiente recebe orientação de correção."
      ],
      [
        "Dados obrigatórios",
        "Identificação do escritório, referência do caso, remetente identificado e ao menos um documento jurídico. Nome e canal de retorno do interessado quando o envio ocorrer no formulário do escritório. Área e assunto podem vir do usuário ou da classificação preliminar."
      ],
      [
        "Entrega e proteção",
        "Protocolo e acompanhamento pelo portal. Relatório por e-mail cadastrado ou integração habilitada. O fluxo proposto anonimiza antes da IA, registra as etapas e remove os originais após processamento e envio. A revisão jurídica cabe ao profissional, fora da TriAIge. O escopo termina no envio do relatório, sem retorno do cliente sobre a correção da análise."
      ],
      [
        "Assinatura e implantação",
        "R$ 2.000 de instalação padrão por novo escritório, além da mensalidade. O BC projeta reajuste anual de 5%. As franquias, canais, usuários e regras desta proposta precisam de validação comercial e técnica no piloto."
      ]
    ]
  }
};
document.querySelectorAll('.plan-info').forEach(button => {
  button.addEventListener('click', () => {
    const plan = planDescriptions[button.dataset.plan];
    document.querySelector('#plan-dialog-title').textContent = 'Plano ' + plan.name;
    document.querySelector('#plan-dialog-price').textContent = plan.price;
    const rules = document.querySelector('#plan-dialog-rules');
    rules.replaceChildren();
    const conciseRules = [plan.rules[0], ['Usuários', plan.rules[1][1].split('. ')[0]+'.'], ['Consumo', '1 unidade = até 10 páginas por documento. Franquia mensal, sem acúmulo.'], ['Implantação', 'R$ 2.000 + mensalidade. Conectores conforme o plano.'], ['Ao atingir o limite', 'Aguarda renovação ou pacote aprovado. Sem excedente automático.']];
    for (const [title, description] of conciseRules) {
      const term = document.createElement('dt');
      term.textContent = title;
      const detail = document.createElement('dd');
      detail.textContent = description;
      rules.append(term, detail);
    }
    planDialog.showModal();
  });
});
document.querySelector('#close-plan').addEventListener('click', () => planDialog.close());
planDialog.addEventListener('click', event => {
  if (event.target !== planDialog) return;
  const bounds = planDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) planDialog.close();
});

const technicalTabs = [...document.querySelectorAll('.technical-tabs [role="tab"]')];
function selectTechnicalView(selectedTab) {
  technicalTabs.forEach(tab => {
    const selected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
  fitSlide();
}
technicalTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTechnicalView(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? technicalTabs[0] : event.key === 'End' ? technicalTabs[1] : technicalTabs[1 - index];
    selectTechnicalView(target);
    target.focus();
  });
});

const infraData = [
['ALB → front/orchestrator → S3 Raw → Q2','Receber documentos','O cliente solicita uma URL pré-assinada e envia o documento diretamente ao S3 Raw. O orchestrator publica na fila de pré-processamento.','',[45.5,10.5,39,18]],
['Q2 → mcp-ai → Amazon Textract → S3 Trusted','Preparar antes da IA','O mcp-ai consome a fila e aciona o OCR assíncrono do Amazon Textract. O texto é anonimizado, agrupado e resumido, com gravação no S3 Trusted.','',[45.5,28,39,19]],
['Orchestrator ↔ mcp-ai ↔ Gemini → S3 Curated','Analisar com IA','Após o callback, o orchestrator solicita a análise. O mcp-ai lê o texto anonimizado, consulta o Gemini e grava o relatório no S3 Curated.','',[46,34,52.5,28]],
['Q3 → notification → Gmail SMTP','Entregar relatório','O serviço notification consome o resultado pronto, lê o relatório e envia o e-mail via Gmail SMTP. Retentativas têm filas próprias e DLQ.','',[46,57,52.5,18]]
];
let currentInfra = 0;
function selectInfra(index){
 currentInfra=Math.max(0,Math.min(infraData.length-1,index));
 const [component,title,business,technical,box]=infraData[currentInfra];
 document.querySelector('#infra-component').textContent=component;
 document.querySelector('#infra-title').textContent=title;
 document.querySelector('#infra-business').textContent=business;
 document.querySelector('#infra-technical').textContent=technical;
 const highlight=document.querySelector('#infra-highlight');
 ['left','top','width','height'].forEach((key,i)=>highlight.style[key]=box[i]+'%');
 document.querySelectorAll('[data-infra]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===currentInfra)));
 document.querySelector('#infra-step-count').textContent=(currentInfra+1)+' / 4';
 document.querySelector('#infra-prev').disabled=currentInfra===0;
 document.querySelector('#infra-next').disabled=currentInfra===3;
 fitSlide();
}
document.querySelectorAll('[data-infra]').forEach(button=>{
 const select=()=>selectInfra(Number(button.dataset.infra));
 button.addEventListener('click',select);
 button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')select();});
 button.addEventListener('focus',select);
 button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();event.stopPropagation();const index=Math.max(0,Math.min(3,currentInfra+(event.key==='ArrowRight'?1:-1)));document.querySelector('[data-infra="'+index+'"]').focus();});
});
document.querySelector('#infra-prev').addEventListener('click',()=>selectInfra(currentInfra-1));
document.querySelector('#infra-next').addEventListener('click',()=>selectInfra(currentInfra+1));
selectInfra(0);

// Replays on slide entry; values always finish at the supplied source figures.
const numberAnimations = new Map();
function animateDashboard(slide){
  slide.classList.remove('dash-animate');void slide.offsetWidth;slide.classList.add('dash-animate');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  slide.querySelectorAll('[data-number]').forEach(el=>{
    if(numberAnimations.has(el))cancelAnimationFrame(numberAnimations.get(el));
    const value=Number(el.dataset.number), decimals=Number(el.dataset.decimals||0);
    const format=n=>(el.dataset.prefix||'')+n.toLocaleString('pt-BR',{minimumFractionDigits:decimals,maximumFractionDigits:decimals})+(el.dataset.suffix||'');
    if(reduced){el.textContent=format(value);return;}
    const start=performance.now();function tick(now){const progress=Math.min(1,(now-start)/1100);el.textContent=format(value*(1-Math.pow(1-progress,3)));if(progress<1)numberAnimations.set(el,requestAnimationFrame(tick));else numberAnimations.delete(el);}numberAnimations.set(el,requestAnimationFrame(tick));
  });
}
const dashboardObserver=new MutationObserver(records=>{for(const record of records)if(!record.target.hidden)animateDashboard(record.target);});
document.querySelectorAll('#dashboards,#fluxo-financeiro').forEach(slide=>{dashboardObserver.observe(slide,{attributes:true,attributeFilter:['hidden']});if(!slide.hidden)animateDashboard(slide);});
document.querySelectorAll('[data-replay]').forEach(button=>button.addEventListener('click',()=>animateDashboard(document.getElementById(button.dataset.replay))));

const infraImageDialog=document.querySelector('#infra-image-dialog');
document.querySelector('#infra-enlarge').addEventListener('click',()=>infraImageDialog.showModal());
document.querySelector('#infra-image-close').addEventListener('click',()=>infraImageDialog.close());
