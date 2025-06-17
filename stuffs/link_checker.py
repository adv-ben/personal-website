import os
from bs4 import BeautifulSoup
import requests

BASE_URL = "http://bennettonang.com"
ROOT_DIR = "/home/ben/repos/personal-website/public_dir"

def get_internal_links(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    links = [a["href"] for a in soup.find_all("a", href=True)]
    return [link for link in links if link.startswith("/") or not link.startswith("http")]

def check_link(link, source_file):
    url = f"{BASE_URL}{link if link.startswith('/') else '/' + link}"
    try:
        r = requests.head(url, allow_redirects=True)
        if r.status_code == 404:
            print(f"Broken link: {link} (found in {source_file})")
        else:
            print(f"Checked: {link} (found in {source_file})")
    except requests.RequestException as e:
        print(f"Error checking link {link} (found in {source_file}): {e}")

for root, _, files in os.walk(ROOT_DIR):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            rel_path = os.path.relpath(path, ROOT_DIR)
            links = get_internal_links(path)
            for link in links:
                check_link(link, rel_path)
