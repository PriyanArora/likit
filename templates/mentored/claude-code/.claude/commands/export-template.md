Export this project's plan as a reusable template.

Tell the user to run `npx likit export-template` from the project root. It reads `_fill_manifest.md` and `BuildFlow.md` (both must be filled — G0 complete) and writes `project.likit.json`, which they can commit and reuse on a new project with `npx likit import-template`. If G0 is not complete, explain that the manifest and BuildFlow must be filled first.
