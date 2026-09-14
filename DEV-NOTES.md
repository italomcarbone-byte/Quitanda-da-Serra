# Próximos passos para produção

## Backend sugerido
Endpoints mínimos:
POST /api/auth/register
POST /api/auth/login
GET  /api/products
POST /api/products            (admin)
PUT  /api/products/:id        (admin)
DELETE /api/products/:id      (admin)
POST /api/orders
GET  /api/admin/sales-summary (admin)

## Banco
Tabelas sugeridas:
users, products, orders, order_items, sales_events.

## PDF
O protótipo usa jsPDF no navegador. Em produção, o backend pode gerar e armazenar o PDF do pedido e retornar uma URL segura.

## WhatsApp
O protótipo abre o WhatsApp com mensagem. Para automação empresarial real, considere WhatsApp Business Platform/API e uma camada de backend.
