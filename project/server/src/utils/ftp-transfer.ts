import * as ftp from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';
import { insert } from '../db';

interface FtpConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  remotePath?: string;
  secure?: boolean;
}

const defaultConfig: FtpConfig = {
  host: process.env.FTP_HOST || '192.168.1.1',
  port: Number(process.env.FTP_PORT) || 21,
  user: process.env.FTP_USER || 'asbo_user',
  password: process.env.FTP_PASSWORD || '',
  remotePath: process.env.FTP_REMOTE_PATH || '/incoming/payments',
  secure: process.env.FTP_SECURE === 'true',
};

export async function uploadToBank(
  fileContent: string | Buffer,
  fileName: string,
  config: Partial<FtpConfig> = {},
  userId?: number
): Promise<{ success: boolean; path: string; error?: string }> {
  const cfg = { ...defaultConfig, ...config };
  const client = new ftp.Client();
  client.ftp.verbose = false;

  const tmpPath = path.join(process.env.TEMP || '/tmp', fileName);
  try {
    fs.writeFileSync(tmpPath, fileContent);

    await client.access({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      secure: cfg.secure,
    });

    if (cfg.remotePath) {
      await client.ensureDir(cfg.remotePath);
    }

    await client.uploadFrom(tmpPath, fileName);

    const resultPath = cfg.remotePath ? `${cfg.remotePath}/${fileName}` : fileName;

    insert('logs', {
      user_id: userId ?? null,
      action: `Файл ${fileName} отправлен на FTP-сервер банка: ${cfg.host}:${cfg.port}${resultPath}`,
    });

    return { success: true, path: resultPath };
  } catch (err) {
    const errorMsg = (err as Error).message;
    insert('logs', {
      user_id: userId ?? null,
      action: `Ошибка отправки файла ${fileName} на FTP ${cfg.host}: ${errorMsg}`,
    });
    return { success: false, path: '', error: errorMsg };
  } finally {
    client.close();
    try { fs.unlinkSync(tmpPath); } catch { /* ignore cleanup errors */ }
  }
}
