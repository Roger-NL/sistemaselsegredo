import sys
import re
import json

md_path = r"c:\Users\rauge\Documents\elsegredo\novoessite\configuracoes\PILAR_01.md"
ts_path = r"c:\Users\rauge\Documents\elsegredo\novoessite\src\data\pillars-content.ts"

with open(md_path, 'r', encoding='utf-8') as f:
    md_content = f.read()

title_re = re.compile(r'^#\s+(.+)$', re.M)
subtitle_re = re.compile(r'^\*\*Subtítulo:\*\*\s+(.+)$', re.M)

title_match = title_re.search(md_content)
subtitle_match = subtitle_re.search(md_content)

pilar_title = title_match.group(1).strip() if title_match else "Pilar 1"
pilar_subtitle = subtitle_match.group(1).strip() if subtitle_match else ""

modules = []
module_sections = re.split(r'^##\s+', md_content, flags=re.M)[1:]

for i, mod_sec in enumerate(module_sections):
    lines = mod_sec.strip().split('\n')
    mod_title = lines[0].strip()
    
    obj_match = re.search(r'^\*\*Objetivo:\*\*\s+(.+)$', mod_sec, re.M)
    mod_subtitle = obj_match.group(1).strip() if obj_match else ""
    
    mod_id = f"p1-m{i+1}"
    mod_status = "active" if i == 0 else "locked" 
    
    blocks = []
    
    block_sections = re.split(r'^\d+\.\s+\*\*TYPE:\s+([^*]+)\*\*', mod_sec, flags=re.M)[1:]
    
    for j in range(0, len(block_sections), 2):
        b_type = block_sections[j].strip()
        b_content_raw = block_sections[j+1]
        
        b_title_match = re.search(r'^\s*\*\*Título:\*\*\s+(.+)$', b_content_raw, re.M)
        b_title = b_title_match.group(1).strip() if b_title_match else None
        
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', b_content_raw, re.S)
        if json_match:
            json_str = json_match.group(1)
            b_content = f"JSON.stringify({json_str})"
        else:
            quote_lines = re.findall(r'^[ \t]*>[ \t]?(.*)$', b_content_raw, re.M)
            if quote_lines:
                text_content = "\n".join(quote_lines).strip()
            else:
                fallback_content = b_content_raw
                if b_title_match:
                    fallback_content = fallback_content.replace(b_title_match.group(0), '')
                text_content = fallback_content.strip()
            
            b_content = json.dumps(text_content, ensure_ascii=False)
        
        block = {
            "type": b_type,
            "title": b_title,
            "content_val": b_content
        }
        blocks.append(block)
        
    modules.append({
        "id": mod_id,
        "title": mod_title,
        "subtitle": mod_subtitle,
        "status": mod_status,
        "blocks": blocks
    })

ts_code = []
ts_code.append("export const PILAR_1_DATA: PillarData = {")
ts_code.append(f"    id: 1,")
ts_code.append(f"    title: {json.dumps(pilar_title, ensure_ascii=False)},")
ts_code.append(f"    subtitle: {json.dumps(pilar_subtitle, ensure_ascii=False)},")
ts_code.append("    modules: [")

for m in modules:
    ts_code.append("        {")
    ts_code.append(f"            id: {json.dumps(m['id'])},")
    ts_code.append(f"            title: {json.dumps(m['title'], ensure_ascii=False)},")
    ts_code.append(f"            subtitle: {json.dumps(m['subtitle'], ensure_ascii=False)},")
    ts_code.append(f"            status: {json.dumps(m['status'])},")
    ts_code.append("            blocks: [")
    
    for i, b in enumerate(m["blocks"]):
        ts_code.append("                {")
        ts_code.append(f"                    type: {json.dumps(b['type'])},")
        if b["title"]:
            ts_code.append(f"                    title: {json.dumps(b['title'], ensure_ascii=False)},")
        ts_code.append(f"                    content: {b['content_val']}")
        if i == len(m["blocks"]) - 1:
            ts_code.append("                }")
        else:
            ts_code.append("                },")
            
    if m == modules[-1]:
        ts_code.append("            ]")
        ts_code.append("        }")
    else:
        ts_code.append("            ]")
        ts_code.append("        },")

ts_code.append("    ]")
ts_code.append("};")

ts_output = '\n'.join(ts_code)

with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

start_idx = ts_content.find('export const PILAR_1_DATA: PillarData = {')
end_idx = ts_content.find('export const PILAR_2_DATA: PillarData = {')

last_brace = ts_content.rfind('};', start_idx, end_idx) + 2

if start_idx != -1 and last_brace != -1:
    new_ts_content = ts_content[:start_idx] + ts_output + ts_content[last_brace:]
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(new_ts_content)
    print("Success")
else:
    print("Could not find bounds")
