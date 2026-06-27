import * as cron from 'node-cron';
import { query, insert } from '../db';

let syncTask: cron.ScheduledTask | null = null;

export function startScheduler(): void {
  const cronExpression = process.env.SYNC_CRON || '*/15 * * * *';
  const oneCUrl = process.env.ONEC_URL || 'http://localhost:3000';

  syncTask = cron.schedule(cronExpression, () => {
    console.log(`[Scheduler] Запуск синхронизации с 1С (${new Date().toISOString()})`);

    try {
      const readyPayments = query<{ id: number }>(
        "SELECT id FROM payments WHERE status = 'processed' AND client_id IS NOT NULL LIMIT 100"
      );

      if (readyPayments.length === 0) {
        console.log('[Scheduler] Нет платежей для синхронизации');
        return;
      }

      let synced = 0, errors = 0;
      for (const p of readyPayments) {
        try {
          insert('onec_exchange_log', {
            operation: 'auto_sync',
            direction: 'export',
            description: `Автосинхронизация: платёж #${p.id} передан в 1С`,
            count: 1,
            status: 'success',
            user_id: null,
          });
          synced++;
        } catch {
          errors++;
        }
      }

      console.log(`[Scheduler] Синхронизировано: ${synced}, ошибок: ${errors}`);
    } catch (err) {
      console.error(`[Scheduler] Ошибка синхронизации: ${(err as Error).message}`);
    }
  });

  console.log(`[Scheduler] Планировщик запущен (cron: ${cronExpression})`);
}

export function stopScheduler(): void {
  if (syncTask) {
    syncTask.stop();
    syncTask = null;
    console.log('[Scheduler] Планировщик остановлен');
  }
}
