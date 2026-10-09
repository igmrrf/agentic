# Repository Coding Standards (Kotlin 2.0+)

Always adhere to `CODING.md` and `docs/CODING_KOTLIN.md`:
- **Zero Explanatory Comments:** Write self-documenting code.
- **Target Kotlin 2.0+ (K2 Compiler):** Strict compiler checks and fast type inference.
- **Zero Force-Unwraps:** Absolute ban on `!!`. Use safe calls `?.`, Elvis operator `?:`, or smart casting.
- **Immutability by Default:** `val` on all properties; read-only collections (`List`, `Map`).
- **Sealed Interfaces:** Model domain states and results with `sealed interface` for exhaustive `when` matching.
- **Structured Concurrency:** Coroutines must run within a managed `CoroutineScope`. Zero `GlobalScope`.
- **Size Caps:** File <= 400 lines, Class <= 150 lines, Function <= 50 lines, Max 3 parameters.
