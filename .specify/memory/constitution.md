<!--
Sync Impact Report:
- Version change: 0.0.0 (Template) → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → I. Offline-First & Instant Capture
  - [PRINCIPLE_2_NAME] → II. Privacy by Default & Geofencing Ético
  - [PRINCIPLE_3_NAME] → III. Gamificação Tátil & Visual Delight (Catdex Experience)
  - [PRINCIPLE_4_NAME] → IV. Resiliência de Hardware & Permissões Progressivas
  - [PRINCIPLE_5_NAME] → V. Tipagem Estrita, Imutabilidade e Arquitetura Limpa
- Added sections:
  - Architecture & Tech Stack Standards
  - Data Model & Domain Entities
  - Security, Privacy & Device Permissions
  - Code Quality, Modularity & Testing Conventions
  - Roadmap Boundaries & Explicit Non-Goals
- Removed sections:
  - Placeholder template tokens ([PROJECT_NAME], [SECTION_2_NAME], etc.)
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Validação alinhada com gates móveis e offline-first)
  - ✅ .specify/templates/spec-template.md (Validação alinhada com priorização de User Stories do MVP)
  - ✅ .specify/templates/tasks-template.md (Estrutura de tarefas compatível com camadas React Native)
- Follow-up TODOs: None (Todos os campos concretamente definidos para o MVP)
-->

# Catmon Constitution

## Core Principles & Vision

### Visão do Produto
O **Catmon** é um aplicativo mobile focado em registrar, catalogar e mapear encontros com gatos do mundo real (rua, casas de amigos, parques, cafés comunitários). O produto transforma cada avistamento fortuito em um colecionável visual no formato de sticker/card ("Catdex"), enriquecido com geolocalização e metadados comportamentais. O objetivo é proporcionar uma experiência gamificada, acolhedora e tátil, incentivando a observação urbana e o carinho pelos animais.

---

### I. Offline-First & Instant Capture (NON-NEGOTIABLE)
- **Regra:** O fluxo de captura e registro de um gato DEVE operar com latência zero e ser 100% funcional sem conectividade de rede ativa.
- **Implementação:** Toda escrita de dados e persistência de mídia DEVE ocorrer primariamente no armazenamento local do dispositivo (`expo-file-system` e banco relacional/documental local). Nenhuma tela ou ação de registro do usuário PODE ser bloqueada por requisições de rede ou sincronização remota. Sincronizações com servidores (quando existirem) DEVEM ser tratadas como efeitos secundários em fila de background assíncrona.
- **Rationale:** Gatos são animais rápidos e imprevisíveis. Encontros na rua, garagens ou praças frequentemente ocorrem em áreas com sinal de celular fraco ou inexistente. A perda de uma captura por espera de rede destrói a confiança no produto.

### II. Privacy by Default & Geofencing Ético (NON-NEGOTIABLE)
- **Regra:** Coordenadas exatas de residências privadas NUNCA DEVEM ser expostas publicamente ou armazenadas sem salvaguardas de privacidade.
- **Implementação:** Quando um registro tiver como contexto `friend_pet` (casa de amigo/residência privada) ou o usuário indicar restrição de privacidade, o sistema DEVE aplicar ofuscação geoespacial automática, gerando um raio de dispersão aleatória (150m a 300m) em relação ao ponto real antes de renderizar pins no mapa público ou exportar dados. Metadados EXIF confidenciais em fotos DEVEM ser higienizados no ato da importação.
- **Rationale:** A segurança de residências de terceiros e a integridade física dos próprios gatos (proteção contra furtos de raça ou maus-tratos) exigem que a localização exata de lares nunca seja vazada.

### III. Gamificação Tátil & Visual Delight (Catdex Experience)
- **Regra:** Toda captura concluída DEVE fornecer recompensa sensorial imediata ao usuário, promovendo a sensação tangível de colecionar um adesivo físico.
- **Implementação:** A revelação do card/sticker DEVE empregar animações fluidas a 60/120 FPS via `react-native-reanimated`, acompanhada de feedback háptico (`expo-haptics`). A galeria ("Catdex") DEVE adotar um design system visual de sticker estilizado, com sombras, bordas físicas simuladas, tags de temperamento coloridas e transições suaves de abertura de card.
- **Rationale:** O valor de longo prazo e a retenção do Catmon residem no prazer estético e emocional de colecionar e revisitar a galeria de felinos encontrados.

### IV. Resiliência de Hardware & Permissões Progressivas
- **Regra:** O aplicativo NUNCA DEVE travar, exibir telas em branco ou interromper fluxos caso permissões de hardware (Câmera, Galeria de Fotos, Localização GPS) sejam negadas ou limitadas.
- **Implementação:** O sistema DEVE adotar o padrão de *Progressive Permission Onboarding*, apresentando telas ou cards explicativos com o valor da permissão antes de solicitar os diálogos nativos do sistema operacional. Se o GPS estiver desabilitado ou negado, o app DEVE oferecer imediatamente fallback de entrada manual ou ajuste por mapa; se a câmera for negada, a seleção pela galeria de imagens DEVE permanecer acessível.
- **Rationale:** O usuário rejeita aplicativos que demandam permissões agressivas sem contexto imediato. A experiência deve degradar graciosamente sem bloquear o uso central.

### V. Tipagem Estrita, Imutabilidade e Arquitetura Limpa
- **Regra:** Todo código-fonte DEVE aderir a TypeScript estrito (`strict: true`) e modelagem de domínio imutável.
- **Implementação:** É estritamente PROIBIDO o uso de `any` ou type assertions não seguras. Todas as entradas e saídas de dados (I/O de banco local, payloads e formulários) DEVEM ser validadas em runtime por meio de schemas estruturados (ex: Zod). A lógica de negócio e os repositórios de dados DEVEM ser totalmente desacoplados dos componentes de apresentação do React Native.
- **Rationale:** A manutenibilidade de longo prazo no ecossistema React Native/Expo requer barreiras estritas contra erros de tipagem e regressões de estado.

---

## Architecture & Tech Stack Standards

### 1. Plataforma & Base Runtime
- **Framework Base:** Expo SDK 57+ com `expo-router` (File-based Routing em `src/app/`).
- **Runtime:** React Native 0.86+ com React 19 (suporte nativo ao New Architecture e React Compiler habilitado).
- **Linguagem:** TypeScript 6.0+ em modo `strict: true`.
- **Estilização:** Vanilla StyleSheet modularizado ou NativeWind/Tailwind com design tokens centralizados em `src/constants/` para temas Claro e Escuro.

### 2. Gerenciamento de Estado & Camada de Persistência
- **Estado de Aplicação (Client State):** Zustand para estados globais reativos (filtros do mapa, estado de captura ativa, preferências de UI).
- **Armazenamento de Dados Locais:** Expo SQLite com tipagem estrita e migrações versionadas, otimizado para consultas indexadas por data, temperamento e coordenadas geoespaciais.
- **Gestão de Ativos de Mídia:** Fotos capturadas DEVEM ser movidas imediatamente do cache temporário para o diretório de documentos do app (`expo-file-system.documentDirectory`). O app DEVE gerar automaticamente uma miniatura otimizada (thumbnail) com tamanho reduzido para visualização rápida no grid da Catdex e nos pins do mapa, preservando a imagem em alta resolução apenas para a visualização detalhada do card.

### 3. Integração com Hardware & Sensores
- **Captura Visual:** `expo-camera` para captura direta e `expo-image-picker` para upload da biblioteca, acompanhados de processamento de imagem preliminar (redimensionamento e compressão equilibrada).
- **Geolocalização:** `expo-location` configurado com alta precisão (`Accuracy.High`) e timeout determinístico no momento da captura, com conversão reversa para nomes de bairros/cidades em background quando houver conectividade.
- **Visualização Cartográfica:** Módulos de mapa nativo (`react-native-maps`) com suporte a marcadores customizados, clusterização de pins para alta densidade e alternância entre camadas visualmente legíveis.

---

## Data Model & Domain Entities

### Entidade Central: `CatCapture`
Representa um registro único de encontro com um gato.

```typescript
export type UUID = string;
export type ISO8601Timestamp = string;

export type CatContext = 
  | 'stray'        // Gato de rua / sem tutor evidente
  | 'friend_pet'   // Pet de amigo / residência privada
  | 'community'    // Gato comunitário (bairro / praça / comércio)
  | 'cat_cafe'     // Gato de cafeteria ou estabelecimento comercial
  | 'other';       // Outro contexto

export type CoatPattern = 
  | 'tabby'          // Rajado (listrado)
  | 'solid_black'    // Preto sólido
  | 'solid_white'    // Branco sólido
  | 'orange_caramel' // Laranja / Caramelo
  | 'tuxedo'         // Frajola (preto e branco clássico)
  | 'calico_tortie'  // Tricolor / Escaminha
  | 'siamese_point'  // Padrão siamês / extremidades escuras
  | 'bicolor'        // Bicolor não frajola
  | 'other';         // Outro padrão

export type CatTemperament = 
  | 'friendly'   // Dócil / receptivo ao carinho
  | 'shy_aloof'  // Arredio / desconfiado / observador
  | 'curious'    // Curioso / explorador
  | 'sleepy'     // Dorminhoco / preguiçoso
  | 'vocal'      // Tagarela / miador
  | 'playful';   // Brincalhão / elétrico

export type EstimatedAge = 
  | 'kitten'    // Filhote (< 6 meses)
  | 'young'     // Jovem (6 meses a 2 anos)
  | 'adult'     // Adulto (2 a 8 anos)
  | 'senior'    // Idoso (8+ anos)
  | 'unknown';  // Não identificada

export type LocationPrivacyMode = 
  | 'exact'     // Coordenadas exatas permitidas (ex: via pública)
  | 'blurred'   // Ofuscação de raio aplicada (150m-300m)
  | 'manual';   // Inserida ou corrigida manualmente pelo usuário

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  isObfuscated: boolean;
  roughNeighborhood?: string;
  roughCity?: string;
}

export interface CatCapture {
  id: UUID;
  name: string;                         // Nome atribuído ou apelido temporário
  photoUri: string;                     // Caminho local seguro no sandbox do app
  thumbnailUri: string;                 // Miniatura leve para grids e marcadores
  context: CatContext;
  coatPattern: CoatPattern;
  predominantColor: string;             // Código hex ou token de cor dominante
  temperament: CatTemperament[];        // Lista de comportamentos observados
  estimatedAge: EstimatedAge;
  location: GeoCoordinates;
  locationPrivacy: LocationPrivacyMode;
  notes?: string;                       // Observações adicionais do encontro
  stickerBadgeId: string;               // Identificador do estilo visual de adesivo gerado
  capturedAt: ISO8601Timestamp;         // Data e hora do momento do avistamento
  createdAt: ISO8601Timestamp;          // Data de gravação no banco local
  updatedAt: ISO8601Timestamp;
  syncStatus: 'local_only' | 'pending' | 'synced';
}
```

---

## Security, Privacy & Device Permissions

### 1. Higienização e Tratamento de Imagens
- Fotos importadas da galeria ou capturadas pela câmera NÃO DEVEM ter seus metadados brutos (como números de série de câmera, dados EXIF sensíveis de localização de domicílio) armazenados sem consentimento.
- A persistência de mídia DEVE residir exclusivamente no sandbox do app (`documentDirectory`), impedindo que outros aplicativos não autorizados acessem os registros locais do Catmon sem permissão.

### 2. Protocolo de Ofuscação Geográfica
- Sempre que o contexto for `friend_pet` ou o usuário selecionar privacidade protegida, o sistema DEVE recalcular o ponto de exibição através de uma translação geográfica pseudo-aleatória dentro de um anel de tolerância ($150m \le r \le 300m$).
- O marcador no mapa e a tela pública de detalhes DEVE explicitar o selo: "Localização aproximada para proteção de privacidade".

### 3. Concessão de Permissões de Hardware
- **Câmera:** Utilizada unicamente durante a sessão de foto do gato.
- **Galeria:** Apenas leitura de fotos selecionadas ativamente pelo usuário (`UIImagePickerController` / Photo Picker moderno sem acesso irrestrito à biblioteca inteira quando disponível no SO).
- **Geolocalização:** Solicitada sob a modalidade "Durante o Uso do App" (*While in Use*). Nenhuma coleta de localização em background (segundo plano) é permitida no MVP.

---

## Code Quality, Modularity & Testing Conventions

### 1. Organização do Código & Modularidade
O repositório DEVE seguir arquitetura modular orientada a domínios/funcionalidades:
```text
src/
├── app/                  # Rotas e layouts do Expo Router
│   ├── (tabs)/           # Abas principais (Catdex, Cat Map, Captura, Perfil/Config)
│   ├── cat/              # Detalhe do card do gato ([id].tsx)
│   └── capture/          # Fluxo guiado de captura e registro
├── features/             # Módulos verticais de negócio
│   ├── capture/          # Componentes de câmera, formulário e metadados
│   ├── catdex/           # Grid do álbum, filtros e sticker renderers
│   └── map/              # Visualização de mapa, clustering e pins customizados
├── components/ui/        # Design System compartilhado (Cards, Badges, Botões Hápticos)
├── database/             # SQLite migrations, models e DAOs
├── services/             # Geolocalização, sistema de arquivos e compressão de mídia
├── types/                # Definições de domínio e tipagens globais
└── constants/            # Cores, tokens de espaçamento e temas
```

### 2. Disciplina de Commits & Versionamento
- Commits DEVEM seguir rigorosamente o padrão **Conventional Commits**:
  - `feat(catdex): add filter by temperament and coat pattern`
  - `fix(capture): prevent memory spike during high-res image compression`
  - `perf(map): implement cluster rendering for cat pins`
  - `test(privacy): add unit tests for coordinate blurring algorithm`
- Ramificações de funcionalidade DEVEM seguir o padrão: `###-feature-name`.

### 3. Padrões de Testes & Cobertura
- **Testes Unitários:** Mandatórios para o algoritmo de ofuscação geoespacial, cálculo de filtros da Catdex, validadores Zod e conversores de data/metadados.
- **Testes de Integração de Repositório:** Validação de queries SQLite (inserção, deleção, busca filtrada de gatos).
- **Testes de Componentes:** Testar isoladamente o comportamento dos cards colecionáveis, estados de carregamento e telas de permissão negada.
- **CI Lint & Type Gates:** Nenhum código PODE ser mesclado à branch principal com alertas de TypeScript (`tsc --noEmit`) ou violações de lint (`npx expo lint`).

---

## Roadmap Boundaries & Explicit Non-Goals (MVP Guardrails)

Para garantir o lançamento do MVP no prazo, com qualidade de engenharia impecável e foco no núcleo da proposta de valor, os seguintes itens são formalmente declarados **FORA DO ESCOPO (Non-Goals)** deste ciclo:

1. **Reconhecimento por IA / Visão Computacional:** Nenhuma identificação automatizada de raça ou pelagem por redes neurais no dispositivo será desenvolvida no MVP. Todos os metadados são atribuídos pelo usuário.
2. **Autenticação em Nuvem & Backend Centralizado:** O MVP opera exclusivamente em arquitetura local (100% offline). Não haverá sistema de login com e-mail/senha ou sincronização em servidores nesta fase.
3. **Rede Social & Recursos Multiusuário:** Sem feed social compartilhado, sem botão de "curtir", sem comentários e sem catálogo público global de gatos.
4. **Exportação Multiplataforma para a Web:** O app é focado nas plataformas móveis nativas iOS e Android via Expo; a saída web estática é apenas para propósitos auxiliares.
5. **Suporte a Outros Animais:** O aplicativo é exclusivo para felinos domésticos e ferais. Não haverá categorização para cachorros, pássaros ou outros pets.

---

## Governance

### Autoridade da Constituição
Esta constituição estabelece os princípios soberanos de arquitetura, qualidade e privacidade do projeto **Catmon**. Ela prevalece sobre qualquer especificação técnica individual (`spec.md`), plano de implementação (`plan.md`) ou lista de tarefas (`tasks.md`).

### Processo de Emenda
1. Qualquer proposta de alteração estrutural nos princípios ou padrões tecnológicos DEVE ser formalizada por meio de um Pull Request justificando a necessidade e o impacto nos módulos existentes.
2. O versionamento da constituição DEVE respeitar o Semantic Versioning (SemVer):
   - **MAJOR:** Mudança incompatível em princípios soberanos, governança ou escopo de privacidade.
   - **MINOR:** Adição de novo princípio, evolução de tecnologia base ou expansão de padrões arquiteturais.
   - **PATCH:** Correções de nomenclatura, ajustes ortográficos e esclarecimentos textuais.
3. Todas as alterações DEVEM registrar no topo o respectivo **Sync Impact Report** e atualizar as referências nos templates de especificação do SpecKit.

---

**Version**: 1.0.0 | **Ratified**: 2026-09-18 | **Last Amended**: 2026-09-18
