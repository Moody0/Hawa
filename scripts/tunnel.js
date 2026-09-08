const localtunnel = require('localtunnel');

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    console.log(`LOCALTUNNEL_URL=${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      try {
        tunnel.close();
      } catch (_) {}
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
