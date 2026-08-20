import { createAssetFromFile } from './helpers';
import { assetStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { toUrl } from '@/core/network/mock-utils';
import plmHttpRequest from '@/core/network/plm-http-request';

// ─── POST /registry/assets/upload ──────────────────────────────────────────
// PLM backend nhận file, forward lên Asset Service rồi trả về Asset object
// (xem docs.business/external-services.yaml) — frontend không gọi Asset Service
// trực tiếp. Mock dựng lại Request từ (input, init) để dùng `.formData()` có sẵn
// (Content-Type/boundary do proxy route forward nguyên vẹn).
plmHttpRequest.addMockRoute({
  url: /\/registry\/assets\/upload$/,
  method: 'POST',
  handler: async (input, init) => {
    const request = new Request(toUrl(input), init);
    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category');

    if (!(file instanceof File)) {
      return appfetch.error(
        { code: 'FILE_REQUIRED', message: 'Thiếu file để upload' },
        400,
      );
    }

    const asset = await createAssetFromFile(
      file,
      typeof category === 'string' ? category : undefined,
    );
    assetStore.push(asset);
    return appfetch.json(asset);
  },
});
