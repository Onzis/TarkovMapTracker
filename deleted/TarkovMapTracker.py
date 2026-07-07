import os
import time
import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Автоматическое определение папки Документы текущего пользователя Windows
USER_HOME = os.path.expanduser('~')
WATCH_DIR = os.path.join(USER_HOME, "Documents", "Escape from Tarkov", "Screenshots")

latest_coords = ""

class CoordinatesServer(BaseHTTPRequestHandler):
    def do_GET(self):
        global latest_coords
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        
        response = {"coords": latest_coords}
        latest_coords = "" 
        self.wfile.write(json.dumps(response).encode('utf-8'))
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass

def run_server():
    server = HTTPServer(('127.0.0.1', 12345), CoordinatesServer)
    server.serve_forever()

class ScreenshotHandler(FileSystemEventHandler):
    def on_created(self, event):
        global latest_coords
        if not event.is_directory and event.src_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            time.sleep(0.2)
            file_path = event.src_path
            file_name = os.path.basename(file_path)
            name_without_ext, _ = os.path.splitext(file_name)
            
            try:
                latest_coords = name_without_ext
                os.remove(file_path)
                print(f"[OK] Координаты отправлены на карту: {name_without_ext}")
            except Exception as e:
                print(f"[Ошибка] Не удалось обработать файл: {e}")

if __name__ == "__main__":
    if not os.path.exists(WATCH_DIR):
        print(f"Путь не найден: {WATCH_DIR}")
        exit()

    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    event_handler = ScreenshotHandler()
    observer = Observer()
    observer.schedule(event_handler, path=WATCH_DIR, recursive=False)
    observer.start()
    
    print(f"Сервер запущен. Мониторинг папки: {WATCH_DIR}")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
