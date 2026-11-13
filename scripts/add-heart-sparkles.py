"""Keep the heart static with stars suspended inside its transparent shell."""
import copy
import json
import math
from pathlib import Path
import struct

path = Path(__file__).resolve().parents[1] / 'public/models/pink-heart-orbit.glb'
data = path.read_bytes()
size = struct.unpack_from('<I', data, 12)[0]
model = json.loads(data[20:20 + size])
binary = data[28 + size:]
model.pop('animations', None)

def read_vectors(index):
    acc = model['accessors'][index]
    view = model['bufferViews'][acc['bufferView']]
    offset = view.get('byteOffset', 0) + acc.get('byteOffset', 0)
    return [struct.unpack_from('<3f', binary, offset + i * view.get('byteStride', 12))
            for i in range(acc['count'])]

def add(node):
    if any(n.get('name') == node['name'] for n in model['nodes']):
        return
    index = len(model['nodes'])
    model['nodes'].append(node)
    model['scenes'][model.get('scene', 0)]['nodes'].append(index)

front = [n for n in model['nodes'] if n.get('name', '').startswith('Sparkle ')]
for original in front:
    node = copy.deepcopy(original)
    node['name'] = 'Rear ' + original['name']
    node['translation'][2] *= -1
    node['rotation'] = [0, 1, 0, 0]
    add(node)

# Place small side stars on actual outer-heart vertices and align with normals.
primitive = model['meshes'][0]['primitives'][0]
positions = read_vectors(primitive['attributes']['POSITION'])
normals = read_vectors(primitive['attributes']['NORMAL'])
for side in [-1, 1]:
    for number, target_y in enumerate([0.48, 0.12, -0.28]):
        candidates = [i for i, p in enumerate(positions)
                      if side * p[0] > 0.25 and abs(p[2]) < 0.015]
        index = min(candidates, key=lambda i: abs(positions[i][1] - target_y))
        point, normal = positions[index], normals[index]
        length = math.sqrt(sum(v*v for v in normal))
        nx, ny, nz = [v / length for v in normal]
        quaternion = [-ny, nx, 0, 1 + nz]
        length = math.sqrt(sum(v*v for v in quaternion))
        add({'name': f'Side sparkle {side} {number}', 'mesh': front[number]['mesh'],
             'translation': [point[i] + 0.007 * v for i, v in enumerate([nx, ny, nz])],
             'rotation': [v / length for v in quaternion], 'scale': [0.8, 0.8, 0.8]})

# Place every star beneath the outer shell, including the original front stars.
# Keep its starting position so repeated runs do not push it farther inward.
for node in model['nodes']:
    if not node.get('name', '').startswith(('Sparkle ', 'Rear Sparkle ', 'Side sparkle ')):
        continue
    extras = node.setdefault('extras', {})
    source = extras.setdefault('surfaceSparklePosition', node['translation'][:])
    index = min(range(len(positions)), key=lambda i: sum(
        (positions[i][k] - source[k])**2 for k in range(3)))
    normal = normals[index]
    length = math.sqrt(sum(v*v for v in normal))
    # A 0.05 inset clears the complete star, not just its center.
    node['translation'] = [positions[index][k] - 0.05*normal[k]/length for k in range(3)]

encoded = json.dumps(model, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
path.write_bytes(struct.pack('<4sII', b'glTF', 2, 28 + len(encoded) + len(binary))
                + struct.pack('<I4s', len(encoded), b'JSON') + encoded
                + struct.pack('<I4s', len(binary), b'BIN\0') + binary)
print('Static heart: all 22 stars inset inside the transparent shell.')
