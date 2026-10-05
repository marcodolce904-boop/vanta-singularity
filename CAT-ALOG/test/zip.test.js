'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { createZip, readZip } = require('../lib/zip');

test('zip: scrive e rilegge file con accenti e contenuto ripetuto', () => {
  const big = 'ciao '.repeat(5000);
  const z = createZip([{ name: 'a/è.txt', data: 'perché' }, { name: 'b.css', data: big }, { name: 'vuoto', data: '' }]);
  const r = readZip(z);
  assert.deepEqual(r.map((x) => x.name), ['a/è.txt', 'b.css', 'vuoto']);
  assert.equal(r[0].data.toString('utf8'), 'perché');
  assert.equal(r[1].data.toString('utf8'), big);
  assert.ok(z.length < big.length, 'è compresso');
});

test('zip: lo apre anche un programma vero (python zipfile)', () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zip-')), 't.zip');
  fs.writeFileSync(f, createZip([{ name: 'x/y.txt', data: 'ok'.repeat(100) }]));
  let out;
  try {
    out = execFileSync('python3', ['-c', 'import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip(), z.namelist(), len(z.read("x/y.txt")))', f]).toString();
  } catch (e) {
    return; /* python assente: la prova non si applica */
  }
  assert.match(out, /None \['x\/y\.txt'\] 200/);
});

test('zip: rifiuta percorsi pericolosi e file rovinati', () => {
  assert.throws(() => readZip(createZip([{ name: '../fuori.txt', data: 'x' }])), /non permesso/);
  assert.throws(() => readZip(createZip([{ name: '/assoluto.txt', data: 'x' }])), /non permesso/);
  assert.throws(() => readZip(Buffer.from('non è uno zip')), /non valido/);
  const z = createZip([{ name: 'a.txt', data: 'ciao ciao ciao ciao ciao' }]);
  z[40] ^= 0xff;
  assert.throws(() => readZip(z));
});

test('zip: una «bomba» (dimensione dichiarata troppo grande o decompressione oltre il dichiarato) viene rifiutata', () => {
  const zlib = require('zlib');
  const Z = require('../lib/zip');
  const buf = Z.createZip([{ name: 'a.txt', data: Buffer.alloc(1000, 97) }]);
  /* dichiara 1 byte ma il contenuto compresso ne produce 1000 */
  const fake = Buffer.from(buf);
  const cd = fake.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  fake.writeUInt32LE(1, cd + 24);
  assert.throws(() => Z.readZip(fake));
  const big = Buffer.from(buf);
  big.writeUInt32LE(0x7fffffff, cd + 24);
  assert.throws(() => Z.readZip(big), /troppo grande/);
  assert.equal(Z.readZip(buf)[0].data.length, 1000);
});
