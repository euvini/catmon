# Feature Specification: 001-catmon-mvp (Catmon Mobile & Backend MVP)

**Feature Branch**: `001-catmon-mvp`  
**Created**: 2026-09-18  
**Status**: Approved / Ready for Implementation  
**Input**: User description: "Atue como arquiteto de software mobile e backend sênior. Elabore o plano de implementação técnica detalhado (spec-plan.md) para o aplicativo Catmon e sua API backend."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Captura Rápida & Registro Offline de Gatos (Priority: P1)
Como usuário explorador urbano, quero tirar uma foto de um gato encontrado na rua ou em qualquer ambiente e salvar seus dados comportamentais imediatamente no meu dispositivo sem depender de sinal de internet, para que eu não perca o registro e tenha latência zero.

**Why this priority**: É o valor central (core loop) do Catmon. Sem captura rápida e offline, a proposta do app deixa de existir, já que gatos são fugazes e a conectividade de rua é instável.

**Independent Test**:
Pode ser testado de forma totalmente autônoma em Modo Avião:
1. Abrir a aba de Câmera;
2. Tirar foto do gato;
3. Preencher apelido, contexto, temperamento e faixa etária;
4. Confirmar o salvamento;
5. Verificar persistência imediata no SQLite via Drizzle e imagem salva em `expo-file-system`.

**Acceptance Scenarios**:
1. **Given** que o usuário está sem conexão à internet e concede permissão de câmera e localização, **When** captura a foto de um gato e preenche os metadados, **Then** a imagem é salva localmente no diretório seguro do app, as coordenadas GPS são registradas e a entidade `Cat` é inserida no SQLite com flag `is_synced = 0`.
2. **Given** que a permissão de GPS foi recusada pelo usuário, **When** o usuário tenta registrar o gato, **Then** o app não quebra, avisa graciosamente e permite salvar com coordenadas manuais ou aproximadas.

---

### User Story 2 - Álbum Colecionável ("Catdex") com Animações Reanimated 4 (Priority: P1)
Como colecionador de avistamentos, quero abrir o Catdex e visualizar todos os gatos salvos como stickers/cards estilizados em um grid interativo, podendo tocar em um sticker para ver uma animação de "flip" e expansão com todos os detalhes do gato.

**Why this priority**: É o elemento chave de gamificação e retenção. Transforma dados frios em colecionáveis afetivos com alto apelo visual.

**Independent Test**:
Pode ser testado com dados locais no SQLite:
1. Abrir aba Catdex;
2. Observar carregamento dos stickers com miniaturas em cache via `expo-image`;
3. Tocar em um card e verificar a animação de flip 3D e abertura do modal de detalhes;
4. Filtrar por temperamento (ex: "dorminhoco") e verificar a reatividade da listagem.

**Acceptance Scenarios**:
1. **Given** que existem 10 gatos registrados localmente, **When** o usuário acessa a Catdex, **Then** os stickers são exibidos em grid com bordas estilizadas e animação suave a 60+ FPS via Reanimated 4.
2. **Given** que o usuário toca em um sticker específico, **When** o toque ocorre, **Then** é acionado feedback háptico e o card executa transição de flip com reveal dos metadados completos (idade estimada, pelagem, contexto, data e observações).

---

### User Story 3 - Cat Map (Mapeamento Geográfico com Pins Customizados) (Priority: P2)
Como usuário, quero visualizar um mapa interativo com marcadores estilizados mostrando exatamente onde encontrei cada gato, com salvaguarda de privacidade em locais residenciais.

**Why this priority**: Completa a experiência de diário de campo urbano, permitindo explorar a geografia dos encontros e relembrar trajetos pela cidade.

**Independent Test**:
Pode ser testado abrindo a aba Cat Map com pontos geográficos previamente cadastrados:
1. Renderizar mapa nativo via `react-native-maps`;
2. Conferir exibição dos pins customizados com a miniatura do gato;
3. Clicar no pin e ver o balão/card resumido do gato;
4. Verificar se gatos marcados como `friend_pet` possuem coordenadas ofuscadas (ruído aleatório de 150m-300m).

**Acceptance Scenarios**:
1. **Given** registros de gatos com coordenadas válidas, **When** o usuário acessa o Cat Map, **Then** marcadores personalizados com a foto do sticker aparecem nas coordenadas correspondentes.
2. **Given** um gato registrado com contexto `friend_pet` (casa de amigo), **When** plotado no mapa, **Then** sua posição sofre jitter determinístico de 150m-300m e exibe badge de "Localização aproximada".

---

### User Story 4 - Sincronização em Background com Backend Node.js + Supabase (Priority: P3)
Como usuário, quero que quando meu celular recuperar o sinal de internet, meus registros locais e fotos sejam sincronizados automaticamente em segundo plano com o Supabase, para backup seguro e consultas geoespaciais avançadas.

**Why this priority**: Garante durabilidade e resiliência dos dados a longo prazo, permitindo backup e futuras funcionalidades de comunidade sem impactar o uso offline imediato.

**Independent Test**:
1. Cadastrar 2 gatos em modo offline (`is_synced = 0`);
2. Restaurar conexão com a internet;
3. Acionar o trigger da fila de sincronização;
4. Verificar upload das imagens para o Supabase Storage Bucket;
5. Verificar inserção dos registros no PostgreSQL/PostGIS e atualização local para `is_synced = 1`.

**Acceptance Scenarios**:
1. **Given** registros pendentes (`is_synced = 0`) e conexão de rede restaurada, **When** o sync worker executa, **Then** as fotos locais são enviadas ao Supabase Storage, as URLs públicas/assinadas são salvas e o registro correspondente no Supabase PostgreSQL é persistido com ponto geométrico PostGIS `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.
2. **Given** uma falha de conexão durante o upload de uma foto, **When** o sync falha, **Then** o registro local permanece intacto como pendente e uma nova tentativa com backoff exponencial é agendada sem travar a interface do usuário.

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: O sistema DEVE capturar fotos pela câmera nativa (`expo-camera`) e permitir seleção alternativa pela biblioteca (`expo-image-picker`).
- **FR-002**: O sistema DEVE capturar a geolocalização do dispositivo (`expo-location`) com alta precisão no instante do clique fotográfico.
- **FR-003**: O sistema DEVE armazenar as fotos locais no diretório protegido do aplicativo (`FileSystem.documentDirectory`) e salvar metadados no `expo-sqlite` via Drizzle ORM.
- **FR-004**: O sistema DEVE disponibilizar os seguintes atributos para cada gato: `id` (UUIDv4), `name`, `breed`, `context` (`stray`, `friend_pet`, `community`, `cat_cafe`, `other`), `color`, `temperament` (`friendly`, `shy`, `playful`, `sleeper`), `approx_age` (`kitten`, `young`, `adult`, `senior`), `latitude`, `longitude`, `local_photo_uri`, `remote_photo_url`, `created_at`, `updated_at`, `is_synced`.
- **FR-005**: O sistema DEVE ofuscar a coordenada de localização com ruído radial entre 150m e 300m quando o contexto for `friend_pet`.
- **FR-006**: A galeria Catdex DEVE renderizar os gatos em formato de sticker com animações a 60+ FPS em Reanimated 4 e suporte a filtros por temperamento e contexto.
- **FR-007**: O Cat Map DEVE renderizar marcadores com miniatura e abrir o card resumo ao toque.
- **FR-008**: A API backend em Node.js DEVE fornecer rotas de autenticação, upload de imagens (Supabase Storage) e sincronização bidirecional incremental.
- **FR-009**: O banco de dados PostgreSQL/Supabase DEVE estar configurado com a extensão PostGIS e fornecer consultas espaciais de proximidade via função RPC `get_cats_within_radius(lat, lng, radius_meters)`.
- **FR-010**: O worker de sincronização móvel DEVE operar de forma assíncrona, não-bloqueante e idempotente através de UUIDs originados no cliente.
