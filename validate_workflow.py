#!/usr/bin/env python3
import yaml
import sys

try:
    with open('.github/workflows/deploy.yml', 'r', encoding='utf-8') as f:
        content = yaml.safe_load(f)
    print("✓ YAML 语法检查通过")
    print("\n工作流信息:")
    print(f"  - 名称: {content.get('name', 'N/A')}")
    print(f"  - 触发事件: {list(content.get('on', {}).keys())}")
    jobs = content.get('jobs', {})
    print(f"  - 作业数: {len(jobs)}")
    for job_name in jobs:
        steps = jobs[job_name].get('steps', [])
        print(f"    - '{job_name}': {len(steps)} steps")
        for i, step in enumerate(steps, 1):
            step_name = step.get('name', 'Unnamed')
            print(f"      [{i}] {step_name}")
except yaml.YAMLError as e:
    print(f"✗ YAML 语法错误:\n{e}")
    sys.exit(1)
except FileNotFoundError:
    print("✗ 文件未找到")
    sys.exit(1)
except Exception as e:
    print(f"✗ 错误: {e}")
    sys.exit(1)
