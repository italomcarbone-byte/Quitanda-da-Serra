# Quitanda da Serra — site frontend

Projeto estático em HTML + CSS + JavaScript, publicado pelo GitHub Pages:

**Link para compartilhar:** https://italomcarbone-byte.github.io/Quitanda-da-Serra/

Cada atualização enviada à branch `main` é publicada automaticamente. O workflow também publica a branch de revisão atual para disponibilizar esta versão.

## Estrutura
- `index.html` — páginas/seções e modais.
- `styles.css` — identidade visual, layout responsivo e componentes.
- `script.js` — catálogo, login/cadastro demonstrativo, carrinho, PDF, WhatsApp e painel do proprietário.
- `fachada.png` — foto da fachada.
- `hortifruti.png` — foto do hortifruti.
- `interior.png` — foto interna.

Dimensões das imagens incluídas:
{
  "fachada.png": [
    847,
    524
  ],
  "hortifruti.png": [
    866,
    561
  ],
  "interior.png": [
    851,
    573
  ]
}

## Como testar
1. Extraia a pasta mantendo `index.html`, `styles.css`, `script.js` e as três imagens no mesmo nível.
2. Abra `index.html` no navegador (ou use uma hospedagem estática).
3. Para o fluxo de PDF e o gráfico administrativo, mantenha internet ativa para carregar jsPDF e Chart.js via CDN.

## Limites da demonstração pública
Este link apresenta o frontend demonstrativo. Cadastro, login, produtos, carrinho e painel administrativo usam apenas o armazenamento local do navegador; não há contas, pedidos ou alterações compartilhados entre dispositivos. O WhatsApp empresarial também precisa ser configurado em `script.js` antes de receber pedidos reais. Não solicite nem informe senhas ou dados sensíveis neste protótipo.

## Alterações importantes antes de publicar
No início de `script.js`, altere:
`CONFIG.whatsappEmpresa`
para o número real da Quitanda da Serra no formato internacional, somente números, por exemplo `5512999999999`.

O endereço e o link do Google Maps estão no `index.html` e já apontam para:
Rua 15 de Novembro, 521 — São Francisco Xavier — São José dos Campos/SP.

## Painel do proprietário
A demonstração usa:
- usuário: `admin`
- senha: `quitanda123`

O painel permite cadastrar, editar e excluir produtos e exibe um gráfico de pizza dos itens mais vendidos.

**Importante para produção:** login, senha, pedidos e painel administrativo NÃO devem permanecer somente em `localStorage`. É necessário um backend/API com autenticação segura, banco de dados, hash de senha e autorização do administrador.

## Bebidas alcoólicas
A interface mantém a categoria de bebidas, mas o catálogo demonstrativo não inclui bebidas alcoólicas nem fluxo de venda delas. Isso evita transformar o protótipo em um mecanismo de compra de álcool. Se o projeto for usado comercialmente, regras legais e de idade devem ser implementadas pelo responsável pelo estabelecimento e pelo backend.

## Personalização frontend
Você pode alterar livremente:
- cores em `:root` de `styles.css`;
- fontes no `<head>` de `index.html`;
- produtos iniciais no array `defaultProducts` em `script.js`;
- textos, imagens e seções diretamente no HTML;
- ícones/emoji dos produtos no catálogo;
- responsividade nos media queries do CSS.
