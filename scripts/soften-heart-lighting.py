"""Build a soft, evenly filled studio environment and soften heart materials."""
import json
import math
from pathlib import Path
import struct

root = Path(__file__).resolve().parents[1]
width, height = 512, 256
pixels = bytearray()
# Broad lights on opposite sides keep the front and back equally illuminated.
lights = [(0.65, 0.55, 0.52), (-0.65, 0.55, -0.52)]
lights = [tuple(v / math.sqrt(sum(x*x for x in light)) for v in light) for light in lights]
for y in range(height):
    theta = math.pi * (y + 0.5) / height
    for x in range(width):
        phi = math.tau * (x + 0.5) / width
        direction = (math.sin(theta)*math.cos(phi), math.cos(theta), math.sin(theta)*math.sin(phi))
        intensity = 0.65 + 0.12 * (direction[1] + 1) / 2
        for light in lights:
            dot = sum(a*b for a, b in zip(direction, light))
            intensity += 1.15 * math.exp((dot - 1) / 0.22)
        rgb = [intensity, intensity * 0.97, intensity * 0.99]
        mantissa, exponent = math.frexp(max(rgb))
        scale = mantissa * 256 / max(rgb)
        pixels.extend([*(min(255, int(c*scale)) for c in rgb), exponent + 128])
(root / 'public/environments/heart-studio-soft.hdr').write_bytes(
    f'#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y {height} +X {width}\n'.encode() + pixels)

path = root / 'public/models/pink-heart-orbit.glb'
data = path.read_bytes()
size = struct.unpack_from('<I', data, 12)[0]
model = json.loads(data[20:20+size])
for material in model['materials']:
    if material['name'] not in ('Clear glossy blush glass', 'Glossy rose crystal core'):
        continue
    pbr = material['pbrMetallicRoughness']
    pbr['roughnessFactor'] = 0.23
    pbr['metallicFactor'] = 0.12
    coat = material['extensions']['KHR_materials_clearcoat']
    coat['clearcoatFactor'] = 0.55
    coat['clearcoatRoughnessFactor'] = 0.24
encoded = json.dumps(model, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
chunks = data[20+size:]
path.write_bytes(struct.pack('<4sII', b'glTF', 2, 20+len(encoded)+len(chunks))
                 + struct.pack('<I4s', len(encoded), b'JSON') + encoded + chunks)
print('Created soft studio lighting and softened both heart materials.')
