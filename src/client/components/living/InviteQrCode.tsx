// The invitation QR encodes the same Browser link as Copy, including the
// optional viewer grant. It is built locally; the link never leaves the page.
import { useEffect, useId, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Btn } from "./primitives";
import { useAnchoredPopover } from "./use-anchored-popover";
import { useCopy } from "../../ui/copy";

export function InviteQrCode({ link, disabled }: { link: string | null | undefined; disabled?: boolean }) {
  const { t, vis } = useCopy();
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const unavailable = Boolean(disabled) || !link;
  useAnchoredPopover(anchor, panel, { side: "below", align: "end" });

  useEffect(() => {
    if (unavailable && panel.current?.matches(":popover-open")) panel.current.hidePopover();
  }, [unavailable]);

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
      {!unavailable && link ? <QRCodeSVG
        value={link}
        size={168}
        level="M"
        marginSize={2}
        bgColor="#fffefb"
        fgColor="#29374a"
        title={t("host.invite.qrcode")}
      /> : null}
      {vis ? null : <p>{t("host.invite.qrcodeHint")}</p>}
    </div>
  </span>;
}
