import urllib.request
import json

paths = ['/api/send_otp', '/api/send_otp.py', '/api/auth/send-otp']
data = json.dumps({'email': 'test@test.com'}).encode()

for path in paths:
    url = f'https://extej-crypto.vercel.app{path}'
    req = urllib.request.Request(
        url, data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            print(f'{path}: {r.status} -> {r.read().decode()[:150]}')
    except urllib.error.HTTPError as e:
        print(f'{path}: HTTP {e.code}')
    except Exception as e:
        print(f'{path}: ERROR {type(e).__name__}: {e}')
