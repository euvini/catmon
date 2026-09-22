# Tasks: Catmon Mobile & Backend MVP (001-catmon-mvp)

**Input**: Design documents from `/specs/001-catmon-mvp/`  
**Prerequisites**: [plan.md](file:///Users/viniciussantiago/Projects/catmon/specs/001-catmon-mvp/plan.md), [spec.md](file:///Users/viniciussantiago/Projects/catmon/specs/001-catmon-mvp/spec.md), [research.md](file:///Users/viniciussantiago/Projects/catmon/specs/001-catmon-mvp/research.md), [data-model.md](file:///Users/viniciussantiago/Projects/catmon/specs/001-catmon-mvp/data-model.md), [contracts/sync-api.md](file:///Users/viniciussantiago/Projects/catmon/specs/001-catmon-mvp/contracts/sync-api.md), [quickstart.md](file:///Users/viniciussantiago/Projects/catmon/specs/001-catmon-mvp/quickstart.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Instalação de dependências do ecossistema Expo SDK 57, Drizzle ORM e configuração de hardware/plugins.

- [X] T001 Instalar dependências mobile do Expo (drizzle-orm, drizzle-kit, expo-sqlite, expo-camera, expo-location, expo-file-system, expo-image, expo-haptics, react-native-maps, @react-native-community/netinfo, zustand, zod) em package.json
- [X] T002 [P] Configurar drizzle.config.ts na raiz do projeto para o driver expo-sqlite em drizzle.config.ts
- [X] T003 [P] Configurar permissões de hardware (Câmera, Galeria, Localização) e plugins no app.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura básica mandatória (Modelos de domínio, schema Drizzle SQLite e cliente de banco de dados).

**⚠️ CRITICAL**: Nenhuma User Story pode ser iniciada antes da conclusão desta fase.

- [X] T004 Criar tipos centrais de domínio e enums (CatContext, CoatPattern, CatTemperament, ApproxAge) em src/types/domain.ts
- [X] T005 [P] Criar tokens de design, paleta de cores e temas dos cards em src/constants/colors.ts
- [X] T006 Definir schema do SQLite com Drizzle ORM (tabela cats) em src/database/schema.ts
- [X] T007 Implementar cliente e migração inicial do SQLite com openDatabaseSync e Drizzle em src/database/client.ts
- [X] T008 [P] Implementar serviço utilitário de checagem e requisição de permissões com fallback gracioso em src/services/permissions.ts

**Checkpoint**: Fundação pronta - desenvolvimento das User Stories liberado.

---

## Phase 3: User Story 1 - Captura Rápida & Registro Offline de Gatos (Priority: P1) 🎯 MVP

**Goal**: Permitir tirar foto de um gato via câmera/galeria, extrair coordenadas GPS, preencher metadados comportamentais e salvar no dispositivo instantaneamente sem depender de conexão com a internet.

**Independent Test**: Em Modo Avião, disparar a câmera, preencher o formulário, confirmar e verificar que a foto reside no sandbox (`FileSystem.documentDirectory`) e o registro está gravado no SQLite com `is_synced = false`.

### Implementation for User Story 1
- [X] T009 [P] [US1] Implementar serviço de mídia para compressão e persistência segura de fotos no sandbox em src/services/media.ts
- [X] T010 [P] [US1] Implementar serviço de geolocalização para captura de coordenadas pontuais com expo-location em src/services/location.ts
- [X] T011 [US1] Implementar repositório de persistência de gatos (CatRepository com inserção e consulta no SQLite via Drizzle) em src/database/cat-repository.ts
- [X] T012 [US1] Implementar componente de captura com câmera e botão de shutter em src/components/capture/camera-view.tsx
- [X] T013 [US1] Implementar formulário modal de metadados pós-captura (nome, contexto, temperamento, idade estimada) em src/components/capture/cat-form-modal.tsx
- [X] T014 [US1] Integrar viewport de câmera, formulário e repositório na rota de captura em src/app/(tabs)/capture.tsx
- [X] T015 [US1] Implementar animação de revelação do sticker recém-impresso (StickerReveal com Reanimated 4 e expo-haptics) em src/components/animated/sticker-reveal.tsx

**Checkpoint**: User Story 1 concluída. O app agora é um MVP funcional para captura offline imediata.

---

## Phase 4: User Story 2 - Álbum Colecionável ("Catdex") com Animações Reanimated 4 (Priority: P1)

**Goal**: Exibir os gatos salvos em um grid de stickers colecionáveis, com animação de Flip 3D (frente/verso), filtros rápidos e visualização detalhada do card.

**Independent Test**: Acessar a aba Catdex, verificar renderização em grid a 60+ FPS, tocar em um card para ver a transição 3D e aplicar filtros por temperamento.

### Implementation for User Story 2
- [X] T016 [P] [US2] Criar store Zustand para gerenciar filtros dinâmicos e estado da galeria em src/stores/cat-store.ts
- [X] T017 [P] [US2] Implementar componente de Sticker com borda física, sombra simulada e miniatura em src/components/ui/sticker-card.tsx
- [X] T018 [US2] Implementar componente animado de Flip Card 3D (perspectiva e rotação Y a 180 graus) em src/components/animated/flip-card.tsx
- [X] T019 [US2] Implementar barra de filtros dinâmicos por temperamento e contexto em src/components/catdex/filter-bar.tsx
- [X] T020 [US2] Implementar tela principal da Catdex com grid responsivo na rota src/app/(tabs)/index.tsx
- [X] T021 [US2] Implementar tela de visualização detalhada do card na rota src/app/cat/[id].tsx

**Checkpoint**: User Story 2 concluída. Catdex colecionável e interativa operando sobre o banco local.

---

## Phase 5: User Story 3 - Cat Map (Mapeamento Geográfico com Pins Customizados) (Priority: P2)

**Goal**: Exibir mapa nativo interativo plotando os stickers dos gatos exatamente onde foram encontrados, aplicando ofuscação geoespacial automática para residências privadas.

**Independent Test**: Abrir o Cat Map, checar se os pins exibem as fotos dos gatos e verificar que avistamentos marcados como `friend_pet` sofrem dispersão radial de 150m a 300m com aviso de localização aproximada.

### Implementation for User Story 3
- [X] T022 [P] [US3] Implementar algoritmo de ofuscação geoespacial ética (ruído radial determinístico de 150m-300m) em src/services/obfuscation.ts
- [X] T023 [P] [US3] Implementar componente de marcador customizado (CatPin) com miniatura do sticker e callout em src/components/ui/cat-pin.tsx
- [X] T024 [US3] Integrar mapa nativo react-native-maps com marcadores e navegação na rota src/app/(tabs)/map.tsx
- [X] T025 [US3] Implementar badge e modal informativo de Localização aproximada para proteção de privacidade em src/components/map/privacy-badge.tsx

**Checkpoint**: User Story 3 concluída. Experiência cartográfica integrada com privacidade por padrão.

---

## Phase 6: User Story 4 - Backend Fastify + Supabase PostGIS & Sincronização em Background (Priority: P3)

**Goal**: Criar API Node.js/Fastify e infraestrutura Supabase com PostGIS para backup em nuvem, consultas de proximidade e sincronização em lote assíncrona.

**Independent Test**: Criar gatos offline, restaurar internet e validar que o SyncWorker envia fotos ao bucket do Supabase Storage e persiste registros geométricos no PostgreSQL com `is_synced = true`.

### Implementation for User Story 4
- [X] T026 [P] [US4] Criar migração SQL com extensão PostGIS, tabela cats, índices GIST e RPC get_cats_within_radius em supabase/migrations/20260918000001_create_cats_and_postgis.sql
- [X] T027 [P] [US4] Inicializar serviço Fastify com TypeScript em backend/package.json e backend/src/server.ts
- [X] T028 [US4] Configurar plugin de injeção do Supabase Client e validações Zod em backend/src/plugins/supabase.ts e backend/src/schemas/sync-dto.ts
- [X] T029 [US4] Implementar endpoints de sincronização POST /api/v1/sync/push e GET /api/v1/sync/pull em backend/src/routes/sync.ts
- [X] T030 [US4] Implementar endpoint de upload de fotos para o Supabase Storage em backend/src/routes/media.ts e busca espacial em backend/src/routes/cats.ts
- [X] T031 [US4] Implementar worker móvel de sincronização offline (SyncWorker) ouvindo @react-native-community/netinfo em src/services/sync-worker.ts

**Checkpoint**: User Story 4 concluída. Pipeline completo de sincronização e nuvem operando de ponta a ponta.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Onboarding de permissões, fallbacks, testes automatizados e validação ponta a ponta.

- [X] T032 [P] Implementar modal explicativo prévio para requisições de permissões (Progressive Onboarding) em src/components/ui/permission-modal.tsx
- [X] T033 [P] Implementar testes unitários para algoritmo de ofuscação geoespacial em src/services/__tests__/obfuscation.test.ts
- [X] T034 [P] Implementar testes de integração para operações CRUD do CatRepository com SQLite em src/database/__tests__/cat-repository.test.ts
- [X] T035 Validar conformidade estrita de tipagem e linting (npx tsc --noEmit && npx expo lint)
- [X] T036 Executar validação dos 4 cenários manuais de aceitação descritos em specs/001-catmon-mvp/quickstart.md

---

## Phase 8: UI/UX Overhaul - Vintage Camera Chassis, Native Liquid Glass & Retro CATalog (Priority: P1)

**Goal**: Reformular a interface com estética de aplicativo de foto analógica vintage, consertar a visibilidade e ergonomia do botão de disparo da câmera com um chassis mecânico, integrar a barra flutuante em Liquid Glass nativo do iOS (`expo-glass-effect`), introduzir molduras colecionáveis de medalhões retrô e a visualização segmentada no CATalog (`Cats` | `Stickers`).

**Independent Test**:
1. Tocar no botão de câmera central: a câmera abre em tela cheia sem a barra de abas cobrindo os controles. O grande botão laranja de shutter mecânico (`#F15A24`) e as grelhas de sensores estão totalmente visíveis e funcionais.
2. Na tela do CATalog e no Cat Map, a barra inferior flutua como uma cápsula com efeito Liquid Glass translúcido nativo do iOS.
3. No CATalog, o segmented control permite alternar entre os medalhões colecionáveis em grid (`Cats`) e o mural livre de stickers recortados com contorno branco (`Stickers`).

### Implementation for Phase 8

- [X] T037 [P] Expandir design tokens vintage (vintageTeal, shutterOrange, cameraChassis, cameraBezel, badgePalette) em src/constants/colors.ts
- [X] T038 [US1] Reconstruir layout da tela de câmera em formato de chassis físico analógico com visor ao vivo arredondado, fita indicadora de filme e grelhas de sensores em src/components/capture/camera-view.tsx
- [X] T039 [US1] Implementar botão mecânico de disparo laranja proeminente (#F15A24) com anel chanfrado escuro, feedback háptico pesado e tratamento de safe area em src/components/capture/camera-view.tsx
- [X] T040 [US1] Ocultar a bottom tab bar na rota de captura (tabBarStyle: { display: 'none' }) para garantir 100% de visibilidade e desobstrução da câmera em src/app/_layout.tsx
- [X] T041 [P] [US2] Implementar componente de barra flutuante em cápsula GlassTabBar utilizando GlassView de expo-glass-effect com botão central teal elevado em src/components/ui/glass-tab-bar.tsx
- [X] T042 [US2] Conectar o GlassTabBar como custom tab bar nas opções do Tabs em src/app/_layout.tsx
- [X] T043 [P] [US2] Implementar componente RetroBadgeFrame com suporte a anel circular listrado, hexágono listrado e roseta de pétalas onduladas em src/components/ui/retro-badge-frame.tsx
- [X] T044 [US2] Atualizar componente StickerCard para exibir foto emoldurada no medalhão retrô com tipografia vintage encorpada, raça e âncora de localização em src/components/ui/sticker-card.tsx
- [X] T045 [P] [US2] Implementar componente StickerCanvas para a aba de mural livre de stickers com padrão de fundo de pegadas felinas em marca d'água e contorno branco espesso em src/components/catdex/sticker-canvas.tsx
- [X] T046 [P] [US2] Implementar componente StampModal com visual escuro de passaporte de carimbos, selo ilustrado e botão de compartilhamento em src/components/catdex/stamp-modal.tsx
- [X] T047 [US2] Reconstruir tela CATalog com Segmented Control (Cats / Stickers), pílula translúcida de contagem (🐾 12 cats / ✨ 8 stickers) e integração com StampModal em src/app/index.tsx
- [X] T048 [P] [US3] Atualizar marcador CatPin para utilizar as molduras de medalhões retrô, seta apontadora e pílula inferior de nome em src/components/ui/cat-pin.tsx
- [X] T049 [US3] Atualizar CatMap com pílula translúcida superior de contagem, botões de bússola e localização e recuo inferior para o GlassTabBar em src/app/map.tsx
- [X] T050 [P] Implementar testes unitários para o sistema de molduras RetroBadgeFrame e interação do shutter mecânico em src/components/__tests__/retro-ui.test.tsx
- [X] T051 Validar conformidade estrita de tipagem TypeScript e linting com npx tsc --noEmit && npx expo lint
- [X] T052 Executar validação manual interativa da câmera analógica, navegação em Liquid Glass e CATalog segmentado no simulador iOS

---

## Dependencies & Execution Order

### Phase Dependencies
```text
Phase 1: Setup
     ↓
Phase 2: Foundational (Schema, Tipos, DB)
     ↓
Phase 3: US1 (Captura Offline)
     ↓
Phase 4: US2 (Catdex & Flip)
     ↓
Phase 5: US3 (Cat Map & Privacy)
     ↓
Phase 6: US4 (Backend & Sync)
     ↓
Phase 7: Polish & Testes Iniciais
     ↓
Phase 8: UI/UX Overhaul (Vintage Camera, Liquid Glass & Retro CATalog)
```

### Opportunities for Parallel Execution [P]
- **Na Fase 8 (Design Tokens):** `T037` (Tokens vintage) pode rodar imediatamente.
- **Na Fase 8 (Componentes Visuais Independentes):**
  - `T041` (GlassTabBar)
  - `T043` (RetroBadgeFrame)
  - `T045` (StickerCanvas)
  - `T046` (StampModal)
  - `T050` (Testes unitários de UI)
  Todos podem ser desenvolvidos em paralelo sem dependências cruzadas prévias.
- **Na Câmera (US1):** `T038` e `T039` (Chassis analógico e Shutter mecânico) + `T040` (Ocultação de tab bar).
- **No Cat Map (US3):** `T048` (Pins com moldura) e `T049` (Ajustes de layout do mapa).

---

## Implementation Strategy (UI/UX Evolution)

1. **Incremento 1: Fix Crítico da Câmera & Chassis Analógico (T037 - T040):**
   - Resolve o problema do usuário com prioridade máxima: o botão de disparo mecânico laranja passa a ficar perfeitamente visível, com ergonomia tátil e visual de câmera vintage clássica.
2. **Incremento 2: Navegação Nativa em Liquid Glass (T041 - T042):**
   - Implementa a barra de abas flutuante com translucidez real do iOS (`expo-glass-effect`), liberando o visual moderno pedido pelo usuário.
3. **Incremento 3: Medalhões Retrô e CATalog Segmentado (T043 - T047):**
   - Transforma a galeria em uma coleção de medalhões com listras e pétalas e cria o mural livre de stickers recortados.
4. **Incremento 4: Pins Retrô do Mapa e Validação Completa (T048 - T052):**
   - Alinha os marcadores do mapa à identidade de medalhões e valida toda a suíte com testes automatizados e no simulador.
