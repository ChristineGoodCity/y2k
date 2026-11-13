"""Soften the inner heart's center shading crease without changing its geometry."""
from collections import defaultdict
import json
import math
from pathlib import Path
import struct

path = Path(__file__).resolve().parents[1] / 'public/models/pink-heart-orbit.glb'
data = path.read_bytes()
size = struct.unpack_from('<I', data, 12)[0]
model = json.loads(data[20:20+size])
mesh = next(m for m in model['meshes'] if m['name'] == 'Pastel pink inner heart')
if mesh.get('extras', {}).get('centerNormalsSmoothed'):
    raise SystemExit('Center shading already smoothed.')
binary = bytearray(data[28+size:])
primitive = mesh['primitives'][0]

def vectors(attribute):
    accessor = model['accessors'][primitive['attributes'][attribute]]
    view = model['bufferViews'][accessor['bufferView']]
    offset = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
    stride = view.get('byteStride', 12)
    return [struct.unpack_from('<3f', binary, offset+i*stride) for i in range(accessor['count'])], offset, stride

positions, _, _ = vectors('POSITION')
normals, offset, stride = vectors('NORMAL')
# Spatial smoothing stays on the same face, avoiding front/back contamination.
radius = 0.075
cells = defaultdict(list)
for i, p in enumerate(positions):
    cells[tuple(math.floor(v/radius) for v in p)].append(i)
changed = 0
for i, p in enumerate(positions):
    if abs(p[0]) >= 0.14 or abs(normals[i][2]) < 0.45:
        continue
    cell = tuple(math.floor(v/radius) for v in p)
    total, average = 0, [0, 0, 0]
    for dx in [-1, 0, 1]:
        for dy in [-1, 0, 1]:
            for dz in [-1, 0, 1]:
                for j in cells.get((cell[0]+dx, cell[1]+dy, cell[2]+dz), []):
                    distance = sum((p[k]-positions[j][k])**2 for k in range(3))
                    if distance > radius**2 or sum(normals[i][k]*normals[j][k] for k in range(3)) < 0.75:
                        continue
                    weight = math.exp(-distance/(2*0.035**2))
                    total += weight
                    for k in range(3):
                        average[k] += weight*normals[j][k]
    if total:
        # Fade smoothly to untouched normals outside the center band.
        blend = 0.85 * (0.5 + 0.5*math.cos(math.pi*abs(p[0])/0.14))
        normal = [(1-blend)*normals[i][k] + blend*average[k]/total for k in range(3)]
        length = math.sqrt(sum(v*v for v in normal))
        struct.pack_into('<3f', binary, offset+i*stride, *(v/length for v in normal))
        changed += 1
mesh.setdefault('extras', {})['centerNormalsSmoothed'] = True
encoded = json.dumps(model, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
path.write_bytes(struct.pack('<4sII', b'glTF', 2, 28+len(encoded)+len(binary))
                + struct.pack('<I4s', len(encoded), b'JSON') + encoded
                + struct.pack('<I4s', len(binary), b'BIN\0') + binary)
print(f'Smoothed {changed} center normals; geometry and materials unchanged.')
