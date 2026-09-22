# Quickstart & Validation Guide: 001-catmon-mvp

Guia de validação ponta a ponta dos fluxos do MVP do **Catmon**.

---

## 1. Pré-requisitos de Ambiente

- Node.js 20+ e Yarn instalado.
- Dispositivo físico ou Simulador iOS / Emulador Android configurado.
- Dependências locais do app instaladas (`yarn install`).
- Backend Node.js / Supabase CLI configurado (para testes da Fase 3).

---

## 2. Cenário 1: Captura Rápida & Registro Offline (Mobile)

### Objetivo
Provar que o registro é instantâneo e não depende de internet.

### Passos:
1. Inicie o app no simulador/dispositivo:
   ```bash
   yarn ios
   # ou yarn android
   ```
2. No simulador ou celular, ative o **Modo Avião** (desconecte Wi-Fi e Dados Móveis).
3. Abra a aba **Câmera** tocando no botão circular central teal da barra flutuante:
   - Conceda permissão quando solicitado.
   - **Verifique a visibilidade do botão de disparo**: O grande botão de shutter mecânico laranja (`#F15A24`) com anel escuro chanfrado está perfeitamente visível e centralizado no console vintage inferior, flanqueado por grelhas de sensores e pela cápsula superior de filme analógico.
   - A barra de abas inferior fica oculta automaticamente durante a captura, sem bloquear o botão de disparo.
   - Pressione o botão de shutter mecânico: sinta o feedback háptico (`impactAsync`) e veja a captura imediata da imagem.
4. Na tela de formulário pós-captura:
   - Digite o nome: "Mingau".
   - Selecione Contexto: "Gato de Rua" (`stray`).
   - Selecione Temperamento: "Dócil" (`friendly`).
   - Verifique que as coordenadas GPS foram preenchidas automaticamente.
5. Pressione **"Colecionar Sticker"**:
   - Observe a animação do sticker sendo impresso com borda branca e feedback sonoro/háptico.
6. **Validação Técnica:**
   - Inspecione a tabela `cats` no SQLite local do app:
     - Registro salvo com `id` (UUID), `name = 'Mingau'`, `is_synced = 0`.
   - O arquivo de foto existe no sandbox local (`FileSystem.documentDirectory`).

---

## 3. Cenário 2: Visualização no CATalog e Barra Liquid Glass (Mobile)

### Objetivo
Validar o efeito Liquid Glass nativo do iOS, a alternância de abas segmentadas (`Cats` | `Stickers`) e as molduras retrô.

### Passos:
1. Toque na aba **Collection** na barra flutuante em Liquid Glass (`expo-glass-effect`).
2. Observe a barra inferior flutuante suspensa com cantos arredondados, difração de luz real e o botão central teal.
3. No topo do CATalog, observe o segmented control (`Cats` | `Stickers`) e a pílula de contagem (`🐾 X cats`).
4. Com a aba `Cats` ativa:
   - O gato "Mingau" é exibido dentro de uma moldura retrô de medalhão (anel circular listrado, hexágono ou pétalas onduladas).
   - Abaixo da foto, o nome aparece em destaque acompanhado da raça e do endereço/rua com pin.
5. Alterne para a aba `Stickers`:
   - O mural de figurinhas exibe os gatos como adesivos recortados com borda branca espessa sobre um fundo com textura d'água de patinhas felinas.
6. Toque em um gato para abrir o modal de passaporte/carimbo colecionável (estilo Passport stamp) com opção de compartilhamento.

---

## 4. Cenário 3: Cat Map com Pins Retrô e Ofuscação de Privacidade (Mobile)

### Objetivo
Validar a plotagem geoespacial e a regra ética de geofencing.

### Passos:
1. Cadastre um novo gato com o contexto "Pet de Amigo" (`friend_pet`).
2. Abra a aba **Cat Map**.
3. Verifique que dois pins aparecem no mapa:
   - O primeiro (`stray`) com a posição exata.
   - O segundo (`friend_pet`) exibindo o selo de "Localização aproximada" e coordenada deslocada aleatoriamente entre 150m e 300m da posição real.

---

## 5. Cenário 4: Sincronização em Background (Mobile + Backend)

### Objetivo
Validar o pipeline de upload e sync com Supabase ao restaurar a conexão.

### Passos:
1. No backend Node.js:
   ```bash
   cd backend && yarn dev
   ```
2. No simulador/celular, **desative o Modo Avião** (restaure a conexão de rede).
3. O `NetInfo` detectará a conexão e acionará o `SyncWorker`:
   - Foto é enviada ao bucket `cat-photos` do Supabase Storage.
   - Payload é enviado para `POST /api/v1/sync/push`.
4. No banco Supabase / PostgreSQL, execute:
   ```sql
   SELECT id, name, remote_photo_url, ST_AsText(location_geom) FROM public.cats;
   ```
   - O gato "Mingau" deve aparecer com a coluna `location_geom` calculada e `remote_photo_url` preenchido.
5. No SQLite do app, o registro passa para `is_synced = 1`.
