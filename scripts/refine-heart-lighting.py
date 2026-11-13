"""Preserve chrome contrast while narrowing the two broad studio reflections."""
import json
from pathlib import Path
import struct

root = Path(__file__).resolve().parents[1]
source = (root / 'public/environments/heart-studio-gloss.hdr').read_bytes()
start = source.index(b'\n', source.index(b'-Y ')) + 1
pixels = source[start:]
output = bytearray(pixels)
background = bytes([147, 98, 163, 123])
# Narrow the broad vertical softboxes; preserve the rim and strip lights.
for left, right, top, bottom in [(7, 65, 97, 191), (151, 199, 18, 132)]:
    center = (left + right) / 2
    for y in range(top, bottom + 1):
        for x in range(left, right + 1):
            source_x = round(center + (x - center) / 0.55)
            target = 4 * (y * 512 + x)
            origin = 4 * (y * 512 + source_x)
            output[target:target+4] = pixels[origin:origin+4] if left <= source_x <= right else background
(root / 'public/environments/heart-studio-refined.hdr').write_bytes(source[:start] + output)

path = root / 'public/models/pink-heart-orbit.glb'
data = path.read_bytes()
size = struct.unpack_from('<I', data, 12)[0]
model = json.loads(data[20:20+size])
settings = {'Clear glossy blush glass': (0.45, 0.035), 'Glossy rose crystal core': (0.38, 0.035)}
for material in model['materials']:
    if material['name'] in settings:
        metal, coat_roughness = settings[material['name']]
        material['pbrMetallicRoughness'].update(metallicFactor=metal, roughnessFactor=0.045)
        material['extensions']['KHR_materials_clearcoat'].update(clearcoatFactor=1, clearcoatRoughnessFactor=coat_roughness)
encoded = json.dumps(model, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
chunks = data[20+size:]
path.write_bytes(struct.pack('<4sII', b'glTF', 2, 20+len(encoded)+len(chunks))
                + struct.pack('<I4s', len(encoded), b'JSON') + encoded + chunks)
print('Restored metallic materials and narrowed the broad reflection lights.')
