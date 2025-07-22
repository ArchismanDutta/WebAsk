import requests
from bs4 import BeautifulSoup

def scrape_website(url):
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/115.0.0.0 Safari/537.36"
            )
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx/5xx)

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove unnecessary tags
        for tag in soup(["script", "style", "noscript", "footer", "header", "form", "nav", "aside"]):
            tag.decompose()

        # Extract visible text
        text = soup.get_text(separator=" ", strip=True)

        # Clean text
        cleaned_text = " ".join(text.split())
        return cleaned_text

    except requests.exceptions.RequestException as e:
        return f"Error fetching URL: {e}"
    except Exception as e:
        return f"Error parsing HTML: {e}"
