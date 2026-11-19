# Base de datos con Supabase

La app usa **Supabase** (PostgreSQL + inicio de sesión + almacenamiento privado).
Sin configuración, funciona en **modo demostración** con datos en memoria.

## 1. Crear las tablas (una sola vez)

1. Entra a tu proyecto en [supabase.com](https://supabase.com/dashboard) → **SQL Editor** → **New query**.
2. Copia todo el archivo [`supabase/migrations/001_esquema.sql`](../supabase/migrations/001_esquema.sql), pégalo y presiona **Run**.
3. Haz lo mismo con [`supabase/migrations/002_datos_iniciales.sql`](../supabase/migrations/002_datos_iniciales.sql) (servicios, códigos y tendencias de ejemplo).

## 2. Ajustar el inicio de sesión (recomendado para la demo)

En **Authentication → Sign In / Providers → Email**, desactiva **Confirm email**.
Así las cuentas nuevas entran de inmediato, sin esperar el correo de confirmación.

> Si lo dejas activado, la clienta debe abrir el enlace del correo antes de iniciar sesión.

## 3. Conectar la app

```bash
copy .env.example .env      # Windows
# cp .env.example .env      # Mac / Linux
npx expo start --clear
```

## 4. Convertir tu cuenta en especialista

1. Regístrate en la app con tu correo.
2. En **SQL Editor** ejecuta (con tu correo):

```sql
update public.perfiles set rol = 'especialista'
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
```

3. Cierra sesión y vuelve a entrar: verás el **Panel de la especialista**.

## Qué protege la base de datos

| Tabla | Clienta | Especialista |
| --- | --- | --- |
| `perfiles` | Solo su perfil; no puede cambiarse el rol | Todos |
| `citas` | Solo las suyas; puede pagar el anticipo o cancelar | Todas; marca realizadas |
| `tendencias` | Solo las validadas y confiables | Todas; publica u oculta |
| `fichas_esteticas`, `fotos_sesion` | Nada | Todo |
| Bucket `fotos-clinicas` (privado) | Nada | Subir y ver con enlaces temporales |
| `movimientos_club` | Sus puntos | Todos |

Reglas que también aplica la base de datos (aunque alguien salte la app):

- Una cita se confirma solo con anticipo.
- Un horario no puede reservarse dos veces.
- La primera cita no se realiza sin el consentimiento informado firmado.
- Los códigos de promoción deben existir y estar vigentes.
- Los puntos del Club LÚA se suman solos al realizar un servicio (+10, y +15 si fue un retoque a tiempo).

El biotipo y el fototipo **no se guardan** en la base de datos: se quedan solo en el teléfono.
