import os
import shutil

class FileExecutor:
    def execute(self, cmd_obj: dict, cwd: str = None) -> dict:
        action = cmd_obj.get("action")
        target = cmd_obj.get("target")
        content = cmd_obj.get("content", "")
        
        if target and cwd and not os.path.isabs(target):
            target = os.path.join(cwd, target)
        
        try:
            if action == "create_dir":
                os.makedirs(target, exist_ok=True)
                return {"success": True, "stdout": f"Directory {target} created successfully.", "stderr": "", "returncode": 0}
            elif action == "delete_dir":
                if os.path.exists(target):
                    shutil.rmtree(target)
                return {"success": True, "stdout": f"Directory {target} deleted successfully.", "stderr": "", "returncode": 0}
            elif action in ["write_file", "create_file"]:
                with open(target, "w", encoding="utf-8") as f:
                    f.write(content)
                return {"success": True, "stdout": f"File {target} written successfully.", "stderr": "", "returncode": 0}
            elif action == "read_file":
                with open(target, "r", encoding="utf-8") as f:
                    data = f.read()
                return {"success": True, "stdout": data, "stderr": "", "returncode": 0}
            elif action == "delete_file":
                if os.path.exists(target):
                    os.remove(target)
                return {"success": True, "stdout": f"File {target} deleted successfully.", "stderr": "", "returncode": 0}
            elif action == "list_dir":
                target_dir = target if target else cwd if cwd else "."
                files = os.listdir(target_dir)
                return {"success": True, "stdout": "\n".join(files), "stderr": "", "returncode": 0}
            else:
                return {"success": False, "stdout": "", "stderr": f"Unknown action: {action}", "returncode": 1}
        except Exception as e:
            return {"success": False, "stdout": "", "stderr": str(e), "returncode": -1}
