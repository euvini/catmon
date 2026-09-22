# Research & Architecture Decisions: 001-catmon-mvp

## 1. Local Database & ORM: Drizzle ORM + `expo-sqlite`

### Context
O Catmon adota o princípio arquitetural inegociável **Offline-First**. O banco de dados local precisa ser performático, tolerante a falhas de desligamento e oferecer tipagem estrita de ponta a ponta sem overhead desnecessário de abstrações pesadas.

### Decision
Utilizar `expo-sqlite` (versão SDK 57 com nova API síncrona/assíncrona de alta performance) com **Drizzle ORM** (`drizzle-orm/expo-sqlite`).

### Rationale
- **Type-Safety Total:** Drizzle infere os tipos TypeScript diretamente a partir da definição da tabela (`sqliteTable`), eliminando redundância entre modelos de domínio e schemas do banco.
- **Tamanho de Bundle Mínimo:** Drizzle é praticamente zero-overhead em runtime, sem compilação pesada de decorators ou reflection (ao contrário do TypeORM).
- **Suporte Nativo ao Expo SQLite:** O driver `drizzle-orm/expo-sqlite` consome a API oficial do Expo sem dependências de C++ externas invasivas, garantindo estabilidade no iOS Simulator e builds de produção (EAS).
- **Migrações Determinísticas:** Uso de `drizzle-kit generate` com arquivos SQL que podem ser embutidos via `useMigrations` ou executados na inicialização do app.

### Alternatives Considered
- *WatermelonDB*: Embora excelente para grandes volumes, exige boilerplate excessivo de decorators, modelos RxJS e setup complexo de build nativo no Expo SDK 57.
- *Realm (Atlas Device SDK)*: Dependência pesada, curva de aprendizado íngreme e overhead de licença/vendor lock-in.
- *Raw SQLite*: Sem type-safety, sujeito a erros manuais de SQL injection e manutenção árdua de migrações.

---

## 2. Animações e Microinterações: `react-native-reanimated` 4 + `expo-haptics`

### Context
A experiência da Catdex e da captura deve parecer a de abrir um pacote de figurinhas colecionáveis físicas: feedback tátil imediato, "descolamento" de adesivo e transição 3D (flip) para inspecionar os detalhes do verso do card.

### Decision
- **Reanimated 4.5+** com motor `react-native-worklets` e integração com `react-native-gesture-handler`.
- **Feedback Háptico:** `expo-haptics` disparando padrões sutis (`ImpactFeedbackStyle.Medium` e `NotificationFeedbackType.Success`).

### Mecânicas de Animação
1. **Stutter & Sticker Reveal:**
   - Ao confirmar o salvamento do gato, a tela de captura exibe a foto sendo "impressa" com borda branca simulando sticker físico (`borderWidth: 4`, `borderColor: '#ffffff'`, `shadowRadius: 10`).
   - Scale anima de `0.2` para `1.08` e estabiliza em `1.0` usando `withSpring({ damping: 12, stiffness: 120 })` com leve rotação aleatória (wobble de -4° a +4°).
2. **3D Flip Card na Catdex:**
   - Renderização de frente (sticker com foto + nome + temperamento) e verso (ficha técnica com data, coordenadas ofuscadas, notas, idade e pelagem).
   - Uso de `transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }]`, onde o verso espelhado tem `rotateY: 180deg` e `backfaceVisibility: 'hidden'`.
3. **Expansão de Sticker (Modal/Detail):**
   - Transição suave de escala e opacidade ao abrir o detalhe em tela cheia via Expo Router.

### Alternatives Considered
- *Animated API nativa do React Native*: Limitada a transformações 2D básicas, frequentemente sofre engasgos (jank) na thread JS durante renderização de imagens pesadas.

---

## 3. Backend Architecture: Node.js com Fastify (TypeScript)

### Context
O backend tem como objetivo intermediar a autenticação, receber uploads de mídia para o storage do Supabase, persistir os metadados no PostgreSQL e expor endpoints de busca geoespacial via PostGIS.

### Decision
Adotar **Fastify** com TypeScript e arquitetura modular por plugins.

### Rationale
- **Velocidade e Baixa Latência:** Fastify é até 2x mais rápido que o Express graças ao esquema de serialização JSON (`fast-json-stringify`) e roteamento via Radix Tree.
- **Validação com Schemas:** Suporte integrado a validação de payloads via JSON Schema / TypeBox / Zod.
- **Modularidade Limpa:** Sistema de encapsulamento por plugins (`fastify.register`), facilitando injeção do cliente Supabase e rotas de sync.

### Alternatives Considered
- *Express.js*: Mais popular, porém mais lento e com suporte legado a TypeScript e async error handling nativo menos moderno.
- *NestJS*: Overhead e complexidade desnecessária de injeção de dependência corporativa para o escopo do MVP.

---

## 4. Persistência Remota & Geoespacial: Supabase + PostgreSQL + PostGIS

### Context
O Catmon precisa armazenar dados na nuvem para backup e permitir consultas de proximidade (ex: "gatos avistados em um raio de 500m").

### Decision
Utilizar **Supabase** com extensão **PostGIS** habilitada.

### Setup de Banco & Queries Espaciais
- Habilitar extensão: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Campo espacial: `location_geom GEOGRAPHY(Point, 4326)` calculado automaticamente via Trigger ou Generated Column a partir de `(longitude, latitude)`.
- Índice espacial: `CREATE INDEX idx_cats_geom ON cats USING GIST (location_geom);`
- RPC de busca por proximidade:
  ```sql
  CREATE OR REPLACE FUNCTION get_cats_within_radius(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION
  )
  RETURNS SETOF cats AS $$
  BEGIN
    RETURN QUERY
    SELECT *
    FROM cats
    WHERE ST_DWithin(
      location_geom,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
      radius_meters
    );
  END;
  $$ LANGUAGE plpgsql STABLE;
  ```

---

## 5. Estratégia de Sincronização Incremental (Offline-First Sync Engine)

### Context
O usuário deve poder registrar 10 gatos sem sinal de internet e, ao se reconectar ao Wi-Fi ou 4G, tudo deve sincronizar automaticamente sem travar a navegação e sem duplicidade.

### Decision: Pipeline em Duas Etapas (Upload de Mídia + Upsert de Metadados)
1. **Identificadores Criados no Cliente:** Todo `Cat` nasce com um UUIDv4 gerado localmente no celular. Isso garante idempotência no servidor.
2. **Detecção de Conexão:** `@react-native-community/netinfo` escuta mudanças no estado da rede. Ao detectar internet, dispara o `SyncWorker`.
3. **Processamento da Fila de Mídia (Step 1):**
   - Para cada gato onde `is_synced = 0` e `remote_photo_url IS NULL`:
   - Faz upload da foto local (`local_photo_uri`) para o Supabase Storage bucket `cat-photos/${user_id}/${cat_id}.jpg`.
   - Recebe a URL pública/assinada permanente.
4. **Push de Metadados (Step 2):**
   - Envia lote de gatos pendentes via `POST /api/v1/sync/push` com `remote_photo_url` preenchido.
   - O servidor executa `UPSERT` no PostgreSQL (`ON CONFLICT (id) DO UPDATE SET ... WHERE cats.updated_at < EXCLUDED.updated_at`).
   - O app marca `is_synced = 1` no SQLite para os itens confirmados.
5. **Pull Incremental (Step 3):**
   - O app envia `last_synced_at` para `GET /api/v1/sync/pull?since=...`.
   - O servidor retorna registros modificados após essa data.
   - O app atualiza o SQLite local com `INSERT OR REPLACE`.

---

## 6. Vintage Camera UI & Chassis Mecânico (Inspiração Imagem 1)

### Context
O usuário reportou que ao abrir a câmera não existia botão visível/clicável para tirar fotos, e solicitou uma interface de câmera moderna e vintage no estilo de aplicativo fotográfico analógico clássico.

### Root Cause Analysis do Botão de Shutter Ausente
- Na raiz `src/app/_layout.tsx`, as abas principais do `expo-router` utilizam um `<Tabs>` padrão cuja barra inferior (`tabBarStyle`, altura ~60pt com fundo branco) sobrepõe-se fisicamente ao conteúdo da tela `src/app/capture.tsx`.
- Os controles de captura em `src/components/capture/camera-view.tsx` estavam dispostos em `styles.bottomBar` com `paddingBottom: 48`, ficando totalmente escondidos e inacessíveis sob a tab bar ativa.

### Decision: Câmera Física Analógica com Shutter Mecânico
1. **Ocultação da Tab Bar na Rota de Captura:**
   - Configurar `tabBarStyle: { display: 'none' }` na tela `capture` em `src/app/_layout.tsx` para liberar 100% do viewport e da safe area.
2. **Chassis de Câmera Vintage (Baseado na Imagem 1):**
   - **Viewfinder:** Live preview do `CameraView` posicionado no topo com cantos arredondados esculturais (`borderRadius: 28`) e máscara de visor de visor óptico.
   - **Console Físico Inferior:** Corpo da câmera com acabamento texturizado marfim/off-white (`#ECEBE4` / `#F0EFEA`).
   - **Elementos de Controle Analógicos:**
     - *Fita / Marcador de Filme:* Cápsula superior com linhas horizontais simulando rolo de filme/medidor analógico com traço vermelho e preto e contador de poses.
     - *Grades de Microfone/Sensor:* Duas matrizes simétricas de orifícios perfurados circulares flanqueando o centro.
     - *Botão de Shutter Mecânico:* Botão central largo e saliente com anel chanfrado escuro (`#2B2B2B`) e botão convexo em laranja vibrante (`#F15A24`), com feedback tátil mecânico via `expo-haptics` (`Haptics.ImpactFeedbackStyle.Heavy`).
     - *Controles Auxiliares:* Seletor de modo/dial serrilhado inferior (knurled wheel) com marcador âmbar, botão de inversão de câmera (frontal/traseira) e acesso direto ao rolo da câmera (galeria).
   - **Ajuste Ergonômico e Safe Area:**
     - Integração de `useSafeAreaInsets` de `react-native-safe-area-context` para garantir que o shutter button fique perfeitamente posicionado e acessível com o polegar em qualquer modelo de iPhone (com ou sem Dynamic Island).

---

## 7. iOS Native Liquid Glass Floating Navigation (`expo-glass-effect`)

### Context
O usuário exigiu componentes nativos do iOS para alcançar o efeito "liquid glass" em barras e elementos flutuantes, alinhado à estética das interfaces modernas do iOS e às imagens de referência 3, 4 e 5.

### Decision: `GlassView` Nativo com Fallback Translúcido
1. **Componente Reutilizável:** Criar `GlassTabBar` integrando `GlassView` da biblioteca `expo-glass-effect` (`~57.0.3`):
   - Propriedades nativas: `glassEffectStyle="regular"`, `colorScheme="light"`, permitindo difração de luz e blur autêntico do subsistema visual do iOS.
   - Fallback gracioso para sistemas sem suporte via blur translúcido e bordas sutis com gradiente de luminosidade.
2. **Pill de Navegação Flutuante:**
   - Cápsula flutuante suspensa sobre o mapa e catálogo: `borderRadius: 40`, margem horizontal de 32pt e elevação suave com sombra translúcida.
   - Disposição dos controles (conforme referências 3, 4 e 5):
     - Esquerda: Aba `Map` (ícone de mapa e rótulo "Map").
     - Centro: Botão de ação circular elevado (`width: 58, height: 58, borderRadius: 29`) em tom petróleo/teal vintage (`#135461`) com ícone de Câmera / `+`. Tocar nele dispara a abertura imediata da tela de câmera.
     - Direita: Aba `Collection` (ícone de pata e rótulo "Collection").
3. **Pills de Estatísticas:**
   - Badges superiores translúcidos com efeito glass para contador de gatos (`🐾 12 cats`) e adesivos (`✨ 8 stickers`).

---

## 8. Sistema de Badges Retrô & CATalog com Segmented Control (Imagens 4 & 5)

### Context
Transformar a visualização da coleção em uma experiência de colecionador, com molduras retrô listradas e sextavadas, além de alternância entre o catálogo em grid e o mural livre de stickers.

### Decision: Molduras Colecionáveis e Abas Segmentadas
1. **Segmented Control no CATalog (`Cats` | `Stickers`):**
   - Controle em formato de pílula deslizante no topo da tela de coleção.
   - Aba `Cats`: Exibe o grid com 3 colunas de medalhões colecionáveis retrô com metadados (nome, raça e endereço/rua com pin).
   - Aba `Stickers`: Exibe o mural colecionável com fundo padronizado em pegadas felinas d'água sutis e adesivos recortados com contorno branco espesso e sombra física.
2. **Sistema de Molduras Vintage (`RetroBadgeFrame`):**
   - Três formatos icônicos baseados nas imagens:
     - *Tipo A (Círculo Listrado):* Anel circular com segmentos alternados de listras coloridas (menta/branco, terracota/branco, azul-céu/branco).
     - *Tipo B (Hexágono Listrado):* Geometria sextavada estilizada com listras anguladas.
     - *Tipo C (Estrela/Flor Ondulada):* Borda recortada em pétalas/ondulações de fita premiada de exposição.
   - Atribuição determinística por ID do gato para variedade estética natural no grid.
3. **Pins Retrô do Cat Map (Imagem 3):**
   - Marcadores de mapa que utilizam a mesma linguagem visual dos medalhões (moldura listrada + seta triangular inferior apontando para as coordenadas + pílula branca com o nome do gato logo abaixo).
