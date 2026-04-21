import os

def get_directory_context(cwd: str = None) -> str:
    target_dir = cwd if cwd else os.getcwd()
    if not os.path.exists(target_dir):
        return f"Working Directory Context: Path '{target_dir}' does not exist yet."
    try:
        files = os.listdir(target_dir)
        if not files:
            return f"Working Directory Context: Path '{target_dir}' is empty."
        if len(files) > 50:
             return f"Working Directory Context: Path '{target_dir}' contains {len(files)} items (showing first 50): " + ", ".join(files[:50])
        return f"Working Directory Context: Path '{target_dir}' contains: " + ", ".join(files)
    except Exception as e:
        return f"Working Directory Context: Error reading directory: {str(e)}"
