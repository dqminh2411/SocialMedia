# Instruction: Sanitize Text Input to Prevent XSS

Goal
- Store only safe text by removing malicious HTML/CSS/JS before persisting or re‑rendering.
- Provide a second layer of defense. React already escapes characters at render time; backend sanitization protects storage and downstream consumers.

When to apply
- Before saving any user‑provided text (posts, comments, bios, messages, etc.).
- Before updating existing records with user input.

How to implement (Java backend)
- Use the Jsoup library to clean input with an allowlist (org.jsoup.safety.Safelist).
- Reject or strip anything not explicitly allowed by the chosen Safelist.

Example (Jsoup with Safelist)
```java
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist; // org.jsoup.safety.Safelist

public class SanitizeUtilExample {
    // Adjust the safelist to your needs. Basic() allows common formatting tags.
    private static final Safelist SAFE = Safelist.basic() // <b>, <i>, <u>, <a>, etc.
        .addProtocols("a", "href", "http", "https")   // Allow only http/https links
        .addProtocols("img", "src", "http", "https"); // If images are allowed

    public static String sanitize(String userInput) {
        if (userInput == null) return null;
        // Clean removes disallowed tags/attributes, neutralizing scripts
        return Jsoup.clean(userInput, SAFE);
    }
}
```

Block the following (must be removed if present)
- `<script>…</script>`
- JS event attributes on any element: `onclick`, `onerror`, `onload`, etc.
- `javascript:` protocol in `href`/`src`
- `<iframe>`
- CSS that can execute scripts, e.g., `background: url('javascript:…')`
- Anything not explicitly allowed by `org.jsoup.safety.Safelist`

Allow
- href and src that use http or https only (no javascript:, data: unless explicitly audited and allowed).

Checklist (apply in code paths handling user content)
- [ ] Sanitize on create and update API endpoints.
- [ ] Never trust client‑side escape alone; always sanitize on the server before storing.
- [ ] Keep the chosen Safelist minimal; expand only for necessary features.
- [ ] Add unit tests covering typical payloads and known XSS vectors.

Notes
- This document describes the backend layer. The frontend (React) escaping is complementary, not a replacement.
- Review logs and bug reports to refine the Safelist over time.



