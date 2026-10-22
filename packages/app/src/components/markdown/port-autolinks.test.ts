import { describe, expect, it } from "vitest";
import { autolinkUrlsWithPort } from "./port-autolinks";

describe("autolinkUrlsWithPort", () => {
  it("links the whole URL and leaves the sentence's full stop outside", () => {
    expect(
      autolinkUrlsWithPort("directly at http://127.0.0.1:8765/mock/m12/index.html. It's for..."),
    ).toBe("directly at <http://127.0.0.1:8765/mock/m12/index.html>. It's for...");
  });

  it("keeps query and fragment inside the link", () => {
    expect(autolinkUrlsWithPort("open http://localhost:3000/a?b=1&c=2#top now")).toBe(
      "open <http://localhost:3000/a?b=1&c=2#top> now",
    );
  });

  it.each([
    ["see http://h.io:80/x, then", "see <http://h.io:80/x>, then"],
    ["(see http://h.io:80/x)", "(see <http://h.io:80/x>)"],
    ["http://h.io:80/f_(a) ok", "<http://h.io:80/f_(a)> ok"],
    ["is it http://h.io:80?", "is it <http://h.io:80>?"],
    ["https://127.0.0.1:8443", "<https://127.0.0.1:8443>"],
  ])("trims trailing punctuation: %s", (source, expected) => {
    expect(autolinkUrlsWithPort(source)).toBe(expected);
  });

  it("links every URL in the text", () => {
    expect(autolinkUrlsWithPort("http://a.b:1/x and http://c.d:2/y")).toBe(
      "<http://a.b:1/x> and <http://c.d:2/y>",
    );
  });

  it.each([
    "run `curl http://127.0.0.1:8765/x` now",
    "```sh\ncurl http://127.0.0.1:8765/x\n```",
    "[the page](http://127.0.0.1:8765/x)",
    "[http://127.0.0.1:8765/x](http://example.com)",
    "<http://127.0.0.1:8765/x>",
    "<p>http://127.0.0.1:8765/x</p>",
    "[ref]: http://127.0.0.1:8765/x",
    "http://example.com/x and http://127.0.0.1/y",
    "no url here",
    "",
  ])("leaves %j unchanged", (source) => {
    expect(autolinkUrlsWithPort(source)).toBe(source);
  });
});
