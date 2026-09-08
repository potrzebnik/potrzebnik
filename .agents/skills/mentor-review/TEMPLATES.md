# Templates — disclosed reference for mentor-review

## Teaching card

For each finding, in numbered order:

````
─────────────────────────────────────────────
[<severity>] #<n> — <title>   (principle: <principle>)
File: <file>:<lines>

Concept:  <one-line restatement of the principle>
Why:      <rationale>
Impact:   <impact>

Code:
```<lang>
<code_snippet>
```

Fix:
```<lang>
<fix_proposal>
```

References: <comma-joined references>
````

- `Concept:` — one plain-English sentence. If the agent didn't supply one, derive it from the principle slug (e.g. `a11y-external-rel` → "External links opened in a new tab need `rel=\"noopener noreferrer\"` for safety.").
- Omit `References:` if `references` is empty. Omit the `Fix:` block if `fix_proposal` is empty.
- If `code_snippet` is a `(snippet unavailable: …)` sentinel, render it as an italic line instead of a fenced block.

`<lang>` by extension: `.ts`/`.tsx` → `ts`, `.js`/`.jsx`/`.mjs`/`.cjs` → `js`, `.css` → `css`, `.md` → `markdown`, `.json` → `json`, `.yml`/`.yaml` → `yaml`, `.sh` → `bash`, anything else → `text`.

## Fix walk

For each finding 1..N, in order:

1. Render its teaching card (above).
2. `AskUserQuestion`, header `Finding <n>/<N>`, options:
   - **Accept** — "Apply the fix. A Sonnet sub-agent will edit the file."
   - **Reject** — "Skip this finding. Move on."
3. On **Accept**: spawn `Agent` (`subagent_type: "general-purpose"`, `model: "sonnet"`, foreground) with:

   ```
   Apply this single fix. Do not make unrelated changes.

   File: <file>
   Lines: <lines>
   Issue: <title> (principle: <principle>)

   Current code at those lines:
   ```

   <code_snippet>

   ```

   Required fix:
   ```

   <fix_proposal>

   ```

   Steps:
   1. Read <file> to confirm the current state.
   2. Apply the fix using Edit. Match indentation exactly.
   3. Do not touch anything outside the targeted lines and their immediate surroundings.
   4. Return a one-line confirmation: "fixed <file>" or "failed: <reason>".
   ```

   Wait for it to return, then run `git diff -- <file>` and print it under `Applied:`. Increment `accepted`.

4. On **Reject**: increment `rejected`, move on silently.
5. After each decision, print `Progress: <i>/<N> · accepted <accepted>, rejected <rejected>`.

After the loop:

```
mentor-review complete.
Accepted: <accepted> Rejected: <rejected>

Review the staged/unstaged changes (`git diff`) and commit when ready.
```
