# Portfólio da empresa (Bit & Traço)

Site estático de uma página, em português e inglês, com tema claro/escuro e um fundo animado
("design vira código"): à esquerda, curvas suaves com pontos de ancoragem como no Figma; à direita,
as mesmas curvas encaixadas em uma grade e transformadas em pixels.

Não tem build nem dependências. São só HTML, CSS e JavaScript.

## Ver no computador

```bash
python3 -m http.server 8230
# abra http://127.0.0.1:8230
```

(Também funciona abrindo o `index.html` direto no navegador.)

## O que ainda é provisório

Tudo abaixo foi proposto como exemplo e precisa da sua aprovação antes de publicar:

| O quê | Onde mudar |
|---|---|
| Nome **Bit & Traço** (fictício) | `index.html` (busque por `Bit &amp; Traço`), `assets/js/i18n.js` (títulos e `nav.home`) e o rodapé |
| E-mail `ola@example.com` (fictício) | `index.html`, no trecho `id="email-addr"` |
| Todos os textos em português | `index.html` (atributos `data-i18n`) |
| Todos os textos em inglês | `assets/js/i18n.js` (objeto `EN`) |
| Descrições dos cases **AI Code Evaluation** e **AI Skill Tester** | escritas a partir dos nomes; troque pelo que o projeto realmente faz |
| Iniciais **N** e **R** no lugar de fotos | `index.html`, seção `#sobre` |
| Formulário sem serviço de envio | `FORM_ENDPOINT` em `assets/js/main.js` |

Não há links externos, preços, prazos de pagamento nem garantias na página, de propósito.

## Como funciona

- **Idiomas:** o português está no HTML. O inglês vem de `assets/js/i18n.js`. A escolha fica salva no navegador;
  sem escolha salva, o site usa o idioma do navegador.
- **Tema:** botão no topo. Sem escolha salva, segue o tema do sistema. `assets/js/theme-init.js` roda antes da
  página aparecer para o tema não "piscar".
- **Fundo animado:** `assets/js/bg.js` (canvas). Move-se sozinho, tem botão de pausa e começa pausado
  para quem pediu "reduzir movimento" no sistema.
- **Projetos:** vitrine com abas (setas, Home e End trocam de aba). Sem JavaScript, os quatro projetos aparecem
  um embaixo do outro. Para adicionar um projeto, copie um bloco `<article class="case" id="case-N">` no `index.html`
  e as chaves `caseN.*` no `i18n.js`; a aba é criada sozinha.
- **Cores:** variáveis no começo de `assets/css/styles.css`. O laranja é `#FF5A1F`. No tema claro, textos
  em laranja usam `#C23B00` porque o laranja puro não tem contraste suficiente sobre branco (3,1:1).
- **Fontes:** TeX Gyre Adventor (texto) e Latin Modern Mono (detalhes), em `assets/fonts/`, com a licença
  em `assets/fonts/LICENSES.txt`.
- **Segurança:** a página usa uma política de conteúdo (CSP) restrita, sem scripts ou estilos inline, e
  monta mensagens com `textContent`.

## Ativar o formulário

1. Crie um formulário em um serviço (Formspree, Getform, Basin etc.) e copie o endereço de envio.
2. Cole em `FORM_ENDPOINT` em `assets/js/main.js`.
3. Em `index.html`, na tag `Content-Security-Policy`, troque `connect-src 'self'` por
   `connect-src 'self' https://DOMINIO-DO-SERVICO`.

Enquanto `FORM_ENDPOINT` estiver vazio, o formulário valida os campos e avisa que o envio ainda não está ativo
(em vez de fingir que enviou).

## Imagens dos cases

- `yakisoba-lucky.webp` e `secure-code-review.webp`: capturas de tela dos projetos reais.
- `ai-code-evaluation.svg` e `ai-skill-tester.svg`: ilustrações, sem números reais.

## Testes

`tests/e2e.py` (Python + Playwright) confere: animação mudando entre quadros, pausa, tema, idiomas,
formulário, menu no celular (360 e 390 px), rolagem lateral, contraste e erros no console.

```bash
python3 -m http.server 8230 &
pip install playwright && python3 tests/e2e.py
```
