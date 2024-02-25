from flask import Flask, jsonify, request  # Added request here
import qrcode
import socket

app = Flask(__name__)

def get_ip_address():
    """Get the primary IP address of the machine."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def generate_qr_code(ip_address, filename='server_qr.png'):
    """Generate a QR code for the given IP address."""
    url = ip_address  # Ensure the URL is correctly formatted

    print(url)
    qr = qrcode.make(url)
    qr.save(filename)
    print(f"QR code generated for {url}. Please open {filename} to scan.")

@app.route('/ping', methods=['GET'])
def ping_server():
    return jsonify({"status": "Server is alive"}), 200

@app.route('/message', methods=['POST'])
def receive_message():
    data = request.json
    print(f"Received message: {data['message']}")
    return jsonify({"status": "Message received"}), 200

if __name__ == '__main__':
    ip_address = get_ip_address()
    generate_qr_code(ip_address)  # Ensure the URL is correctly formatted
    app.run(host='0.0.0.0', port=8000, debug=True)
