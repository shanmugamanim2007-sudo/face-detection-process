<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Heavy CV (OpenCV, DeepFace, FaceNet) lives in backend/ (FastAPI, run locally); frontend calls it via a user-configurable URL — Python cannot run in the Worker runtime.
- Template matching also has a pure-TS NCC implementation in src/lib so one module works without the backend.
