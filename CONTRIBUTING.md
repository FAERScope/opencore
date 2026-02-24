# Contributing to @faerscope/opencore

Thank you for your interest in contributing to FAERScope's open-core analytics library. This document provides guidelines and information for contributors.

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community

---

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub with:

- A clear, descriptive title
- Steps to reproduce the behavior
- Expected behavior vs. actual behavior
- Your environment (Node version, browser, OS)
- Any relevant error messages or logs

### Suggesting Enhancements

We welcome feature requests. Please open an issue with:

- A clear description of the proposed feature
- The use case it addresses
- Any relevant references (papers, existing implementations)

### Pull Requests

1. **Fork** the repository and create your branch from `main`.
2. **Install dependencies:** `pnpm install`
3. **Make your changes** in the `src/` directory.
4. **Add or update tests** in `__tests__/` for any new functionality.
5. **Run the test suite:** `pnpm test`
6. **Run the type checker:** `pnpm typecheck`
7. **Build** to verify: `pnpm build`
8. **Submit your PR** with a clear description of the changes.

---

## Development Setup

```bash
# Clone the repo
git clone https://github.com/FAERScope/opencore.git
cd opencore

# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type-check without emitting
pnpm typecheck

# Watch mode for development
pnpm dev
```

---

## Project Structure

```
src/
  index.ts              # Barrel export (public API surface)
  types.ts              # TypeScript type definitions
  disproportionality.ts # PRR, ROR, IC, BH-FDR, time-series stats
  openfda.ts            # openFDA API client
  soc-mapping.ts        # MedDRA PT-to-SOC mapping
  manifest.ts           # SHA-256 hashing and Study ID generation
  utils.ts              # Title-casing, label helpers, formatting
```

---

## Contribution Areas

We especially welcome contributions in these areas:

### Expanding the SOC Mapping

The current `soc-mapping.ts` covers ~250 commonly reported MedDRA Preferred Terms. Help is needed to:

- Add additional PTs from publicly available MedDRA documentation
- Verify existing mappings against authoritative sources
- Handle PTs that map to multiple SOCs (currently we assign the primary)

### Unit Tests

The `disproportionality.ts` module contains critical statistical functions that need comprehensive test coverage, including:

- Edge cases: zero cells, very small counts, very large counts
- Known-answer tests against published pharmacovigilance examples
- Numerical stability tests (underflow, overflow)
- BH-FDR procedure correctness with various p-value distributions

### Documentation

- Tutorials and worked examples
- Mathematical derivations and explanations
- Integration guides for different frameworks
- Translations

### Performance

- Benchmarks across Node.js, Bun, Deno, and browser environments
- Optimization of the BH-FDR sort for very large reaction sets
- Web Worker integration examples

---

## Coding Standards

- **TypeScript** with strict mode enabled
- **Pure functions** preferred — no side effects in statistical modules
- **JSDoc comments** on all public exports with `@param`, `@returns`, and `@example` tags
- **No runtime dependencies** — this is a zero-dependency package
- **Academic references** for all statistical methods (use `@see` in JSDoc)

---

## Commit Messages

We follow conventional commits:

```
feat: add EBGM (Empirical Bayes Geometric Mean) computation
fix: handle zero-cell edge case in computeROR
docs: add worked example for BH-FDR pipeline
test: add edge case tests for chi2PValue1df
refactor: extract normalCDF into shared math utilities
```

---

## Licensing

By contributing to this project, you agree that your contributions will be licensed under the [Apache-2.0 License](LICENSE).

All new files must include the standard header comment:

```typescript
// ─── @faerscope/opencore — [Module Name] ──────────────────────────────────────
// [Brief description]
```

---

## Questions?

If you have questions about contributing, please open a discussion on GitHub or reach out to the maintainers.
