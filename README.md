# Redgold Dashboard

MVP веб-дашборда для клиента «Красное золото».

## Технологии

- Next.js
- TypeScript
- React
- Recharts
- Обычный CSS без сложной дизайн-системы

## Разделы

- Общая сводка — заглушка
- СМИ — реализовано на тестовых данных из `data/media_dashboard.json`
- Блогеры — заглушка
- ORM — заглушка
- Контекстная реклама — заглушка

## Локальный запуск

```bash
npm install
npm run dev
```

После запуска откройте `http://localhost:3000`.

## Проверка production-сборки

Проект настроен на статический экспорт Next.js. После сборки готовый сайт появляется в папке `out`.

```bash
npm run build
```

## Публикация через GitHub Pages

Vercel не используется. Публикация сайта выполняется через GitHub Actions workflow `deploy-pages`.

Чтобы включить GitHub Pages в репозитории:

1. Откройте `Settings` репозитория на GitHub.
2. Перейдите в `Pages`.
3. В блоке `Build and deployment` выберите `Source: GitHub Actions`.
4. Сохраните настройки, если GitHub попросит подтверждение.

Ручной запуск публикации:

1. Откройте вкладку `Actions` в GitHub.
2. Выберите workflow `deploy-pages`.
3. Нажмите `Run workflow`.
4. Выберите ветку и подтвердите запуск.

Workflow также запускается автоматически при push в ветку `main`.

## Обновление данных СМИ

Данные СМИ пока берутся из локального файла `data/media_dashboard.json`. Подключение к Google Sheets будет следующим этапом; сейчас Google Sheets не подключается.

Для ручного запуска обновления данных:

1. Откройте вкладку `Actions` в GitHub.
2. Выберите workflow `update-media-data`.
3. Нажмите `Run workflow`.
4. Выберите ветку и подтвердите запуск.

На первом этапе workflow запускает команду-заглушку:

```bash
npm run fetch:media
```

Скрипт проверяет наличие `data/media_dashboard.json`, выводит лог `Media data update placeholder` и завершается без ошибки. Если в будущем файл изменится, workflow сделает commit обратно в репозиторий с сообщением `Update media dashboard data`.
