import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { InviteQrCode } from "../src/client/components/living/InviteQrCode";
import { locales } from "../src/client/locales";
import { setCopy } from "../src/client/ui/copy";

const invite = "https://piik.example/r/9527#v=grant";
const render = (link: string | null, disabled?: boolean) =>
  renderToStaticMarkup(createElement(InviteQrCode, { link, disabled }));

describe("invitation QR code", () => {
  afterEach(() => setCopy({ lang: "zh", vis: false }));

  it("shows a scannable code for the same link Copy yields", () => {
    setCopy({ lang: "zh", vis: false });
    const html = render(invite);
    expect(html).toContain('class="lr-qr"');
    // React writes this camelCase attribute; HTML parses it case-insensitively.
    const target = html.match(/popovertarget="([^"]+)"/i)?.[1];
    expect(target).toBeTruthy();
    expect(html).toContain(`id="${target}"`);
    expect(html).toContain('popover="auto"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain(locales.zh.copy["host.invite.showQrcode"]);
    expect(html).toContain(locales.zh.copy["host.invite.qrcodeHint"]);
    expect(html).toContain(locales.zh.copy["host.invite.downloadQrcode"]);
  });

  it("encodes the link, so a different invitation produces a different code", () => {
    const code = (html: string) => html.match(/fill="#29374a" d="([^"]+)"/)?.[1];
    expect(code(render(invite))).toBeTruthy();
    expect(code(render(invite))).not.toBe(code(render("https://piik.example/r/9527")));
  });

  it("has no code when the link is missing or the invitation is unavailable", () => {
    for (const html of [render(null), render(invite, true)]) {
      expect(html).not.toContain('fill="#29374a"');
      expect(html).toContain("disabled");
    }
  });

  it("keeps the caption out of visual mode", () => {
    setCopy({ lang: "zh", vis: true });
    expect(render(invite)).not.toContain(locales.zh.copy["host.invite.qrcodeHint"]);
  });
});
