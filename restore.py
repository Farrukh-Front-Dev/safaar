import json
import os

transcript_path = "/Users/scarygun/.gemini/antigravity-ide/brain/d07ade24-1f73-49f5-9825-e51033c09f5d/.system_generated/logs/transcript_full.jsonl"

def apply_replace(file_path, start, end, target, replacement, allow_multiple):
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist for replace")
        return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if allow_multiple:
        content = content.replace(target, replacement)
    else:
        content = content.replace(target, replacement, 1)
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            step = json.loads(line)
            if step.get("type") == "PLANNER_RESPONSE" and "tool_calls" in step:
                for call in step["tool_calls"]:
                    name = call.get("name")
                    if name.startswith("default_api:"):
                        name = name.split(":")[1]
                    args = call.get("args", {})
                    
                    if name == "write_to_file":
                        target_file = args.get("TargetFile")
                        code_content = args.get("CodeContent", "")
                        if target_file and "agoda_frontend_backend" in target_file:
                            os.makedirs(os.path.dirname(target_file), exist_ok=True)
                            with open(target_file, "w", encoding="utf-8") as out_f:
                                out_f.write(code_content)
                            print(f"Wrote {target_file}")
                            
                    elif name == "replace_file_content":
                        target_file = args.get("TargetFile")
                        if target_file and "agoda_frontend_backend" in target_file:
                            apply_replace(
                                target_file,
                                args.get("StartLine"),
                                args.get("EndLine"),
                                args.get("TargetContent", ""),
                                args.get("ReplacementContent", ""),
                                args.get("AllowMultiple", False)
                            )
                            print(f"Replaced in {target_file}")
                            
                    elif name == "multi_replace_file_content":
                        target_file = args.get("TargetFile")
                        if target_file and "agoda_frontend_backend" in target_file:
                            for chunk in args.get("ReplacementChunks", []):
                                apply_replace(
                                    target_file,
                                    chunk.get("StartLine"),
                                    chunk.get("EndLine"),
                                    chunk.get("TargetContent", ""),
                                    chunk.get("ReplacementContent", ""),
                                    chunk.get("AllowMultiple", False)
                                )
                            print(f"Multi-replaced in {target_file}")
        except Exception as e:
            pass

