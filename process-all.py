import subprocess
import sys

scripts = [
    ("create-pngs.py", "Convert GIFs to PNGs"),
    ("copy-images.py", "Organize PNG Explanation Images"),
    ("convert-videos.py", "Convert Videos for Mobile Compatibility"),
    ("copy-files.py", "Organize Video Files"),
]

def run_script(script_name, description, dry_run):
    print(f"\n🚀 Starting: {description} ({script_name}) {'[DRY RUN]' if dry_run else ''}")
    cmd = ["python3", script_name]
    if dry_run:
        cmd.append("--dry-run")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"❌ Failed: {description}")
        print(f"--- STDOUT ---\n{result.stdout}")
        print(f"--- STDERR ---\n{result.stderr}")
        sys.exit(1)
    else:
        print(f"✅ Completed: {description}\n")

if __name__ == "__main__":
    dry_run_flag = "--dry-run" in sys.argv

    for script_name, description in scripts:
        run_script(script_name, description, dry_run_flag)

    print("🎉 All processing complete!")
