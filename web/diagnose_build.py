import subprocess
import os

cwd = r'c:\Users\Arjun\Downloads\Resonance\web'
print(f"Running build in {cwd}...")

try:
    # Run npm run build and capture everything
    result = subprocess.run(
        ['npm', 'run', 'build'],
        cwd=cwd,
        capture_output=True,
        text=True,
        shell=True
    )
    
    print("--- STDOUT ---")
    print(result.stdout)
    print("--- STDERR ---")
    print(result.stderr)
    
    if result.returncode == 0:
        print("Build SUCCESSFUL")
    else:
        print(f"Build FAILED with return code {result.returncode}")

except Exception as e:
    print(f"Error executing build script: {e}")
