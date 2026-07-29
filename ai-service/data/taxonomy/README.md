# English Taxonomy Sources

The ATS loads taxonomy sources from `manifest.json`. Sources are merged by
numeric priority; higher-priority aliases win conflicts without deleting the
lower-priority concept.

Resolution priority:

1. `egyptian_overrides_en` (`100`)
2. `curated_tech` (`50`)
3. an optional official ESCO English export (`10`)
4. the small project-owned English fallback (`0`)
5. unknown NER terms remain dynamic raw skills

## Install an official ESCO English export

ESCO downloads require accepting the European Commission privacy statement and
receiving a download link. Download the English CSV package from:

https://esco.ec.europa.eu/en/use-esco/download

Then import either the extracted package directory or its `skills_en.csv` file:

```powershell
.\.venv\Scripts\python.exe scripts\import_esco_taxonomy.py C:\path\to\esco-package
```

The command writes `generated/esco_en.json`. The file is optional: startup and
ATS scoring continue normally when it is absent.

Do not add a file attributed to LinkedIn unless its provenance and reuse licence
are documented. A filename alone is not evidence that the dataset is authorised.
