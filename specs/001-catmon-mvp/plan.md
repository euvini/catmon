# Implementation Plan: Catmon Mobile & Backend MVP

**Branch**: `001-catmon-mvp` | **Date**: 2026-09-18 | **Spec**: [/specs/001-catmon-mvp/spec.md](file:///Users/viniciussantiago/Projects/catmon/specs/001-catmon-mvp/spec.md)

**Input**: Feature specification from `/specs/001-catmon-mvp/spec.md`

---

## Summary

O **Catmon** é um aplicativo mobile focado em registrar, catalogar e mapear encontros com gatos do mundo real, transformando cada avistamento em um sticker/card colecionável (Catdex) enriquecido com geolocalização e metadados comportamentais.

Este plano define a arquitetura técnica completa para o aplicativo mobile (React Native + Expo SDK 57) e seu backend de suporte (Node.js + Fastify + Supabase com PostGIS). A solução adota a filosofia **Offline-First**, utilizando `expo-sqlite` gerenciado via **Drizzle ORM** e armazenamento seguro no dispositivo (`expo-file-system`) para latência zero na captura, aliado a animações fluidas a 60+ FPS com **Reanimated 4** e uma esteira de sincronização assíncrona com Supabase Storage e PostgreSQL/PostGIS.

---

## Technical Context

**Language/Version**: TypeScript 6.0+ (Strict mode), React 19, React Native 0.86+, Node.js 20+  
**Primary Dependencies**:
- Mobile: `expo` (~57.0), `expo-router` (~57.0), `drizzle-orm` + `expo-sqlite`, `react-native-reanimated` (4.5+), `react-native-gesture-handler` (~2.32), `expo-camera`, `expo-location`, `expo-image`, `expo-file-system`, `react-native-maps`, `expo-haptics`, `zustand`
- Backend: Node.js, Fastify, `@supabase/supabase-js`, PostGIS, Zod  
**Storage**:
- Local: SQLite via `expo-sqlite` + Drizzle ORM; imagens em `FileSystem.documentDirectory`
- Remoto: Supabase PostgreSQL com extensão `postgis`; imagens no Supabase Storage Bucket `cat-photos`  
**Testing**: Jest + `@testing-library/react-native` para testes de componentes e lógica de domínio; testes unitários em queries Drizzle e ofuscação geoespacial  
**Target Platform**: iOS 16+ e Android 11+  
**Project Type**: Mobile App (Universal Expo) + Backend REST/Sync Service  
**Performance Goals**: Latência de salvamento local < 50ms; renderização da Catdex a 60/120 FPS sem jank; tempo de boot do app < 1.5s  
**Constraints**: 100% funcional offline para captura e navegação no Catdex; ofuscação espacial obrigatória de 150m-300m para `friend_pet`; consumo de memória otimizado por thumbnails  
**Scale/Scope**: MVP focado em 4 fases completas: Captura, Catdex, Cat Map e Sincronização em Background  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Verificação no Design Técnico | Status |
| :--- | :--- | :---: |
| **I. Offline-First & Instant Capture** | Salvamento imediato em `expo-sqlite` via Drizzle e fotos em disco local. Nenhuma operação de rede bloqueia o usuário. | ✅ PASS |
| **II. Privacy by Default & Geofencing** | Aplicação de jitter determinístico de 150m-300m no cálculo de coordenadas para `friend_pet` antes de exibição no mapa ou envio remoto. Higienização de EXIF. | ✅ PASS |
| **III. Gamificação Tátil & Visual Delight** | Reanimated 4 para mecânica de sticker reveal e flip 3D do card. `expo-haptics` em microinterações táteis. | ✅ PASS |
| **IV. Resiliência de Hardware & Permissões** | Fallback para galeria se câmera for negada; fallback para coordenadas manuais se GPS for negado. Fluxo explicativo pré-permissão. | ✅ PASS |
| **V. Tipagem Estrita & Arquitetura Limpa** | TypeScript strict sem `any`, validação Zod nos limites de I/O, schemas Drizzle unificados e desacoplamento em repositórios. | ✅ PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-catmon-mvp/
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de arquitetura e tecnologia (Fase 0)
├── data-model.md        # Schemas Drizzle e Supabase/PostGIS (Fase 1)
├── quickstart.md        # Roteiro de validação ponta a ponta (Fase 1)
├── contracts/
│   └── sync-api.md      # Contratos de API e DTOs de sincronização
└── tasks.md             # Lista de tarefas executáveis (Fase 2)
```

### Source Code Architecture (Mobile + Backend)

```text
catmon/
├── src/                          # Aplicação Mobile (React Native / Expo SDK 57)
│   ├── app/                      # Rotas com Expo Router (File-based)
│   │   ├── (tabs)/
│   │   │   ├── index.tsx         # CATalog (Segmented: Cats Grid / Stickers Canvas)
│   │   │   ├── capture.tsx       # Captura Vintage (Chassis Analógico + Shutter Mecânico)
│   │   │   └── map.tsx           # Cat Map (Pins Retrô + Pílulas Glass)
│   │   ├── cat/
│   │   │   └── [id].tsx          # Detalhes Passport Stamp
│   │   ├── _layout.tsx           # Root Tab com Floating Liquid Glass Tab Bar
│   │   └── modal-form.tsx        # Formulário de metadados pós-foto
│   ├── components/
│   │   ├── animated/
│   │   │   ├── sticker-reveal.tsx# Efeito de impressão/descolamento de adesivo
│   │   │   └── flip-card.tsx     # Card com rotação 3D frente/verso
│   │   ├── ui/
│   │   │   ├── glass-tab-bar.tsx # Barra flutuante em Liquid Glass (expo-glass-effect)
│   │   │   ├── retro-badge-frame.tsx # Molduras colecionáveis (listras, hexágono, pétalas)
│   │   │   ├── sticker-card.tsx  # Card do medalhão retrô com metadados
│   │   │   ├── cat-pin.tsx       # Marcador customizado retrô para o mapa
│   │   │   └── badge.tsx         # Tags de temperamento e contexto
│   │   ├── catdex/
│   │   │   ├── sticker-canvas.tsx# Mural livre de stickers com marca d'água
│   │   │   ├── stamp-modal.tsx   # Modal estilo passaporte de carimbos
│   │   │   └── filter-bar.tsx    # Filtro por temperamento
│   │   └── capture/
│   │       └── camera-view.tsx   # Chassis de câmera vintage mecânica (laranja + grelhas)
│   ├── database/
│   │   ├── schema.ts             # Schemas Drizzle SQLite
│   │   ├── client.ts             # Instância Drizzle/Expo-SQLite
│   │   └── migrations/           # Migrações geradas pelo drizzle-kit
│   ├── services/
│   │   ├── location.ts           # Wrapper expo-location + ofuscação espacial
│   │   ├── media.ts              # Compressão e salvamento seguro em FileSystem
│   │   ├── sync-worker.ts        # Fila e engine de sincronização em background
│   │   └── permissions.ts        # Gerenciador de permissões e fallbacks
│   ├── stores/
│   │   └── cat-store.ts          # Zustand store para filtros e estado local
│   ├── types/
│   │   └── domain.ts             # Enums e tipos centrais compartilhados
│   └── constants/
│       ├── colors.ts             # Paleta vintage (Teal, Laranja Câmera, Marfim, Pastéis)
│       └── spacing.ts
│
├── backend/                      # API Backend (Node.js + Fastify)
│   ├── src/
│   │   ├── server.ts             # Inicialização do Fastify
│   │   ├── plugins/
│   │   │   ├── supabase.ts       # Cliente Supabase injetado
│   │   │   └── auth.ts           # Validador JWT
│   │   ├── routes/
│   │   │   ├── sync.ts           # Endpoints /sync/push e /sync/pull
│   │   │   ├── media.ts          # Endpoint de upload /media/upload
│   │   │   └── cats.ts           # Busca espacial /cats/nearby
│   │   └── schemas/
│   │       └── sync-dto.ts       # Validações Zod/TypeBox
│   ├── package.json
│   └── tsconfig.json
│
└── supabase/                     # Configurações do Supabase
    ├── migrations/
    │   └── 20260918000001_create_cats_and_postgis.sql
    └── config.toml
```

---

## Execution Phases

### Fase 1: Setup Core Mobile, Drizzle ORM & Captura Básica
- **Configuração de Banco Local:**
  - Instalação e setup de `expo-sqlite`, `drizzle-orm` e `drizzle-kit`.
  - Implementação do schema `catsTable` em `src/database/schema.ts`.
  - Setup do cliente SQLite em `src/database/client.ts` com criação automática da tabela.
- **Hardware & Permissões de Captura:**
  - Integração de `expo-camera` para captura de fotos em alta velocidade.
  - Integração de `expo-location` para captura pontual de latitude/longitude.
  - Implementação do serviço `media.ts` para persistir fotos em `FileSystem.documentDirectory` e gerar thumbnails leves.
- **Formulário de Metadados:**
  - Tela de formulário pós-foto para nome, contexto (`stray`, `friend_pet`, etc.), temperamento e idade estimada.
  - Inserção local imediata no SQLite com `is_synced = 0`.

### Fase 2: Redesign Visual Vintage & Liquid Glass Experience
- **Correção da Câmera & Chassis Analógico (Imagem 1):**
  - Ocultar a bottom tab bar na rota `capture` (`tabBarStyle: { display: 'none' }`).
  - Implementar corpo de câmera mecânica texturizada (`#ECEBE4`) com visor live cortado e cantos suaves.
  - Adicionar o grande botão mecânico de disparo laranja (`#F15A24`) chanfrado com anel escuro e haptics intenso.
  - Construir grades perfuradas de sensores (matriz de pontos), cápsula superior de filme com linhas indicadoras e seletor knurled inferior.
  - Ajuste ergonômico com `useSafeAreaInsets`.
- **Navegação Flutuante em Liquid Glass (Imagens 3, 4 e 5):**
  - Componente `GlassTabBar` utilizando `GlassView` nativo do `expo-glass-effect` com propriedades táteis e difração luminosa.
  - Pílula flutuante com abas `Map` e `Collection` e botão circular central teal (`#135461`) com ícone de Câmera/`+`.
- **CATalog Segmentado e Medalhões Retrô (Imagens 4 e 5):**
  - Segmented control no topo (`Cats` | `Stickers`) com pílula de contagem (`🐾 12 cats` / `✨ 8 stickers`).
  - Modo `Cats`: Grid 3 colunas com molduras vintage (`RetroBadgeFrame`: anel listrado, hexágono e pétalas) e legendas de nome, raça e endereço.
  - Modo `Stickers`: Álbum em canvas livre com padrão sutil de pegadas d'água e stickers recortados com contorno branco espesso.
- **Cat Map com Pins Retrô (Imagem 3):**
  - Marcadores customizados utilizando a identidade de medalhão retrô com seta indicadora e pílula de nome inferior.
  - Header translúcido com contador e botões de bússola e centralização.
- **Passport Stamp Modal (Imagem 2):**
  - Modal estilo folha de passaporte colecionável com selo de carimbo felino, contexto histórico do encontro e botão "Share".

### Fase 3: Backend Node.js, Supabase & Engine de Sincronização
- **Setup Supabase & PostGIS:**
  - Configuração do projeto Supabase local/remoto.
  - Aplicação da migração com extensão `postgis`, tabela `cats`, índices espaciais GIST e RPC `get_cats_within_radius`.
  - Configuração do bucket `cat-photos` no Supabase Storage com políticas de acesso.
- **Backend Fastify:**
  - Setup do servidor Node.js + TypeScript com Fastify.
  - Rotas de upload de imagem para Supabase Storage e rotas `/sync/push` e `/sync/pull`.
  - Endpoint `/cats/nearby` utilizando a função espacial do PostGIS.
- **Mobile Sync Worker:**
  - Listener com `@react-native-community/netinfo` para detecção de restabelecimento de internet.
  - Fila de sincronização: upload sequencial de fotos pendentes, envio de lote com IDs preservados e marcação local de `is_synced = 1`.

### Fase 4: Polimento Visual, Tratamento de Permissões & Testes
- **Onboarding de Permissões:**
  - Telas explicativas pré-permissão para Câmera e Localização.
  - Testes de resiliência: validação de salvamento e usabilidade mesmo com GPS desativado (fallback manual).
- **Testes Automatizados:**
  - Testes unitários para o cálculo de ofuscação de privacidade.
  - Testes de integração para operações CRUD no SQLite/Drizzle.
  - Testes de componentes para `StickerCard`, `RetroBadgeFrame` e `CameraCaptureView`.
- **Qualidade de Código & Linting:**
  - Validação completa com `tsc --noEmit` e `npx expo lint`.

---

## Verification Plan

### Automated Tests
- Executar suíte de testes unitários:
  ```bash
  yarn test
  ```
- Validar conformidade de tipos TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Validar linting do Expo:
  ```bash
  npx expo lint
  ```

### Manual Verification
- **Teste Offline Total:** Colocar o dispositivo em Modo Avião, capturar foto, salvar metadados e navegar na Catdex. Garantir que tudo persiste localmente sem erros de rede.
- **Validação de Privacidade:** Criar um gato em `friend_pet` e verificar visualmente no Cat Map que o marcador não expõe a coordenada real, exibindo a etiqueta "Localização aproximada".
- **Validação de Sincronização:** Restaurar conexão de rede, acionar sync e confirmar presença da imagem no bucket do Supabase Storage e registro geométrico no PostGIS via SQL query.
