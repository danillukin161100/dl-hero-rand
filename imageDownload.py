import requests
import os
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
import argparse
import sys

def download_image(url, save_dir="downloads"):
    """
    Скачивает изображение по URL и сохраняет его в указанную директорию.
    
    Args:
        url (str): Ссылка на изображение
        save_dir (str): Директория для сохранения изображений
    """
    try:
        # Создаем директорию, если она не существует
        os.makedirs(save_dir, exist_ok=True)
        
        # Получаем имя файла из URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        
        # Если имя файла пустое, генерируем уникальное имя
        if not filename:
            filename = f"image_{hash(url)}.jpg"
        
        # Полный путь для сохранения
        save_path = os.path.join(save_dir, filename)
        
        # Заголовки для имитации браузера
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Загружаем изображение
        print(f"Загружаю: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Проверяем на ошибки HTTP
        
        # Проверяем, что это изображение
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type:
            print(f"Предупреждение: URL {url} не является изображением (Content-Type: {content_type})")
        
        # Сохраняем файл
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"Успешно сохранено: {save_path}")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"Ошибка при загрузке {url}: {e}")
        return False
    except Exception as e:
        print(f"Неожиданная ошибка при загрузке {url}: {e}")
        return False

def read_urls_from_file(filename):
    """
    Читает URL из файла, каждая ссылка на отдельной строке.
    
    Args:
        filename (str): Имя файла с URL
    
    Returns:
        list: Список URL
    """
    urls = []
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                url = line.strip()
                if url and not url.startswith('#'):  # Пропускаем пустые строки и комментарии
                    urls.append(url)
        return urls
    except FileNotFoundError:
        print(f"Файл {filename} не найден!")
        return []

def main():
    # Настройка аргументов командной строки
    parser = argparse.ArgumentParser(description='Скачивание изображений по ссылкам из файла')
    parser.add_argument('input_file', help='Файл с URL изображений (каждая ссылка на новой строке)')
    parser.add_argument('-o', '--output', default='downloads', 
                       help='Директория для сохранения изображений (по умолчанию: downloads)')
    parser.add_argument('-t', '--threads', type=int, default=3,
                       help='Количество потоков для параллельной загрузки (по умолчанию: 3)')
    parser.add_argument('-v', '--verbose', action='store_true',
                       help='Подробный вывод информации')
    
    args = parser.parse_args()
    
    # Читаем URL из файла
    if args.verbose:
        print(f"Читаю URL из файла: {args.input_file}")
    
    urls = read_urls_from_file(args.input_file)
    
    if not urls:
        print("Не найдено URL для загрузки.")
        return
    
    print(f"Найдено {len(urls)} URL для загрузки.")
    
    # Создаем директорию для сохранения
    os.makedirs(args.output, exist_ok=True)
    
    # Загружаем изображения
    successful = 0
    failed = 0
    
    # Используем многопоточность для ускорения загрузки
    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        # Отправляем задачи на выполнение
        futures = [executor.submit(download_image, url, args.output) for url in urls]
        
        # Ожидаем завершения всех задач
        for future in futures:
            result = future.result()
            if result:
                successful += 1
            else:
                failed += 1
    
    # Выводим статистику
    print("\n" + "="*50)
    print("Загрузка завершена!")
    print(f"Успешно: {successful}")
    print(f"Не удалось: {failed}")
    print(f"Всего: {len(urls)}")
    print(f"Изображения сохранены в: {os.path.abspath(args.output)}")

if __name__ == "__main__":
    # Проверяем наличие необходимых библиотек
    try:
        import requests
    except ImportError:
        print("Ошибка: библиотека requests не установлена.")
        print("Установите её с помощью: pip install requests")
        sys.exit(1)
    
    main()