import { query, insert, update, remove } from '../db';
import type { ArticleRow, ArticleBody } from '../types';

export async function findAll(): Promise<ArticleRow[]> {
  return query<ArticleRow>('SELECT * FROM articles ORDER BY id');
}

export async function create(data: ArticleBody): Promise<number | bigint> {
  return insert('articles', { code: data.code, name: data.name, type: data.type });
}

export async function updateArticle(id: number, data: ArticleBody): Promise<void> {
  await update('articles', id, { code: data.code, name: data.name, type: data.type });
}

export async function deleteArticle(id: number): Promise<void> {
  await remove('articles', id);
}
