# API Contracts & Endpoints: Catmon Backend

Base URL: `https://api.catmon.app/v1` (ou `http://localhost:3333/v1` em desenvolvimento)

---

## 1. `POST /sync/push`
Envia um lote de registros salvos localmente no dispositivo para sincronização na nuvem.

### Request Headers
```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "cats": [
    {
      "id": "7b85bbce-862d-45db-9ff3-c3500a8ca465",
      "name": "Mingau",
      "breed": "Siamês",
      "context": "stray",
      "color": "#F5CBA7",
      "temperament": "friendly",
      "approx_age": "young",
      "latitude": -23.55052,
      "longitude": -46.633308,
      "is_obfuscated": false,
      "remote_photo_url": "https://xyz.supabase.co/storage/v1/object/public/cat-photos/7b85bbce-862d-45db-9ff3-c3500a8ca465.jpg",
      "notes": "Avistado dormindo perto do banco da praça",
      "created_at": "2026-09-18T17:30:00Z",
      "updated_at": "2026-09-18T17:30:00Z"
    }
  ]
}
```

### Response `200 OK`
```json
{
  "success": true,
  "synced_ids": [
    "7b85bbce-862d-45db-9ff3-c3500a8ca465"
  ],
  "server_timestamp": "2026-09-18T17:35:10Z"
}
```

---

## 2. `GET /sync/pull?since={timestamp}`
Recupera registros adicionados ou modificados no servidor após a data informada.

### Query Parameters
- `since` (string, ISO8601, opcional): Data do último sync bem-sucedido.
- `limit` (integer, default: 100): Número máximo de registros por página.

### Response `200 OK`
```json
{
  "cats": [
    {
      "id": "7b85bbce-862d-45db-9ff3-c3500a8ca465",
      "name": "Mingau",
      "breed": "Siamês",
      "context": "stray",
      "color": "#F5CBA7",
      "temperament": "friendly",
      "approx_age": "young",
      "latitude": -23.55052,
      "longitude": -46.633308,
      "is_obfuscated": false,
      "remote_photo_url": "https://xyz.supabase.co/storage/v1/object/public/cat-photos/7b85bbce-862d-45db-9ff3-c3500a8ca465.jpg",
      "notes": "Avistado dormindo perto do banco da praça",
      "created_at": "2026-09-18T17:30:00Z",
      "updated_at": "2026-09-18T17:30:00Z"
    }
  ],
  "has_more": false,
  "server_timestamp": "2026-09-18T17:36:00Z"
}
```

---

## 3. `POST /media/upload`
Upload de imagem para persistência no Supabase Storage.

### Request
- `multipart/form-data`
  - `file`: Arquivo de imagem comprimida (`image/jpeg` ou `image/png`, max 5MB).
  - `cat_id`: UUID do gato associado.

### Response `201 Created`
```json
{
  "cat_id": "7b85bbce-862d-45db-9ff3-c3500a8ca465",
  "remote_photo_url": "https://xyz.supabase.co/storage/v1/object/public/cat-photos/7b85bbce-862d-45db-9ff3-c3500a8ca465.jpg"
}
```

---

## 4. `GET /cats/nearby?lat={lat}&lng={lng}&radius={meters}`
Consulta geoespacial utilizando PostGIS para recuperar gatos avistados dentro de um raio geográfico.

### Query Parameters
- `lat` (float, obrigatório): Latitude central.
- `lng` (float, obrigatório): Longitude central.
- `radius` (integer, obrigatório): Raio em metros (ex: 500, 1000).

### Response `200 OK`
```json
{
  "total": 3,
  "data": [
    {
      "id": "7b85bbce-862d-45db-9ff3-c3500a8ca465",
      "name": "Mingau",
      "breed": "Siamês",
      "context": "stray",
      "temperament": "friendly",
      "latitude": -23.55052,
      "longitude": -46.633308,
      "is_obfuscated": false,
      "distance_meters": 124.5,
      "remote_photo_url": "https://xyz.supabase.co/storage/v1/object/public/cat-photos/7b85bbce-862d-45db-9ff3-c3500a8ca465.jpg"
    }
  ]
}
```
