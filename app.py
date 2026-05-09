#!/usr/bin/env python3
"""
ConCalc: Construction Material Calculator with local code lookup and community knowledge sharing.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

DATA_DIR = Path(__file__).parent / "data"
CODE_FILE = DATA_DIR / "building_codes.json"
COMMUNITY_FILE = DATA_DIR / "community_posts.json"


@dataclass
class MaterialResult:
    name: str
    quantity: float
    unit: str


class MaterialCalculator:
    """Core construction material calculators."""

    @staticmethod
    def concrete_slab(length_ft: float, width_ft: float, thickness_in: float, waste_pct: float = 10.0) -> MaterialResult:
        volume_ft3 = length_ft * width_ft * (thickness_in / 12)
        volume_yd3 = volume_ft3 / 27
        total = volume_yd3 * (1 + waste_pct / 100)
        return MaterialResult("Concrete", round(total, 2), "cubic yards")

    @staticmethod
    def drywall(room_length_ft: float, room_width_ft: float, wall_height_ft: float, sheet_w_ft: float = 4.0, sheet_h_ft: float = 8.0, waste_pct: float = 12.0) -> MaterialResult:
        wall_area = 2 * (room_length_ft + room_width_ft) * wall_height_ft
        sheet_area = sheet_w_ft * sheet_h_ft
        sheets = wall_area / sheet_area
        total = sheets * (1 + waste_pct / 100)
        return MaterialResult("Drywall", round(total + 0.5), "sheets")

    @staticmethod
    def flooring(length_ft: float, width_ft: float, waste_pct: float = 8.0) -> MaterialResult:
        area = length_ft * width_ft
        total = area * (1 + waste_pct / 100)
        return MaterialResult("Flooring", round(total, 2), "square feet")

    @staticmethod
    def framing_studs(wall_length_ft: float, wall_height_ft: float, spacing_in: float = 16.0, include_plates: bool = True) -> List[MaterialResult]:
        stud_count = int((wall_length_ft * 12) / spacing_in) + 1
        studs = stud_count + 2
        results = [MaterialResult("Studs", studs, f"pieces @ {int(wall_height_ft)}ft")]
        if include_plates:
            plate_length = wall_length_ft * 3
            results.append(MaterialResult("Top/Bottom plates", round(plate_length, 1), "linear feet"))
        return results


class CodeLookup:
    def __init__(self, file_path: Path = CODE_FILE):
        self.file_path = file_path
        self.codes = self._load_json(file_path)

    @staticmethod
    def _load_json(path: Path) -> Dict:
        if not path.exists():
            return {}
        return json.loads(path.read_text())

    def search(self, state: str, topic: str) -> Dict:
        state_key = state.strip().upper()
        topic_key = topic.strip().lower()
        state_codes = self.codes.get(state_key)
        if not state_codes:
            return {"error": f"No local code data for state '{state_key}'."}
        details = state_codes.get(topic_key)
        if not details:
            return {"error": f"No topic '{topic_key}' found for state '{state_key}'."}
        return {"state": state_key, "topic": topic_key, "details": details}


class CommunityBoard:
    def __init__(self, file_path: Path = COMMUNITY_FILE):
        self.file_path = file_path
        self.posts = self._load_posts()

    def _load_posts(self) -> List[Dict]:
        if not self.file_path.exists():
            return []
        return json.loads(self.file_path.read_text())

    def _save_posts(self) -> None:
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self.file_path.write_text(json.dumps(self.posts, indent=2))

    def add_post(self, author: str, role: str, title: str, content: str, tags: List[str]) -> Dict:
        post = {
            "id": len(self.posts) + 1,
            "author": author,
            "role": role,
            "title": title,
            "content": content,
            "tags": tags,
        }
        self.posts.append(post)
        self._save_posts()
        return post

    def search_posts(self, keyword: str = "") -> List[Dict]:
        if not keyword:
            return self.posts
        k = keyword.lower()
        return [p for p in self.posts if k in p["title"].lower() or k in p["content"].lower() or any(k in t.lower() for t in p["tags"])]


def print_menu() -> None:
    print("\n=== ConCalc Platform ===")
    print("1) Material calculators")
    print("2) Local building code lookup")
    print("3) Community forum")
    print("0) Exit")


def calculators_menu() -> None:
    calc = MaterialCalculator()
    print("\n-- Material Calculators --")
    print("a) Concrete slab")
    print("b) Drywall")
    print("c) Flooring")
    print("d) Framing studs")
    choice = input("Choose calculator: ").strip().lower()

    if choice == "a":
        l = float(input("Length (ft): "))
        w = float(input("Width (ft): "))
        t = float(input("Thickness (in): "))
        r = calc.concrete_slab(l, w, t)
        print(f"Required {r.name}: {r.quantity} {r.unit}")
    elif choice == "b":
        l = float(input("Room length (ft): "))
        w = float(input("Room width (ft): "))
        h = float(input("Wall height (ft): "))
        r = calc.drywall(l, w, h)
        print(f"Required {r.name}: {r.quantity} {r.unit}")
    elif choice == "c":
        l = float(input("Length (ft): "))
        w = float(input("Width (ft): "))
        r = calc.flooring(l, w)
        print(f"Required {r.name}: {r.quantity} {r.unit}")
    elif choice == "d":
        l = float(input("Wall length (ft): "))
        h = float(input("Wall height (ft): "))
        rs = calc.framing_studs(l, h)
        for r in rs:
            print(f"{r.name}: {r.quantity} {r.unit}")


def code_lookup_menu() -> None:
    lookup = CodeLookup()
    state = input("State abbreviation (example CA): ")
    topic = input("Topic (eg electrical, egress, deck): ")
    result = lookup.search(state, topic)
    if "error" in result:
        print(result["error"])
    else:
        print(f"\n{result['state']} - {result['topic']}")
        for k, v in result["details"].items():
            print(f"- {k}: {v}")


def community_menu() -> None:
    board = CommunityBoard()
    print("\n-- Community Forum --")
    print("a) Add post")
    print("b) Search posts")
    choice = input("Choose action: ").strip().lower()
    if choice == "a":
        author = input("Author: ")
        role = input("Role (DIY, Contractor, Engineer, Inspector, etc): ")
        title = input("Title: ")
        content = input("Content: ")
        tags = [t.strip() for t in input("Tags (comma separated): ").split(",") if t.strip()]
        post = board.add_post(author, role, title, content, tags)
        print(f"Saved post #{post['id']}")
    elif choice == "b":
        k = input("Keyword (blank for all): ")
        posts = board.search_posts(k)
        print(f"\nFound {len(posts)} post(s)")
        for p in posts:
            print(f"[{p['id']}] {p['title']} ({p['role']} - {p['author']})")
            print(f"Tags: {', '.join(p['tags'])}")
            print(p["content"])
            print("-" * 30)


def main() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    while True:
        print_menu()
        choice = input("Select an option: ").strip()
        if choice == "1":
            calculators_menu()
        elif choice == "2":
            code_lookup_menu()
        elif choice == "3":
            community_menu()
        elif choice == "0":
            print("Goodbye")
            break


if __name__ == "__main__":
    main()
