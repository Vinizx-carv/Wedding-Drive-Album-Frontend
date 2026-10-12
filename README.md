# Wedding Drive Album — frontend inicial

Frontend básico React + TypeScript + Vite, Supabase Auth, React Router, TanStack Query e QR Code.

## Dependências

No projeto existente, execute:

```bash
pnpm add react-router-dom qrcode.react
```

Mantenha React, Supabase e TanStack Query já instalados.

## Configuração

Crie `.env` usando `.env.example` como referência. Nunca exponha a service role key no frontend.

## Uso

Copie os arquivos desta pasta `src/` para o `src/` do frontend (faça backup antes), confira seu arquivo `index.html` e execute:

```bash
pnpm dev
pnpm build
```

Rotas: `/admin/login`, `/admin`, `/evento/:token`.

## Contratos da API a confirmar

O código usa `GET /api/events` para listar eventos e `GET /auth/google` para obter a URL OAuth. Confirme esses dois caminhos no backend. Endpoints já testados usados aqui: `POST /api/events`, `GET /api/events/public/:token`, `POST /api/events/public/:token/visits`, `POST /api/events/public/:token/photos`, `GET /api/events/public/:token/featured`. Marcação de destaque existe no backend, mas esta primeira interface não inclui uma galeria administrativa para marcar fotos: precisa da rota real de listagem de fotos administrativas e dos campos/URLs retornados.

O registro de visita é feito pelo botão “Registrar visita” para não disparar uma mutation durante a renderização. A página pública não exige sessão administrativa. O backend deve validar todas as permissões administrativas.
