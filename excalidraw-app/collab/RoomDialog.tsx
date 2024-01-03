import { useRef, useState, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";

import { copyTextToSystemClipboard } from "../../packages/excalidraw/clipboard";
import { trackEvent } from "../../packages/excalidraw/analytics";
import { getFrame } from "../../packages/excalidraw/utils";
import { useI18n } from "../../packages/excalidraw/i18n";
import { KEYS } from "../../packages/excalidraw/keys";

import { Dialog } from "../../packages/excalidraw/components/Dialog";
import {
  copyIcon,
  playerPlayIcon,
  playerStopFilledIcon,
  share,
  shareIOS,
  shareWindows,
  tablerCheckIcon,
} from "../../packages/excalidraw/components/icons";
import { TextField } from "../../packages/excalidraw/components/TextField";
import { FilledButton } from "../../packages/excalidraw/components/FilledButton";

import { ReactComponent as CollabImage } from "../../packages/excalidraw/assets/lock-kits.svg";
import "./RoomDialog.scss";
import QRCodeStyling, { FileExtension } from "qr-code-styling";

const getShareIcon = () => {
  const navigator = window.navigator as any;
  const isAppleBrowser = /Apple/.test(navigator.vendor);
  const isWindowsBrowser = navigator.appVersion.indexOf("Win") !== -1;

  if (isAppleBrowser) {
    return shareIOS;
  } else if (isWindowsBrowser) {
    return shareWindows;
  }

  return share;
};

export type RoomModalProps = {
  handleClose: () => void;
  activeRoomLink: string;
  username: string;
  onUsernameChange: (username: string) => void;
  onRoomCreate: () => void;
  onRoomDestroy: () => void;
  setErrorMessage: (message: string) => void;
};

const qrCode = new QRCodeStyling({
  width: 200,
  height: 200,
  type: 'svg',
  image: "",
  dotsOptions: {
    color: '#000000',
    type: "dots",
  },
  cornersSquareOptions: {
    type: 'square'
  },
  cornersDotOptions: {
    type: 'dot'
  },
  backgroundOptions: {
    color: "#fff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 20,
  }
});

export const RoomModal = ({
  activeRoomLink,
  onRoomCreate,
  onRoomDestroy,
  setErrorMessage,
  username,
  onUsernameChange,
  handleClose,
}: RoomModalProps) => {
  const { t } = useI18n();
  const [justCopied, setJustCopied] = useState(false);
  const timerRef = useRef<number>(0);
  const ref = useRef<HTMLInputElement>(null);
  const isShareSupported = "share" in navigator;

  const qrRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
        qrCode.append(node);
        qrCode.update({ data: ref?.current?.value });
    }
  }, []);

  const onQRDownloadClick = (extension: FileExtension) => {
    qrCode.download({
      extension
    });
  };

  const copyRoomLink = async () => {
    try {
      await copyTextToSystemClipboard(activeRoomLink);

      setJustCopied(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setJustCopied(false);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    }

    ref.current?.select();
  };

  const shareRoomLink = async () => {
    try {
      await navigator.share({
        title: t("roomDialog.shareTitle"),
        text: t("roomDialog.shareTitle"),
        url: activeRoomLink,
      });
    } catch (error: any) {
      // Just ignore.
    }
  };

  if (activeRoomLink) {
    return (
      <>
        <h3 className="RoomDialog__active__header">
          {t("labels.liveCollaboration")}
        </h3>
        <TextField
          value={username}
          placeholder="Your name"
          label="Your name"
          onChange={onUsernameChange}
          onKeyDown={(event) => event.key === KEYS.ENTER && handleClose()}
        />
        <div className="RoomDialog__active__linkRow">
          <TextField
            ref={ref}
            label="Link"
            readonly
            fullWidth
            value={activeRoomLink}
          />
          {isShareSupported && (
            <FilledButton
              size="large"
              variant="icon"
              label="Share"
              startIcon={getShareIcon()}
              className="RoomDialog__active__share"
              onClick={shareRoomLink}
            />
          )}
          <Popover.Root open={justCopied}>
            <Popover.Trigger asChild>
              <FilledButton
                size="large"
                label="Copy link"
                startIcon={copyIcon}
                onClick={copyRoomLink}
              />
            </Popover.Trigger>
            <Popover.Content
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => event.preventDefault()}
              className="RoomDialog__popover"
              side="top"
              align="end"
              sideOffset={5.5}
            >
              {tablerCheckIcon} copied
            </Popover.Content>
          </Popover.Root>
        </div>
        <div>
          <div className="RoomDialog__qrContainer" ref={qrRef} />
          <div className="RoomDialog__qrDownloadContainer">
            <FilledButton variant="outlined" size="large" onClick={() => onQRDownloadClick('png')} label={t("roomDialog.button_downloadPNG")}/>
            <FilledButton variant="outlined" size="large" onClick={() => onQRDownloadClick('svg')} label={t("roomDialog.button_downloadSVG")}/>
          </div>
        </div>
        <div className="RoomDialog__active__description">
          <p>
            <span
              role="img"
              aria-hidden="true"
              className="RoomDialog__active__description__emoji"
            >
              🔒{" "}
            </span>
            {t("roomDialog.desc_privacy")}
          </p>
          <p>{t("roomDialog.desc_exitSession")}</p>
        </div>

        <div className="RoomDialog__active__actions">
          <FilledButton
            size="large"
            variant="outlined"
            color="danger"
            label={t("roomDialog.button_stopSession")}
            startIcon={playerStopFilledIcon}
            onClick={() => {
              trackEvent("share", "room closed");
              onRoomDestroy();
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="RoomDialog__inactive__illustration">
        <CollabImage />
      </div>
      <div className="RoomDialog__inactive__header">
        {t("labels.liveCollaboration")}
      </div>

      <div className="RoomDialog__inactive__description">
        <strong>{t("roomDialog.desc_intro")}</strong>
        {t("roomDialog.desc_privacy")}
      </div>

      <div className="RoomDialog__inactive__start_session">
        <FilledButton
          size="large"
          label={t("roomDialog.button_startSession")}
          startIcon={playerPlayIcon}
          onClick={() => {
            trackEvent("share", "room creation", `ui (${getFrame()})`);
            onRoomCreate();
          }}
        />
      </div>
    </>
  );
};

const RoomDialog = (props: RoomModalProps) => {
  return (
    <Dialog size="small" onCloseRequest={props.handleClose} title={false}>
      <div className="RoomDialog">
        <RoomModal {...props} />
      </div>
    </Dialog>
  );
};

export default RoomDialog;
