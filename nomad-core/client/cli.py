import time
import requests
from rich.console import Console
from rich.prompt import Prompt
from rich.table import Table
from rich.panel import Panel
from rich.status import Status
from rich.text import Text

API_URL = "http://127.0.0.1:8080/api/v1/chat"
console = Console()

def print_banner():
    console.print(Panel.fit(
        "[bold cyan]NOMAD-1[/bold cyan] [white]Terminal Agent[/white]\n[dim]Autonomous Loop Architecture[/dim]",
        border_style="cyan"
    ))

def render_tasks(todo_list):
    if not todo_list:
        return
        
    table = Table(show_header=True, header_style="bold magenta", border_style="dim")
    table.add_column("ID", style="dim", width=4)
    table.add_column("Status", width=12)
    table.add_column("Tool", width=10)
    table.add_column("Task")

    for task in todo_list:
        status = task.get("status", "unknown")
        status_color = "yellow" if status == "pending" else "green" if status == "completed" else "red"
        
        table.add_row(
            str(task.get("id")),
            f"[{status_color}]{status.upper()}[/{status_color}]",
            task.get("tool", ""),
            task.get("task", "")
        )
    
    console.print(table)

def main():
    print_banner()
    
    current_session = None
    last_history_count = 0
    
    while True:
        try:
            goal = Prompt.ask("\n[bold cyan]>[/bold cyan] Enter a goal (or 'exit')")
            if goal.lower() in ['exit', 'quit']:
                break
                
            if not goal.strip():
                continue
                
            cwd = Prompt.ask("[bold cyan]>[/bold cyan] Working Directory (optional, press Enter for current dir)")
                
            # New goal resets session
            current_session = None
            last_history_count = 0
            
            while True:
                payload = {
                    "session": current_session,
                    "messages": [{"role": "user", "content": goal}]
                }
                if cwd.strip():
                    payload["cwd"] = cwd.strip()
                
                with Status("[bold green]Agent is thinking & executing...[/bold green]", spinner="dots"):
                    response = requests.post(API_URL, json=payload)
                    
                if response.status_code != 200:
                    console.print(f"[bold red]Error communicating with server:[/bold red] {response.status_code}")
                    break
                    
                data = response.json()
                current_session = data.get("session")
                
                if not current_session:
                    console.print("[bold red]Critical Error: No session returned from server.[/bold red]")
                    break
                
                console.clear()
                print_banner()
                
                status_text = Text(f"Session Status: {current_session.get('status', 'unknown').upper()}")
                status_text.stylize("bold yellow" if current_session.get('status') == 'running' else "bold green")
                console.print(status_text)
                console.print()
                
                history = current_session.get("history", [])
                if len(history) > last_history_count:
                    new_items = history[last_history_count:]
                    for item in new_items:
                        cmd = item.get("command", {})
                        out = item.get("output", {})
                        
                        panel_content = ""
                        if cmd.get("type") == "shell":
                            panel_content += f"[bold cyan]$[/bold cyan] [white]{cmd.get('command')}[/white]\n\n"
                        elif cmd.get("type") == "file":
                            panel_content += f"[bold magenta]FileOp:[/bold magenta] [white]{cmd.get('action')} -> {cmd.get('target')}[/white]\n"
                            if cmd.get("content"):
                                panel_content += f"\n[dim]--- File Content ---[/dim]\n[white]{cmd.get('content')}[/white]\n[dim]--------------------[/dim]\n\n"
                                
                        if out.get("stdout"):
                            panel_content += f"[green]{out.get('stdout')}[/green]\n"
                        if out.get("stderr"):
                            panel_content += f"[bold red]Error:[/bold red] [red]{out.get('stderr')}[/red]\n"
                            
                        console.print(Panel(panel_content.strip(), title=f"Task #{item.get('task_id')} Execution", border_style="cyan"))
                        console.print()
                    last_history_count = len(history)
                
                todo_list = current_session.get("todo_list", [])
                render_tasks(todo_list)
                
                has_pending = any(task.get("status") == "pending" for task in todo_list)
                
                if has_pending:
                    time.sleep(1) # Small delay for visual pacing
                    goal = "continue" # Auto-feed the loop
                else:
                    console.print("\n[bold green]Goal Completed![/bold green]")
                    break
                    
        except KeyboardInterrupt:
            console.print("\n[yellow]Operation cancelled by user.[/yellow]")
            break
        except requests.exceptions.ConnectionError:
            console.print("\n[bold red]Connection Error:[/bold red] Is the FastAPI server running on http://127.0.0.1:8000?")
            break
        except Exception as e:
            console.print(f"\n[bold red]Unexpected Error:[/bold red] {str(e)}")
            break

if __name__ == "__main__":
    main()
