class Validator:
    def __init__(self):
        self.denylist = [
            "rm -rf",
            "mkfs",
            "format",
            ":(){ :|:& };:",
            "mv / /dev/null",
            "dd if=/dev/zero",
            "wget ",
            "curl "
        ]

    def is_safe(self, command: str) -> bool:
        cmd_lower = command.lower()
        for dangerous_term in self.denylist:
            if dangerous_term in cmd_lower:
                return False
        return True
