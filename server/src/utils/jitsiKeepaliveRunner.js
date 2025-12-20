import puppeteer from 'puppeteer';
import path from 'path';

// Usage: node jitsiKeepaliveRunner.js <roomName>
// This script opens a headless Chrome instance and joins the specified Jitsi room
// to prevent the public meet.jit.si room from being reclaimed while a class
// is scheduled. It runs until terminated.

const ROOM = process.argv[2];

if (!ROOM) {
  console.error('Usage: node jitsiKeepaliveRunner.js <roomName>');
  process.exit(2);
}

async function main() {
  console.log('Starting Jitsi keepalive for room:', ROOM);

  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    // reduce resource usage where possible
    '--disable-dev-shm-usage',
    '--mute-audio',
  ];

  const browser = await puppeteer.launch({
    headless: true,
    args,
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    try { console.log('KEEPALIVE>', msg.text()); } catch (e) { }
  });

  // navigate to Jitsi room with prejoin disabled
  const url = `https://meet.jit.si/${ROOM}#config.prejoinPageEnabled=false`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // wait a little for the Jitsi iframe and initializer
    await page.waitForTimeout(8000);
    console.log('Keepalive: joined room (or page loaded). Now holding connection.');

    // keep the process alive indefinitely until killed
    process.on('SIGINT', async () => {
      console.log('Keepalive: received SIGINT, closing');
      try { await browser.close(); } catch (e) { }
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      console.log('Keepalive: received SIGTERM, closing');
      try { await browser.close(); } catch (e) { }
      process.exit(0);
    });

    // Periodically touch the page to avoid timeouts
    setInterval(async () => {
      try {
        await page.evaluate(() => { /* noop */ });
      } catch (e) {
        console.error('Keepalive: periodic evaluate failed', e);
      }
    }, 30_000);

    // never return
  } catch (err) {
    console.error('Keepalive: failed to join or keep page alive', err);
    try { await browser.close(); } catch (e) { }
    process.exit(1);
  }
}

main();
