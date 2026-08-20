import { v4 as uuidv4 } from 'uuid';
import type { AssetMock } from './mock-types';
import { getCurrentUserId } from '@/mock/mock-context';

// Mock giả lập kết quả PLM backend forward file lên Asset Service (AppCode AST) —
// xem docs.business/external-services.yaml. Vì môi trường mock không có storage
// thật, file được encode thành data URL để có thể hiển thị preview ngay trên UI.
export async function createAssetFromFile(
  file: File,
  category?: string,
): Promise<AssetMock> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = file.type || 'application/octet-stream';

  return {
    id: uuidv4(),
    fileName: file.name,
    mimeType,
    fileSize: file.size,
    url: `data:${mimeType};base64,${base64}`,
    status: 'Active',
    category,
    createdBy: getCurrentUserId(),
    createdOnUtc: new Date().toISOString(),
  };
}
