// The invitation QR encodes the same Browser link as Copy, including the
// optional viewer grant. It is built locally; the link never leaves the page.
import { useEffect, useId, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { downloadBlob } from "../../lib/download";
import { Btn } from "./primitives";
import { useAnchoredPopover } from "./use-anchored-popover";
import { useCopy } from "../../ui/copy";

function fileName(link: string): string {
  const code = new URL(link).pathname.split("/").filter(Boolean).pop()?.replace(/[^\w-]+/g, "");
  return `piik-invite${code ? `-${code}` : ""}.png`;
}

export function InviteQrCode({ link, disabled }: { link: string | null | undefined; disabled?: boolean }) {
  const { t, vis } = useCopy();
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const unavailable = Boolean(disabled) || !link;
  useAnchoredPopover(anchor, panel, { side: "below", align: "end" });

  useEffect(() => {
    if (unavailable && panel.current?.matches(":popover-open")) panel.current.hidePopover();
  }, [unavailable]);

  function download(): void {
    if (!link) return;
    canvas.current?.toBlob((blob) => {
      if (blob) downloadBlob(blob, fileName(link));
    }, "image/png");
  }

  return <span ref={anchor} className="lr-qr">
    <Btn
      icon="qr"
      title="host.invite.showQrcode"
      cap="host.invite.qrcode"
      disabled={unavailable}
      popoverTarget={id}
      expanded={open}
      controls={id}
    />
    <div
      ref={panel}
      id={id}
      popover="auto"
      role="dialog"
      aria-label={t("host.invite.showQrcode")}
      className="lr-anchored-card lr-qr-popover"
      onToggle={(event) => {
        if (event.target === event.currentTarget) setOpen(event.newState === "open");
      }}
    >
      {!unavailable && link ? <>
        <QRCodeSVG
          value={link}
          size={168}
          level="M"
          marginSize={2}
          bgColor="#fffefb"
          fgColor="#29374a"
          title={t("host.invite.qrcode")}
        />
        {vis ? null : <p>{t("host.invite.qrcodeHint")}</p>}
        {/* A print-sized copy stays offscreen; the visible code is for the screen. */}
        {open ? <QRCodeCanvas
          ref={canvas}
          className="lr-qr-canvas"
          value={link}
          size={1024}
          level="M"
          marginSize={2}
          bgColor="#fffefb"
          fgColor="#29374a"
        /> : null}
        <Btn
          icon="arrowDown"
          size="compact"
          title="host.invite.downloadQrcode"
          cap="host.invite.downloadQrcode"
          onClick={download}
        />
      </> : null}
    </div>
  </span>;
}
