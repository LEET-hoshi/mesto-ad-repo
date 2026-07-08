import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,          // Автоматически открывать браузер
    host: true,          // Доступ с других устройств в сети
    port: 5173,          // Можно указать конкретный порт
    strictPort: false    // Если порт занят, использовать другой
  },
  // Дополнительные настройки для проекта
  base: './',
  root: '.',             // Корневая папка проекта
  publicDir: 'public',   // Папка со статическими файлами
  build: {
    outDir: 'dist',      // Папка для сборки
    emptyOutDir: true    // Очищать папку при сборке
  }
})