from pathlib import Path

path = Path('src/main.tsx')
text = path.read_text(encoding='utf-8')

text = text.replace(
"            {/* podán".encode('utf-8', 'ignore').decode('utf-8')
)
