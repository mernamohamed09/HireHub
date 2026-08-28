"""Convert an official ESCO English CSV export into the ATS source format."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
import re
from typing import Iterable


DEFAULT_OUTPUT = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "taxonomy"
    / "generated"
    / "esco_en.json"
)


def _find_skills_csv(source: Path) -> Path:
    if source.is_file():
        return source
    candidates = sorted(
        path
        for path in source.rglob("*.csv")
        if re.search(r"(?:^|[_-])skills?(?:[_-]|$)", path.stem, re.IGNORECASE)
    )
    if not candidates:
        raise FileNotFoundError(
            "No skills CSV was found. Pass the extracted ESCO package or skills_en.csv."
        )
    return candidates[0]


def _column(fieldnames: Iterable[str], *names: str) -> str:
    normalized = {
        re.sub(r"[^a-z0-9]", "", name.casefold()): name
        for name in fieldnames
    }
    for candidate in names:
        key = re.sub(r"[^a-z0-9]", "", candidate.casefold())
        if key in normalized:
            return normalized[key]
    raise ValueError(f"Required ESCO column is missing; tried: {', '.join(names)}")


def _split_aliases(value: str) -> list[str]:
    if not value:
        return []
    return [
        item.strip()
        for item in re.split(r"\r?\n|\s*\|\s*", value)
        if item.strip()
    ]


def convert(source: Path, output: Path, version: str) -> int:
    csv_path = _find_skills_csv(source)
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        sample = handle.read(8192)
        handle.seek(0)
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        reader = csv.DictReader(handle, dialect=dialect)
        if not reader.fieldnames:
            raise ValueError("ESCO CSV has no header.")

        preferred_column = _column(
            reader.fieldnames, "preferredLabel", "preferred label"
        )
        uri_column = _column(
            reader.fieldnames, "conceptUri", "concept URI", "conceptUri"
        )
        try:
            aliases_column = _column(
                reader.fieldnames,
                "altLabels",
                "alternativeLabels",
                "alternative labels",
            )
        except ValueError:
            aliases_column = ""

        entries = []
        for row in reader:
            preferred = (row.get(preferred_column) or "").strip()
            uri = (row.get(uri_column) or "").strip()
            if not preferred or not uri:
                continue
            aliases = _split_aliases(row.get(aliases_column, ""))
            entries.append(
                {
                    "id": uri,
                    "canonical": preferred.casefold(),
                    "preferred": preferred,
                    "aliases": aliases,
                }
            )

    payload = {
        "metadata": {
            "name": "esco_en",
            "version": version,
            "language": "en",
            "license": "European Commission ESCO reuse terms",
            "source_url": "https://esco.ec.europa.eu/en/use-esco/download",
            "generated_from": csv_path.name,
        },
        "entries": entries,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(".tmp")
    temporary.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temporary.replace(output)
    return len(entries)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--version", default="1.2.1")
    args = parser.parse_args()
    count = convert(args.source, args.output, args.version)
    print(f"Imported {count} ESCO skills into {args.output}")


if __name__ == "__main__":
    main()
