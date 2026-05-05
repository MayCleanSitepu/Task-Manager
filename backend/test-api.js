const BASE_URL = 'http://localhost:3001';

async function testApi() {
  console.log('🚀 Memulai API Test...\n');

  try {
    console.log('Case 1: Login salah password...');
    const loginFail = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ngasal@test.com', password: 'salah' })
    });
    console.log(loginFail.status === 401 ? '✅ Pass: 401 Unauthorized' : '❌ Fail');

    console.log('\nCase 2: Register & Login...');
    const email = `test_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', email, password: 'password123' })
    });
    const user = await regRes.json();
    console.log('DEBUG USER:', user);
    
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const { access_token: token } = await loginRes.json();
    console.log('DEBUG TOKEN:', token ? `${token.substring(0, 30)}...` : 'UNDEFINED!');
    console.log('✅ Login Berhasil.');

    console.log('\nCase 3: Akses tanpa token...');
    const noTokenRes = await fetch(`${BASE_URL}/projects`);
    console.log(noTokenRes.status === 401 ? '✅ Pass: Ditolak' : '❌ Fail');

    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Project Test', description: 'Testing' })
    });
    const project = await projectRes.json();
    console.log('DEBUG PROJECT:', project);
    console.log(`✅ Project Dibuat: ${project.name}`);

    console.log('\nCase 4: Validasi input...');
    const badTask = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ projectId: project.id })
    });
    console.log(badTask.status === 400 ? '✅ Pass: 400 Bad Request' : '❌ Fail');

    console.log('\nCase 5: Conflict Detection...');
    const postTask = async (title, start, end) => {
      return fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title,
          projectId: project.id,
          assigneeId: user.id,
          scheduledStart: new Date(start),
          scheduledEnd: new Date(end)
        })
      });
    };

    const taskA = await (await postTask('Task A', '2026-05-10T10:00:00Z', '2026-05-10T12:00:00Z')).json();
    const taskB = await (await postTask('Task B', '2026-05-10T11:00:00Z', '2026-05-10T13:00:00Z')).json();
    console.log('DEBUG Task A:', JSON.stringify(taskA, null, 2));

    const conflictRes = await fetch(`${BASE_URL}/schedule/conflicts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const conflicts = await conflictRes.json();
    
    if (conflicts.length > 0) {
      console.log('🔥 KONFLIK TERDETEKSI:');
      conflicts.forEach(c => console.log(`   - ${c.message}`));
    } else {
      console.log('❌ GAGAL: Konflik tidak terdeteksi!');
    }

    console.log('\n--- ALL TESTS COMPLETED ---');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

testApi();
