# Guía de Configuración - Deploy React SPA a VPS

## 📋 Pasos de Configuración

### 1. Crear el archivo del GitHub Action

Crea la siguiente estructura en tu repositorio:

```
.github/
  workflows/
    deploy.yml
```

Copia el contenido del archivo `deploy-react-spa.yml` en `.github/workflows/deploy.yml`

---

### 2. Generar clave SSH para el despliegue

En tu máquina local, genera un par de claves SSH:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
```

Esto generará dos archivos:

- `github_deploy` (clave privada) ← La usarás en GitHub Secrets
- `github_deploy.pub` (clave pública) ← La copiarás al VPS

---

### 3. Configurar el VPS de Hostgator

#### 3.1 Conectarte al VPS

```bash
ssh tu_usuario@tu_dominio.com
```

#### 3.2 Agregar la clave pública al servidor

```bash
# Crear el directorio .ssh si no existe
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Agregar la clave pública
echo "CONTENIDO_DE_github_deploy.pub" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 3.3 Identificar la ruta de despliegue

El directorio web típicamente está en:

- cPanel/Hostgator: `/home/tu_usuario/public_html`
- O un subdirectorio específico: `/home/tu_usuario/public_html/nombre_app`

Verifica con:

```bash
pwd
ls -la
```

---

### 4. Configurar GitHub Secrets

Ve a tu repositorio en GitHub:
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Agrega los siguientes secrets:

| Secret Name       | Descripción                 | Ejemplo                          |
| ----------------- | --------------------------- | -------------------------------- |
| `VITE_WS_NUMBER`  | Número de WebSocket         | `3000`                           |
| `VITE_API_URL`    | URL de tu API               | `https://api.tudominio.com`      |
| `VPS_HOST`        | IP o dominio del VPS        | `123.45.67.89` o `tudominio.com` |
| `VPS_USER`        | Usuario SSH del VPS         | `tu_usuario`                     |
| `VPS_SSH_KEY`     | Clave privada SSH completa  | Contenido de `github_deploy`     |
| `VPS_DEPLOY_PATH` | Ruta destino en el servidor | `/home/tu_usuario/public_html/`  |

#### Formato para VPS_SSH_KEY:

Copia TODO el contenido del archivo `github_deploy`, incluyendo:

```
-----BEGIN OPENSSH PRIVATE KEY-----
...todo el contenido...
-----END OPENSSH PRIVATE KEY-----
```

---

### 5. Verificar configuración del proyecto

Asegúrate de que tu `package.json` tenga el script de build:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

Y que el build genere los archivos en el directorio `dist/` (configuración por defecto de Vite).

---

### 6. Probar el despliegue

1. Haz un commit y push a la rama `main`:

```bash
git add .
git commit -m "feat: configurar GitHub Actions para deploy"
git push origin main
```

2. Ve a la pestaña **Actions** en tu repositorio de GitHub

3. Observa el progreso del workflow

4. Si todo está correcto, verás un ✅ verde

---

## 🔧 Troubleshooting

### Error: "Permission denied (publickey)"

- Verifica que la clave SSH esté correctamente configurada en el VPS
- Asegúrate de copiar TODO el contenido de la clave privada en GitHub Secrets

### Error: "rsync: failed to set times"

- Agrega `--no-perms --no-owner --no-group` a los switches en el workflow

### El sitio no se actualiza

- Verifica que `VPS_DEPLOY_PATH` apunte al directorio correcto
- Limpia la caché del navegador (Ctrl + Shift + R)
- Verifica que el directorio `dist/` contenga los archivos compilados

### Variables de entorno no funcionan

- En Vite, las variables DEBEN tener el prefijo `VITE_`
- Se inyectan en tiempo de compilación, no en tiempo de ejecución
- Verifica en `dist/assets/*.js` que las variables se hayan reemplazado

---

## 📝 Notas importantes

1. **Seguridad**: Nunca subas las claves SSH al repositorio
2. **Variables**: Las variables `VITE_*` son públicas (se incluyen en el bundle)
3. **Cache**: El `--delete` en rsync elimina archivos antiguos del servidor
4. **Permisos**: Asegúrate de que el usuario tenga permisos de escritura en el directorio

---

## 🚀 Próximos pasos opcionales

- Agregar notificaciones en Slack/Discord cuando el deploy termine
- Implementar deploy preview para pull requests
- Agregar tests antes del deploy
- Configurar staging environment (rama develop)
