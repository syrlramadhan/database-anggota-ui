import config from '../config';

export async function updateMember(id, payload, token) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      // Kirim hanya field yang ada isinya (bisa satu, beberapa, atau semua)
      if (key === 'foto') {
        if (value instanceof File || (typeof value === 'string' && value !== '')) {
          formData.append('foto', value);
        }
      } else {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      }
    });

    const response = await fetch(`${config.api.url}${config.endpoints.memberUpdate(id)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
  let result;
  try {
    result = await response.json();
  } catch (e) {
    console.error('Gagal parsing response JSON:', e);
    throw new Error('Gagal parsing response JSON');
  }
  if (!response.ok) {
    console.error('Update member gagal:', result, response.status);
    throw new Error(result?.message || `Gagal update member (${response.status})`);
  }
  return result;
}
