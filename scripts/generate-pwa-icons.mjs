/**
 * Gera todos os ícones PWA + favicon.ico a partir do logo original (vya.jpg).
 * Execute com: npm run generate:icons
 * Requer: python3 + Pillow  (pip3 install Pillow)
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'vya.jpg');

if (!existsSync(SRC)) {
  console.error('❌  Arquivo vya.jpg não encontrado na raiz do projeto.');
  process.exit(1);
}

const PYTHON_SCRIPT = String.raw`
from PIL import Image
import io, struct, os

SRC = r"${SRC}"
OUT_DIR = r"${join(ROOT, 'public/icons')}"
os.makedirs(OUT_DIR, exist_ok=True)

base = Image.open(SRC).convert("RGBA").resize((1024, 1024), Image.LANCZOS)

# PNGs
for name, size in [("icon-192.png",192),("icon-512.png",512),
                   ("apple-touch-icon.png",180),
                   ("favicon-32x32.png",32),("favicon-16x16.png",16)]:
    base.resize((size,size), Image.LANCZOS).save(os.path.join(OUT_DIR,name),"PNG",optimize=True)
    print(f"OK {name}")

# favicon.ico multi-size
SIZES=[16,32,48]
frames=[]; base2=base
for s in SIZES:
    buf=io.BytesIO(); base2.resize((s,s),Image.LANCZOS).save(buf,format="PNG"); frames.append(buf.getvalue())
n=len(frames); header=struct.pack("<HHH",0,1,n)
data_offset=6+n*16; entries=b""; data=b""
for i,(size,frame) in enumerate(zip(SIZES,frames)):
    entries+=struct.pack("<BBBBHHII",size,size,0,0,1,32,len(frame),data_offset+sum(len(frames[j])for j in range(i))); data+=frame
with open(r"${join(ROOT,'public/favicon.ico')}","wb") as f: f.write(header+entries+data)
print("OK favicon.ico")
print("DONE")
`.trim();

execSync(`python3 -c "${PYTHON_SCRIPT.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
  { stdio: 'inherit', cwd: ROOT });
